import type {
  Athlete,
  TrainingPlan,
} from "@/types/training";


import {
  isDemandingSession,
} from "@/lib/session-classification";

export {
  isDemandingSession,
};


export function getMultiSessionPlanningProfile({
  experience,
  weeklyHours,
}: {
  experience?:
    | string
    | null;

  weeklyHours?:
    | number
    | null;
}) {

  const normalizedExperience =
    String(
      experience ?? ""
    ).toLowerCase();

  const hours =
    Number.isFinite(
      Number(weeklyHours)
    )
      ? Math.max(
          0,
          Number(weeklyHours)
        )
      : 0;

  /*
    These are NORMAL planning ranges,
    not destructive hard caps.

    The purpose is to distribute load naturally
    as weekly volume rises.
  */
  let normalAdditionalMin = 0;
  let normalAdditionalMax = 1;

  if (hours >= 7) {
    normalAdditionalMax = 2;
  }

  if (hours >= 10) {
    normalAdditionalMin = 1;
    normalAdditionalMax = 3;
  }

  if (hours >= 13) {
    normalAdditionalMin = 2;
    normalAdditionalMax = 5;
  }

  if (hours >= 16) {
    normalAdditionalMin = 3;
    normalAdditionalMax = 6;
  }

  if (hours >= 19) {
    normalAdditionalMin = 4;
    normalAdditionalMax = 8;
  }

  const developing =
    normalizedExperience.includes(
      "beginner"
    ) ||
    normalizedExperience.includes(
      "develop"
    ) ||
    normalizedExperience.includes(
      "recreational"
    );

  return {
    weeklyHours:
      hours,

    normalAdditionalMin,

    normalAdditionalMax,

    maxSessionsPerDay:
      3,

    maxAdditionalPerDay:
      2,

    developing,
  };
}


