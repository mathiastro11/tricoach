"use client";

import SportIcon from "@/components/SportIcon";

import {
  formatDuration,
} from "@/lib/format-duration";

import {
  findWorkoutFeedback,
} from "@/lib/workout-feedback-match";

import { useState } from "react";

import type {
  TrainingPlan,
  TrainingPlanDay,
  WorkoutFeedback,
  WeeklyReview,
} from "@/types/training";

type WeekViewProps = {
  plan: TrainingPlan | null;
  history: WorkoutFeedback[];
  review: WeeklyReview | null;

  targetRaceName?: string;
  raceDate?: string;

  onChooseNextGoal: () => void;

  onSelectWorkout: (
    workout: TrainingPlanDay
  ) => void;

  onAddSession: () => void;
};

function weekSessionSlotOrder(
  sessionSlot:
    | "AM"
    | "PM"
    | "Flexible"
    | undefined
) {
  if (sessionSlot === "AM") {
    return 0;
  }

  if (sessionSlot === "PM") {
    return 1;
  }

  return 2;
}


export default function WeekView({
  plan,
  history,
  review,
  targetRaceName,
  raceDate,
  onChooseNextGoal,
  onSelectWorkout,
  onAddSession,
}: WeekViewProps) {

  const [
    showPostRaceRecovery,
    setShowPostRaceRecovery,
  ] = useState(false);


  const raceCompleted = (() => {

    if (!raceDate) {
      return false;
    }


    const raceEnd =
      new Date(
        `${raceDate}T23:59:59`
      );


    if (
      Number.isNaN(
        raceEnd.getTime()
      )
    ) {
      return false;
    }


    return (
      new Date() >
        raceEnd
    );
  })();

  if (!plan) {
    return (
      <>
        <header className="dashHeader">
          <div>
            <span className="eyebrow">
              TRAINING WEEK
            </span>

            <h1>
              Know what matters this week.
            </h1>
          </div>
        </header>

        <section className="todayCard">
          <div className="cardHead">
            <span>NO ACTIVE PLAN</span>
          </div>

          <h2>
            Your training week is empty.
          </h2>

          <p>
            Create or reset your athlete plan to
            build a new training week.
          </p>
        </section>
      </>
    );
  }

  const todayISO =
    new Date().toLocaleDateString(
      "en-CA"
    );

  const additionalSessions =
    plan.additionalSessions ?? [];

  const allPlannedSessions = [
    ...plan.days,
    ...additionalSessions,
  ];


  function getFeedback(
    workout: TrainingPlanDay
  ) {
    return findWorkoutFeedback(
      workout,
      history
    );
  }


  /*
    Week statistics must come from workouts that still
    exist in the active plan.

    This keeps the hero metrics aligned with the same
    canonical workout ↔ feedback matching used by each
    session card, and prevents stale/orphan feedback
    records from affecting the current week.
  */
  const plannedSessions =
    allPlannedSessions.filter(
      (workout) =>
        workout.durationMinutes > 0
    );


  const plannedMinutes =
    plannedSessions.reduce(
      (total, workout) =>
        total +
        workout.durationMinutes,
      0
    );


  const matchedFeedback =
    plannedSessions
      .map(
        (workout) =>
          getFeedback(workout)
      )
      .filter(
        (
          item
        ): item is WorkoutFeedback =>
          Boolean(item)
      );


  const completedMinutes =
    matchedFeedback.reduce(
      (total, item) =>
        total +
        (
          item.status === "Skipped"
            ? 0
            : item.actualDurationMinutes ?? 0
        ),
      0
    );


  const loggedSessions =
    matchedFeedback.filter(
      (item) =>
        item.status === "Completed" ||
        item.status === "Modified"
    ).length;


  const skippedSessions =
    matchedFeedback.filter(
      (item) =>
        item.status === "Skipped"
    ).length;


  /*
    Week progress is a completion indicator, not a
    training-load metric.

    Keep PLANNED / TRAINED as duration-based volume,
    while the progress bar mirrors DONE and Today:
    completed or modified sessions / planned sessions.

    Skipped sessions are resolved, but not completed.
  */
  const progress =
    plannedSessions.length > 0
      ? Math.min(
          100,
          Math.round(
            (
              loggedSessions /
              plannedSessions.length
            ) * 100
          )
        )
      : 0;


  /*
    ========================================================
    POST-RACE EXPERIENCE
    ========================================================

    Once the target race has passed, the old training
    cycle is finished.

    Do not immediately roll the athlete into another
    structured week.
  */
  if (
    raceCompleted &&
    plan
  ) {

    const completedRace =
      targetRaceName ??
      plan.days.find(
        (day) =>
          day.isRaceDay
      )?.targetRaceName ??
      "Your target race";


    return (
      <div className="postRaceExperience">

        <section className="postRaceHero">

          <div className="postRaceFlag">
            🏁
          </div>


          <span className="eyebrow">
            SEASON COMPLETE
          </span>


          <h1>
            {completedRace} is in the books.
          </h1>


          <p>
            This training cycle is complete.
            Basse will not automatically build
            another structured week from the old goal.
          </p>


          <div className="postRaceActions">

            <button
              type="button"
              className="primary"
              onClick={() =>
                setShowPostRaceRecovery(
                  (current) =>
                    !current
                )
              }
            >
              {showPostRaceRecovery
                ? "Hide recovery guide"
                : "Recover first"}
            </button>


            <button
              type="button"
              className="secondary"
              onClick={
                onChooseNextGoal
              }
            >
              Choose next goal →
            </button>

          </div>

        </section>


        {showPostRaceRecovery && (
          <section className="postRaceRecovery">

            <div className="postRaceRecoveryHead">

              <div>
                <span className="eyebrow">
                  POST-RACE
                </span>

                <h2>
                  Give the body room to absorb the race.
                </h2>
              </div>


              <span className="postRaceRecoveryBadge">
                No structured plan
              </span>

            </div>


            <div className="postRaceRecoveryGrid">

              <article>
                <span>
                  01
                </span>

                <h3>
                  First 48 hours
                </h3>

                <p>
                  Prioritize sleep, food, hydration
                  and comfortable everyday movement.
                  Training is optional.
                </p>
              </article>


              <article>
                <span>
                  02
                </span>

                <h3>
                  Next few days
                </h3>

                <p>
                  Easy walking, relaxed swimming or
                  very light spinning can be fine
                  when it genuinely feels restorative.
                </p>
              </article>


              <article>
                <span>
                  03
                </span>

                <h3>
                  Then reassess
                </h3>

                <p>
                  Start another structured cycle
                  when recovery feels good and you
                  have a goal worth training toward.
                </p>
              </article>

            </div>


            <div className="postRaceRecoveryNote">
              There is no need to rush into another
              training block. Choosing the next goal
              will start a fresh Basse cycle instead
              of extending the completed one.
            </div>

          </section>
        )}


        <section className="postRaceFinishedWeek">

          <div>
            <span className="eyebrow">
              COMPLETED CYCLE
            </span>

            <h2>
              Your final race week remains saved.
            </h2>

            <p>
              Training history and completed sessions
              are preserved. Selecting a new target
              starts the next planning cycle.
            </p>
          </div>


          <button
            type="button"
            className="secondary"
            onClick={
              onChooseNextGoal
            }
          >
            Set a new target
          </button>

        </section>

      </div>
    );
  }


  /*
    ==========================================================
    CLEAN WEEK CARD PRESENTATION
    ==========================================================

    Week view should communicate:
    - what
    - how long
    - how hard
    - what to actually do

    Everything else belongs in the detail view.
  */

  function getWorkoutCardTarget(
    workout:
      TrainingPlanDay
  ) {

    const intensity =
      workout.intensity ??
      "";


    /*
      Week cards are for fast scanning.

      Effort is the primary target.
      Pace / watts belong in workout details.
    */
    const rpe =
      intensity.match(
        /RPE\s*\d+(?:\s*[–-]\s*\d+)?/i
      );


    if (rpe) {
      return rpe[0];
    }


    if (
      /conversational/i.test(
        intensity
      )
    ) {
      return "Conversational";
    }


    if (
      /easy aerobic/i.test(
        intensity
      )
    ) {
      return "Easy aerobic";
    }


    if (
      /smooth aerobic/i.test(
        intensity
      )
    ) {
      return "Smooth aerobic";
    }


    return null;
  }




  return (
    <>
      <header className="dashHeader weekPageHeader">
        <div>
          <span className="eyebrow">
            THIS WEEK
          </span>

          <h1>
            Your training week.
          </h1>
        </div>
      </header>

      <section className="smartWeekHero">
        <div className="smartWeekHeroCopy">
          <span className="eyebrow">
            {plan.weekNumber
              ? `WEEK ${plan.weekNumber}`
              : "CURRENT WEEK"}
          </span>

          <h2>
            {plan.focus}
          </h2>

          {plan.summary && (
            <p>
              {plan.summary}
            </p>
          )}
        </div>

        <div className="smartWeekStats">
          <div>
            <span>PLANNED</span>

            <strong>
              {Math.floor(
                plannedMinutes / 60
              )}
              h{" "}
              {plannedMinutes % 60}
              m
            </strong>
          </div>

          <div>
            <span>TRAINED</span>

            <strong>
              {Math.floor(
                completedMinutes / 60
              )}
              h{" "}
              {completedMinutes % 60}
              m
            </strong>
          </div>

          <div>
            <span>DONE</span>

            <strong>
              {loggedSessions}
              /{plannedSessions.length}
            </strong>
          </div>
        </div>

        <div className="weekProgressTrack">
          <div
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="weekProgressLabel">
          <span>
            Sessions completed
          </span>

          <strong>
            {progress}%
          </strong>
        </div>
      </section>

      <section className="weekSection">
        <div className="sectionTitle">
          <div>
            <span className="eyebrow">
              SESSIONS
            </span>

            <h2>
              Your week at a glance
            </h2>
          </div>

          <div className="weekSectionActions">
            <span className="weekSessionProgress">
              <strong>
                {loggedSessions}/{plannedSessions.length}
              </strong>{" "}
              logged
              {skippedSessions > 0
                ? ` · ${skippedSessions} skipped`
                : ""}
            </span>

            <button
              className="secondary weekAddSessionDesktop"
              onClick={onAddSession}
            >
              + Add session
            </button>
          </div>
        </div>

        <div className="smartWeekGrid">
          {plan.days.map(
            (workout) => {
              const feedback =
                getFeedback(workout);

              const isToday =
                workout.date ===
                todayISO;

              const status =
                feedback?.status ??
                (
                  isToday
                    ? "Today"
                    : "Planned"
                );

              const dayAdditionalSessions =
                additionalSessions
                  .filter(
                    (session) =>
                      session.day === workout.day
                  )
                  .map(
                    (session, originalIndex) => ({
                      session,
                      originalIndex,
                    })
                  )
                  .sort((a, b) => {
                    return (
                      weekSessionSlotOrder(
                        a.session.sessionSlot
                      ) -
                        weekSessionSlotOrder(
                          b.session.sessionSlot
                        ) ||
                      a.originalIndex -
                        b.originalIndex
                    );
                  })
                  .map(
                    ({ session }) =>
                      session
                  );

              const hideEmptyPrimary =
                workout.sport === "Rest" &&
                workout.durationMinutes === 0 &&
                dayAdditionalSessions.length > 0;

              const daySessionCount =
                (
                  workout.durationMinutes > 0 ||
                  workout.isRaceDay
                    ? 1
                    : 0
                ) +
                dayAdditionalSessions.filter(
                  (session) =>
                    session.durationMinutes > 0
                ).length;

              return (
                <div
                  className="weekDayColumn"
                  key={
                    workout.sessionId ??
                    `${workout.day}-${workout.date ?? ""}`
                  }
                >
                  <div
                    style={{
                      order: -10,
                    }}
                    className={[
                      "weekDayMobileHeader",
                      isToday
                        ? "isToday"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="weekDayMobileIdentity">
                      <strong>
                        {workout.day}
                      </strong>

                      {workout.date && (
                        <span>
                          {new Date(
                            `${workout.date}T12:00:00`
                          ).toLocaleDateString(
                            "en-GB",
                            {
                              day:
                                "numeric",
                              month:
                                "short",
                            }
                          )}
                        </span>
                      )}
                    </div>

                    <span className="weekDayMobileMeta">
                      {isToday
                        ? "TODAY"
                        : daySessionCount === 0
                          ? "REST DAY"
                          : `${daySessionCount} ${
                              daySessionCount === 1
                                ? "SESSION"
                                : "SESSIONS"
                            }`}
                    </span>
                  </div>

                  {!hideEmptyPrimary && (
                  <button
                  style={{
                    order:
                      weekSessionSlotOrder(
                        workout.sessionSlot
                      ),
                  }}
                  className={[
                    "smartWorkoutCard",

                    workout.isRaceDay
                      ? "raceDayWorkoutCard"
                      : "",

                    workout.isPostRace
                      ? "postRaceWorkoutCard"
                      : "",

                    isToday
                      ? "isToday"
                      : "",

                    feedback &&
                    !workout.isRaceDay &&
                    !workout.isPostRace
                      ? `status${feedback.status}`
                      : "",

                    !feedback &&
                    !workout.isRaceDay &&
                    !workout.isPostRace &&
                    !isToday
                      ? "statusPlanned"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    onSelectWorkout(
                      workout
                    )
                  }
                >
                  <div className="smartWorkoutTop">
                    <div>
                      <strong>
                        {workout.day}
                      </strong>

                      {workout.date && (
                        <span>
                          {new Date(
                            `${workout.date}T12:00:00`
                          ).toLocaleDateString(
                            "en-GB",
                            {
                              day:
                                "numeric",
                              month:
                                "short",
                            }
                          )}
                        </span>
                      )}
                    </div>

                    <span
                      className="workoutStatus"
                    >
                      {workout.isRaceDay
                        ? "RACE DAY"
                        : workout.isPostRace
                          ? "SEASON COMPLETE"
                          : status}
                    </span>
                  </div>

                  {workout.coachAdjustment &&
                    !workout.isRaceDay &&
                    !workout.isPostRace &&
                    (() => {
                      const original =
                        workout.coachAdjustment
                          ?.originalWorkout;

                      if (original) {
                        return (
                          original.sport !== workout.sport ||
                          original.title !== workout.title ||
                          original.durationMinutes !==
                            workout.durationMinutes ||
                          original.intensity !==
                            workout.intensity ||
                          original.purpose !==
                            workout.purpose ||
                          JSON.stringify(
                            original.details ?? []
                          ) !==
                            JSON.stringify(
                              workout.details ?? []
                            )
                        );
                      }

                      return (
                        typeof workout.coachAdjustment
                          ?.previousDurationMinutes ===
                          "number" &&
                        workout.coachAdjustment
                          .previousDurationMinutes !==
                          workout.durationMinutes
                      );
                    })() && (
                    <div className="coachAdjustedRow">
                      <span className="coachAdjustedBadge">
                        COACH ADJUSTED
                      </span>

                      {workout.durationMinutes > 0 &&
                        typeof workout.coachAdjustment
                          .previousDurationMinutes === "number" &&
                        workout.coachAdjustment
                          .previousDurationMinutes !==
                          workout.durationMinutes && (
                          <span className="coachAdjustedMeta">
                            {formatDuration(
                              workout.coachAdjustment
                                .previousDurationMinutes
                            )}
                            {" → "}
                            {formatDuration(
                              workout.durationMinutes
                            )}
                          </span>
                        )}
                    </div>
                  )}

                  <div className="smartWorkoutSport">
                    <SportIcon
                      sport={
                        workout.sport
                      }
                    />

                    <span>
                      {workout.sport}
                    </span>

                    {daySessionCount > 1 && (
                      <span className="weekSessionSlot">
                        {workout.sessionSlot ??
                          "Flexible"}
                      </span>
                    )}
                  </div>

                  <h3>
                    {workout.title}
                  </h3>

                  {workout.isRaceDay ? (

                    <div className="cleanWorkoutRaceSummary">
                      Swim · Bike · Run
                    </div>

                  ) : workout.isPostRace ? (

                    <div className="cleanWorkoutRestSummary">
                      No structured training
                    </div>

                  ) : workout.durationMinutes ===
                      0 ? (

                    <div className="cleanWorkoutRestSummary">
                      Recovery · No structured training
                    </div>

                  ) : (

                    <div className="cleanWorkoutSummary">

                      <div className="cleanWorkoutMetrics">

                        <span className="cleanWorkoutMetric duration">
                          {formatDuration(
                            workout.durationMinutes
                          )}
                        </span>


                        {getWorkoutCardTarget(
                          workout
                        ) && (
                          <span className="cleanWorkoutMetric">
                            {getWorkoutCardTarget(
                              workout
                            )}
                          </span>
                        )}

                      </div>

                      

                    </div>

                  )}

                  {feedback ? (
                    <div className="actualWorkout">
                      {feedback.status ===
                      "Skipped"
                        ? "Skipped"
                        : feedback.actualDurationMinutes
                          ? `${formatDuration(
                              feedback.actualDurationMinutes
                            )} ${
                              feedback.status ===
                              "Modified"
                                ? "completed · modified"
                                : "completed"
                            }`
                          : feedback.status ===
                              "Modified"
                            ? "Completed · modified"
                            : "Completed"}

                      {feedback.status !==
                        "Skipped" &&
                      feedback.rpe
                        ? ` · RPE ${feedback.rpe}`
                        : ""}
                    </div>
                  ) : null}

                  <div className="smartWorkoutLink">
                    Details
                  </div>
                </button>
                  )}

                {dayAdditionalSessions
                  .map(
                    (manualWorkout) => {
                      const manualFeedback =
                        getFeedback(
                          manualWorkout
                        );

                      const manualStatus =
                        manualFeedback?.status ??
                        (
                          manualWorkout.date ===
                          todayISO
                            ? "Today"
                            : "Planned"
                        );

                      return (
                        <button
                          type="button"
                          style={{
                            order:
                              weekSessionSlotOrder(
                                manualWorkout.sessionSlot
                              ),
                          }}
                          className={[
                            "smartWorkoutCard",
                            manualFeedback
                              ? `status${manualFeedback.status}`
                              : "",

                            manualWorkout.date ===
                              todayISO &&
                            !manualFeedback
                              ? "isToday"
                              : "",

                            manualWorkout.date !==
                              todayISO &&
                            !manualFeedback
                              ? "statusPlanned"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          key={
                            manualWorkout.sessionId ??
                            `${manualWorkout.day}-${manualWorkout.title}`
                          }
                          onClick={() =>
                            onSelectWorkout(
                              manualWorkout
                            )
                          }
                        >
                          <div className="smartWorkoutTop">
                            <div>
                              <strong>
                                {manualWorkout.day}
                              </strong>

                              {manualWorkout.date && (
                                <span>
                                  {new Date(
                                    `${manualWorkout.date}T12:00:00`
                                  ).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "numeric",
                                      month: "short",
                                    }
                                  )}
                                </span>
                              )}
                            </div>

                            <span className="workoutStatus">
                              {manualStatus}
                            </span>
                          </div>

                          <div className="smartWorkoutSport">
                            <SportIcon
                              sport={
                                manualWorkout.sport
                              }
                            />

                            <span>
                              {
                                manualWorkout.sport
                              }
                            </span>

                            {daySessionCount > 1 && (
                              <span className="weekSessionSlot">
                                {manualWorkout.sessionSlot ??
                                  "Flexible"}
                              </span>
                            )}
                          </div>

                          <h3>
                            {manualWorkout.title}
                          </h3>

                          <div className="cleanWorkoutSummary">

                            <div className="cleanWorkoutMetrics">

                              <span className="cleanWorkoutMetric duration">
                                {formatDuration(
                                  manualWorkout.durationMinutes
                                )}
                              </span>

                              {getWorkoutCardTarget(
                                manualWorkout
                              ) && (
                                <span className="cleanWorkoutMetric">
                                  {getWorkoutCardTarget(
                                    manualWorkout
                                  )}
                                </span>
                              )}

                            </div>

                          </div>

                          {manualFeedback ? (
                            <div className="actualWorkout">
                              {manualFeedback.status ===
                              "Skipped"
                                ? "Skipped"
                                : manualFeedback.actualDurationMinutes
                                  ? `${formatDuration(
                                      manualFeedback.actualDurationMinutes
                                    )} ${
                                      manualFeedback.status ===
                                      "Modified"
                                        ? "completed · modified"
                                        : "completed"
                                    }`
                                  : manualFeedback.status ===
                                      "Modified"
                                    ? "Completed · modified"
                                    : "Completed"}

                              {manualFeedback.status !==
                                "Skipped" &&
                              manualFeedback.rpe
                                ? ` · RPE ${manualFeedback.rpe}`
                                : ""}
                            </div>
                          ) : null}

                          <div className="smartWorkoutLink">
                            Details
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              );
            }
          )}
        </div>

        <button
          type="button"
          className="secondary weekAddSessionMobile"
          onClick={onAddSession}
        >
          + Add session
        </button>

      </section>

      {review?.coachingDecision && (
        <section className="weekCoachContext">
          <details>
            <summary>
              <div className="weekCoachSummaryCopy">
                <span className="eyebrow">
                  COACH CONTEXT
                </span>

                <strong>
                  Why this week?
                </strong>
              </div>

              <div className="weekCoachSummaryRight">
                <span
                  className={`decisionBadge ${
                    review.coachingDecision.loadDecision ===
                    "Increase slightly"
                      ? "increase"
                      : review.coachingDecision.loadDecision ===
                        "Reduce"
                      ? "reduce"
                      : "maintain"
                  }`}
                >
                  {review.coachingDecision.loadDecision}
                </span>

                <span
                  className="weekCoachChevron"
                  aria-hidden="true"
                >
                  ↓
                </span>
              </div>
            </summary>

            <div className="weekCoachDetails">
              <p className="coachingDecisionSummary">
                {review.coachingDecision.reasons.join(
                  " "
                )}
              </p>

              <div className="coachingDecisionMetrics">
                <div>
                  <span>COMPLETION</span>
                  <strong>
                    {review.coachingDecision.completionRate !==
                    null
                      ? `${review.coachingDecision.completionRate}%`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>AVG RPE</span>
                  <strong>
                    {review.coachingDecision.averageRpe ??
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>FATIGUE</span>
                  <strong>
                    {review.coachingDecision.fatigueRisk}
                  </strong>
                </div>

                <div>
                  <span>CONSISTENCY</span>
                  <strong>
                    {review.coachingDecision.consistency}
                  </strong>
                </div>

                <div>
                  <span>SAFE RANGE</span>
                  <strong>
                    {
                      review.coachingDecision
                        .recommendedHoursMin
                    }
                    –
                    {
                      review.coachingDecision
                        .recommendedHoursMax
                    }
                    h
                  </strong>
                </div>
              </div>
            </div>
          </details>
        </section>
      )}

      
    </>
  );
}