import {
  getCanonicalTrainingPhase,
  getCanonicalWeeksUntilRace,
} from "@/lib/training-phase";

import {
  applyTargetRaceWeekSpecialStates,
  validateTargetRaceWeekSpecialStates,
} from "@/lib/target-race-week";

import {
  createOpenAIClient,
} from "@/lib/openai-server";
import { NextResponse } from "next/server";

import {
  applyBenchmarkPrescriptionToPlan,
} from "@/lib/benchmark-plan-prescription";
import {
  buildTrainingScienceGuidance,
} from "@/lib/training-science";

import {
  buildRaceDistanceGuidance,
} from "@/lib/race-distance";

import {
  buildRaceSpecificityGuidance,
} from "@/lib/race-specificity";

import {
  buildBenchmarkGuidance,
} from "@/lib/performance-benchmarks";

import {
  buildBenchmarkPrescriptionGuidance,
} from "@/lib/benchmark-prescription";

import {
  auditBenchmarkUsage,
} from "@/lib/benchmark-usage-audit";

import {
  buildBenchmarkAwareness,
} from "@/lib/benchmark-awareness";

import {
  buildSessionLibraryGuidance,
} from "@/lib/session-library";

import { INTENSITY_PRESCRIPTION_POLICY } from "@/lib/intensity-prescription-policy";

import {
  buildMultiSessionPlanningGuidance,
  normalizeCoachGeneratedPlan,
} from "@/lib/multi-session-planning";

import {
  buildDisciplineAllocationGuidance,
} from "@/lib/discipline-allocation";

import {
  buildAvailabilityGuidance,
  buildWeeklyAvailabilityGuidance,
} from "@/lib/training-availability";

import {
  auditTrainingPlan,
} from "@/lib/training-plan-audit";

import {
  prepareGeneratedNextWeekPlan,
  validateFinalNextWeekAvailability,
} from "@/lib/next-week-safety";

import {
  repairNextWeekVolumeShortfall,
} from "@/lib/next-week-volume-repair";

import {
  buildDisciplineLoadState,
} from "@/lib/discipline-load";
import { buildCoachingSignals } from "@/lib/adaptive-coaching";
import { buildAthleteState } from "@/lib/athlete-state";
import { buildDecisionTrace } from "@/lib/decision-trace";

import type {
    TrainingArchiveWeek,
  WorkoutFeedback,
} from "@/types/training";

const openai =
  createOpenAIClient();


/*
  ========================================================
  CANONICAL STRENGTH STRUCTURE SCHEMA
  ========================================================

  Strength uses exercises / sets / reps / loading / rest
  instead of artificial time-distance workout blocks.

  Strict structured output requires this property on every
  generated session. Non-strength sessions return null.
*/
const nextWeekStrengthStructureSchema:
  Record<string, unknown> = {
    anyOf: [
      {
        type: "object",
        additionalProperties: false,

        properties: {
          goal: {
            type: "string",
            enum: [
              "Adaptation",
              "MaxStrength",
              "StrengthPower",
              "Maintenance",
              "Taper",
            ],
          },

          warmup: {
            type: "array",
            maxItems: 4,

            items: {
              type: "string",
            },
          },

          exercises: {
            type: "array",
            minItems: 1,
            maxItems: 8,

            items: {
              type: "object",
              additionalProperties: false,

              properties: {
                exerciseKey: {
                  type: "string",
                  enum: [
                    "back-squat",
                    "front-squat",
                    "goblet-squat",
                    "leg-press",
                    "hack-squat",
                    "romanian-deadlift",
                    "trap-bar-deadlift",
                    "hip-thrust",
                    "bulgarian-split-squat",
                    "reverse-lunge",
                    "step-up",
                    "single-leg-press",
                    "seated-calf-raise",
                    "standing-calf-raise",
                    "single-leg-calf-raise",
                    "pull-up",
                    "lat-pulldown",
                    "chest-supported-row",
                    "cable-row",
                    "bench-press",
                    "incline-dumbbell-press",
                    "dumbbell-press",
                    "push-up",
                    "landmine-press",
                    "pallof-press",
                    "dead-bug",
                    "side-plank",
                    "cable-anti-rotation",
                    "carry",
                    "countermovement-jump",
                    "box-jump",
                    "jump-squat",
                    "other",
                  ],
                },

                name: {
                  type: "string",
                },

                movementPattern: {
                  type: "string",
                  enum: [
                    "Squat",
                    "Hinge",
                    "Single-leg",
                    "Calf",
                    "Pull",
                    "Push",
                    "Trunk",
                    "Power",
                  ],
                },

                sets: {
                  type: "integer",
                  minimum: 1,
                  maximum: 5,
                },

                reps: {
                  type: "string",
                },

                loadGuidance: {
                  type: "string",
                },

                restSeconds: {
                  type: "integer",
                  minimum: 30,
                  maximum: 300,
                },

                instruction: {
                  type: "string",
                },

                alternatives: {
                  type: "array",
                  maxItems: 3,

                  items: {
                    type: "string",
                  },
                },
              },

              required: [
                "exerciseKey",
                "name",
                "movementPattern",
                "sets",
                "reps",
                "loadGuidance",
                "restSeconds",
                "instruction",
                "alternatives",
              ],
            },
          },
        },

        required: [
          "goal",
          "warmup",
          "exercises",
        ],
      },

      {
        type: "null",
      },
    ],
  };


type ArchiveWeek = {
  plan?: {
    totalHours?: number;
  };
  feedback?: Array<{
    status?: string;
    rpe?: number | null;
    feeling?: string | null;
    actualDurationMinutes?: number | null;
    plannedDurationMinutes?: number | null;
  }>;
};



