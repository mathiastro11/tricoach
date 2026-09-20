"use client";

import {
  formatDuration,
} from "@/lib/format-duration";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Athlete,
  AvailabilitySport,
  TrainingArchiveWeek,
  TrainingAvailability,
  TrainingPlan,
  TrainingPlanDay,
  WorkoutFeedback,
} from "@/types/training";

import {
  getAvailabilityForDate,
  getWeeklyAllowedSportsForDate,
  resolveAvailabilityForDate,
} from "@/lib/training-availability";

import {
  workoutMatchesFeedback,
} from "@/lib/workout-feedback-match";


type CalendarViewProps = {
  athlete: Athlete;

  trainingPlan:
    | TrainingPlan
    | null;

  nextWeekPreview:
    | TrainingPlan
    | null;

  workoutHistory:
    WorkoutFeedback[];

  trainingArchive:
    TrainingArchiveWeek[];

  availability:
    TrainingAvailability[];

  adaptingAvailabilityDates:
    string[];

  targetRace?:
    Athlete["targetRace"];

  raceDate?: string;

  onSaveAvailability: (
    entry:
      | TrainingAvailability
      | null,
    date: string
  ) => void;

  onSelectWorkout: (
    workout: TrainingPlanDay,
    previewOnly: boolean
  ) => void;
};


const SPORTS:
  AvailabilitySport[] = [
    "Swim",
    "Bike",
    "Run",
    "Strength",
  ];


const WEEKDAYS = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];


function toLocalISO(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return (
    `${year}-${month}-${day}`
  );
}


function getMonthLabel(
  date: Date
) {
  return date.toLocaleDateString(
    "en-GB",
    {
      month: "long",
      year: "numeric",
    }
  );
}