export function buildMultiSessionPlanningGuidance({
  athlete,
  firstWeek = false,
}: {
  athlete:
    | Athlete
    | null
    | undefined;

  firstWeek?: boolean;
}) {

  const experience =
    athlete?.experience ??
    "Beginner";


  const currentHours =
    Number(
      athlete?.currentTrainingHours ??
      0
    );

  const multiSessionProfile =
    getMultiSessionPlanningProfile({
      experience,
      weeklyHours:
        currentHours,
    });


  return `
MULTI-SESSION TRAINING POLICY

Athlete experience:
${experience}

Current training:
${currentHours || "Unknown"} hours/week


PURPOSE

Double-session days exist to distribute appropriate
training load and improve useful training frequency.

They are NOT used simply because an athlete is advanced.

More training frequency should primarily come from
easy aerobic or technical work, not extra intensity.


GENERAL RULES

- Maximum THREE structured sessions per calendar day.

- A day may therefore contain:
  one primary workout
  plus up to two additional workouts.

- Normally schedule no more than ONE genuinely demanding
  endurance session on the same calendar day.

- Additional sessions are primarily a way to distribute
  appropriate volume and frequency.

- They should commonly be:
  easy aerobic,
  technical,
  recovery-compatible,
  swimming,
  or appropriately placed strength.

- An additional session MAY contain quality work when it is
  the day's single purposeful demanding session.

- Do not classify every second workout as easy merely because
  it is stored in additionalSessions.

- Never add sessions simply to fill available hours.

- Never use doubles to compensate for previously missed work.

- No coach-added training on:
  Race days,
  Post-race recovery days,
  or genuine planned full-rest days.

- A brick is normally ONE connected key workout when the run
  immediately follows the bike as part of the same purpose.

- Separate AM / PM sessions should remain separate workouts
  when they have distinct purposes.

- totalHours includes ALL actual training sessions.


VOLUME-AWARE FREQUENCY

Current reference volume:
${multiSessionProfile.weeklyHours || "Unknown"} hours/week.

Normal additional-session range at this volume:
${multiSessionProfile.normalAdditionalMin}
to
${multiSessionProfile.normalAdditionalMax}
additional sessions per full week.

This is a PLANNING RANGE, not a destructive quota.

Do not create doubles merely to reach the upper number.
Do not remove useful sessions merely because the range is exceeded
when the athlete's history, schedule and recovery clearly support them.

LOWER-VOLUME ATHLETES

At lower weekly volume:
- prefer one purposeful workout at a time
- introduce doubles only when they improve frequency,
  practicality or technical development
- swim + easy endurance is often the safest introduction

DEVELOPING ATHLETES

Developing athletes are NOT absolutely forbidden from doubles.

Use them conservatively and only when current training history
supports the frequency.

A short technique swim plus easy cycling can be more appropriate
than creating one disproportionately long session.

HIGH-VOLUME ATHLETES

Around 13+ hours/week:
- doubles increasingly become a normal load-distribution tool
- avoid achieving the entire volume through seven oversized sessions

Around 16+ hours/week:
- regular doubles are often appropriate
- swimming is particularly useful for frequency
- easy cycling can distribute aerobic load
- running doubles remain more conservative

Around 19+ hours/week:
- frequent doubles may be appropriate
- occasional three-session days are allowed when purposeful
- a three-session day should normally contain no more than
  one demanding endurance workout
- the other sessions should usually be easy, technical,
  recovery-compatible or strength placed sensibly

Experience affects HOW doubles are used,
but weekly load and actual training history matter more than
a simple Beginner / Intermediate / Experienced label.


SWIMMING

Swimming is generally well suited to increased frequency,
especially for technical development.

Additional swimming should not automatically mean
additional hard swimming.


CYCLING

Easy aerobic cycling can be useful as relatively low-impact
secondary endurance work.

Do not turn the second ride into another quality session.


RUNNING

Secondary running is the most conservative category.

Running has greater mechanical loading than swimming
or cycling.

Do not prescribe run doubles merely to increase kilometres.

Secondary runs should generally be:
short,
easy,
and supported by existing running durability.


STRENGTH

Strength may share a day with endurance training when useful.

Avoid demanding lower-body strength close to an important
hard run.

Use AM / PM slots when separation matters.


OUTPUT

days:
Exactly seven PRIMARY calendar slots Monday-Sunday.

additionalSessions:
Optional SECONDARY sessions.

Every additional session must contain:

sessionSource = "coach"
sessionRole = "secondary"
sessionSlot = "AM" | "PM" | "Flexible"


${firstWeek ? `
FIRST-WEEK CAUTION

This is the athlete's first TriCoach week.

Do not introduce high training frequency simply because
the athlete selected Experienced.

Intermediate athletes should normally have zero secondary
sessions in their first partial week.

Experienced athletes should normally have no more than
1-2 secondary sessions initially unless their CURRENT
training clearly supports higher frequency.
` : ""}
`;
}


function normalizeWorkoutStructureSports(
  workout: TrainingPlan["days"][number]
): NonNullable<
  TrainingPlan["days"][number]["workoutStructure"]
