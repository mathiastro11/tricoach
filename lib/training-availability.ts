import type {
  Athlete,
  AvailabilitySport,
  TrainingAvailability,
  TrainingPlan,
  TrainingPlanDay,
  TrainingWeekday,
  WeeklyTrainingAvailability,
} from "@/types/training";


export type ResolvedTrainingAvailability = {
  date: string;

  source:
    | "calendar"
    | "weekly";

  status:
    | "Available"
    | "Limited"
    | "Unavailable";

  allowedSports:
    AvailabilitySport[];

  maxDurationMinutes?: number;

  note?: string;
};


export type AvailabilityViolation = {
  date: string;
  day: string;
  sessionId?: string;
  title?: string;

  type:
    | "UNAVAILABLE_DAY"
    | "SPORT_NOT_ALLOWED"
    | "DAILY_DURATION_EXCEEDED";

  message: string;
};


export const TRAINING_WEEKDAYS:
  TrainingWeekday[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];


export const DEFAULT_WEEKLY_TRAINING_AVAILABILITY:
  WeeklyTrainingAvailability = {
    Swim: [...TRAINING_WEEKDAYS],
    Bike: [...TRAINING_WEEKDAYS],
    Run: [...TRAINING_WEEKDAYS],
    Strength: [...TRAINING_WEEKDAYS],
  };


const AVAILABILITY_SPORTS:
  AvailabilitySport[] = [
    "Swim",
    "Bike",
    "Run",
    "Strength",
  ];


/*
  Availability is date-specific.

  Never fall back to recurring weekday matching here.
*/
export function getTrainingWeekdayForDate(
  date: string
): TrainingWeekday | null {

  const parsed =
    new Date(
      `${date}T12:00:00`
    );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  const index =
    parsed.getDay();

  const map:
    TrainingWeekday[] = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

  return (
    map[index] ??
    null
  );
}


export function getWeeklyAllowedSportsForDate({
  athlete,
  date,
}: {
  athlete:
    | Pick<
        Athlete,
        "weeklyAvailability" |
        "availableDays"
      >
    | null
    | undefined;

  date: string;
}): AvailabilitySport[] {

  const weekday =
    getTrainingWeekdayForDate(
      date
    );

  if (!weekday) {
    return [];
  }

  const weekly =
    normalizeWeeklyTrainingAvailability(
      athlete?.weeklyAvailability,
      athlete?.availableDays
    );

  return AVAILABILITY_SPORTS.filter(
    (sport) =>
      weekly[
        sport
      ].includes(
        weekday
      )
  );
}


export function getAvailabilityForDate(
  availability: TrainingAvailability[],
  date: string | undefined
) {
  if (!date) {
    return null;
  }

  return (
    availability.find(
      (entry) =>
        entry.date === date
    ) ?? null
  );
}


export function normalizeWeeklyTrainingAvailability(
  weekly:
    | WeeklyTrainingAvailability
    | null
    | undefined,
  legacyAvailableDays?: string[]
): WeeklyTrainingAvailability {

  const legacy =
    Array.isArray(
      legacyAvailableDays
    )
      ? legacyAvailableDays.filter(
          (
            day
          ): day is TrainingWeekday =>
            TRAINING_WEEKDAYS.includes(
              day as TrainingWeekday
            )
        )
      : [];

  /*
    Existing athletes do not yet have the
    discipline-specific structure.

    Their old availableDays therefore becomes
    the safe baseline for every discipline.
  */
  const fallback =
    legacy.length > 0
      ? legacy
      : TRAINING_WEEKDAYS;

  const normalizeDays = (
    days:
      | TrainingWeekday[]
      | undefined
  ) => {

    if (!Array.isArray(days)) {
      return [
        ...fallback,
      ];
    }

    return Array.from(
      new Set(
        days.filter(
          (
            day
          ): day is TrainingWeekday =>
            TRAINING_WEEKDAYS.includes(
              day as TrainingWeekday
            )
        )
      )
    );
  };

  return {
    Swim:
      normalizeDays(
        weekly?.Swim
      ),

    Bike:
      normalizeDays(
        weekly?.Bike
      ),

    Run:
      normalizeDays(
        weekly?.Run
      ),

    Strength:
      normalizeDays(
        weekly?.Strength
      ),
  };
}


