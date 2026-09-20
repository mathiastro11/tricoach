import type {
  TrainingPlan,
  TrainingPlanDay,
  PerformanceBenchmarks,
} from "@/types/training";

import {
  buildBenchmarkState,
} from "@/lib/performance-benchmarks";


export type BenchmarkUsageAudit = {
  valid: boolean;

  errors: string[];
  warnings: string[];
};


function workoutText(
  workout: TrainingPlanDay
) {
  return [
    workout.title,
    workout.intensity,
    workout.purpose,
    ...(workout.details ?? []),

    ...(
      workout.workoutStructure ??
      []
    ).flatMap(
      (block) => [
        block.label,
        block.workIntensity,
        block.workInstruction,
        block.recoveryIntensity,
        block.recoveryInstruction,
      ]
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}


function containsWatts(
  text: string
) {
  return /\b\d{2,4}\s*(?:-|–|to)?\s*\d{0,4}\s*w\b/i.test(
    text
  );
}


function containsSwimPace(
  text: string
) {
  return (
    /\b\d{1,2}:\d{2}\s*\/\s*100\s*m\b/i.test(
      text
    ) ||
    /\b\d{1,2}:\d{2}\s*per\s*100\s*m\b/i.test(
      text
    )
  );
}


function containsRunPace(
  text: string
) {
  return (
    /\b\d{1,2}:\d{2}\s*\/\s*km\b/i.test(
      text
    ) ||
    /\b\d{1,2}:\d{2}\s*per\s*km\b/i.test(
      text
    )
  );
}


function looksLikeThresholdRun(
  workout: TrainingPlanDay
) {
  const text =
    workoutText(workout);

  return (
    workout.sport === "Run" &&
    (
      /\bthreshold\b/.test(text) ||
      /\btempo\b/.test(text) ||
      /\bcontrolled hard\b/.test(text)
    )
  );
}


function looksLikeEasyRun(
  workout: TrainingPlanDay
) {
  const text =
    workoutText(workout);

  return (
    workout.sport === "Run" &&
    (
      /\beasy\b/.test(text) ||
      /\brecovery\b/.test(text) ||
      /\bconversational\b/.test(text)
    )
  );
}


export function auditBenchmarkUsage({
  plan,
  benchmarks,
}: {
  plan: TrainingPlan;

  benchmarks?:
    PerformanceBenchmarks |
    null;
}): BenchmarkUsageAudit {

  const state =
    buildBenchmarkState(
      benchmarks
    );

  const errors:
    string[] = [];

  const warnings:
    string[] = [];


  const workouts = [
    ...plan.days,
    ...(
      plan.additionalSessions ??
      []
    ),
  ];


  for (
    const workout
    of workouts
  ) {
    const text =
      workoutText(workout);


    // ==========================================
    // BIKE WATTS
    // ==========================================

    if (
      workout.sport === "Bike" &&
      containsWatts(text) &&
      !state.bike.ftpWatts
    ) {
      errors.push(
        `${workout.day} bike session uses watt targets without a valid FTP benchmark.`
      );
    }


    // ==========================================
    // SWIM PACE
    // ==========================================

    if (
      workout.sport === "Swim" &&
      containsSwimPace(text) &&
      !state.swim.usable
    ) {
      errors.push(
        `${workout.day} swim session uses /100 m pace targets without a valid CSS benchmark.`
      );
    }


    // ==========================================
    // RUN PACE
    // ==========================================

    if (
      workout.sport === "Run" &&
      containsRunPace(text) &&
      looksLikeThresholdRun(
        workout
      ) &&
      !state.run
        .thresholdSecondsPerKm
    ) {
      errors.push(
        `${workout.day} threshold-style run uses pace targets without a valid threshold-pace benchmark.`
      );
    }


    /*
      Easy running can legitimately include pace
      if the athlete or coach explicitly knows it,
      but with our current benchmark model we do
      not yet have a safe easy-pace anchor.

      Therefore numerical easy-run pace is allowed
      only as a warning for now, not a hard error.
    */

    if (
      workout.sport === "Run" &&
      containsRunPace(text) &&
      looksLikeEasyRun(
        workout
      )
    ) {
      warnings.push(
        `${workout.day} easy run includes a numerical pace target. Confirm that effort remains conversational and that pace is not being forced from unrelated benchmark data.`
      );
    }


    // ==========================================
    // FALSE PRECISION
    // ==========================================

    if (
      workout.sport === "Bike" &&
      state.bike.ftpWatts &&
      /\b\d{2,4}\s*w\b/i.test(text) &&
      !/\b\d{2,4}\s*(?:-|–|to)\s*\d{2,4}\s*w\b/i.test(
        text
      )
    ) {
      warnings.push(
        `${workout.day} bike session uses a single exact watt target. Prefer a practical range unless exact power is specifically justified.`
      );
    }


    if (
      workout.sport === "Swim" &&
      state.swim.usable &&
      /\b\d{1,2}:\d{2}\s*\/\s*100\s*m\b/i.test(
        text
      ) &&
      !/\b\d{1,2}:\d{2}\s*(?:-|–|to)\s*\d{1,2}:\d{2}\s*\/\s*100\s*m\b/i.test(
        text
      )
    ) {
      warnings.push(
        `${workout.day} swim session uses one exact pace target. Prefer a small practical range unless the set specifically requires a fixed pace.`
      );
    }
  }


  return {
    valid:
      errors.length === 0,

    errors,
    warnings,
  };
}
