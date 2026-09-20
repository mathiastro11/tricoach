"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  TrainingArchiveWeek,
  WorkoutFeedback,
} from "@/types/training";


type TrainingHistoryProps = {
  archive: TrainingArchiveWeek[];
  currentFeedback: WorkoutFeedback[];
};

type MetricMode =
  | "time"
  | "distance";

type RangeMode =
  | "weeks"
  | "months";

type SportName =
  | "Swim"
  | "Bike"
  | "Run"
  | "Strength"
  | "Other";

type SportFilter =
  | "All"
  | SportName;

type Bucket = {
  key: string;
  label: string;
  values: Record<
    SportName,
    number
  >;
};


const SPORTS: SportName[] = [
  "Swim",
  "Bike",
  "Run",
  "Strength",
  "Other",
];


function progressSport(
  sport: string
): SportName {
  if (
    sport === "Swim" ||
    sport === "Bike" ||
    sport === "Run" ||
    sport === "Strength"
  ) {
    return sport;
  }

  return "Other";
}


function entryDate(
  entry: WorkoutFeedback
) {
  return (
    entry.date ??
    entry.completedAt.slice(
      0,
      10
    )
  );
}


function dateAtNoon(
  iso: string
) {
  return new Date(
    `${iso}T12:00:00`
  );
}


function monday(
  date: Date
) {
  const result =
    new Date(date);

  result.setHours(
    12,
    0,
    0,
    0
  );

  const day =
    result.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      diff
  );

  return result;
}


function isoDate(
  date: Date
) {
  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
}


function monthKey(
  date: Date
) {
  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
  ].join("-");
}


function canonicalDistanceKm({
  distance,
  distanceUnit,
}: {
  distance:
    | number
    | null
    | undefined;

  distanceUnit:
    | "km"
    | "m"
    | null
    | undefined;
}) {
  if (
    distance === null ||
    distance === undefined
  ) {
    return 0;
  }

  return distanceUnit === "m"
    ? distance / 1000
    : distance;
}


function distanceKm(
  entry: WorkoutFeedback
) {
  return canonicalDistanceKm({
    distance:
      entry.distance,

    distanceUnit:
      entry.distanceUnit,
  });
}


type ProgressContribution = {
  sport: SportName;
  minutes: number;
  distance: number;
};


/*
  A connected multi-discipline workout remains ONE
  completed session, but contributes training volume
  separately to each discipline.

  Example:
  90 min Bike + 30 min Run brick
  => Bike +90 min
  => Run  +30 min

  Overall weekly/monthly time still comes from the
  top-level feedback duration so the workout is never
  double-counted.
*/
function progressContributions(
  entry: WorkoutFeedback
): ProgressContribution[] {

  const splits =
    entry.disciplineSplits?.filter(
      (split) =>
        split.sport === "Swim" ||
        split.sport === "Bike" ||
        split.sport === "Run"
    ) ?? [];


  if (splits.length > 0) {
    return splits.map(
      (split) => ({
        sport:
          progressSport(
            split.sport
          ),

        minutes:
          split.actualDurationMinutes ??
          0,

        distance:
          canonicalDistanceKm({
            distance:
              split.distance,

            distanceUnit:
              split.distanceUnit,
          }),
      })
    );
  }


  return [
    {
      sport:
        progressSport(
          entry.sport
        ),

      minutes:
        entry.actualDurationMinutes ??
        0,

      distance:
        distanceKm(entry),
    },
  ];
}


function compactTime(
  minutes: number
) {
  if (minutes <= 0) {
    return "0h";
  }

  const hours =
    minutes / 60;

  if (hours < 1) {
    return `${Math.round(
      minutes
    )}m`;
  }

  return `${Number(
    hours.toFixed(1)
  )}h`;
}


function compactDistance(
  km: number
) {
  if (km <= 0) {
    return "0 km";
  }

  if (km < 10) {
    return `${Number(
      km.toFixed(1)
    )} km`;
  }

  return `${Math.round(
    km
  )} km`;
}


function blankSportValues() {
  return {
    Swim: 0,
    Bike: 0,
    Run: 0,
    Strength: 0,
    Other: 0,
  };
}


function getIsoWeek(
  date: Date
) {
  const temp =
    new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
    );

  const day =
    temp.getUTCDay() || 7;

  temp.setUTCDate(
    temp.getUTCDate() +
      4 -
      day
  );

  const yearStart =
    new Date(
      Date.UTC(
        temp.getUTCFullYear(),
        0,
        1
      )
    );

  return Math.ceil(
    (
      (
        temp.getTime() -
        yearStart.getTime()
      ) /
        86400000 +
      1
    ) /
      7
  );
}


