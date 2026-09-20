"use client";

import SportIcon from "@/components/SportIcon";

import {
  formatDuration,
} from "@/lib/format-duration";

import WorkoutStructureVisual from "@/components/WorkoutStructureVisual";

import StrengthWorkoutView from "@/components/StrengthWorkoutView";

import {
  getWorkoutExecutionRows,
} from "@/lib/workout-structure-ui";

import {
  findWorkoutFeedback,
} from "@/lib/workout-feedback-match";

import type {
  Athlete,
  ReadinessEntry,
  TrainingPlan,
  TrainingPlanDay,
  WorkoutFeedback,
} from "@/types/training";

import type {
  ReadinessTrend,
} from "@/lib/adaptive-coaching";

import {
  getReadinessRecommendation,
  isRestWorkout,
} from "@/lib/training";


type TodayViewProps = {
  athlete: Athlete;
  today: string[];
  todayReadiness: ReadinessEntry | null;
  readinessTrend: ReadinessTrend;
  trainingPhase: string;
  trainingPlan: TrainingPlan | null;
  history: WorkoutFeedback[];

  onReadinessOpen: () => void;
  onAdaptToday: () => void;

  onViewWorkout: (
    workout: TrainingPlanDay
  ) => void;

  onLogWorkout: (
    workout: TrainingPlanDay | null
  ) => void;
};


function formatTodayDuration(
  minutes: number
) {
  const safeMinutes =
    Math.max(
      0,
      Math.round(minutes)
    );


  if (safeMinutes <= 60) {
    return `${safeMinutes} min`;
  }


  const hours =
    Math.floor(
      safeMinutes / 60
    );

  const remainingMinutes =
    safeMinutes % 60;


  return remainingMinutes > 0
    ? `${hours} h ${remainingMinutes} min`
    : `${hours} h`;
}


function getCleanSteps(
  workout: TrainingPlanDay
) {
  return (
    workout.details ??
    []
  )
    .filter(
      (step) =>
        !/^(Benchmark target:|Main work target:|Main-set target:)/i.test(
          step
        )
    )
    .map(
      (step) =>
        step.trim()
    )
    .filter(Boolean)
    .slice(0, 5);
}


function getSlotLabel(
  workout: TrainingPlanDay,
  index: number,
  total: number
) {
  if (
    workout.sessionSlot &&
    workout.sessionSlot !==
      "Flexible"
  ) {
    return workout.sessionSlot;
  }

  if (total > 1) {
    return `SESSION ${index + 1}`;
  }

  return "TODAY";
}


