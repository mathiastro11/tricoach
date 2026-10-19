"use client";

/* eslint-disable @next/next/no-img-element -- Local exercise images must work in Capacitor and Next.js. */

import {
  getExercise,
  searchExercises,
} from "@bryllim/workout-guide";

import type {
  StrengthExerciseKey,
} from "@/types/training";


type ExerciseIllustrationProps = {
  exerciseKey?: StrengthExerciseKey;
  exerciseName?: string;
};


type ResolvedVisual = {
  slug: string;
  name: string;
};

const LOCAL_EXERCISE_ASSET_ROOT =
  "/exercises/workout-guide";


const LOCAL_EXERCISE_SLUGS =
  new Set<string>([
    "bench-press",
    "bulgarian-split-squat",
    "calf-raise",
    "chest-supported-row",
    "dead-bug",
    "deadlift",
    "dumbbell-bench-press",
    "farmer-carry",
    "front-squat",
    "goblet-squat",
    "hack-squat",
    "hip-thrust",
    "incline-bench-press",
    "incline-dumbbell-press",
    "jump-squat",
    "landmine-press",
    "lat-pulldown",
    "leg-press",
    "pallof-press",
    "pull-up",
    "push-up",
    "reverse-lunge",
    "romanian-deadlift",
    "seated-calf-raise",
    "seated-row",
    "side-plank",
    "single-arm-cable-row",
    "single-leg-calf-raise",
    "squat",
    "standing-calf-raise",
    "step-up",
    "trap-bar-deadlift",
  ]);


function getLocalExerciseAssetUrl(
  slug: string,
  frame: number
): string | null {

  if (
    !LOCAL_EXERCISE_SLUGS.has(slug) ||
    (frame !== 1 && frame !== 3)
  ) {
    return null;
  }


  return (
    `${LOCAL_EXERCISE_ASSET_ROOT}/${slug}/frame-${frame}.png`
  );
}


/*
  ========================================================
  TRICOACH EXERCISE VISUAL RESOLVER V7
  ========================================================

  Priority:
  1. canonical TriCoach exerciseKey
  2. legacy exercise-name aliases
  3. conservative library search fallback

  We no longer depend on the first fuzzy search result
  for normal canonical exercises.
*/


const EXERCISE_SLUG_CANDIDATES:
  Partial<
    Record<
      StrengthExerciseKey,
      string[]
    >
  > = {

  "back-squat": [
    "squat",
  ],

  "front-squat": [
    "front-squat",
  ],

  "goblet-squat": [
    "goblet-squat",
  ],

  "leg-press": [
    "leg-press",
  ],

  "hack-squat": [
    "hack-squat",
  ],

  "romanian-deadlift": [
    "romanian-deadlift",
  ],

  "trap-bar-deadlift": [
    "trap-bar-deadlift",
    "deadlift",
  ],

  "hip-thrust": [
    "hip-thrust",
  ],

  "bulgarian-split-squat": [
    "bulgarian-split-squat",
  ],

  "reverse-lunge": [
    "reverse-lunge",
    "lunge",
  ],

  "step-up": [
    "step-up",
  ],

  "single-leg-press": [
    "single-leg-press",
    "leg-press",
  ],

  "seated-calf-raise": [
    "seated-calf-raise",
  ],

  "standing-calf-raise": [
    "standing-calf-raise",
    "calf-raise",
  ],

  "single-leg-calf-raise": [
    "single-leg-calf-raise",
    "standing-calf-raise",
  ],

  "pull-up": [
    "pull-up",
  ],

  "lat-pulldown": [
    "lat-pulldown",
  ],

  "chest-supported-row": [
    "chest-supported-row",
    "dumbbell-row",
  ],

  "cable-row": [
    "seated-row",
    "single-arm-cable-row",
  ],

  "bench-press": [
    "bench-press",
  ],

  "incline-dumbbell-press": [
    "incline-dumbbell-press",
    "incline-bench-press",
  ],

  "dumbbell-press": [
    "dumbbell-bench-press",
    "dumbbell-press",
    "bench-press",
  ],

  "push-up": [
    "push-up",
  ],

  "landmine-press": [
    "landmine-press",
  ],

  "pallof-press": [
    "pallof-press",
  ],

  "dead-bug": [
    "dead-bug",
  ],

  "side-plank": [
    "side-plank",
  ],

  "cable-anti-rotation": [
    "pallof-press",
  ],

  "carry": [
    "farmer-carry",
  ],

  "countermovement-jump": [
    "box-jump",
    "jump-squat",
  ],

  "box-jump": [
    "box-jump",
  ],

  "jump-squat": [
    "jump-squat",
  ],
};


