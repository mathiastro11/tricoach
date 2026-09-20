import type {
  TrainingPlan,
  TrainingPlanDay,
} from "@/types/training";


export type CanonicalWorkoutValidationResult = {
  valid: boolean;
  errors: string[];
};


const ENDURANCE_SPORTS =
  new Set([
    "Swim",
    "Bike",
    "Run",
  ]);


const BLOCK_SPORTS =
  new Set([
    "Swim",
    "Bike",
    "Run",
  ]);


const PHASES =
  new Set([
    "Warm-up",
    "Main",
    "Recovery",
    "Cool-down",
  ]);


const STRENGTH_GOALS =
  new Set([
    "Adaptation",
    "MaxStrength",
    "StrengthPower",
    "Maintenance",
    "Taper",
  ]);


const MOVEMENT_PATTERNS =
  new Set([
    "Squat",
    "Hinge",
    "Single-leg",
    "Calf",
    "Pull",
    "Push",
    "Trunk",
    "Power",
  ]);


const EXERCISE_KEYS =
  new Set([
    "back-squat",
    "front-squat",
    "goblet-squat",
    "leg-press",
    "hack-squat",
    "romanian-deadlift",
    "trap-bar-deadlift",
    "hip-thrust",
    "bulgarian-split-squat",
    "reverse-lunge",
    "step-up",
    "single-leg-press",
    "seated-calf-raise",
    "standing-calf-raise",
    "single-leg-calf-raise",
    "pull-up",
    "lat-pulldown",
    "chest-supported-row",
    "cable-row",
    "bench-press",
    "incline-dumbbell-press",
    "dumbbell-press",
    "push-up",
    "landmine-press",
    "pallof-press",
    "dead-bug",
    "side-plank",
    "cable-anti-rotation",
    "carry",
    "countermovement-jump",
    "box-jump",
    "jump-squat",
    "other",
  ]);


function isObject(
  value: unknown
): value is Record<
  string,
  unknown
> {

  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}


function isNonEmptyString(
  value: unknown
): value is string {

  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}


function isFiniteNonNegative(
  value: unknown
): value is number {

  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}


function isPositiveNumber(
  value: unknown
): value is number {

  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}


function labelOf(
  workout: TrainingPlanDay,
  index: number,
  secondary: boolean
) {

  return `${
    secondary
      ? "Secondary"
      : "Primary"
  } ${workout.day || `#${index + 1}`} "${workout.title || "Untitled"}"`;
}


function validateStrengthStructure(
  workout: TrainingPlanDay,
  label: string,
  errors: string[]
) {

  const structure =
    workout.strengthStructure as unknown;


  if (!isObject(structure)) {

    errors.push(
      `${label} is Strength but has no valid strengthStructure.`
    );

    return;
  }


  if (
    !STRENGTH_GOALS.has(
      String(structure.goal)
    )
  ) {

    errors.push(
      `${label} has invalid strength goal.`
    );
  }


  if (
    !Array.isArray(
      structure.warmup
    ) ||
    structure.warmup.length === 0 ||
    !structure.warmup.every(
      isNonEmptyString
    )
  ) {

    errors.push(
      `${label} must contain practical strength warm-up instructions.`
    );
  }


  if (
    !Array.isArray(
      structure.exercises
    ) ||
    structure.exercises.length === 0
  ) {

    errors.push(
      `${label} Strength session must contain at least one prescribed exercise.`
    );

    return;
  }


  structure.exercises.forEach(
    (
      exercise,
      exerciseIndex
    ) => {

      if (!isObject(exercise)) {

        errors.push(
          `${label} exercise ${exerciseIndex + 1} is structurally invalid.`
        );

        return;
      }


      if (
        !EXERCISE_KEYS.has(
          String(
            exercise.exerciseKey
          )
        )
      ) {

        errors.push(
          `${label} exercise ${exerciseIndex + 1} has invalid exerciseKey.`
        );
      }


      if (
        !isNonEmptyString(
          exercise.name
        )
      ) {

        errors.push(
          `${label} exercise ${exerciseIndex + 1} is missing its name.`
        );
      }


      if (
        !MOVEMENT_PATTERNS.has(
          String(
            exercise.movementPattern
          )
        )
      ) {

        errors.push(
          `${label} exercise ${exerciseIndex + 1} has invalid movementPattern.`
        );
      }


      if (
        typeof exercise.sets !== "number" ||
        !Number.isInteger(
          exercise.sets
        ) ||
        exercise.sets < 1
      ) {

        errors.push(
          `${label} exercise ${exerciseIndex + 1} must have a positive integer number of working sets.`
        );
      }


      if (
        !isNonEmptyString(
          exercise.reps
        ) ||
        !isNonEmptyString(
          exercise.loadGuidance
        ) ||
        !isNonEmptyString(
          exercise.instruction
        )
      ) {

        errors.push(
          `${label} exercise ${exerciseIndex + 1} is missing reps, loading guidance or execution instruction.`
        );
      }


      if (
        !isFiniteNonNegative(
          exercise.restSeconds
        )
      ) {

        errors.push(
          `${label} exercise ${exerciseIndex + 1} has invalid restSeconds.`
        );
      }


      if (
        !Array.isArray(
          exercise.alternatives
        ) ||
        !exercise.alternatives.every(
          isNonEmptyString
        )
      ) {

        errors.push(
          `${label} exercise ${exerciseIndex + 1} alternatives must be an array of strings.`
        );
      }
    }
  );
}


