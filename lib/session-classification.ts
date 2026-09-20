type ClassificationBlock = {
  label?: unknown;
  workIntensity?: unknown;
  workInstruction?: unknown;
  recoveryIntensity?: unknown;
  recoveryInstruction?: unknown;
};


export type SessionClassificationInput = {
  sport?: unknown;
  title?: unknown;
  intensity?: unknown;
  purpose?: unknown;

  details?:
    | readonly unknown[]
    | null;

  durationMinutes?: unknown;

  workoutStructure?:
    | readonly ClassificationBlock[]
    | null;
};


function textValue(
  value: unknown
) {
  return typeof value === "string"
    ? value
    : "";
}


function normalizedText(
  values: readonly unknown[]
) {
  return values
    .map(textValue)
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


function blocksOf(
  workout:
    SessionClassificationInput
) {
  return Array.isArray(
    workout.workoutStructure
  )
    ? workout.workoutStructure
    : [];
}


export function getSessionClassificationText(
  workout:
    SessionClassificationInput
) {

  const blocks =
    blocksOf(workout);


  return normalizedText([
    workout.sport,
    workout.title,
    workout.intensity,
    workout.purpose,

    ...(
      Array.isArray(
        workout.details
      )
        ? workout.details
        : []
    ),

    ...blocks.flatMap(
      (block) => [
        block.label,
        block.workIntensity,
        block.workInstruction,
        block.recoveryIntensity,
        block.recoveryInstruction,
      ]
    ),
  ]);
}


function getHighSignalText(
  workout:
    SessionClassificationInput
) {

  const blocks =
    blocksOf(workout);


  /*
    Focus on fields that describe WHAT the session is.

    This avoids false positives from notes such as:
    "Do not push hard today."
  */
  return normalizedText([
    workout.sport,
    workout.title,
    workout.intensity,
    workout.purpose,

    ...blocks.flatMap(
      (block) => [
        block.label,
        block.workIntensity,
      ]
    ),
  ]);
}


export function isDemandingSession(
  workout:
    SessionClassificationInput
) {

  const sport =
    textValue(
      workout.sport
    )
      .trim()
      .toLowerCase();


  if (
    sport === "rest" ||
    (
      typeof workout.durationMinutes ===
        "number" &&
      workout.durationMinutes <= 0
    )
  ) {
    return false;
  }


  const highSignal =
    getHighSignalText(
      workout
    );

  const fullText =
    getSessionClassificationText(
      workout
    );


  /*
    Explicit purposeful quality work.

    Brick alone is deliberately NOT hard.
  */
  if (
    /\b(?:threshold|tempo|vo2|vo₂|maximal aerobic|anaerobic|high[- ]intensity|race[- ]pace|hill repeats?|controlled hard|hard intervals?|sprint intervals?)\b/.test(
      highSignal
    )
  ) {
    return true;
  }


  /*
    Explicit high internal load.
  */
  if (
    /\brpe\s*(?:8|9|10)(?:\b|\/10)/.test(
      fullText
    )
  ) {
    return true;
  }


  /*
    Upper intensity zones.
  */
  if (
    /\b(?:zone\s*|z)(?:4|5)\b/.test(
      fullText
    )
  ) {
    return true;
  }


  /*
    "Intervals" alone are ambiguous.

    Easy technique / aerobic intervals should not become
    hard sessions simply because they contain repetitions.
  */
  const mentionsIntervals =
    /\b(?:intervals?|repeats?)\b/.test(
      highSignal
    );

  const clearlyLowStress =
    /\b(?:easy|recovery|relaxed|conversational|technique|drill|aerobic|zone\s*[12]|z[12])\b/.test(
      highSignal
    );


  return (
    mentionsIntervals &&
    !clearlyLowStress
  );
}
