import type {
  TrainingArchiveWeek,
  WorkoutFeedback,
  ReadinessEntry,
} from "@/types/training";


export type AthleteState = {
  dataQuality:
    | "Low"
    | "Moderate"
    | "Strong";

  sessionsAnalyzed: number;
  weeksAnalyzed: number;

  consistency: {
    overall: number | null;

    byDiscipline: {
      Swim: number | null;
      Bike: number | null;
      Run: number | null;
      Strength: number | null;
    };
  };

  loadTolerance: {
    averageRpe: number | null;
    heavySessionRate: number | null;

    trend:
      | "Comfortable"
      | "Mixed"
      | "Strained"
      | "Unknown";
  };

  recoveryPattern: {
    recentEntries: number;
    poorReadinessRate: number | null;

    trend:
      | "Stable"
      | "Watch"
      | "Strained"
      | "Unknown";
  };

  schedule: {
    byDay: Record<
      string,
      {
        sessions: number;
        completionRate: number;
        modifiedRate: number;
        skippedRate: number;
      } | null
    >;

    patterns: string[];
  };

  execution: {
    overallPlannedVsActualPercent:
      number | null;

    byDiscipline: Record<
      string,
      {
        sessions: number;
        plannedMinutes: number;
        actualMinutes: number;
        actualVsPlannedPercent: number;
      } | null
    >;

    extraSessions: {
      count: number;
      minutes: number;
    };

    patterns: string[];
  };

  disciplinePatterns: string[];
  coachingNotes: string[];
};


type AthleteStateInput = {
  workoutHistory?: WorkoutFeedback[];
  trainingArchive?: TrainingArchiveWeek[];
  readinessHistory?: ReadinessEntry[];
};


const DISCIPLINES = [
  "Swim",
  "Bike",
  "Run",
  "Strength",
] as const;


const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;


/*
  A brick remains one logged workout overall, but it can
  contribute execution data to several disciplines.

  Prefer disciplineSplits whenever they exist. Legacy
  single-sport feedback falls back to the top-level sport.
*/
function feedbackHasDiscipline(
  item: WorkoutFeedback,
  discipline: string
) {
  const splits =
    item.disciplineSplits ?? [];

  if (splits.length > 0) {
    return splits.some(
      (split) =>
        split.sport === discipline
    );
  }

  return item.sport === discipline;
}


function disciplineActualMinutes(
  item: WorkoutFeedback,
  discipline: string
): number | null {

  const splits =
    item.disciplineSplits ?? [];

  if (splits.length > 0) {
    const split =
      splits.find(
        (candidate) =>
          candidate.sport === discipline
      );

    return split
      ? split.actualDurationMinutes
      : null;
  }

  return item.sport === discipline
    ? item.actualDurationMinutes
    : null;
}


function disciplinePlannedMinutes(
  item: WorkoutFeedback,
  discipline: string
): number | null {

  const splits =
    item.disciplineSplits ?? [];

  if (splits.length > 0) {
    const split =
      splits.find(
        (candidate) =>
          candidate.sport === discipline
      );

    return split
      ? split.plannedDurationMinutes ??
          null
      : null;
  }

  return item.sport === discipline
    ? item.plannedDurationMinutes
    : null;
}


function normalizeDay(
  value: string | undefined
): string | null {
  if (!value) {
    return null;
  }

  const key =
    value
      .trim()
      .slice(0, 3)
      .toLowerCase();

  const match =
    DAYS.find(
      (day) =>
        day
          .slice(0, 3)
          .toLowerCase() === key
    );

  return match ?? null;
}


function roundPercent(
  value: number
): number {
  return Math.round(value * 100);
}


function completionFor(
  feedback: WorkoutFeedback[]
): number | null {
  const relevant = feedback.filter(
    (item) =>
      item.status === "Completed" ||
      item.status === "Modified" ||
      item.status === "Skipped"
  );

  if (relevant.length === 0) {
    return null;
  }

  const completed =
    relevant.filter(
      (item) =>
        item.status === "Completed" ||
        item.status === "Modified"
    ).length;

  return roundPercent(
    completed / relevant.length
  );
}


