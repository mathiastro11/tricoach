import type {
  Athlete,
  TrainingPlan,
  TrainingPlanDay,
} from "@/types/training";

import {
  buildBikeBenchmarkTarget,
  buildRunBenchmarkTarget,
  buildSwimBenchmarkTarget,
} from "@/lib/training-zones";


function finiteNumber(
  value: unknown
): number | null {

  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  )
    ? value
    : null;
}


function findNumberDeep(
  value: unknown,
  keys: string[]
): number | null {

  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }


  for (
    const [
      rawKey,
      child,
    ]
    of Object.entries(
      value as Record<
        string,
        unknown
      >
    )
  ) {

    const key =
      rawKey
        .toLowerCase()
        .replace(
          /[^a-z0-9]/g,
          ""
        );


    if (
      keys.some(
        (candidate) =>
          key.includes(
            candidate
          )
      )
    ) {

      const number =
        finiteNumber(
          child
        );


      if (
        number !== null
      ) {
        return number;
      }
    }


    const nested =
      findNumberDeep(
        child,
        keys
      );


    if (
      nested !== null
    ) {
      return nested;
    }
  }


  return null;
}


function getFtp(
  athlete:
    Athlete
) {

  return findNumberDeep(
    athlete.benchmarks,
    [
      "ftpwatts",
      "ftp",
      "thresholdpower",
    ]
  );
}


function getCss(
  athlete:
    Athlete
) {

  const direct =
    findNumberDeep(
      athlete.benchmarks,
      [
        "csssecondsper100m",
        "csspace",
        "css",
      ]
    );


  if (
    direct !== null
  ) {
    return direct;
  }


  const swim400 =
    findNumberDeep(
      athlete.benchmarks,
      [
        "fourhundredseconds",
        "400mseconds",
        "400seconds",
        "swim400",
        "time400",
      ]
    );


  const swim200 =
    findNumberDeep(
      athlete.benchmarks,
      [
        "twohundredseconds",
        "200mseconds",
        "200seconds",
        "swim200",
        "time200",
      ]
    );


  if (
    swim400 === null ||
    swim200 === null ||
    swim400 <= swim200
  ) {
    return null;
  }


  const css =
    (
      swim400 -
      swim200
    ) / 2;


  if (
    css < 45 ||
    css > 210
  ) {
    return null;
  }


  return css;
}


function getRunThreshold(
  athlete:
    Athlete
) {

  const direct =
    findNumberDeep(
      athlete.benchmarks,
      [
        "thresholdsecondsperkm",
        "thresholdpace",
      ]
    );


  if (
    direct !== null
  ) {
    return direct;
  }


  const tenK =
    findNumberDeep(
      athlete.benchmarks,
      [
        "tenkseconds",
        "10kseconds",
      ]
    );


  if (
    tenK !== null
  ) {
    return (
      tenK / 10 +
      5
    );
  }


  const fiveK =
    findNumberDeep(
      athlete.benchmarks,
      [
        "fivekseconds",
        "5kseconds",
      ]
    );


  if (
    fiveK !== null
  ) {
    return (
      fiveK / 5 +
      15
    );
  }


  return null;
}


function cleanOldBenchmarkText(
  value: string
) {

  return value
    .replace(
      /\s*·\s*\d+–\d+\s*W\s*\([^)]*FTP\)/gi,
      ""
    )
    .replace(
      /\s*·\s*\d+:\d{2}–\d+:\d{2}\/(?:km|100\s*m).*$/gi,
      ""
    )
    .trim();
}


function cleanDetails(
  details:
    string[]
) {

  return details.filter(
    (detail) =>
      !detail.startsWith(
        "Benchmark target:"
      ) &&
      !detail.startsWith(
        "Main work target:"
      ) &&
      !detail.startsWith(
        "Main-set target:"
      )
  );
}


function parseBikeTarget(
  target: string
) {

  const match =
    target.match(
      /(\d+)–(\d+) W \((\d+)–(\d+)% FTP\)/
    );


  if (!match) {
    return null;
  }


  return {
    lowWatts:
      match[1],

    highWatts:
      match[2],

    lowPercent:
      match[3],

    highPercent:
      match[4],
  };
}


function parsePaceTarget(
  target:
    string,

  unit:
    "km" |
    "100 m"
) {

  const expression =
    unit === "km"
      ? /approximately (\d+:\d{2})–(\d+:\d{2})\/km/
      : /approximately (\d+:\d{2})–(\d+:\d{2})\/100 m/;


  const match =
    target.match(
      expression
    );


  if (!match) {
    return null;
  }


  return {
    fast:
      match[1],

    slow:
      match[2],
  };
}