function normalizeName(
  value?: string
) {
  return (
    value ?? ""
  )
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .trim();
}


function inferExerciseKeyFromName(
  exerciseName?: string
): StrengthExerciseKey | null {

  const name =
    normalizeName(
      exerciseName
    );

  if (!name) {
    return null;
  }


  const rules:
    Array<
      [
        StrengthExerciseKey,
        string[]
      ]
    > = [

    [
      "back-squat",
      [
        "back squat",
        "barbell back squat",
        "barbell squat",
      ],
    ],

    [
      "front-squat",
      [
        "front squat",
      ],
    ],

    [
      "goblet-squat",
      [
        "goblet squat",
      ],
    ],

    [
      "leg-press",
      [
        "leg press",
      ],
    ],

    [
      "hack-squat",
      [
        "hack squat",
      ],
    ],

    [
      "romanian-deadlift",
      [
        "romanian deadlift",
        "rdl",
      ],
    ],

    [
      "trap-bar-deadlift",
      [
        "trap bar deadlift",
        "hex bar deadlift",
      ],
    ],

    [
      "hip-thrust",
      [
        "hip thrust",
      ],
    ],

    [
      "bulgarian-split-squat",
      [
        "bulgarian split squat",
        "rear foot elevated split squat",
        "rfess",
      ],
    ],

    [
      "reverse-lunge",
      [
        "reverse lunge",
      ],
    ],

    [
      "step-up",
      [
        "step up",
        "stepup",
      ],
    ],

    [
      "single-leg-press",
      [
        "single leg press",
      ],
    ],

    [
      "seated-calf-raise",
      [
        "seated calf raise",
      ],
    ],

    [
      "single-leg-calf-raise",
      [
        "single leg calf raise",
      ],
    ],

    [
      "standing-calf-raise",
      [
        "standing calf raise",
        "calf raise",
      ],
    ],

    [
      "pull-up",
      [
        "pull up",
        "pullup",
      ],
    ],

    [
      "lat-pulldown",
      [
        "lat pulldown",
        "lat pull down",
      ],
    ],

    [
      "chest-supported-row",
      [
        "chest supported row",
      ],
    ],

    [
      "cable-row",
      [
        "cable row",
        "seated cable row",
      ],
    ],

    [
      "incline-dumbbell-press",
      [
        "incline dumbbell press",
        "incline db press",
      ],
    ],

    [
      "dumbbell-press",
      [
        "dumbbell press",
        "dumbbell bench press",
        "db bench press",
      ],
    ],

    [
      "bench-press",
      [
        "bench press",
        "barbell bench press",
      ],
    ],

    [
      "push-up",
      [
        "push up",
        "pushup",
      ],
    ],

    [
      "landmine-press",
      [
        "landmine press",
      ],
    ],

    [
      "pallof-press",
      [
        "pallof press",
      ],
    ],

    [
      "dead-bug",
      [
        "dead bug",
      ],
    ],

    [
      "side-plank",
      [
        "side plank",
      ],
    ],

    [
      "cable-anti-rotation",
      [
        "cable anti rotation",
        "anti rotation press",
      ],
    ],

    [
      "carry",
      [
        "farmer carry",
        "farmers carry",
        "farmer walk",
        "farmers walk",
        "loaded carry",
      ],
    ],

    [
      "countermovement-jump",
      [
        "countermovement jump",
        "counter movement jump",
      ],
    ],

    [
      "box-jump",
      [
        "box jump",
      ],
    ],

    [
      "jump-squat",
      [
        "jump squat",
        "squat jump",
      ],
    ],
  ];


  for (
    const [
      key,
      aliases
    ] of rules
  ) {

    if (
      aliases.some(
        alias =>
          name === alias ||
          name.includes(
            alias
          )
      )
    ) {
      return key;
    }

  }


  /*
    Generic "Squat" is the library's
    conventional back squat.
  */
  if (
    name === "squat"
  ) {
    return "back-squat";
  }


  return null;
}


const visualCache =
  new Map<
    string,
    ResolvedVisual | null
  >();


