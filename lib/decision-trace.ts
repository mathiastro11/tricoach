import type {
  AthleteState,
} from "@/lib/athlete-state";

import type {
  CoachingSignals,
} from "@/lib/adaptive-coaching";


export type DecisionTrace = {
  headline: string;

  signals: string[];

  decision: string;

  confidence:
    | "Low"
    | "Moderate"
    | "High";
};


type DecisionTraceInput = {
  coachingSignals:
    CoachingSignals;

  athleteState:
    AthleteState;
};


export function buildDecisionTrace({
  coachingSignals,
  athleteState,
}: DecisionTraceInput): DecisionTrace {

  const signals: string[] = [];


  // -----------------------------------------
  // RECOVERY
  // -----------------------------------------

  if (
    athleteState.recoveryPattern
      .trend === "Strained"
  ) {
    signals.push(
      "Recovery has been under repeated pressure recently."
    );
  } else if (
    athleteState.recoveryPattern
      .trend === "Watch"
  ) {
    signals.push(
      "Recent recovery has been inconsistent."
    );
  }


  // -----------------------------------------
  // LOAD TOLERANCE
  // -----------------------------------------

  if (
    athleteState.loadTolerance
      .trend === "Strained"
  ) {
    signals.push(
      "Recent completed sessions have been feeling harder than ideal."
    );
  } else if (
    athleteState.loadTolerance
      .trend === "Comfortable" &&
    athleteState.dataQuality !== "Low"
  ) {
    signals.push(
      "Recent training has been completed with manageable perceived effort."
    );
  }


  // -----------------------------------------
  // CONSISTENCY
  // -----------------------------------------

  const consistency =
    athleteState.consistency
      .overall;

  if (
    consistency !== null &&
    athleteState.sessionsAnalyzed >= 6
  ) {
    if (consistency < 65) {
      signals.push(
        `Recent training consistency is low at ${consistency}%.`
      );
    } else if (
      consistency >= 90
    ) {
      signals.push(
        `Recent training consistency is strong at ${consistency}%.`
      );
    }
  }


  // -----------------------------------------
  // SCHEDULE
  // -----------------------------------------

  if (
    athleteState.schedule
      .patterns.length > 0
  ) {
    signals.push(
      athleteState.schedule
        .patterns[0]
    );
  }


  // -----------------------------------------
  // EXECUTION
  // -----------------------------------------

  if (
    athleteState.execution
      .patterns.length > 0
  ) {
    signals.push(
      athleteState.execution
        .patterns[0]
    );
  }


  // -----------------------------------------
  // DISCIPLINE
  // -----------------------------------------

  if (
    athleteState.disciplinePatterns
      .length > 0 &&
    signals.length < 4
  ) {
    signals.push(
      athleteState.disciplinePatterns[0]
    );
  }


  // Keep explanation concise.
  const conciseSignals =
    signals.slice(0, 4);


  // -----------------------------------------
  // HEADLINE
  // -----------------------------------------

  let headline =
    "Current training looks broadly stable.";

  if (
    coachingSignals.loadDecision ===
    "Reduce"
  ) {
    headline =
      "Basse is prioritizing recovery.";
  } else if (
    coachingSignals.loadDecision ===
    "Increase slightly"
  ) {
    headline =
      "Basse sees room for a small progression.";
  } else if (
    coachingSignals.fatigueRisk ===
    "Moderate"
  ) {
    headline =
      "Basse is keeping progression conservative.";
  }


  // -----------------------------------------
  // DECISION
  // -----------------------------------------

  let decision =
    "Maintain the current training load.";

  if (
    coachingSignals.loadDecision ===
    "Reduce"
  ) {
    decision =
      `Reduce load toward ${coachingSignals.recommendedHoursMin}–${coachingSignals.recommendedHoursMax} hours and protect recovery.`;
  } else if (
    coachingSignals.loadDecision ===
    "Increase slightly"
  ) {
    decision =
      `Progress cautiously within ${coachingSignals.recommendedHoursMin}–${coachingSignals.recommendedHoursMax} hours.`;
  } else {
    decision =
      `Keep training within ${coachingSignals.recommendedHoursMin}–${coachingSignals.recommendedHoursMax} hours while improving execution and consistency.`;
  }


  // -----------------------------------------
  // CONFIDENCE
  // -----------------------------------------

  let confidence:
    DecisionTrace["confidence"] =
      "Low";

  if (
    athleteState.dataQuality ===
    "Strong"
  ) {
    confidence = "High";
  } else if (
    athleteState.dataQuality ===
    "Moderate"
  ) {
    confidence = "Moderate";
  }


  return {
    headline,
    signals:
      conciseSignals.length > 0
        ? conciseSignals
        : [
            "There is not yet enough repeated training history for strong individualized conclusions.",
          ],

    decision,
    confidence,
  };
}