function getLongDateLabel(
  iso: string
) {
  return new Date(
    `${iso}T12:00:00`
  ).toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


function getPlanSessions(
  plan:
    | TrainingPlan
    | null
) {
  if (!plan) {
    return [];
  }

  const datedPrimary =
    plan.days.map(
      (workout) =>
        workout
    );

  const datedAdditional =
    (
      plan.additionalSessions ??
      []
    ).map(
      (workout) => {
        if (
          workout.date
        ) {
          return workout;
        }

        const primary =
          plan.days.find(
            (day) =>
              day.day ===
              workout.day
          );

        return {
          ...workout,
          date:
            primary?.date,
        };
      }
    );

  return [
    ...datedPrimary,
    ...datedAdditional,
  ];
}


function uniqueFeedback(
  feedback:
    WorkoutFeedback[]
) {
  const map =
    new Map<
      string,
      WorkoutFeedback
    >();

  for (
    const item
    of feedback
  ) {
    const key =
      item.id ||
      item.sessionId ||
      [
        item.date,
        item.day,
        item.title,
        item.completedAt,
      ].join("|");

    map.set(
      key,
      item
    );
  }

  return Array.from(
    map.values()
  );
}


export default function CalendarView({
  athlete,
  trainingPlan,
  nextWeekPreview,
  workoutHistory,
  trainingArchive,
  availability,
  adaptingAvailabilityDates,
  targetRace,
  raceDate,
  onSaveAvailability,
  onSelectWorkout,
}: CalendarViewProps) {

  const todayISO =
    toLocalISO(
      new Date()
    );

  /*
    Race day belongs to the Calendar independently
    of whichever training week is currently loaded.
  */
  const targetRaceDate =
    targetRace?.date ??
    raceDate ??
    "";

  const targetRaceLabel =
    targetRace?.name ??
    (
      targetRaceDate
        ? `${athlete.goal} race`
        : ""
    );

  const [
    cursorMonth,
    setCursorMonth,
  ] =
    useState(
      () => {
        const now =
          new Date();

        return new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
      }
    );

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState(
      todayISO
    );

  const [
    editorMode,
    setEditorMode,
  ] =
    useState<
      "normal" |
      "unavailable" |
      "custom"
    >(
      "normal"
    );

  const [
    allowedSports,
    setAllowedSports,
  ] =
    useState<
      AvailabilitySport[]
    >(
      SPORTS
    );

  const [
    maxDuration,
    setMaxDuration,
  ] =
    useState("");

  const [
    note,
    setNote,
  ] =
    useState("");


  const explicitOverride =
    getAvailabilityForDate(
      availability,
      selectedDate
    );


  const selectedDateIsAdapting =
    adaptingAvailabilityDates.includes(
      selectedDate
    );


  /*
    FINAL availability shown to the athlete.

    Calendar override wins over the recurring weekly
    baseline. UI must reflect this resolved truth.
  */
  const resolvedAvailability =
    resolveAvailabilityForDate({
      athlete,
      availability,
      date:
        selectedDate,
    });

  const resolvedAllowedSports =
    resolvedAvailability.status ===
      "Unavailable"
      ? []
      : (
          resolvedAvailability
            .allowedSports ??
          [...SPORTS]
        );


  useEffect(
    () => {

      /*
        Keep the editor synchronized with the selected
        calendar date and the latest availability data.

        Run the state synchronization on the next task
        instead of synchronously inside the effect body.
      */
      const syncEditor =
        window.setTimeout(
          () => {

            const override =
              getAvailabilityForDate(
                availability,
                selectedDate
              );

            if (!override) {
              setEditorMode(
                "normal"
              );

              setAllowedSports(
                getWeeklyAllowedSportsForDate({
                  athlete,
                  date:
                    selectedDate,
                })
              );

              setMaxDuration(
                ""
              );

              setNote(
                ""
              );

              return;
            }

            if (
              override.status ===
              "Unavailable"
            ) {
              setEditorMode(
                "unavailable"
              );

              setAllowedSports(
                []
              );
            } else {
              setEditorMode(
                "custom"
              );

              setAllowedSports(
                override.allowedSports ??
                [...SPORTS]
              );
            }

            setMaxDuration(
              typeof override
                .maxDurationMinutes ===
                "number"
                ? String(
                    override
                      .maxDurationMinutes
                  )
                : ""
            );

            setNote(
              override.note ??
              ""
            );

          },
          0
        );


      return () => {
        window.clearTimeout(
          syncEditor
        );
      };

    },
    [
      selectedDate,
      availability,
      athlete,
    ]
  );


  const currentWeekPlannedSessions =
    useMemo(
      () =>
        getPlanSessions(
          trainingPlan
        ),
      [
        trainingPlan,
      ]
    );


  const nextWeekPlannedSessions =
    useMemo(
      () =>
        getPlanSessions(
          nextWeekPreview
        ),
      [
        nextWeekPreview,
      ]
    );


  const plannedSessions =
    useMemo(
      () => [
        ...currentWeekPlannedSessions,
        ...nextWeekPlannedSessions,
      ],
      [
        currentWeekPlannedSessions,
        nextWeekPlannedSessions,
      ]
    );


  /*
    Calendar displays both the active week and provisional
    Next Week.

    WorkoutDetails must know which context owns the selected
    workout so provisional sessions remain strictly read-only.
  */
  function isNextWeekPreviewWorkout(
    workout: TrainingPlanDay
  ) {
    return nextWeekPlannedSessions.some(
      (candidate) => {

        if (
          workout.sessionId &&
          candidate.sessionId
        ) {
          return (
            workout.sessionId ===
            candidate.sessionId
          );
        }


        if (
          workout.sessionId ||
          candidate.sessionId
        ) {
          return false;
        }


        return (
          workout.date ===
            candidate.date &&
          workout.day ===
            candidate.day &&
          workout.sport ===
            candidate.sport &&
          workout.title ===
            candidate.title
        );
      }
    );
  }


  const archivedFeedback =
    useMemo(
      () =>
        trainingArchive.flatMap(
          (week) =>
            week.feedback ??
            []
        ),
      [
        trainingArchive,
      ]
    );


  const allFeedback =
    useMemo(
      () =>
        uniqueFeedback([
          ...archivedFeedback,
          ...workoutHistory,
        ]),
      [
        archivedFeedback,
        workoutHistory,
      ]
    );


  const historicalPlannedSessions =
    useMemo(
      () =>
        trainingArchive.flatMap(
          (week) =>
            getPlanSessions(
              week.plan
            )
        ),
      [
        trainingArchive,
      ]
    );


  const allKnownPlannedSessions =
    useMemo(
      () => [
        ...historicalPlannedSessions,
        ...plannedSessions,
      ],
      [
        historicalPlannedSessions,
        plannedSessions,
      ]
    );


  function getWorkoutForFeedback(
    item: WorkoutFeedback
  ): TrainingPlanDay {

    const exactSession =
      item.sessionId
        ? allKnownPlannedSessions.find(
            (workout) =>
              workout.sessionId ===
              item.sessionId
          )
        : undefined;


    if (exactSession) {
      return exactSession;
    }


    const legacyMatch =
      allKnownPlannedSessions.find(
        (workout) =>
          !!item.date &&
          workout.date ===
            item.date &&
          workout.sport ===
            item.sport &&
          workout.title ===
            item.title
      );


    if (legacyMatch) {
      return legacyMatch;
    }


    /*
      Legacy fallback.

      Very old feedback can survive without the original
      plan object. Keep it openable as a completed training
      record rather than losing access to the history.
    */
    return {
      sessionId:
        item.sessionId,

      day:
        item.day,

      date:
        item.date,

      sport:
        item.sport,

      title:
        item.title,

      durationMinutes:
        item.plannedDurationMinutes ??
        item.actualDurationMinutes ??
        0,

      intensity:
        "Completed",

      purpose:
        "",

      details:
        [],
    };
  }


  function formatCalendarDistance(
    item: WorkoutFeedback
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
      athlete.unitSystem ===
      "Imperial"
    ) {

      if (
        item.distanceUnit ===
        "m"
      ) {
        return `${
          Math.round(
            item.distance *
            1.0936133
          )
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


  const selectedPlannedSessions =
    plannedSessions.filter(
      (workout) =>
        workout.date ===
        selectedDate &&
        workout.durationMinutes >
          0 &&
        workout.sport !==
          "Rest"
    );


  const selectedFeedback =
    allFeedback
      .filter(
        (item) =>
          item.date ===
          selectedDate
      )
      .sort(
        (a, b) =>
          a.completedAt.localeCompare(
            b.completedAt
          )
      );


  const selectedRemainingPlannedSessions =
    selectedPlannedSessions.filter(
      (workout) =>
        !selectedFeedback.some(
          (feedback) =>
            workoutMatchesFeedback(
              workout,
              feedback
            )
        )
    );


  const normalSports =
    getWeeklyAllowedSportsForDate({
      athlete,
      date:
        selectedDate,
    });


  const resolved =
    resolveAvailabilityForDate({
      athlete,
      availability,
      date:
        selectedDate,
    });


  const isFuture =
    selectedDate >
    todayISO;


  const calendarDays =
    useMemo(
      () => {
        const year =
          cursorMonth.getFullYear();

        const month =
          cursorMonth.getMonth();

        const first =
          new Date(
            year,
            month,
            1
          );

        const mondayOffset =
          (
            first.getDay() +
            6
          ) % 7;

        const start =
          new Date(
            year,
            month,
            1 - mondayOffset
          );

        return Array.from(
          {
            length: 42,
          },
          (
            _,
            index
          ) => {
            const date =
              new Date(
                start
              );

            date.setDate(
              start.getDate() +
              index
            );

            return {
              date,
              iso:
                toLocalISO(
                  date
                ),
              inMonth:
                date.getMonth() ===
                month,
            };
          }
        );
      },
      [
        cursorMonth,
      ]
    );


  function toggleSport(
    sport:
      AvailabilitySport
  ) {
    setAllowedSports(
      (current) =>
        current.includes(
          sport
        )
          ? current.filter(
              (item) =>
                item !== sport
            )
          : [
              ...current,
              sport,
            ]
    );
  }


  function saveAvailability() {

    if (
      editorMode ===
      "normal"
    ) {
      onSaveAvailability(
        null,
        selectedDate
      );

      return;
    }

    if (
      editorMode ===
      "unavailable"
    ) {
      onSaveAvailability(
        {
          date:
            selectedDate,

          status:
            "Unavailable",

          note:
            note.trim() ||
            undefined,
        },
        selectedDate
      );

      return;
    }

    const parsedMax =
      Number(
        maxDuration
      );

    onSaveAvailability(
      {
        date:
          selectedDate,

        status:
          "Limited",

        allowedSports:
          allowedSports.length >
            0
            ? allowedSports
            : undefined,

        maxDurationMinutes:
          Number.isFinite(
            parsedMax
          ) &&
          parsedMax > 0
            ? Math.round(
                parsedMax
              )
            : undefined,

        note:
          note.trim() ||
          undefined,
      },
      selectedDate
    );
  }


  return (
    <div className="calendarPage">

      <header className="dashHeader calendarPageHeader">

        <div>
          <span className="eyebrow">
            CALENDAR
          </span>

          <h1>
            Training around real life.
          </h1>

          <p>
            Review what you did and tell Coach when future training needs to fit around your schedule.
          </p>
        </div>

      </header>


      <div className="calendarLayout">

        <section className="calendarBoard">

          <div className="calendarBoardTop">

            <div>
              <span className="eyebrow">
                MONTH
              </span>

              <h2>
                {
                  getMonthLabel(
                    cursorMonth
                  )
                }
              </h2>
            </div>


            <div className="calendarMonthActions">

              <button
                type="button"
                aria-label="Previous month"
                onClick={() =>
                  setCursorMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() - 1,
                        1
                      )
                  )
                }
              >
                ←
              </button>

              <button
                type="button"
                className="calendarTodayButton"
                onClick={() => {
                  const now =
                    new Date();

                  setCursorMonth(
                    new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      1
                    )
                  );

                  setSelectedDate(
                    todayISO
                  );
                }}
              >
                Today
              </button>

              <button
                type="button"
                aria-label="Next month"
                onClick={() =>
                  setCursorMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() + 1,
                        1
                      )
                  )
                }
              >
                →
              </button>

            </div>

          </div>


          <div className="calendarWeekdayRow">
            {WEEKDAYS.map(
              (day) => (
                <span key={day}>
                  {day}
                </span>
              )
            )}
          </div>


          <div className="calendarMonthGrid">

            {calendarDays.map(
              ({
                iso,
                date,
                inMonth,
              }) => {

                const feedback =
                  allFeedback.filter(
                    (item) =>
                      item.date ===
                      iso
                  );

                const planned =
                  plannedSessions.filter(
                    (workout) =>
                      workout.date ===
                        iso &&
                      workout
                        .durationMinutes >
                        0 &&
                      workout.sport !==
                        "Rest"
                  );

                const resolvedDayAvailability =
                  resolveAvailabilityForDate({
                    athlete,
                    availability,
                    date:
                      iso,
                  });

                const completedCount =
                  feedback.filter(
                    (item) =>
                      item.status ===
                        "Completed" ||
                      item.status ===
                        "Modified"
                  ).length;

                return (
                  <button
                    type="button"
                    key={
                      iso
                    }
                    onClick={() =>
                      setSelectedDate(
                        iso
                      )
                    }
                    className={[
                      "calendarDay",
                      !inMonth
                        ? "outsideMonth"
                        : "",
                      iso ===
                        todayISO
                        ? "today"
                        : "",
                      iso ===
                        selectedDate
                        ? "selected"
                        : "",
                      iso ===
                        targetRaceDate
                        ? "raceDay"
                        : "",
                      resolvedDayAvailability
                        .status ===
                        "Unavailable"
                        ? "unavailable"
                        : "",
                      resolvedDayAvailability
                        .status ===
                        "Limited"
                        ? "limited"
                        : "",
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        " "
                      )}
                  >

                    <div className="calendarDayTop">
                      <strong>
                        {
                          date.getDate()
                        }
                      </strong>

                      {iso >
                          todayISO &&
                        (
                          resolvedDayAvailability
                            .status ===
                            "Unavailable" ||
                          (
                            resolvedDayAvailability
                              .source ===
                              "calendar" &&
                            resolvedDayAvailability
                              .status ===
                              "Limited"
                          )
                        ) && (
                          <span
                            className="calendarOverrideMark"
                            title={
                              resolvedDayAvailability
                                .source ===
                                "calendar"
                                ? "Calendar override"
                                : "Unavailable"
                            }
                          >
                            {
                              resolvedDayAvailability
                                .status ===
                              "Unavailable"
                                ? "×"
                                : "!"
                            }
                          </span>
                        )}
                    </div>


                    <div className="calendarDaySignals">

                      {iso ===
                        targetRaceDate && (
                        <span
                          className="calendarRaceSignal"
                          title={
                            targetRaceLabel
                          }
                        >
                          RACE
                        </span>
                      )}

                      {completedCount >
                        0 && (
                        <span className="calendarCompletedSignal">
                          ✓{" "}
                          {
                            completedCount
                          }
                        </span>
                      )}


                      {planned
                        .slice(
                          0,
                          3
                        )
                        .map(
                          (
                            workout,
                            index
                          ) => (
                            <i
                              key={
                                workout.sessionId ??
                                `${iso}-${workout.sport}-${index}`
                              }
                              className={`calendarSportDot calendarSport${workout.sport}`}
                              title={
                                workout.title
                              }
                            />
                          )
                        )}

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </section>


        <aside className="calendarDayPanel">

          <div className="calendarSelectedHead">

            <span className="eyebrow">
              SELECTED DAY
            </span>

            <h2>
              {
                getLongDateLabel(
                  selectedDate
                )
              }
            </h2>

            <div
              className={[
                "calendarAvailabilityState",
                resolved.status.toLowerCase(),
              ].join(" ")}
            >
              <i />

              <span>
                {resolved.status ===
                  "Available"
                  ? "Available normally"
                  : resolved.status ===
                    "Unavailable"
                  ? "No training available"
                  : "Limited availability"}
              </span>

              <small>
                {resolved.source ===
                  "calendar"
                  ? "Calendar override"
                  : "Normal week"}
              </small>
            </div>

          </div>


          {selectedDate ===
            targetRaceDate && (
              <div className="calendarRaceDayCard">

                <span>
                  TARGET RACE
                </span>

                <strong>
                  {
                    targetRaceLabel
                  }
                </strong>

                <small>
                  Key season date · protected by Basse
                </small>

              </div>
            )}


          <div
            className={`calendarEffectiveAvailability ${
              resolvedAvailability.status ===
                "Unavailable"
                ? "blocked"
                : resolvedAvailability.status ===
                    "Limited"
                  ? "limited"
                  : "available"
            }`}
          >
            <div className="calendarEffectiveHeader">
              <div>
                <span>
                  AVAILABILITY
                </span>

                <strong>
                  {resolvedAvailability.status ===
                    "Unavailable"
                    ? "No training"
                    : resolvedAvailability.status ===
                        "Limited"
                      ? "Custom availability"
                      : "Normal availability"}
                </strong>
              </div>

              <small>
                {resolvedAvailability.source ===
                  "calendar"
                  ? "Calendar override"
                  : "Weekly baseline"}
              </small>
            </div>

            <div className="calendarEffectiveSports">
              {SPORTS.map(
                (sport) => {
                  const allowed =
                    resolvedAllowedSports.includes(
                      sport
                    );

                  return (
                    <span
                      key={sport}
                      className={
                        allowed
                          ? "allowed"
                          : "blocked"
                      }
                    >
                      <b>
                        {allowed
                          ? "✓"
                          : "×"}
                      </b>

                      {sport}
                    </span>
                  );
                }
              )}
            </div>

            {typeof resolvedAvailability
              .maxDurationMinutes ===
              "number" && (
              <small className="calendarEffectiveLimit">
                Max{" "}
                {
                  resolvedAvailability
                    .maxDurationMinutes
                }{" "}
                total minutes
              </small>
            )}
          </div>


          <div className="calendarDaySection">

            <span className="calendarSectionLabel">
              TRAINING
            </span>

            {selectedDate <=
              todayISO ? (

              selectedFeedback.length > 0 ||
              (
                selectedDate === todayISO &&
                selectedRemainingPlannedSessions.length > 0
              ) ? (

                <div className="calendarSessionList">

                  {selectedFeedback.map(
                    (
                      item
                    ) => {

                      const actualDistance =
                        formatCalendarDistance(
                          item
                        );

                      return (
                        <button
                          type="button"
                          className={[
                            "calendarHistorySession",
                            "calendarCompletedHistorySession",
                            item.status ===
                              "Modified"
                              ? "modified"
                              : item.status ===
                                  "Skipped"
                                ? "skipped"
                                : "completed",
                          ].join(" ")}
                          key={
                            item.id
                          }
                          onClick={() =>
                            onSelectWorkout(
                              getWorkoutForFeedback(
                                item
                              ),
                              false
                            )
                          }
                        >

                          <div className="calendarHistorySessionMain">

                            <div>
                              <span>
                                {
                                  item.sport
                                }
                              </span>

                              <strong>
                                {
                                  item.title
                                }
                              </strong>
                            </div>

                            <span className="calendarHistoryOpen">
                              View
                              <b aria-hidden="true">
                                →
                              </b>
                            </span>

                          </div>


                          <div className="calendarHistoryMetrics">

                            <span
                              className={[
                                "calendarHistoryStatus",
                                item.status.toLowerCase(),
                              ].join(" ")}
                            >
                              {item.status ===
                                "Modified"
                                ? "Completed · modified"
                                : item.status}
                            </span>


                            {item.status !==
                              "Skipped" &&
                              item.actualDurationMinutes !==
                                null && (
                                <span>
                                  {formatDuration(
                                    item.actualDurationMinutes
                                  )}
                                </span>
                              )}


                            {item.status !==
                              "Skipped" &&
                              actualDistance && (
                                <span>
                                  {actualDistance}
                                </span>
                              )}


                            {item.rpe !==
                              null && (
                                <span>
                                  RPE {item.rpe}
                                </span>
                              )}


                            {item.feeling && (
                              <span>
                                {item.feeling}
                              </span>
                            )}

                          </div>

                        </button>
                      );
                    }
                  )}


                  {selectedDate ===
                    todayISO &&
                    selectedRemainingPlannedSessions.map(
                      (
                        workout,
                        index
                      ) => (
                        <button
                          type="button"
                          className="calendarPlannedSession calendarSessionButton"
                          key={
                            workout.sessionId ??
                            `${selectedDate}-${workout.sport}-${workout.title}-${index}`
                          }
                          onClick={() =>
                            onSelectWorkout(
                              workout,
                              false
                            )
                          }
                        >

                          <div>
                            <span>
                              {
                                workout.sport
                              }
                            </span>

                            <strong>
                              {
                                workout.title
                              }
                            </strong>
                          </div>

                          <small>
                            {
                              workout.durationMinutes
                            } min
                            <b aria-hidden="true">
                              →
                            </b>
                          </small>

                        </button>
                      )
                    )}

                </div>

              ) : (
                <p className="calendarEmptyCopy">
                  {selectedDate ===
                  todayISO
                    ? "No training currently planned."
                    : "No logged training on this date."}
                </p>
              )

            ) : selectedPlannedSessions
                .length > 0 ? (

              <div className="calendarSessionList">

                {selectedPlannedSessions.map(
                  (
                    workout,
                    index
                  ) => (
                    <button
                      type="button"
                      className="calendarPlannedSession calendarSessionButton"
                      key={
                        workout.sessionId ??
                        `${selectedDate}-${workout.title}-${index}`
                      }
                      onClick={() =>
                        onSelectWorkout(
                          workout,
                          isNextWeekPreviewWorkout(
                            workout
                          )
                        )
                      }
                    >

                      <div>
                        <span>
                          {
                            workout.sport
                          }
                        </span>

                        <strong>
                          {
                            workout.title
                          }
                        </strong>
                      </div>

                      <small>
                        {
                          workout.durationMinutes
                        } min
                        <b aria-hidden="true">
                          →
                        </b>
                      </small>

                    </button>
                  )
                )}

              </div>

            ) : (
              <p className="calendarEmptyCopy">
                No training currently planned.
              </p>
            )}

          </div>


          {isFuture &&
          selectedDate !==
            targetRaceDate ? (

            <div
              className="calendarAvailabilityEditor"
              aria-busy={
                selectedDateIsAdapting
              }
            >

              <div className="calendarEditorHead">
                <span className="calendarSectionLabel">
                  OVERRIDE THIS DATE
                </span>

                {selectedDateIsAdapting ? (
                  <span
                    role="status"
                    aria-live="polite"
                  >
                    Basse adapting…
                  </span>
                ) : explicitOverride ? (
                  <span>
                    Override active
                  </span>
                ) : null}
              </div>


              <div className="calendarModeChoices">

                <button
                  type="button"
                  className={
                    editorMode ===
                    "normal"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setEditorMode(
                      "normal"
                    )
                  }
                >
                  <strong>
                    Use normal
                  </strong>

                  <span>
                    Follow your usual weekly availability.
                  </span>
                </button>


                <button
                  type="button"
                  className={
                    editorMode ===
                    "unavailable"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setEditorMode(
                      "unavailable"
                    )
                  }
                >
                  <strong>
                    Cannot train
                  </strong>

                  <span>
                    Block all training on this date.
                  </span>
                </button>


                <button
                  type="button"
                  className={
                    editorMode ===
                    "custom"
                      ? "selected"
                      : ""
                  }
                  onClick={() => {
                    setEditorMode(
                      "custom"
                    );

                    if (
                      allowedSports
                        .length === 0
                    ) {
                      setAllowedSports(
                        normalSports.length >
                          0
                          ? normalSports
                          : [...SPORTS]
                      );
                    }
                  }}
                >
                  <strong>
                    Custom
                  </strong>

                  <span>
                    Choose disciplines or limit training time.
                  </span>
                </button>

              </div>


              {editorMode ===
                "custom" && (

                <div className="calendarCustomEditor">

                  <span className="calendarEditorSubLabel">
                    DISCIPLINES AVAILABLE
                  </span>

                  <div className="calendarSportChoices">

                    {SPORTS.map(
                      (
                        sport
                      ) => (
                        <button
                          type="button"
                          key={
                            sport
                          }
                          className={
                            allowedSports.includes(
                              sport
                            )
                              ? "selected"
                              : ""
                          }
                          onClick={() =>
                            toggleSport(
                              sport
                            )
                          }
                        >
                          <i />

                          {
                            sport
                          }
                        </button>
                      )
                    )}

                  </div>


                  <label className="calendarField">

                    <span>
                      Maximum total training
                    </span>

                    <div>
                      <input
                        type="number"
                        min="1"
                        step="5"
                        placeholder="No limit"
                        value={
                          maxDuration
                        }
                        onChange={(
                          event
                        ) =>
                          setMaxDuration(
                            event
                              .target
                              .value
                          )
                        }
                      />

                      <small>
                        min
                      </small>
                    </div>

                  </label>

                </div>
              )}


              {editorMode !==
                "normal" && (

                <label className="calendarNoteField">

                  <span>
                    Optional note
                  </span>

                  <textarea
                    rows={3}
                    placeholder="e.g. travelling until 16:00"
                    value={
                      note
                    }
                    onChange={(
                      event
                    ) =>
                      setNote(
                        event.target
                          .value
                      )
                    }
                  />

                </label>

              )}


              <button
                type="button"
                className="calendarSaveButton"
                onClick={
                  saveAvailability
                }
              >
                {selectedDateIsAdapting
                  ? "Save newer change"
                  : editorMode ===
                      "normal"
                    ? explicitOverride
                      ? "Remove override"
                      : "Use normal availability"
                    : "Save availability"}
              </button>

            </div>

          ) : (

            <div className="calendarPastNotice">
              {selectedDate ===
                targetRaceDate
                ? "Race day is protected. Change the target race from your race settings instead."
                : "Availability overrides can be added to future dates."}
            </div>

          )}

        </aside>

      </div>

    </div>
  );
}
