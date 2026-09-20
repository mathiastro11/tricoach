import {
  applyTargetRaceWeekSpecialStates,
  validateTargetRaceWeekSpecialStates,
} from "@/lib/target-race-week";

import {
  createOpenAIClient,
} from "@/lib/openai-server";

import {
  NextResponse,
} from "next/server";

import type {
  TrainingPlan,
} from "@/types/training";

import {
  prepareCoachPlanForReturn,
  validateCoachCanonicalChanges,
  validateCoachPlanAvailability,
} from "@/lib/coach-plan-safety";


const openai =
  createOpenAIClient();


export async function POST(
  request: Request
) {
  try {

    const body =
      await request.json();


    const {
      athlete,
      previousRace,
      nextRace,
      currentPlan,
      currentWeekAnalysis,
      coachingSignals,

      trainingAvailability = [],
    } = body;


    if (
      !athlete ||
      !nextRace ||
      !currentPlan ||
      !currentWeekAnalysis
    ) {
      return NextResponse.json(
        {
          error:
            "Missing goal-change context",
        },
        {
          status: 400,
        }
      );
    }


    if (
      !currentWeekAnalysis
        .shouldReview
    ) {
      return NextResponse.json({
        plan:
          currentPlan,

        changed:
          false,

        reason:
          "Current week does not require adaptation.",
      });
    }


    const response =
      await openai.responses.create({
        model:
          "gpt-5.6-luna",

        instructions: `
You are TriCoach's conservative current-week adaptation engine.

The athlete has changed target race during an active training week.

Your job is NOT to regenerate the entire week.

Only adapt future primary planned sessions when a meaningful race-goal change makes that useful.

ABSOLUTE RULES:

1. Never change completed training.
2. Never change sessions with protected session IDs.
3. Never change sessions on protected dates.
4. Never delete, rewrite or replace athlete-owned additionalSessions.
5. Never change training history.
6. Never increase weekly load aggressively because the target race became harder.
7. Readiness, recovery, injury concerns and deterministic coaching guardrails override race specificity.
8. Preserve as much of the existing week as possible.
9. A race-goal change should mainly influence PURPOSE and CONTENT of future sessions, not suddenly add large volume.
10. If no change is genuinely useful, return the existing plan unchanged.

CLOSE-RACE RULE:
If coachingSignals.raceProximity.closeToRace is true, the race is 28 days or less away.

In that situation:
- Treat the athlete as being in Peak/Taper territory.
- Explicitly review every future, unprotected session this week.
- Align remaining training with the NEW target race and exact race date.
- Remove unnecessary fatigue that would compromise race readiness.
- Preserve useful race-specific intensity where appropriate.
- Do not add catch-up volume.
- Do not increase load aggressively.
- Completed, past and manually added sessions remain protected.
- If the existing future sessions are not already appropriate for the new race and proximity, return a concretely adapted plan.

Examples:
- Olympic → Ironman may make a remaining endurance ride slightly more durability-oriented, but should not suddenly double its length.
- Flat Ironman → Norseman may make an upcoming bike session more climbing-specific if appropriate.
- Sprint → Ironman should not turn the remainder of this week into long-course overload.
- A manual athlete-added session must remain exactly as supplied.

PREVIOUS TARGET:
${JSON.stringify(
  previousRace,
  null,
  2
)}

NEW TARGET:
${JSON.stringify(
  nextRace,
  null,
  2
)}

ATHLETE:
${JSON.stringify(
  athlete,
  null,
  2
)}

CURRENT PLAN:
${JSON.stringify(
  currentPlan,
  null,
  2
)}

LOCKED / PROTECTED CURRENT-WEEK CONTEXT:
${JSON.stringify(
  currentWeekAnalysis,
  null,
  2
)}

COACHING GUARDRAILS:
${JSON.stringify(
  coachingSignals ??
    null,
  null,
  2
)}

Return JSON only.

Schema:

{
  "changed": boolean,
  "reason": string,
  "plan": {
    "summary": string,
    "totalHours": number,
    "focus": string,
    "weekNumber": number | null,
    "weekStart": string | null,
    "days": [],
    "additionalSessions": []
  }
}

IMPORTANT:
Athlete-owned additionalSessions must be preserved exactly.
Coach-owned additionalSessions may be adapted when the race-goal change genuinely justifies it.
Sessions without sessionSource are legacy athlete-owned sessions and must be preserved.

CANONICAL WORKOUT STRUCTURE — HARD CONTRACT:

- Preserve every unchanged workout exactly, including its current
  workoutStructure and strengthStructure.

- An unchanged legacy workout may remain legacy. Do NOT rewrite
  an otherwise unchanged workout merely to migrate its structure.

- If you MODIFY a Swim, Bike or Run workout:
  workoutStructure must become the complete executable source of truth.
  strengthStructure must be null.

- If you MODIFY a Strength workout:
  workoutStructure must be [].
  strengthStructure must contain the complete exercise prescription.

- If you MODIFY a Rest day:
  durationMinutes must be 0,
  workoutStructure must be [],
  strengthStructure must be null.

- Every modified endurance workoutStructure block must include:
  sport, kind, phase, label, repeatCount,
  workDurationSeconds or workDistanceMeters where appropriate,
  workIntensity, workInstruction,
  and explicit recovery fields.

- Use kind "segment" for normal continuous work.
- Use kind "repeat" for repeated work.
- Normal segment repeatCount must be 1.
- Repeat blocks must have repeatCount greater than 1.
- Repeated work requiring recovery must state measurable recovery.
- Time inside workoutStructure uses seconds.
- Distance uses metres.
- Do not hide a Run inside Bike details. A Bike-to-Run brick must
  contain explicit Bike and Run canonical blocks.
- details must describe the same workout as canonical structure.
- Never invent FTP, CSS, threshold pace, heart-rate zones,
  kilogram loads or 1RM values.

CALENDAR AVAILABILITY:
${JSON.stringify(
  trainingAvailability,
  null,
  2
)}

Calendar restrictions are hard constraints.
Do not move or modify structured training onto an unavailable date.
`,
        input:
          "Review the remaining current-week sessions after the athlete changed race goal.",
      });


    const raw =
      response.output_text;


    if (!raw) {
      throw new Error(
        "No current-week adaptation returned"
      );
    }


    const cleaned =
      raw
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /```$/,
          ""
        )
        .trim();


    const parsed =
      JSON.parse(
        cleaned
      ) as {
        changed:
          boolean;

        reason:
          string;

        plan:
          TrainingPlan;
      };


    if (
      !parsed.plan ||
      !Array.isArray(
        parsed.plan.days
      ) ||
      parsed.plan.days.length !==
        7
    ) {

      return NextResponse.json(
        {
          error:
            "Goal-change adaptation returned an invalid training-week shape.",
        },
        {
          status:
            422,
        }
      );
    }


    /*
      Server-side protection:
      athlete-owned secondary sessions are preserved.
      Coach-owned secondary sessions may be adapted.
      Legacy sessions without sessionSource are
      treated as athlete-owned.
    */
    const currentAdditionalSessions =
      currentPlan.additionalSessions ?? [];

    const proposedAdditionalSessions =
      parsed.plan.additionalSessions ?? [];

    const protectedAthleteSessions =
      currentAdditionalSessions.filter(
        (
          session:
            NonNullable<
              TrainingPlan["additionalSessions"]
            >[number]
        ) =>
          session.sessionSource !== "coach"
      );

    const proposedCoachSessions =
      proposedAdditionalSessions.filter(
        (
          session:
            NonNullable<
              TrainingPlan["additionalSessions"]
            >[number]
        ) =>
          session.sessionSource === "coach"
      );

    const safePlan:
      TrainingPlan = {
        ...parsed.plan,

        additionalSessions: [
          ...protectedAthleteSessions,
          ...proposedCoachSessions,
        ],
      };


    /*
      Server-side protection for locked
      primary sessions.
    */
    safePlan.days =
      safePlan.days.map(
        (
          proposedDay:
            TrainingPlan["days"][number]
        ) => {

          const original =
            currentPlan.days.find(
              (
                day:
                  TrainingPlan["days"][number]
              ) =>
                (
                  day.sessionId &&
                  proposedDay.sessionId &&
                  day.sessionId ===
                    proposedDay.sessionId
                ) ||
                (
                  day.date &&
                  proposedDay.date &&
                  day.date ===
                    proposedDay.date
                ) ||
                day.day ===
                  proposedDay.day
            );


          if (!original) {
            return proposedDay;
          }


          const protectedId =
            original.sessionId &&
            currentWeekAnalysis
              .protectedSessionIds
              .includes(
                original.sessionId
              );


          const protectedDate =
            original.date &&
            currentWeekAnalysis
              .protectedDates
              .includes(
                original.date
              );


          if (
            protectedId ||
            protectedDate
          ) {
            return original;
          }


          return proposedDay;
        }
      );


    /*
      ======================================================
      GOAL-CHANGE CURRENT-WEEK SAFETY WALL
      ======================================================

      Reuse the same legacy-aware contract as normal Coach:

      - unchanged stored legacy sessions may remain untouched
      - every genuinely new / modified workout must be canonical
      - current-week calendar identity is server-authoritative
      - Calendar + weekly availability are hard constraints
    */

    const protectedPlan =
      prepareCoachPlanForReturn({
        proposedPlan:
          safePlan,

        currentPlan,
      });


    const finalAdditionalSessions =
      protectedPlan.additionalSessions ??
      [];


    const totalMinutes = [
      ...protectedPlan.days,
      ...finalAdditionalSessions,
    ].reduce(
      (
        total,
        session
      ) =>
        total +
        (
          session.sport ===
            "Rest"
            ? 0
            : Number(
                session.durationMinutes
              ) || 0
        ),
      0
    );


    const finalizedPlan:
      TrainingPlan = {
        ...protectedPlan,

        additionalSessions:
          finalAdditionalSessions,

        totalHours:
          Number(
            (
              totalMinutes /
              60
            ).toFixed(
              2
            )
          ),
      };


    const canonicalCheck =
      validateCoachCanonicalChanges({
        currentPlan,

        proposedPlan:
          finalizedPlan,
      });


    if (
      !canonicalCheck.valid
    ) {

      console.error(
        "Goal-change canonical safety wall failed:",
        canonicalCheck
      );


      return NextResponse.json(
        {
          error:
            "Basse could not safely adapt the current week to the new race goal.",

          canonical:
            canonicalCheck.errors,
        },
        {
          status:
            422,
        }
      );
    }


    const raceFinalizedPlan =
      athlete?.raceDate
        ? applyTargetRaceWeekSpecialStates({
            plan:
              finalizedPlan,

            raceDate:
              athlete.raceDate,

            raceName:
              athlete.targetRace?.name ||
              "Target race",

            raceFormat:
              athlete.targetRace?.format,
          })
        : finalizedPlan;


    const raceStateCheck =
      athlete?.raceDate
        ? validateTargetRaceWeekSpecialStates({
            plan:
              raceFinalizedPlan,

            raceDate:
              athlete.raceDate,

            raceName:
              athlete.targetRace?.name ||
              "Target race",
          })
        : {
            valid:
              true,
            errors:
              [],
          };


    if (
      !raceStateCheck.valid
    ) {

      console.error(
        "Goal-change race-week special-state wall failed:",
        raceStateCheck
      );


      return NextResponse.json(
        {
          error:
            "Basse could not safely finalize the target-race week.",

          raceWeek:
            raceStateCheck.errors,
        },
        {
          status:
            422,
        }
      );
    }


    const availabilityCheck =
      validateCoachPlanAvailability({
        plan:
          raceFinalizedPlan,

        athlete,

        availability:
          Array.isArray(
            trainingAvailability
          )
            ? trainingAvailability
            : [],
      });


    if (
      !availabilityCheck.valid
    ) {

      console.error(
        "Goal-change availability safety wall failed:",
        availabilityCheck
      );


      return NextResponse.json(
        {
          error:
            "Basse could not adapt the current week without conflicting with Calendar availability.",

          availability:
            availabilityCheck
              .violations,
        },
        {
          status:
            422,
        }
      );
    }


    /*
      Do not trust only the model's changed flag.

      Compare the FINAL protected / dated / recalculated plan
      with the authoritative current plan.
    */
    const planActuallyChanged =
      JSON.stringify(
        raceFinalizedPlan
      ) !==
      JSON.stringify(
        currentPlan
      );


    return NextResponse.json({
      changed:
        planActuallyChanged,

      reason:
        parsed.reason,

      plan:
        raceFinalizedPlan,
    });


  } catch (error) {

    console.error(
      "Goal change current-week adaptation error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Could not review current week after goal change",
      },
      {
        status: 500,
      }
    );
  }
}