export function buildAthleteState({
  workoutHistory = [],
  trainingArchive = [],
  readinessHistory = [],
}: AthleteStateInput): AthleteState {

  /*
    Use recent history rather than the athlete's
    entire lifetime.

    Six archived weeks + the current week gives
    enough context to detect patterns without
    letting very old training dominate.
  */

  const recentArchive =
    trainingArchive.slice(-6);

  const archivedFeedback =
    recentArchive.flatMap(
      (week) => week.feedback ?? []
    );

  const feedback = [
    ...archivedFeedback,
    ...workoutHistory,
  ];


  const completed =
    feedback.filter(
      (item) =>
        item.status === "Completed" ||
        item.status === "Modified"
    );


  // -----------------------------------------
  // DATA QUALITY
  // -----------------------------------------

  let dataQuality:
    AthleteState["dataQuality"] =
      "Low";

  if (
    feedback.length >= 18 &&
    recentArchive.length >= 3
  ) {
    dataQuality = "Strong";
  } else if (
    feedback.length >= 6
  ) {
    dataQuality = "Moderate";
  }


  // -----------------------------------------
  // CONSISTENCY
  // -----------------------------------------

  const overallConsistency =
    completionFor(feedback);

  const byDiscipline:
    AthleteState["consistency"]["byDiscipline"] =
      {
        Swim: null,
        Bike: null,
        Run: null,
        Strength: null,
      };

  for (const discipline of DISCIPLINES) {
    const disciplineFeedback =
      feedback.filter(
        (item) =>
          feedbackHasDiscipline(
            item,
            discipline
          )
      );

    byDiscipline[discipline] =
      completionFor(
        disciplineFeedback
      );
  }


  // -----------------------------------------
  // LOAD TOLERANCE
  // -----------------------------------------

  const rpes =
    completed
      .map((item) => item.rpe)
      .filter(
        (value): value is number =>
          typeof value === "number"
      );

  const averageRpe =
    rpes.length > 0
      ? Number(
          (
            rpes.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / rpes.length
          ).toFixed(1)
        )
      : null;


  const completedWithEffort =
    completed.filter(
      (item) =>
        typeof item.rpe === "number" ||
        item.feeling !== null
    );

  const heavySessions =
    completedWithEffort.filter(
      (item) =>
        (item.rpe ?? 0) >= 8 ||
        item.feeling === "Heavy"
    ).length;

  const heavySessionRate =
    completedWithEffort.length > 0
      ? roundPercent(
          heavySessions /
          completedWithEffort.length
        )
      : null;


  let loadTrend:
    AthleteState["loadTolerance"]["trend"] =
      "Unknown";

  if (
    completedWithEffort.length >= 3
  ) {
    if (
      (
        averageRpe !== null &&
        averageRpe >= 7.5
      ) ||
      (
        heavySessionRate !== null &&
        heavySessionRate >= 40
      )
    ) {
      loadTrend = "Strained";
    } else if (
      (
        averageRpe !== null &&
        averageRpe >= 6.5
      ) ||
      (
        heavySessionRate !== null &&
        heavySessionRate >= 20
      )
    ) {
      loadTrend = "Mixed";
    } else {
      loadTrend = "Comfortable";
    }
  }


  // -----------------------------------------
  // RECOVERY PATTERN
  // -----------------------------------------

  const recentReadiness =
    readinessHistory
      .filter((item) => item.date)
      .slice()
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      )
      .slice(-14);

  const poorReadiness =
    recentReadiness.filter(
      (item) =>
        item.status === "Caution" ||
        item.status === "Recover"
    );

  const recoverReadiness =
    recentReadiness.filter(
      (item) =>
        item.status === "Recover"
    );

  const poorReadinessRate =
    recentReadiness.length > 0
      ? roundPercent(
          poorReadiness.length /
          recentReadiness.length
        )
      : null;


  let recoveryTrend:
    AthleteState["recoveryPattern"]["trend"] =
      "Unknown";

  if (recentReadiness.length >= 3) {
    if (
      recoverReadiness.length >= 2 ||
      (
        poorReadinessRate !== null &&
        poorReadinessRate >= 50
      )
    ) {
      recoveryTrend = "Strained";
    } else if (
      poorReadiness.length >= 2 ||
      (
        poorReadinessRate !== null &&
        poorReadinessRate >= 30
      )
    ) {
      recoveryTrend = "Watch";
    } else {
      recoveryTrend = "Stable";
    }
  }


  // -----------------------------------------
  // PLANNED VS ACTUAL EXECUTION
  // -----------------------------------------

  /*
    Only sessions that were actually completed
    or modified are useful for duration execution.

    Skipped sessions are already represented by
    consistency and should not distort the
    planned-vs-actual duration ratio.
  */

  const executedSessions =
    completed.filter(
      (item) =>
        typeof item.plannedDurationMinutes ===
          "number" &&
        item.plannedDurationMinutes > 0 &&
        typeof item.actualDurationMinutes ===
          "number" &&
        item.actualDurationMinutes >= 0
    );


  const executionPlannedMinutes =
    executedSessions.reduce(
      (sum, item) =>
        sum +
        (
          item.plannedDurationMinutes ??
          0
        ),
      0
    );

  const executionActualMinutes =
    executedSessions.reduce(
      (sum, item) =>
        sum +
        (
          item.actualDurationMinutes ??
          0
        ),
      0
    );


  const overallPlannedVsActualPercent =
    executionPlannedMinutes > 0
      ? Math.round(
          (
            executionActualMinutes /
            executionPlannedMinutes
          ) * 100
        )
      : null;


  const executionByDiscipline:
    AthleteState["execution"]["byDiscipline"] =
      {};

  const executionPatterns:
    string[] = [];


  for (const discipline of DISCIPLINES) {

    /*
      Only include sessions where both planned and actual
      duration are known for THIS discipline.

      This matters for distance-only brick blocks where
      planned time cannot be derived safely.
    */
    const sessions =
      executedSessions.filter(
        (item) => {
          const planned =
            disciplinePlannedMinutes(
              item,
              discipline
            );

          const actual =
            disciplineActualMinutes(
              item,
              discipline
            );

          return (
            typeof planned === "number" &&
            planned > 0 &&
            typeof actual === "number" &&
            actual >= 0
          );
        }
      );

    if (sessions.length < 3) {
      executionByDiscipline[
        discipline
      ] = null;

      continue;
    }

    const plannedMinutes =
      sessions.reduce(
        (sum, item) =>
          sum +
          (
            disciplinePlannedMinutes(
              item,
              discipline
            ) ??
            0
          ),
        0
      );

    const actualMinutes =
      sessions.reduce(
        (sum, item) =>
          sum +
          (
            disciplineActualMinutes(
              item,
              discipline
            ) ??
            0
          ),
        0
      );

    const actualVsPlannedPercent =
      plannedMinutes > 0
        ? Math.round(
            (
              actualMinutes /
              plannedMinutes
            ) * 100
          )
        : 100;


    executionByDiscipline[
      discipline
    ] = {
      sessions:
        sessions.length,

      plannedMinutes,
      actualMinutes,
      actualVsPlannedPercent,
    };


    /*
      Require a meaningful deviation before
      creating a coaching pattern.
    */

    if (
      sessions.length >= 4 &&
      actualVsPlannedPercent <= 85
    ) {
      executionPatterns.push(
        `${discipline} sessions are often shorter than planned: actual duration averages ${actualVsPlannedPercent}% of planned duration across ${sessions.length} recent completed or modified sessions.`
      );

      continue;
    }


    if (
      sessions.length >= 4 &&
      actualVsPlannedPercent >= 115
    ) {
      executionPatterns.push(
        `${discipline} sessions are often longer than planned: actual duration averages ${actualVsPlannedPercent}% of planned duration across ${sessions.length} recent completed or modified sessions.`
      );
    }
  }


  /*
    Manually added sessions use the manual-
    prefixed session IDs created by AddSessionModal.

    We count only completed / modified manual
    sessions so planned-but-unperformed additions
    do not inflate actual training load.
  */

  const extraSessions =
    completed.filter(
      (item) =>
        item.sessionId?.startsWith(
          "manual-"
        )
    );

  const extraSessionMinutes =
    extraSessions.reduce(
      (sum, item) =>
        sum +
        (
          item.actualDurationMinutes ??
          item.plannedDurationMinutes ??
          0
        ),
      0
    );


  if (
    extraSessions.length >= 3 &&
    extraSessionMinutes >= 120
  ) {
    executionPatterns.push(
      `Athlete-added sessions are contributing meaningful extra training load: ${extraSessions.length} recent added sessions account for ${extraSessionMinutes} minutes of completed training.`
    );
  }


  // -----------------------------------------
  // SCHEDULE PATTERNS
  // -----------------------------------------

  const scheduleByDay:
    AthleteState["schedule"]["byDay"] =
      {};

  const schedulePatterns:
    string[] = [];


  for (const day of DAYS) {
    const dayFeedback =
      feedback.filter(
        (item) =>
          normalizeDay(
            item.day
          ) === day
      );

    /*
      Avoid drawing schedule conclusions
      from isolated sessions.
    */

    if (dayFeedback.length < 3) {
      scheduleByDay[day] =
        null;

      continue;
    }

    const completedCount =
      dayFeedback.filter(
        (item) =>
          item.status ===
            "Completed" ||
          item.status ===
            "Modified"
      ).length;

    const modifiedCount =
      dayFeedback.filter(
        (item) =>
          item.status ===
            "Modified"
      ).length;

    const skippedCount =
      dayFeedback.filter(
        (item) =>
          item.status ===
            "Skipped"
      ).length;

    const completionRate =
      roundPercent(
        completedCount /
          dayFeedback.length
      );

    const modifiedRate =
      roundPercent(
        modifiedCount /
          dayFeedback.length
      );

    const skippedRate =
      roundPercent(
        skippedCount /
          dayFeedback.length
      );

    scheduleByDay[day] = {
      sessions:
        dayFeedback.length,

      completionRate,
      modifiedRate,
      skippedRate,
    };


    /*
      Strong negative schedule patterns
      require repeated evidence.

      Modified is not treated as failure:
      it only tells us that the original
      session repeatedly needed changing.
    */

    if (
      dayFeedback.length >= 4 &&
      (
        skippedRate >= 40 ||
        completionRate < 60
      )
    ) {
      schedulePatterns.push(
        `${day} has been a less reliable training day: ${completionRate}% of ${dayFeedback.length} logged sessions were completed or modified, with ${skippedRate}% skipped.`
      );

      continue;
    }


    if (
      dayFeedback.length >= 4 &&
      modifiedRate >= 50
    ) {
      schedulePatterns.push(
        `${day} sessions are frequently modified: ${modifiedRate}% of ${dayFeedback.length} logged sessions required changes. Consider whether session placement or structure should be more flexible.`
      );

      continue;
    }


    if (
      dayFeedback.length >= 4 &&
      completionRate >= 90 &&
      skippedRate <= 10
    ) {
      schedulePatterns.push(
        `${day} has been a highly reliable training day: ${completionRate}% of ${dayFeedback.length} logged sessions were completed or modified.`
      );
    }
  }


  // -----------------------------------------
  // DISCIPLINE PATTERNS
  // -----------------------------------------

  const disciplinePatterns:
    string[] = [];

  for (const discipline of DISCIPLINES) {
    const disciplineFeedback =
      feedback.filter(
        (item) =>
          feedbackHasDiscipline(
            item,
            discipline
          )
      );

    /*
      Do not make discipline claims from one
      isolated workout.
    */

    if (disciplineFeedback.length < 3) {
      continue;
    }

    const rate =
      byDiscipline[discipline];

    if (rate === null) {
      continue;
    }

    if (rate < 60) {
      disciplinePatterns.push(
        `${discipline} consistency is low: ${rate}% of ${disciplineFeedback.length} logged planned sessions were completed or modified.`
      );
    } else if (rate >= 90) {
      disciplinePatterns.push(
        `${discipline} consistency is strong: ${rate}% of ${disciplineFeedback.length} logged planned sessions were completed or modified.`
      );
    }
  }


  // -----------------------------------------
  // COACHING NOTES
  // -----------------------------------------

  const coachingNotes:
    string[] = [];

  if (
    overallConsistency !== null &&
    feedback.length >= 6
  ) {
    if (overallConsistency < 65) {
      coachingNotes.push(
        `Recent training consistency is low at ${overallConsistency}%. Prefer realistic scheduling before increasing load.`
      );
    } else if (
      overallConsistency >= 90
    ) {
      coachingNotes.push(
        `Recent training consistency is strong at ${overallConsistency}%. Progression may be appropriate if recovery remains stable.`
      );
    }
  }


  if (loadTrend === "Strained") {
    coachingNotes.push(
      "Recent completed sessions show elevated perceived effort. Avoid assuming the athlete is absorbing the current load comfortably."
    );
  }


  if (
    recoveryTrend === "Strained"
  ) {
    coachingNotes.push(
      "Recent readiness has repeatedly been poor. Recovery should take priority over automatic progression."
    );
  } else if (
    recoveryTrend === "Watch"
  ) {
    coachingNotes.push(
      "Recent readiness has been inconsistent. Watch the broader recovery pattern rather than reacting to one isolated good day."
    );
  }


  if (
    schedulePatterns.length > 0
  ) {
    coachingNotes.push(
      "Repeated weekday patterns are present. Prefer placing important sessions on historically reliable days when practical, while respecting the athlete's stated availability."
    );
  }


  if (
    executionPatterns.length > 0
  ) {
    coachingNotes.push(
      "Repeated differences between planned and actual training are present. Future plans should reflect what the athlete can consistently execute rather than repeatedly prescribing unrealistic duration."
    );
  }


  if (
    overallPlannedVsActualPercent !== null &&
    executedSessions.length >= 6
  ) {
    if (
      overallPlannedVsActualPercent <= 85
    ) {
      coachingNotes.push(
        `Across recent completed sessions, actual training duration is averaging ${overallPlannedVsActualPercent}% of planned duration. Consider whether the weekly prescription is consistently too large for real-life execution.`
      );
    } else if (
      overallPlannedVsActualPercent >= 115
    ) {
      coachingNotes.push(
        `Across recent completed sessions, actual training duration is averaging ${overallPlannedVsActualPercent}% of planned duration. Watch for unplanned load accumulation before increasing the formal plan.`
      );
    }
  }


  /*
    Find the weakest observed discipline only
    when there is enough data to compare it.
  */

  const comparable =
    DISCIPLINES
      .map((discipline) => ({
        discipline,
        rate:
          byDiscipline[
            discipline
          ],
        count:
          feedback.filter(
            (item) =>
              feedbackHasDiscipline(
                item,
                discipline
              )
          ).length,
      }))
      .filter(
        (item) =>
          item.rate !== null &&
          item.count >= 3
      )
      .sort(
        (a, b) =>
          (a.rate ?? 100) -
          (b.rate ?? 100)
      );

  if (
    comparable.length >= 2 &&
    comparable[0].rate !== null &&
    comparable[1].rate !== null &&
    comparable[1].rate -
      comparable[0].rate >= 20
  ) {
    coachingNotes.push(
      `${comparable[0].discipline} is currently the least consistent observed discipline. Consider whether scheduling, access or session difficulty is contributing before adding more load there.`
    );
  }


  return {
    dataQuality,

    sessionsAnalyzed:
      feedback.length,

    weeksAnalyzed:
      recentArchive.length,

    consistency: {
      overall:
        overallConsistency,
      byDiscipline,
    },

    loadTolerance: {
      averageRpe,
      heavySessionRate,
      trend: loadTrend,
    },

    recoveryPattern: {
      recentEntries:
        recentReadiness.length,
      poorReadinessRate,
      trend: recoveryTrend,
    },

    schedule: {
      byDay:
        scheduleByDay,

      patterns:
        schedulePatterns,
    },

    execution: {
      overallPlannedVsActualPercent,

      byDiscipline:
        executionByDiscipline,

      extraSessions: {
        count:
          extraSessions.length,

        minutes:
          extraSessionMinutes,
      },

      patterns:
        executionPatterns,
    },

    disciplinePatterns,
    coachingNotes,
  };
}
