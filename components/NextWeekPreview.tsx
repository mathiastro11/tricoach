"use client";

import {
  formatDuration,
} from "@/lib/format-duration";

import type {
  TrainingPlan,
  TrainingPlanDay,
} from "@/types/training";


type NextWeekPreviewProps = {
  plan: TrainingPlan | null;
  loading: boolean;

  onSelectWorkout?: (
    workout: TrainingPlanDay
  ) => void;
};


function getSessionsForDay(
  plan: TrainingPlan,
  primary: TrainingPlanDay
) {
  return [
    primary,
    ...(
      plan.additionalSessions ??
      []
    ).filter(
      (session) =>
        session.day ===
        primary.day
    ),
  ];
}


export default function NextWeekPreview({
  plan,
  loading,
  onSelectWorkout,
}: NextWeekPreviewProps) {

  if (
    !plan &&
    !loading
  ) {
    return null;
  }


  const totalSessions =
    plan
      ? [
          ...plan.days,
          ...(
            plan.additionalSessions ??
            []
          ),
        ].filter(
          (session) =>
            session.durationMinutes >
            0
        ).length
      : 0;


  return (
    <section className="nextWeekPreview">

      <div className="nextWeekPreviewTop">

        <div>

          <div className="nextWeekPreviewLabelRow">

            <span className="eyebrow">
              NEXT WEEK
            </span>

            <span className="provisionalBadge">
              PROVISIONAL
            </span>

            <span className="nextWeekReviewApplied">
              REVIEW APPLIED
            </span>

          </div>


          <h2>
            {plan
              ? plan.focus
              : loading
                ? "Building next week…"
                : "Next week is not ready yet"}
          </h2>


          <p>
            {plan || loading
              ? (
                  <>
                    Built from your latest coach review and
                    adjusted as your training data changes.
                  </>
                )
              : (
                  <>
                    Basse could not finish the preview.
                    It will retry automatically when your
                    training state changes.
                  </>
                )}
          </p>

        </div>

      </div>


      {plan && (
        <>

          <div className="nextWeekSummary">

            <div className="nextWeekSummaryMetric">
              <span>
                PLANNED
              </span>

              <strong>
                {plan.totalHours} h
              </strong>
            </div>

            <div className="nextWeekSummaryMetric">
              <span>
                SESSIONS
              </span>

              <strong>
                {totalSessions}
              </strong>
            </div>

            {plan.weekNumber && (
              <div className="nextWeekSummaryMetric">
                <span>
                  WEEK
                </span>

                <strong>
                  {plan.weekNumber}
                </strong>
              </div>
            )}

          </div>


          <div className="nextWeekDays">

            {plan.days.map(
              (
                primary,
                index
              ) => {

                const sessions =
                  getSessionsForDay(
                    plan,
                    primary
                  );


                const raceDay =
                  sessions.find(
                    (session) =>
                      session.isRaceDay
                  );


                const postRaceDay =
                  sessions.find(
                    (session) =>
                      session.isPostRace
                  );


                const activeSessions =
                  sessions.filter(
                    (session) =>
                      session.durationMinutes >
                        0 &&
                      session.sport !==
                        "Rest" &&
                      !session.isRaceDay &&
                      !session.isPostRace
                  );


                const totalMinutes =
                  activeSessions.reduce(
                    (
                      sum,
                      session
                    ) =>
                      sum +
                      session.durationMinutes,
                    0
                  );


                const isDouble =
                  activeSessions.length >
                  1;


                return (
                  <div
                    className={[
                      "nextWeekDay",
                      isDouble
                        ? "nextWeekDoubleDay"
                        : "",
                      raceDay
                        ? "nextWeekRaceDay"
                        : postRaceDay
                          ? "nextWeekPostRaceDay"
                          : activeSessions.length === 0
                            ? "nextWeekRestDay"
                            : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={
                      primary.sessionId ??
                      `${primary.day}-${index}`
                    }
                  >

                    <div className="nextWeekDayTop">

                      <span>
                        {primary.day.slice(
                          0,
                          3
                        )}
                      </span>

                      <strong>
                        {raceDay
                          ? "Race day"
                          : postRaceDay
                            ? "Recovery"
                            : activeSessions.length === 0
                              ? "Rest"
                              : formatDuration(
                                  totalMinutes
                                )}
                      </strong>

                    </div>


                    {isDouble && (
                      <div className="nextWeekDoubleBadge">
                        DOUBLE
                      </div>
                    )}


                    <div className="nextWeekSessionStack">

                      {raceDay ? (

                        <button
                          type="button"
                          className="nextWeekSessionMini nextWeekRaceSessionMini"
                          onClick={() =>
                            onSelectWorkout?.(
                              raceDay
                            )
                          }
                        >
                          <span>
                            RACE DAY
                          </span>

                          <strong>
                            {raceDay.title}
                          </strong>

                          <small>
                            Target race
                          </small>
                        </button>

                      ) : postRaceDay ? (

                        <div className="nextWeekSessionMini nextWeekPostRaceSessionMini">
                          <span>
                            RECOVERY
                          </span>

                          <strong>
                            {postRaceDay.title}
                          </strong>
                        </div>

                      ) : activeSessions.length >
                      0 ? (

                        activeSessions.map(
                          (
                            session,
                            sessionIndex
                          ) => (
                            <button
                              type="button"
                              className="nextWeekSessionMini"
                              key={
                                session.sessionId ??
                                `${session.day}-${session.title}-${sessionIndex}`
                              }
                              onClick={() =>
                                onSelectWorkout?.(
                                  session
                                )
                              }
                            >

                              <span>
                                {session.sessionSlot &&
                                session.sessionSlot !==
                                  "Flexible"
                                  ? `${session.sessionSlot} · `
                                  : ""}
                                {session.sport}
                              </span>


                              <strong>
                                {session.title}
                              </strong>


                              <small>
                                {formatDuration(
                                  session.durationMinutes
                                )}
                              </small>

                            </button>
                          )
                        )

                      ) : (

                        <div className="nextWeekSessionMini">

                          <span>
                            REST
                          </span>

                          <strong>
                            Recovery day
                          </strong>

                        </div>

                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>




        </>
      )}

    </section>
  );
}
