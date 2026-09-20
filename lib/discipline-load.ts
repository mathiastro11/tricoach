import type {
  TrainingArchiveWeek,
  TrainingPlan,
  WorkoutFeedback,
} from "@/types/training";

import {
  workoutMatchesFeedback,
} from "@/lib/workout-feedback-match";


const DISCIPLINES = [
  "Swim",
  "Bike",
  "Run",
  "Strength",
] as const;

type Discipline =
  typeof DISCIPLINES[number];


export type DisciplineLoadStatus =
  | "Insufficient data"
  | "Normal"
  | "Elevated"
  | "Large increase"
  | "Reduced";


export type DisciplineLoadSignal = {
  discipline: Discipline;

  proposedMinutes: number;

  recentMinutes: number[];
  recentMedianMinutes: number | null;
  recentMaxMinutes: number | null;

  absoluteChangeFromMedian:
    number | null;

  percentChangeFromMedian:
    number | null;

  status:
    DisciplineLoadStatus;

  confidence:
    | "Low"
    | "Moderate"
    | "High";

  reason: string;
};


export type DisciplineLoadState = {
  weeksAnalyzed: number;

  disciplines:
    Record<
      Discipline,
      DisciplineLoadSignal
    >;

  warnings: string[];

  planningNotes: string[];
};


function median(
  values: number[]
): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if (
    sorted.length % 2 === 0
  ) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}


function workoutStructureMinutesForDiscipline(
  session: TrainingPlan["days"][number],
  discipline: Discipline
): number | null {

  const blocks =
    session.workoutStructure ?? [];


  const disciplineBlocks =
    blocks.filter(
      (block) =>
        block.sport === discipline
    );


  if (disciplineBlocks.length === 0) {
    return null;
  }


  let totalSeconds = 0;


  for (const block of disciplineBlocks) {

    /*
      Canonical planned discipline time is only known when
      every relevant block has explicit time data.

      Never estimate duration from distance.
    */
    if (
      typeof block.workDurationSeconds !==
        "number" ||
      block.workDurationSeconds < 0
    ) {
      return null;
    }


    const repeatCount =
      Math.max(
        1,
        Math.round(
          block.repeatCount
        )
      );


    totalSeconds +=
      block.workDurationSeconds *
      repeatCount;


    if (
      repeatCount > 1 &&
      typeof block.recoveryDurationSeconds ===
        "number" &&
      block.recoveryDurationSeconds > 0
    ) {
      totalSeconds +=
        block.recoveryDurationSeconds *
        (
          repeatCount - 1
        );
    }
  }


  return totalSeconds / 60;
}


function plannedMinutesForSessionDiscipline(
  session: TrainingPlan["days"][number],
  discipline: Discipline
): number {

  /*
    Canonical structured sessions may contain more than
    one discipline, for example Bike -> Run bricks.

    Prefer block-level discipline time whenever it is
    available so the Run portion is not hidden behind
    top-level sport="Bike".
  */
  const structuredMinutes =
    workoutStructureMinutesForDiscipline(
      session,
      discipline
    );


  if (structuredMinutes !== null) {
    return structuredMinutes;
  }


  /*
    Backwards-compatible single-sport fallback.
  */
  if (
    session.sport === discipline
  ) {
    return (
      session.durationMinutes ??
      0
    );
  }


  return 0;
}


function disciplineMinutesFromPlan(
  plan: TrainingPlan,
  discipline: Discipline
) {

  const primary =
    plan.days ?? [];

  const additional =
    plan.additionalSessions ?? [];


  return [
    ...primary,
    ...additional,
  ].reduce(
    (
      sum,
      session
    ) =>
      sum +
      plannedMinutesForSessionDiscipline(
        session,
        discipline
      ),
    0
  );
}


function feedbackHasDiscipline(
  item: WorkoutFeedback,
  discipline: Discipline
) {
  const splits =
    item.disciplineSplits ?? [];


  if (splits.length > 0) {
    return splits.some(
      (split) =>
        split.sport === discipline
    );
  }


  return (
    item.sport === discipline
  );
}


function actualMinutesForFeedbackDiscipline(
  item: WorkoutFeedback,
  discipline: Discipline
): number {

  const splits =
    item.disciplineSplits ?? [];


  /*
    disciplineSplits are canonical for connected
    multi-discipline execution such as Bike -> Run bricks.
  */
  if (splits.length > 0) {
    const split =
      splits.find(
        (candidate) =>
          candidate.sport === discipline
      );


    if (!split) {
      return 0;
    }


    if (
      item.status === "Skipped"
    ) {
      return 0;
    }


    return (
      split.actualDurationMinutes ??
      split.plannedDurationMinutes ??
      0
    );
  }


  /*
    Backwards-compatible single-sport feedback.
  */
  if (
    item.sport !== discipline
  ) {
    return 0;
  }


  if (
    item.status === "Skipped"
  ) {
    return 0;
  }


  return (
    item.actualDurationMinutes ??
    item.plannedDurationMinutes ??
    0
  );
}




