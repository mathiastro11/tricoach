import type {
  TargetRace,
} from "@/types/training";


export type GoalChangeAction =
  | "KEEP"
  | "ADAPT_FUTURE"
  | "ADAPT_CURRENT_AND_FUTURE"
  | "REBUILD_ROADMAP";


export type GoalChangeFactor = {
  key: string;
  label: string;
  score: number;
  detail: string;
};


export type GoalChangeDecision = {
  action: GoalChangeAction;

  score: number;

  headline: string;

  explanation: string;

  factors: GoalChangeFactor[];

  preserveCurrentWeek: boolean;
  preserveCompletedTraining: true;
  preserveManualSessions: true;

  rebuildRoadmap: boolean;
};


const FORMAT_LEVEL: Record<
  TargetRace["format"],
  number
> = {
  Sprint: 1,
  Olympic: 2,
  "70.3": 3,
  Ironman: 4,
  Other: 2,
};


function daysBetween(
  a?: string,
  b?: string
) {
  if (!a || !b) {
    return 0;
  }

  const first =
    new Date(`${a}T12:00:00`);

  const second =
    new Date(`${b}T12:00:00`);

  if (
    Number.isNaN(first.getTime()) ||
    Number.isNaN(second.getTime())
  ) {
    return 0;
  }

  return Math.round(
    Math.abs(
      second.getTime() -
      first.getTime()
    ) /
      86400000
  );
}


function weeksUntil(
  date?: string,
  now = new Date()
) {
  if (!date) {
    return null;
  }

  const race =
    new Date(`${date}T12:00:00`);

  if (
    Number.isNaN(
      race.getTime()
    )
  ) {
    return null;
  }

  return Math.max(
    0,
    (
      race.getTime() -
      now.getTime()
    ) /
      (7 * 86400000)
  );
}


function relativeDifference(
  oldValue:
    | number
    | null
    | undefined,

  newValue:
    | number
    | null
    | undefined
) {
  if (
    oldValue == null ||
    newValue == null
  ) {
    return 0;
  }

  if (oldValue <= 0) {
    return newValue > 0
      ? 1
      : 0;
  }

  return Math.abs(
    newValue - oldValue
  ) / oldValue;
}


function distanceScore(
  label: string,

  oldValue:
    | number
    | null
    | undefined,

  newValue:
    | number
    | null
    | undefined
): GoalChangeFactor | null {

  if (
    oldValue == null ||
    newValue == null
  ) {
    return null;
  }

  const diff =
    relativeDifference(
      oldValue,
      newValue
    );

  let score = 0;

  if (diff >= 1) {
    score = 22;
  } else if (diff >= 0.5) {
    score = 15;
  } else if (diff >= 0.2) {
    score = 8;
  } else if (diff >= 0.08) {
    score = 3;
  }

  if (score === 0) {
    return null;
  }

  return {
    key:
      `${label.toLowerCase()}-distance`,

    label:
      `${label} distance`,

    score,

    detail:
      `${oldValue} km → ${newValue} km`,
  };
}


function elevationScore(
  label: string,

  oldValue:
    | number
    | null
    | undefined,

  newValue:
    | number
    | null
    | undefined
): GoalChangeFactor | null {

  if (
    oldValue == null ||
    newValue == null
  ) {
    return null;
  }

  const difference =
    Math.abs(
      newValue -
      oldValue
    );

  let score = 0;

  if (difference >= 2500) {
    score = 18;
  } else if (
    difference >= 1500
  ) {
    score = 13;
  } else if (
    difference >= 750
  ) {
    score = 8;
  } else if (
    difference >= 300
  ) {
    score = 4;
  }

  if (!score) {
    return null;
  }

  return {
    key:
      `${label.toLowerCase()}-elevation`,

    label:
      `${label} elevation`,

    score,

    detail:
      `${oldValue} m → ${newValue} m`,
  };
}