export function normalizeTrainingAvailability(
  entries: TrainingAvailability[]
) {
  const byDate =
    new Map<
      string,
      TrainingAvailability
    >();

  for (const entry of entries) {
    if (
      !entry ||
      typeof entry.date !== "string" ||
      !entry.date.trim()
    ) {
      continue;
    }

    const allowedSports =
      Array.isArray(
        entry.allowedSports
      )
        ? entry.allowedSports.filter(
            (
              sport
            ): sport is AvailabilitySport =>
              AVAILABILITY_SPORTS.includes(
                sport as AvailabilitySport
              )
          )
        : undefined;

    const rawMax =
      Number(
        entry.maxDurationMinutes
      );

    const maxDurationMinutes =
      Number.isFinite(rawMax) &&
      rawMax > 0
        ? Math.round(rawMax)
        : undefined;

    byDate.set(
      entry.date,
      {
        date:
          entry.date,

        status:
          entry.status ===
            "Unavailable" ||
          entry.status ===
            "Limited"
            ? entry.status
            : "Available",

        allowedSports:
          allowedSports &&
          allowedSports.length > 0
            ? Array.from(
                new Set(
                  allowedSports
                )
              )
            : undefined,

        maxDurationMinutes,

        note:
          typeof entry.note ===
            "string" &&
          entry.note.trim()
            ? entry.note.trim()
            : undefined,
      }
    );
  }

  return Array.from(
    byDate.values()
  ).sort(
    (a, b) =>
      a.date.localeCompare(
        b.date
      )
  );
}