function resolveByCanonicalKey(
  key: StrengthExerciseKey
): ResolvedVisual | null {

  if (
    key === "other"
  ) {
    return null;
  }


  const candidates =
    EXERCISE_SLUG_CANDIDATES[
      key
    ] ?? [];


  for (
    const slug of candidates
  ) {

    const exercise =
      getExercise(
        slug
      );

    if (!exercise) {
      continue;
    }


    const start =
      getLocalExerciseAssetUrl(
        exercise.slug,
        1
      );

    const finish =
      getLocalExerciseAssetUrl(
        exercise.slug,
        3
      );


    if (
      start &&
      finish
    ) {

      return {
        slug:
          exercise.slug,

        name:
          exercise.name,
      };

    }

  }


  return null;
}


function resolveExerciseVisual(
  exerciseKey?: StrengthExerciseKey,
  exerciseName?: string
): ResolvedVisual | null {

  const cacheKey =
    `${exerciseKey ?? "legacy"}:${exerciseName ?? ""}`;


  if (
    visualCache.has(
      cacheKey
    )
  ) {
    return (
      visualCache.get(
        cacheKey
      ) ??
      null
    );
  }


  /*
    1. Canonical key is always preferred.
  */
  if (
    exerciseKey &&
    exerciseKey !== "other"
  ) {

    const canonical =
      resolveByCanonicalKey(
        exerciseKey
      );

    if (canonical) {

      visualCache.set(
        cacheKey,
        canonical
      );

      return canonical;
    }

  }


  /*
    2. Legacy workouts may have no exerciseKey.
       Infer it from their human-readable name.
  */
  const inferredKey =
    inferExerciseKeyFromName(
      exerciseName
    );


  if (inferredKey) {

    const inferred =
      resolveByCanonicalKey(
        inferredKey
      );

    if (inferred) {

      visualCache.set(
        cacheKey,
        inferred
      );

      return inferred;
    }

  }


  /*
    3. Last-resort search for genuine "other"
       or an unusual legacy exercise.

       We still verify that start + finish
       assets actually exist before using it.
  */
  const query =
    exerciseName?.trim();


  if (query) {

    const results =
      searchExercises(
        query
      );


    for (
      const result of results
    ) {

      const start =
        getLocalExerciseAssetUrl(
          result.slug,
          1
        );

      const finish =
        getLocalExerciseAssetUrl(
          result.slug,
          3
        );


      if (
        start &&
        finish
      ) {

        const resolved = {
          slug:
            result.slug,

          name:
            result.name,
        };


        visualCache.set(
          cacheKey,
          resolved
        );

        return resolved;
      }

    }

  }


  visualCache.set(
    cacheKey,
    null
  );

  return null;
}


export function hasExerciseIllustration(
  exerciseKey?: StrengthExerciseKey,
  exerciseName?: string
) {
  return Boolean(
    resolveExerciseVisual(
      exerciseKey,
      exerciseName
    )
  );
}


function MovementFrame({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {

  return (
    <div className="exerciseIllustrationFrame">

      <div className="exerciseIllustrationLibraryStage">

        <img
          src={src}
          alt={alt}
          className="exerciseIllustrationLibraryImage"
          width={480}
          height={480}
          loading="lazy"
          decoding="async"
        />

      </div>

    </div>
  );
}


export default function ExerciseIllustration({
  exerciseKey,
  exerciseName,
}: ExerciseIllustrationProps) {

  const visual =
    resolveExerciseVisual(
      exerciseKey,
      exerciseName
    );


  if (!visual) {
    return null;
  }


  const frame1 =
    getLocalExerciseAssetUrl(
      visual.slug,
      1
    );

  const frame3 =
    getLocalExerciseAssetUrl(
      visual.slug,
      3
    );


  if (
    !frame1 ||
    !frame3
  ) {
    return null;
  }


  return (
    <div className="exerciseIllustration exerciseIllustrationV6">

      <div className="exerciseIllustrationPair">

        <MovementFrame
          src={frame1}
          alt={`${visual.name} movement position 1`}
        />

        <MovementFrame
          src={frame3}
          alt={`${visual.name} movement position 2`}
        />

      </div>


      <div className="exerciseIllustrationCredit">
        Exercise artwork by{" "}
        <a
          href="https://bryllim.com"
          target="_blank"
          rel="noreferrer"
        >
          Bryl Lim
        </a>
        {" · "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY-SA 4.0
        </a>
        {" · "}
        <a
          href="/exercises/workout-guide/ATTRIBUTION.md"
          target="_blank"
          rel="noreferrer"
        >
          Attribution & changes
        </a>
      </div>

    </div>
  );
}
