import {
  isDemandingSession,
} from "@/lib/session-classification";

import type {
  TrainingPlan,
} from "@/types/training";

import type {
  CoachingSignals,
} from "@/lib/adaptive-coaching";

import {
  getMultiSessionPlanningProfile,
} from "@/lib/multi-session-planning";

export type PlanValidationIssue = {
  code:
    | "VOLUME_TOO_LOW"
    | "VOLUME_TOO_HIGH"
    | "TOTAL_HOURS_MISMATCH"
    | "INVALID_WEEK_LENGTH"
    | "INVALID_DAY_ORDER"
    | "NEGATIVE_DURATION"
    | "REST_WITH_DURATION"
    | "TOO_MANY_HARD_SESSIONS"
    | "HARD_SESSION_STACKING"
    | "SESSION_TOO_LONG"
    | "TOO_MANY_SESSIONS_IN_DAY"
    | "INVALID_DOUBLE_SESSION";

  severity:
    | "warning"
    | "error";

  message: string;
};

export type PlanValidationResult = {
  valid: boolean;

  issues: PlanValidationIssue[];

  calculatedHours: number;

  allowedHoursMin: number;
  allowedHoursMax: number;

  hardSessionCount: number;
};

type ValidationOptions = {
  athleteLongestSessionMinutes?:
    | number
    | string
    | null;

  athleteExperience?:
    | string
    | null;

  toleranceHours?: number;
};