function textOfSession(
  workout: TrainingPlanDay
) {
  return [
    workout.sport,
    workout.title,
    workout.purpose,
    workout.intensity,
    ...(workout.details ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}


/*
  A session can touch more than one discipline.

  This matters for Brick and race-specific sessions:
  "Run unavailable" must also block a Bike + Run brick.
*/
export function getSessionDisciplines(
  workout: TrainingPlanDay
): AvailabilitySport[] {

  if (
    workout.durationMinutes <= 0 ||
    workout.sport === "Rest"
  ) {
    return [];
  }

  const rawSport =
    workout.sport
      .trim()
      .toLowerCase();

  const text =
    textOfSession(
      workout
    );

  const disciplines:
    AvailabilitySport[] = [];

  /*
    Never return early based only on the main sport.

    A workout stored as sport="Bike" may still be a
    Bike + Run brick, so title/purpose/details must also
    be inspected before availability is resolved.
  */
  if (
    rawSport === "swim"
  ) {
    disciplines.push("Swim");
  }

  if (
    rawSport === "bike" ||
    rawSport === "cycling"
  ) {
    disciplines.push("Bike");
  }

  if (
    rawSport === "run"
  ) {
    disciplines.push("Run");
  }

  if (
    rawSport === "strength" ||
    rawSport === "gym"
  ) {
    disciplines.push("Strength");
  }

  if (
    /\bswim(?:ming)?\b/.test(
      text
    )
  ) {
    disciplines.push(
      "Swim"
    );
  }

  if (
    /\b(?:bike|cycling|ride)\b/.test(
      text
    )
  ) {
    disciplines.push(
      "Bike"
    );
  }

  /*
    Do not classify a Bike or Swim workout as Run just
    because its coaching text happens to mention running.

    Run is inferred from text only when:
    - the stored sport is already Run, or
    - the session explicitly contains a transition run.

    True Brick detection below still adds Bike + Run.
  */
  if (
    rawSport === "run" ||
    /\btransition\s+run\b/.test(
      text
    )
  ) {
    disciplines.push(
      "Run"
    );
  }

  if (
    /\b(?:strength|gym)\b/.test(
      text
    )
  ) {
    disciplines.push(
      "Strength"
    );
  }

  /*
    Brick is conservatively treated as Bike + Run.

    This protects against workouts where the main sport
    is stored as Bike but the secondary run is only
    implied by the word "brick".
  */
  if (
    /\bbrick\b/.test(
      text
    ) ||
    /\bbrick\b/.test(
      rawSport
    )
  ) {
    disciplines.push(
      "Bike",
      "Run"
    );
  }

  /*
    Race / triathlon sessions can involve all three
    endurance disciplines.
  */
  if (
    workout.isRaceDay ||
    /\btriathlon\b/.test(
      rawSport
    ) ||
    /\btriathlon\b/.test(
      text
    )
  ) {
    disciplines.push(
      "Swim",
      "Bike",
      "Run"
    );
  }

  return Array.from(
    new Set(
      disciplines
    )
  );
}

/*
  Final availability truth for one calendar date.

  Priority:
  1. explicit Calendar override
  2. recurring weekly discipline availability

  A Calendar override may be either more restrictive
  OR more permissive than the normal weekly baseline.
*/
export function resolveAvailabilityForDate({
  athlete,
  availability,
  date,
}: {
  athlete:
    | Pick<
        Athlete,
        "weeklyAvailability" |
        "availableDays"
      >
    | null
    | undefined;

  availability:
    TrainingAvailability[];

  date: string;
}): ResolvedTrainingAvailability {

  const override =
    getAvailabilityForDate(
      normalizeTrainingAvailability(
        availability
      ),
      date
    );

  if (override) {

    if (
      override.status ===
      "Unavailable"
    ) {
      return {
        date,
        source:
          "calendar",
        status:
          "Unavailable",
        allowedSports:
          [],
        maxDurationMinutes:
          override.maxDurationMinutes,
        note:
          override.note,
      };
    }

    if (
      override.status ===
      "Limited"
    ) {
      return {
        date,
        source:
          "calendar",
        status:
          "Limited",

        /*
          Explicit sports = exact date-specific whitelist.

          If no sports were supplied, only the other
          limitation such as maxDurationMinutes applies.
        */
        allowedSports:
          override.allowedSports?.length
            ? [
                ...override.allowedSports,
              ]
            : [
                ...AVAILABILITY_SPORTS,
              ],

        maxDurationMinutes:
          override.maxDurationMinutes,

        note:
          override.note,
      };
    }

    /*
      Explicit Available is an intentional Calendar
      override and may reopen a date that is normally
      restricted by the recurring weekly baseline.
    */
    return {
      date,
      source:
        "calendar",
      status:
        "Available",
      allowedSports:
        [
          ...AVAILABILITY_SPORTS,
        ],
      maxDurationMinutes:
        override.maxDurationMinutes,
      note:
        override.note,
    };
  }

  const allowedSports =
    getWeeklyAllowedSportsForDate({
      athlete,
      date,
    });

  if (
    allowedSports.length === 0
  ) {
    return {
      date,
      source:
        "weekly",
      status:
        "Unavailable",
      allowedSports:
        [],
    };
  }

  if (
    allowedSports.length ===
      AVAILABILITY_SPORTS.length
  ) {
    return {
      date,
      source:
        "weekly",
      status:
        "Available",
      allowedSports,
    };
  }

  return {
    date,
    source:
      "weekly",
    status:
      "Limited",
    allowedSports,
  };
}


export function isSessionAllowedByAvailability({
  workout,
  availability,
}: {
  workout: TrainingPlanDay;
  availability:
    | TrainingAvailability
    | null
    | undefined;
}) {

  if (
    !availability ||
    workout.durationMinutes <= 0 ||
    workout.sport === "Rest"
  ) {
    return true;
  }

  if (
    availability.status ===
    "Unavailable"
  ) {
    return false;
  }

  if (
    availability.status !==
      "Limited" ||
    !availability.allowedSports ||
    availability.allowedSports.length ===
      0
  ) {
    return true;
  }

  const disciplines =
    getSessionDisciplines(
      workout
    );

  /*
    Unknown custom sport:
    do not falsely claim it is permitted when a hard
    discipline whitelist exists.
  */
  if (
    disciplines.length === 0
  ) {
    return false;
  }

  return disciplines.every(
    (sport) =>
      availability.allowedSports?.includes(
        sport
      )
  );
}


function resolveSessionDate(
  workout: TrainingPlanDay,
  plan: TrainingPlan
) {
  if (workout.date) {
    return workout.date;
  }

  /*
    Additional sessions should normally have dates,
    but preserve compatibility with older stored plans.
  */
  return (
    plan.days.find(
      (day) =>
        day.day ===
        workout.day
    )?.date ??
    undefined
  );
}


export function validatePlanAgainstAvailability({
  plan,
  availability,
}: {
  plan: TrainingPlan;
  availability: TrainingAvailability[];
}) {

  const constraints =
    normalizeTrainingAvailability(
      availability
    );

  const violations:
    AvailabilityViolation[] = [];

  if (
    constraints.length === 0
  ) {
    return {
      valid: true,
      violations,
    };
  }

  const sessions = [
    ...plan.days,
    ...(plan.additionalSessions ?? []),
  ].filter(
    (workout) =>
      workout.durationMinutes > 0 &&
      workout.sport !== "Rest"
  );

  const sessionsByDate =
    new Map<
      string,
      TrainingPlanDay[]
    >();

  for (const workout of sessions) {
    const date =
      resolveSessionDate(
        workout,
        plan
      );

    if (!date) {
      continue;
    }

    const existing =
      sessionsByDate.get(
        date
      ) ?? [];

    existing.push(
      workout
    );

    sessionsByDate.set(
      date,
      existing
    );
  }

  for (
    const constraint
    of constraints
  ) {

    const daySessions =
      sessionsByDate.get(
        constraint.date
      ) ?? [];

    if (
      daySessions.length === 0
    ) {
      continue;
    }

    if (
      constraint.status ===
      "Unavailable"
    ) {
      for (
        const workout
        of daySessions
      ) {
        violations.push({
          date:
            constraint.date,

          day:
            workout.day,

          sessionId:
            workout.sessionId,

          title:
            workout.title,

          type:
            "UNAVAILABLE_DAY",

          message:
            `${constraint.date} is unavailable for training, but "${workout.title}" is scheduled.`,
        });
      }

      /*
        No need to additionally report sport restrictions
        on a fully unavailable day.
      */
      continue;
    }

    if (
      constraint.status ===
        "Limited" &&
      constraint.allowedSports &&
      constraint.allowedSports.length >
        0
    ) {
      for (
        const workout
        of daySessions
      ) {
        if (
          isSessionAllowedByAvailability({
            workout,
            availability:
              constraint,
          })
        ) {
          continue;
        }

        const disciplines =
          getSessionDisciplines(
            workout
          );

        violations.push({
          date:
            constraint.date,

          day:
            workout.day,

          sessionId:
            workout.sessionId,

          title:
            workout.title,

          type:
            "SPORT_NOT_ALLOWED",

          message:
            `"${workout.title}" uses ${
              disciplines.length > 0
                ? disciplines.join(" + ")
                : workout.sport
            }, which is not allowed on ${constraint.date}.`,
        });
      }
    }

    if (
      typeof constraint
        .maxDurationMinutes ===
        "number"
    ) {
      const totalMinutes =
        daySessions.reduce(
          (
            total,
            workout
          ) =>
            total +
            workout.durationMinutes,
          0
        );

      if (
        totalMinutes >
        constraint.maxDurationMinutes
      ) {
        violations.push({
          date:
            constraint.date,

          day:
            daySessions[0]
              ?.day ??
            constraint.date,

          type:
            "DAILY_DURATION_EXCEEDED",

          message:
            `${constraint.date} allows a maximum of ${constraint.maxDurationMinutes} min, but ${totalMinutes} min is scheduled.`,
        });
      }
    }
  }

  return {
    valid:
      violations.length ===
      0,

    violations,
  };
}


export function buildWeeklyAvailabilityGuidance(
  athlete:
    | Pick<
        Athlete,
        "weeklyAvailability" |
        "availableDays"
      >
    | null
    | undefined
) {
  const weekly =
    normalizeWeeklyTrainingAvailability(
      athlete?.weeklyAvailability,
      athlete?.availableDays
    );

  return [
    "NORMAL WEEKLY DISCIPLINE AVAILABILITY:",
    `Swim: ${weekly.Swim.length ? weekly.Swim.join(", ") : "None"}`,
    `Bike: ${weekly.Bike.length ? weekly.Bike.join(", ") : "None"}`,
    `Run: ${weekly.Run.length ? weekly.Run.join(", ") : "None"}`,
    `Strength: ${weekly.Strength.length ? weekly.Strength.join(", ") : "None"}`,
    "",
    "This is the athlete's normal recurring availability.",
    "A date-specific Calendar override always takes priority.",
    "Availability controls WHERE sessions may be placed. It is NOT a weekly volume or session-count cap.",
    "Multiple sessions on the same available day are allowed when appropriate, up to the product limit of 3 real workouts per day.",
    "For high-volume experienced athletes, use doubles and occasional three-session days when needed to meet an appropriate training load.",
  ].join("\n");
}


export function buildAvailabilityGuidance(
  availability: TrainingAvailability[]
) {
  const constraints =
    normalizeTrainingAvailability(
      availability
    );

  if (
    constraints.length === 0
  ) {
    return [
      "CALENDAR AVAILABILITY:",
      "No date-specific training restrictions supplied.",
    ].join("\n");
  }

  const lines =
    constraints.map(
      (entry) => {

        if (
          entry.status ===
          "Unavailable"
        ) {
          return [
            `${entry.date}: UNAVAILABLE`,
            "No training may be scheduled.",
            entry.note
              ? `Context: ${entry.note}`
              : null,
          ]
            .filter(Boolean)
            .join(" ");
        }

        if (
          entry.status ===
          "Limited"
        ) {
          const parts = [
            `${entry.date}: LIMITED.`,
          ];

          if (
            entry.allowedSports?.length
          ) {
            parts.push(
              `Allowed disciplines only: ${entry.allowedSports.join(", ")}.`
            );
          }

          if (
            entry.maxDurationMinutes
          ) {
            parts.push(
              `Maximum total training: ${entry.maxDurationMinutes} minutes.`
            );
          }

          if (entry.note) {
            parts.push(
              `Context: ${entry.note}`
            );
          }

          return parts.join(
            " "
          );
        }

        return `${entry.date}: Available normally.`;
      }
    );

  return [
    "CALENDAR AVAILABILITY — HARD CONSTRAINTS:",
    "These restrictions override normal session placement and soft training preferences.",
    ...lines,
  ].join("\n");
}



/*
  Validate a whole plan against the FINAL availability
  truth for each calendar date.

  Priority is handled by resolveAvailabilityForDate():

  Calendar override
      ↓
  weekly discipline baseline
      ↓
  final hard constraint

  This is the validator UI actions should use.
*/
export function validatePlanAgainstResolvedAvailability({
  plan,
  athlete,
  availability,
}: {
  plan: TrainingPlan;

  athlete:
    | Pick<
        Athlete,
        "weeklyAvailability" |
        "availableDays"
      >
    | null
    | undefined;

  availability: TrainingAvailability[];
}) {

  const allSessions = [
    ...plan.days,
    ...(plan.additionalSessions ?? []),
  ];

  const dates =
    Array.from(
      new Set(
        allSessions
          .map(
            (workout) =>
              resolveSessionDate(
                workout,
                plan
              )
          )
          .filter(
            (
              date
            ): date is string =>
              !!date
          )
      )
    );

  const effectiveConstraints:
    TrainingAvailability[] =
      dates.map(
        (date) => {
          const resolved =
            resolveAvailabilityForDate({
              athlete,
              availability,
              date,
            });

          if (
            resolved.status ===
            "Unavailable"
          ) {
            return {
              date,
              status:
                "Unavailable",
            };
          }

          if (
            resolved.status ===
            "Limited"
          ) {
            return {
              date,
              status:
                "Limited",

              allowedSports:
                resolved.allowedSports,

              maxDurationMinutes:
                resolved.maxDurationMinutes,

              note:
                resolved.note,
            };
          }

          /*
            Available dates do not need a restriction entry,
            unless an explicit duration limit somehow exists.
          */
          return {
            date,
            status:
              resolved.maxDurationMinutes
                ? "Limited"
                : "Available",

            maxDurationMinutes:
              resolved.maxDurationMinutes,

            note:
              resolved.note,
          };
        }
      );

  return validatePlanAgainstAvailability({
    plan,
    availability:
      effectiveConstraints,
  });
}



/*
  Deterministically repair a plan to the athlete's FINAL
  Calendar availability.

  This is intentionally conservative:
  - valid sessions stay untouched
  - Bike + Run brick with Run blocked becomes Bike-only
    when Bike is still allowed
  - otherwise a blocked primary becomes Rest
  - blocked additional sessions are removed

  AI may refine afterwards, but an invalid plan should
  never remain visible just because the model ignored a
  hard Calendar rule.
*/
export function repairPlanToResolvedAvailability({
  plan,
  athlete,
  availability,
}: {
  plan: TrainingPlan;

  athlete:
    | Pick<
        Athlete,
        "weeklyAvailability" |
        "availableDays"
      >
    | null
    | undefined;

  availability:
    TrainingAvailability[];
}): TrainingPlan {

  const allSports:
    AvailabilitySport[] = [
      "Swim",
      "Bike",
      "Run",
      "Strength",
    ];


  function cleanBikeOnlyText(
    value: string
  ) {
    return value
      .replace(
        /\b(?:easy\s+)?brick\b/gi,
        ""
      )
      .replace(
        /\btransition\s+run\b/gi,
        ""
      )
      .replace(
        /\b(?:short|easy)?\s*run\b/gi,
        ""
      )
      .replace(
        /\s+(?:with|and)\s*$/i,
        ""
      )
      .replace(
        /\s{2,}/g,
        " "
      )
      .replace(
        /\s+([,.])/g,
        "$1"
      )
      .trim();
  }


  function restFrom(
    workout: TrainingPlanDay
  ): TrainingPlanDay {
    return {
      ...workout,

      sport:
        "Rest",

      title:
        "Rest",

      durationMinutes:
        0,

      intensity:
        "Recovery",

      purpose:
        "Calendar availability",

      details: [
        "No training scheduled.",
      ],
    };
  }


  function repairWorkout(
    workout: TrainingPlanDay,
    date: string | undefined
  ):
    | TrainingPlanDay
    | null {

    if (
      !date ||
      workout.durationMinutes <= 0 ||
      workout.sport === "Rest"
    ) {
      return workout;
    }


    const resolved =
      resolveAvailabilityForDate({
        athlete,
        availability,
        date,
      });


    const allowedSports =
      resolved.status ===
        "Unavailable"
        ? []
        : (
            resolved.allowedSports ??
            allSports
          );


    const disciplines =
      getSessionDisciplines(
        workout
      );


    const alreadyAllowed =
      disciplines.length > 0 &&
      disciplines.every(
        (sport) =>
          allowedSports.includes(
            sport
          )
      );


    if (
      alreadyAllowed
    ) {
      return workout;
    }


    const workoutText =
      textOfSession(
        workout
      );


    const isBikeRunBrick =
      disciplines.includes(
        "Bike"
      ) &&
      disciplines.includes(
        "Run"
      ) &&
      /\bbrick\b/.test(
        workoutText
      );


    /*
      Smallest sensible deterministic repair for the
      common brick case:

      Bike allowed + Run blocked
      => keep the bike workout, remove the run portion.
    */
    if (
      isBikeRunBrick &&
      allowedSports.includes(
        "Bike"
      ) &&
      !allowedSports.includes(
        "Run"
      )
    ) {

      const cleanedTitle =
        cleanBikeOnlyText(
          workout.title
        );


      const cleanedDetails =
        (
          workout.details ??
          []
        )
          .filter(
            (detail) =>
              !/\b(?:brick|run|transition)\b/i.test(
                detail
              )
          )
          .map(
            cleanBikeOnlyText
          )
          .filter(Boolean);


      return {
        ...workout,

        sport:
          "Bike",

        title:
          cleanedTitle ||
          "Bike endurance",

        purpose:
          /\b(?:brick|run|transition)\b/i.test(
            workout.purpose
          )
            ? "Build bike endurance while respecting your calendar availability."
            : workout.purpose,

        details:
          cleanedDetails.length >
          0
            ? cleanedDetails
            : [
                "Complete the bike portion at the prescribed effort.",
              ],
      };
    }


    /*
      Any other hard conflict is safer to remove than to
      invent a replacement locally.

      Primary calendar slots remain exactly seven by
      becoming Rest. Additional sessions are filtered out.
    */
    return null;
  }


  const repairedDays =
    plan.days.map(
      (workout) => {
        const date =
          resolveSessionDate(
            workout,
            plan
          );

        return (
          repairWorkout(
            workout,
            date
          ) ??
          restFrom(
            workout
          )
        );
      }
    );


  const repairedAdditional =
    (
      plan.additionalSessions ??
      []
    )
      .map(
        (workout) => {
          const date =
            resolveSessionDate(
              workout,
              plan
            );

          return repairWorkout(
            workout,
            date
          );
        }
      )
      .filter(
        (
          workout
        ): workout is TrainingPlanDay =>
          workout !== null
      );


  const totalMinutes =
    [
      ...repairedDays,
      ...repairedAdditional,
    ].reduce(
      (
        total,
        workout
      ) =>
        total +
        Math.max(
          0,
          workout.durationMinutes
        ),
      0
    );


  return {
    ...plan,

    days:
      repairedDays,

    additionalSessions:
      repairedAdditional,

    totalHours:
      Number(
        (
          totalMinutes /
          60
        ).toFixed(
          1
        )
      ),
  };
}