function categoricalFactor(
  key: string,
  label: string,
  oldValue: unknown,
  newValue: unknown,
  score: number
): GoalChangeFactor | null {

  if (
    !oldValue ||
    !newValue ||
    oldValue === "Unknown" ||
    newValue === "Unknown" ||
    oldValue === newValue
  ) {
    return null;
  }

  return {
    key,
    label,
    score,

    detail:
      `${String(oldValue)} → ${String(newValue)}`,
  };
}


export function evaluateGoalChange(
  previousRace:
    TargetRace | null | undefined,

  nextRace:
    TargetRace,

  now = new Date()
): GoalChangeDecision {

  /*
    First target race:
    there is no previous race-specific strategy
    to preserve.
  */
  if (!previousRace) {
    return {
      action:
        "REBUILD_ROADMAP",

      score: 100,

      headline:
        "New race goal",

      explanation:
        "Basse should build the long-term strategy around the newly selected race.",

      factors: [],

      preserveCurrentWeek:
        true,

      preserveCompletedTraining:
        true,

      preserveManualSessions:
        true,

      rebuildRoadmap:
        true,
    };
  }


  const factors:
    GoalChangeFactor[] = [];


  /*
    Race format / overall distance class.
  */
  const oldFormatLevel =
    FORMAT_LEVEL[
      previousRace.format
    ];

  const newFormatLevel =
    FORMAT_LEVEL[
      nextRace.format
    ];

  const formatDifference =
    Math.abs(
      newFormatLevel -
      oldFormatLevel
    );

  if (formatDifference > 0) {
    factors.push({
      key:
        "race-format",

      label:
        "Race format",

      score:
        formatDifference >= 2
          ? 28
          : 16,

      detail:
        `${previousRace.format} → ${nextRace.format}`,
    });
  }


  /*
    Race date.
  */
  const dateDifference =
    daysBetween(
      previousRace.date,
      nextRace.date
    );

  if (dateDifference >= 84) {
    factors.push({
      key: "race-date",
      label: "Race date",
      score: 25,
      detail:
        `${dateDifference} days difference`,
    });
  } else if (
    dateDifference >= 42
  ) {
    factors.push({
      key: "race-date",
      label: "Race date",
      score: 16,
      detail:
        `${dateDifference} days difference`,
    });
  } else if (
    dateDifference >= 14
  ) {
    factors.push({
      key: "race-date",
      label: "Race date",
      score: 7,
      detail:
        `${dateDifference} days difference`,
    });
  }


  /*
    Discipline distances.
  */
  const distanceFactors = [
    distanceScore(
      "Swim",
      previousRace.swim
        ?.distanceKm,
      nextRace.swim
        ?.distanceKm
    ),

    distanceScore(
      "Bike",
      previousRace.bike
        ?.distanceKm,
      nextRace.bike
        ?.distanceKm
    ),

    distanceScore(
      "Run",
      previousRace.run
        ?.distanceKm,
      nextRace.run
        ?.distanceKm
    ),
  ].filter(
    (
      factor
    ): factor is GoalChangeFactor =>
      factor !== null
  );

  factors.push(
    ...distanceFactors
  );


  /*
    Course climbing.
  */
  const elevationFactors = [
    elevationScore(
      "Bike",
      previousRace.bike
        ?.elevationGainM,
      nextRace.bike
        ?.elevationGainM
    ),

    elevationScore(
      "Run",
      previousRace.run
        ?.elevationGainM,
      nextRace.run
        ?.elevationGainM
    ),
  ].filter(
    (
      factor
    ): factor is GoalChangeFactor =>
      factor !== null
  );

  factors.push(
    ...elevationFactors
  );


  /*
    Course character.
  */
  const categoryFactors = [
    categoricalFactor(
      "swim-environment",
      "Swim environment",
      previousRace.swim
        ?.environment,
      nextRace.swim
        ?.environment,
      5
    ),

    categoricalFactor(
      "bike-profile",
      "Bike profile",
      previousRace.bike
        ?.profile,
      nextRace.bike
        ?.profile,
      8
    ),

    categoricalFactor(
      "bike-technicality",
      "Bike technicality",
      previousRace.bike
        ?.technicality,
      nextRace.bike
        ?.technicality,
      5
    ),

    categoricalFactor(
      "run-profile",
      "Run profile",
      previousRace.run
        ?.profile,
      nextRace.run
        ?.profile,
      8
    ),

    categoricalFactor(
      "run-surface",
      "Run surface",
      previousRace.run
        ?.surface,
      nextRace.run
        ?.surface,
      7
    ),
  ].filter(
    (
      factor
    ): factor is GoalChangeFactor =>
      factor !== null
  );

  factors.push(
    ...categoryFactors
  );


  /*
    Race-specific characteristics.

    We intentionally score this lightly.
    Characteristics should refine a plan,
    not dominate the decision.
  */
  const oldCharacteristics =
    new Set(
      previousRace
        .characteristics ??
        []
    );

  const newCharacteristics =
    nextRace
      .characteristics ??
      [];

  const newSpecificDemands =
    newCharacteristics.filter(
      (item) =>
        !oldCharacteristics.has(
          item
        )
    );

  if (
    newSpecificDemands.length >= 3
  ) {
    factors.push({
      key:
        "race-characteristics",

      label:
        "Race-specific demands",

      score: 6,

      detail:
        `${newSpecificDemands.length} meaningful new course demands`,
    });
  }


  /*
    Sum but cap the score.
  */
  let score =
    Math.min(
      100,
      factors.reduce(
        (
          total,
          factor
        ) =>
          total +
          factor.score,
        0
      )
    );


  const weeksRemaining =
    weeksUntil(
      nextRace.date,
      now
    );


  /*
    A meaningful change close to race day
    deserves more attention because there is
    less time to adapt safely.
  */
  if (
    weeksRemaining !== null &&
    weeksRemaining <= 8 &&
    score >= 15
  ) {
    score =
      Math.min(
        100,
        score + 10
      );

    factors.push({
      key:
        "race-proximity",

      label:
        "Race proximity",

      score: 10,

      detail:
        `${Math.max(
          0,
          Math.round(
            weeksRemaining
          )
        )} weeks remaining`,
    });
  }


  let action:
    GoalChangeAction;


  if (score < 8) {
    action = "KEEP";
  } else if (score < 25) {
    action =
      "ADAPT_FUTURE";
  } else if (score < 50) {
    action =
      "ADAPT_CURRENT_AND_FUTURE";
  } else {
    action =
      "REBUILD_ROADMAP";
  }


  const headline =
    action === "KEEP"
      ? "Your current strategy still fits"
      : action ===
          "ADAPT_FUTURE"
        ? "Small goal adjustment"
        : action ===
            "ADAPT_CURRENT_AND_FUTURE"
          ? "Training should adapt"
          : "Your season strategy should be rebuilt";


  const explanation =
    action === "KEEP"
      ? "The new race has similar enough demands that Basse can keep the current training direction."
      : action ===
          "ADAPT_FUTURE"
        ? "The new goal changes some race demands, but the current week can stay intact while future training becomes more specific."
        : action ===
            "ADAPT_CURRENT_AND_FUTURE"
          ? "The goal change is meaningful enough to review the remaining current-week training and adapt future weeks."
          : "The new race meaningfully changes the time horizon or physical demands, so Basse should rebuild the roadmap from the athlete's current state.";


  return {
    action,
    score,
    headline,
    explanation,
    factors,

    preserveCurrentWeek:
      action === "KEEP" ||
      action ===
        "ADAPT_FUTURE" ||
      action ===
        "REBUILD_ROADMAP",

    preserveCompletedTraining:
      true,

    preserveManualSessions:
      true,

    rebuildRoadmap:
      action ===
        "REBUILD_ROADMAP",
  };
}