export default function TrainingHistory({
  archive,
  currentFeedback,
}: TrainingHistoryProps) {

  const [
    metricMode,
    setMetricMode,
  ] =
    useState<MetricMode>(
      "time"
    );

  const [
    rangeMode,
    setRangeMode,
  ] =
    useState<RangeMode>(
      "weeks"
    );

  const [
    sportFilter,
    setSportFilter,
  ] =
    useState<SportFilter>(
      "All"
    );

  const [
    selectedBucketKey,
    setSelectedBucketKey,
  ] =
    useState<string | null>(
      null
    );


  const completed =
    useMemo(
      () => {

        const unique =
          new Map<
            string,
            WorkoutFeedback
          >();

        archive
          .flatMap(
            (week) =>
              week.feedback ?? []
          )
          .concat(
            currentFeedback
          )
          .forEach(
            (entry) => {
              unique.set(
                entry.id,
                entry
              );
            }
          );

        return Array.from(
          unique.values()
        )
          .filter(
            (entry) =>
              entry.status ===
                "Completed" ||
              entry.status ===
                "Modified"
          )
          .sort(
            (a, b) =>
              entryDate(a)
                .localeCompare(
                  entryDate(b)
                )
          );

      },
      [
        archive,
        currentFeedback,
      ]
    );


  const now =
    new Date();

  now.setHours(
    12,
    0,
    0,
    0
  );


  const currentWeekStart =
    monday(now);

  const currentMonthKey =
    monthKey(now);


  const weekEntries =
    completed.filter(
      (entry) =>
        dateAtNoon(
          entryDate(entry)
        ) >=
        currentWeekStart
    );


  const monthEntries =
    completed.filter(
      (entry) =>
        entryDate(entry)
          .slice(0, 7) ===
        currentMonthKey
    );


  function totalMinutes(
    entries: WorkoutFeedback[]
  ) {
    return entries.reduce(
      (sum, entry) =>
        sum +
        (
          entry.actualDurationMinutes ??
          0
        ),
      0
    );
  }


  const weekMinutes =
    totalMinutes(
      weekEntries
    );

  const monthMinutes =
    totalMinutes(
      monthEntries
    );

  const allMinutes =
    totalMinutes(
      completed
    );


  const sportStats =
    SPORTS.map(
      (sport) => {

        const contributions =
          completed.flatMap(
            progressContributions
          )
          .filter(
            (item) =>
              item.sport === sport
          );

        return {
          sport,

          minutes:
            contributions.reduce(
              (sum, item) =>
                sum +
                item.minutes,
              0
            ),

          distance:
            contributions.reduce(
              (sum, item) =>
                sum +
                item.distance,
              0
            ),
        };
      }
    );


  const buildWeeklyBuckets =
    useCallback((
      mode: MetricMode
    ) => {
    const buckets:
      Bucket[] = [];

    const current =
      monday(
        new Date()
      );

    for (
      let offset = 7;
      offset >= 0;
      offset -= 1
    ) {

      const start =
        new Date(current);

      start.setDate(
        start.getDate() -
          offset * 7
      );

      const end =
        new Date(start);

      end.setDate(
        end.getDate() + 7
      );

      const values =
        blankSportValues();

      completed.forEach(
        (entry) => {

          const date =
            dateAtNoon(
              entryDate(entry)
            );

          if (
            date < start ||
            date >= end
          ) {
            return;
          }

          progressContributions(
            entry
          ).forEach(
            (item) => {
              values[
                item.sport
              ] +=
                mode === "time"
                  ? item.minutes
                  : item.distance;
            }
          );
        }
      );

      buckets.push({
        key:
          isoDate(start),

        label:
          offset === 0
            ? "Now"
            : `W${getIsoWeek(
                start
              )}`,

        values,
      });
    }

    return buckets;
    }, [
      completed,
    ]);


  const buildMonthlyBuckets =
    useCallback((
      mode: MetricMode
    ) => {
    const buckets:
      Bucket[] = [];

    const today =
      new Date();

    today.setHours(
      12,
      0,
      0,
      0
    );

    for (
      let offset = 5;
      offset >= 0;
      offset -= 1
    ) {

      const date =
        new Date(
          today.getFullYear(),
          today.getMonth() -
            offset,
          1,
          12
        );

      const key =
        monthKey(date);

      const values =
        blankSportValues();

      completed.forEach(
        (entry) => {

          if (
            entryDate(entry)
              .slice(0, 7) !==
              key
          ) {
            return;
          }

          progressContributions(
            entry
          ).forEach(
            (item) => {
              values[
                item.sport
              ] +=
                mode === "time"
                  ? item.minutes
                  : item.distance;
            }
          );
        }
      );

      buckets.push({
        key,

        label:
          date.toLocaleDateString(
            "en-GB",
            {
              month:
                "short",
            }
          ),

        values,
      });
    }

    return buckets;
    }, [
      completed,
    ]);


  const weeklyBuckets =
    useMemo(
      () =>
        buildWeeklyBuckets(
          metricMode
        ),
      [
        buildWeeklyBuckets,
        metricMode,
      ]
    );


  const monthlyBuckets =
    useMemo(
      () =>
        buildMonthlyBuckets(
          metricMode
        ),
      [
        buildMonthlyBuckets,
        metricMode,
      ]
    );


  const timeWeeklyBuckets =
    useMemo(
      () =>
        buildWeeklyBuckets(
          "time"
        ),
      [
        buildWeeklyBuckets,
      ]
    );


  const buckets =
    rangeMode ===
    "weeks"
      ? weeklyBuckets
      : monthlyBuckets;


  const visibleSports =
    sportFilter === "All"
      ? SPORTS.filter(
          (sport) =>
            metricMode ===
              "time" ||
            sport !==
              "Strength"
        )
      : [
          sportFilter,
        ];


  const bucketTotals =
    buckets.map(
      (bucket) =>
        visibleSports.reduce(
          (sum, sport) =>
            sum +
            bucket.values[sport],
          0
        )
    );


  const maxBucket =
    Math.max(
      1,
      ...bucketTotals
    );


  const activeBucketCount =
    bucketTotals.filter(
      (total) =>
        total > 0
    ).length;


  const chartMaxBarHeight =
    activeBucketCount <= 1
      ? 108
      : activeBucketCount <= 2
        ? 128
        : 150;


  const selectedBucket =
    buckets.find(
      (bucket) =>
        bucket.key ===
        selectedBucketKey
    ) ??
    buckets[
      buckets.length - 1
    ];


  const selectedBucketTotal =
    selectedBucket
      ? visibleSports.reduce(
          (sum, sport) =>
            sum +
            selectedBucket
              .values[sport],
          0
        )
      : 0;


  const bestWeek =
    timeWeeklyBuckets.reduce(
      (
        best,
        bucket
      ) => {

        const total =
          SPORTS.reduce(
            (
              sum,
              sport
            ) =>
              sum +
              bucket.values[
                sport
              ],
            0
          );

        if (
          !best ||
          total >
            best.total
        ) {
          return {
            label:
              bucket.label,
            total,
          };
        }

        return best;
      },
      null as
        | {
            label: string;
            total: number;
          }
        | null
    );


  const monthSessionCount =
    monthEntries.length;


  if (
    completed.length === 0
  ) {
    return (
      <section className="completedProgressEmpty">

        <span className="eyebrow">
          PROGRESS
        </span>

        <h2>
          No completed training yet.
        </h2>

        <p>
          Logged sessions will appear here.
        </p>

      </section>
    );
  }


  return (
    <section className="completedProgress">

      <div className="completedProgressSummary">

        <div>
          <span>
            THIS WEEK
          </span>

          <strong>
            {compactTime(
              weekMinutes
            )}
          </strong>
        </div>

        <div>
          <span>
            THIS MONTH
          </span>

          <strong>
            {compactTime(
              monthMinutes
            )}
          </strong>
        </div>

        <div>
          <span>
            ALL TIME
          </span>

          <strong>
            {compactTime(
              allMinutes
            )}
          </strong>
        </div>

      </div>


      <section
        className={[
          "completedProgressChartCard",
          activeBucketCount <= 2
            ? "lowData"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >

        <div className="completedProgressChartHead">

          <div>
            <span className="eyebrow">
              TRAINING VOLUME
            </span>

            <h2>
              {metricMode ===
              "time"
                ? "Time trained"
                : "Distance covered"}
            </h2>
          </div>


          <div className="completedProgressControls">

            <div className="completedProgressToggle">

              <button
                type="button"
                className={
                  metricMode ===
                  "time"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMetricMode(
                    "time"
                  )
                }
              >
                Time
              </button>

              <button
                type="button"
                className={
                  metricMode ===
                  "distance"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setMetricMode(
                    "distance"
                  );

                  if (
                    sportFilter ===
                    "Strength"
                  ) {
                    setSportFilter(
                      "All"
                    );
                  }
                }}
              >
                Distance
              </button>

            </div>


            <div className="completedProgressToggle">

              <button
                type="button"
                className={
                  rangeMode ===
                  "weeks"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setRangeMode(
                    "weeks"
                  );
                  setSelectedBucketKey(
                    null
                  );
                }}
              >
                Weeks
              </button>

              <button
                type="button"
                className={
                  rangeMode ===
                  "months"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setRangeMode(
                    "months"
                  );
                  setSelectedBucketKey(
                    null
                  );
                }}
              >
                Months
              </button>

            </div>

          </div>

        </div>


        <div className="completedProgressSportFilter">

          {(
            metricMode ===
            "distance"
              ? [
                  "All",
                  "Swim",
                  "Bike",
                  "Run",
                  "Other",
                ]
              : [
                  "All",
                  ...SPORTS,
                ]
          ).map(
            (sport) => (
              <button
                type="button"
                key={sport}
                className={[
                  sportFilter ===
                    sport
                    ? "active"
                    : "",
                  sport
                    .toLowerCase(),
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  setSportFilter(
                    sport as
                      SportFilter
                  );
                  setSelectedBucketKey(
                    null
                  );
                }}
              >
                {sport !==
                  "All" && (
                  <i />
                )}

                {sport}
              </button>
            )
          )}

        </div>


        <div
          className={[
            "completedProgressChart",
            rangeMode ===
              "weeks"
              ? "weeks"
              : "months",
          ].join(" ")}
        >

          {buckets.map(
            (
              bucket,
              index
            ) => {

              const total =
                bucketTotals[index];

              const barHeight =
                total <= 0
                  ? 3
                  : Math.max(
                      10,
                      Math.round(
                        (
                          total /
                          maxBucket
                        ) *
                          chartMaxBarHeight
                      )
                    );

              const selected =
                selectedBucket?.key ===
                bucket.key;

              return (
                <button
                  type="button"
                  className={[
                    "completedProgressColumn",
                    selected
                      ? "selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={
                    bucket.key
                  }
                  onClick={() =>
                    setSelectedBucketKey(
                      bucket.key
                    )
                  }
                >

                  <span className="completedProgressValue">

                    {metricMode ===
                    "time"
                      ? compactTime(
                          total
                        )
                      : compactDistance(
                          total
                        )}

                  </span>


                  <div className="completedProgressBarArea">

                    <div
                      className="completedProgressStack"
                      style={{
                        height:
                          `${barHeight}px`,
                      }}
                    >

                      {visibleSports.map(
                        (sport) => {

                          const value =
                            bucket.values[
                              sport
                            ];

                          if (
                            value <= 0
                          ) {
                            return null;
                          }

                          const share =
                            total > 0
                              ? (
                                  value /
                                  total
                                ) *
                                100
                              : 0;

                          return (
                            <div
                              key={
                                sport
                              }
                              className={`completedProgressSegment ${sport.toLowerCase()}`}
                              style={{
                                height:
                                  `${share}%`,
                              }}
                            />
                          );
                        }
                      )}

                    </div>

                  </div>

                  <strong>
                    {bucket.label}
                  </strong>

                </button>
              );
            }
          )}

        </div>


        {selectedBucket && (
          <div className="completedProgressSelected">

            <div className="completedProgressSelectedTotal">

              <span>
                {selectedBucket.label}
              </span>

              <strong>
                {metricMode ===
                "time"
                  ? compactTime(
                      selectedBucketTotal
                    )
                  : compactDistance(
                      selectedBucketTotal
                    )}
              </strong>

            </div>


            <div className="completedProgressSelectedSports">

              {visibleSports.map(
                (sport) => (
                  <div
                    key={sport}
                    className={[
                      sport.toLowerCase(),
                      selectedBucket
                        .values[sport] <= 0
                        ? "empty"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span>
                      <i />
                      {sport}
                    </span>

                    <strong>
                      {metricMode ===
                      "time"
                        ? compactTime(
                            selectedBucket
                              .values[
                              sport
                            ]
                          )
                        : compactDistance(
                            selectedBucket
                              .values[
                              sport
                            ]
                          )}
                    </strong>
                  </div>
                )
              )}

            </div>

          </div>
        )}

      </section>


      <section className="completedProgressExtras">

        <article>
          <span>
            SESSIONS THIS MONTH
          </span>

          <strong>
            {monthSessionCount}
          </strong>

          <small>
            completed workouts
          </small>
        </article>


        <article>
          <span>
            BEST RECENT WEEK
          </span>

          <strong>
            {bestWeek
              ? compactTime(
                  bestWeek.total
                )
              : "—"}
          </strong>

          <small>
            {bestWeek
              ? bestWeek.label
              : "no data yet"}
          </small>
        </article>

      </section>


      <div className="completedProgressSectionHead">

        <div>
          <span className="eyebrow">
            BY DISCIPLINE
          </span>

          <h2>
            All-time totals
          </h2>
        </div>

      </div>


      <section className="completedProgressSports">

        {sportStats.map(
          (sport) => (
            <article
              key={
                sport.sport
              }
              className={`completedProgressSport ${sport.sport.toLowerCase()}`}
            >

              <div>
                <span>
                  {sport.sport}
                </span>

                <i />
              </div>

              <strong>
                {compactTime(
                  sport.minutes
                )}
              </strong>

              <small>
                {sport.sport ===
                "Strength"
                  ? "completed"
                  : compactDistance(
                      sport.distance
                    )}
              </small>

            </article>
          )
        )}

      </section>

    </section>
  );
}