function validateEnduranceStructure(
  workout: TrainingPlanDay,
  label: string,
  errors: string[]
) {

  const structure =
    workout.workoutStructure as unknown;


  if (
    !Array.isArray(structure) ||
    structure.length === 0
  ) {

    errors.push(
      `${label} must contain an executable workoutStructure.`
    );

    return;
  }


  let knownTimedSeconds = 0;

  let bikeBlocks = 0;
  let runBlocks = 0;


  structure.forEach(
    (
      block,
      blockIndex
    ) => {

      if (!isObject(block)) {

        errors.push(
          `${label} block ${blockIndex + 1} is structurally invalid.`
        );

        return;
      }


      const blockLabel =
        `${label} block ${blockIndex + 1}`;


      const blockSport =
        String(
          block.sport ?? ""
        );


      if (
        !BLOCK_SPORTS.has(
          blockSport
        )
      ) {

        errors.push(
          `${blockLabel} has no valid canonical sport.`
        );
      }


      if (blockSport === "Bike") {
        bikeBlocks += 1;
      }

      if (blockSport === "Run") {
        runBlocks += 1;
      }


      if (
        workout.sport === "Swim" &&
        blockSport !== "Swim"
      ) {

        errors.push(
          `${blockLabel} does not match its Swim session.`
        );
      }


      if (
        workout.sport === "Run" &&
        blockSport !== "Run"
      ) {

        errors.push(
          `${blockLabel} does not match its Run session.`
        );
      }


      /*
        Bike may contain Run blocks only for an explicit
        connected Bike -> Run brick.
      */
      if (
        workout.sport === "Bike" &&
        blockSport !== "Bike" &&
        blockSport !== "Run"
      ) {

        errors.push(
          `${blockLabel} uses an unsupported discipline inside a Bike session.`
        );
      }


      if (
        block.kind !== "segment" &&
        block.kind !== "repeat"
      ) {

        errors.push(
          `${blockLabel} has invalid kind.`
        );
      }


      if (
        !PHASES.has(
          String(block.phase)
        )
      ) {

        errors.push(
          `${blockLabel} has invalid phase.`
        );
      }


      if (
        !isNonEmptyString(
          block.label
        ) ||
        !isNonEmptyString(
          block.workIntensity
        ) ||
        !isNonEmptyString(
          block.workInstruction
        )
      ) {

        errors.push(
          `${blockLabel} is missing label, work intensity or execution instruction.`
        );
      }


      const repeatCount =
        block.repeatCount;


      if (
        typeof repeatCount !==
          "number" ||
        !Number.isInteger(
          repeatCount
        ) ||
        repeatCount < 1
      ) {

        errors.push(
          `${blockLabel} has invalid repeatCount.`
        );

        return;
      }


      if (
        block.kind === "segment" &&
        repeatCount !== 1
      ) {

        errors.push(
          `${blockLabel} is a segment but repeatCount is not 1.`
        );
      }


      if (
        block.kind === "repeat" &&
        repeatCount <= 1
      ) {

        errors.push(
          `${blockLabel} is a repeat block but repeatCount is not greater than 1.`
        );
      }


      const workDuration =
        block.workDurationSeconds;

      const workDistance =
        block.workDistanceMeters;


      if (
        workDuration !== null &&
        workDuration !== undefined &&
        !isFiniteNonNegative(
          workDuration
        )
      ) {

        errors.push(
          `${blockLabel} has invalid workDurationSeconds.`
        );
      }


      if (
        workDistance !== null &&
        workDistance !== undefined &&
        !isFiniteNonNegative(
          workDistance
        )
      ) {

        errors.push(
          `${blockLabel} has invalid workDistanceMeters.`
        );
      }


      if (
        !isPositiveNumber(
          workDuration
        ) &&
        !isPositiveNumber(
          workDistance
        )
      ) {

        errors.push(
          `${blockLabel} has no measurable work prescription.`
        );
      }


      if (
        isPositiveNumber(
          workDuration
        )
      ) {

        knownTimedSeconds +=
          workDuration *
          repeatCount;
      }


      const recoveryDuration =
        block.recoveryDurationSeconds;

      const recoveryDistance =
        block.recoveryDistanceMeters;


      if (
        recoveryDuration !== null &&
        recoveryDuration !== undefined &&
        !isFiniteNonNegative(
          recoveryDuration
        )
      ) {

        errors.push(
          `${blockLabel} has invalid recoveryDurationSeconds.`
        );
      }


      if (
        recoveryDistance !== null &&
        recoveryDistance !== undefined &&
        !isFiniteNonNegative(
          recoveryDistance
        )
      ) {

        errors.push(
          `${blockLabel} has invalid recoveryDistanceMeters.`
        );
      }


      const hasRecovery =
        isPositiveNumber(
          recoveryDuration
        ) ||
        isPositiveNumber(
          recoveryDistance
        );


      if (
        block.kind === "segment" &&
        hasRecovery
      ) {

        errors.push(
          `${blockLabel} is a normal segment but also defines between-repetition recovery.`
        );
      }


      if (
        block.kind === "repeat" &&
        repeatCount > 1 &&
        !hasRecovery
      ) {

        errors.push(
          `${blockLabel} repeats work but does not prescribe measurable recovery between repetitions.`
        );
      }


      if (
        hasRecovery &&
        (
          !isNonEmptyString(
            block.recoveryIntensity
          ) ||
          !isNonEmptyString(
            block.recoveryInstruction
          )
        )
      ) {

        errors.push(
          `${blockLabel} has recovery volume but incomplete recovery guidance.`
        );
      }


      if (
        !hasRecovery &&
        (
          isNonEmptyString(
            block.recoveryIntensity
          ) ||
          isNonEmptyString(
            block.recoveryInstruction
          )
        )
      ) {

        errors.push(
          `${blockLabel} contains recovery guidance without a measurable recovery prescription.`
        );
      }


      if (
        isPositiveNumber(
          recoveryDuration
        ) &&
        repeatCount > 1
      ) {

        knownTimedSeconds +=
          recoveryDuration *
          (
            repeatCount -
            1
          );
      }
    }
  );


  /*
    Bike + Run blocks are allowed only as an explicit brick.
  */
  if (
    workout.sport === "Bike" &&
    runBlocks > 0
  ) {

    if (bikeBlocks === 0) {

      errors.push(
        `${label} contains Run blocks but no Bike blocks.`
      );
    }


    const athleteFacingText =
      [
        workout.title,
        workout.purpose,
        ...(workout.details ?? []),
      ]
        .join(" ")
        .toLowerCase();


    if (
      !/\b(?:brick|transition)\b/.test(
        athleteFacingText
      )
    ) {

      errors.push(
        `${label} contains Bike-to-Run structure but is not described as a brick or transition workout.`
      );
    }
  }


  /*
    Distance-based blocks cannot safely be converted to time.

    Therefore only KNOWN timed structure is checked here.

    It may be shorter than durationMinutes, but must not
    materially exceed it.
  */
  if (
    knownTimedSeconds >
    (
      workout.durationMinutes *
      60
    ) +
    120
  ) {

    errors.push(
      `${label} canonical timed structure exceeds durationMinutes by more than 2 minutes.`
    );
  }
}


