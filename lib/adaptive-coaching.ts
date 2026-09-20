export type LoadDecision =
  | "Increase slightly"
  | "Maintain"
  | "Reduce";

type Feedback = {
  sessionId?: string;
  status?: string;
  rpe?: number | null;
  feeling?: string | null;
  actualDurationMinutes?: number | null;
  plannedDurationMinutes?: number | null;
};

type Readiness = {
  score?: number;
  status?: string;
  date?: string;
};

type CoachingInput = {
  workoutHistory?: Feedback[];
  readinessHistory?: Readiness[];

  /*
    Physiological load ownership:

    - physiologicalBaselineHours:
      athlete's real current tolerated weekly volume
    - currentPlanHours:
      plan-derived fallback / current formal plan
    - roadmapTargetHours:
      strategic guidance only
    - athleteHours:
      hard availability ceiling
  */
  physiologicalBaselineHours?: number | null;
  currentPlanHours?: number;
  roadmapTargetHours?: number | null;
  athleteHours?: number | string | null;
};

export type CoachingSignals = {
  completionRate: number | null;
  averageRpe: number | null;

  completedSessions: number;
  skippedSessions: number;
  heavySessions: number;

  recentPoorReadiness: number;
  recentRecoverDays: number;

  fatigueRisk:
    | "Low"
    | "Moderate"
    | "High";

  consistency:
    | "Low"
    | "Moderate"
    | "High";

  loadDecision: LoadDecision;

  recommendedHoursMin: number;
  recommendedHoursMax: number;

  reasons: string[];
};

function numberOrNull(
  value: unknown
): number | null {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}


export type ReadinessTrend = {
  recentEntries: number;
  poorDays: number;
  recoverDays: number;
  consecutivePoorDays: number;
  level:
    | "Stable"
    | "Watch"
    | "Strained";
  message: string;
};

export function buildReadinessTrend(
  readinessHistory: Readiness[] = []
): ReadinessTrend {
  const recent = readinessHistory
    .filter((item) => item.date)
    .slice()
    .sort((a, b) =>
      (a.date ?? "").localeCompare(
        b.date ?? ""
      )
    )
    .slice(-7);

  const poorDays = recent.filter(
    (item) =>
      item.status === "Caution" ||
      item.status === "Recover"
  ).length;

  const recoverDays = recent.filter(
    (item) =>
      item.status === "Recover"
  ).length;

  let consecutivePoorDays = 0;

  for (
    let index = recent.length - 1;
    index >= 0;
    index -= 1
  ) {
    const status = recent[index]?.status;

    if (
      status === "Caution" ||
      status === "Recover"
    ) {
      consecutivePoorDays += 1;
    } else {
      break;
    }
  }

  let level: ReadinessTrend["level"] =
    "Stable";

  let message =
    "Recent recovery looks stable.";

  if (
    recoverDays >= 2 ||
    consecutivePoorDays >= 3
  ) {
    level = "Strained";

    message =
      "Recovery has been under pressure across several recent check-ins. Keep training conservative until the trend improves.";
  } else if (
    poorDays >= 2 ||
    consecutivePoorDays >= 2
  ) {
    level = "Watch";

    message =
      "Recent recovery has been inconsistent. One good check-in should not override the broader trend.";
  }

  return {
    recentEntries: recent.length,
    poorDays,
    recoverDays,
    consecutivePoorDays,
    level,
    message,
  };
}