export default function TodayView({
  athlete,
  today,
  todayReadiness,
  readinessTrend,
  trainingPhase,
  trainingPlan,
  history,
  onReadinessOpen,
  onAdaptToday,
  onViewWorkout,
  onLogWorkout,
}: TodayViewProps) {

  const todayKey =
    today[0];


  function getFeedback(
    workout: TrainingPlanDay
  ) {
    return findWorkoutFeedback(
      workout,
      history
    );
  }


  const primaryWorkout =
    trainingPlan?.days?.find(
      (item) =>
        item.day.slice(
          0,
          3
        ) === todayKey
    ) ?? null;


  const secondaryWorkouts =
    (
      trainingPlan
        ?.additionalSessions ??
      []
    ).filter(
      (item) =>
        item.day.slice(
          0,
          3
        ) === todayKey
    );


  const activeSessions = [
    ...(
      primaryWorkout &&
      !isRestWorkout(
        primaryWorkout
      ) &&
      primaryWorkout.durationMinutes >
        0
        ? [primaryWorkout]
        : []
    ),

    ...secondaryWorkouts.filter(
      (item) =>
        !isRestWorkout(
          item
        ) &&
        item.durationMinutes >
          0
    ),
  ]
    .map(
      (session, originalIndex) => ({
        session,
        originalIndex,
      })
    )
    .sort((a, b) => {
      const slotOrder = {
        AM: 0,
        PM: 1,
        Flexible: 2,
      } as const;

      const aSlot =
        a.session.sessionSlot === "AM" ||
        a.session.sessionSlot === "PM"
          ? a.session.sessionSlot
          : "Flexible";

      const bSlot =
        b.session.sessionSlot === "AM" ||
        b.session.sessionSlot === "PM"
          ? b.session.sessionSlot
          : "Flexible";

      return (
        slotOrder[aSlot] -
          slotOrder[bSlot] ||
        a.originalIndex -
          b.originalIndex
      );
    })
    .map(
      ({ session }) =>
        session
    );


  /*
    On multi-session days, Today should coach the next
    session that still needs to be completed.

    A completed / modified / skipped session is already
    resolved and must not remain the readiness target
    while another workout is still outstanding.
  */
  const currentWorkout =
    activeSessions.find(
      (workout) =>
        !getFeedback(workout)
    ) ??
    activeSessions[0] ??
    primaryWorkout;


  const isRestDay =
    activeSessions.length ===
    0;


  const loggedActiveSessions =
    activeSessions.filter(
      (workout) =>
        Boolean(
          getFeedback(workout)
        )
    ).length;


  const allActiveSessionsLogged =
    activeSessions.length > 0 &&
    loggedActiveSessions ===
      activeSessions.length;


  const someActiveSessionsLogged =
    loggedActiveSessions > 0 &&
    !allActiveSessionsLogged;




  const currentIndex =
    trainingPlan?.days?.findIndex(
      (item) =>
        item.day.slice(
          0,
          3
        ) === todayKey
    ) ?? -1;


  const nextWorkout =
    currentIndex >= 0 &&
    trainingPlan?.days &&
    currentIndex <
      trainingPlan.days.length - 1
      ? trainingPlan.days[
          currentIndex + 1
        ]
      : null;


  const readinessTone =
    todayReadiness?.status ===
      "Recover"
      ? "recover"
      : todayReadiness?.status ===
        "Caution"
      ? "caution"
      : todayReadiness?.status ===
        "Ready"
      ? "ready"
      : "neutral";


  const readinessRecommendation =
    getReadinessRecommendation(
      currentWorkout,
      todayReadiness
    );


  const coachDecision =
    readinessTrend.level ===
      "Strained"
      ? "Protect recovery and avoid forcing extra load today."
      : todayReadiness?.status ===
        "Recover"
      ? activeSessions.length > 1
        ? "Recovery is poor. Review the double-session day before training."
        : "Recovery is poor. Do not force the planned intensity."
      : todayReadiness?.status ===
        "Caution"
      ? "Start controlled and adjust if the warm-up does not improve things."
      : todayReadiness?.status ===
        "Ready"
      ? activeSessions.length > 1
        ? "Recovery supports the plan. Execute both sessions without adding extra work."
        : "Recovery supports today's planned session."
      : "Follow the planned session and use the readiness check-in if you want more precise coaching.";


  const weekPlannedSessions = [
    ...(trainingPlan?.days ?? []).filter(
      (workout) =>
        !isRestWorkout(workout) &&
        workout.durationMinutes > 0
    ),

    ...(trainingPlan?.additionalSessions ?? []).filter(
      (workout) =>
        !isRestWorkout(workout) &&
        workout.durationMinutes > 0
    ),
  ];


  const weekCompletedSessions =
    weekPlannedSessions.filter(
      (workout) => {
        const feedback =
          getFeedback(workout);

        return Boolean(
          feedback &&
          feedback.status !== "Skipped"
        );
      }
    ).length;


  const weekProgressPercent =
    weekPlannedSessions.length > 0
      ? Math.min(
          100,
          Math.round(
            (
              weekCompletedSessions /
              weekPlannedSessions.length
            ) * 100
          )
        )
      : 0;


  const targetRaceDate =
    athlete.targetRace?.date;


  const targetRaceDays =
    targetRaceDate
      ? (() => {
          const now =
            new Date();

          const todayDate =
            new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );

          const raceDate =
            new Date(
              `${targetRaceDate}T12:00:00`
            );

          return Math.ceil(
            (
              raceDate.getTime() -
              todayDate.getTime()
            ) /
              86_400_000
          );
        })()
      : null;


  const targetRaceDateLabel =
    targetRaceDate
      ? new Intl.DateTimeFormat(
          "en-GB",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )
          .format(
            new Date(
              `${targetRaceDate}T12:00:00`
            )
          )
          .toUpperCase()
      : null;


  const targetRaceWeeksLabel =
    targetRaceDays == null ||
    targetRaceDays < 0
      ? null
      : targetRaceDays < 7
      ? "RACE WEEK"
      : `${Number(
          (
            targetRaceDays / 7
          ).toFixed(1)
        )} WEEKS`;


  const formatRaceDistance = (
    km?: number
  ) => {
    if (
      typeof km !==
      "number"
    ) {
      return null;
    }

    if (
      athlete.unitSystem ===
      "Imperial"
    ) {
      const miles =
        km * 0.621371;

      return `${Number(
        miles.toFixed(2)
      )} MI`;
    }

    return `${Number(
      km.toFixed(2)
    )} KM`;
  };


  return (
    <div className="todayAlpineView">

      <section
        className="todayMobileHorizon"
        aria-label="Today overview"
      >

        <div className="todayMobileHorizonTop">

          <div className="todayMobileRace todayMobileRaceBeacon">

            <span>
              TARGET RACE
            </span>

            <strong>
              {athlete.targetRace?.name ??
                "YOUR TRAINING"}
            </strong>

            {athlete.targetRace && (
              <small>

                {athlete.targetRace.location && (
                  <>
                    {athlete.targetRace.location}
                  </>
                )}

                {athlete.targetRace.location &&
                  targetRaceDateLabel && (
                    <>
                      {" · "}
                    </>
                  )}

                {targetRaceDateLabel}

              </small>
            )}

          </div>


          {targetRaceDays != null && (

            <div className="todayMobileRaceCountdown">

              <strong>
                {targetRaceDays < 0
                  ? "DONE"
                  : targetRaceDays === 0
                  ? "TODAY"
                  : targetRaceDays}
              </strong>

              <span>
                {targetRaceDays < 0
                  ? "RACE COMPLETE"
                  : targetRaceDays === 0
                  ? "RACE DAY"
                  : targetRaceDays === 1
                  ? "DAY TO RACE"
                  : "DAYS TO RACE"}
              </span>

              {targetRaceWeeksLabel && (
                <small>
                  {targetRaceWeeksLabel}
                </small>
              )}

            </div>

          )}

        </div>


        {athlete.targetRace &&
          (
            athlete.targetRace.swim
              ?.distanceKm != null ||
            athlete.targetRace.bike
              ?.distanceKm != null ||
            athlete.targetRace.run
              ?.distanceKm != null
          ) && (

          <div
            className="todayMobileCourseRail"
            aria-label="Target race distances"
          >

            <span className="todayMobileCourseLabel">
              COURSE
            </span>


            {athlete.targetRace.swim
              ?.distanceKm != null && (

              <div className="todayMobileCourseLeg">

                <span
                  className="todayMobileCourseMark todayMobileCourseMarkSwim"
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    SWIM
                  </strong>

                  <small>
                    {formatRaceDistance(
                      athlete.targetRace.swim
                        .distanceKm
                    )}
                  </small>
                </div>

              </div>

            )}


            {athlete.targetRace.bike
              ?.distanceKm != null && (

              <div className="todayMobileCourseLeg">

                <span
                  className="todayMobileCourseMark todayMobileCourseMarkBike"
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    BIKE
                  </strong>

                  <small>
                    {formatRaceDistance(
                      athlete.targetRace.bike
                        .distanceKm
                    )}
                  </small>
                </div>

              </div>

            )}


            {athlete.targetRace.run
              ?.distanceKm != null && (

              <div className="todayMobileCourseLeg">

                <span
                  className="todayMobileCourseMark todayMobileCourseMarkRun"
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    RUN
                  </strong>

                  <small>
                    {formatRaceDistance(
                      athlete.targetRace.run
                        .distanceKm
                    )}
                  </small>
                </div>

              </div>

            )}

          </div>

        )}


        <div className="todayMobileSignalRail">

          <button
            type="button"
            className={`todayMobileReadinessInstrument ${readinessTone}`}
            onClick={onReadinessOpen}
            aria-label="Open readiness check-in"
          >

            <span
              className="todayMobileReadinessOrb"
              style={{
                background:
                  todayReadiness
                    ? `conic-gradient(
                        from -90deg,
                        #73c9ff 0deg,
                        #72e6c2 ${
                          Math.max(
                            0,
                            Math.min(
                              100,
                              todayReadiness.score
                            )
                          ) * 2.15
                        }deg,
                        #d2ef70 ${
                          Math.max(
                            0,
                            Math.min(
                              100,
                              todayReadiness.score
                            )
                          ) * 3.6
                        }deg,
                        rgba(255,255,255,.10) ${
                          Math.max(
                            0,
                            Math.min(
                              100,
                              todayReadiness.score
                            )
                          ) * 3.6
                        }deg 360deg
                      )`
                    : `conic-gradient(
                        #73c9ff,
                        #72e6c2,
                        #d2ef70,
                        rgba(255,255,255,.10)
                      )`,
              }}
            >

              <span className="todayMobileReadinessOrbInner">
                <strong>
                  {todayReadiness
                    ? todayReadiness.score
                    : "—"}
                </strong>

                <small>
                  {todayReadiness
                    ? "/100"
                    : "CHECK"}
                </small>
              </span>

            </span>

            <span className="todayMobileInstrumentLabel">
              <small>
                READINESS
              </small>

              <strong>
                {todayReadiness?.status ??
                  "Check in"}
              </strong>
            </span>

          </button>


          <div className="todayMobileWeekInstrument">

            <small>
              WEEK
            </small>

            <strong>
              {weekCompletedSessions}
              <span>
                /{weekPlannedSessions.length}
              </span>
            </strong>

            <div className="todayMobileWeekTrack">
              <span
                style={{
                  width:
                    `${weekProgressPercent}%`,
                }}
              />
            </div>

          </div>

        </div>


        <div className="todayMobileHorizonFocus">

          <div className="todayMobileRouteHeader">

            <span>
              TODAY&apos;S ROUTE
            </span>

            <strong>
              {trainingPhase}
            </strong>

          </div>


          {isRestDay ? (

            <div className="todayMobileRoute todayMobileRouteSingle">

              <div className="todayMobileRouteRest">

                <span className="todayMobileRouteIcon">
                  <SportIcon
                    sport="Rest"
                    size={23}
                  />
                </span>

                <strong>
                  RECOVERY
                </strong>

                <small>
                  NO STRUCTURED TRAINING
                </small>

              </div>

            </div>

          ) : (

            <div
              className={[
                "todayMobileRoute",
                activeSessions.length === 1
                  ? "todayMobileRouteSingle"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >

              {activeSessions.map(
                (
                  workout,
                  index
                ) => (

                  <div
                    className={[
                      "todayMobileRouteStop",
                      `todayMobileRouteStop${workout.sport}`,
                    ].join(" ")}
                    key={
                      workout.sessionId ??
                      `${workout.day}-${workout.title}-mobile-route-${index}`
                    }
                  >

                    <span className="todayMobileRouteIcon">
                      <SportIcon
                        sport={workout.sport}
                        size={23}
                      />
                    </span>

                    <strong>
                      {workout.sport.toUpperCase()}
                    </strong>

                    <small>
                      {activeSessions.length > 1
                        ? `SESSION ${index + 1}`
                        : "TODAY"}
                      {" · "}
                      {
                        formatTodayDuration(
                          workout.durationMinutes
                        )
                      }
                    </small>

                  </div>

                )
              )}

            </div>

          )}


          <div className="todayMobileCoachDecision">

            <span
              className={`todayMobileCoachSignal ${readinessTone}`}
            />

            <p>
              {readinessRecommendation.headline}
            </p>

          </div>

        </div>


        <div className="todayMobileHorizonBottom">

          <button
            type="button"
            className={`todayMobileReadiness ${readinessTone}`}
            onClick={onReadinessOpen}
          >

            <span>
              {todayReadiness
                ? "READINESS"
                : "COACH CHECK-IN"}
            </span>

            <strong>
              {todayReadiness
                ? `${todayReadiness.score} · ${todayReadiness.status}`
                : "Check readiness"}
            </strong>

          </button>


          <div className="todayMobileSessionCue">

            <span>
              {activeSessions.length > 1
                ? `${activeSessions.length} SESSIONS`
                : isRestDay
                ? "RECOVERY DAY"
                : currentWorkout?.sport?.toUpperCase() ??
                  "TODAY"}
            </span>

            <strong>
              {activeSessions.length > 1
                ? "SWIPE BELOW →"
                : currentWorkout &&
                  currentWorkout.durationMinutes > 0
                ? formatTodayDuration(
                    currentWorkout.durationMinutes
                  )
                : "NO STRUCTURED TRAINING"}
            </strong>

          </div>

        </div>

      </section>


      <header className="dashHeader smartTodayHeader">
        <div>
          <span className="eyebrow">
            TODAY
          </span>

          <h1>
            Today&apos;s training.
          </h1>
        </div>
      </header>


      <div className="smartTodayGrid">

        <div className="todayMainStack">


          <section
            className={`todayCoachStrip ${readinessTone}`}
          >

            <div>

              <span className="todayCoachLabel">
                COACH RECOMMENDATION
              </span>

              <strong>
                {
                  readinessRecommendation.headline
                }
              </strong>

              <p>
                {coachDecision}
              </p>

            </div>


            {readinessRecommendation
              .actionLabel && (
              <button
                className="secondary"
                onClick={
                  onAdaptToday
                }
              >
                {
                  readinessRecommendation
                    .actionLabel
                }
              </button>
            )}

          </section>


          <section className="todayMultiHero">

            <div className="todayMultiHeroTop">

              <div>

                <span className="todayMultiKicker">
                  {isRestDay
                    ? "RECOVERY DAY"
                    : activeSessions.length > 1
                    ? `${activeSessions.length} SESSIONS`
                    : "TODAY'S SESSION"}
                </span>


                <h2>
                  {isRestDay
                    ? "Recover."
                    : activeSessions.length > 1
                    ? "Today's training."
                    : activeSessions[0]?.sport
                      ? `${activeSessions[0].sport} session`
                      : "Today's session"}
                </h2>

              </div>




            </div>


            {isRestDay ? (

              <div className="todayRestHero">

                <strong>
                  No structured training.
                </strong>

                <span>
                  Easy walking or mobility only if it feels restorative.
                </span>

              </div>

            ) : (

              <div
                className={
                  activeSessions.length > 1
                    ? "todayMultiSessionList todayMobileSwipeDeck"
                    : "todayMultiSessionList"
                }
              >

                {activeSessions.map(
                  (
                    workout,
                    index
                  ) => {


                    const feedback =
                      getFeedback(
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


                    const executionRows =
                      getWorkoutExecutionRows(
                        workout
                      );


                    /*
                      Legacy fallback for plans created before
                      canonical workoutStructure existed.
                    */
                    const steps =
                      !hasStrengthStructure &&
                      executionRows.length === 0
                        ? getCleanSteps(
                            workout
                          )
                        : [];

                    return (
                      <article
                        className={[
                          "todayMultiSessionCard",
                          `todayMultiSession${workout.sport}`,
                          feedback
                            ? `todaySessionStatus${feedback.status}`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={
                          workout.sessionId ??
                          `${workout.day}-${workout.title}-${index}`
                        }
                      >

                        <div className="todayMultiSessionTop">

                          <div className="todayMultiIdentity">

                            <span className="todayMultiSlot">

                              <span className="todayMultiSlotDesktop">
                                {
                                  getSlotLabel(
                                    workout,
                                    index,
                                    activeSessions.length
                                  )
                                }
                              </span>

                              <span className="todayMultiSlotMobile">
                                {activeSessions.length > 1
                                  ? `SESSION ${index + 1}`
                                  : "TODAY"}
                              </span>

                            </span>

                            <span className="todayMultiSport">
                              <SportIcon
                                sport={
                                  workout.sport
                                }
                                size={30}
                              />

                              <span>
                                {
                                  workout.sport.toUpperCase()
                                }
                              </span>
                            </span>

                          </div>


                          <div className="todayMultiTotal todaySessionDurationBox">

                            <strong>
                              {
                                formatTodayDuration(
                                  workout.durationMinutes
                                )
                              }
                            </strong>

                            <span>
                              DURATION
                            </span>

                          </div>

                        </div>


                        <h3>
                          {workout.title}
                        </h3>

                        {workout.purpose && (
                          <p className="todaySessionPurpose">
                            {workout.purpose}
                          </p>
                        )}


                        {hasStrengthStructure && (

                          <div className="todaySessionPreview todaySessionStrengthPreview">

                            <StrengthWorkoutView
                              workout={workout}
                              variant="today"
                            />

                          </div>

                        )}


                        {!hasStrengthStructure &&
                        workout.workoutStructure?.length ? (

                          <div className="todaySessionPreview">

                            <WorkoutStructureVisual
                              workout={
                                workout
                              }
                              variant="today"
                            />

                          </div>

                        ) : null}


                        {!hasStrengthStructure &&
                          executionRows.length > 0 && (

                          <div
                            className="todayMultiExecution"
                            style={{
                              display:
                                "grid",

                              gap:
                                ".5rem",
                            }}
                          >

                            {executionRows.map(
                              (
                                row,
                                rowIndex
                              ) => (
                                <div
                                  key={
                                    `${row.execution}-${rowIndex}`
                                  }
                                  style={{
                                    display:
                                      "grid",

                                    gridTemplateColumns:
                                      "minmax(110px, .8fr) minmax(0, 1.2fr)",

                                    gap:
                                      ".75rem",

                                    alignItems:
                                      "start",
                                  }}
                                >
                                  <strong
                                    style={{
                                      fontSize:
                                        ".76rem",

                                      lineHeight:
                                        1.4,
                                    }}
                                  >
                                    {row.execution}

                                    {row.subExecution && (
                                      <small
                                        style={{
                                          display:
                                            "block",

                                          marginTop:
                                            ".18rem",

                                          fontWeight:
                                            600,

                                          opacity:
                                            .62,

                                          lineHeight:
                                            1.35,
                                        }}
                                      >
                                        {row.subExecution}
                                      </small>
                                    )}
                                  </strong>

                                  <span
                                    style={{
                                      fontSize:
                                        ".74rem",

                                      lineHeight:
                                        1.42,

                                      opacity:
                                        .76,
                                    }}
                                  >
                                    {row.guidance}
                                  </span>
                                </div>
                              )
                            )}

                          </div>

                        )}


                        {steps.length > 0 && (

                          <div className="todayMultiExecution">

                            {steps.map(
                              (
                                step,
                                stepIndex
                              ) => (
                                <div
                                  key={`${step}-${stepIndex}`}
                                >
                                  {step}
                                </div>
                              )
                            )}

                          </div>

                        )}


                        {feedback ? (

                          <div
                            className={[
                              "todayMultiLogged",
                              `status${feedback.status}`,
                            ].join(" ")}
                          >
                            <strong>
                              {feedback.status === "Completed"
                                ? "Completed"
                                : feedback.status === "Modified"
                                  ? "Completed · modified"
                                  : "Skipped"}
                            </strong>

                            {feedback.status !== "Skipped" && (
                              <span>
                                {feedback.actualDurationMinutes
                                  ? formatDuration(
                                      feedback.actualDurationMinutes
                                    )
                                  : "Logged"}
                              </span>
                            )}
                          </div>

                        ) : (

                          <button
                            type="button"
                            className="todayMultiLog"
                            onClick={() =>
                              onLogWorkout(
                                workout
                              )
                            }
                          >
                            Log session
                          </button>

                        )}

                        <button
                          type="button"
                          className="todayViewSession"
                          onClick={() =>
                            onViewWorkout(
                              workout
                            )
                          }
                        >
                          View session →
                        </button>

                      </article>
                    );
                  }
                )}

              </div>

            )}


            <div className="todayMultiFooter">

              {(isRestDay ||
                !allActiveSessionsLogged) && (
                <button
                  type="button"
                  className="todayMultiAdapt"
                  onClick={
                    onAdaptToday
                  }
                >
                  {isRestDay
                    ? "Ask coach"
                    : someActiveSessionsLogged
                    ? "Adapt remaining training"
                    : activeSessions.length > 1
                    ? "Adapt today's training"
                    : "Adapt session"}
                </button>
              )}

            </div>

          </section>

        </div>


        <div className="todaySideStack">

          <section className="todayMiniCard">

            <div className="cardHead">

              <span>
                READINESS
              </span>

              <span>
                {todayReadiness
                  ? "TODAY"
                  : "NOT CHECKED"}
              </span>

            </div>


            {todayReadiness ? (
              <>

                <div className="todayReadinessOverview">

                  <div
                    className={`todayReadinessRing ${readinessTone}`}
                  >
                    <div
                      className="todayReadinessRingProgress"
                      style={{
                        background:
                          `conic-gradient(
                            from -90deg,
                            #73c9ff 0deg,
                            #72e6c2 ${
                              Math.max(
                                0,
                                Math.min(
                                  100,
                                  todayReadiness.score
                                )
                              ) * 2.15
                            }deg,
                            #d2ef70 ${
                              Math.max(
                                0,
                                Math.min(
                                  100,
                                  todayReadiness.score
                                )
                              ) * 3.6
                            }deg,
                            rgba(255,255,255,.07) ${
                              Math.max(
                                0,
                                Math.min(
                                  100,
                                  todayReadiness.score
                                )
                              ) * 3.6
                            }deg 360deg
                          )`,
                      }}
                    >
                      <div className="todayReadinessRingCenter">
                        <strong>
                          {
                            todayReadiness.score
                          }
                        </strong>

                        <span>
                          /100
                        </span>
                      </div>
                    </div>
                  </div>


                  <div className="todayReadinessStatus">
                    <span>
                      STATUS
                    </span>

                    <h3>
                      {
                        todayReadiness.status
                      }
                    </h3>
                  </div>

                </div>


                <div className="todayMiniMetrics">

                  <span>
                    Sleep{" "}
                    <strong>
                      {
                        todayReadiness.sleep
                      }/5
                    </strong>
                  </span>

                  <span>
                    Energy{" "}
                    <strong>
                      {
                        todayReadiness.energy
                      }/5
                    </strong>
                  </span>

                  <span>
                    Stress{" "}
                    <strong>
                      {
                        todayReadiness.stress
                      }/5
                    </strong>
                  </span>

                </div>

              </>
            ) : (
              <>

                <h3>
                  No check-in yet
                </h3>

                <p>
                  30 seconds gives your coach better context.
                </p>

              </>
            )}


            <button
              className="todayMiniAction"
              onClick={
                onReadinessOpen
              }
            >
              {todayReadiness
                ? "Update check-in"
                : "Check readiness"}
            </button>

          </section>


          {nextWorkout && (

            <section className="todayMiniCard">

              <div className="cardHead">

                <span>
                  UP NEXT
                </span>

                <span>
                  {
                    nextWorkout.day
                  }
                </span>

              </div>


              <h3>
                {
                  nextWorkout.title
                }
              </h3>


              <div className="todayUpNextMeta">

                <span className="todayUpNextIcon">
                  <SportIcon
                    sport={
                      nextWorkout.durationMinutes === 0
                        ? "Rest"
                        : nextWorkout.sport
                    }
                    size={24}
                  />
                </span>

                <span>
                  {
                    nextWorkout.durationMinutes ===
                    0
                      ? "Rest day"
                      : `${nextWorkout.sport} · ${formatDuration(
                          nextWorkout.durationMinutes
                        )}`
                  }
                </span>

              </div>

            </section>

          )}

        </div>

      </div>
    </div>
  );
}
