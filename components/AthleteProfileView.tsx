"use client";

import {
  TRIATHLON_EXPERIENCE_OPTIONS,
  DISCIPLINE_LEVEL_OPTIONS,
  PERFORMANCE_TIER_OPTIONS,
} from "@/lib/athlete-capability";

import {
  useState,
} from "react";

import type {
  Athlete,
} from "@/types/training";


type Props = {
  athlete: Athlete;

  onSave: (
    athlete: Athlete
  ) => void;

  onCancel: () => void;
};


type WeeklyAvailability =
  NonNullable<
    Athlete["weeklyAvailability"]
  >;

type AvailabilitySport =
  keyof WeeklyAvailability;

type Weekday =
  WeeklyAvailability["Swim"][number];

type LevelField =
  | "swimLevel"
  | "bikeLevel"
  | "runLevel";

type DisciplineLevel =
  Athlete["swimLevel"];


const weekdayValues: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];


const weekdayLabels: {
  day: Weekday;
  short: string;
}[] = [
  { day: "Monday", short: "MO" },
  { day: "Tuesday", short: "TU" },
  { day: "Wednesday", short: "WE" },
  { day: "Thursday", short: "TH" },
  { day: "Friday", short: "FR" },
  { day: "Saturday", short: "SA" },
  { day: "Sunday", short: "SU" },
];


const goals: Athlete["goal"][] = [
  "Sprint",
  "Olympic",
  "70.3",
  "Ironman",
];


const experiences =
  TRIATHLON_EXPERIENCE_OPTIONS;


const performanceTiers =
  PERFORMANCE_TIER_OPTIONS;


const weakestDisciplines:
  Athlete["weakestDiscipline"][] = [
    "Swimming",
    "Cycling",
    "Running",
  ];


const disciplineLevels:
  readonly DisciplineLevel[] =
    DISCIPLINE_LEVEL_OPTIONS;


const availabilitySports:
  AvailabilitySport[] = [
    "Swim",
    "Bike",
    "Run",
    "Strength",
  ];


function isWeekday(
  value: string
): value is Weekday {
  return weekdayValues.some(
    (day) =>
      day === value
  );
}


function cloneAthlete(
  athlete: Athlete
): Athlete {
  return {
    ...athlete,

    availableDays:
      [...athlete.availableDays],

    weeklyAvailability:
      athlete.weeklyAvailability
        ? {
            Swim:
              [
                ...athlete
                  .weeklyAvailability
                  .Swim,
              ],

            Bike:
              [
                ...athlete
                  .weeklyAvailability
                  .Bike,
              ],

            Run:
              [
                ...athlete
                  .weeklyAvailability
                  .Run,
              ],

            Strength:
              [
                ...athlete
                  .weeklyAvailability
                  .Strength,
              ],
          }
        : undefined,
  };
}


function formatMinutes(
  value: string
) {
  const minutes =
    Number(value) || 0;

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remaining =
    minutes % 60;

  return remaining > 0
    ? `${hours} h ${remaining} min`
    : `${hours} h`;
}


