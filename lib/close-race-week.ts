import type {
  TrainingPlan,
  WorkoutFeedback,
} from "@/types/training";


export function adaptWeekForCloseRace({
  plan,
  feedback,
  raceDate,
}: {
  plan: TrainingPlan;
  feedback: WorkoutFeedback[];
  raceDate: string;
}): TrainingPlan {

  const now = new Date();

  const todayIso =
    `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;


  const race =
    new Date(
      `${raceDate}T12:00:00`
    );


  const daysToRace =
    Math.max(
      0,
      Math.ceil(
        (
          race.getTime() -
          new Date(
            `${todayIso}T12:00:00`
          ).getTime()
        ) /
          86_400_000
      )
    );


  if (
    Number.isNaN(
      race.getTime()
    ) ||
    daysToRace > 28
  ) {
    return plan;
  }


  /*
    Progressive fatigue reduction.

    4 weeks out: small adjustment
    race week: substantial reduction
  */
  const factor =
    daysToRace <= 7
      ? 0.55
      : daysToRace <= 14
        ? 0.7
        : daysToRace <= 21
          ? 0.8
          : 0.9;


  const completedIds =
    new Set(
      feedback
        .filter(
          (item) =>
            item.status ===
              "Completed" ||
            item.status ===
              "Modified"
        )
        .map(
          (item) =>
            item.sessionId
        )
        .filter(Boolean)
    );


  const completedDates =
    new Set(
      feedback
        .filter(
          (item) =>
            item.status ===
              "Completed" ||
            item.status ===
              "Modified"
        )
        .map(
          (item) =>
            item.date
        )
        .filter(Boolean)
    );


  const days =
    plan.days.map(
      (day) => {

        /*
          Never rewrite history.
        */
        const protectedSession =
          Boolean(
            day.sessionId &&
            completedIds.has(
              day.sessionId
            )
          );

        const protectedDate =
          Boolean(
            day.date &&
            completedDates.has(
              day.date
            )
          );

        const past =
          Boolean(
            day.date &&
            day.date < todayIso
          );


        if (
          protectedSession ||
          protectedDate ||
          past
        ) {
          return day;
        }


        /*
          Recovery/rest days remain recovery.
        */
        if (
          day.durationMinutes <= 0
        ) {
          return day;
        }


        const newDuration =
          Math.max(
            20,
            Math.round(
              day.durationMinutes *
                factor /
                5
            ) * 5
          );


        /*
          Keep the session recognisable.

          We reduce fatigue rather than inventing
          an entirely new workout.
        */
        return {
          ...day,

          durationMinutes:
            newDuration,

          intensity:
            daysToRace <= 7
              ? "Easy / controlled with brief race-specific efforts"
              : day.intensity,

          purpose:
            daysToRace <= 14
              ? `${day.purpose} · Race readiness and freshness`
              : `${day.purpose} · Peak/taper adjustment`,

          details: [
            ...day.details,

            daysToRace <= 7
              ? "Keep this session controlled. Finish feeling fresh rather than depleted."
              : "Volume adjusted to support race readiness while preserving useful training stimulus.",
          ],

          coachAdjustment: {
            adjustedAt:
              new Date()
                .toISOString(),

            reason:
              `Target race is ${daysToRace} days away.`,

            previousDurationMinutes:
              day.durationMinutes,

            source:
              "coach" as const,
          },
        };
      }
    );


  const additionalSessions =
    (
      plan.additionalSessions ??
      []
    ).map((day) => {
      /*
        Athlete-owned and legacy secondary
        sessions remain athlete-controlled.
      */
      if (
        day.sessionSource !== "coach"
      ) {
        return day;
      }

      const protectedSession =
        Boolean(
          day.sessionId &&
          completedIds.has(
            day.sessionId
          )
        );

      const protectedDate =
        Boolean(
          !day.sessionId &&
          day.date &&
          completedDates.has(
            day.date
          )
        );

      const past =
        Boolean(
          day.date &&
          day.date < todayIso
        );

      if (
        protectedSession ||
        protectedDate ||
        past ||
        day.durationMinutes <= 0
      ) {
        return day;
      }

      const newDuration =
        Math.max(
          20,
          Math.round(
            day.durationMinutes *
              factor /
              5
          ) * 5
        );

      return {
        ...day,

        durationMinutes:
          newDuration,

        intensity:
          daysToRace <= 7
            ? "Easy / controlled with brief race-specific efforts"
            : day.intensity,

        purpose:
          daysToRace <= 14
            ? `${day.purpose} · Race readiness and freshness`
            : `${day.purpose} · Peak/taper adjustment`,

        details: [
          ...day.details,

          daysToRace <= 7
            ? "Keep this session controlled. Finish feeling fresh rather than depleted."
            : "Volume adjusted to support race readiness while preserving useful training stimulus.",
        ],

        coachAdjustment: {
          adjustedAt:
            new Date()
              .toISOString(),

          reason:
            `Target race is ${daysToRace} days away.`,

          previousDurationMinutes:
            day.durationMinutes,

          source:
            "coach" as const,
        },
      };
    });


  const primaryMinutes =
    days.reduce(
      (
        total,
        day
      ) =>
        total +
        (
          Number(
            day.durationMinutes
          ) || 0
        ),
      0
    );


  const secondaryMinutes =
    additionalSessions.reduce(
      (
        total,
        day
      ) =>
        total +
        (
          Number(
            day.durationMinutes
          ) || 0
        ),
      0
    );


  return {
    ...plan,

    focus:
      daysToRace <= 14
        ? "Race readiness, specificity and freshness"
        : "Peak preparation and controlled race-specific training",

    summary:
      `${plan.summary} Basse adjusted the remaining week because the target race is ${daysToRace} days away.`,

    totalHours:
      Number(
        (
          (
            primaryMinutes +
            secondaryMinutes
          ) /
          60
        ).toFixed(2)
      ),

    days,

    additionalSessions,
  };
}
