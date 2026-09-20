"use client";

import TrainingTerm from "@/components/TrainingTerm";

import {
  formatDuration,
} from "@/lib/format-duration";

import WorkoutStructureVisual from "@/components/WorkoutStructureVisual";

import StrengthWorkoutView from "@/components/StrengthWorkoutView";

import {
  getWorkoutExecutionRows,
} from "@/lib/workout-structure-ui";

import {
  useState,
} from "react";

import type {
  Athlete,
  TrainingPlanDay,
  WorkoutFeedback,
} from "@/types/training";

import {
  isRestWorkout,
} from "@/lib/training";

type WorkoutDetailsModalProps = {
  workout: TrainingPlanDay | null;

  targetRace?: Athlete["targetRace"];

  unitSystem?: Athlete["unitSystem"];

  week: TrainingPlanDay[];

  additionalSessions?: TrainingPlanDay[];

  isLogged: boolean;

  feedback?: WorkoutFeedback | null;

  isManualSession?: boolean;

  previewOnly?: boolean;

  onClose: () => void;

  onLogWorkout: (
    workout: TrainingPlanDay
  ) => void;

  canEditLog?: boolean;

  onEditLog?: (
    workout: TrainingPlanDay,
    feedback: WorkoutFeedback
  ) => void;

  onAdaptWorkout: (
    workout: TrainingPlanDay
  ) => void;

  onRemoveWorkout: (
    workout: TrainingPlanDay
  ) => void;

  onRemoveManualWorkout?: (
    workout: TrainingPlanDay
  ) => void;

  onEditManualWorkout?: (
    workout: TrainingPlanDay
  ) => void;

  onRestoreOriginal: (
    workout: TrainingPlanDay
  ) => void;

  onMoveWorkout: (
    workout: TrainingPlanDay,
    targetDay: string
  ) => {
    success: boolean;
    message: string;
  };

};

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function WorkoutDetailsModal({
  workout,
  targetRace,
  unitSystem = "Metric",
  week,
  additionalSessions = [],
  isLogged,
  feedback = null,
  isManualSession = false,
  previewOnly = false,
  onClose,
  onLogWorkout,
  canEditLog = false,
  onEditLog,
  onAdaptWorkout,
  onRemoveWorkout,
  onRemoveManualWorkout,
  onEditManualWorkout,
  onMoveWorkout,
  onRestoreOriginal,
}: WorkoutDetailsModalProps) {

  const [
    moveOpen,
    setMoveOpen,
  ] = useState(false);

  const [
    targetDay,
    setTargetDay,
  ] = useState("");

  const [
    moveMessage,
    setMoveMessage,
  ] = useState("");

  const [
    originalOpen,
    setOriginalOpen,
  ] = useState(false);

  const [
    restoreOpen,
    setRestoreOpen,
  ] = useState(false);

  const [
    moreOpen,
    setMoreOpen,
  ] = useState(false);

  const [
    manualRemoveOpen,
    setManualRemoveOpen,
  ] = useState(false);

  if (!workout) return null;

  // Keep a non-null reference for callbacks defined below.
  const activeWorkout = workout;

  const isRecoveryDay =
    isRestWorkout(activeWorkout);


  const completedFeedback =
    feedback;


  function formatCompletedDuration(
    minutes:
      number | null
  ) {
    if (
      minutes === null ||
      !Number.isFinite(minutes)
    ) {
      return "—";
    }

    return formatDuration(
      minutes
    );
  }


  function formatCompletedDistance(
    item:
      WorkoutFeedback
  ) {
    if (
      item.distance === null ||
      !Number.isFinite(
        item.distance
      )
    ) {
      return null;
    }


    if (
      unitSystem === "Imperial"
    ) {

      if (
        item.distanceUnit ===
        "m"
      ) {
        const yards =
          item.distance *
          1.0936133;

        return `${
          Math.round(yards)
        } yd`;
      }


      const miles =
        item.distance *
        0.6213711922;

      return `${
        Number(
          miles.toFixed(
            miles >= 10
              ? 1
              : 2
          )
        )
      } mi`;
    }


    if (
      item.distanceUnit ===
      "m"
    ) {
      return `${
        Math.round(
          item.distance
        )
      } m`;
    }


    return `${
      Number(
        item.distance.toFixed(
          item.distance >= 10
            ? 1
            : 2
        )
      )
    } km`;
  }


  /*
    ======================================================
    RACE DAY EXPERIENCE
    ======================================================

    A target race is not a zero-minute workout.

    It gets its own presentation and never falls through
    to the normal Workout Details experience.
  */

  if (activeWorkout.isRaceDay) {

    const raceName =
      activeWorkout.targetRaceName ??
      targetRace?.name ??
      "Target race";


    const raceFormat =
      targetRace?.format ??
      "Triathlon";


    const normalizedFormat =
      String(
        raceFormat
      ).toLowerCase();


    const isLongCourse =
      normalizedFormat.includes(
        "70.3"
      ) ||
      normalizedFormat.includes(
        "ironman"
      );


    function formatRaceDistance(
      km: number | null | undefined
    ) {

      if (
        km == null ||
        !Number.isFinite(km)
      ) {
        return "—";
      }


      if (
        unitSystem ===
        "Imperial"
      ) {

        const miles =
          km *
          0.6213711922;


        return `${
          Number(
            (
              miles >= 10
                ? miles.toFixed(1)
                : miles.toFixed(2)
            )
          )
        } mi`;
      }


      return `${
        Number(
          km.toFixed(2)
        )
      } km`;
    }


    const swimDistance =
      formatRaceDistance(
        targetRace?.swim
          ?.distanceKm
      );


    const bikeDistance =
      formatRaceDistance(
        targetRace?.bike
          ?.distanceKm
      );


    const runDistance =
      formatRaceDistance(
        targetRace?.run
          ?.distanceKm
      );


    const raceDateLabel =
      activeWorkout.date
        ? new Date(
            `${activeWorkout.date}T12:00:00`
          ).toLocaleDateString(
            "en-GB",
            {
              weekday:
                "long",
              day:
                "numeric",
              month:
                "long",
            }
          )
        : activeWorkout.day;


    const swimPlan =
      isLongCourse
        ? "Start controlled. Find clean water and your rhythm before thinking about speed. Settle the breathing, stay efficient and avoid spending energy fighting the field."
        : "Stay calm through the opening rush. Establish rhythm quickly, swim clean lines and build effort only once breathing and technique feel settled.";


    const bikePlan =
      isLongCourse
        ? "The bike is about discipline. Let the race come to you, stay smooth early and protect the run. Ride the effort you prepared for — not the effort other athletes choose."
        : "Build into race effort instead of forcing the first minutes. Stay aerodynamic and smooth, carry speed efficiently and save one gear for the run.";


    const runPlan =
      isLongCourse
        ? "Make the opening part feel almost too controlled. Let pace come naturally as the legs settle. Stay patient through the middle, then race what is left."
        : "Control the first minutes out of transition. Find posture and cadence, then progressively turn the run into a race as you approach the finish.";


    const fuelPlan =
      isLongCourse
        ? [
            "Eat the breakfast and use the nutrition you have already practised.",
            "Start fueling and drinking early on the bike — before hunger or thirst arrives.",
            "Keep the plan simple and consistent. Race day is not the time to experiment.",
            "Use the run to maintain the plan, not to rescue missed fueling from the bike.",
          ]
        : [
            "Use your normal pre-race breakfast and hydration routine.",
            "Take only nutrition you have already practised in training.",
            "Stay topped up before the start without overdrinking.",
            "Keep race nutrition simple so execution stays the priority.",
          ];


    return (
      <div
        className="raceDayDetailsOverlay"
        onClick={
          onClose
        }
      >
        <section
          className="raceDayDetailsModal"
          onClick={
            (event) =>
              event.stopPropagation()
          }
        >

          <header className="raceDayHero">

            <div className="raceDayHeroTop">

              <div>
                <span className="raceDayKicker">
                  TARGET RACE · {String(
                    raceFormat
                  ).toUpperCase()}
                </span>

                <div className="raceDayFlag">
                  RACE DAY
                </div>
              </div>

              <button
                type="button"
                className="raceDayClose"
                onClick={
                  onClose
                }
                aria-label="Close race plan"
              >
                ×
              </button>

            </div>


            <div className="raceDayHeroCopy">

              <div className="raceDayHeroMeta">
                <p className="raceDayDate">
                  {raceDateLabel}
                </p>

                <span>
                  {String(
                    raceFormat
                  ).toUpperCase()}
                </span>
              </div>

              <h2>
                {raceName}
              </h2>

              <p className="raceDayHeroLine">
                The work is done. Today is about
                execution.
              </p>

            </div>


            <div className="raceDayCourse">

              <div className="raceDayCourseIntro">
                <span>
                  COURSE
                </span>

                <strong>
                  Your race, broken down.
                </strong>
              </div>


              <div className="raceDayCourseLeg raceDayCourseSwim">
                <span>
                  SWIM
                </span>

                <strong>
                  {swimDistance}
                </strong>
              </div>


              <div className="raceDayCourseLeg raceDayCourseBike">
                <span>
                  BIKE
                </span>

                <strong>
                  {bikeDistance}
                </strong>
              </div>


              <div className="raceDayCourseLeg raceDayCourseRun">
                <span>
                  RUN
                </span>

                <strong>
                  {runDistance}
                </strong>
              </div>

            </div>


          </header>


          <div className="raceDayBody">

            <section className="raceDayPlan">

              <div className="raceDaySectionHead">
                <span>
                  RACE PLAN
                </span>

                <strong>
                  Execute the day
                </strong>
              </div>


              <div className="raceDayDiscipline">

                <div className="raceDayDisciplineNumber">
                  01
                </div>

                <div>
                  <span>
                    SWIM
                  </span>

                  <h3>
                    Find rhythm first.
                  </h3>

                  <p>
                    {swimPlan}
                  </p>
                </div>

              </div>


              <div className="raceDayTransitionLine">
                <span>
                  T1
                </span>

                <p>
                  Smooth is fast. Breathe, execute
                  the routine and leave transition
                  under control.
                </p>
              </div>


              <div className="raceDayDiscipline">

                <div className="raceDayDisciplineNumber">
                  02
                </div>

                <div>
                  <span>
                    BIKE
                  </span>

                  <h3>
                    Discipline before speed.
                  </h3>

                  <p>
                    {bikePlan}
                  </p>
                </div>

              </div>


              <div className="raceDayTransitionLine">
                <span>
                  T2
                </span>

                <p>
                  Reset. Get organised, find your
                  feet and let the run come to you.
                </p>
              </div>


              <div className="raceDayDiscipline">

                <div className="raceDayDisciplineNumber">
                  03
                </div>

                <div>
                  <span>
                    RUN
                  </span>

                  <h3>
                    Patience, then race.
                  </h3>

                  <p>
                    {runPlan}
                  </p>
                </div>

              </div>

            </section>


            <div className="raceDaySide">

              <section className="raceDayFuel">

                <div className="raceDaySectionHead">
                  <span>
                    FUEL & HYDRATION
                  </span>

                  <strong>
                    Stay ahead
                  </strong>
                </div>

                <div className="raceDayChecklist">
                  {fuelPlan.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          `${item}-${index}`
                        }
                      >
                        <span>
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <p>
                          {item}
                        </p>
                      </div>
                    )
                  )}
                </div>

              </section>


              <section className="raceDayMorning">

                <div className="raceDaySectionHead">
                  <span>
                    RACE MORNING
                  </span>

                  <strong>
                    Keep it simple
                  </strong>
                </div>

                <ul>
                  <li>
                    Eat and drink what you know.
                  </li>

                  <li>
                    Arrive with time to spare.
                  </li>

                  <li>
                    Check equipment once, then stop
                    checking.
                  </li>

                  <li>
                    Warm up enough to feel ready,
                    not tired.
                  </li>

                  <li>
                    Take a quiet moment before the
                    start.
                  </li>
                </ul>

              </section>


              <section className="raceDayMindset">
                <span>
                  COACH NOTE
                </span>

                <blockquote>
                  You do not need to prove your fitness
                  in the first hour. Give yourself the
                  chance to use it at the end.
                </blockquote>
              </section>

            </div>

          </div>


          <footer className="raceDayFooter">

            <div>
              <span>
                BASSE
              </span>

              <strong>
                Trust the work.
              </strong>
            </div>

            <p>
              Race the plan. Adapt to the day.
            </p>

          </footer>

        </section>
      </div>
    );
  }


  function confirmMove() {
    if (!targetDay) {
      setMoveMessage(
        "Choose a day first."
      );
      return;
    }

    if (targetDay === activeWorkout.day) {
      setMoveMessage(
        "This workout is already on that day."
      );
      return;
    }

    const result =
      onMoveWorkout(
        activeWorkout,
        targetDay
      );

    setMoveMessage(
      result.message
    );

    if (result.success) {
      setMoveOpen(false);
      setTargetDay("");
    }
  }

  function getIntensityRpe(
    item: TrainingPlanDay
  ) {

    const match =
      (
        item.intensity ??
        ""
      ).match(
        /RPE\s*(\d+)(?:\s*[–-]\s*(\d+))?/i
      );


    if (!match) {
      return null;
    }


    return match[2]
      ? `RPE ${match[1]}–${match[2]}`
      : `RPE ${match[1]}`;
  }


  function getWorkoutFeel(
    item: TrainingPlanDay
  ) {

    /*
      Canonical structured workouts:

      The character of the workout should come from
      the MAIN training stimulus — not from warm-up,
      recovery or cool-down text.

      Example:
      threshold intervals + easy recoveries
      must feel "Controlled hard", not "Very relaxed".
    */
    const mainStructure =
      item.workoutStructure?.filter(
        (block) =>
          block.phase === "Main"
      ) ?? [];


    if (
      mainStructure.length > 0
    ) {
      const mainText =
        mainStructure
          .flatMap(
            (block) => [
              block.label,
              block.workIntensity,
              block.workInstruction,
            ]
          )
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


      const rpeValues =
        Array.from(
          mainText.matchAll(
            /\brpe\s*([1-9]|10)(?:\s*[–-]\s*([1-9]|10))?/gi
          )
        )
          .flatMap(
            (match) => [
              Number(match[1]),
              match[2]
                ? Number(match[2])
                : Number(match[1]),
            ]
          )
          .filter(
            (value) =>
              Number.isFinite(value)
          );


      const highestRpe =
        rpeValues.length > 0
          ? Math.max(
              ...rpeValues
            )
          : null;


      if (
        highestRpe !== null &&
        highestRpe >= 9
      ) {
        return {
          title:
            "Hard but repeatable",

          detail:
            "The work should feel very demanding, but controlled enough to complete every repetition well.",
        };
      }


      if (
        (
          highestRpe !== null &&
          highestRpe >= 7
        ) ||
        /threshold|tempo|sweet spot|controlled hard|zone 4|z4/.test(
          mainText
        )
      ) {
        return {
          title:
            "Controlled hard",

          detail:
            "Strong but sustainable. Keep the early repetitions controlled so the final ones stay high quality.",
        };
      }


      if (
        (
          highestRpe !== null &&
          highestRpe >= 6
        ) ||
        /moderate|steady|zone 3|z3/.test(
          mainText
        )
      ) {
        return {
          title:
            "Steady & purposeful",

          detail:
            "Clearly working, but still controlled and sustainable.",
        };
      }


      if (
        (
          highestRpe !== null &&
          highestRpe <= 3
        ) ||
        /recovery|very easy/.test(
          mainText
        )
      ) {
        return {
          title:
            "Very relaxed",

          detail:
            "Should feel restorative and comfortably easy.",
        };
      }


      if (
        /easy|aerobic|endurance|zone 2|z2|conversational/.test(
          mainText
        )
      ) {
        return {
          title:
            "Relaxed & conversational",

          detail:
            "Breathing should stay controlled. Full sentences should feel comfortable.",
        };
      }


      return {
        title:
          "Controlled",

        detail:
          "Follow the prescribed effort and prioritize smooth execution.",
      };
    }


    /*
      Legacy fallback for older workouts that do not
      yet contain workoutStructure.
    */
    const text = [
      item.title,
      item.intensity,
      item.purpose,
      ...(item.details ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


    if (
      /recovery|very easy/.test(
        text
      )
    ) {
      return {
        title:
          "Very relaxed",

        detail:
          "Should feel restorative and comfortably easy.",
      };
    }


    if (
      /easy|aerobic|endurance|zone 2|z2|conversational/.test(
        text
      ) &&
      !/threshold|tempo|vo2|hard|interval/.test(
        text
      )
    ) {
      return {
        title:
          "Relaxed & conversational",

        detail:
          "Breathing should stay controlled. Full sentences should feel comfortable.",
      };
    }


    if (
      /threshold|tempo|sweet spot/.test(
        text
      )
    ) {
      return {
        title:
          "Controlled hard",

        detail:
          "Strong but sustainable. Do not turn the first repetition into a test.",
      };
    }


    if (
      /vo2|hard aerobic|high intensity/.test(
        text
      )
    ) {
      return {
        title:
          "Hard but repeatable",

        detail:
          "The effort should be demanding while still allowing the full set to be completed well.",
      };
    }


    return {
      title:
        "Controlled",

      detail:
        "Follow the prescribed effort and prioritize smooth execution.",
    };
  }


  function getHeartRateGuidance(
    item: TrainingPlanDay
  ) {

    /*
      Structured workouts:

      Heart-rate guidance should reflect the MAIN
      training stimulus.

      Warm-up, recoveries and cool-down must not make
      an interval session appear like a recovery ride.
    */
    const mainStructure =
      item.workoutStructure?.filter(
        (block) =>
          block.phase === "Main"
      ) ?? [];


    if (
      mainStructure.length > 0
    ) {
      const mainText =
        mainStructure
          .flatMap(
            (block) => [
              block.label,
              block.workIntensity,
              block.workInstruction,
            ]
          )
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


      const rpeValues =
        Array.from(
          mainText.matchAll(
            /\brpe\s*([1-9]|10)(?:\s*[–-]\s*([1-9]|10))?/gi
          )
        )
          .flatMap(
            (match) => [
              Number(match[1]),
              match[2]
                ? Number(match[2])
                : Number(match[1]),
            ]
          )
          .filter(
            (value) =>
              Number.isFinite(value)
          );


      const highestRpe =
        rpeValues.length > 0
          ? Math.max(
              ...rpeValues
            )
          : null;


      if (
        (
          highestRpe !== null &&
          highestRpe >= 9
        ) ||
        /vo2|maximal|very hard|high intensity/.test(
          mainText
        )
      ) {
        return {
          title:
            "High aerobic / VO₂",

          detail:
            "Heart rate should rise high during the work intervals. Use effort and repeatability more than chasing an exact number.",
        };
      }


      if (
        (
          highestRpe !== null &&
          highestRpe >= 7
        ) ||
        /threshold|zone 4|z4|sweet spot|controlled hard/.test(
          mainText
        )
      ) {
        return {
          title:
            "Threshold range",

          detail:
            "Expect heart rate to build through the intervals toward upper aerobic / threshold intensity. Do not force the heart rate early.",
        };
      }


      if (
        (
          highestRpe !== null &&
          highestRpe >= 6
        ) ||
        /tempo|zone 3|z3|steady/.test(
          mainText
        )
      ) {
        return {
          title:
            "Moderate aerobic",

          detail:
            "Heart rate should sit above easy endurance but remain controlled and sustainable.",
        };
      }


      if (
        /zone 2|z2|endurance|aerobic|conversational/.test(
          mainText
        )
      ) {
        return {
          title:
            "Easy aerobic",

          detail:
            "Keep heart rate comfortably aerobic and avoid drifting into moderate intensity.",
        };
      }


      if (
        (
          highestRpe !== null &&
          highestRpe <= 3
        ) ||
        /recovery|very easy|zone 1|z1/.test(
          mainText
        )
      ) {
        return {
          title:
            "Very low aerobic",

          detail:
            "Keep heart rate low and let recovery, not pace or power, drive the session.",
        };
      }


      return {
        title:
          "Use effort first",

        detail:
          "Let heart rate support the prescribed effort rather than forcing a specific number.",
      };
    }


    /*
      Legacy fallback for workouts without
      workoutStructure.
    */
    const text = [
      item.title,
      item.intensity,
      item.purpose,
      ...(item.details ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


    if (
      /recovery|very easy/.test(
        text
      )
    ) {
      return {
        title:
          "Very low aerobic",

        detail:
          "Keep heart rate low and let recovery, not pace or power, drive the session.",
      };
    }


    if (
      /threshold|zone 4|z4|sweet spot/.test(
        text
      )
    ) {
      return {
        title:
          "Threshold range",

        detail:
          "Expect heart rate to build toward upper aerobic / threshold intensity during the work.",
      };
    }


    if (
      /vo2|maximal|high intensity/.test(
        text
      )
    ) {
      return {
        title:
          "High aerobic / VO₂",

        detail:
          "Heart rate should rise high during the work intervals. Prioritize effort and repeatability.",
      };
    }


    if (
      /tempo|zone 3|z3|steady/.test(
        text
      )
    ) {
      return {
        title:
          "Moderate aerobic",

        detail:
          "Heart rate should remain controlled and sustainable above easy endurance.",
      };
    }


    if (
      /easy|aerobic|endurance|zone 2|z2|conversational/.test(
        text
      )
    ) {
      return {
        title:
          "Easy aerobic",

        detail:
          "Keep heart rate comfortably aerobic and avoid unnecessary intensity.",
      };
    }


    return {
      title:
        "Use effort first",

      detail:
        "Let heart rate support the prescribed effort rather than forcing a specific number.",
    };
  }

  function getWorkoutEstimate(
    item: TrainingPlanDay
  ) {

    /*
      Structured workouts may have different performance
      targets in different blocks.

      In that case there is deliberately NO single generic
      target under More guidance. The correct targets are
      already shown beside their respective blocks.
    */
    if (
      item.workoutStructure?.length
    ) {
      const blockTargets =
        Array.from(
          new Set(
            item.workoutStructure
              .map(
                (block) =>
                  block.performanceTarget
                    ?.trim()
              )
              .filter(
                (
                  value
                ): value is string =>
                  Boolean(value)
              )
          )
        );


      if (
        blockTargets.length > 1
      ) {
        return null;
      }


      if (
        blockTargets.length === 1
      ) {
        const target =
          blockTargets[0];


        const watts =
          target.match(
            /(\d+\s*[–-]\s*\d+\s*W)/i
          );

        if (watts) {
          return {
            label:
              "POWER",

            value:
              watts[1],

            detail:
              "This target is consistent across the relevant work blocks.",
          };
        }


        const runPace =
          target.match(
            /(\d+:\d{2}\s*[–-]\s*\d+:\d{2}\/km)/i
          );

        if (runPace) {
          return {
            label:
              "PACE",

            value:
              runPace[1],

            detail:
              "This target is consistent across the relevant work blocks.",
          };
        }


        const swimPace =
          target.match(
            /(\d+:\d{2}\s*[–-]\s*\d+:\d{2}\/100\s*m)/i
          );

        if (swimPace) {
          return {
            label:
              "PACE",

            value:
              swimPace[1],

            detail:
              "This target is consistent across the relevant work blocks.",
          };
        }


        return null;
      }
    }


    /*
      Prefer the dedicated benchmark field.

      Legacy plans may still contain their reference in
      intensity or Benchmark target details, so those remain
      supported as fallback.
    */
    const sourceText =
      [
        item.performanceTarget,
        item.intensity,
        ...(item.details ?? []).filter(
          (detail) =>
            detail.startsWith(
              "Benchmark target:"
            ) ||
            detail.startsWith(
              "Main work target:"
            ) ||
            detail.startsWith(
              "Main-set target:"
            )
        ),
      ]
        .filter(Boolean)
        .join(" ");


    const watts =
      sourceText.match(
        /(\d+\s*[–-]\s*\d+\s*W(?:\s*\(\d+\s*[–-]\s*\d+%\s*FTP\))?)/i
      );


    if (watts) {
      return {
        label:
          "POWER",

        value:
          watts[1],

        detail:
          "Benchmark-based reference for the relevant work. Use the prescribed effort and session quality first rather than forcing the upper end.",
      };
    }


    const runPace =
      sourceText.match(
        /(\d+:\d{2}\s*[–-]\s*\d+:\d{2}\/km)/i
      );


    if (runPace) {
      return {
        label:
          "PACE",

        value:
          runPace[1],

        detail:
          "Benchmark-based flat-ground reference. Terrain, wind, heat and fatigue can make the appropriate pace slower.",
      };
    }


    const swimPace =
      sourceText.match(
        /(\d+:\d{2}\s*[–-]\s*\d+:\d{2}\/100\s*m)/i
      );


    if (swimPace) {
      return {
        label:
          "PACE",

        value:
          swimPace[1],

        detail:
          "Benchmark-based reference for the relevant swim work. Technique and repeat quality remain more important than forcing the pace.",
      };
    }


    /*
      If a valid target exists but uses wording we do not yet
      have a specialised compact formatter for, still show it.
    */
    if (
      item.performanceTarget
    ) {
      const cleaned =
        item.performanceTarget
          .replace(
            /^Benchmark target:\s*/i,
            ""
          )
          .trim();

      return {
        label:
          "TARGET",

        value:
          cleaned,

        detail:
          "Benchmark-derived reference for this session. Execution quality and the prescribed effort remain the priority.",
      };
    }


    return null;
  }

  function cleanExecutionDetail(
    detail: string
  ) {

    let cleaned =
      detail
        .replace(
          /^Main work target:\s*/i,
          ""
        )
        .replace(
          /^Main-set target:\s*/i,
          ""
        )
        .replace(
          /^Benchmark target:\s*/i,
          ""
        )
        .trim();


    /*
      YOUR WORKOUT should be instantly scannable.

      Long explanations belong in the supporting
      guidance / coaching sections, not here.
    */
    if (
      cleaned.length > 90
    ) {
      cleaned =
        `${cleaned
          .slice(0, 87)
          .trim()}…`;
    }


    return cleaned;
  }


  const workoutRpe =
    getIntensityRpe(
      workout
    );


  const workoutFeel =
    getWorkoutFeel(
      workout
    );


  const heartRateGuidance =
    getHeartRateGuidance(
      workout
    );


  const workoutEstimate =
    getWorkoutEstimate(
      workout
    );


  const hasStrengthStructure =
    workout.sport === "Strength" &&
    Boolean(
      workout
        .strengthStructure
        ?.exercises
        ?.length
    );


  return (
    <div
      className="alpineWorkoutDetailsOverlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(20, 22, 18, .52)",
        zIndex: 90,
        display: "grid",
        placeItems: "center",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <section
        className={[
          "alpineWorkoutDetailsModal",
          completedFeedback
            ? "completedWorkoutDetailsModal"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          width: "100%",
          maxWidth: "720px",
          background:
            "rgba(24,38,31,.97)",
          borderRadius: "24px",
          padding: "28px",
          boxShadow:
            "0 30px 90px rgba(0,0,0,.25)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: "20px",
            alignItems:
              "flex-start",
          }}
        >
          <div>
            <div className="eyebrow">
              {workout.day.toUpperCase()} ·{" "}
              {workout.sport.toUpperCase()}
            </div>

            <h2
              style={{
                fontSize: "2.6rem",
                lineHeight: .95,
                letterSpacing:
                  "-.05em",
                margin:
                  ".6rem 0 .8rem",
              }}
            >
              {workout.title}
            </h2>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom:
                  "1.5rem",
              }}
            >
              {!completedFeedback && (
                <>
                  <span className="sportBadge">
                    {workout.durationMinutes ===
                    0
                      ? "REST"
                      : `${workout.durationMinutes} MIN`}
                  </span>

                  <span
                    style={{
                      border:
                        "1px solid rgba(255,255,255,.08)",
                      borderRadius: "8px",
                      padding:
                        ".4rem .6rem",
                      fontSize: ".72rem",
                      fontWeight: 900,
                    }}
                  >
                    {workout.intensity}
                  </span>
                </>
              )}

              {completedFeedback && (
                <span className="completedWorkoutHeaderBadge">
                  {completedFeedback.status ===
                    "Modified"
                    ? "COMPLETED · MODIFIED"
                    : completedFeedback.status.toUpperCase()}
                </span>
              )}

              {isManualSession && (
                <span className="manualSessionBadge">
                  ADDED BY YOU
                </span>
              )}

              {isLogged &&
                !completedFeedback && (
                <span className="loggedBadge">
                  LOGGED
                </span>
              )}
            </div>
          </div>

          <button
            className="alpineWorkoutDetailsClose"
            onClick={onClose}
            aria-label="Close workout details"
            style={{
              border: 0,
              background:
                "transparent",
              fontSize: "28px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {completedFeedback && (
          <section className="completedWorkoutRecord">

            <div className="completedWorkoutRecordHead">

              <div>
                <span className="eyebrow">
                  {completedFeedback.status ===
                  "Skipped"
                    ? "SKIPPED SESSION"
                    : completedFeedback.status ===
                        "Modified"
                      ? "COMPLETED · MODIFIED"
                      : "COMPLETED SESSION"}
                </span>

                <h3>
                  {completedFeedback.status ===
                  "Skipped"
                    ? "Session record"
                    : "What you actually did"}
                </h3>
              </div>

              <span className={[
                "completedWorkoutStatus",
                completedFeedback.status.toLowerCase(),
              ].join(" ")}>
                {completedFeedback.status ===
                  "Modified"
                  ? "Modified"
                  : completedFeedback.status}
              </span>

            </div>


            {completedFeedback.status !==
              "Skipped" &&
              !hasStrengthStructure &&
              !isRecoveryDay &&
              !isManualSession && (
                <div className="completedWorkoutSessionMap">
                  <WorkoutStructureVisual
                    workout={workout}
                  />
                </div>
              )}


            <div className="completedWorkoutMetrics">

              <div>
                <span>
                  TIME
                </span>

                <strong>
                  {completedFeedback.status ===
                    "Skipped"
                    ? "—"
                    : formatCompletedDuration(
                        completedFeedback
                          .actualDurationMinutes
                      )}
                </strong>
              </div>


              {formatCompletedDistance(
                completedFeedback
              ) && (
                <div>
                  <span>
                    DISTANCE
                  </span>

                  <strong>
                    {formatCompletedDistance(
                      completedFeedback
                    )}
                  </strong>
                </div>
              )}


              {completedFeedback.rpe !==
                null && (
                <div>
                  <span>
                    RPE
                  </span>

                  <strong>
                    {completedFeedback.rpe}
                    /10
                  </strong>
                </div>
              )}


              {completedFeedback.feeling && (
                <div>
                  <span>
                    FEELING
                  </span>

                  <strong>
                    {completedFeedback.feeling}
                  </strong>
                </div>
              )}

            </div>


            {completedFeedback.comment && (
              <div className="completedWorkoutNote">

                <span>
                  YOUR NOTE
                </span>

                <p>
                  {completedFeedback.comment}
                </p>

              </div>
            )}


            <details className="completedWorkoutPlanned">

              <summary>

                <div>
                  <span className="eyebrow">
                    PLANNED SESSION
                  </span>

                  <strong>
                    What this workout was meant to be
                  </strong>
                </div>

                <span
                  aria-hidden="true"
                  className="completedWorkoutPlannedChevron"
                >
                  +
                </span>

              </summary>


              <div className="completedWorkoutPlannedBody">

                <div className="completedWorkoutPlannedMetrics">

                  <span>
                    {
                      completedFeedback
                        .plannedDurationMinutes ??
                      workout.durationMinutes
                    } min
                  </span>

                  <span>
                    {workout.intensity}
                  </span>

                </div>


                {workout.details &&
                  workout.details.length > 0 && (
                    <div className="completedWorkoutPlanSteps">

                      {workout.details
                        .filter(
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
                        )
                        .slice(0, 4)
                        .map(
                          (
                            detail,
                            index
                          ) => (
                            <div
                              key={`${detail}-${index}`}
                            >
                              <i />

                              <span>
                                {detail}
                              </span>
                            </div>
                          )
                        )}

                    </div>
                  )}


                {workout.purpose && (
                  <p className="completedWorkoutPlanPurpose">
                    {workout.purpose}
                  </p>
                )}

              </div>

            </details>

          </section>
        )}


        {activeWorkout.coachAdjustment &&
          (() => {
            const original =
              activeWorkout.coachAdjustment
                ?.originalWorkout;

            if (original) {
              return (
                original.sport !== activeWorkout.sport ||
                original.title !== activeWorkout.title ||
                original.durationMinutes !==
                  activeWorkout.durationMinutes ||
                original.intensity !==
                  activeWorkout.intensity ||
                original.purpose !==
                  activeWorkout.purpose ||
                JSON.stringify(
                  original.details ?? []
                ) !==
                  JSON.stringify(
                    activeWorkout.details ?? []
                  )
              );
            }

            return (
              typeof activeWorkout.coachAdjustment
                ?.previousDurationMinutes ===
                "number" &&
              activeWorkout.coachAdjustment
                .previousDurationMinutes !==
                activeWorkout.durationMinutes
            );
          })() && (
          <div className="coachAdjustmentNotice">
            <div className="coachAdjustmentNoticeTop">
              <span className="eyebrow">
                COACH ADJUSTED
              </span>

              <span>
                {new Date(
                  activeWorkout.coachAdjustment.adjustedAt
                ).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                  }
                )}
              </span>
            </div>

            <strong>
              {activeWorkout.durationMinutes === 0
                ? "Session adjusted by Basse"
                : activeWorkout.coachAdjustment
                    .originalWorkout
                ? `Original: ${
                    activeWorkout.coachAdjustment
                      .originalWorkout.durationMinutes
                  } min · Current: ${
                    activeWorkout.durationMinutes
                  } min`
                : typeof activeWorkout.coachAdjustment
                    .previousDurationMinutes === "number"
                ? `Adjusted from ${
                    activeWorkout.coachAdjustment
                      .previousDurationMinutes
                  } min to ${
                    activeWorkout.durationMinutes
                  } min`
                : "Session adjusted by Basse"}
            </strong>

            <p>
              {activeWorkout.coachAdjustment.reason}
            </p>



            {originalOpen &&
              activeWorkout.coachAdjustment
                .originalWorkout && (
                <div className="originalWorkoutPreview">
                  <div className="originalWorkoutPreviewHead">
                    <span className="eyebrow">
                      ORIGINAL SESSION
                    </span>

                    <span>
                      {
                        activeWorkout.coachAdjustment
                          .originalWorkout.sport
                      }
                    </span>
                  </div>

                  <h3>
                    {
                      activeWorkout.coachAdjustment
                        .originalWorkout.title
                    }
                  </h3>

                  <div className="originalWorkoutMeta">
                    <span>
                      {
                        activeWorkout.coachAdjustment
                          .originalWorkout
                          .durationMinutes
                      }{" "}
                      min
                    </span>

                    <span>
                      {
                        activeWorkout.coachAdjustment
                          .originalWorkout.intensity
                      }
                    </span>
                  </div>

                  <p>
                    {
                      activeWorkout.coachAdjustment
                        .originalWorkout.purpose
                    }
                  </p>

                  {activeWorkout.coachAdjustment
                    .originalWorkout.details
                    ?.length > 0 && (
                    <div className="originalWorkoutSteps">
                      {activeWorkout.coachAdjustment
                        .originalWorkout.details.map(
                          (detail, index) => (
                            <div
                              key={`${detail}-${index}`}
                            >
                              <span>
                                {String(
                                  index + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <strong>
                                {detail}
                              </strong>
                            </div>
                          )
                        )}
                    </div>
                  )}
                </div>
              )}
          </div>
        )}

        {restoreOpen &&
          activeWorkout.coachAdjustment
            ?.originalWorkout && (
            <div
              className="restoreWorkoutOverlay"
              onClick={() =>
                setRestoreOpen(false)
              }
            >
              <section
                className="restoreWorkoutModal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <span className="eyebrow">
                  RESTORE ORIGINAL
                </span>

                <h2>
                  Go back to the original session?
                </h2>

                <p>
                  This will replace the current
                  coach-adjusted version with the
                  original{" "}
                  <strong>
                    {
                      activeWorkout
                        .coachAdjustment
                        .originalWorkout
                        .durationMinutes
                    }
                    -minute session
                  </strong>
                  .
                </p>

                <div className="restoreWorkoutCompare">
                  <div>
                    <span>CURRENT</span>
                    <strong>
                      {formatDuration(
                        activeWorkout.durationMinutes
                      )}
                    </strong>
                  </div>

                  <div>→</div>

                  <div>
                    <span>ORIGINAL</span>
                    <strong>
                      {
                        activeWorkout
                          .coachAdjustment
                          .originalWorkout
                          .durationMinutes
                      }{" "}
                      min
                    </strong>
                  </div>
                </div>

                <div className="restoreWorkoutActions">
                  <button
                    className="secondary"
                    onClick={() =>
                      setRestoreOpen(false)
                    }
                  >
                    Keep adjusted
                  </button>

                  <button
                    className="primary"
                    onClick={() => {
                      setRestoreOpen(false);

                      onRestoreOriginal(
                        activeWorkout
                      );
                    }}
                  >
                    Restore original
                  </button>
                </div>
              </section>
            </div>
          )}

                {/*
          ==================================================
          THE ACTUAL SESSION
          ==================================================

          This is the primary content.
          Only information needed to execute the workout
          belongs here.
        */}

        <section className="sessionExecutionBlock">

          <div className="sessionExecutionHeader">

            <div>
              <span className="eyebrow">
                YOUR WORKOUT
              </span>

              <strong className="sessionExecutionTitle">
                What to do
              </strong>
            </div>

            <span className="sessionDurationPill">
              {workout.durationMinutes === 0
                ? "Recovery"
                : formatDuration(
                    workout.durationMinutes
                  )}
            </span>

          </div>


          {hasStrengthStructure && (
            <StrengthWorkoutView
              workout={workout}
              variant="details"
            />
          )}


          {!completedFeedback &&
            !hasStrengthStructure &&
            !isRecoveryDay &&
            !isManualSession && (
            <WorkoutStructureVisual
              workout={workout}
            />
          )}


          {!hasStrengthStructure && (
            <>
          {getWorkoutExecutionRows(
            workout
          ).length > 0 ? (

            <div className="sessionStructureTable">

              <div className="sessionStructureTableHeader">

                <span>
                  EXECUTION
                </span>

                <span>
                  GUIDANCE
                </span>

              </div>


              {getWorkoutExecutionRows(
                workout
              ).map(
                (
                  row,
                  index
                ) => (

                  <div
                    className={`sessionStructureRow sessionStructureRow-${row.phase
                      .toLowerCase()
                      .replace("-", "")}`}
                    key={`${row.execution}-${index}`}
                  >

                    <div className="sessionStructureExecution">

                      <span className="sessionStructureStepNumber">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <div>

                        <strong>
                          {row.execution}
                        </strong>

                        {row.subExecution && (
                          <span>
                            {row.subExecution}
                          </span>
                        )}

                      </div>

                    </div>


                    <div className="sessionStructureGuidance">

                      <span className="sessionStructureGuidanceLabel">
                        {row.phase === "Main"
                          ? "EFFORT / CUES"
                          : row.phase.toUpperCase()}
                      </span>

                      <p>
                        {row.guidance}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : workout.details?.length > 0 ? (

            <div className="sessionExecutionContent">

              {workout.details
                .filter(
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
                )
                .map(
                  (
                    detail,
                    index
                  ) => (

                    <div
                      className="sessionExecutionStep"
                      key={`${detail}-${index}`}
                    >

                      <span className="sessionExecutionStepMarker" />

                      <p>
                        {
                          cleanExecutionDetail(
                            detail
                          )
                        }
                      </p>

                    </div>

                  )
                )}

            </div>

          ) : (

            <p className="sessionExecutionEmpty">
              Follow the planned duration and keep the
              effort appropriate for the session.
            </p>

          )}
            </>
          )}

        </section>


        {!isRecoveryDay && (

          <section className="sessionPrimaryGuidance">

            <div className="sessionPrimaryGuidanceItem">

              <span className="sessionGuidanceLabel">
                EFFORT
              </span>

              <strong>
                {workoutRpe ? (
                  <TrainingTerm term="RPE">
                    {workoutRpe}
                  </TrainingTerm>
                ) : (
                  "Controlled"
                )}
              </strong>

            </div>


            <div className="sessionPrimaryGuidanceItem">

              <span className="sessionGuidanceLabel">
                FEEL
              </span>

              <strong>
                {workoutFeel.title}
              </strong>

              <span className="sessionPrimaryGuidanceHint">
                {workoutFeel.detail}
              </span>

            </div>


            {(heartRateGuidance || workoutEstimate) && (

              <details className="sessionMoreGuidance" open>

                <summary>
                  More guidance
                </summary>

                <div className="sessionMoreGuidanceBody">

                  {heartRateGuidance && (

                    <div>

                      <span className="sessionGuidanceLabel">
                        HEART RATE
                      </span>

                      <strong>
                        {heartRateGuidance.title}
                      </strong>

                      <p>
                        {heartRateGuidance.detail}
                      </p>

                    </div>

                  )}


                  {workoutEstimate && (

                    <div>

                      <span className="sessionGuidanceLabel">
                        PERFORMANCE TARGET
                      </span>

                      <strong>
                        {workoutEstimate.label} ·{" "}
                        {workoutEstimate.value}
                      </strong>

                      <p>
                        {workoutEstimate.detail}
                      </p>

                    </div>

                  )}

                </div>

              </details>

            )}

          </section>

        )}


        {/*
          ==================================================
          OPTIONAL CONTEXT
          ==================================================

          Purpose, benchmark explanation and coaching notes
          are useful, but they should never compete visually
          with the actual workout.
        */}

        {(
          workout.purpose ||
          workout.details?.some(
            (detail) =>
              detail.startsWith(
                "Benchmark target:"
              )
          )
        ) && (

          <details className="sessionExtraNotes" open>

            <summary>

              <div>
                <strong>
                  Notes & coaching
                </strong>

                <span>
                  Why this session and extra context
                </span>
              </div>

              <span className="sessionExtraNotesIcon">
                +
              </span>

            </summary>


            <div className="sessionExtraNotesBody">

              {workout.purpose && (

                <section>

                  <span className="sessionExtraLabel">
                    WHY THIS SESSION
                  </span>

                  <p>
                    {workout.purpose}
                  </p>

                </section>

              )}


              {workout.details
                ?.filter(
                  (detail) =>
                    detail.startsWith(
                      "Benchmark target:"
                    )
                )
                .map(
                  (
                    detail,
                    index
                  ) => (

                    <section
                      key={`benchmark-context-${index}`}
                    >

                      <span className="sessionExtraLabel">
                        TRAINING TARGET
                      </span>

                      <p>
                        {detail
                          .replace(
                            "Benchmark target:",
                            ""
                          )
                          .trim()}
                      </p>

                    </section>

                  )
                )}

            </div>

          </details>

        )}


<div className="sessionPrimaryActions">
          {!previewOnly &&
            !isRecoveryDay &&
            !isLogged && (
            <button
              className="primary sessionLogAction"
              onClick={() =>
                onLogWorkout(
                  activeWorkout
                )
              }
            >
              Log session
            </button>
          )}

          {!previewOnly &&
            isLogged &&
            !isRecoveryDay && (
            <div className="sessionLoggedState">

              <strong className="sessionCompletedLabel">
                <span aria-hidden="true">
                  {completedFeedback?.status ===
                  "Skipped"
                    ? "—"
                    : "✓"}
                </span>

                {completedFeedback?.status ===
                "Skipped"
                  ? "Skipped"
                  : completedFeedback?.status ===
                      "Modified"
                    ? "Completed · modified"
                    : "Completed"}
              </strong>

              <span>
                {completedFeedback?.status ===
                "Skipped"
                  ? "Saved as skipped in your training history"
                  : "Saved to your training history"}
              </span>

              {canEditLog &&
                completedFeedback &&
                onEditLog && (
                  <button
                    type="button"
                    className="secondary sessionEditLogAction"
                    onClick={() =>
                      onEditLog(
                        activeWorkout,
                        completedFeedback
                      )
                    }
                  >
                    Edit log
                  </button>
                )}

            </div>
          )}

          {!previewOnly && (
            <div className="sessionMoreWrap">
              <button
                className="secondary sessionMoreButton"
                aria-expanded={moreOpen}
                onClick={() =>
                  setMoreOpen(!moreOpen)
                }
              >
                More
                <span
                  className={`sessionMoreChevron ${
                    moreOpen ? "open" : ""
                  }`}
                  aria-hidden="true"
                >
                  ↓
                </span>
              </button>
            </div>
          )}
        </div>

        {!previewOnly &&
          moreOpen && (
          <div
            className="sessionOptionsOverlay"
            onClick={(event) => {
              event.stopPropagation();
              setMoreOpen(false);
            }}
          >
            <section
              className="sessionOptionsModal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="sessionOptionsHeader">
                <div>
                  <span className="eyebrow">
                    SESSION OPTIONS
                  </span>

                  <h2>
                    Change this session
                  </h2>

                  <p>
                    {activeWorkout.title}
                  </p>
                </div>

                <button
                  className="sessionOptionsClose"
                  aria-label="Close session options"
                  onClick={() =>
                    setMoreOpen(false)
                  }
                >
                  ×
                </button>
              </div>

              <div className="sessionOptionsList">
                {!isLogged && (
                  <button
                    onClick={() => {
                      setMoreOpen(false);

                      onAdaptWorkout(
                        activeWorkout
                      );
                    }}
                  >
                    <strong>
                      Adapt with coach
                    </strong>

                    <span>
                      Change duration, intensity or structure.
                    </span>
                  </button>
                )}

                {!isLogged &&
                isManualSession &&
                onEditManualWorkout && (
                  <button
                    onClick={() => {
                      setMoreOpen(false);

                      onEditManualWorkout(
                        activeWorkout
                      );
                    }}
                  >
                    <strong>
                      Edit session
                    </strong>

                    <span>
                      Change day, title, duration, intensity or note.
                    </span>
                  </button>
                )}

                {!isLogged &&
                !isManualSession &&
                !isRecoveryDay && (
                  <button
                    onClick={() => {
                      setMoreOpen(false);
                      setMoveOpen(true);
                      setMoveMessage("");
                    }}
                  >
                    <strong>
                      Move session
                    </strong>

                    <span>
                      Move this workout to another day.
                    </span>
                  </button>
                )}

                {activeWorkout.coachAdjustment
                  ?.originalWorkout && (
                  <>
                    <div className="sessionOptionsDivider" />

                    <button
                      onClick={() => {
                        setMoreOpen(false);

                        setOriginalOpen(
                          !originalOpen
                        );
                      }}
                    >
                      <strong>
                        {originalOpen
                          ? "Hide original"
                          : "View original"}
                      </strong>

                      <span>
                        Compare this version with the original plan.
                      </span>
                    </button>

                    {!isLogged && (
                      <button
                        onClick={() => {
                          setMoreOpen(false);
                          setRestoreOpen(true);
                        }}
                      >
                        <strong>
                          Restore original
                        </strong>

                        <span>
                          Replace this adjustment with the original session.
                        </span>
                      </button>
                    )}
                  </>
                )}

                {!isLogged && (
                  <>
                    <div className="sessionOptionsDivider" />

                    <button
                      className="danger"
                      onClick={() => {
                        setMoreOpen(false);

                        if (
                          isManualSession &&
                          onRemoveManualWorkout
                        ) {
                          setManualRemoveOpen(
                            true
                          );

                          return;
                        }

                        onRemoveWorkout(
                          activeWorkout
                        );
                      }}
                    >
                      <strong>
                        Remove session
                      </strong>

                      <span>
                        {isManualSession
                          ? "Remove this athlete-added session from the week."
                          : "Ask Basse how to remove it safely."}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        )}

        {!previewOnly &&
          manualRemoveOpen &&
          isManualSession && (
          <div
            className="manualSessionRemoveOverlay"
            onClick={(event) => {
              event.stopPropagation();

              setManualRemoveOpen(
                false
              );
            }}
          >
            <section
              className="manualSessionRemoveModal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <span className="eyebrow">
                REMOVE SESSION
              </span>

              <h2>
                Remove this session?
              </h2>

              <p>
                <strong>
                  {activeWorkout.title}
                </strong>{" "}
                was added by you and will be
                removed from{" "}
                {activeWorkout.day}.
              </p>

              <div className="manualSessionRemoveSummary">
                <span>
                  {activeWorkout.sport}
                </span>

                <strong>
                  {formatDuration(
                    activeWorkout.durationMinutes
                  )}
                </strong>

                <span>
                  {activeWorkout.intensity}
                </span>
              </div>

              <div className="manualSessionRemoveActions">
                <button
                  className="secondary"
                  onClick={() =>
                    setManualRemoveOpen(
                      false
                    )
                  }
                >
                  Keep session
                </button>

                <button
                  className="removeDangerButton"
                  onClick={() => {
                    setManualRemoveOpen(
                      false
                    );

                    onRemoveManualWorkout?.(
                      activeWorkout
                    );

                    onClose();
                  }}
                >
                  Remove session
                </button>
              </div>
            </section>
          </div>
        )}

        {!previewOnly &&
          moveOpen && (
          <div
            className="moveWorkoutOverlay"
            onClick={(e) => {
              e.stopPropagation();
              setMoveOpen(false);
              setTargetDay("");
              setMoveMessage("");
            }}
          >
            <section
              className="moveWorkoutModal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="moveWorkoutHeader">
                <div>
                  <span className="eyebrow">
                    MOVE WORKOUT
                  </span>

                  <h2>
                    Choose another day
                  </h2>

                  <p>
                    Move{" "}
                    <strong>
                      {workout.title}
                    </strong>{" "}
                    without disrupting the rest of
                    your training week.
                  </p>
                </div>

                <button
                  className="moveWorkoutClose"
                  aria-label="Close move workout"
                  onClick={() => {
                    setMoveOpen(false);
                    setTargetDay("");
                    setMoveMessage("");
                  }}
                >
                  ×
                </button>
              </div>

              <div className="moveWorkoutCurrent">
                <div>
                  <span>CURRENT</span>
                  <strong>
                    {workout.day}
                  </strong>
                </div>

                <div className="moveArrow">
                  →
                </div>

                <div>
                  <span>MOVE TO</span>
                  <strong>
                    {targetDay || "Choose day"}
                  </strong>
                </div>
              </div>

              <div className="moveDayGrid">
                {WEEK_DAYS.map(
                  (day) => {
                    const existing =
                      week.find(
                        (item) =>
                          item.day === day
                      );

                    const daySecondSessions =
                      additionalSessions.filter(
                        (session) =>
                          session.day === day
                      );

                    const hasSecondSession =
                      daySecondSessions.length > 0;

                    const busy =
                      existing &&
                      existing.day !==
                        workout.day &&
                      (
                        existing.sport !==
                          "Rest" ||
                        hasSecondSession
                      );

                    const current =
                      day === workout.day;

                    const todayIso =
                      new Date()
                        .toLocaleDateString("en-CA");

                    const past =
                      Boolean(
                        existing?.date &&
                        existing.date < todayIso
                      );

                    return (
                      <button
                        key={day}
                        disabled={past}
                        className={[
                          "moveDayButton",
                          targetDay === day
                            ? "selected"
                            : "",
                          busy
                            ? "busy"
                            : "",
                          current
                            ? "current"
                            : "",
                          past
                            ? "past"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => {
                          if (past) {
                            return;
                          }

                          setTargetDay(day);
                          setMoveMessage("");
                        }}
                      >
                        <strong>
                          {day.slice(0, 3)}
                        </strong>

                        <span>
                          {past
                            ? "Past"
                            : current
                            ? "Current"
                            : busy
                            ? (
                                existing?.sport === "Rest" &&
                                hasSecondSession
                                  ? daySecondSessions[0]?.sport ??
                                    "Training"
                                  : existing?.sport
                              )
                            : existing?.sport ===
                              "Rest"
                            ? "Rest day"
                            : "Open"}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {targetDay &&
                targetDay !== workout.day && (
                  <div className="moveAvailable">
                    <strong>
                      Ready to move
                    </strong>

                    <span>
                      Only this workout will move to {targetDay}.
                      Any workouts already on that day will stay there.
                    </span>
                  </div>
                )}

              {moveMessage && (
                <div className="moveMessage">
                  {moveMessage}
                </div>
              )}

              <div className="moveWorkoutActions">
                <button
                  className="secondary"
                  onClick={() => {
                    setMoveOpen(false);
                    setTargetDay("");
                    setMoveMessage("");
                  }}
                >
                  Cancel
                </button>

                <button
                  className="primary"
                  disabled={
                    !targetDay ||
                    targetDay === workout.day
                  }
                  onClick={confirmMove}
                >
                  {targetDay &&
                  targetDay !== workout.day
                    ? `Move to ${targetDay}`
                    : "Choose a day"}
                </button>
              </div>
            </section>
          </div>
        )}

        <p
          style={{
            marginTop: "18px",
            marginBottom: 0,
            color: "#85877f",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          Basse uses the purpose of the session,
          not just the duration, when adapting your week.
        </p>
      </section>
    </div>
  );
}
