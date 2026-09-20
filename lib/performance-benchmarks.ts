export type PerformanceBenchmarks = {
  updatedAt?: string;

  swim?: {
    updatedAt?: string;

    time200Seconds?: number | null;
    time400Seconds?: number | null;
    cssSecondsPer100m?: number | null;

    source?:
      | "200-400 test"
      | "External test"
      | "Race result"
      | null;
  };

  bike?: {
    updatedAt?: string;

    ftpWatts?: number | null;
    twentyMinutePowerWatts?: number | null;

    source?:
      | "FTP test"
      | "20-minute test"
      | "External platform"
      | "Race / training data"
      | null;
  };

  run?: {
    updatedAt?: string;

    fiveKSeconds?: number | null;
    tenKSeconds?: number | null;
    thresholdSecondsPerKm?: number | null;

    source?:
      | "5 km result"
      | "10 km result"
      | "External threshold test"
      | "Race result"
      | null;
  };
};


export type BenchmarkState = {
  dataQuality:
    | "None"
    | "Partial"
    | "Useful"
    | "Strong";

  swim: {
    cssSecondsPer100m: number | null;

    cssSource:
      | "Calculated 200/400"
      | "Provided"
      | null;

    usable: boolean;
    notes: string[];
  };

  bike: {
    ftpWatts: number | null;
    twentyMinutePowerWatts: number | null;

    usable: boolean;
    notes: string[];
  };

  run: {
    fiveKSeconds: number | null;
    tenKSeconds: number | null;
    thresholdSecondsPerKm: number | null;

    usable: boolean;
    notes: string[];
  };

  coachingNotes: string[];
};


function positiveNumber(
  value: unknown
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}


function plausibleSwimTime(
  distanceMeters: 200 | 400,
  seconds: number | null
): number | null {

  if (seconds === null) {
    return null;
  }

  /*
    These are intentionally broad safety bounds.

    They are NOT performance standards.
    Their only purpose is to reject obviously
    corrupted or incorrectly entered data.
  */

  const minimum =
    distanceMeters === 200
      ? 80
      : 170;

  const maximum =
    distanceMeters === 200
      ? 900
      : 1800;

  if (
    seconds < minimum ||
    seconds > maximum
  ) {
    return null;
  }

  return seconds;
}


function plausibleBikePower(
  watts: number | null
): number | null {

  if (watts === null) {
    return null;
  }

  /*
    Very broad bounds so we do not reject
    legitimate athletes.

    This is corruption protection,
    not athlete classification.
  */

  if (
    watts < 30 ||
    watts > 1000
  ) {
    return null;
  }

  return watts;
}


function plausibleRunResult(
  distance:
    "5K" | "10K",

  seconds: number | null
): number | null {

  if (seconds === null) {
    return null;
  }

  const minimum =
    distance === "5K"
      ? 720
      : 1500;

  const maximum =
    distance === "5K"
      ? 10800
      : 21600;

  if (
    seconds < minimum ||
    seconds > maximum
  ) {
    return null;
  }

  return seconds;
}


function plausibleThresholdPace(
  secondsPerKm:
    number | null
): number | null {

  if (secondsPerKm === null) {
    return null;
  }

  /*
    2:30/km to 15:00/km.

    Deliberately wide:
    only obvious bad data should be rejected.
  */

  if (
    secondsPerKm < 150 ||
    secondsPerKm > 900
  ) {
    return null;
  }

  return secondsPerKm;
}


function calculateTwoPointCss(
  time200: number,
  time400: number
): number | null {

  if (time400 <= time200) {
    return null;
  }

  const deltaTime =
    time400 - time200;

  const speedMetersPerSecond =
    200 / deltaTime;

  if (
    !Number.isFinite(
      speedMetersPerSecond
    ) ||
    speedMetersPerSecond <= 0
  ) {
    return null;
  }

  const secondsPer100 =
    100 / speedMetersPerSecond;

  /*
    Loose bounds only protect against
    obviously invalid input.
  */
  if (
    secondsPer100 < 45 ||
    secondsPer100 > 240
  ) {
    return null;
  }

  return Math.round(
    secondsPer100
  );
}