function getWeekMinutes({
  archiveWeek,
  discipline,
}: {
  archiveWeek:
    TrainingArchiveWeek;

  discipline:
    Discipline;
}) {

  /*
    Historical load must be reconciled PER SESSION.

    For each planned session:

    - matched feedback:
      use actual execution for this discipline

    - no matched feedback:
      execution is unknown, so preserve planned exposure

    This prevents one logged Swim from making another
    unlogged Swim in the same week silently disappear.

    Feedback matching uses the shared canonical rules:
    sessionId -> date+sport+title -> weekday+sport+title.
  */
  const plannedSessions = [
    ...(
      archiveWeek.plan.days ??
      []
    ),

    ...(
      archiveWeek.plan
        .additionalSessions ??
      []
    ),
  ];


  const feedback =
    archiveWeek.feedback ??
    [];


  /*
    Consume feedback one-to-one.

    This matters for legacy records where two planned
    sessions could otherwise both match the same old
    feedback record through fallback identity.
  */
  const usedFeedbackIndexes =
    new Set<number>();


  let totalMinutes =
    0;


  for (
    const session
    of plannedSessions
  ) {

    let matchedIndex =
      -1;


    /*
      Match newest compatible feedback first, mirroring
      the shared findWorkoutFeedback() behavior while
      still allowing one-to-one consumption.
    */
    for (
      let index =
        feedback.length - 1;

      index >= 0;

      index -=
        1
    ) {

      if (
        usedFeedbackIndexes.has(
          index
        )
      ) {
        continue;
      }


      if (
        workoutMatchesFeedback(
          session,
          feedback[index]
        )
      ) {
        matchedIndex =
          index;

        break;
      }
    }


    if (
      matchedIndex >=
      0
    ) {

      usedFeedbackIndexes.add(
        matchedIndex
      );


      const matchedFeedback =
        feedback[
          matchedIndex
        ];


      /*
        A matched feedback record is authoritative.

        If this discipline is absent from a matched
        multi-discipline execution, its actual exposure
        is zero rather than an unknown planned fallback.

        Explicit Skipped feedback likewise remains zero.
      */
      if (
        feedbackHasDiscipline(
          matchedFeedback,
          discipline
        )
      ) {
        totalMinutes +=
          actualMinutesForFeedbackDiscipline(
            matchedFeedback,
            discipline
          );
      }


      continue;
    }


    /*
      No feedback for THIS planned session:
      preserve its planned discipline exposure because
      actual execution is unknown.
    */
    totalMinutes +=
      plannedMinutesForSessionDiscipline(
        session,
        discipline
      );
  }


  /*
    Preserve genuine extra / unplanned completed work.

    Feedback that does not match any archived planned
    session still represents real athlete load and must
    not disappear from history.
  */
  feedback.forEach(
    (
      item,
      index
    ) => {

      if (
        usedFeedbackIndexes.has(
          index
        ) ||
        !feedbackHasDiscipline(
          item,
          discipline
        )
      ) {
        return;
      }


      totalMinutes +=
        actualMinutesForFeedbackDiscipline(
          item,
          discipline
        );
    }
  );


  return totalMinutes;
}


