import type {
  TrainingPlanDay,
  WorkoutStructureBlock,
} from "@/types/training";


export type WorkoutVisualSegment = {
  label: string;
  minutes: number;
  displayLabel?: string;
  effort: number;

  sport:
    | "Swim"
    | "Bike"
    | "Run"
    | "Strength";

  /*
    Visual grouping corresponds 1:1 with one canonical
    workoutStructure block.
  */
  groupIndex: number;
  groupSummary: string;
  recoverySummary?: string;

  kind:
    | "warmup"
    | "easy"
    | "work"
    | "recovery"
    | "steady"
    | "cooldown";
};


function secondsLabel(
  seconds: number
) {
  if (seconds < 60) {
    return `${seconds} s`;
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remainingSeconds =
    seconds % 60;

  if (remainingSeconds === 0) {
    return minutes === 60
      ? "1 h"
      : minutes > 60
        ? `${Math.floor(minutes / 60)} h ${
            minutes % 60
              ? `${minutes % 60} min`
              : ""
          }`.trim()
        : `${minutes} min`;
  }

  return `${minutes} min ${remainingSeconds} s`;
}


function blockMeasure({
  durationSeconds,
  distanceMeters,
}: {
  durationSeconds: number | null;
  distanceMeters: number | null;
}) {
  if (
    typeof durationSeconds === "number" &&
    durationSeconds > 0
  ) {
    return secondsLabel(
      durationSeconds
    );
  }

  if (
    typeof distanceMeters === "number" &&
    distanceMeters > 0
  ) {
    return `${distanceMeters} m`;
  }

  return "";
}


/*
  Horizontal graph weighting.

  Time-based sessions use minutes.

  Distance-based sessions use a proportional weight.
  This is only presentation width; canonical distance
  remains metres in workoutStructure.
*/
function blockWeight({
  durationSeconds,
  distanceMeters,
}: {
  durationSeconds: number | null;
  distanceMeters: number | null;
}) {
  if (
    typeof durationSeconds === "number" &&
    durationSeconds > 0
  ) {
    return Math.max(
      0.25,
      durationSeconds / 60
    );
  }

  if (
    typeof distanceMeters === "number" &&
    distanceMeters > 0
  ) {
    return Math.max(
      0.25,
      distanceMeters / 100
    );
  }

  return 1;
}


function inferEffort(
  value: string
) {
  const lower =
    value.toLowerCase();

  const rpe =
    lower.match(
      /\brpe\s*([1-9]|10)\b/i
    );

  if (rpe) {
    return Number(
      rpe[1]
    );
  }

  if (
    /sprint|vo2|maximal|anaerobic/.test(
      lower
    )
  ) {
    return 9;
  }

  if (
    /threshold|zone 4|z4|hard/.test(
      lower
    )
  ) {
    return 8;
  }

  if (
    /tempo|zone 3|z3|strong/.test(
      lower
    )
  ) {
    return 7;
  }

  if (
    /zone 2|z2|endurance|aerobic|steady/.test(
      lower
    )
  ) {
    return 5;
  }

  if (
    /recovery|very easy|easy|zone 1|z1/.test(
      lower
    )
  ) {
    return 3;
  }

  return 5;
}


function classifyWork(
  block: WorkoutStructureBlock
): WorkoutVisualSegment["kind"] {
  if (
    block.phase === "Warm-up"
  ) {
    return "warmup";
  }

  if (
    block.phase === "Cool-down"
  ) {
    return "cooldown";
  }

  if (
    block.phase === "Recovery"
  ) {
    /*
      A standalone Recovery-phase block is still active
      movement in its sport: easy spinning, easy jogging,
      relaxed swimming, etc.

      True recovery BETWEEN interval repetitions is added
      separately below as kind: "recovery".

      This keeps the visual semantics clear:
      - Easy active movement = light sport colour
      - Interval recovery = neutral recovery colour
    */
    return "easy";
  }

  const text =
    [
      block.label,
      block.workIntensity,
      block.workInstruction,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  /*
    Phase and intensity answer different questions.

    Warm-up / Cool-down / Recovery describe the ROLE
    of the block.

    A Main block remains part of the main set even when
    its intensity is easy aerobic. This prevents an easy
    aerobic Main block from looking like warm-up.
  */
  return inferEffort(text) >= 7
    ? "work"
    : "steady";
}


/*
  CANONICAL -> GRAPH

  A repeated block is expanded exactly.

  Example:
  4 x 6 min threshold
  + 4 min easy BETWEEN reps

  becomes:

  6 work
  4 recovery
  6 work
  4 recovery
  6 work
  4 recovery
  6 work

  There is deliberately NO recovery after rep 4.
*/
function blockSport(
  workout: TrainingPlanDay,
  block: WorkoutStructureBlock
):
  | "Swim"
  | "Bike"
  | "Run"
  | "Strength" {

  if (
    block.sport === "Swim" ||
    block.sport === "Bike" ||
    block.sport === "Run" ||
    block.sport === "Strength"
  ) {
    return block.sport;
  }

  /*
    Compatibility for older / imperfect structured workouts.

    Some Bike -> Run bricks were generated before block-level
    sport existed. In those plans the workout itself is "Bike",
    while the transition Run can only be identified from the
    canonical block content.

    Explicit block.sport above always has highest priority.
  */
  const blockLabel =
    block.label
      ?.trim()
      .toLowerCase() ??
    "";

  const workInstruction =
    block.workInstruction
      ?.trim()
      .toLowerCase() ??
    "";


  /*
    Legacy brick compatibility must be conservative.

    A Bike block may legitimately mention the upcoming
    run, for example:

      "10 min easy spinning before the transition run"

    Mentioning running does NOT make that Bike block a
    Run block.

    Only infer Run when the block itself clearly starts
    as a run/jog instruction. New canonical workouts
    should always use explicit block.sport.
  */
  const explicitlyRunLegacyBlock =
    /^(?:transition\s+run|brick\s+run|run\b|running\b|jog\b|jogging\b)/i
      .test(
        blockLabel
      ) ||
    /^(?:run\b|running\b|jog\b|jogging\b)/i
      .test(
        workInstruction
      );


  if (
    workout.sport === "Bike" &&
    block.phase === "Main" &&
    explicitlyRunLegacyBlock
  ) {
    return "Run";
  }


  if (
    workout.sport === "Swim" ||
    workout.sport === "Bike" ||
    workout.sport === "Run" ||
    workout.sport === "Strength"
  ) {
    return workout.sport;
  }

  return "Run";
}


function hasMeasurableWork(
  block: WorkoutStructureBlock
) {
  return (
    (
      typeof block.workDurationSeconds === "number" &&
      block.workDurationSeconds > 0
    ) ||
    (
      typeof block.workDistanceMeters === "number" &&
      block.workDistanceMeters > 0
    )
  );
}


function cleanVisualLabel(
  value: string
) {
  const label =
    value.trim();

  const lower =
    label.toLowerCase();

  if (
    lower === "main" ||
    lower === "main work" ||
    lower === "work" ||
    lower === "main set" ||
    lower === "main block"
  ) {
    return "";
  }

  return label;
}


/*
  Canonical V2 graph.

  Only measurable blocks become graph segments.
  No guessing from details[] when workoutStructure exists.
*/
export function buildWorkoutStructureSegments(
  workout: TrainingPlanDay
): WorkoutVisualSegment[] {

  const structure =
    workout.workoutStructure;

  if (
    !structure?.length
  ) {
    return [];
  }


  const segments:
    WorkoutVisualSegment[] = [];


  structure.forEach(
    (
      block,
      blockIndex
    ) => {

      if (
        !hasMeasurableWork(
          block
        )
      ) {
        return;
      }


      const sport =
        blockSport(
          workout,
          block
        );


      const repeatCount =
        Math.max(
          1,
          Math.round(
            block.repeatCount
          )
        );


      const workMeasure =
        blockMeasure({
          durationSeconds:
            block.workDurationSeconds,

          distanceMeters:
            block.workDistanceMeters,
        });


      const recoveryMeasure =
        blockMeasure({
          durationSeconds:
            block.recoveryDurationSeconds,

          distanceMeters:
            block.recoveryDistanceMeters,
        });


      const groupSummary =
        repeatCount > 1
          ? `${repeatCount} × ${
              workMeasure ||
              cleanVisualLabel(
                block.label
              )
            }`
          : (
              workMeasure ||
              cleanVisualLabel(
                block.label
              )
            );


      const recoverySummary =
        repeatCount > 1 &&
        recoveryMeasure
          ? `${recoveryMeasure} recovery`
          : undefined;


      const workText =
        [
          block.workIntensity,
          block.workInstruction,
        ]
          .filter(Boolean)
          .join(" ");


      const workWeight =
        blockWeight({
          durationSeconds:
            block.workDurationSeconds,

          distanceMeters:
            block.workDistanceMeters,
        });


      for (
        let index = 0;
        index < repeatCount;
        index += 1
      ) {

        segments.push({
          label: "",

          minutes:
            workWeight,

          displayLabel:
            workMeasure,

          effort:
            inferEffort(
              workText
            ),

          sport,

          groupIndex:
            blockIndex,

          groupSummary,

          recoverySummary,

          kind:
            classifyWork(
              block
            ),
        });


        const hasRecovery =
          (
            typeof block.recoveryDurationSeconds ===
              "number" &&
            block.recoveryDurationSeconds > 0
          ) ||
          (
            typeof block.recoveryDistanceMeters ===
              "number" &&
            block.recoveryDistanceMeters > 0
          );


        if (
          hasRecovery &&
          index <
            repeatCount - 1
        ) {

          const recoveryText =
            [
              block.recoveryIntensity,
              block.recoveryInstruction,
            ]
              .filter(Boolean)
              .join(" ");


          segments.push({
            label: "",

            minutes:
              blockWeight({
                durationSeconds:
                  block.recoveryDurationSeconds,

                distanceMeters:
                  block.recoveryDistanceMeters,
              }),

            displayLabel:
              recoveryMeasure,

            effort:
              Math.min(
                inferEffort(
                  recoveryText
                ),
                3
              ),

            sport,

            groupIndex:
              blockIndex,

            groupSummary,

            recoverySummary,

            kind:
              "recovery",
          });
        }
      }
    }
  );


  return segments;
}


/*
  CANONICAL -> WHAT TO DO

  This reads the same workoutStructure as the graph.
*/
export type WorkoutExecutionRow = {
  execution: string;
  subExecution?: string;
  guidance: string;
  phase:
    | "Warm-up"
    | "Main"
    | "Recovery"
    | "Cool-down";
};


function cleanGuidancePart(
  value:
    | string
    | null
    | undefined
) {
  const cleaned =
    value
      ?.trim()
      .replace(
        /\s+/g,
        " "
      );

  return cleaned || "";
}


/*
  Canonical workoutStructure -> two-column UI.

  LEFT:
  exactly what the athlete needs to execute.

  RIGHT:
  intensity, feel and coaching cues.

  Both columns come from the SAME block data.
*/
function removeEmbeddedPerformanceTarget(
  value: string,
  performanceTarget?: string
) {
  if (!performanceTarget) {
    return value;
  }


  /*
    Canonical performanceTarget is the one numerical
    prescription shown in Guidance.

    Remove legacy/generated numeric targets from
    workIntensity so the athlete never sees two targets
    for the same block.
  */
  return value
    .replace(
      /\b\d+\s*[–-]\s*\d+\s*W(?:\s*\([^)]*FTP\))?/gi,
      ""
    )
    .replace(
      /\b\d+:\d{2}\s*[–-]\s*\d+:\d{2}\/km\b/gi,
      ""
    )
    .replace(
      /\b\d+:\d{2}\s*[–-]\s*\d+:\d{2}\/100\s*m\b/gi,
      ""
    )
    .replace(
      /\s*·\s*·\s*/g,
      " · "
    )
    .replace(
      /^\s*·\s*|\s*·\s*$/g,
      ""
    )
    .replace(
      /\s{2,}/g,
      " "
    )
    .trim();
}


export function getWorkoutExecutionRows(
  workout: TrainingPlanDay
): WorkoutExecutionRow[] {

  const structure =
    workout.workoutStructure;

  if (
    !structure?.length
  ) {
    return [];
  }


  const sports =
    new Set(
      structure.map(
        (block) =>
          blockSport(
            workout,
            block
          )
      )
    );


  const multiSport =
    sports.size > 1;


  return structure.map(
    (block) => {

      const sport =
        blockSport(
          workout,
          block
        );


      const repeatCount =
        Math.max(
          1,
          Math.round(
            block.repeatCount
          )
        );


      const workMeasure =
        blockMeasure({
          durationSeconds:
            block.workDurationSeconds,

          distanceMeters:
            block.workDistanceMeters,
        });


      const workIntensity =
        cleanGuidancePart(
          removeEmbeddedPerformanceTarget(
            block.workIntensity,
            block.performanceTarget
          )
        );


      const workInstruction =
        cleanGuidancePart(
          block.workInstruction
        );


      const hasRecovery =
        (
          typeof block.recoveryDurationSeconds === "number" &&
          block.recoveryDurationSeconds > 0
        ) ||
        (
          typeof block.recoveryDistanceMeters === "number" &&
          block.recoveryDistanceMeters > 0
        );


      const recoveryMeasure =
        hasRecovery
          ? blockMeasure({
              durationSeconds:
                block.recoveryDurationSeconds,

              distanceMeters:
                block.recoveryDistanceMeters,
            })
          : "";


      const recoveryIntensity =
        cleanGuidancePart(
          block.recoveryIntensity
        );


      const recoveryInstruction =
        cleanGuidancePart(
          block.recoveryInstruction
        );


      const sportPrefix =
        multiSport
          ? `${sport} · `
          : "";


      if (
        block.kind === "repeat" ||
        repeatCount > 1
      ) {
        const measureText =
          workMeasure ||
          cleanGuidancePart(
            block.label
          ) ||
          "repetition";


        const execution =
          `${sportPrefix}${repeatCount} × ${measureText}`;


        const subExecution =
          hasRecovery
            ? `${recoveryMeasure} easy between reps`
            : undefined;


        const workGuidance =
          [
            workIntensity,

            block.performanceTarget
              ? `Target: ${block.performanceTarget}`
              : "",

            workInstruction,
          ]
            .filter(Boolean)
            .join(" · ");


        const recoveryGuidance =
          hasRecovery
            ? [
                recoveryIntensity,
                recoveryInstruction,
              ]
                .filter(Boolean)
                .join(" · ")
            : "";


        return {
          execution,
          subExecution,

          guidance:
            [
              workGuidance,

              recoveryGuidance
                ? `Recovery: ${recoveryGuidance}`
                : "",
            ]
              .filter(Boolean)
              .join(" | "),

          phase:
            block.phase,
        };
      }


      const label =
        cleanGuidancePart(
          block.label
        );


      const measurableExecution =
        [
          workMeasure,
          label,
        ]
          .filter(Boolean)
          .join(" · ");


      const executionCore =
        measurableExecution ||
        label ||
        workInstruction ||
        "Training block";


      const guidance =
        [
          workIntensity,

          block.performanceTarget
            ? `Target: ${block.performanceTarget}`
            : "",

          workInstruction !== executionCore
            ? workInstruction
            : "",
        ]
          .filter(Boolean)
          .join(" · ");


      return {
        execution:
          `${sportPrefix}${executionCore}`,

        guidance:
          guidance ||
          "Follow the prescribed effort.",

        phase:
          block.phase,
      };
    }
  );
}


export function getWorkoutExecutionSteps(
  workout: TrainingPlanDay
): string[] {
  const structure =
    workout.workoutStructure;

  if (
    !structure?.length
  ) {
    return [];
  }

  return structure.map(
    (block) => {
      const repeatCount =
        Math.max(
          1,
          Math.round(
            block.repeatCount
          )
        );

      const workMeasure =
        blockMeasure({
          durationSeconds:
            block.workDurationSeconds,

          distanceMeters:
            block.workDistanceMeters,
        });

      /*
        What to do should be an execution recipe,
        not a coaching essay.

        Detailed instruction remains available in the
        canonical workoutStructure for richer coaching
        surfaces below the main workout.
      */
      const workIntensity =
        block.workIntensity
          ?.trim();

      const workCore =
        [
          workMeasure,
          workIntensity,
        ]
          .filter(Boolean)
          .join(" · ");

      const hasRecovery =
        (
          typeof block.recoveryDurationSeconds ===
            "number" &&
          block.recoveryDurationSeconds > 0
        ) ||
        (
          typeof block.recoveryDistanceMeters ===
            "number" &&
          block.recoveryDistanceMeters > 0
        );

      if (
        block.kind === "repeat" ||
        repeatCount > 1
      ) {
        const recoveryMeasure =
          hasRecovery
            ? blockMeasure({
                durationSeconds:
                  block.recoveryDurationSeconds,

                distanceMeters:
                  block.recoveryDistanceMeters,
              })
            : "";

        const recoveryIntensity =
          block.recoveryIntensity
            ?.trim();

        const recoveryCore =
          [
            recoveryMeasure,
            recoveryIntensity,
          ]
            .filter(Boolean)
            .join(" · ");

        return recoveryCore
          ? `${repeatCount} × ${workCore} · ${recoveryCore} between reps`
          : `${repeatCount} × ${workCore}`;
      }

      /*
        Use the block label for phase clarity,
        but avoid repeating equivalent wording.
      */
      const normalizedLabel =
        block.label
          ?.trim();

      if (
        normalizedLabel &&
        workIntensity &&
        normalizedLabel
          .toLowerCase() ===
          workIntensity.toLowerCase()
      ) {
        return workMeasure
          ? `${workMeasure} · ${workIntensity}`
          : workIntensity;
      }

      return [
        normalizedLabel,
        workCore,
      ]
        .filter(Boolean)
        .join(" · ");
    }
  );
}