const WEEK_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function numberOrNull(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export function validateTrainingPlan(
  plan: TrainingPlan,
  signals: CoachingSignals,
  options: ValidationOptions = {}
): PlanValidationResult {

  const issues: PlanValidationIssue[] =
    [];

  const toleranceHours =
    options.toleranceHours ?? 0.15;

  const maxSessionMinutes =
    numberOrNull(
      options.athleteLongestSessionMinutes
    );


  const additionalSessions =
    plan.additionalSessions ??
    [];


  const allSessions = [
    ...plan.days,
    ...additionalSessions,
  ];


  const experience =
    (
      options.athleteExperience ??
      ""
    ).toLowerCase();

  // -----------------------------------------
  // WEEK STRUCTURE
  // -----------------------------------------

  if (plan.days.length !== 7) {
    issues.push({
      code: "INVALID_WEEK_LENGTH",
      severity: "error",
      message:
        `Expected 7 training days but received ${plan.days.length}.`,
    });
  }

  const actualDays =
    plan.days.map(
      (item) =>
        item.day
    );

  const correctOrder =
    WEEK_ORDER.every(
      (day, index) =>
        actualDays[index] === day
    );

  if (!correctOrder) {
    issues.push({
      code: "INVALID_DAY_ORDER",
      severity: "error",
      message:
        "Training week must run Monday through Sunday in order.",
    });
  }

  // -----------------------------------------
  // DURATION SANITY
  // -----------------------------------------

  for (const workout of allSessions) {

    if (
      workout.durationMinutes < 0
    ) {
      issues.push({
        code: "NEGATIVE_DURATION",
        severity: "error",
        message:
          `${workout.day} has a negative duration.`,
      });
    }

    if (
      workout.sport === "Rest" &&
      workout.durationMinutes !== 0
    ) {
      issues.push({
        code: "REST_WITH_DURATION",
        severity: "error",
        message:
          `${workout.day} is Rest but has ${workout.durationMinutes} planned minutes.`,
      });
    }

    if (
      maxSessionMinutes !== null &&
      maxSessionMinutes > 0 &&
      workout.durationMinutes >
        maxSessionMinutes &&
      workout.sport !== "Rest"
    ) {
      issues.push({
        code: "SESSION_TOO_LONG",
        severity: "error",
        message:
          `${workout.day} is ${workout.durationMinutes} minutes, above the athlete's ${maxSessionMinutes}-minute session limit.`,
      });
    }
  }

  // -----------------------------------------
  // ACTUAL PLAN VOLUME
  // -----------------------------------------

  const totalMinutes =
    allSessions.reduce(
      (sum, workout) =>
        sum +
        Math.max(
          0,
          workout.durationMinutes
        ),
      0
    );

  const calculatedHours =
    Number(
      (
        totalMinutes / 60
      ).toFixed(2)
    );

  const reportedHours =
    numberOrNull(
      plan.totalHours
    );

  if (
    reportedHours !== null &&
    Math.abs(
      reportedHours -
      calculatedHours
    ) > toleranceHours
  ) {
    issues.push({
      code:
        "TOTAL_HOURS_MISMATCH",
      severity: "error",
      message:
        `Plan reports ${reportedHours}h but daily sessions total ${calculatedHours}h.`,
    });
  }

  if (
    calculatedHours <
    signals.recommendedHoursMin -
      toleranceHours
  ) {
    issues.push({
      code: "VOLUME_TOO_LOW",
      severity: "error",
      message:
        `Plan volume ${calculatedHours}h is below the allowed minimum ${signals.recommendedHoursMin}h.`,
    });
  }

  if (
    calculatedHours >
    signals.recommendedHoursMax +
      toleranceHours
  ) {
    issues.push({
      code: "VOLUME_TOO_HIGH",
      severity: "error",
      message:
        `Plan volume ${calculatedHours}h exceeds the allowed maximum ${signals.recommendedHoursMax}h.`,
    });
  }

  // -----------------------------------------
  // HARD SESSION DISTRIBUTION
  // -----------------------------------------

  const hardSessions =
    allSessions.filter(
      isDemandingSession
    );


  const hardSessionCount =
    hardSessions.length;


  const hardDayIndices =
    WEEK_ORDER
      .map(
        (
          day,
          index
        ) => ({
          index,

          hard:
            allSessions.some(
              (workout) =>
                workout.day ===
                  day &&
                isDemandingSession(
                  workout
                )
            ),
        })
      )
      .filter(
        (item) =>
          item.hard
      )
      .map(
        (item) =>
          item.index
      );

  // This is deliberately conservative.
  // We can make this athlete-specific later.
  if (hardSessionCount > 3) {
    issues.push({
      code:
        "TOO_MANY_HARD_SESSIONS",
      severity: "error",
      message:
        `Plan contains ${hardSessionCount} demanding sessions. Maximum allowed in this validation layer is 3.`,
    });
  }

  for (
    let i = 1;
    i < hardDayIndices.length;
    i++
  ) {

    const previous =
      hardDayIndices[
        i - 1
      ];


    const current =
      hardDayIndices[
        i
      ];


    if (
      current -
      previous ===
      1
    ) {
      issues.push({
        code:
          "HARD_SESSION_STACKING",

        severity:
          "warning",

        message:
          `${WEEK_ORDER[previous]} and ${WEEK_ORDER[current]} both appear demanding.`,
      });
    }
  }

  // -----------------------------------------
  // MULTI-SESSION SAFETY
  // -----------------------------------------


  const multiSessionProfile =
    getMultiSessionPlanningProfile({
      experience,
      weeklyHours:
        plan.totalHours,
    });

  if (
    additionalSessions.length >
    multiSessionProfile
      .normalAdditionalMax
  ) {
    issues.push({
      code:
        "INVALID_DOUBLE_SESSION",

      severity:
        "warning",

      message:
        `Plan contains ${additionalSessions.length} additional sessions. At ${plan.totalHours.toFixed(1)} h/week, ${multiSessionProfile.normalAdditionalMin}-${multiSessionProfile.normalAdditionalMax} would normally be expected. Confirm that the extra frequency is intentional and well tolerated.`,
    });
  }


  for (
    const day
    of WEEK_ORDER
  ) {

    const activeSessions =
      allSessions.filter(
        (workout) =>
          workout.day ===
            day &&
          workout.sport !==
            "Rest" &&
          workout.durationMinutes >
            0
      );


    if (
      activeSessions.length >
      3
    ) {
      issues.push({
        code:
          "TOO_MANY_SESSIONS_IN_DAY",

        severity:
          "error",

        message:
          `${day} contains ${activeSessions.length} sessions. Maximum is 3.`,
      });
    }


    const hardOnDay =
      activeSessions.filter(
        isDemandingSession
      );


    if (
      hardOnDay.length >
      1
    ) {
      issues.push({
        code:
          "INVALID_DOUBLE_SESSION",

        severity:
          "error",

        message:
          `${day} contains more than one demanding session.`,
      });
    }


    const secondaryOnDay =
      additionalSessions.filter(
        (workout) =>
          workout.day ===
          day
      );


    /*
      Storage role must not determine training quality.

      A secondary workout may be the day's single purposeful
      quality session. Safety is enforced by hardOnDay above:
      there may still be at most one demanding session on
      the calendar day.
    */


    const primary =
      plan.days.find(
        (workout) =>
          workout.day ===
          day
      );


    if (
      primary &&
      (
        primary.sport ===
          "Rest" ||
        primary.isRaceDay ||
        primary.isPostRace
      ) &&
      secondaryOnDay.length >
        0
    ) {
      issues.push({
        code:
          "INVALID_DOUBLE_SESSION",

        severity:
          "error",

        message:
          `${day} cannot contain a secondary session because the primary slot is Rest, race day or post-race.`,
      });
    }
  }


  // -----------------------------------------
  // FINAL RESULT
  // -----------------------------------------

  const hasErrors =
    issues.some(
      (issue) =>
        issue.severity ===
        "error"
    );

  return {
    valid: !hasErrors,

    issues,

    calculatedHours,

    allowedHoursMin:
      signals.recommendedHoursMin,

    allowedHoursMax:
      signals.recommendedHoursMax,

    hardSessionCount,
  };
}
