/*
  ============================================================
  TRICOACH BENCHMARK PRESCRIPTION ENGINE
  ============================================================

  Design principles:

  1. Benchmarks calibrate sessions.
     They do NOT decide whether a session should be hard.

  2. Session PURPOSE decides intensity domain first.

  3. Easy/recovery training stays clearly below threshold.

  4. RPE / talk-test remains authoritative for easy work.
     Numerical targets are secondary guardrails.

  5. Threshold values are used most directly only for
     threshold-specific sessions.

  This intentionally avoids false precision.
*/


export type PrescriptionDomain =
  | "Recovery"
  | "Easy"
  | "Endurance"
  | "Steady"
  | "Tempo"
  | "Threshold"
  | "VO2"
  | "RaceSpecific";


type WorkoutLike = {
  title?: string;
  intensity?: string;
  purpose?: string;
  details?: string[];
};


function workoutText(
  workout: WorkoutLike
) {
  return [
    workout.title ?? "",
    workout.intensity ?? "",
    workout.purpose ?? "",
    ...(workout.details ?? []),
  ]
    .join(" ")
    .toLowerCase();
}


export function classifyWorkoutDomain(
  workout: WorkoutLike
): PrescriptionDomain {

  const text =
    workoutText(workout);


  /*
    Order matters.

    Recovery/easy terms must win before generic
    words such as "aerobic".
  */

  if (
    /recovery|recover|very easy|regeneration|shakeout/.test(
      text
    )
  ) {
    return "Recovery";
  }


  if (
    /easy|easy aerobic|conversational|relaxed|zone 1|z1/.test(
      text
    )
  ) {
    return "Easy";
  }


  if (
    /vo2|vo₂|max aerobic|anaerobic|short hard|5k interval|speed interval/.test(
      text
    )
  ) {
    return "VO2";
  }


  if (
    /threshold|lactate threshold|ftp interval|css interval/.test(
      text
    )
  ) {
    return "Threshold";
  }


  if (
    /tempo|sweet spot|moderate-hard|comfortably hard/.test(
      text
    )
  ) {
    return "Tempo";
  }


  if (
    /race pace|race-specific|race specific|brick/.test(
      text
    )
  ) {
    return "RaceSpecific";
  }


  if (
    /steady|moderate/.test(
      text
    )
  ) {
    return "Steady";
  }


  /*
    Long runs/rides are NOT automatically tempo.
  */
  if (
    /long run|long ride|long bike|endurance|aerobic|base/.test(
      text
    )
  ) {
    return "Endurance";
  }


  /*
    Conservative fallback:
    unknown endurance work is treated as easy/endurance,
    never threshold.
  */
  return "Endurance";
}


function formatPace(
  seconds: number
) {

  const rounded =
    Math.max(
      1,
      Math.round(seconds)
    );

  const minutes =
    Math.floor(
      rounded / 60
    );

  const remainder =
    rounded % 60;

  return (
    `${minutes}:` +
    String(remainder)
      .padStart(
        2,
        "0"
      )
  );
}


/*
  Convert a percentage of threshold SPEED into pace.

  Example:
  threshold = 5:00/km = 300 sec/km

  80% threshold speed:
  300 / 0.80 = 375 sec/km = 6:15/km

  This is fundamentally different from simply adding a
  fixed number of seconds to every athlete's threshold pace.
*/
function paceAtSpeedFraction(
  thresholdSeconds:
    number,

  fraction:
    number
) {
  return (
    thresholdSeconds /
    fraction
  );
}


/*
  ============================================================
  RUN
  ============================================================

  Numerical running pace is deliberately broad at low
  intensity because terrain, heat, fatigue and running
  economy can change pace substantially.

  For Recovery/Easy, RPE / talk test is PRIMARY.
*/

export function buildRunBenchmarkTarget({
  workout,
  thresholdSecondsPerKm,
}: {
  workout: WorkoutLike;
  thresholdSecondsPerKm:
    number | null;
}): string | null {

  if (
    !thresholdSecondsPerKm ||
    thresholdSecondsPerKm <= 0
  ) {
    return null;
  }


  const domain =
    classifyWorkoutDomain(
      workout
    );


  /*
    Values are fractions of threshold SPEED,
    not fractions of threshold PACE.
  */
  const ranges:
    Record<
      PrescriptionDomain,
      {
        low: number;
        high: number;
        label: string;
        rpe: string;
        primaryRpe: boolean;
      }
    > = {

      Recovery: {
        low: 0.68,
        high: 0.76,
        label:
          "recovery running",
        rpe:
          "RPE 2–3, fully conversational",
        primaryRpe:
          true,
      },

      Easy: {
        low: 0.72,
        high: 0.80,
        label:
          "easy aerobic running",
        rpe:
          "RPE 2–4, comfortable conversation",
        primaryRpe:
          true,
      },

      Endurance: {
        low: 0.75,
        high: 0.84,
        label:
          "aerobic endurance running",
        rpe:
          "RPE 3–4, controlled and conversational",
        primaryRpe:
          true,
      },

      Steady: {
        low: 0.82,
        high: 0.88,
        label:
          "steady running",
        rpe:
          "RPE 4–5",
        primaryRpe:
          false,
      },

      Tempo: {
        low: 0.88,
        high: 0.94,
        label:
          "tempo running",
        rpe:
          "RPE 6–7, controlled",
        primaryRpe:
          false,
      },

      Threshold: {
        low: 0.96,
        high: 1.00,
        label:
          "threshold work",
        rpe:
          "RPE 7–8, sustainable only for the prescribed work blocks",
        primaryRpe:
          false,
      },

      VO2: {
        low: 1.04,
        high: 1.10,
        label:
          "short high-intensity intervals",
        rpe:
          "RPE 8–9",
        primaryRpe:
          false,
      },

      RaceSpecific: {
        /*
          Generic race-specific work stays below threshold
          unless another system explicitly defines the
          race demand.
        */
        low: 0.84,
        high: 0.94,
        label:
          "race-specific running",
        rpe:
          "controlled race-specific effort",
        primaryRpe:
          false,
      },
    };


  const zone =
    ranges[domain];


  /*
    Faster pace corresponds to HIGHER speed fraction.
  */
  const fast =
    formatPace(
      paceAtSpeedFraction(
        thresholdSecondsPerKm,
        zone.high
      )
    );

  const slow =
    formatPace(
      paceAtSpeedFraction(
        thresholdSecondsPerKm,
        zone.low
      )
    );


  if (
    zone.primaryRpe
  ) {
    return (
      `Benchmark target: ${zone.rpe}. ` +
      `Pace is secondary: approximately ${fast}–${slow}/km ` +
      `on suitable flat terrain. Slow down further for hills, heat or fatigue.`
    );
  }


  return (
    `Benchmark target: approximately ${fast}–${slow}/km ` +
    `for ${zone.label} · ${zone.rpe}.`
  );
}