function summarizeTrainingTrend(
  trainingArchive: ArchiveWeek[] = [],
  currentFeedback: ArchiveWeek["feedback"] = []
) {
  const recentWeeks = trainingArchive.slice(-3);

  const feedback = [
    ...recentWeeks.flatMap(
      (week) => week.feedback ?? []
    ),
    ...(currentFeedback ?? []),
  ];

  const completed = feedback.filter(
    (item) =>
      item.status === "Completed" ||
      item.status === "Modified"
  );

  const skipped = feedback.filter(
    (item) => item.status === "Skipped"
  );

  const rpes = completed
    .map((item) => item.rpe)
    .filter(
      (value): value is number =>
        typeof value === "number"
    );

  const averageRpe =
    rpes.length > 0
      ? rpes.reduce((a, b) => a + b, 0) /
        rpes.length
      : null;

  const heavySessions = completed.filter(
    (item) =>
      (item.rpe ?? 0) >= 8 ||
      item.feeling === "Heavy"
  ).length;

  const plannedMinutes = feedback.reduce(
    (sum, item) =>
      sum + (item.plannedDurationMinutes ?? 0),
    0
  );

  const actualMinutes = feedback.reduce(
    (sum, item) =>
      sum + (item.actualDurationMinutes ?? 0),
    0
  );

  const completionRate =
    plannedMinutes > 0
      ? actualMinutes / plannedMinutes
      : null;

  return {
    weeksAnalyzed: recentWeeks.length,
    sessionsAnalyzed: feedback.length,
    completedSessions: completed.length,
    skippedSessions: skipped.length,
    averageRpe:
      averageRpe === null
        ? null
        : Number(averageRpe.toFixed(1)),
    heavySessions,
    completionRate:
      completionRate === null
        ? null
        : Number(
            (completionRate * 100).toFixed(0)
          ),
  };
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const trainingAvailability =
      Array.isArray(
        body.trainingAvailability
      )
        ? body.trainingAvailability
        : [];

    const availabilityGuidance =
      buildAvailabilityGuidance(
        trainingAvailability
      );

    

    const weeklyAvailabilityGuidance =
      buildWeeklyAvailabilityGuidance(
        body.athlete ?? null
      );
const {
      athlete,
      currentPlan,

      /*
        Existing provisional plan for the SAME upcoming week.
        Used only to preserve useful calendar structure.
      */
      previousPreview = null,

      workoutHistory = [],
      planHistory = [],
      trainingArchive = [],
      seasonRoadmap = null,
      readinessHistory = [],
    } = body;

    const currentWeekStart =
      currentPlan?.weekStart ?? null;


    /*
      ==================================================
      EXACT UPCOMING CALENDAR WEEK
      ==================================================

      "Weeks until race" is not precise enough to decide
      whether the target race belongs inside this plan.
    */

    const weekdayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];


    const nextWeekStart = (() => {

      if (currentWeekStart) {

        const date =
          new Date(
            `${currentWeekStart}T12:00:00`
          );

        date.setDate(
          date.getDate() + 7
        );

        return date;
      }


      const date =
        new Date();

      date.setHours(
        12,
        0,
        0,
        0
      );


      const mondayOffset =
        date.getDay() === 0
          ? -6
          : 1 - date.getDay();


      date.setDate(
        date.getDate() +
          mondayOffset +
          7
      );

      return date;
    })();


    const nextWeekEnd =
      new Date(
        nextWeekStart
      );

    nextWeekEnd.setDate(
      nextWeekStart.getDate() +
        6
    );


    const targetRaceDate =
      athlete?.raceDate
        ? new Date(
            `${athlete.raceDate}T12:00:00`
          )
        : null;


    const raceIsNextWeek =
      Boolean(
        targetRaceDate &&
        !Number.isNaN(
          targetRaceDate.getTime()
        ) &&
        targetRaceDate >=
          nextWeekStart &&
        targetRaceDate <=
          nextWeekEnd
      );


    const targetRaceWeekday =
      raceIsNextWeek &&
      targetRaceDate
        ? weekdayOrder[
            targetRaceDate.getDay() === 0
              ? 6
              : targetRaceDate.getDay() - 1
          ]
        : null;


    const nextWeekStartIso =
      nextWeekStart
        .toISOString()
        .slice(0, 10);


    const nextWeekEndIso =
      nextWeekEnd
        .toISOString()
        .slice(0, 10);


    let roadmapWeek = null;

    if (
      seasonRoadmap?.weeks?.length &&
      currentWeekStart
    ) {
      const currentIndex =
        seasonRoadmap.weeks.findIndex(
          (week: { startDate?: string }) =>
            week.startDate === currentWeekStart
        );

      if (
        currentIndex >= 0 &&
        seasonRoadmap.weeks[currentIndex + 1]
      ) {
        roadmapWeek =
          seasonRoadmap.weeks[currentIndex + 1];
      }
    }

    if (
      !roadmapWeek &&
      seasonRoadmap?.weeks?.length
    ) {

      /*
        Fallback ownership must follow the exact upcoming
        calendar week already resolved by this route.

        Do not compare roadmap dates against server wall-clock
        time. On Monday morning, a roadmap entry for that same
        Monday at noon could otherwise be mistaken for the
        upcoming week.

        nextWeekStartIso is the authoritative identity.
      */
      roadmapWeek =
        seasonRoadmap.weeks.find(
          (
            week: {
              startDate?: string;
            }
          ) =>
            week.startDate ===
            nextWeekStartIso
        ) ?? null;
    }

    /*
      This plan belongs to the UPCOMING calendar week.

      Phase and race proximity must therefore be evaluated
      from nextWeekStart, not from the wall-clock time when
      this API request happens.

      Otherwise phase boundaries can shift merely because
      the preview was generated a few days before the week
      it actually represents.
    */
    const trainingPhase =
      getCanonicalTrainingPhase(
        athlete?.raceDate,
        nextWeekStart
      );

    const weeksRemaining =
      getCanonicalWeeksUntilRace(
        athlete?.raceDate,
        nextWeekStart
      );

    const recentDisciplineContext =
      trainingArchive
        .slice(-6)
        .map(
          (week: TrainingArchiveWeek) => {
            const feedback =
              week.feedback ?? [];

            const minutesFor =
              (sport: string) =>
                feedback
                  .filter(
                    (item: WorkoutFeedback) =>
                      item.sport === sport &&
                      (
                        item.status ===
                          "Completed" ||
                        item.status ===
                          "Modified"
                      )
                  )
                  .reduce(
                    (
                      sum: number,
                      item: WorkoutFeedback
                    ) =>
                      sum +
                      (
                        item.actualDurationMinutes ??
                        item.plannedDurationMinutes ??
                        0
                      ),
                    0
                  );

            return {
              archivedAt:
                week.archivedAt,

              Swim:
                minutesFor("Swim"),

              Bike:
                minutesFor("Bike"),

              Run:
                minutesFor("Run"),

              Strength:
                minutesFor("Strength"),
            };
          }
        );


    const trainingScience =
      buildTrainingScienceGuidance({
        athlete,
        phase: trainingPhase,
      });

    const sessionLibrary =
      buildSessionLibraryGuidance({
        athlete: athlete ?? {},
        phase: trainingPhase,
      });


    const multiSessionGuidance =
      buildMultiSessionPlanningGuidance({
        athlete,
      });

    const trainingTrend =
      summarizeTrainingTrend(
        trainingArchive,
        workoutHistory
      );


    /*
      WEEKLY REVIEW FACTS

      The narrative review may be written by the model,
      but factual counters must come directly from the
      CURRENT week's logged feedback.

      Do not use trainingTrend here because that deliberately
      includes older archived weeks for coaching context.
    */
    const currentWeekCompletedFeedback =
      workoutHistory.filter(
        (item: {
          status?: string;
          rpe?: number | null;
        }) =>
          item.status === "Completed" ||
          item.status === "Modified"
      );


    const currentWeekSkippedFeedback =
      workoutHistory.filter(
        (item: {
          status?: string;
        }) =>
          item.status === "Skipped"
      );


    const currentWeekRpes: number[] =
      currentWeekCompletedFeedback
        .map(
          (item: {
            rpe?: number | null;
          }): number | null =>
            typeof item.rpe === "number"
              ? item.rpe
              : null
        )
        .filter(
          (
            value: number | null
          ): value is number =>
            typeof value === "number" &&
            Number.isFinite(value)
        );


    const currentWeekAverageRpe =
      currentWeekRpes.length > 0
        ? Number(
            (
              currentWeekRpes.reduce(
                (
                  sum: number,
                  value: number
                ) =>
                  sum + value,
                0
              ) /
              currentWeekRpes.length
            ).toFixed(1)
          )
        : null;


    /*
      ======================================================
      LOAD REFERENCE FOR A PARTIAL FIRST WEEK
      ======================================================

      A first TriCoach week created late in the calendar week
      is intentionally partial.

      Example:
      onboarding on Sunday may produce only a few hours.

      That artificial partial-week total must NOT become the
      physiological baseline for the following full week.

      Until we have meaningful workout feedback, prefer:
      1. roadmap target for the upcoming full week
      2. athlete's stated current training volume
      3. current plan hours as fallback

      Once real execution data exists, normal adaptive load
      progression takes over again.
    */
    const hasMeaningfulExecution =
      workoutHistory.some(
        (item: {
          status?: string;
          actualDurationMinutes?: number | null;
        }) =>
          (
            item.status === "Completed" ||
            item.status === "Modified"
          ) &&
          typeof item.actualDurationMinutes ===
            "number" &&
          item.actualDurationMinutes > 0
      );


    const currentPlanHours =
      Number(
        currentPlan?.totalHours
      ) || 0;


    const athleteCurrentHours =
      Number(
        athlete?.currentTrainingHours
      ) || 0;


    const roadmapHours =
      Number(
        roadmapWeek?.targetHours
      ) || 0;


    const fullWeekReferenceHours =
      athleteCurrentHours > 0
        ? athleteCurrentHours
        : roadmapHours > 0
          ? roadmapHours
          : currentPlanHours;


    const currentPlanLooksPartial =
      !hasMeaningfulExecution &&
      fullWeekReferenceHours > 0 &&
      currentPlanHours <
        fullWeekReferenceHours * 0.7;


    const loadReferenceHours =
      currentPlanLooksPartial
        ? fullWeekReferenceHours
        : currentPlanHours;


    const coachingSignals =
      buildCoachingSignals({
        workoutHistory,
        readinessHistory,

        physiologicalBaselineHours:
          athleteCurrentHours > 0
            ? athleteCurrentHours
            : loadReferenceHours,

        currentPlanHours:
          loadReferenceHours,

        roadmapTargetHours:
          roadmapWeek?.targetHours ?? null,

        athleteHours:
          athlete?.hoursPerWeek ?? null,
      });

    const disciplineAllocationGuidance =
      buildDisciplineAllocationGuidance({
        athlete: athlete ?? {},
        phase: trainingPhase,

        weeklyHours:
          coachingSignals.recommendedHoursMax,
      });


    if (
      currentPlanLooksPartial
    ) {
      coachingSignals.reasons.unshift(
        `The current TriCoach week is a partial onboarding week, so ${loadReferenceHours.toFixed(1)} h is used as the full-week load reference instead of ${currentPlanHours.toFixed(1)} h.`
      );
    }

    const athleteState =
      buildAthleteState({
        workoutHistory,
        trainingArchive,
        readinessHistory,
      });

    const decisionTrace =
      buildDecisionTrace({
        coachingSignals,
        athleteState,
      });

    if (!athlete || !currentPlan) {
      return NextResponse.json(
        {
          error:
            "Athlete and current plan are required",
        },
        { status: 400 }
      );
    }

    const raceDistanceGuidance =
      buildRaceDistanceGuidance({
        athlete: athlete ?? {},
        phase: trainingPhase,
        weeksUntilRace:
          weeksRemaining,
      });


    const raceSpecificityGuidance =
      buildRaceSpecificityGuidance(
        athlete?.targetRace
      );


    const benchmarkGuidance =
      buildBenchmarkGuidance(
        athlete?.benchmarks
      );

    const benchmarkPrescription =
      buildBenchmarkPrescriptionGuidance(
        athlete?.benchmarks
      );

    const benchmarkAwareness =
      buildBenchmarkAwareness(
        athlete?.benchmarks
      );


    const response =
      await openai.responses.create({
        model: "gpt-5.6-luna",

        instructions: `
You are the adaptive weekly planning engine for TriCoach.

You are reviewing one completed training week and creating the next week.

ATHLETE:
${JSON.stringify(athlete, null, 2)}

UNIT SYSTEM:
${athlete?.unitSystem || "Metric"}

UNIT RULES:
- Metric uses kilometres, metres and min/km where relevant.
- Imperial uses miles, yards and min/mi where relevant.
- Athlete-facing workout text should follow the selected unit system.
- Do not change internal load calculations because of display units.
- Do not invent numerical targets merely to demonstrate the selected unit system.
- Preserve athlete-supplied benchmark values unless conversion materially improves execution.

Treat the athlete profile as hard context:
- respect available training days
- respect maximum realistic session length
- use current discipline levels
- respect equipment access
- respect athlete limitations
- do not increase volume aggressively beyond recent training tolerance

EVIDENCE-BASED TRAINING MODEL:
${INTENSITY_PRESCRIPTION_POLICY}

${trainingScience}

RACE-DISTANCE SPECIFIC MODEL:
${raceDistanceGuidance}

RACE-COURSE SPECIFIC MODEL:
${raceSpecificityGuidance}

ATHLETE PERFORMANCE BENCHMARKS:
${benchmarkGuidance}

BENCHMARK-BASED PRESCRIPTION:
${benchmarkPrescription}

PRESCRIPTION RULE:
Use these targets only when they improve the athlete's ability
to execute the intended session.

Numerical targets must never replace the simple explanation
of what the workout should feel like.

BENCHMARK AWARENESS:
${JSON.stringify(
  benchmarkAwareness,
  null,
  2
)}

BENCHMARK-AWARENESS RULES:

- Missing benchmark data is NOT a problem by itself.
- Do not repeatedly tell the athlete to test.
- Do not make benchmark testing a prerequisite for training.
- RPE-based training remains fully valid.
- Mention a benchmark test only when it would materially improve
  the current coaching decision or future prescription.
- Prefer natural opportunities for testing rather than adding
  unnecessary maximal tests.
- Do not recommend retesting merely because a fixed number of
  days has passed.
- "Stale" means consider whether an update would be useful,
  not that the stored benchmark is automatically invalid.
- Recent workout execution and race results may provide enough
  information without formal testing.
- Avoid maximal testing during inappropriate fatigue, recovery,
  illness, injury concern or immediately before an important race.
- Never alter an otherwise good training week simply to collect
  benchmark data.
- Keep any athlete-facing benchmark suggestion short and explain
  what practical benefit the test would provide.

BENCHMARK PRIORITY:
Use valid athlete benchmarks when they genuinely improve
the precision of the prescribed session.

Never invent missing:
- FTP
- CSS
- threshold pace
- race pace
- heart-rate threshold
- training zones

If benchmark data is unavailable for a discipline,
use RPE and execution descriptions instead.

Benchmark numbers do NOT override:
- readiness
- recent workout execution
- recovery
- pain / illness concerns
- athlete availability
- deterministic load guardrails.

A workout should remain understandable even when it contains
a benchmark-based target.

RACE-DISTANCE RULE:
The athlete's target distance changes the balance of endurance,
quality, bricks, fueling and race specificity.

Do not simply scale the same generic training week up or down by hours.

Race distance does NOT override:
- athlete safety
- current training tolerance
- readiness
- availability
- equipment
- deterministic load guardrails.

RACE-COURSE SPECIFICITY RULE:
Use the target race course profile to shape the CONTENT
of appropriate training, not to bypass the allowed load envelope.

Examples:
- mountainous bike courses may justify progressive climbing durability
- flat bike courses may justify sustained steady race-power work
- trail or mountainous runs may justify gradual terrain-specific durability
- technical bike courses may justify appropriate handling exposure
- open-water races may justify progressive open-water skills
- long-course races may justify purposeful fueling practice

Specificity must be proportional to:
- current training phase
- time remaining until race
- athlete experience
- recent training tolerance
- available equipment and terrain

Do NOT:
- make every session race-specific
- add extra hours merely to imitate the race
- force hills into recovery sessions
- force bricks after every ride
- introduce excessive downhill running suddenly
- prescribe unsafe open-water or cold-water exposure
- override readiness or recovery concerns
- exceed deterministic load guardrails

When race data has been manually edited by the athlete,
treat those athlete-edited values as authoritative.

TRICOACH SESSION LIBRARY:
${sessionLibrary}

${multiSessionGuidance}

${weeklyAvailabilityGuidance}

${availabilityGuidance}
CALENDAR AVAILABILITY — NON-NEGOTIABLE

- Date-specific Calendar availability is a HARD constraint.
- It overrides preservation of the previous plan structure.
- A BRICK workout always uses BOTH Bike AND Run,
  even when its main sport field says only "Bike".
- If Bike is blocked, a Bike→Run brick is not allowed.
- If Run is blocked, a Bike→Run brick is not allowed.
- Never keep, create or move a brick onto a date where
  either Bike or Run is unavailable.
- If previousPreview conflicts with availability, CHANGE
  the conflicting workout. Do not preserve it.


CALENDAR AVAILABILITY RULE:
- Calendar availability is a HARD real-life constraint.
- Never schedule training on an Unavailable date.
- On a Limited date, use only explicitly allowed disciplines.
- Respect maxDurationMinutes as the TOTAL across every session that date.
- Primary and additional sessions are both subject to the same restriction.
- Do not make up blocked training by creating unsafe density elsewhere.
- Move, replace, shorten or omit training when necessary.
- A note gives context but never overrides the structured restriction.

DISCIPLINE ALLOCATION:

${disciplineAllocationGuidance}

SESSION LIBRARY RULE:
Choose and scale appropriate session families from this library instead of inventing unnecessarily novel workouts.
The library is guidance, not a requirement to use every workout type.
Athlete-specific constraints and recovery remain more important than library templates.

CURRENT / PREVIOUS WEEK PLAN:
${JSON.stringify(currentPlan, null, 2)}

WHAT THE ATHLETE ACTUALLY LOGGED:
${JSON.stringify(workoutHistory, null, 2)}

OLDER PLAN HISTORY:
${JSON.stringify(
  planHistory.slice(-3),
  null,
  2
)}

CURRENT TRAINING PHASE:
${trainingPhase}

WEEKS UNTIL RACE:
${weeksRemaining ?? "Unknown"}

UPCOMING WEEK CALENDAR:
${nextWeekStartIso} through ${nextWeekEndIso}

TARGET RACE DATE:
${athlete?.raceDate || "None"}

TARGET RACE IS INSIDE THIS UPCOMING WEEK:
${raceIsNextWeek ? "YES" : "NO"}

${raceIsNextWeek
  ? `TARGET RACE WEEK — HARD COACHING RULE:
- ${athlete?.targetRace?.name || "The target race"} occurs on ${targetRaceWeekday}, ${athlete?.raceDate}.
- This is a race week, not a normal training week.
- Sessions before the race must taper toward freshness.
- Use only short, purposeful activation and race-readiness work where appropriate.
- Do not chase fitness or accumulate unnecessary fatigue.
- Do not schedule structured training after race day.
- The server inserts the canonical Race Day and post-race recovery states deterministically.
- Keep the race-day primary slot light and disposable because it will be replaced by Race Day.
- The normal recommendedHoursMin does NOT apply during the target-race week.
- Never add training merely to reach normal weekly volume.`
  : `This is not the athlete's target-race week.`}

RECENT DISCIPLINE-SPECIFIC TRAINING:
${JSON.stringify(
  recentDisciplineContext,
  null,
  2
)}

DISCIPLINE LOAD PRINCIPLES:
- Evaluate swim, bike and run progression separately as well as total weekly hours.
- Do not assume equal minutes in different disciplines create equal training stress.
- Running progression deserves extra caution because of mechanical loading.
- Do not use a rigid universal weekly percentage rule.
- Compare proposed discipline volume with the athlete's own recent exposure.
- A weak discipline may deserve more frequency without requiring a large one-week jump in minutes.
- Prefer frequency and consistency before aggressive duration increases.
- Do not create catch-up volume for a discipline simply because sessions were missed.

MULTI-WEEK TRAINING TREND:
${JSON.stringify(
  trainingTrend,
  null,
  2
)}

DETERMINISTIC COACHING SIGNALS:
${JSON.stringify(
  coachingSignals,
  null,
  2
)}

ATHLETE STATE — RECENT MULTI-WEEK PATTERNS:
${JSON.stringify(
  athleteState,
  null,
  2
)}

DECISION TRACE:
${JSON.stringify(
  decisionTrace,
  null,
  2
)}

TRACE RULE:
Use this as the concise evidence behind the weekly decision.
Do not expose hidden reasoning or invent additional evidence.

ATHLETE STATE RULES:
- Athlete State is derived from recent logged training and readiness.
- Respect athleteState.dataQuality.
- Avoid strong conclusions when data quality is Low.
- Lower discipline consistency must not automatically remove that discipline.
- First consider scheduling, access, duration and session difficulty.
- Use loadTolerance and recoveryPattern together with coachingSignals.
- coachingSignals.loadDecision remains the hard load guardrail.
- Athlete State may shape placement, structure and discipline emphasis only within that guardrail.
- Do not increase total load beyond the deterministic recommended range because Athlete State looks positive.

IMPORTANT:
These coaching signals were calculated before the AI planning step.
Treat them as guardrails, not suggestions.

RECENT READINESS:
${readinessHistory?.length
  ? JSON.stringify(
      readinessHistory.slice(-7),
      null,
      2
    )
  : "No readiness data available."}

ARCHIVED TRAINING WEEKS:
${JSON.stringify(
  trainingArchive.slice(-3),
  null,
  2
)}

SEASON ROADMAP:
${seasonRoadmap
  ? JSON.stringify(seasonRoadmap, null, 2)
  : "No season roadmap available."}

TARGET ROADMAP WEEK FOR THE NEXT PLAN:
${roadmapWeek
  ? JSON.stringify(roadmapWeek, null, 2)
  : "No matching roadmap week found."}

YOUR JOB:

1. Review the week honestly.
2. Identify meaningful patterns.
3. Use coachingSignals.loadDecision as the load decision.
4. Use Athlete State to make the plan more realistic for this athlete.
5. Create the next 7-day plan within the allowed volume range.
6. Use race-course specificity when it materially improves preparation for the target event.
7. If a target roadmap week exists, align the plan to it without violating the guardrails.
8. Explain the main reason for the decision.

ATHLETE STATE PLANNING GUIDANCE:
- If one discipline has repeatedly low consistency, do not automatically add more volume in that discipline.
- Prefer improving placement, accessibility, duration or session structure first.
- If load tolerance is Strained, keep key sessions purposeful and remove unnecessary difficulty.
- If recovery is Strained, protect recovery even if completion has been high.
- If consistency is strong and load tolerance is Comfortable, progression may be used only inside the deterministic load range.
- Do not overreact to one unusual session.
- Moderate or Strong multi-week evidence should outweigh isolated anomalies.

SCHEDULE PATTERN GUIDANCE:
- Use athleteState.schedule only when there is an actual repeated pattern.
- A historically reliable day is a useful place for key sessions when it also fits the athlete's stated availability.
- If a weekday is repeatedly skipped, avoid putting an unnecessarily important session there when another sensible option exists.
- If a weekday is frequently Modified, prefer a more flexible duration or structure rather than assuming the athlete cannot train that day.
- Never override athlete.availableDays because of historical patterns.
- Never infer why a day is unreliable unless the athlete has explicitly explained the reason.
- Do not reorganize an otherwise sensible week solely because of weak schedule evidence.

PREVIEW STABILITY:

The athlete may already have seen a provisional plan for this SAME upcoming calendar week.

EXISTING PROVISIONAL NEXT WEEK:
${JSON.stringify(previousPreview, null, 2)}

If previousPreview exists, treat its calendar structure as the default.

PRESERVE by default:
- sport on each weekday
- rest days
- long-session placement
- key-session placement
- overall weekday structure

You MAY freely make small adaptive changes within the same day:
- duration
- intensity
- interval count
- interval duration
- recovery duration
- session details
- title wording
- purpose wording

Do NOT move or swap sessions merely because a new generation would look slightly different.

A structural change is justified only when there is a clear reason such as:
- athlete availability changed
- race date / race proximity materially changed
- recovery or fatigue signals make the existing placement unsafe
- injury / limitation information changed
- equipment access changed
- the existing preview violates the deterministic load or safety envelope
- recent training makes the previous structure clearly inappropriate

If none of those applies, preserve the previousPreview weekday structure.

Important:
Preview stability must NEVER override safety.
A dangerous or clearly inappropriate previous preview should be corrected.

PLANNED VS ACTUAL GUIDANCE:
- Use athleteState.execution to judge whether prescribed duration is realistic.
- If a discipline is repeatedly completed substantially shorter than planned, prefer a more executable prescription before adding more volume.
- Do not compensate for repeatedly shortened sessions by adding unrelated sessions elsewhere in the week.
- If actual training repeatedly exceeds planned duration, account for that extra load before progressing the formal plan.
- Athlete-added completed sessions count as real training load.
- Do not automatically remove athlete-added training; instead make the formal plan compatible with the total observed load.
- A single unusually long or short workout is not a pattern.
${raceIsNextWeek
  ? "- TARGET RACE WEEK overrides the normal minimum-volume boundary. recommendedHoursMax remains a hard ceiling."
  : "- Keep coachingSignals.recommendedHoursMin and recommendedHoursMax as hard total-load boundaries."}

The review.loadDecision field MUST equal coachingSignals.loadDecision exactly.

LOAD GUARDRAILS:

The deterministic engine has already decided the safe planning envelope.

REQUIRED LOAD DECISION:
${coachingSignals.loadDecision}

ALLOWED NEXT-WEEK TRAINING VOLUME:
${raceIsNextWeek
  ? `TARGET RACE WEEK: no minimum weekly-volume requirement. Do not exceed ${coachingSignals.recommendedHoursMax} hours.`
  : `${coachingSignals.recommendedHoursMin} to ${coachingSignals.recommendedHoursMax} hours.`}

CRITICAL TOTAL-VOLUME CHECK:
- Before returning the JSON, add the durationMinutes of EVERY non-Rest session in nextPlan.days AND every session in nextPlan.additionalSessions.
${raceIsNextWeek
  ? "- TARGET RACE WEEK: do NOT add sessions or duration merely to reach recommendedHoursMin."
  : `- The summed duration MUST be at least ${Math.ceil(coachingSignals.recommendedHoursMin * 60)} minutes.`}
- The summed duration MUST be at most ${Math.floor(coachingSignals.recommendedHoursMax * 60)} minutes.
- Do not rely on nextPlan.totalHours when checking this. Calculate the sum from the sessions themselves.
- Set nextPlan.totalHours from that final summed session duration.
${raceIsNextWeek
  ? "- A deliberately low weekly total is correct when it improves freshness for the target race."
  : "- Prefer landing safely inside the allowed range rather than barely below the minimum."}
${raceIsNextWeek
  ? "- Do not repair a target-race week merely because it is below normal weekly volume."
  : "- If the draft is below the minimum, fix the duration distribution BEFORE returning the response."}
- Preserve recovery, discipline balance, availability, longest-session limits and all other coaching guardrails while doing this.
${raceIsNextWeek
  ? "- Race readiness and freshness override normal volume accumulation."
  : "- A response below the minimum volume will fail deterministic validation and require an expensive repair pass, so perform this self-check carefully."}

FATIGUE RISK:
${coachingSignals.fatigueRisk}

CONSISTENCY:
${coachingSignals.consistency}

DECISION REASONS:
${coachingSignals.reasons.join(" ")}

HARD RULES:

${raceIsNextWeek
  ? "- TARGET RACE WEEK: nextPlan.totalHours may be below recommendedHoursMin but MUST remain at or below recommendedHoursMax."
  : "- nextPlan.totalHours MUST stay between recommendedHoursMin and recommendedHoursMax."}
- review.loadDecision MUST equal coachingSignals.loadDecision.
- Do not override a Reduce decision because the roadmap asks for more volume.
- Do not override Maintain simply because the athlete has unused available hours.
- Increase slightly means a small progression only. Never jump directly toward maximum availability.
- Missed training must never be redistributed as catch-up volume.
- If totalHours and the sum of daily durations differ slightly because of rounding, keep the daily plan within the same safe range.
- Recovery signals override roadmap ambition.
- The AI may choose the CONTENT of the week, but not ignore the load envelope.

TRAINING PHASE LOGIC:

BASE:
- Emphasize aerobic consistency and technical development.
- Build durability gradually.
- Keep intensity limited and purposeful.

BUILD:
- Progress race-specific endurance.
- Introduce controlled quality.
- Maintain enough recovery to absorb training.

PEAK:
- Prioritize race-specific key sessions.
- Avoid large volume increases.
- Fitness should be expressed, not forced.

TAPER:
- Reduce overall volume and fatigue.
- Preserve some short controlled intensity.
- Arrive fresh rather than chasing fitness.

ROADMAP RULES:

- If TARGET ROADMAP WEEK exists, use it as the strategic target for the next week.
- Treat roadmap phase, focus, targetHours, priorityDiscipline and keyObjectives as planning guidance.
- Do not copy roadmap targetHours blindly if recent training feedback suggests fatigue or low completion.
- Recovery and safety override roadmap progression.
- Do not exceed the athlete's realistic weekly availability.
- Keep the daily plan aligned with the roadmap's phase and focus.
- If the athlete is not ready for the roadmap target, reduce load while preserving the roadmap's main objective.
- Do not invent a different phase unless recovery or race proximity clearly requires it.

READINESS TREND RULES:

- Do not overreact to one low-readiness day.
- Several consecutive Caution or Recover days suggest poor recovery.
- Repeated poor readiness should make progression more conservative.
- Good readiness alone is not enough reason to increase training.
- Readiness must never be treated as a medical diagnosis.

TREND RULES:

- Use the multi-week trend before changing load.
- If completion has been poor, do not reward that with more volume.
- If several recent sessions are RPE 8+ or Heavy, be cautious.
- A single hard day should not trigger a full deload.
- Several weeks of stable completion and manageable RPE may justify a small progression.
- Never increase volume aggressively.
- Do not exceed the athlete's realistic time availability.
- Do not let phase progression override recovery signals.

TRAINING PRINCIPLES:

- Consistency matters more than isolated heroic workouts.
- Do not "repay" missed sessions.
- Do not aggressively increase volume.
- A successful week does not automatically require more training.
- Repeated high RPE, heavy sessions, worsening fatigue, illness signals,
  or poor recovery should push the plan toward caution.
- One bad session alone should not cause an overreaction.
- Preserve recovery around demanding sessions.
- Avoid unnecessary hard-session stacking.
- Keep most endurance work easy or controlled.
- Prioritize the athlete's weakest discipline when appropriate.
- Beginner swimmers should emphasize technique, confidence,
  frequency and relaxed aerobic work.
- Long-bike volume is generally preferable to excessive run-volume
  increases for triathlon endurance.
- The athlete has a life outside training.
- Keep the plan reasonably close to their available weekly hours.
- Do not diagnose injury or illness.
- If workout feedback suggests concerning symptoms,
  be conservative and tell the athlete to seek appropriate
  professional medical assessment where warranted.

WEEK STRUCTURE:

Return exactly Monday through Sunday in days.

days contains exactly seven PRIMARY calendar slots.

Each primary day contains one primary sport category:
Swim, Bike, Run, Strength, or Rest.

additionalSessions contains optional SECONDARY workouts.

A calendar day may contain:
- one primary workout
- or one primary plus one secondary workout

Never create more than three structured sessions
on the same day.

A brick session remains ONE connected workout.

Use Bike as the primary workout sport for a normal
Bike-to-Run brick.

BRICK STRUCTURE RULES:
- A brick MUST contain both Bike and Run blocks inside workoutStructure.
- Every Bike block must use sport "Bike".
- Every Run block must use sport "Run".
- Never hide a transition run only inside details.
- If a connected Bike workout contains planned running at the end,
  it IS a brick, even if it was initially described as a Bike workout.
- Such a workout must be clearly titled/described as a Brick.
- Never generate a normal Bike workout with an unexplained Run component.
- The Run component belongs in the SAME workoutStructure.
- Do not put the normal brick Run in additionalSessions.
- Block order must match execution order exactly.
- details must describe the same Bike-to-Run sequence.

Do not represent a normal brick as a separate
secondary run.

Do not invent performance numbers such as FTP, threshold pace,
heart-rate zones, or swim CSS if the athlete has not provided them.
Use RPE / easy / moderate descriptions instead.

SESSION CONSTRUCTION STANDARD:

Every non-rest workout must be executable without the athlete having to guess what to do.

details must contain only the execution instructions the athlete needs.

For Swim, Bike and Run, use normally 2-4 short execution lines.

For Strength, one concise detail per prescribed exercise is allowed
until the dedicated Strength presentation is fully active.

Each detail should be immediately actionable.

GOOD:
- 10 min very easy warm-up
- 30 min relaxed conversational running, RPE 2-3
- 5 min very easy cool-down

BAD:
- long explanations
- coaching theory
- benchmark interpretation
- repeated pace / watt information
- repeating the purpose of the session

Keep PURPOSE separate from EXECUTION.

purpose = one short reason why the workout exists.

details = only what the athlete physically needs to do.

For easy sessions, do not repeat estimated pace in details if
it is already available as a secondary reference elsewhere.

For easy endurance sessions:
- state the intended easy effort / RPE
- avoid unnecessary complexity

For interval sessions:
- include warm-up
- exact number and duration of intervals
- recovery duration / style
- intended RPE
- cool-down where useful

CANONICAL WORKOUT STRUCTURE — SOURCE OF TRUTH:

Every generated session must return BOTH:
- workoutStructure
- strengthStructure

For Swim, Bike and Run:
- workoutStructure is the canonical executable definition
- strengthStructure must be null
- workoutStructure must contain every meaningful training block
- every workoutStructure block must include its actual sport
- for a single-discipline workout, block sport normally matches the workout sport
- for a brick, block sport changes from Bike to Run where the discipline changes
- do not leave recovery or interval structure implicit
- durations inside workoutStructure use SECONDS
- distances inside workoutStructure use METRES

For Strength:
- strengthStructure is the canonical executable definition
- workoutStructure must be []
- strengthStructure must NOT be null

For Rest:
- workoutStructure must be []
- strengthStructure must be null

details is secondary athlete-facing text and must describe
the SAME workout as the relevant canonical structure.
It must never contradict the canonical structure.

Until the dedicated Strength UI is fully active,
Strength details may use one concise line per exercise
so the complete session remains readable.

Allowed phases:
- Warm-up
- Main
- Recovery
- Cool-down

PHASE SEMANTICS:

Warm-up:
- only preparatory work at the beginning of the workout

Main:
- every block that forms part of the actual training stimulus
- easy aerobic work can still be Main
- endurance work can still be Main
- technique work can still be Main

Recovery:
- only a block whose FUNCTION is recovery
- especially recovery between harder efforts

Cool-down:
- only the actual final down-regulation / finishing block
- do NOT label an easy aerobic Main block as Cool-down
  merely because it is easy or comes late in the workout

Example:

10 min warm-up
4 x 6 min threshold with 4 min easy between repetitions
15 min easy aerobic riding
10 min cool-down

must use phases:

Warm-up
Main
Main
Cool-down

REPEAT SEMANTICS:

Use kind "segment" for a normal continuous block.

Use kind "repeat" for repeated work.

For a normal segment:
- repeatCount = 1
- recovery fields normally = null

For repeated work:
- repeatCount = number of WORK repetitions
- recoveryDurationSeconds / recoveryDistanceMeters describe
  recovery BETWEEN repetitions
- normally there are repeatCount - 1 recoveries
- do not invent recovery after the final repetition

Example:

4 x 6 min threshold
4 min very easy between repetitions

must use:

kind = "repeat"
phase = "Main"
repeatCount = 4
workDurationSeconds = 360
recoveryDurationSeconds = 240

Intensity and instructions:
- workIntensity should be concise, e.g. "RPE 7-8 · Threshold"
- workInstruction contains useful execution cues
- recoveryIntensity should clearly describe recovery effort
- recoveryInstruction contains recovery-specific cues
- do not invent FTP, CSS, pace or HR values that are unavailable

For swimming:
- structure distance-based swimming primarily by DISTANCE
- use separate blocks for warm-up, drills/technique, main set and cool-down where appropriate
- repeated swim work must use kind "repeat"
- use workDistanceMeters for EACH repetition
- use recoveryDurationSeconds for timed rest between repetitions
- use recoveryDistanceMeters only when recovery itself is a prescribed swimming distance
- do not turn a clear 8 x 100 m set into one vague 800 m Main block
- do not create eight separate blocks when one repeat block can represent 8 x 100 m
- example: 8 x 100 m aerobic with 20 s rest =
  sport "Swim",
  kind "repeat",
  phase "Main",
  repeatCount 8,
  workDistanceMeters 100,
  recoveryDurationSeconds 20
- drills and technique that form part of the training stimulus use phase "Main"
- warm-up is only preparation at the beginning
- cool-down is only the actual final easy finish
- keep swim structure grouped and readable

For Strength:

strengthStructure MUST contain the complete prescription.

Every exercise must include:
- exerciseKey
- exact exercise name
- movementPattern
- working sets
- repetitions
- loadGuidance using RPE / RIR when appropriate
- exact restSeconds
- one short execution instruction
- practical same-pattern alternatives

Strength programming must follow the supplied TriCoach
Strength Engine guidance.

Important:
- exerciseKey is the stable canonical identity of the exercise
- choose the most specific matching exerciseKey from the schema
- naming variants of the same exercise must share the same exerciseKey
- use "other" only when none of the canonical keys genuinely matches
- do not map an exercise to a merely similar but incorrect canonical key
- do not invent kilogram loads or 1RM values
- do not routinely train to failure
- preserve approximately 2-3 RIR on important strength work when appropriate
- use sufficient rest to preserve force quality
- do not create bodybuilding-style volume
- do not turn strength into metabolic circuit training
- account for surrounding run, bike and brick stress
- reduce accessory volume before sacrificing useful primary strength work when endurance load rises
- avoid novel high-soreness exercises in Peak / Taper
- power work, when justified, belongs early and uses low repetitions with full quality

For bricks:
- clearly separate the bike and run components

For sufficiently long sessions:
- mention fueling / hydration practice when useful

Do not include fake precision.
Do not invent threshold pace, FTP, CSS or heart-rate zones the athlete has not supplied.

Your output must follow the JSON schema exactly.
        `,

        input:
          "Review the athlete's completed week and build the next training week.",

        text: {
          format: {
            type: "json_schema",
            name: "tricoach_week_transition",
            strict: true,

            schema: {
              type: "object",
              additionalProperties: false,

              properties: {
                review: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    headline: {
                      type: "string",
                    },

                    summary: {
                      type: "string",
                    },

                    completedSessions: {
                      type: "number",
                    },

                    skippedSessions: {
                      type: "number",
                    },

                    averageRpe: {
                      anyOf: [
                        {
                          type: "number",
                        },
                        {
                          type: "null",
                        },
                      ],
                    },

                    loadDecision: {
                      type: "string",
                      enum: [
                        "Increase slightly",
                        "Maintain",
                        "Reduce",
                      ],
                    },

                    positives: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },

                    concerns: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },

                    nextWeekFocus: {
                      type: "string",
                    },
                  },

                  required: [
                    "headline",
                    "summary",
                    "completedSessions",
                    "skippedSessions",
                    "averageRpe",
                    "loadDecision",
                    "positives",
                    "concerns",
                    "nextWeekFocus",
                  ],
                },

                nextPlan: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    summary: {
                      type: "string",
                    },

                    totalHours: {
                      type: "number",
                    },

                    focus: {
                      type: "string",
                    },

                    days: {
                      type: "array",
                      minItems: 7,
                      maxItems: 7,

                      items: {
                        type: "object",
                        additionalProperties: false,

                        properties: {
                          day: {
                            type: "string",
                            enum: [
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ],
                          },

                          sport: {
                            type: "string",
                            enum: [
                              "Swim",
                              "Bike",
                              "Run",
                              "Strength",
                              "Rest",
                            ],
                          },

                          title: {
                            type: "string",
                          },

                          durationMinutes: {
                            type: "number",
                          },

                          intensity: {
                            type: "string",
                          },

                          purpose: {
                            type: "string",
                          },

                          details: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },

                          workoutStructure: {
                            type: "array",

                            items: {
                              type: "object",
                              additionalProperties: false,

                              properties: {
                                sport: {
                                  type: "string",
                                  enum: [
                                    "Swim",
                                    "Bike",
                                    "Run",
                                    "Strength",
                                  ],
                                },

                                kind: {
                                  type: "string",
                                  enum: [
                                    "segment",
                                    "repeat",
                                  ],
                                },

                                phase: {
                                  type: "string",
                                  enum: [
                                    "Warm-up",
                                    "Main",
                                    "Recovery",
                                    "Cool-down",
                                  ],
                                },

                                label: {
                                  type: "string",
                                },

                                repeatCount: {
                                  type: "number",
                                },

                                workDurationSeconds: {
                                  type: [
                                    "number",
                                    "null",
                                  ],
                                },

                                workDistanceMeters: {
                                  type: [
                                    "number",
                                    "null",
                                  ],
                                },

                                workIntensity: {
                                  type: "string",
                                },

                                workInstruction: {
                                  type: "string",
                                },

                                recoveryDurationSeconds: {
                                  type: [
                                    "number",
                                    "null",
                                  ],
                                },

                                recoveryDistanceMeters: {
                                  type: [
                                    "number",
                                    "null",
                                  ],
                                },

                                recoveryIntensity: {
                                  type: [
                                    "string",
                                    "null",
                                  ],
                                },

                                recoveryInstruction: {
                                  type: [
                                    "string",
                                    "null",
                                  ],
                                },
                              },

                              required: [
                                "sport",
                                "kind",
                                "phase",
                                "label",
                                "repeatCount",
                                "workDurationSeconds",
                                "workDistanceMeters",
                                "workIntensity",
                                "workInstruction",
                                "recoveryDurationSeconds",
                                "recoveryDistanceMeters",
                                "recoveryIntensity",
                                "recoveryInstruction",
                              ],
                            },
                          },

                          strengthStructure:
                            nextWeekStrengthStructureSchema,

                        },

                        required: [
                          "day",
                          "sport",
                          "title",
                          "durationMinutes",
                          "intensity",
                          "purpose",
                          "details",
                          "workoutStructure",
                          "strengthStructure",
                        ],
                      },
                    },


                  additionalSessions: {
                    type: "array",
                    maxItems: 4,

                    items: {
                      type: "object",
                      additionalProperties: false,

                      properties: {

                        day: {
                          type: "string",
                          enum: [
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ],
                        },

                        sport: {
                          type: "string",
                          enum: [
                            "Swim",
                            "Bike",
                            "Run",
                            "Strength",
                          ],
                        },

                        title: {
                          type: "string",
                        },

                        durationMinutes: {
                          type: "number",
                        },

                        intensity: {
                          type: "string",
                        },

                        purpose: {
                          type: "string",
                        },

                        details: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },

                        workoutStructure: {
                          type: "array",

                          items: {
                            type: "object",
                            additionalProperties: false,

                            properties: {
                              sport: {
                                type: "string",
                                enum: [
                                  "Swim",
                                  "Bike",
                                  "Run",
                                  "Strength",
                                ],
                              },

                              kind: {
                                type: "string",
                                enum: [
                                  "segment",
                                  "repeat",
                                ],
                              },

                              phase: {
                                type: "string",
                                enum: [
                                  "Warm-up",
                                  "Main",
                                  "Recovery",
                                  "Cool-down",
                                ],
                              },

                              label: {
                                type: "string",
                              },

                              repeatCount: {
                                type: "number",
                              },

                              workDurationSeconds: {
                                type: [
                                  "number",
                                  "null",
                                ],
                              },

                              workDistanceMeters: {
                                type: [
                                  "number",
                                  "null",
                                ],
                              },

                              workIntensity: {
                                type: "string",
                              },

                              workInstruction: {
                                type: "string",
                              },

                              recoveryDurationSeconds: {
                                type: [
                                  "number",
                                  "null",
                                ],
                              },

                              recoveryDistanceMeters: {
                                type: [
                                  "number",
                                  "null",
                                ],
                              },

                              recoveryIntensity: {
                                type: [
                                  "string",
                                  "null",
                                ],
                              },

                              recoveryInstruction: {
                                type: [
                                  "string",
                                  "null",
                                ],
                              },
                            },

                            required: [
                              "sport",
                              "kind",
                              "phase",
                              "label",
                              "repeatCount",
                              "workDurationSeconds",
                              "workDistanceMeters",
                              "workIntensity",
                              "workInstruction",
                              "recoveryDurationSeconds",
                              "recoveryDistanceMeters",
                              "recoveryIntensity",
                              "recoveryInstruction",
                            ],
                          },
                        },

                        strengthStructure:
                          nextWeekStrengthStructureSchema,

                        sessionSource: {
                          type: "string",
                          enum: [
                            "coach",
                          ],
                        },

                        sessionRole: {
                          type: "string",
                          enum: [
                            "secondary",
                          ],
                        },

                        sessionSlot: {
                          type: "string",
                          enum: [
                            "AM",
                            "PM",
                            "Flexible",
                          ],
                        },
                      },

                      required: [
                        "day",
                        "sport",
                        "title",
                        "durationMinutes",
                        "intensity",
                        "purpose",
                        "details",
                        "workoutStructure",
                        "strengthStructure",
                        "sessionSource",
                        "sessionRole",
                        "sessionSlot",
                      ],
                    },
                  },


                  },
                required: [
                  "summary",
                  "totalHours",
                  "focus",
                  "days",
                  "additionalSessions",
                ],
              },
                },

              required: [
                "review",
                "nextPlan",
              ],
            },
          },
        },
      });

    let result;

    let generatedCanonicalErrors:
      string[] = [];


    try {
      result = JSON.parse(
        response.output_text
      );


      if (
        result.nextPlan
      ) {
        result.nextPlan =
          applyBenchmarkPrescriptionToPlan(
            result.nextPlan,
            athlete
          );


        result.nextPlan =
          normalizeCoachGeneratedPlan(
            result.nextPlan
          );


        const prepared =
          prepareGeneratedNextWeekPlan({
            plan:
              result.nextPlan,

            weekStart:
              nextWeekStart,
          });


        result.nextPlan =
          prepared.plan;


        generatedCanonicalErrors =
          prepared.canonical.errors;
      }
    } catch {
      console.error(
        "Invalid next-week JSON:",
        response.output_text
      );

      return NextResponse.json(
        {
          error:
            "TriCoach returned invalid weekly data",
        },
        { status: 500 }
      );
    }

    if (
      raceIsNextWeek &&
      athlete?.raceDate
    ) {
      result.nextPlan =
        applyTargetRaceWeekSpecialStates({
          plan:
            result.nextPlan,

          raceDate:
            athlete.raceDate,

          raceName:
            athlete.targetRace?.name ||
            "Target race",

          raceFormat:
            athlete.targetRace?.format,
        });
    }


    const generatedRaceStateCheck =
      athlete?.raceDate
        ? validateTargetRaceWeekSpecialStates({
            plan:
              result.nextPlan,

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


    const generatedAvailabilityCheck =
      validateFinalNextWeekAvailability({
        plan:
          result.nextPlan,

        athlete,

        availability:
          trainingAvailability,
      });


    const disciplineLoad =
      buildDisciplineLoadState({
        proposedPlan:
          result.nextPlan,

        trainingArchive,
      });


    const largeRunIncrease =
      disciplineLoad
        .disciplines
        .Run
        .status ===
          "Large increase" &&
      disciplineLoad
        .disciplines
        .Run
        .confidence !==
          "Low";


    const benchmarkUsageAudit =
      auditBenchmarkUsage({
        plan:
          result.nextPlan,

        benchmarks:
          athlete?.benchmarks,
      });


    const planAudit =
      auditTrainingPlan({
        plan: result.nextPlan,
        athlete,
        phase: trainingPhase,

        previousPlan:
          currentPlan,

        recommendedHoursMin:
          raceIsNextWeek
            ? null
            : coachingSignals
                .recommendedHoursMin,

        recommendedHoursMax:
          coachingSignals
            .recommendedHoursMax,
      });


    if (
      generatedCanonicalErrors.length >
      0
    ) {

      planAudit.errors.push(
        ...generatedCanonicalErrors.map(
          (error) =>
            `Canonical workout error: ${error}`
        )
      );

      planAudit.valid =
        false;
    }


    if (
      !generatedRaceStateCheck.valid
    ) {
      planAudit.errors.push(
        ...generatedRaceStateCheck
          .errors
          .map(
            (error) =>
              `Race-week state error: ${error}`
          )
      );

      planAudit.valid =
        false;
    }


    if (
      !generatedAvailabilityCheck.valid
    ) {

      planAudit.errors.push(
        ...generatedAvailabilityCheck
          .violations
          .map(
            (violation) =>
              `Availability conflict: ${JSON.stringify(
                violation
              )}`
          )
      );

      planAudit.valid =
        false;
    }


    if (
      benchmarkUsageAudit
        .errors
        .length > 0
    ) {
      planAudit.errors.push(
        ...benchmarkUsageAudit.errors
      );

      planAudit.valid = false;
    }


    if (
      benchmarkUsageAudit
        .warnings
        .length > 0
    ) {
      planAudit.warnings.push(
        ...benchmarkUsageAudit.warnings
      );
    }


    if (
      disciplineLoad
        .warnings
        .length > 0
    ) {
      planAudit.warnings.push(
        ...disciplineLoad.warnings
      );
    }


    if (
      largeRunIncrease &&
      coachingSignals.loadDecision !==
        "Increase slightly"
    ) {
      planAudit.errors.push(
        "Proposed running volume is a large increase relative to the athlete's recent run history, while the overall load decision does not support progression."
      );

      planAudit.valid = false;
    }


    if (!planAudit.valid) {

      /*
        FAST LOCAL MICRO-REPAIR

        A generated week may occasionally miss the minimum
        volume by only a few minutes.

        That is not a good reason to spend another full AI
        generation cycle redesigning an otherwise valid week.

        Only attempt this when:
        - every ERROR is purely "volume below minimum"
        - the shortfall is small
        - a Bike or Swim session has safe duration headroom

        The repaired plan is re-audited immediately.
        If it still fails, the normal AI repair engine remains
        the fallback.
      */
      const volumeOnlyFailure =
        planAudit.errors.length > 0 &&
        planAudit.errors.every(
          (error) =>
            error.startsWith(
              "Plan volume "
            ) &&
            error.includes(
              "below the allowed"
            )
        );


      const allPlanSessions = [
        ...result.nextPlan.days,

        ...(
          result.nextPlan
            .additionalSessions ??
          []
        ),
      ];


      const currentMinutes =
        allPlanSessions.reduce(
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
                    session
                      .durationMinutes
                  ) || 0
            ),
          0
        );


      const targetMinMinutes =
        Math.ceil(
          coachingSignals
            .recommendedHoursMin *
          60
        );


      const missingMinutes =
        Math.max(
          0,
          targetMinMinutes -
          currentMinutes
        );


      /*
        A modest pure-volume shortfall can be repaired
        deterministically without asking the model to
        redesign an otherwise acceptable week.

        Allow up to 60 minutes OR 5% of the current week,
        whichever is larger.

        The repair helper is shared with the permanent
        regression test so production and test behavior
        cannot silently drift apart.
      */
      const localRepairLimitMinutes =
        Math.max(
          60,
          Math.ceil(
            currentMinutes *
            0.05
          )
        );


      const canTryLocalVolumeRepair =
        !raceIsNextWeek &&
        volumeOnlyFailure &&
        missingMinutes > 0 &&
        missingMinutes <=
          localRepairLimitMinutes;


      let localRepairSucceeded =
        false;


      if (
        canTryLocalVolumeRepair
      ) {

        const localRepair =
          repairNextWeekVolumeShortfall({
            plan:
              result.nextPlan,

            missingMinutes,

            longestSessionMinutes:
              athlete
                ?.longestSessionMinutes,
          });


        if (
          localRepair.fullyApplied &&
          localRepair
            .appliedRepairs
            .length > 0
        ) {

          const preparedLocalRepair =
            prepareGeneratedNextWeekPlan({
              plan:
                localRepair.plan,

              weekStart:
                nextWeekStart,
            });


          const localRepairAudit =
            auditTrainingPlan({
              plan:
                preparedLocalRepair.plan,

              athlete,

              phase:
                trainingPhase,

              previousPlan:
                currentPlan,

              recommendedHoursMin:
                raceIsNextWeek
                  ? null
                  : coachingSignals
                      .recommendedHoursMin,

              recommendedHoursMax:
                coachingSignals
                  .recommendedHoursMax,
            });


          if (
            !preparedLocalRepair
              .canonical
              .valid
          ) {

            localRepairAudit.errors.push(
              ...preparedLocalRepair
                .canonical
                .errors
                .map(
                  (error) =>
                    `Canonical workout error: ${error}`
                )
            );

            localRepairAudit.valid =
              false;
          }


          const localAvailabilityCheck =
            validateFinalNextWeekAvailability({
              plan:
                preparedLocalRepair.plan,

              athlete,

              availability:
                trainingAvailability,
            });


          if (
            !localAvailabilityCheck.valid
          ) {

            localRepairAudit.errors.push(
              ...localAvailabilityCheck
                .violations
                .map(
                  (violation) =>
                    `Availability conflict: ${JSON.stringify(
                      violation
                    )}`
                )
            );

            localRepairAudit.valid =
              false;
          }


          if (
            localRepairAudit.valid
          ) {

            result.nextPlan =
              preparedLocalRepair.plan;

            localRepairSucceeded =
              true;


            console.info(
              "TriCoach locally repaired a small weekly-volume shortfall.",
              {
                addedMinutes:
                  missingMinutes,

                repairs:
                  localRepair
                    .appliedRepairs,

                finalHours:
                  localRepair
                    .plan
                    .totalHours,

                warnings:
                  localRepairAudit
                    .warnings,
              }
            );

          } else {

            console.info(
              "Local volume micro-repair was insufficient. Falling back to AI repair.",
              {
                addedMinutes:
                  missingMinutes,

                repairs:
                  localRepair
                    .appliedRepairs,

                audit:
                  localRepairAudit,
              }
            );

          }

        }

      }


      if (
        !localRepairSucceeded
      ) {

        console.warn(
          "Initial TriCoach plan failed quality audit. Attempting automatic repair.",
          planAudit
        );


        const repairResponse =
          await openai.responses.create({
          model: "gpt-5.6-luna",

          instructions: `
You are the quality-control repair engine for TriCoach.

A weekly triathlon training plan has already been generated,
but deterministic quality checks found problems.

Your job is NOT to redesign the week creatively.

Your job is to make the SMALLEST changes necessary
to correct the identified problems while preserving:

- the intended focus of the week
- the athlete's training phase
- important discipline frequency
- key sessions where safe
- recovery structure
- athlete availability
- equipment limitations
- the deterministic training-load envelope

ATHLETE:
${JSON.stringify(athlete, null, 2)}

UNIT SYSTEM:
${athlete?.unitSystem || "Metric"}

UNIT RULE:
Preserve the athlete's selected Metric/Imperial convention
in all athlete-facing workout text.

TRAINING PHASE:
${trainingPhase}

DETERMINISTIC COACHING SIGNALS:
${JSON.stringify(
  coachingSignals,
  null,
  2
)}

ALLOWED WEEKLY HOURS:
${coachingSignals.recommendedHoursMin}
to
${coachingSignals.recommendedHoursMax}

PLAN THAT FAILED:
${JSON.stringify(
  result.nextPlan,
  null,
  2
)}

QUALITY AUDIT ERRORS:
${JSON.stringify(
  planAudit.errors,
  null,
  2
)}

DISCIPLINE-SPECIFIC LOAD ANALYSIS:
${JSON.stringify(
  disciplineLoad,
  null,
  2
)}

BENCHMARK USAGE AUDIT:
${JSON.stringify(
  benchmarkUsageAudit,
  null,
  2
)}

BENCHMARK REPAIR RULES:
- Remove numerical watt targets if no valid FTP exists.
- Remove /100 m pace targets if no valid CSS exists.
- Remove threshold run pace targets if no valid threshold pace exists.
- Replace invalid numerical targets with RPE and simple execution guidance.
- Do not invent replacement benchmark values.
- Prefer ranges over falsely precise single-number targets when valid benchmarks do exist.

QUALITY AUDIT WARNINGS:
${JSON.stringify(
  planAudit.warnings,
  null,
  2
)}

REPAIR RULES:

1. Fix every audit ERROR.

2. Consider WARNINGS carefully, but do not blindly change
   the plan merely to remove every warning.

3. Make the smallest useful changes.

4. Do not increase total training load merely to solve
   an unrelated warning. HOWEVER, when the deterministic
   audit error explicitly says weekly volume is below the
   allowed minimum, increasing safe easy duration enough
   to reach that minimum is REQUIRED.

5. Do not stack demanding sessions.

6. Do not convert recovery days into unnecessary training.

7. Preserve the week's intended training stimulus.

8. Respect the athlete's maximum realistic session duration.

9. Respect equipment access.

10. Do not introduce catch-up training.

11. Keep exactly Monday through Sunday.

12. Recalculate totalHours from ALL repaired primary and secondary session durations.

13. totalHours MUST remain between:
${coachingSignals.recommendedHoursMin}
and
${coachingSignals.recommendedHoursMax}

14. If the phase is Taper, do not restore volume simply
because the previous plan contained more training.

15. Prefer reducing or moving problematic intensity over
adding additional intensity.

16. Preserve the relevant canonical structure for every
workout unless the workout itself must change.

17. Every repaired session must return BOTH workoutStructure
and strengthStructure.

18. For Swim, Bike and Run:
- workoutStructure is the source of truth
- strengthStructure must be null
- if the workout changes, update workoutStructure so it exactly
  matches the repaired prescription

19. For Strength:
- strengthStructure is the source of truth
- workoutStructure must be []
- strengthStructure must contain the complete exercises,
  sets, reps, loading guidance and rest
- if the workout changes, update strengthStructure so it exactly
  matches the repaired prescription

20. For Rest:
- workoutStructure must be []
- strengthStructure must be null

21. details must describe the SAME workout as the relevant
canonical structure.

22. For endurance workoutStructure use seconds for time and
metres for distance.

23. Endurance phases may only be:
Warm-up, Main, Recovery, Cool-down.

24. Phase describes FUNCTION, not intensity.
An easy aerobic training block that belongs to the main
stimulus must remain Main.
Cool-down is only the actual final finishing block.

25. Repeat recovery belongs BETWEEN repetitions.
Do not add a recovery after the final repetition.

26. When repairing Strength:
- preserve useful heavy strength where possible
- reduce accessory volume first when fatigue must be lowered
- do not add failure training
- do not invent kilogram loads
- do not introduce unnecessary novel exercises
- protect important endurance sessions from residual strength fatigue

STRENGTH REPAIR OUTPUT:

When sport is Strength, workoutStructure must be [] and
strengthStructure must use this shape:

{
  "goal": "Adaptation | MaxStrength | StrengthPower | Maintenance | Taper",
  "warmup": ["short preparation instruction"],
  "exercises": [
    {
      "name": "Back squat",
      "movementPattern": "Squat",
      "sets": 3,
      "reps": "4-6",
      "loadGuidance": "RPE 7-8 · 2-3 RIR",
      "restSeconds": 150,
      "instruction": "Controlled descent, drive up strongly.",
      "alternatives": ["Leg press"]
    }
  ]
}

For non-Strength sessions, strengthStructure must be null.

Return ONLY the repaired nextPlan JSON object.

Use exactly this structure:

{
  "summary": "string",
  "totalHours": 0,
  "focus": "string",
  "days": [
    {
      "day": "Monday",
      "sport": "Swim | Bike | Run | Strength | Rest",
      "title": "string",
      "durationMinutes": 0,
      "intensity": "string",
      "purpose": "string",
      "details": ["string"],
      "workoutStructure": [
        {
          "kind": "segment | repeat",
          "phase": "Warm-up | Main | Recovery | Cool-down",
          "label": "string",
          "repeatCount": 1,
          "workDurationSeconds": null,
          "workDistanceMeters": null,
          "workIntensity": "string",
          "workInstruction": "string",
          "recoveryDurationSeconds": null,
          "recoveryDistanceMeters": null,
          "recoveryIntensity": null,
          "recoveryInstruction": null
        }
      ],
      "strengthStructure": null
    }
  ],
  "additionalSessions": []
}

No markdown.
No explanation.
No text before or after the JSON.
          `,

          input:
            "Repair the training week using the audit findings.",
        });


      let repairedPlan;

      let repairedCanonicalErrors:
        string[] = [];


      try {
        repairedPlan =
          normalizeCoachGeneratedPlan(
            JSON.parse(
              repairResponse.output_text
            )
          );


        const preparedRepair =
          prepareGeneratedNextWeekPlan({
            plan:
              repairedPlan,

            weekStart:
              nextWeekStart,
          });


        repairedPlan =
          preparedRepair.plan;


        repairedCanonicalErrors =
          preparedRepair
            .canonical
            .errors;

      } catch {
        console.error(
          "TriCoach repair engine returned invalid JSON:",
          repairResponse.output_text
        );

        return NextResponse.json(
          {
            error:
              "TriCoach could not safely repair the generated training week.",
          },
          {
            status: 422,
          }
        );
      }


      if (
        raceIsNextWeek &&
        athlete?.raceDate
      ) {
        repairedPlan =
          applyTargetRaceWeekSpecialStates({
            plan:
              repairedPlan,

            raceDate:
              athlete.raceDate,

            raceName:
              athlete.targetRace?.name ||
              "Target race",

            raceFormat:
              athlete.targetRace?.format,
          });
      }


      const repairedRaceStateCheck =
        athlete?.raceDate
          ? validateTargetRaceWeekSpecialStates({
              plan:
                repairedPlan,

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


      const repairedAvailabilityCheck =
        validateFinalNextWeekAvailability({
          plan:
            repairedPlan,

          athlete,

          availability:
            trainingAvailability,
        });


      const repairedAudit =
        auditTrainingPlan({
          plan:
            repairedPlan,

          athlete,

          phase:
            trainingPhase,

          previousPlan:
            currentPlan,

          recommendedHoursMin:
            raceIsNextWeek
              ? null
              : coachingSignals
                  .recommendedHoursMin,

          recommendedHoursMax:
            coachingSignals
              .recommendedHoursMax,
        });


      if (
        repairedCanonicalErrors.length >
        0
      ) {

        repairedAudit.errors.push(
          ...repairedCanonicalErrors.map(
            (error) =>
              `Canonical workout error: ${error}`
          )
        );

        repairedAudit.valid =
          false;
      }


      if (
        !repairedRaceStateCheck.valid
      ) {
        repairedAudit.errors.push(
          ...repairedRaceStateCheck
            .errors
            .map(
              (error) =>
                `Race-week state error: ${error}`
            )
        );

        repairedAudit.valid =
          false;
      }


      if (
        !repairedAvailabilityCheck.valid
      ) {

        repairedAudit.errors.push(
          ...repairedAvailabilityCheck
            .violations
            .map(
              (violation) =>
                `Availability conflict: ${JSON.stringify(
                  violation
                )}`
            )
        );

        repairedAudit.valid =
          false;
      }


      if (!repairedAudit.valid) {
        console.error(
          "TriCoach automatic repair also failed quality audit:",
          repairedAudit
        );

        return NextResponse.json(
          {
            error:
              "TriCoach could not create a training week that passed its safety checks.",

            audit:
              repairedAudit,
          },
          {
            status: 422,
          }
        );
      }


      console.info(
        "TriCoach automatically repaired the generated week.",
        {
          originalErrors:
            planAudit.errors,

          remainingWarnings:
            repairedAudit.warnings,
        }
      );


      result.nextPlan =
        repairedPlan;


        if (
          repairedAudit.warnings.length > 0
        ) {
          console.warn(
            "Repaired TriCoach plan quality warnings:",
            repairedAudit.warnings
          );
        }

      }

    } else if (
      planAudit.warnings.length > 0
    ) {
      console.warn(
        "TriCoach plan quality warnings:",
        planAudit.warnings
      );
    }


    /*
      Final server-side hard wall.

      All accepted code paths above already validate
      availability. Keep one final defense here so a future
      refactor cannot accidentally return an invalid dated
      plan without failing closed.
    */
    const finalAvailabilityCheck =
      validateFinalNextWeekAvailability({
        plan:
          result.nextPlan,

        athlete,

        availability:
          trainingAvailability,
      });


    if (
      !finalAvailabilityCheck.valid
    ) {

      console.error(
        "Final Next Week availability wall failed:",
        finalAvailabilityCheck
      );


      return NextResponse.json(
        {
          error:
            "TriCoach could not create a training week that respects Calendar availability.",

          availability:
            finalAvailabilityCheck
              .violations,
        },
        {
          status:
            422,
        }
      );
    }


    /*
      The model owns the qualitative review text.

      These factual fields are authoritative app data and
      must never depend on model arithmetic or interpretation.
    */
    result.review.completedSessions =
      currentWeekCompletedFeedback.length;

    result.review.skippedSessions =
      currentWeekSkippedFeedback.length;

    result.review.averageRpe =
      currentWeekAverageRpe;

    result.review.loadDecision =
      coachingSignals.loadDecision;


    result.review.coachingDecision =
      coachingSignals;

    result.review.decisionTrace =
      decisionTrace;

    return NextResponse.json({
      review: result.review,
      nextPlan: result.nextPlan,
    });

  } catch (error) {
    console.error(
      "TriCoach next-week API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not review and generate next week",
      },
      { status: 500 }
    );
  }
}