export function buildCoachingSignals({
  workoutHistory = [],
  readinessHistory = [],
  physiologicalBaselineHours = null,
  currentPlanHours = 0,
  roadmapTargetHours = null,
  athleteHours = null,
}: CoachingInput): CoachingSignals {

  const completed =
    workoutHistory.filter(
      (item) =>
        item.status === "Completed" ||
        item.status === "Modified"
    );

  /*
    Athlete-added sessions are optional athlete-owned load,
    not part of the coach-prescribed adherence contract.

    A skipped manual session must therefore not count as
    a failure to follow the formal training plan.
  */
  const skipped =
    workoutHistory.filter(
      (item) =>
        item.status === "Skipped" &&
        !item.sessionId?.startsWith(
          "manual-"
        )
    );

  const rpes = completed
    .map((item) => item.rpe)
    .filter(
      (value): value is number =>
        typeof value === "number"
    );

  const averageRpe =
    rpes.length > 0
      ? rpes.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / rpes.length
      : null;

  const heavySessions =
    completed.filter(
      (item) =>
        (item.rpe ?? 0) >= 8 ||
        item.feeling === "Heavy"
    ).length;

  /*
    Athlete-added manual sessions are REAL training load,
    but they are not part of the coach-prescribed plan.

    Therefore:
    - formalPlanHistory owns adherence / completion
    - manual sessions contribute load but never make formal
      plan adherence look better or worse
  */
  const formalPlanHistory =
    workoutHistory.filter(
      (item) =>
        !item.sessionId?.startsWith(
          "manual-"
        )
    );


  const plannedMinutes =
    formalPlanHistory.reduce(
      (sum, item) =>
        sum +
        Math.max(
          0,
          item.plannedDurationMinutes ??
            0
        ),
      0
    );

  /*
    Consistency measures adherence to the prescribed plan,
    not raw accumulated training load.

    Extra duration beyond the planned session is real load,
    but it must not compensate for another skipped or
    shortened session when judging consistency.

    Therefore each completed / modified session contributes
    at most its own planned duration to adherence.
  */
  const adherenceMinutes =
    formalPlanHistory.reduce(
      (sum, item) => {
        const planned =
          Math.max(
            0,
            item.plannedDurationMinutes ??
              0
          );

        if (
          planned <= 0 ||
          item.status === "Skipped"
        ) {
          return sum;
        }

        const actual =
          Math.max(
            0,
            item.actualDurationMinutes ??
              0
          );

        return (
          sum +
          Math.min(
            actual,
            planned
          )
        );
      },
      0
    );


  const completionRate =
    plannedMinutes > 0
      ? adherenceMinutes /
        plannedMinutes
      : null;


  /*
    ======================================================
    UNPLANNED LOAD ACCUMULATION
    ======================================================

    Adherence and accumulated load are deliberately
    separate concepts.

    Extra load comes from two sources:

    1. Formal sessions completed / modified for longer
       than prescribed.

    2. Athlete-added manual sessions that were actually
       completed / modified.

    This signal does NOT diagnose fatigue and must NOT
    automatically trigger Reduce.

    Its purpose is narrower:
    do not stack another automatic progression on top of
    a week that already accumulated substantially more
    training than prescribed.
  */
  const formalExtraMinutes =
    formalPlanHistory.reduce(
      (
        sum,
        item
      ) => {

        if (
          item.status !==
            "Completed" &&
          item.status !==
            "Modified"
        ) {
          return sum;
        }


        const planned =
          Math.max(
            0,
            item.plannedDurationMinutes ??
              0
          );


        const actual =
          Math.max(
            0,
            item.actualDurationMinutes ??
              0
          );


        return (
          sum +
          Math.max(
            0,
            actual -
              planned
          )
        );
      },
      0
    );


  const manualExtraMinutes =
    workoutHistory.reduce(
      (
        sum,
        item
      ) => {

        if (
          !item.sessionId?.startsWith(
            "manual-"
          ) ||
          (
            item.status !==
              "Completed" &&
            item.status !==
              "Modified"
          )
        ) {
          return sum;
        }


        return (
          sum +
          Math.max(
            0,
            item.actualDurationMinutes ??
              item.plannedDurationMinutes ??
              0
          )
        );
      },
      0
    );


  const extraActualMinutes =
    formalExtraMinutes +
    manualExtraMinutes;


  /*
    Engineering guardrail, not a physiological threshold.

    Require BOTH:
    - at least 60 minutes of extra work
    - at least 25% above formal prescribed minutes

    This avoids blocking progression because of trivial
    execution differences while catching clearly material
    unplanned accumulation.

    These values are safety heuristics, not scientific
    claims about a universal physiological threshold.
  */
  const meaningfulExtraActualLoad =
    plannedMinutes > 0 &&
    extraActualMinutes >= 60 &&
    extraActualMinutes /
      plannedMinutes >=
        0.25;

  // Sort so "recent" really means recent.
  const recentReadiness =
    readinessHistory
      .slice()
      .sort((a, b) =>
        (a.date ?? "").localeCompare(
          b.date ?? ""
        )
      )
      .slice(-7);

  const recentPoorReadiness =
    recentReadiness.filter(
      (item) =>
        item.status === "Caution" ||
        item.status === "Recover"
    ).length;

  const recentRecoverDays =
    recentReadiness.filter(
      (item) =>
        item.status === "Recover"
    ).length;

  // -----------------------------------------
  // FATIGUE
  // -----------------------------------------

  let fatigueRisk:
    CoachingSignals["fatigueRisk"] =
      "Low";

  if (
    recentRecoverDays >= 2 ||
    heavySessions >= 3 ||
    (
      averageRpe !== null &&
      averageRpe >= 8
    )
  ) {
    fatigueRisk = "High";
  } else if (
    recentPoorReadiness >= 2 ||
    heavySessions >= 2 ||
    (
      averageRpe !== null &&
      averageRpe >= 7
    )
  ) {
    fatigueRisk = "Moderate";
  }

  // -----------------------------------------
  // CONSISTENCY
  // -----------------------------------------

  let consistency:
    CoachingSignals["consistency"] =
      "Moderate";

  if (
    completionRate !== null &&
    completionRate >= 0.9 &&
    skipped.length <= 1
  ) {
    consistency = "High";
  } else if (
    (
      completionRate !== null &&
      completionRate < 0.7
    ) ||
    skipped.length >= 3
  ) {
    consistency = "Low";
  }

  // -----------------------------------------
  // LOAD DECISION
  // -----------------------------------------

  let loadDecision: LoadDecision =
    "Maintain";

  const reasons: string[] = [];

  if (fatigueRisk === "High") {
    loadDecision = "Reduce";

    reasons.push(
      "Multiple fatigue signals suggest recovery should take priority."
    );
  } else if (
    consistency === "Low"
  ) {
    loadDecision = "Maintain";

    reasons.push(
      "Training completion was too inconsistent to justify progression."
    );
  } else if (
    fatigueRisk === "Moderate"
  ) {
    loadDecision = "Maintain";

    reasons.push(
      "Some fatigue signals are present, so progression should remain conservative."
    );
  } else if (
    meaningfulExtraActualLoad
  ) {
    loadDecision = "Maintain";

    reasons.push(
      `Actual training accumulated ${Math.round(extraActualMinutes)} extra minutes beyond the formal prescription, so another automatic load increase is not justified yet.`
    );
  } else if (
    consistency === "High" &&
    (
      averageRpe === null ||
      averageRpe <= 6.5
    )
  ) {
    loadDecision =
      "Increase slightly";

    reasons.push(
      "Training was completed consistently with manageable perceived effort."
    );
  } else {
    reasons.push(
      "Current training load appears appropriate."
    );
  }

  // -----------------------------------------
  // LOAD RANGE
  // -----------------------------------------

  const roadmapHours =
    numberOrNull(
      roadmapTargetHours
    );

  const physiologicalHours =
    numberOrNull(
      physiologicalBaselineHours
    );

  const currentHours =
    numberOrNull(
      currentPlanHours
    );

  /*
    LOAD OWNERSHIP

    The roadmap is strategic guidance, not evidence that the
    athlete already tolerates that volume.

    Prefer the athlete's real current training volume when it
    is available. Fall back to the current formal plan only
    when that physiological reference is unavailable.

    Roadmap ambition may shape the upper edge later, but it
    must never replace this baseline by itself.
  */
  const baseHours =
    physiologicalHours !== null &&
    physiologicalHours > 0
      ? physiologicalHours
      : currentHours !== null &&
          currentHours > 0
        ? currentHours
        : roadmapHours !== null &&
            roadmapHours > 0
          ? roadmapHours
          : 1;

  let minMultiplier = 0.95;
  let maxMultiplier = 1.05;

  if (
    loadDecision ===
    "Increase slightly"
  ) {
    minMultiplier = 1.0;
    maxMultiplier = 1.08;
  }

  if (
    loadDecision === "Reduce"
  ) {
    minMultiplier = 0.75;
    maxMultiplier = 0.9;
  }

  let recommendedHoursMin =
    baseHours * minMultiplier;

  let recommendedHoursMax =
    baseHours * maxMultiplier;

  const athleteLimit =
    numberOrNull(athleteHours);

  if (
    athleteLimit !== null &&
    athleteLimit > 0
  ) {
    recommendedHoursMax =
      Math.min(
        recommendedHoursMax,
        athleteLimit
      );
  }

  if (
    roadmapTargetHours !== null &&
    roadmapTargetHours > 0 &&
    loadDecision !== "Reduce"
  ) {
    // Roadmap may guide progression,
    // but never force a large jump.
    recommendedHoursMax =
      Math.min(
        Math.max(
          recommendedHoursMax,
          Math.min(
            roadmapTargetHours,
            baseHours * 1.08
          )
        ),
        athleteLimit ??
          Number.POSITIVE_INFINITY
      );
  }

  recommendedHoursMin =
    Math.min(
      recommendedHoursMin,
      recommendedHoursMax
    );

  return {
    completionRate:
      completionRate === null
        ? null
        : Math.round(
            completionRate * 100
          ),

    averageRpe:
      averageRpe === null
        ? null
        : Number(
            averageRpe.toFixed(1)
          ),

    completedSessions:
      completed.length,

    skippedSessions:
      skipped.length,

    heavySessions,

    recentPoorReadiness,
    recentRecoverDays,

    fatigueRisk,
    consistency,
    loadDecision,

    recommendedHoursMin:
      Number(
        recommendedHoursMin.toFixed(1)
      ),

    recommendedHoursMax:
      Number(
        recommendedHoursMax.toFixed(1)
      ),

    reasons,
  };
}
