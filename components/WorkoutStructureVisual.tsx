"use client";

import type {
  TrainingPlanDay,
} from "@/types/training";

import {
  formatDuration,
} from "@/lib/format-duration";

import {
  buildWorkoutStructureSegments,
} from "@/lib/workout-structure-ui";


type SegmentKind =
  | "warmup"
  | "easy"
  | "work"
  | "recovery"
  | "steady"
  | "cooldown";


type Segment = {
  label: string;
  minutes: number;
  displayLabel?: string;
  effort: number;

  /*
    V2 canonical segments can define their own sport.

    Optional here because legacy details[] fallback segments
    still inherit the workout-level sport.
  */
  sport?:
    | "Swim"
    | "Bike"
    | "Run"
    | "Strength";

  groupIndex?: number;
  groupSummary?: string;
  recoverySummary?: string;

  kind: SegmentKind;
};


type Props = {
  workout: TrainingPlanDay;

  /*
    "full" is used in Workout Details.

    "today" is reserved for the Today screen so the
    exact same parsing and workout visualization can
    be reused there later without duplicating logic.
  */
  variant?: "full" | "today";
};


function parseMinutes(
  text: string
) {
  const match =
    text.match(
      /(\d+(?:[.,]\d+)?)\s*(?:min|mins|minute|minutes)\b/i
    );

  if (!match) {
    return null;
  }

  const value =
    Number(
      match[1].replace(
        ",",
        "."
      )
    );

  return Number.isFinite(value)
    ? value
    : null;
}


function inferEffort(
  text: string
) {
  const lower =
    text.toLowerCase();

  const rpe =
    lower.match(
      /\brpe\s*([1-9]|10)\b/i
    );

  if (rpe) {
    return Number(
      rpe[1]
    );
  }

  if (
    /sprint|vo2|maximal|anaerobic/.test(
      lower
    )
  ) {
    return 9;
  }

  if (
    /threshold|zone 4|z4|hard/.test(
      lower
    )
  ) {
    return 8;
  }

  if (
    /tempo|zone 3|z3|strong/.test(
      lower
    )
  ) {
    return 7;
  }

  if (
    /zone 2|z2|endurance|aerobic|steady/.test(
      lower
    )
  ) {
    return 5;
  }

  if (
    /recovery|very easy|easy|zone 1|z1/.test(
      lower
    )
  ) {
    return 3;
  }

  return 5;
}


