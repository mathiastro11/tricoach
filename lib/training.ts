import {
  getCanonicalTrainingPhase,
  getCanonicalWeeksUntilRace,
} from "./training-phase";

import {
  isDemandingSession as isCanonicalDemandingSession,
} from "@/lib/session-classification";

import type {
  TrainingPlan,
  TrainingPlanDay,
  TrainingArchiveWeek,
  WorkoutFeedback,
} from "@/types/training";

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonday(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

export function getISOWeekNumber(date = new Date()) {
  const copy = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));

  const dayNum = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));

  return Math.ceil(
    (((copy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );
}


export function recalculateTrainingPlanTotalHours(
  plan: TrainingPlan
): number {
  const primaryMinutes =
    plan.days.reduce(
      (sum, workout) =>
        sum +
        Math.max(
          0,
          Number.isFinite(
            workout.durationMinutes
          )
            ? workout.durationMinutes
            : 0
        ),
      0
    );

  const additionalMinutes =
    (
      plan.additionalSessions ??
      []
    ).reduce(
      (sum, workout) =>
        sum +
        Math.max(
          0,
          Number.isFinite(
            workout.durationMinutes
          )
            ? workout.durationMinutes
            : 0
        ),
      0
    );

  return Number(
    (
      (
        primaryMinutes +
        additionalMinutes
      ) / 60
    ).toFixed(2)
  );
}

export function attachWeekDates(
  plan: TrainingPlan
): TrainingPlan {

  const start =
    plan.weekStart
      ? new Date(
          `${plan.weekStart}T12:00:00`
        )
      : getMonday();


  const weekOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];


  function dateForDay(
    dayName: string,
    fallbackIndex: number
  ) {

    const dayIndex =
      weekOrder.indexOf(
        dayName
      );


    const offset =
      dayIndex >= 0
        ? dayIndex
        : fallbackIndex;


    const date =
      new Date(start);


    date.setDate(
      start.getDate() +
      offset
    );


    return toISODate(
      date
    );
  }


  const days =
    plan.days.map(
      (
        day,
        index
      ) => ({
        ...day,

        date:
          day.date ||
          dateForDay(
            day.day,
            index
          ),
      })
    );


  const additionalSessions =
    (
      plan.additionalSessions ??
      []
    ).map(
      (
        session,
        index
      ) => ({
        ...session,

        date:
          session.date ||
          dateForDay(
            session.day,
            index
          ),
      })
    );


  return {
    ...plan,

    weekNumber:
      plan.weekNumber ??
      getISOWeekNumber(
        start
      ),

    weekStart:
      plan.weekStart ??
      toISODate(
        start
      ),

    days,
    additionalSessions,
  };
}

export function getWeeksUntilRace(
  raceDate?: string
) {

  return getCanonicalWeeksUntilRace(
    raceDate
  );
}

export function getTrainingPhaseUI(
  raceDate?: string
) {

  return getCanonicalTrainingPhase(
    raceDate
  );
}

export function getPhaseDescription(phase: string) {
  if (phase === "Taper") {
    return "Reduce fatigue while keeping enough intensity to stay race-ready.";
  }

  if (phase === "Peak") {
    return "Prioritize race-specific sessions and protect recovery between key workouts.";
  }

  if (phase === "Build") {
    return "Develop race-specific endurance gradually while maintaining consistency.";
  }

  return "Build aerobic consistency, technical skill and durable training habits.";
}


export function calculateProgressMetrics(
  archive: TrainingArchiveWeek[],
  currentFeedback: WorkoutFeedback[]
) {
  const weeks = archive.slice(-6);

  const archivedFeedback =
    weeks.flatMap((week) => week.feedback ?? []);

  const allFeedback = [
    ...archivedFeedback,
    ...currentFeedback,
  ];

  const completed = allFeedback.filter(
    (item) =>
      item.status === "Completed" ||
      item.status === "Modified"
  );

  const skipped = allFeedback.filter(
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

  const plannedMinutes = allFeedback.reduce(
    (sum, item) =>
      sum +
      (item.plannedDurationMinutes ?? 0),
    0
  );

  const actualMinutes = allFeedback.reduce(
    (sum, item) =>
      sum +
      (item.actualDurationMinutes ?? 0),
    0
  );

  const completionRate =
    plannedMinutes > 0
      ? Math.round(
          (actualMinutes / plannedMinutes) * 100
        )
      : null;

  const disciplineMinutes: Record<string, number> = {
    Swim: 0,
    Bike: 0,
    Run: 0,
    Strength: 0,
  };

  completed.forEach((item) => {

    /*
      Multi-discipline workouts such as Bike -> Run
      bricks remain one completed session overall, but
      their actual training volume belongs to each
      discipline separately.

      Legacy / single-sport feedback keeps using the
      top-level sport and duration.
    */
    const splits =
      item.disciplineSplits?.filter(
        (split) =>
          split.sport in
          disciplineMinutes
      ) ?? [];


    if (splits.length > 0) {
      splits.forEach(
        (split) => {
          disciplineMinutes[
            split.sport
          ] +=
            split.actualDurationMinutes ??
            0;
        }
      );

      return;
    }


    if (
      item.sport in disciplineMinutes
    ) {
      disciplineMinutes[
        item.sport
      ] +=
        item.actualDurationMinutes ??
        0;
    }

  });

  const archivedWeeklyVolume = weeks.map(
    (week, index) => {
      const feedback =
        week.feedback ?? [];

      const minutes = feedback.reduce(
        (sum, item) =>
          sum +
          (item.actualDurationMinutes ?? 0),
        0
      );

      return {
        label:
          week.plan?.weekNumber
            ? `W${week.plan.weekNumber}`
            : `Week ${index + 1}`,
        minutes,
      };
    }
  );

  const currentWeekMinutes =
    currentFeedback.reduce(
      (sum, item) =>
        sum +
        (item.actualDurationMinutes ?? 0),
      0
    );

  const hasCurrentWeekData =
    currentFeedback.length > 0;

  const weeklyVolume =
    hasCurrentWeekData
      ? [
          ...archivedWeeklyVolume,
          {
            label: "Current",
            minutes: currentWeekMinutes,
          },
        ]
      : archivedWeeklyVolume;

  return {
    weeksAnalyzed:
      weeks.length +
      (hasCurrentWeekData ? 1 : 0),
    sessionsLogged: allFeedback.length,
    completedSessions: completed.length,
    skippedSessions: skipped.length,
    averageRpe:
      averageRpe === null
        ? null
        : Number(averageRpe.toFixed(1)),
    heavySessions,
    completionRate,
    actualMinutes,
    disciplineMinutes,
    weeklyVolume,
  };
}

export function getCoachInsight(
  completionRate: number | null,
  averageRpe: number | null,
  heavySessions: number,
  sessionsLogged: number
) {
  if (sessionsLogged < 3) {
    return "Keep logging sessions. Basse needs a little more training history before drawing strong conclusions.";
  }

  if (
    averageRpe !== null &&
    averageRpe >= 7.5
  ) {
    return "Training has been feeling consistently hard. The priority should be absorbing the work rather than automatically increasing load.";
  }

  if (
    completionRate !== null &&
    completionRate < 70
  ) {
    return "Your recent plan may be asking for more than fits real life right now. Consistency is more useful than chasing the original schedule.";
  }

  if (
    heavySessions >= 3
  ) {
    return "Several recent sessions were marked heavy. Watch recovery closely before adding more intensity.";
  }

  if (
    completionRate !== null &&
    completionRate >= 85 &&
    averageRpe !== null &&
    averageRpe <= 6.5
  ) {
    return "Your recent training looks sustainable: strong completion with manageable effort. That is a good platform for gradual progression.";
  }

  return "Your recent training looks reasonably stable. Keep building consistency and let several weeks of data guide progression.";
}

export function calculateReadiness(
  sleep: number,
  energy: number,
  soreness: number,
  stress: number,
  motivation: number
) {
  const positive =
    sleep +
    energy +
    motivation;

  const recoveryFromSoreness =
    6 - soreness;

  const recoveryFromStress =
    6 - stress;

  const raw =
    positive +
    recoveryFromSoreness +
    recoveryFromStress;

  const score =
    Math.round(
      (raw / 25) * 100
    );

  const status:
    | "Ready"
    | "Caution"
    | "Recover" =
    score >= 72
      ? "Ready"
      : score >= 50
      ? "Caution"
      : "Recover";

  return {
    score,
    status,
  };
}

export function getReadinessMessage(
  status: "Ready" | "Caution" | "Recover"
) {
  if (status === "Recover") {
    return "Recovery signals are poor today. Avoid forcing intensity and prioritize getting back to normal.";
  }

  if (status === "Caution") {
    return "Some recovery signals are below normal. Start conservatively and adapt if the warm-up does not improve things.";
  }

  return "Recovery signals look good enough to follow the plan while still paying attention to how the session feels.";
}

export type ReadinessRecommendation = {
  level:
    | "follow"
    | "monitor"
    | "adapt"
    | "recover";

  headline: string;
  message: string;
  actionLabel: string | null;
};

export function getReadinessRecommendation(
  workout: TrainingPlanDay | null | undefined,
  readiness:
    | {
        score: number;
        status:
          | "Ready"
          | "Caution"
          | "Recover";
        sleep?: number;
        energy?: number;
        soreness?: number;
        stress?: number;
        motivation?: number;
      }
    | null
    | undefined
): ReadinessRecommendation {
  if (!readiness) {
    return {
      level: "monitor",
      headline: "Check readiness first.",
      message:
        "A quick check-in gives Basse context before you start today's session.",
      actionLabel: null,
    };
  }

  if (!workout || isRestWorkout(workout)) {
    if (readiness.status === "Recover") {
      return {
        level: "recover",
        headline: "Recovery day is well timed.",
        message:
          "Your recovery signals are low today. Keep the planned rest day and avoid adding unnecessary training load.",
        actionLabel: null,
      };
    }

    return {
      level: "follow",
      headline: "Keep the recovery day.",
      message:
        "There is no need to turn a planned rest day into extra training. Use it to support the sessions ahead.",
      actionLabel: null,
    };
  }

  const sessionText = [
    workout.sport,
    workout.title,
    workout.intensity,
    workout.purpose,
    ...(workout.details ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isHardSession =
    isCanonicalDemandingSession(
      workout
    );

  const isLongSession =
    workout.durationMinutes >= 90 ||
    /long run|long ride|long session|endurance long/.test(
      sessionText
    );

  const isEasySession =
    /easy|recovery|technique|aerobic|zone 1|zone 2|z1|z2/.test(
      sessionText
    ) &&
    !isHardSession;

  if (readiness.status === "Ready") {
    return {
      level: "follow",
      headline: "Follow the plan.",
      message: isHardSession
        ? "Your recovery signals support today's quality session. Follow the planned intensity, but keep the warm-up honest."
        : "Your recovery signals support completing today's session as planned.",
      actionLabel: null,
    };
  }

  if (readiness.status === "Recover") {
    if (isHardSession) {
      return {
        level: "recover",
        headline: "Do not force today's intensity.",
        message:
          "Your recovery signals and the demands of this session are a poor match today. Basse recommends adapting the workout before training.",
        actionLabel: "Adapt workout",
      };
    }

    if (isLongSession) {
      return {
        level: "recover",
        headline: "Reduce today's load.",
        message:
          "Recovery is poor for a long session. Shortening or replacing today's workout is safer than forcing the planned volume.",
        actionLabel: "Adapt workout",
      };
    }

    return {
      level: "adapt",
      headline: "Keep today very easy.",
      message:
        "Recovery signals are poor. An easy session may still be reasonable, but avoid turning it into meaningful intensity or extra volume.",
      actionLabel: "Adapt workout",
    };
  }

  // Caution
  if (isHardSession) {
    return {
      level: "adapt",
      headline: "Quality is optional today.",
      message:
        "Your readiness is below normal and today's session is demanding. Start conservatively and consider reducing the hard work rather than forcing the original session.",
      actionLabel: "Adapt workout",
    };
  }

  if (isLongSession) {
    return {
      level: "monitor",
      headline: "Start controlled.",
      message:
        "Your readiness is below normal for a longer session. Begin easily and shorten the workout if your body does not improve during the first part.",
      actionLabel: "Adapt workout",
    };
  }

  if (isEasySession) {
    return {
      level: "monitor",
      headline: "Easy training still fits.",
      message:
        "Some recovery signals are below normal, but today's session is relatively low stress. Keep it genuinely easy and reassess during the warm-up.",
      actionLabel: null,
    };
  }

  return {
    level: "monitor",
    headline: "Train, but stay flexible.",
    message:
      "Some recovery signals are below normal. Start conservatively and adapt the session if the warm-up does not improve things.",
    actionLabel: "Adapt workout",
  };
}

export function isRestWorkout(
  workout: TrainingPlanDay | null | undefined
) {
  if (!workout) {
    return false;
  }

  return (
    workout.durationMinutes === 0 ||
    workout.sport.trim().toLowerCase() === "rest"
  );
}