export default function AthleteProfileView({
  athlete,
  onSave,
  onCancel,
}: Props) {

  const [
    draft,
    setDraft,
  ] =
    useState<Athlete>(
      () =>
        cloneAthlete(
          athlete
        )
    );


  function getLegacyDays(
    current: Athlete
  ): Weekday[] {
    return current
      .availableDays
      .filter(
        isWeekday
      );
  }


  function getAvailableDays(
    sport: AvailabilitySport
  ): Weekday[] {
    const weekly =
      draft.weeklyAvailability;

    if (weekly) {
      return weekly[sport];
    }

    return getLegacyDays(
      draft
    );
  }


  function toggleAvailableDay(
    sport: AvailabilitySport,
    day: Weekday
  ) {

    setDraft(
      (current) => {

        const fallback =
          getLegacyDays(
            current
          );


        const currentWeekly:
          WeeklyAvailability =
            current.weeklyAvailability
              ? {
                  Swim:
                    [
                      ...current
                        .weeklyAvailability
                        .Swim,
                    ],

                  Bike:
                    [
                      ...current
                        .weeklyAvailability
                        .Bike,
                    ],

                  Run:
                    [
                      ...current
                        .weeklyAvailability
                        .Run,
                    ],

                  Strength:
                    [
                      ...current
                        .weeklyAvailability
                        .Strength,
                    ],
                }
              : {
                  Swim:
                    [...fallback],

                  Bike:
                    [...fallback],

                  Run:
                    [...fallback],

                  Strength:
                    [...fallback],
                };


        const currentDays =
          currentWeekly[
            sport
          ];


        const nextDays =
          currentDays.includes(
            day
          )
            ? currentDays.filter(
                (item) =>
                  item !== day
              )
            : [
                ...currentDays,
                day,
              ];


        const nextWeekly:
          WeeklyAvailability = {
            ...currentWeekly,
            [sport]:
              nextDays,
          };


        const legacyDays =
          weekdayValues.filter(
            (weekday) =>
              nextWeekly.Swim.includes(
                weekday
              ) ||
              nextWeekly.Bike.includes(
                weekday
              ) ||
              nextWeekly.Run.includes(
                weekday
              ) ||
              nextWeekly.Strength.includes(
                weekday
              )
          );


        return {
          ...current,

          weeklyAvailability:
            nextWeekly,

          availableDays:
            legacyDays,
        };
      }
    );
  }


  function setDisciplineLevel(
    field: LevelField,
    level: DisciplineLevel
  ) {
    setDraft(
      (current) => ({
        ...current,
        [field]: level,
      })
    );
  }


  return (
    <div className="athleteProfileV1">

      <header className="athleteProfileHeader">

        <button
          type="button"
          className="athleteProfileBack"
          onClick={onCancel}
        >
          ← Settings
        </button>


        <div className="athleteProfileHeading">

          <span>
            ATHLETE
          </span>

          <h1>
            Your profile
          </h1>

          <p>
            The inputs your coach uses
            to shape your training.
          </p>

        </div>


        <button
          type="button"
          className="athleteProfileHeaderSave"
          disabled={
            !draft.name.trim()
          }
          onClick={() =>
            onSave(draft)
          }
        >
          Save
        </button>

      </header>



      <div className="athleteProfileContent">


        <section className="athleteProfileSection">

          <div className="athleteProfileSectionTitle">
            <span>01</span>

            <div>
              <strong>Basics</strong>
              <small>Identity and goal</small>
            </div>
          </div>


          <div className="athleteProfileGrid athleteProfileGridTwo">

            <label className="athleteProfileField">

              <span>NAME</span>

              <input
                value={
                  draft.name
                }
                placeholder="Your name"
                onChange={(event) =>
                  setDraft(
                    (current) => ({
                      ...current,
                      name:
                        event.target.value,
                    })
                  )
                }
              />

            </label>


            <div className="athleteProfileField">

              <span>
                RACE FORMAT
              </span>

              <div className="athleteProfileChoiceRow">

                {goals.map(
                  (goal) => (

                    <button
                      key={goal}
                      type="button"
                      className={
                        draft.goal === goal
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setDraft(
                          (current) => ({
                            ...current,
                            goal,
                          })
                        )
                      }
                    >
                      {goal}
                    </button>

                  )
                )}

              </div>

            </div>

          </div>

        </section>



        <section className="athleteProfileSection">

          <div className="athleteProfileSectionTitle">
            <span>02</span>

            <div>
              <strong>Training</strong>
              <small>Weekly capacity</small>
            </div>
          </div>


          <div className="athleteProfileSliderGrid">

            <div className="athleteProfileSlider">

              <div>
                <span>AVAILABLE</span>

                <strong>
                  {draft.hoursPerWeek} h/week
                </strong>
              </div>

              <input
                type="range"
                min="2"
                max="25"
                step="0.5"
                value={
                  draft.hoursPerWeek
                }
                onChange={(event) =>
                  setDraft(
                    (current) => ({
                      ...current,

                      hoursPerWeek:
                        event.target.value,
                    })
                  )
                }
              />

            </div>


            <div className="athleteProfileSlider">

              <div>
                <span>
                  CURRENT LOAD
                </span>

                <strong>
                  {draft.currentTrainingHours} h/week
                </strong>
              </div>

              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={
                  draft.currentTrainingHours
                }
                onChange={(event) =>
                  setDraft(
                    (current) => ({
                      ...current,

                      currentTrainingHours:
                        event.target.value,
                    })
                  )
                }
              />

            </div>

          </div>


          <div className="athleteProfileSubgroup">

            <span className="athleteProfileLabel">
              EXPERIENCE
            </span>

            <div className="athleteProfileChoiceRow athleteProfileChoiceThree">

              {experiences.map(
                (experience) => (

                  <button
                    key={experience}
                    type="button"
                    className={
                      draft.experience ===
                      experience
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setDraft(
                        (current) => ({
                          ...current,
                          experience,
                        })
                      )
                    }
                  >
                    {experience}
                  </button>

                )
              )}

            </div>

          </div>

          <div className="athleteProfileSubgroup">

            <span className="athleteProfileLabel">
              PERFORMANCE TIER
            </span>

            <div className="athleteProfileChoiceRow athleteProfileChoiceThree">

              {performanceTiers.map(
                (tier) => (

                  <button
                    key={tier}
                    type="button"
                    className={
                      (
                        draft.performanceTier ??
                        "Recreational"
                      ) === tier
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setDraft(
                        (current) => ({
                          ...current,

                          performanceTier:
                            tier,
                        })
                      )
                    }
                  >
                    {tier}
                  </button>

                )
              )}

            </div>

          </div>


        </section>



        <section className="athleteProfileSection">

          <div className="athleteProfileSectionTitle">
            <span>03</span>

            <div>
              <strong>Disciplines</strong>
              <small>Current confidence</small>
            </div>
          </div>


          <div className="athleteProfileWeakness">

            <span>
              NEEDS MOST WORK
            </span>

            <div className="athleteProfileChoiceRow athleteProfileChoiceThree">

              {weakestDisciplines.map(
                (discipline) => (

                  <button
                    key={discipline}
                    type="button"
                    className={
                      draft.weakestDiscipline ===
                      discipline
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setDraft(
                        (current) => ({
                          ...current,

                          weakestDiscipline:
                            discipline,
                        })
                      )
                    }
                  >
                    {discipline}
                  </button>

                )
              )}

            </div>

          </div>


          <div className="athleteProfileLevels">

            {[
              {
                label: "SWIM",
                field:
                  "swimLevel" as LevelField,
              },
              {
                label: "BIKE",
                field:
                  "bikeLevel" as LevelField,
              },
              {
                label: "RUN",
                field:
                  "runLevel" as LevelField,
              },
            ].map(
              ({
                label,
                field,
              }) => (

                <div
                  key={field}
                  className="athleteProfileLevelRow"
                >

                  <strong>
                    {label}
                  </strong>

                  <div>

                    {disciplineLevels.map(
                      (level) => (

                        <button
                          key={level}
                          type="button"
                          className={
                            draft[field] ===
                            level
                              ? "selected"
                              : ""
                          }
                          onClick={() =>
                            setDisciplineLevel(
                              field,
                              level
                            )
                          }
                        >
                          {level}
                        </button>

                      )
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        </section>



        <section className="athleteProfileSection">

          <div className="athleteProfileSectionTitle">
            <span>04</span>

            <div>
              <strong>
                Weekly availability
              </strong>

              <small>
                Normal training week
              </small>
            </div>
          </div>


          <div className="athleteProfileAvailability">

            {availabilitySports.map(
              (sport) => (

                <div
                  key={sport}
                  className="athleteProfileAvailabilityRow"
                >

                  <strong>
                    {sport.toUpperCase()}
                  </strong>


                  <div>

                    {weekdayLabels.map(
                      ({
                        day,
                        short,
                      }) => {

                        const active =
                          getAvailableDays(
                            sport
                          ).includes(
                            day
                          );


                        return (
                          <button
                            key={`${sport}-${day}`}
                            type="button"
                            aria-pressed={
                              active
                            }
                            className={
                              active
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              toggleAvailableDay(
                                sport,
                                day
                              )
                            }
                          >
                            {short}
                          </button>
                        );

                      }
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        </section>



        <section className="athleteProfileSection">

          <div className="athleteProfileSectionTitle">
            <span>05</span>

            <div>
              <strong>
                Long sessions
              </strong>

              <small>
                Maximum usual session
              </small>
            </div>
          </div>


          <div className="athleteProfileSlider">

            <div>
              <span>
                LONGEST SESSION
              </span>

              <strong>
                {formatMinutes(
                  draft.longestSessionMinutes
                )}
              </strong>
            </div>

            <input
              type="range"
              min="45"
              max="480"
              step="15"
              value={
                draft.longestSessionMinutes
              }
              onChange={(event) =>
                setDraft(
                  (current) => ({
                    ...current,

                    longestSessionMinutes:
                      event.target.value,
                  })
                )
              }
            />

          </div>

        </section>



        <section className="athleteProfileSection">

          <div className="athleteProfileSectionTitle">
            <span>06</span>

            <div>
              <strong>Equipment</strong>
              <small>Training access</small>
            </div>
          </div>


          <div className="athleteProfileEquipment">

            <button
              type="button"
              className={
                draft.poolAccess
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setDraft(
                  (current) => ({
                    ...current,

                    poolAccess:
                      !current.poolAccess,
                  })
                )
              }
            >
              Pool access
            </button>


            <button
              type="button"
              className={
                draft.indoorTrainer
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setDraft(
                  (current) => ({
                    ...current,

                    indoorTrainer:
                      !current.indoorTrainer,
                  })
                )
              }
            >
              Indoor trainer
            </button>


            <button
              type="button"
              className={
                draft.gymAccess
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setDraft(
                  (current) => ({
                    ...current,

                    gymAccess:
                      !current.gymAccess,
                  })
                )
              }
            >
              Gym access
            </button>

          </div>

        </section>



        <section className="athleteProfileSection">

          <div className="athleteProfileSectionTitle">
            <span>07</span>

            <div>
              <strong>Coach notes</strong>
              <small>Important constraints</small>
            </div>
          </div>


          <label className="athleteProfileField">

            <span>
              LIMITATIONS
            </span>

            <textarea
              value={
                draft.limitations
              }
              placeholder="Injuries, schedule restrictions, open-water concerns..."
              onChange={(event) =>
                setDraft(
                  (current) => ({
                    ...current,

                    limitations:
                      event.target.value,
                  })
                )
              }
            />

          </label>

        </section>

      </div>



      <footer className="athleteProfileFooter">

        <button
          type="button"
          className="athleteProfileCancel"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="athleteProfileSave"
          disabled={
            !draft.name.trim()
          }
          onClick={() =>
            onSave(draft)
          }
        >
          Save changes
        </button>

      </footer>

    </div>
  );
}
