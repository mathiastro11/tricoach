import type {
  Athlete,
  TrainingAvailability,
} from "@/types/training";

import {
  resolveAvailabilityForDate,
} from "@/lib/training-availability";


export type InitialWeekFeasibilityInput = {
  athlete:
    Pick<
      Athlete,
      | "weeklyAvailability"
      | "availableDays"
      | "longestSessionMinutes"
    >;

  availability:
    TrainingAvailability[];

  todayIso:
    string;
};


export type InitialWeekFeasibility = {
  remainingDates:
    string[];

  feasibleMinutes:
    number;

  feasibleHours:
    number;
};


const MAX_REAL_SESSIONS_PER_DAY =
  3;


function parseIsoDate(
  value:
    string
): Date | null {

  const parsed =
    new Date(
      `${value}T12:00:00`
    );


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }


  return parsed;
}


function toIsoDate(
  date:
    Date
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;
}


function getRemainingDatesThroughSunday(
  todayIso:
    string
): string[] {

  const today =
    parseIsoDate(
      todayIso
    );


  if (!today) {
    return [];
  }


  /*
    JS:
    Sunday = 0
    Monday = 1
    ...
    Saturday = 6

    If today is Sunday, remainingDays = 0,
    so today itself is still included.
  */
  const remainingDays =
    (
      7 -
      today.getDay()
    ) %
    7;


  const dates:
    string[] = [];


  for (
    let offset =
      0;

    offset <=
      remainingDays;

    offset +=
      1
  ) {

    const date =
      new Date(
        today
      );

    date.setDate(
      today.getDate() +
      offset
    );


    dates.push(
      toIsoDate(
        date
      )
    );
  }


  return dates;
}


function getMaxSessionMinutes(
  athlete:
    InitialWeekFeasibilityInput[
      "athlete"
    ]
) {

  const parsed =
    Number(
      athlete.longestSessionMinutes
    );


  if (
    !Number.isFinite(
      parsed
    ) ||
    parsed <= 0
  ) {
    /*
      Do not invent capacity when the athlete's
      maximum realistic session duration is unknown.

      A future minimum-volume rule may therefore
      safely collapse toward zero rather than force
      training that cannot be justified.
    */
    return 0;
  }


  return Math.round(
    parsed
  );
}


/*
  Absolute scheduling feasibility for the REMAINING
  portion of the athlete's first calendar week.

  IMPORTANT:
  This is NOT a target load.

  It answers only:
  "What is the most training that could physically be
   placed while respecting the structured availability
   model and the product's session-count limit?"

  Future minimum-load logic may use this only as a cap.
*/
export function getInitialWeekFeasibleCapacity({
  athlete,
  availability,
  todayIso,
}: InitialWeekFeasibilityInput): InitialWeekFeasibility {

  const remainingDates =
    getRemainingDatesThroughSunday(
      todayIso
    );


  const maxSessionMinutes =
    getMaxSessionMinutes(
      athlete
    );


  if (
    remainingDates.length ===
      0 ||
    maxSessionMinutes <=
      0
  ) {
    return {
      remainingDates,

      feasibleMinutes:
        0,

      feasibleHours:
        0,
    };
  }


  const unrestrictedDailyMinutes =
    maxSessionMinutes *
    MAX_REAL_SESSIONS_PER_DAY;


  const feasibleMinutes =
    remainingDates.reduce(
      (
        total,
        date
      ) => {

        const resolved =
          resolveAvailabilityForDate({
            athlete,
            availability,
            date,
          });


        if (
          resolved.status ===
            "Unavailable" ||
          resolved.allowedSports.length ===
            0
        ) {
          return total;
        }


        /*
          maxDurationMinutes is the TOTAL permitted
          training across the date, not a per-session cap.
        */
        const dailyMinutes =
          typeof resolved
            .maxDurationMinutes ===
              "number" &&
          resolved.maxDurationMinutes >
            0
            ? Math.min(
                unrestrictedDailyMinutes,
                resolved.maxDurationMinutes
              )
            : unrestrictedDailyMinutes;


        return (
          total +
          dailyMinutes
        );
      },
      0
    );


  return {
    remainingDates,

    feasibleMinutes,

    feasibleHours:
      Number(
        (
          feasibleMinutes /
          60
        ).toFixed(
          2
        )
      ),
  };
}


export type InitialWeekMinimumInput = {
  currentTrainingHours:
    number;

  safeInitialHoursMax:
    number;

  feasibility:
    InitialWeekFeasibility;

  todayIso:
    string;

  phase:
    "Base" |
    "Build" |
    "Peak" |
    "Taper";
};


/*
  RED PHASE CONTRACT

  This will become the minimum acceptable planned load
  for the initial calendar week.

  It must:
  - scale with recent tolerated training volume
  - scale down for partial first weeks
  - never exceed the safe initial ceiling
  - never exceed physically feasible capacity
  - never force volume when feasibility is zero
*/
export function getInitialWeekRecommendedHoursMin({
  currentTrainingHours,
  safeInitialHoursMax,
  feasibility,
  phase,
}: InitialWeekMinimumInput): number {

  const recentHours =
    Number(
      currentTrainingHours
    );

  const safeMax =
    Number(
      safeInitialHoursMax
    );

  const feasibleHours =
    Number(
      feasibility.feasibleHours
    );


  if (
    !Number.isFinite(
      recentHours
    ) ||
    recentHours <= 0 ||
    !Number.isFinite(
      safeMax
    ) ||
    safeMax <= 0 ||
    !Number.isFinite(
      feasibleHours
    ) ||
    feasibleHours <= 0 ||
    feasibility.remainingDates.length ===
      0
  ) {
    return 0;
  }


  /*
    Initial plans should not collapse far below an
    athlete's established recent training tolerance.

    The lower envelope is phase-aware:

    Base / Build:
    protect against severe accidental undertraining.

    Peak:
    allow deliberate volume reduction while still
    preventing an implausibly tiny week.

    Taper:
    do NOT force a normal-volume floor. Reduced volume
    is an intentional part of tapering and must remain
    free to fall below ordinary training tolerance.

    These factors are lower safety envelopes only.
    They are NOT desired training targets and NOT
    progression prescriptions.
  */
  const toleranceFloorFactor =
    phase ===
      "Taper"
      ? 0
      : phase ===
          "Peak"
        ? 0.7
        : 0.8;


  const fullWeekToleranceFloor =
    recentHours *
    toleranceFloorFactor;


  /*
    The onboarding week may begin mid-week.

    Never try to "catch up" missed Monday-to-yesterday
    training. Scale the lower envelope only to the
    number of calendar dates that remain in the
    initial week.
  */
  const remainingWeekFraction =
    Math.min(
      1,
      Math.max(
        0,
        feasibility.remainingDates.length /
        7
      )
    );


  const toleranceFloor =
    fullWeekToleranceFloor *
    remainingWeekFraction;


  /*
    The minimum may NEVER demand more than:
    1. the existing safe initial load ceiling, or
    2. the athlete's physically schedulable capacity.

    This makes availability and safety dominant over
    anti-undertraining protection.
  */
  const recommendedMin =
    Math.min(
      toleranceFloor,
      safeMax,
      feasibleHours
    );


  return Number(
    Math.max(
      0,
      recommendedMin
    ).toFixed(
      2
    )
  );
}