function buildSegments(
  workout: TrainingPlanDay
): Segment[] {
  const structuredSegments =
    buildWorkoutStructureSegments(
      workout
    );

  /*
    New workouts:
    workoutStructure is the source of truth.

    Old saved workouts:
    continue into the legacy details[] parser below.
  */
  if (
    structuredSegments.length > 0
  ) {
    return structuredSegments;
  }

  const segments: Segment[] =
    [];

  if (
    workout.durationMinutes <= 0
  ) {
    return segments;
  }


  for (
    const raw
    of workout.details ?? []
  ) {
    const detail =
      raw
        .replace(
          /^[-–—•\s]+/,
          ""
        )
        .trim();

    const lower =
      detail.toLowerCase();


    /*
      Examples:
      6 x 3 min hard, 2 min easy
      4 × 5 min threshold with 2 min recovery
    */
    const repeat =
      detail.match(
        /(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(?:min|mins|minute|minutes)\b/i
      );

    if (repeat) {
      const count =
        Number(
          repeat[1]
        );

      const workMinutes =
        Number(
          repeat[2].replace(
            ",",
            "."
          )
        );

      const rest =
        detail.match(
          /(\d+(?:[.,]\d+)?)\s*(?:min|mins|minute|minutes)[^.;]*(?:easy|recovery|recover|rest|jog|spin)/i
        );

      const recoveryMinutes =
        rest
          ? Number(
              rest[1].replace(
                ",",
                "."
              )
            )
          : null;


      for (
        let i = 0;
        i < count;
        i += 1
      ) {
        segments.push({
          label:
            count <= 4
              ? `Work ${i + 1}`
              : "Work",

          minutes:
            workMinutes,

          effort:
            Math.max(
              6,
              inferEffort(
                detail
              )
            ),

          kind:
            "work",
        });


        if (
          recoveryMinutes &&
          i < count - 1
        ) {
          segments.push({
            label:
              "Easy",

            minutes:
              recoveryMinutes,

            effort:
              2.5,

            kind:
              "recovery",
          });
        }
      }

      continue;
    }


    const minutes =
      parseMinutes(
        detail
      );

    if (!minutes) {
      continue;
    }


    if (
      /warm[\s-]?up|easy start/.test(
        lower
      )
    ) {
      segments.push({
        label:
          "Warm-up",

        minutes,

        effort:
          3,

        kind:
          "warmup",
      });

      continue;
    }


    if (
      /cool[\s-]?down|easy finish|warm down/.test(
        lower
      )
    ) {
      segments.push({
        label:
          "Cool-down",

        minutes,

        effort:
          2.5,

        kind:
          "cooldown",
      });

      continue;
    }


    if (
      /recovery|recover|easy jog|rest/.test(
        lower
      )
    ) {
      segments.push({
        label:
          "Recovery",

        minutes,

        effort:
          2.5,

        kind:
          "recovery",
      });

      continue;
    }


    if (
      /very easy|easy riding|easy ride|easy spin|easy pedaling|easy pedalling|gentle spin|light spin/.test(
        lower
      )
    ) {
      segments.push({
        label:
          "Easy",

        minutes,

        effort:
          Math.min(
            inferEffort(
              detail
            ),
            3
          ),

        kind:
          "easy",
      });

      continue;
    }


    const effort =
      inferEffort(
        detail
      );

    segments.push({
      label:
        /threshold/.test(
          lower
        )
          ? "Threshold"
          : /tempo|zone 3|z3/.test(
              lower
            )
            ? "Tempo"
            : /zone 2|z2/.test(
                lower
              )
              ? "Zone 2"
              : "Main work",

      minutes,

      effort,

      kind:
        effort >= 7
          ? "work"
          : "steady",
    });
  }


  /*
    Fallback for workouts where details do not
    contain explicit durations.
  */
  if (
    segments.length === 0
  ) {
    const total =
      workout.durationMinutes;

    const text =
      [
        workout.title,
        workout.intensity,
        workout.purpose,
        ...(workout.details ?? []),
      ]
        .join(" ")
        .toLowerCase();

    const edge =
      Math.max(
        5,
        Math.min(
          15,
          Math.round(
            total * 0.15
          )
        )
      );

    const main =
      Math.max(
        1,
        total -
        edge * 2
      );

    return [
      {
        label:
          "Warm-up",

        minutes:
          edge,

        effort:
          3,

        kind:
          "warmup",
      },
      {
        label:
          /threshold/.test(
            text
          )
            ? "Threshold"
            : /tempo/.test(
                text
              )
              ? "Tempo"
              : /recovery/.test(
                  text
                )
                ? "Easy"
                : "Main work",

        minutes:
          main,

        effort:
          inferEffort(
            text
          ),

        kind:
          inferEffort(
            text
          ) >= 7
            ? "work"
            : "steady",
      },
      {
        label:
          "Cool-down",

        minutes:
          edge,

        effort:
          2.5,

        kind:
          "cooldown",
      },
    ];
  }


  return segments;
}


function sportClass(
  sport: string
) {
  const lower =
    sport.toLowerCase();

  if (
    lower.includes(
      "swim"
    )
  ) {
    return "swim";
  }

  if (
    lower.includes(
      "bike"
    )
  ) {
    return "bike";
  }

  if (
    lower.includes(
      "run"
    )
  ) {
    return "run";
  }

  if (
    lower.includes(
      "strength"
    )
  ) {
    return "strength";
  }

  return "other";
}


export default function WorkoutStructureVisual({
  workout,
  variant = "full",
}: Props) {

  if (
    workout.durationMinutes <= 0 ||
    workout.sport === "Rest" ||
    workout.sport === "Strength"
  ) {
    return null;
  }


  const segments =
    buildSegments(
      workout
    );


  const segmentSports =
    new Set(
      segments.map(
        (segment) =>
          segment.sport ??
          workout.sport
      )
    );

  const isBrickVisual =
    segmentSports.has("Bike") &&
    segmentSports.has("Run");


  const segmentKinds =
    new Set(
      segments.map(
        (segment) =>
          segment.kind
      )
    );


  const groupedSegments =
    Array.from(
      segments.reduce(
        (
          groups,
          segment,
          index
        ) => {

          const key =
            segment.groupIndex ??
            index;

          const existing =
            groups.get(
              key
            );

          if (existing) {
            existing.segments.push(
              segment
            );

            existing.total +=
              segment.minutes;

            return groups;
          }

          groups.set(
            key,
            {
              key,

              summary:
                segment.groupSummary ??
                segment.displayLabel ??
                "",

              recoverySummary:
                segment.recoverySummary,

              segments: [
                segment,
              ],

              total:
                segment.minutes,
            }
          );

          return groups;
        },
        new Map<
          number,
          {
            key: number;
            summary: string;
            recoverySummary?: string;
            segments: Segment[];
            total: number;
          }
        >()
      ).values()
    );


  const total =
    segments.reduce(
      (
        sum,
        segment
      ) =>
        sum +
        segment.minutes,
      0
    );


  /*
    Do not draw a decorative graph when there is
    no meaningful structure to visualize.
  */
  if (
    segments.length < 2 ||
    total <= 0
  ) {
    return null;
  }


  return (
    <div
      className={[
        "workoutStructureVisual",
        `workoutStructureVisual-${sportClass(
          workout.sport
        )}`,
        variant === "today"
          ? "workoutStructureVisualToday"
          : "workoutStructureVisualFull",
      ].join(" ")}
    >

      <div className="workoutStructureVisualHead">

        <div>
          <span>
            {isBrickVisual
              ? "BRICK MAP"
              : "SESSION MAP"}
          </span>

          <strong>
            Your workout at a glance
          </strong>
        </div>

        <small>
          {formatDuration(
            workout.durationMinutes
          )}
        </small>

      </div>


      <div
        className="workoutStructureTrack"
        style={{
          alignItems:
            "stretch",

          gap:
            "8px",

          /*
            Many canonical blocks may need slightly more
            horizontal room than the modal provides.

            Scrolling is preferable to overlapping groups.
          */
          overflowX:
            "auto",

          overflowY:
            "hidden",

          paddingBottom:
            "3px",
        }}
      >

        {groupedSegments.map(
          (
            group,
            groupIndex
          ) => {

            return (
              <div
                key={
                  group.key
                }
                style={{
                  flexGrow:
                    group.total,

                  flexBasis:
                    0,

                  minWidth:
                    "58px",

                  flexShrink:
                    0,

                  overflow:
                    "hidden",

                  paddingLeft:
                    groupIndex > 0
                      ? "8px"
                      : undefined,

                  borderLeft:
                    groupIndex > 0
                      ? "1px solid rgba(30, 35, 27, .18)"
                      : undefined,

                  display:
                    "flex",

                  flexDirection:
                    "column",

                  justifyContent:
                    "flex-end",
                }}
              >

                {group.summary && (
                  <strong
                    style={{
                      display:
                        "block",

                      textAlign:
                        "center",

                      fontSize:
                        ".68rem",

                      lineHeight:
                        1.15,

                      marginBottom:
                        "5px",

                      whiteSpace:
                        "nowrap",

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      maxWidth:
                        "100%",
                    }}
                  >
                    {group.summary}
                  </strong>
                )}


                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "flex-end",

                    gap:
                      "2px",

                    minHeight:
                      "80px",
                  }}
                >

                  {group.segments.map(
                    (
                      segment,
                      index
                    ) => {

                      const visualEffort =
                        segment.kind === "warmup"
                          ? Math.min(
                              segment.effort,
                              2.8
                            )
                          : segment.kind === "easy"
                            ? Math.min(
                                segment.effort,
                                2.8
                              )
                            : segment.kind === "recovery"
                              ? Math.min(
                                  segment.effort,
                                  2.2
                                )
                              : segment.kind === "cooldown"
                                ? Math.min(
                                    segment.effort,
                                    2.4
                                  )
                                : segment.kind === "work"
                                  ? Math.max(
                                      segment.effort,
                                      6
                                    )
                                  : Math.max(
                                      segment.effort,
                                      4.5
                                    );


                      const height =
                        16 +
                        (
                          visualEffort /
                          10
                        ) *
                          62;


                      return (
                        <div
                          key={
                            `${group.key}-${index}`
                          }
                          className={[
                            "workoutStructureSegment",
                            `workoutStructureSegment-${segment.kind}`,
                            `workoutStructureSegmentSport-${sportClass(
                              segment.sport ??
                              workout.sport
                            )}`,
                          ].join(" ")}
                          style={{
                            flexGrow:
                              segment.minutes,

                            flexBasis:
                              0,

                            minWidth:
                              "3px",
                          }}
                          title={
                            segment.displayLabel ??
                            ""
                          }
                        >

                          <div
                            className="workoutStructureBar"
                            style={{
                              height:
                                `${height}px`,
                            }}
                          />

                        </div>
                      );
                    }
                  )}

                </div>


                {group.recoverySummary && (
                  <small
                    style={{
                      display:
                        "block",

                      textAlign:
                        "center",

                      marginTop:
                        "5px",

                      fontSize:
                        ".62rem",

                      opacity:
                        .66,

                      whiteSpace:
                        "nowrap",

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      maxWidth:
                        "100%",
                    }}
                  >
                    {group.recoverySummary}
                  </small>
                )}

              </div>
            );
          }
        )}

      </div>


      <div className="workoutStructureLegend">

        {isBrickVisual ? (
          <>
            <span>
              <i
                style={{
                  background:
                    "#e3ae36",
                  opacity:
                    1,
                }}
              />
              Bike
            </span>

            <span>
              <i
                style={{
                  background:
                    "#6fbe44",
                  opacity:
                    1,
                }}
              />
              Run
            </span>

            <span>
              <i className="recovery" />
              Recovery
            </span>
          </>
        ) : (
          <>
            {segmentKinds.has(
              "warmup"
            ) && (
              <span>
                <i className="warmup" />
                Warm-up
              </span>
            )}

            {(
              segmentKinds.has(
                "work"
              ) ||
              segmentKinds.has(
                "steady"
              ) ||
              segmentKinds.has(
                "easy"
              )
            ) && (
              <span>
                <i className="work" />
                Main
              </span>
            )}

            {segmentKinds.has(
              "recovery"
            ) && (
              <span>
                <i className="recovery" />
                Recovery
              </span>
            )}

            {segmentKinds.has(
              "cooldown"
            ) && (
              <span>
                <i className="cooldown" />
                Cool-down
              </span>
            )}
          </>
        )}

      </div>

    </div>
  );
}