function validateSession(
  workout: TrainingPlanDay,
  index: number,
  secondary: boolean,
  errors: string[]
) {

  const label =
    labelOf(
      workout,
      index,
      secondary
    );


  if (
    !isNonEmptyString(
      workout.day
    ) ||
    !isNonEmptyString(
      workout.sport
    ) ||
    !isNonEmptyString(
      workout.title
    ) ||
    !isNonEmptyString(
      workout.intensity
    ) ||
    !isNonEmptyString(
      workout.purpose
    )
  ) {

    errors.push(
      `${label} is missing required athlete-facing fields.`
    );
  }


  if (
    !isFiniteNonNegative(
      workout.durationMinutes
    )
  ) {

    errors.push(
      `${label} has invalid durationMinutes.`
    );

    return;
  }


  if (
    !Array.isArray(
      workout.details
    ) ||
    !workout.details.every(
      isNonEmptyString
    )
  ) {

    errors.push(
      `${label} details must be an array of strings.`
    );
  }


  if (
    workout.sport === "Rest"
  ) {

    if (
      workout.durationMinutes !== 0
    ) {

      errors.push(
        `${label} is Rest but durationMinutes is not 0.`
      );
    }


    if (
      !Array.isArray(
        workout.workoutStructure
      ) ||
      workout.workoutStructure.length !==
        0
    ) {

      errors.push(
        `${label} is Rest but workoutStructure is not empty.`
      );
    }


    if (
      workout.strengthStructure !==
        null
    ) {

      errors.push(
        `${label} is Rest but strengthStructure is not null.`
      );
    }


    return;
  }


  if (
    workout.sport === "Strength"
  ) {

    if (
      !Array.isArray(
        workout.workoutStructure
      ) ||
      workout.workoutStructure.length !==
        0
    ) {

      errors.push(
        `${label} is Strength but workoutStructure is not empty.`
      );
    }


    validateStrengthStructure(
      workout,
      label,
      errors
    );

    return;
  }


  if (
    ENDURANCE_SPORTS.has(
      workout.sport
    )
  ) {

    if (
      workout.strengthStructure !==
        null
    ) {

      errors.push(
        `${label} is ${workout.sport} but strengthStructure is not null.`
      );
    }


    validateEnduranceStructure(
      workout,
      label,
      errors
    );

    return;
  }


  errors.push(
    `${label} uses unsupported sport "${workout.sport}".`
  );
}


export function validateCanonicalWorkoutSession(
  workout: TrainingPlanDay,
  {
    index = 0,
    secondary = false,
  }: {
    index?: number;
    secondary?: boolean;
  } = {}
): CanonicalWorkoutValidationResult {

  const errors:
    string[] = [];


  validateSession(
    workout,
    index,
    secondary,
    errors
  );


  return {
    valid:
      errors.length === 0,

    errors,
  };
}


export function validateCanonicalGeneratedPlan(
  plan: TrainingPlan
): CanonicalWorkoutValidationResult {

  const errors:
    string[] = [];


  plan.days.forEach(
    (
      workout,
      index
    ) => {

      validateSession(
        workout,
        index,
        false,
        errors
      );
    }
  );


  (
    plan.additionalSessions ??
    []
  ).forEach(
    (
      workout,
      index
    ) => {

      validateSession(
        workout,
        index,
        true,
        errors
      );
    }
  );


  return {
    valid:
      errors.length === 0,

    errors,
  };
}