function classifyDiscipline({
  discipline,
  proposedMinutes,
  recentMinutes,
}: {
  discipline: Discipline;
  proposedMinutes: number;
  recentMinutes: number[];
}): DisciplineLoadSignal {

  const usefulHistory =
    recentMinutes.filter(
      (value) => value >= 0
    );

  const recentMedian =
    median(usefulHistory);

  const recentMax =
    usefulHistory.length > 0
      ? Math.max(
          ...usefulHistory
        )
      : null;


  const confidence:
    DisciplineLoadSignal["confidence"] =
      usefulHistory.length >= 5
        ? "High"
        : usefulHistory.length >= 3
        ? "Moderate"
        : "Low";


  if (
    usefulHistory.length < 2 ||
    recentMedian === null
  ) {
    return {
      discipline,

      proposedMinutes,
      recentMinutes:
        usefulHistory,

      recentMedianMinutes:
        recentMedian,

      recentMaxMinutes:
        recentMax,

      absoluteChangeFromMedian:
        null,

      percentChangeFromMedian:
        null,

      status:
        "Insufficient data",

      confidence,

      reason:
        "There is not enough recent discipline-specific history for a strong load comparison.",
    };
  }


  const absoluteChange =
    proposedMinutes -
    recentMedian;

  const percentChange =
    recentMedian > 0
      ? Math.round(
          (
            absoluteChange /
            recentMedian
          ) * 100
        )
      : null;


  /*
    These are coaching heuristics, not
    injury-risk thresholds.

    They combine:
    - the athlete's own recent median
    - the athlete's recent maximum
    - an absolute-minute change

    Running is treated more conservatively
    because of its greater mechanical loading.

    We deliberately do NOT use a universal
    weekly "10% rule".
  */

  const absoluteFloor =
    discipline === "Run"
      ? 30
      : discipline === "Strength"
      ? 25
      : 45;


  const largeAbsoluteFloor =
    discipline === "Run"
      ? 45
      : discipline === "Strength"
      ? 40
      : 60;


  const elevatedRelative =
    discipline === "Run"
      ? 1.20
      : 1.25;


  const largeRelative =
    discipline === "Run"
      ? 1.35
      : 1.45;


  const aboveRecentMax =
    recentMax !== null
      ? proposedMinutes -
          recentMax
      : 0;


  if (
    proposedMinutes <
      recentMedian * 0.75 &&
    absoluteChange <=
      -absoluteFloor
  ) {
    return {
      discipline,
      proposedMinutes,
      recentMinutes:
        usefulHistory,

      recentMedianMinutes:
        Math.round(
          recentMedian
        ),

      recentMaxMinutes:
        recentMax,

      absoluteChangeFromMedian:
        Math.round(
          absoluteChange
        ),

      percentChangeFromMedian:
        percentChange,

      status:
        "Reduced",

      confidence,

      reason:
        `${discipline} volume is meaningfully below the athlete's recent typical volume.`,
    };
  }


  const largeIncrease =
    proposedMinutes >=
      recentMedian *
        largeRelative &&
    absoluteChange >=
      largeAbsoluteFloor &&
    (
      recentMax === null ||
      aboveRecentMax >=
        Math.round(
          largeAbsoluteFloor / 2
        )
    );


  if (largeIncrease) {
    return {
      discipline,
      proposedMinutes,
      recentMinutes:
        usefulHistory,

      recentMedianMinutes:
        Math.round(
          recentMedian
        ),

      recentMaxMinutes:
        recentMax,

      absoluteChangeFromMedian:
        Math.round(
          absoluteChange
        ),

      percentChangeFromMedian:
        percentChange,

      status:
        "Large increase",

      confidence,

      reason:
        `${discipline} volume is substantially above both recent typical exposure and recent high exposure.`,
    };
  }


  const elevated =
    proposedMinutes >=
      recentMedian *
        elevatedRelative &&
    absoluteChange >=
      absoluteFloor;


  if (elevated) {
    return {
      discipline,
      proposedMinutes,
      recentMinutes:
        usefulHistory,

      recentMedianMinutes:
        Math.round(
          recentMedian
        ),

      recentMaxMinutes:
        recentMax,

      absoluteChangeFromMedian:
        Math.round(
          absoluteChange
        ),

      percentChangeFromMedian:
        percentChange,

      status:
        "Elevated",

      confidence,

      reason:
        `${discipline} volume is above the athlete's recent typical exposure.`,
    };
  }


  return {
    discipline,
    proposedMinutes,
    recentMinutes:
      usefulHistory,

    recentMedianMinutes:
      Math.round(
        recentMedian
      ),

    recentMaxMinutes:
      recentMax,

    absoluteChangeFromMedian:
      Math.round(
        absoluteChange
      ),

    percentChangeFromMedian:
      percentChange,

    status:
      "Normal",

    confidence,

    reason:
      `${discipline} volume is broadly consistent with recent training exposure.`,
  };
}


export function buildDisciplineLoadState({
  proposedPlan,
  trainingArchive = [],
}: {
  proposedPlan: TrainingPlan;

  trainingArchive?:
    TrainingArchiveWeek[];
}): DisciplineLoadState {

  /*
    Six weeks is long enough to create useful
    context while still reflecting current fitness.

    Old seasons should not dominate decisions.
  */

  const recentArchive =
    trainingArchive.slice(-6);


  const disciplines =
    {} as Record<
      Discipline,
      DisciplineLoadSignal
    >;


  const warnings:
    string[] = [];

  const planningNotes:
    string[] = [];


  for (
    const discipline
    of DISCIPLINES
  ) {

    const recentMinutes =
      recentArchive.map(
        (week) =>
          getWeekMinutes({
            archiveWeek:
              week,

            discipline,
          })
      );


    const proposedMinutes =
      disciplineMinutesFromPlan(
        proposedPlan,
        discipline
      );


    const signal =
      classifyDiscipline({
        discipline,
        proposedMinutes,
        recentMinutes,
      });


    disciplines[
      discipline
    ] = signal;


    if (
      signal.status ===
        "Large increase"
    ) {
      warnings.push(
        `${discipline}: proposed ${proposedMinutes} min versus recent median ${signal.recentMedianMinutes ?? "unknown"} min. This is a large discipline-specific increase.`
      );
    }


    if (
      signal.status ===
        "Elevated"
    ) {
      planningNotes.push(
        `${discipline} volume is elevated relative to recent history. Confirm that the progression is intentional and supported by recovery.`
      );
    }


    if (
      discipline === "Run" &&
      signal.status ===
        "Large increase"
    ) {
      planningNotes.push(
        "Running has a large proposed increase. Prefer a smaller progression unless race timing, recent execution and recovery provide a strong reason otherwise."
      );
    }
  }


  return {
    weeksAnalyzed:
      recentArchive.length,

    disciplines,

    warnings,
    planningNotes,
  };
}