> {

  if (
    workout.sport === "Rest"
  ) {
    return [];
  }


  const structure =
    workout.workoutStructure ?? [];


  return structure.map(
    (block) => {

      /*
        Explicit V2 sport always wins.
      */
      if (
        block.sport === "Swim" ||
        block.sport === "Bike" ||
        block.sport === "Run" ||
        block.sport === "Strength"
      ) {
        return block;
      }


      const blockText =
        [
          block.label,
          block.workIntensity,
          block.workInstruction,
          block.recoveryIntensity,
          block.recoveryInstruction,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


      /*
        Bike -> Run Brick fallback.
      */
      if (
        workout.sport === "Bike" &&
        (
          blockText.includes(
            "transition run"
          ) ||
          /\brun\b/.test(
            blockText
          ) ||
          /\brunning\b/.test(
            blockText
          ) ||
          /\bjog\b/.test(
            blockText
          )
        )
      ) {
        return {
          ...block,
          sport:
            "Run" as const,
        };
      }


      /*
        Normal single-discipline inheritance.

        Narrow explicitly so TS does not widen this to string.
      */
      if (
        workout.sport === "Swim" ||
        workout.sport === "Bike" ||
        workout.sport === "Run" ||
        workout.sport === "Strength"
      ) {
        const inheritedSport:
          "Swim" |
          "Bike" |
          "Run" |
          "Strength" =
            workout.sport;

        return {
          ...block,
          sport:
            inheritedSport,
        };
      }


      return block;
    }
  );
}


export function normalizeCoachGeneratedPlan(
  plan: TrainingPlan
): TrainingPlan {

  const days =
    (
      plan.days ??
      []
    ).map(
      (workout) => ({
        ...workout,

        workoutStructure:
          normalizeWorkoutStructureSports(
            workout
          ),

        sessionSource:
          "coach" as const,

        sessionRole:
          "primary" as const,

        sessionSlot:
          workout.sessionSlot ??
          ("Flexible" as const),
      })
    );


  let additionalSessions =
    (
      plan.additionalSessions ??
      []
    )
      .filter(
        (workout) =>
          workout &&
          workout.sport !==
            "Rest" &&
          Number(
            workout.durationMinutes
          ) > 0
      )
      .map(
        (workout) => ({
          ...workout,

          workoutStructure:
            normalizeWorkoutStructureSports(
              workout
            ),

          sessionSource:
            "coach" as const,

          sessionRole:
            "secondary" as const,

          sessionSlot:
            workout.sessionSlot ===
              "AM" ||
            workout.sessionSlot ===
              "PM"
              ? workout.sessionSlot
              : ("Flexible" as const),
        })
      );


  /*
    Remove structurally unsafe secondary sessions.
  */

  additionalSessions =
    additionalSessions.filter(
      (workout) => {

        const primary =
          days.find(
            (day) =>
              day.day ===
              workout.day
          );


        if (!primary) {
          return false;
        }


        if (
          primary.sport ===
            "Rest" ||
          primary.isRaceDay ||
          primary.isPostRace
        ) {
          return false;
        }


        if (
          isDemandingSession(
            primary
          ) &&
          isDemandingSession(
            workout
          )
        ) {
          return false;
        }


        /*
          Especially conservative:
          hard primary + substantial second run.
        */

        if (
          isDemandingSession(
            primary
          ) &&
          workout.sport ===
            "Run" &&
          workout.durationMinutes >
            35
        ) {
          return false;
        }


        return true;
      }
    );


  /*
    Hard structural safety:
    maximum two additional sessions per day,
    meaning maximum three real workouts total.

    Also keep no more than one demanding endurance
    session on the same calendar day.
  */

  const additionalCountByDay =
    new Map<string, number>();

  const demandingDayUsed =
    new Set<string>(
      days
        .filter(
          (workout) =>
            isDemandingSession(
              workout
            )
        )
        .map(
          (workout) =>
            workout.day
        )
    );

  additionalSessions =
    additionalSessions.filter(
      (workout) => {

        const used =
          additionalCountByDay.get(
            workout.day
          ) ?? 0;

        if (used >= 2) {
          return false;
        }

        if (
          isDemandingSession(
            workout
          ) &&
          demandingDayUsed.has(
            workout.day
          )
        ) {
          return false;
        }

        additionalCountByDay.set(
          workout.day,
          used + 1
        );

        if (
          isDemandingSession(
            workout
          )
        ) {
          demandingDayUsed.add(
            workout.day
          );
        }

        return true;
      }
    );


  const totalMinutes = [
    ...days,
    ...additionalSessions,
  ].reduce(
    (
      sum,
      workout
    ) =>
      sum +
      Math.max(
        0,
        Number(
          workout.durationMinutes
        ) || 0
      ),
    0
  );


  return {
    ...plan,

    days,

    additionalSessions,

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
}