export function buildBenchmarkState(
  benchmarks:
    PerformanceBenchmarks |
    null |
    undefined
): BenchmarkState {

  const rawSwim200 =
    positiveNumber(
      benchmarks?.swim
        ?.time200Seconds
    );

  const rawSwim400 =
    positiveNumber(
      benchmarks?.swim
        ?.time400Seconds
    );

  const swim200 =
    plausibleSwimTime(
      200,
      rawSwim200
    );

  const swim400 =
    plausibleSwimTime(
      400,
      rawSwim400
    );

  const providedCss =
    plausibleThresholdPace(
      positiveNumber(
        benchmarks?.swim
          ?.cssSecondsPer100m
      )
    );


  let calculatedCss:
    number | null = null;

  if (
    swim200 !== null &&
    swim400 !== null
  ) {
    calculatedCss =
      calculateTwoPointCss(
        swim200,
        swim400
      );
  }


  const css =
    providedCss ??
    calculatedCss;


  const swimNotes:
    string[] = [];

  if (
    rawSwim200 !== null &&
    swim200 === null
  ) {
    swimNotes.push(
      "The stored 200 m swim benchmark is outside plausible safety bounds and must not be used for coaching."
    );
  }

  if (
    rawSwim400 !== null &&
    swim400 === null
  ) {
    swimNotes.push(
      "The stored 400 m swim benchmark is outside plausible safety bounds and must not be used for coaching."
    );
  }

  if (
    swim200 !== null &&
    swim400 !== null &&
    calculatedCss === null
  ) {
    swimNotes.push(
      "The entered 200 m / 400 m swim results could not produce a plausible critical-speed estimate. Check the times before using them."
    );
  }

  if (providedCss !== null) {
    swimNotes.push(
      "Use the provided CSS only if it comes from a recent, valid swim test."
    );
  } else if (
    calculatedCss !== null
  ) {
    swimNotes.push(
      "CSS is estimated from recent maximal 200 m and 400 m swim results."
    );
  }


  const ftp =
    plausibleBikePower(
      positiveNumber(
        benchmarks?.bike
          ?.ftpWatts
      )
    );

  const twentyMinutePower =
    plausibleBikePower(
      positiveNumber(
        benchmarks?.bike
          ?.twentyMinutePowerWatts
      )
    );

  const bikeNotes:
    string[] = [];

  if (ftp !== null) {
    bikeNotes.push(
      "Use FTP only as an athlete-specific cycling anchor; keep RPE and execution quality relevant."
    );
  }

  if (
    ftp === null &&
    twentyMinutePower !== null
  ) {
    bikeNotes.push(
      "A 20-minute power result is available, but TriCoach should not silently treat it as exact FTP."
    );
  }


  const fiveK =
    plausibleRunResult(
      "5K",
      positiveNumber(
        benchmarks?.run
          ?.fiveKSeconds
      )
    );

  const tenK =
    plausibleRunResult(
      "10K",
      positiveNumber(
        benchmarks?.run
          ?.tenKSeconds
      )
    );

  const thresholdPace =
    plausibleThresholdPace(
      positiveNumber(
        benchmarks?.run
          ?.thresholdSecondsPerKm
      )
    );

  const runNotes:
    string[] = [];

  if (thresholdPace !== null) {
    runNotes.push(
      "Threshold pace may guide controlled quality only when it comes from a recent valid assessment."
    );
  }

  if (
    fiveK !== null ||
    tenK !== null
  ) {
    runNotes.push(
      "Recent race/test performances can guide progression and benchmark change, but they are not automatically identical to threshold pace."
    );
  }


  const usefulSections = [
    css !== null,

    ftp !== null ||
      twentyMinutePower !== null,

    fiveK !== null ||
      tenK !== null ||
      thresholdPace !== null,
  ].filter(Boolean).length;


  let dataQuality:
    BenchmarkState["dataQuality"] =
      "None";

  if (usefulSections === 1) {
    dataQuality = "Partial";
  } else if (
    usefulSections === 2
  ) {
    dataQuality = "Useful";
  } else if (
    usefulSections === 3
  ) {
    dataQuality = "Strong";
  }


  const coachingNotes:
    string[] = [];

  if (dataQuality === "None") {
    coachingNotes.push(
      "No valid performance benchmarks are available. Prescribe sessions using RPE, conversational effort and training history rather than invented pace, power or CSS targets."
    );
  } else {
    coachingNotes.push(
      "Performance benchmarks are available. Use them only in disciplines where valid data exists; do not infer missing thresholds in other disciplines."
    );
  }


  return {
    dataQuality,

    swim: {
      cssSecondsPer100m: css,

      cssSource:
        providedCss !== null
          ? "Provided"
          : calculatedCss !== null
          ? "Calculated 200/400"
          : null,

      usable:
        css !== null,

      notes:
        swimNotes,
    },

    bike: {
      ftpWatts: ftp,

      twentyMinutePowerWatts:
        twentyMinutePower,

      usable:
        ftp !== null ||
        twentyMinutePower !== null,

      notes:
        bikeNotes,
    },

    run: {
      fiveKSeconds: fiveK,
      tenKSeconds: tenK,

      thresholdSecondsPerKm:
        thresholdPace,

      usable:
        fiveK !== null ||
        tenK !== null ||
        thresholdPace !== null,

      notes:
        runNotes,
    },

    coachingNotes,
  };
}


export function buildBenchmarkGuidance(
  benchmarks:
    PerformanceBenchmarks |
    null |
    undefined
) {

  const state =
    buildBenchmarkState(
      benchmarks
    );

  return `
PERFORMANCE BENCHMARK STATE:

${JSON.stringify(
  state,
  null,
  2
)}

BENCHMARK RULES:

1. Never invent missing performance data.

2. Never derive FTP automatically from a 20-minute test unless the product explicitly uses and labels a defined protocol.

3. If valid FTP exists, it may help scale cycling sessions, but RPE and recent execution still matter.

4. If CSS exists, it may help describe swim threshold and aerobic work.

5. If CSS was calculated from 200 m and 400 m trials, treat it as a practical field estimate rather than laboratory truth.

6. Recent 5 km and 10 km results may guide running context and track progress.

7. Do not assume 5 km pace, 10 km pace and threshold pace are interchangeable.

8. If a valid threshold running pace is provided, it may anchor controlled threshold sessions.

9. If benchmark data conflicts with recent real-world execution, fatigue or readiness, recent athlete response takes priority.

10. Benchmark data becomes stale. Do not aggressively progress training merely because an old benchmark looks strong.

11. When no benchmark exists, RPE-based prescriptions are completely acceptable.

12. Keep the user-facing workout simple.
`;
}