function isEasyAerobicWorkout(
  workout:
    TrainingPlanDay
) {

  const text = [
    workout.title,
    workout.purpose,
    workout.intensity,
    ...(workout.details ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();


  const hard =
    /threshold|tempo|vo2|interval|race pace|race-specific|hard|anaerobic|sweet spot|hill repeat|speed work/.test(
      text
    );


  if (hard) {
    return false;
  }


  return (
    /easy|recovery|aerobic|endurance|long|zone 1|zone 2|z1|z2|technique/.test(
      text
    )
  );
}


function buildEffortFirstIntensity(
  workout:
    TrainingPlanDay,

  reference:
    string | null
) {

  const easy =
    isEasyAerobicWorkout(
      workout
    );


  if (easy) {

    if (
      workout.sport ===
      "Run"
    ) {
      return reference
        ? `RPE 2–3 · Conversational · ${reference}`
        : "RPE 2–3 · Conversational";
    }


    if (
      workout.sport ===
      "Bike"
    ) {
      return reference
        ? `RPE 2–3 · Easy aerobic · ${reference}`
        : "RPE 2–3 · Easy aerobic";
    }


    if (
      workout.sport ===
      "Swim"
    ) {
      return reference
        ? `RPE 2–4 · Smooth aerobic · ${reference}`
        : "RPE 2–4 · Smooth aerobic";
    }

  }


  const base =
    cleanOldBenchmarkText(
      workout.intensity
    );


  return reference
    ? `${base} · ${reference}`
    : base;
}


function prescribeBike(
  workout:
    TrainingPlanDay,

  target:
    string
): TrainingPlanDay {

  const parsed =
    parseBikeTarget(
      target
    );


  if (!parsed) {
    return workout;
  }


  const {
    lowWatts,
    highWatts,
    lowPercent,
    highPercent,
  } = parsed;


  const details =
    cleanDetails(
      workout.details ??
      []
    );


  let changedWorkBlock =
    false;


  const nextDetails =
    details.map(
      (detail) => {

        const lower =
          detail
            .toLowerCase();


        if (
          /warm.?up|cool.?down|recovery|recover|very easy|easy spin|rest/.test(
            lower
          )
        ) {
          return detail;
        }


        if (
          /\b\d{2,4}\s*(?:–|-|to)\s*\d{2,4}\s*w\b/i.test(
            detail
          )
        ) {

          changedWorkBlock =
            true;


          return detail.replace(
            /\b\d{2,4}\s*(?:–|-|to)\s*\d{2,4}\s*w\b/gi,
            `${lowWatts}–${highWatts} W`
          );
        }


        if (
          /\b\d{1,3}\s*(?:–|-|to)\s*\d{1,3}\s*%\s*(?:of\s*)?ftp\b/i.test(
            detail
          )
        ) {

          changedWorkBlock =
            true;


          return detail.replace(
            /\b\d{1,3}\s*(?:–|-|to)\s*\d{1,3}\s*%\s*(?:of\s*)?ftp\b/gi,
            `${lowPercent}–${highPercent}% FTP (${lowWatts}–${highWatts} W)`
          );
        }


        return detail;
      }
    );


  if (
    !changedWorkBlock
  ) {

    nextDetails.splice(
      Math.min(
        1,
        nextDetails.length
      ),
      0,
      `Main work target: ${lowWatts}–${highWatts} W (${lowPercent}–${highPercent}% FTP). Keep the prescribed RPE alongside power.`
    );
  }


  nextDetails.push(
    target
  );


  return {
    ...workout,

    intensity:
      buildEffortFirstIntensity(
        workout,
        `Power ref ~${lowWatts}–${highWatts} W`
      ),

    details:
      cleanDetails(
        nextDetails
      ),
  };
}


function prescribeRun(
  workout:
    TrainingPlanDay,

  target:
    string
): TrainingPlanDay {

  const parsed =
    parsePaceTarget(
      target,
      "km"
    );


  if (!parsed) {
    return workout;
  }


  const {
    fast,
    slow,
  } = parsed;


  const details =
    cleanDetails(
      workout.details ??
      []
    );


  let changed =
    false;


  const nextDetails =
    details.map(
      (detail) => {

        if (
          /warm.?up|cool.?down|recovery jog|very easy/.test(
            detail.toLowerCase()
          )
        ) {
          return detail;
        }


        if (
          /\d+:\d{2}\s*(?:–|-|to)\s*\d+:\d{2}\s*\/?\s*km/i.test(
            detail
          )
        ) {

          changed =
            true;


          return detail.replace(
            /\d+:\d{2}\s*(?:–|-|to)\s*\d+:\d{2}\s*\/?\s*km/gi,
            `${fast}–${slow}/km`
          );
        }


        return detail;
      }
    );


  if (!changed) {

    nextDetails.splice(
      Math.min(
        1,
        nextDetails.length
      ),
      0,
      `Main work target: ${fast}–${slow}/km. Use effort/RPE as the primary guide on hills, heat or fatigue.`
    );
  }


  nextDetails.push(
    target
  );


  return {
    ...workout,

    intensity:
      buildEffortFirstIntensity(
        workout,
        `Flat pace ref ~${fast}–${slow}/km`
      ),

    details:
      cleanDetails(
        nextDetails
      ),
  };
}


function prescribeSwim(
  workout:
    TrainingPlanDay,

  target:
    string
): TrainingPlanDay {

  const parsed =
    parsePaceTarget(
      target,
      "100 m"
    );


  if (!parsed) {
    return workout;
  }


  const {
    fast,
    slow,
  } = parsed;


  const details =
    cleanDetails(
      workout.details ??
      []
    );


  let changed =
    false;


  const nextDetails =
    details.map(
      (detail) => {

        if (
          /warm.?up|cool.?down|recovery|drill|technique/.test(
            detail.toLowerCase()
          )
        ) {
          return detail;
        }


        if (
          /\d+:\d{2}\s*(?:–|-|to)\s*\d+:\d{2}\s*\/?\s*100\s*m/i.test(
            detail
          )
        ) {

          changed =
            true;


          return detail.replace(
            /\d+:\d{2}\s*(?:–|-|to)\s*\d+:\d{2}\s*\/?\s*100\s*m/gi,
            `${fast}–${slow}/100 m`
          );
        }


        return detail;
      }
    );


  if (!changed) {

    nextDetails.splice(
      Math.min(
        1,
        nextDetails.length
      ),
      0,
      `Main-set target: ${fast}–${slow}/100 m. Preserve smooth technique and the intended RPE.`
    );
  }


  nextDetails.push(
    target
  );


  return {
    ...workout,

    intensity:
      buildEffortFirstIntensity(
        workout,
        `Pace ref ~${fast}–${slow}/100 m`
      ),

    details:
      cleanDetails(
        nextDetails
      ),
  };
}


function compactBlockPerformanceTarget(
  target: string | null,
  sport: string
): string | undefined {

  if (!target) {
    return undefined;
  }


  if (
    sport === "Bike"
  ) {
    const watts =
      target.match(
        /(\d+\s*[–-]\s*\d+\s*W)(?:\s*\([^)]*FTP\))?/i
      );

    if (watts) {
      return watts[1]
        .replace(
          /\s+/g,
          " "
        )
        .trim();
    }
  }


  if (
    sport === "Run"
  ) {
    const pace =
      target.match(
        /(\d+:\d{2}\s*[–-]\s*\d+:\d{2}\/km)/i
      );

    if (pace) {
      return pace[1]
        .replace(
          /\s+/g,
          " "
        )
        .trim();
    }
  }


  if (
    sport === "Swim"
  ) {
    const pace =
      target.match(
        /(\d+:\d{2}\s*[–-]\s*\d+:\d{2}\/100\s*m)/i
      );

    if (pace) {
      return pace[1]
        .replace(
          /\s+/g,
          " "
        )
        .trim();
    }
  }


  return undefined;
}


export function applyBenchmarkPrescriptionToPlan(
  plan:
    TrainingPlan,

  athlete:
    Athlete
): TrainingPlan {

  if (
    !athlete.benchmarks
  ) {
    return plan;
  }


  const ftp =
    getFtp(
      athlete
    );


  const css =
    getCss(
      athlete
    );


  const runThreshold =
    getRunThreshold(
      athlete
    );


  const prescribeWorkout = (
    workout:
      TrainingPlan["days"][number]
  ) => {

    if (
      workout.durationMinutes <= 0 ||
      workout.sport === "Rest" ||
      workout.isRaceDay ||
      workout.isPostRace
    ) {
      return workout;
    }


    /*
      Structured workouts:

      Benchmark the ACTUAL Main blocks individually instead
      of attaching one generic target to the whole session.

      This also handles Brick correctly because block.sport
      may change from Bike to Run.
    */
    if (
      workout.workoutStructure?.length
    ) {

      const workoutStructure =
        workout.workoutStructure.map(
          (block) => {

            /*
              Performance references are useful on nearly
              every executable block when a valid athlete
              benchmark exists.

              Warm-up and cool-down stay deliberately free
              of benchmark pressure.
            */
            if (
              block.phase === "Warm-up" ||
              block.phase === "Cool-down"
            ) {
              return {
                ...block,
                performanceTarget:
                  undefined,
              };
            }


            /*
              Use explicit block sport first.

              Older Brick plans may not have block.sport,
              so detect the actual transition Run exactly
              like the visualizer does.
            */
            const blockText =
              [
                block.label,
                block.workIntensity,
                block.workInstruction,
                block.recoveryIntensity,
                block.recoveryInstruction,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const inferredBrickRun =
              workout.sport === "Bike" &&
              block.phase === "Main" &&
              (
                blockText.includes(
                  "transition run"
                ) ||
                /\brun\b/.test(
                  blockText
                ) ||
                /\brunning\b/.test(
                  blockText
                ) ||
                /\bjog\b/.test(
                  blockText
                )
              );


            const blockSport =
              block.sport ??
              (
                inferredBrickRun
                  ? "Run"
                  : workout.sport
              );


            const blockWorkout = {
              ...workout,

              sport:
                blockSport,

              title:
                block.label ||
                workout.title,

              /*
                Domain classification should come primarily
                from what this block IS.

                A threshold block should not become "Easy"
                merely because its coaching cue says to keep
                shoulders relaxed or technique smooth.
              */
              intensity:
                [
                  block.label,
                  block.workIntensity,
                ]
                  .filter(Boolean)
                  .join(" · "),

              purpose:
                [
                  block.label,
                  workout.purpose,
                ]
                  .filter(Boolean)
                  .join(" · "),

              /*
                Include only canonical block identity,
                not verbose coaching cues.
              */
              details: [],
            };


            let target:
              string | null =
                null;


            if (
              blockSport === "Bike"
            ) {
              target =
                buildBikeBenchmarkTarget({
                  workout:
                    blockWorkout,
                  ftp,
                });
            }


            if (
              blockSport === "Run"
            ) {
              target =
                buildRunBenchmarkTarget({
                  workout:
                    blockWorkout,

                  thresholdSecondsPerKm:
                    runThreshold,
                });
            }


            if (
              blockSport === "Swim"
            ) {
              target =
                buildSwimBenchmarkTarget({
                  workout:
                    blockWorkout,

                  cssSecondsPer100m:
                    css,
                });
            }


            return {
              ...block,

              performanceTarget:
                compactBlockPerformanceTarget(
                  target,
                  blockSport
                ),
            };
          }
        );


      const mainTargets =
        workoutStructure
          .map(
            (block) =>
              block.performanceTarget
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          );


      return {
        ...workout,

        workoutStructure,

        /*
          Keep top-level metadata for backwards-compatible
          surfaces, but Workout Details should use the
          per-block targets.
        */
        performanceTarget:
          mainTargets[0],
      };
    }


    if (
      workout.sport ===
        "Bike"
    ) {

      const target =
        buildBikeBenchmarkTarget({
          workout,
          ftp,
        });


      return target
        ? prescribeBike(
            workout,
            target
          )
        : workout;
    }


    if (
      workout.sport ===
        "Run"
    ) {

      const target =
        buildRunBenchmarkTarget({
          workout,

          thresholdSecondsPerKm:
            runThreshold,
        });


      return target
        ? prescribeRun(
            workout,
            target
          )
        : workout;
    }


    if (
      workout.sport ===
        "Swim"
    ) {

      const target =
        buildSwimBenchmarkTarget({
          workout,

          cssSecondsPer100m:
            css,
        });


      return target
        ? prescribeSwim(
            workout,
            target
          )
        : workout;
    }


    return workout;
  };


  const days =
    plan.days.map(
      prescribeWorkout
    );


  const additionalSessions =
    (
      plan.additionalSessions ??
      []
    ).map(
      prescribeWorkout
    );


  return {
    ...plan,
    days,
    additionalSessions,
  };
}
