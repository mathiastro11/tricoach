import type {
  PerformanceBenchmarks,
} from "@/types/training";


export type BenchmarkAwareness = {
  swim: {
    status:
      | "Missing"
      | "Current"
      | "Stale"
      | "Partial";

    message: string | null;
  };

  bike: {
    status:
      | "Missing"
      | "Current"
      | "Stale"
      | "Partial";

    message: string | null;
  };

  run: {
    status:
      | "Missing"
      | "Current"
      | "Stale"
      | "Partial";

    message: string | null;
  };

  recommendations: string[];
};


function daysSince(
  isoDate:
    string | undefined
): number | null {

  if (!isoDate) {
    return null;
  }

  const date =
    new Date(isoDate);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  const diff =
    Date.now() -
    date.getTime();

  return Math.max(
    0,
    Math.floor(
      diff /
        (
          1000 *
          60 *
          60 *
          24
        )
    )
  );
}


export function buildBenchmarkAwareness(
  benchmarks:
    PerformanceBenchmarks |
    null |
    undefined
): BenchmarkAwareness {

  /*
    Prefer discipline-specific timestamps.

    The top-level timestamp remains as a fallback
    for benchmark data saved before this feature
    existed.
  */

  const swimAgeDays =
    daysSince(
      benchmarks?.swim?.updatedAt ??
      benchmarks?.updatedAt
    );

  const bikeAgeDays =
    daysSince(
      benchmarks?.bike?.updatedAt ??
      benchmarks?.updatedAt
    );

  const runAgeDays =
    daysSince(
      benchmarks?.run?.updatedAt ??
      benchmarks?.updatedAt
    );


  /*
    10 weeks is a soft review threshold.

    It does NOT automatically make a benchmark
    physiologically invalid.
  */

  const swimStale =
    swimAgeDays !== null &&
    swimAgeDays >= 70;

  const bikeStale =
    bikeAgeDays !== null &&
    bikeAgeDays >= 70;

  const runStale =
    runAgeDays !== null &&
    runAgeDays >= 70;


  // -----------------------------------------
  // SWIM
  // -----------------------------------------

  const hasSwim200 =
    typeof benchmarks?.swim
      ?.time200Seconds ===
      "number";

  const hasSwim400 =
    typeof benchmarks?.swim
      ?.time400Seconds ===
      "number";

  const hasCss =
    typeof benchmarks?.swim
      ?.cssSecondsPer100m ===
      "number";

  let swimStatus:
    BenchmarkAwareness["swim"]["status"] =
      "Missing";

  let swimMessage:
    string | null = null;


  if (
    hasCss ||
    (
      hasSwim200 &&
      hasSwim400
    )
  ) {
    swimStatus =
      swimStale
        ? "Stale"
        : "Current";

    swimMessage =
      swimStale
        ? "Your swim benchmark is getting old. A new 200 m + 400 m test may improve swim pacing precision."
        : null;

  } else if (
    hasSwim200 ||
    hasSwim400
  ) {
    swimStatus =
      "Partial";

    swimMessage =
      "Add both a 200 m and 400 m swim result to estimate CSS reliably.";
  } else {
    swimMessage =
      "Swim sessions currently rely mainly on RPE. A 200 m + 400 m benchmark could improve pacing precision.";
  }


  // -----------------------------------------
  // BIKE
  // -----------------------------------------

  const hasFtp =
    typeof benchmarks?.bike
      ?.ftpWatts ===
      "number";

  const has20 =
    typeof benchmarks?.bike
      ?.twentyMinutePowerWatts ===
      "number";

  let bikeStatus:
    BenchmarkAwareness["bike"]["status"] =
      "Missing";

  let bikeMessage:
    string | null = null;


  if (hasFtp) {
    bikeStatus =
      bikeStale
        ? "Stale"
        : "Current";

    bikeMessage =
      bikeStale
        ? "Your FTP benchmark is getting old. A fresh test may improve cycling target precision."
        : null;

  } else if (has20) {
    bikeStatus =
      "Partial";

    bikeMessage =
      "A 20-minute power result is available, but no explicit FTP is stored. TriCoach will keep using it only as context.";

  } else {
    bikeMessage =
      "Bike sessions currently rely mainly on RPE. Adding a valid FTP can improve power-based prescriptions.";
  }


  // -----------------------------------------
  // RUN
  // -----------------------------------------

  const has5k =
    typeof benchmarks?.run
      ?.fiveKSeconds ===
      "number";

  const has10k =
    typeof benchmarks?.run
      ?.tenKSeconds ===
      "number";

  const hasThreshold =
    typeof benchmarks?.run
      ?.thresholdSecondsPerKm ===
      "number";

  let runStatus:
    BenchmarkAwareness["run"]["status"] =
      "Missing";

  let runMessage:
    string | null = null;


  if (
    hasThreshold ||
    has5k ||
    has10k
  ) {
    runStatus =
      runStale
        ? "Stale"
        : "Current";

    runMessage =
      runStale
        ? "Your running benchmark is getting old. A recent 5K, 10K or threshold assessment may improve pacing context."
        : null;

  } else {
    runMessage =
      "Run sessions currently rely mainly on RPE. A recent 5K or 10K result can improve performance context.";
  }


  // -----------------------------------------
  // RECOMMENDATIONS
  // -----------------------------------------

  const recommendations:
    string[] = [];

  if (
    swimStatus !== "Current" &&
    swimMessage
  ) {
    recommendations.push(
      swimMessage
    );
  }

  if (
    bikeStatus !== "Current" &&
    bikeMessage
  ) {
    recommendations.push(
      bikeMessage
    );
  }

  if (
    runStatus !== "Current" &&
    runMessage
  ) {
    recommendations.push(
      runMessage
    );
  }


  return {
    swim: {
      status:
        swimStatus,

      message:
        swimMessage,
    },

    bike: {
      status:
        bikeStatus,

      message:
        bikeMessage,
    },

    run: {
      status:
        runStatus,

      message:
        runMessage,
    },

    recommendations,
  };
}