/*
  ============================================================
  BIKE
  ============================================================

  FTP is useful for external load prescription, but session
  purpose still determines the domain.
*/

export function buildBikeBenchmarkTarget({
  workout,
  ftp,
}: {
  workout: WorkoutLike;
  ftp: number | null;
}): string | null {

  if (
    !ftp ||
    ftp <= 0
  ) {
    return null;
  }


  const domain =
    classifyWorkoutDomain(
      workout
    );


  const ranges:
    Record<
      PrescriptionDomain,
      {
        low: number;
        high: number;
        label: string;
        rpe: string;
      }
    > = {

      Recovery: {
        low: 0.40,
        high: 0.55,
        label:
          "recovery riding",
        rpe:
          "RPE 1–2",
      },

      Easy: {
        low: 0.50,
        high: 0.65,
        label:
          "easy riding",
        rpe:
          "RPE 2–3",
      },

      Endurance: {
        low: 0.56,
        high: 0.72,
        label:
          "aerobic endurance",
        rpe:
          "RPE 2–4",
      },

      Steady: {
        low: 0.68,
        high: 0.78,
        label:
          "steady aerobic work",
        rpe:
          "RPE 4–5",
      },

      Tempo: {
        low: 0.76,
        high: 0.87,
        label:
          "tempo work",
        rpe:
          "RPE 5–6",
      },

      Threshold: {
        low: 0.92,
        high: 1.00,
        label:
          "threshold work",
        rpe:
          "RPE 7–8",
      },

      VO2: {
        low: 1.06,
        high: 1.18,
        label:
          "VO2 work",
        rpe:
          "RPE 8–9",
      },

      RaceSpecific: {
        low: 0.68,
        high: 0.85,
        label:
          "race-specific work",
        rpe:
          "controlled race-specific effort",
      },
    };


  const zone =
    ranges[domain];


  const lowWatts =
    Math.round(
      ftp *
      zone.low
    );

  const highWatts =
    Math.round(
      ftp *
      zone.high
    );


  return (
    `Benchmark target: ${lowWatts}–${highWatts} W ` +
    `(${Math.round(zone.low * 100)}–${Math.round(zone.high * 100)}% FTP) ` +
    `for ${zone.label} · ${zone.rpe}.`
  );
}


/*
  ============================================================
  SWIM
  ============================================================

  CSS / critical swimming velocity is threshold-like,
  NOT an easy aerobic pace.

  Pace calculations use fractions of CSS SPEED.
*/

export function buildSwimBenchmarkTarget({
  workout,
  cssSecondsPer100m,
}: {
  workout: WorkoutLike;
  cssSecondsPer100m:
    number | null;
}): string | null {

  if (
    !cssSecondsPer100m ||
    cssSecondsPer100m <= 0
  ) {
    return null;
  }


  const domain =
    classifyWorkoutDomain(
      workout
    );


  const ranges:
    Record<
      PrescriptionDomain,
      {
        low: number;
        high: number;
        label: string;
        rpe: string;
      }
    > = {

      Recovery: {
        low: 0.72,
        high: 0.82,
        label:
          "recovery swimming",
        rpe:
          "RPE 2",
      },

      Easy: {
        low: 0.78,
        high: 0.86,
        label:
          "easy aerobic swimming",
        rpe:
          "RPE 2–3",
      },

      Endurance: {
        low: 0.82,
        high: 0.90,
        label:
          "aerobic endurance swimming",
        rpe:
          "RPE 3–4",
      },

      Steady: {
        low: 0.88,
        high: 0.93,
        label:
          "steady swimming",
        rpe:
          "RPE 4–5",
      },

      Tempo: {
        low: 0.92,
        high: 0.96,
        label:
          "tempo swimming",
        rpe:
          "RPE 5–6",
      },

      Threshold: {
        low: 0.96,
        high: 1.00,
        label:
          "CSS / threshold work",
        rpe:
          "RPE 7–8",
      },

      VO2: {
        low: 1.01,
        high: 1.06,
        label:
          "short fast repeats",
        rpe:
          "RPE 8–9",
      },

      RaceSpecific: {
        low: 0.88,
        high: 0.97,
        label:
          "race-specific swimming",
        rpe:
          "controlled race-specific effort",
      },
    };


  const zone =
    ranges[domain];


  const fast =
    formatPace(
      cssSecondsPer100m /
      zone.high
    );

  const slow =
    formatPace(
      cssSecondsPer100m /
      zone.low
    );


  return (
    `Benchmark target: approximately ${fast}–${slow}/100 m ` +
    `for ${zone.label} · ${zone.rpe}.`
  );
}
