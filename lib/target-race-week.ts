import type {
  TrainingPlan,
  TrainingPlanDay,
} from "../types/training";


export type TargetRaceWeekOverlayInput = {
  plan: TrainingPlan;

  raceDate:
    string;

  raceName:
    string;

  raceFormat?:
    | "Sprint"
    | "Olympic"
    | "70.3"
    | "Ironman"
    | "Other";
};


export type TargetRaceWeekValidation = {
  valid: boolean;
  errors: string[];
};


export function applyTargetRaceWeekSpecialStates({
  plan: sourcePlan,
  raceDate,
  raceName,
  raceFormat,
}: TargetRaceWeekOverlayInput): TrainingPlan {

  if (!raceDate) {
    return sourcePlan;
  }


  const raceDayIndex =
    sourcePlan.days.findIndex(
      (day) =>
        day.date === raceDate
    );


  if (raceDayIndex === -1) {
    return sourcePlan;
  }


  const plan =
    structuredClone(
      sourcePlan
    );


  const existingRaceDay =
    plan.days[
      raceDayIndex
    ];


  plan.days[
    raceDayIndex
  ] = {
    ...existingRaceDay,

    date:
      raceDate,

    isRaceDay:
      true,

    isPostRace:
      false,

    targetRaceName:
      raceName,

    sport:
      "Triathlon",

    title:
      `${raceName} · Race day`,

    durationMinutes:
      0,

    intensity:
      "Race",

    performanceTarget:
      undefined,

    purpose:
      `Execute ${raceName} with confidence and according to the race plan.`,

    details: [
      "Race day — no separate training session is scheduled.",
      "Follow your pacing and effort plan.",

      raceFormat === "70.3" ||
      raceFormat === "Ironman"
        ? "Execute your fueling and hydration plan from the start."
        : "Stay controlled early and build into the race.",

      "Prioritize safe, confident execution over last-minute fitness gains.",
    ],

    workoutStructure:
      [],

    strengthStructure:
      null,

    coachAdjustment:
      undefined,
  };


  for (
    let index =
      raceDayIndex + 1;

    index <
      plan.days.length;

    index += 1
  ) {

    const existingDay =
      plan.days[index];


    plan.days[index] = {
      ...existingDay,

      isRaceDay:
        false,

      isPostRace:
        true,

      targetRaceName:
        raceName,

      sport:
        "Recovery",

      title:
        "Season complete",

      durationMinutes:
        0,

      intensity:
        "Recovery",

      performanceTarget:
        undefined,

      purpose:
        `${raceName} completed the current training season.`,

      details: [
        "No structured training is scheduled after the target race.",
        "Recover physically and mentally from race day.",
        "When you are ready, choose a new target to begin a new training cycle.",
      ],

      workoutStructure:
        [],

      strengthStructure:
        null,

      coachAdjustment:
        undefined,
    };
  }


  plan.additionalSessions =
    (
      plan.additionalSessions ??
      []
    ).filter(
      (
        session:
          TrainingPlanDay
      ) => {

        const primaryIndex =
          plan.days.findIndex(
            (day) =>
              day.day ===
                session.day
          );


        return (
          primaryIndex >= 0 &&
          primaryIndex <
            raceDayIndex
        );
      }
    );


  const totalMinutes =
    [
      ...plan.days,
      ...(
        plan.additionalSessions ??
        []
      ),
    ].reduce(
      (
        total,
        session
      ) =>
        total +
        (
          Number(
            session.durationMinutes
          ) || 0
        ),
      0
    );


  plan.totalHours =
    Number(
      (
        totalMinutes /
        60
      ).toFixed(
        2
      )
    );


  return plan;
}


export function validateTargetRaceWeekSpecialStates({
  plan,
  raceDate,
  raceName,
}: {
  plan: TrainingPlan;
  raceDate: string;
  raceName: string;
}): TargetRaceWeekValidation {

  const errors:
    string[] = [];


  if (!raceDate) {
    return {
      valid:
        true,
      errors,
    };
  }


  const raceDayIndex =
    plan.days.findIndex(
      (day) =>
        day.date ===
          raceDate
    );


  if (raceDayIndex === -1) {
    return {
      valid:
        true,
      errors,
    };
  }


  const raceDay =
    plan.days[
      raceDayIndex
    ];


  if (
    raceDay.sport !==
      "Triathlon" ||
    raceDay.isRaceDay !==
      true ||
    raceDay.isPostRace ===
      true ||
    raceDay.durationMinutes !==
      0 ||
    raceDay.targetRaceName !==
      raceName
  ) {
    errors.push(
      "Target race date does not contain the canonical Race Day state."
    );
  }


  if (
    (
      raceDay.workoutStructure ??
      []
    ).length > 0 ||
    raceDay.strengthStructure !=
      null
  ) {
    errors.push(
      "Race Day cannot retain an ordinary workout or strength structure."
    );
  }


  for (
    let index =
      raceDayIndex + 1;

    index <
      plan.days.length;

    index += 1
  ) {

    const day =
      plan.days[index];


    if (
      day.sport !==
        "Recovery" ||
      day.isPostRace !==
        true ||
      day.isRaceDay ===
        true ||
      day.durationMinutes !==
        0
    ) {
      errors.push(
        `${day.day} after the target race is not a canonical post-race Recovery state.`
      );
    }


    if (
      (
        day.workoutStructure ??
        []
      ).length > 0 ||
      day.strengthStructure !=
        null
    ) {
      errors.push(
        `${day.day} after the target race still contains executable training structure.`
      );
    }
  }


  const invalidSecondary =
    (
      plan.additionalSessions ??
      []
    ).find(
      (session) => {

        const index =
          plan.days.findIndex(
            (day) =>
              day.day ===
                session.day
          );


        return (
          index >=
          raceDayIndex
        );
      }
    );


  if (invalidSecondary) {
    errors.push(
      "A secondary session remains on or after the target race."
    );
  }


  const calculatedHours =
    Number(
      (
        [
          ...plan.days,
          ...(
            plan.additionalSessions ??
            []
          ),
        ].reduce(
          (
            total,
            session
          ) =>
            total +
            (
              Number(
                session.durationMinutes
              ) || 0
            ),
          0
        ) /
        60
      ).toFixed(
        2
      )
    );


  if (
    Math.abs(
      calculatedHours -
        plan.totalHours
    ) >
    0.01
  ) {
    errors.push(
      `Target-race week totalHours is inconsistent: expected ${calculatedHours}, received ${plan.totalHours}.`
    );
  }


  return {
    valid:
      errors.length === 0,

    errors,
  };
}
