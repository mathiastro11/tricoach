import {
  randomUUID,
} from "node:crypto";

import {
  loadEnvConfig,
} from "@next/env";

import {
  createAdminClient,
} from "../../../lib/supabase-admin";

import type {
  ReadinessEntry,
  SeasonRoadmap,
  TrainingAvailability,
  TrainingPlan,
  WeeklyReview,
  WorkoutFeedback,
} from "../../../types/training";



loadEnvConfig(
  process.cwd()
);


export type AuthenticatedTestUser = {
  id: string;
  email: string;
  password: string;
};


export async function createAuthenticatedTestUser(
  label = "browser"
): Promise<AuthenticatedTestUser> {

  const admin =
    createAdminClient();

  const uniqueId =
    randomUUID();

  const email =
    [
      "basse-e2e",
      label
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /^-|-$/g,
          ""
        ) || "browser",
      Date.now(),
      uniqueId.slice(
        0,
        8
      ),
    ].join(
      "-"
    ) +
    "@example.com";

  const password =
    `Basse-E2E-${randomUUID()}-9aA!`;

  const {
    data,
    error,
  } =
    await admin.auth.admin
      .createUser({
        email,
        password,
        email_confirm:
          true,
      });

  if (
    error ||
    !data.user
  ) {
    throw new Error(
      [
        "Could not create authenticated E2E test user.",
        error?.message,
      ]
        .filter(
          Boolean
        )
        .join(
          " "
        )
    );
  }

  return {
    id:
      data.user.id,
    email,
    password,
  };
}


export async function deleteAuthenticatedTestUser(
  userId: string
): Promise<void> {

  const admin =
    createAdminClient();

  const {
    error,
  } =
    await admin.auth.admin
      .deleteUser(
        userId
      );

  if (error) {
    throw new Error(
      `Could not delete authenticated E2E test user: ${error.message}`
    );
  }

}

function getOsloDateParts(
  date = new Date()
) {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Europe/Oslo",
        year:
          "numeric",
        month:
          "2-digit",
        day:
          "2-digit",
      }
    );

  const parts =
    formatter.formatToParts(
      date
    );

  const values =
    Object.fromEntries(
      parts
        .filter(
          (part) =>
            part.type !==
            "literal"
        )
        .map(
          (part) => [
            part.type,
            part.value,
          ]
        )
    );

  return {
    year:
      Number(values.year),
    month:
      Number(values.month),
    day:
      Number(values.day),
  };
}


function toIsoDate(
  date:
    Date
) {
  return date
    .toISOString()
    .slice(
      0,
      10
    );
}


function addDays(
  isoDate:
    string,
  amount:
    number
) {
  const date =
    new Date(
      `${isoDate}T12:00:00Z`
    );

  date.setUTCDate(
    date.getUTCDate() +
      amount
  );

  return toIsoDate(
    date
  );
}


function getCurrentOsloWeekStart() {
  const {
    year,
    month,
    day,
  } =
    getOsloDateParts();

  const current =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        12
      )
    );

  const weekday =
    current.getUTCDay();

  const daysSinceMonday =
    (
      weekday +
      6
    ) %
    7;

  current.setUTCDate(
    current.getUTCDate() -
      daysSinceMonday
  );

  return toIsoDate(
    current
  );
}



function buildAuthenticatedCloudNextWeekPreview(
  currentWeekStart: string,
  marker =
    "Authenticated E2E cloud session"
): TrainingPlan {

  const weekStart =
    addDays(
      currentWeekStart,
      7
    );

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return {
    summary:
      "Deterministic cloud-backed next-week preview for authenticated E2E.",

    totalHours:
      0.75,

    focus:
      "Cross-device planning continuity",

    weekNumber:
      2,

    weekStart,

    days:
      weekdays.map(
        (
          day,
          index
        ) => ({
          sessionId:
            `${weekStart}-${index}-cloud-context`,

          day,

          date:
            addDays(
              weekStart,
              index
            ),

          sessionSource:
            "coach",

          sessionRole:
            "primary",

          sessionSlot:
            "Flexible",

          sport:
            index === 1
              ? "Run"
              : "Rest",

          title:
            index === 1
              ? marker
              : "Cloud recovery day",

          durationMinutes:
            index === 1
              ? 45
              : 0,

          intensity:
            index === 1
              ? "Easy"
              : "Recovery",

          purpose:
            index === 1
              ? "Verify cloud-backed Next Week continuity."
              : "Keep the deterministic test week simple.",

          details:
            index === 1
              ? [
                  "Easy controlled running.",
                ]
              : [
                  "No structured training.",
                ],
        })
      ),

    additionalSessions:
      [],
  };
}


export async function seedAuthenticatedTestUserState(
  userId:
    string
): Promise<void> {

  const admin =
    createAdminClient();

  const weekStart =
    getCurrentOsloWeekStart();

  const now =
    new Date()
      .toISOString();

  const raceDate =
    addDays(
      weekStart,
      91
    );

  const plan:
    TrainingPlan = {
      summary:
        "A balanced 70.3 training week for authenticated browser QA.",

      totalHours:
        5.67,

      focus:
        "Aerobic consistency, technique and controlled endurance.",

      weekNumber:
        1,

      weekStart,

      days: [
        {
          sessionId:
            `${weekStart}-monday-primary`,
          day:
            "Monday",
          date:
            addDays(
              weekStart,
              0
            ),
          sessionSource:
            "coach",
          sessionRole:
            "primary",
          sessionSlot:
            "Flexible",
          sport:
            "Rest",
          title:
            "Recovery day",
          durationMinutes:
            0,
          intensity:
            "Recovery",
          purpose:
            "Absorb the previous training load.",
          details: [
            "Keep the day easy.",
            "Optional light mobility.",
          ],
        },

        {
          sessionId:
            `${weekStart}-tuesday-primary`,
          day:
            "Tuesday",
          date:
            addDays(
              weekStart,
              1
            ),
          sessionSource:
            "coach",
          sessionRole:
            "primary",
          sessionSlot:
            "Flexible",
          sport:
            "Run",
          title:
            "Aerobic run + strides",
          durationMinutes:
            45,
          intensity:
            "Easy",
          purpose:
            "Build aerobic durability and relaxed running form.",
          details: [
            "Run comfortably.",
            "Finish with 4 × 20 s relaxed strides.",
          ],
        },

        {
          sessionId:
            `${weekStart}-wednesday-primary`,
          day:
            "Wednesday",
          date:
            addDays(
              weekStart,
              2
            ),
          sessionSource:
            "coach",
          sessionRole:
            "primary",
          sessionSlot:
            "Flexible",
          sport:
            "Swim",
          title:
            "Technique + aerobic swim",
          durationMinutes:
            45,
          intensity:
            "Easy–Moderate",
          purpose:
            "Improve swim economy while accumulating aerobic volume.",
          details: [
            "Prioritize relaxed technique.",
            "Keep the aerobic work controlled.",
          ],
        },

        {
          sessionId:
            `${weekStart}-thursday-primary`,
          day:
            "Thursday",
          date:
            addDays(
              weekStart,
              3
            ),
          sessionSource:
            "coach",
          sessionRole:
            "primary",
          sessionSlot:
            "Flexible",
          sport:
            "Bike",
          title:
            "Endurance ride",
          durationMinutes:
            60,
          intensity:
            "Easy–Moderate",
          purpose:
            "Develop steady aerobic cycling endurance.",
          details: [
            "Ride smoothly at conversational effort.",
            "Keep cadence comfortable and controlled.",
          ],
        },

        {
          sessionId:
            `${weekStart}-friday-primary`,
          day:
            "Friday",
          date:
            addDays(
              weekStart,
              4
            ),
          sessionSource:
            "coach",
          sessionRole:
            "primary",
          sessionSlot:
            "Flexible",
          sport:
            "Strength",
          title:
            "Full-body strength",
          durationMinutes:
            35,
          intensity:
            "Moderate",
          purpose:
            "Maintain general strength and movement quality.",
          details: [
            "Use controlled technique.",
            "Stop each set with repetitions in reserve.",
          ],
        },

        {
          sessionId:
            `${weekStart}-saturday-primary`,
          day:
            "Saturday",
          date:
            addDays(
              weekStart,
              5
            ),
          sessionSource:
            "coach",
          sessionRole:
            "primary",
          sessionSlot:
            "AM",
          sport:
            "Bike",
          title:
            "Long aerobic ride",
          durationMinutes:
            90,
          intensity:
            "Easy–Moderate",
          purpose:
            "Build endurance for longer-course racing.",
          details: [
            "Keep the first hour controlled.",
            "Practice drinking regularly.",
          ],
        },

        {
          sessionId:
            `${weekStart}-sunday-primary`,
          day:
            "Sunday",
          date:
            addDays(
              weekStart,
              6
            ),
          sessionSource:
            "coach",
          sessionRole:
            "primary",
          sessionSlot:
            "Flexible",
          sport:
            "Run",
          title:
            "Easy long run",
          durationMinutes:
            65,
          intensity:
            "Easy",
          purpose:
            "Develop aerobic run durability without excessive fatigue.",
          details: [
            "Stay conversational throughout.",
            "Finish feeling capable of continuing.",
          ],
        },
      ],

      additionalSessions:
        [],
    };

  const workoutHistory:
    WorkoutFeedback[] = [
      {
        id:
          `e2e-feedback-${userId}`,
        sessionId:
          `previous-week-bike-${userId}`,
        day:
          "Saturday",
        date:
          addDays(
            weekStart,
            -2
          ),
        sport:
          "Bike",
        title:
          "Steady endurance ride",
        plannedDurationMinutes:
          75,
        status:
          "Completed",
        actualDurationMinutes:
          78,
        distance:
          31.4,
        distanceUnit:
          "km",
        rpe:
          5,
        feeling:
          "Great",
        comment:
          "Controlled and comfortable.",
        completedAt:
          now,
      },
    ];

  const readinessHistory:
    ReadinessEntry[] = [
      {
        id:
          `e2e-readiness-${userId}`,
        date:
          addDays(
            weekStart,
            0
          ),
        sleep:
          8,
        energy:
          8,
        soreness:
          2,
        stress:
          3,
        motivation:
          9,
        score:
          84,
        status:
          "Ready",
        note:
          "Deterministic authenticated E2E fixture.",
        createdAt:
          now,
      },
    ];

  const weeklyReview:
    WeeklyReview = {
      headline:
        "Consistent week",

      summary:
        "Training was completed consistently with manageable fatigue.",

      completedSessions:
        5,

      skippedSessions:
        1,

      averageRpe:
        5,

      loadDecision:
        "Maintain",

      positives: [
        "Good aerobic consistency.",
        "Training remained controlled.",
      ],

      concerns: [],

      nextWeekFocus:
        "Continue consistent aerobic training.",

      coachingDecision:
        null,

      decisionTrace:
        null,
    };

  const roadmapWeeks =
    Array.from(
      {
        length:
          13,
      },
      (
        _,
        index
      ) => ({
        weekIndex:
          index + 1,

        startDate:
          addDays(
            weekStart,
            index * 7
          ),

        phase:
          (
            index < 4
              ? "Base"
              : index < 9
                ? "Build"
                : index < 11
                  ? "Peak"
                  : "Taper"
          ) as
            | "Base"
            | "Build"
            | "Peak"
            | "Taper",

        focus:
          index < 4
            ? "Aerobic foundation"
            : index < 9
              ? "Race-specific endurance"
              : index < 11
                ? "Specific preparation"
                : "Freshness and race readiness",

        targetHours:
          index < 9
            ? 6
            : 5,

        priorityDiscipline:
          "Swimming",

        keyObjectives: [
          "Train consistently",
          "Develop aerobic durability",
        ],
      })
    );

  const seasonRoadmap:
    SeasonRoadmap = {
      createdAt:
        now,

      raceDate,

      raceGoal:
        "70.3",

      totalWeeks:
        roadmapWeeks.length,

      summary:
        "Progressive 70.3 preparation used for authenticated browser QA.",

      weeks:
        roadmapWeeks,
    };


  const {
    error:
      profileError,
  } =
    await admin
      .from(
        "profiles"
      )
      .upsert(
        {
          user_id:
            userId,

          name:
            "Basse E2E Athlete",

          goal:
            "70.3",

          race_date:
            raceDate,

          target_race:
            null,

          hours_per_week:
            6,

          weakest_discipline:
            "Swimming",

          experience:
            "Intermediate",

          capability_profile: {
            version:
              1,

            experience:
              "Intermediate",

            swimLevel:
              "Developing",

            bikeLevel:
              "Confident",

            runLevel:
              "Confident",

            performanceTier:
              "Recreational",
          },

          current_training_hours:
            5,

          swim_level:
            "Intermediate",

          bike_level:
            "Intermediate",

          run_level:
            "Intermediate",

          available_days: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],

          longest_session_minutes:
            150,

          pool_access:
            true,

          indoor_trainer:
            true,

          gym_access:
            true,

          limitations:
            "",

          updated_at:
            now,
        },
        {
          onConflict:
            "user_id",
        }
      );

  if (profileError) {
    throw new Error(
      `Could not seed authenticated E2E profile: ${profileError.message}`
    );
  }


  const {
    error:
      trainingStateError,
  } =
    await admin
      .from(
        "training_state"
      )
      .upsert(
        {
          user_id:
            userId,

          active_plan:
            plan,

          workout_history:
            workoutHistory,

          plan_history:
            [],

          training_archive:
            [],

          season_roadmap:
            seasonRoadmap,

          roadmap_revisions:
            [],

          readiness_history:
            readinessHistory,

          weekly_review:
            weeklyReview,

          next_week_preview:
            buildAuthenticatedCloudNextWeekPreview(
              weekStart
            ),

          training_availability:
            [],

          updated_at:
            now,
        },
        {
          onConflict:
            "user_id",
        }
      );

  if (
    trainingStateError
  ) {
    throw new Error(
      `Could not seed authenticated E2E training state: ${trainingStateError.message}`
    );
  }

}


export type AuthenticatedWorkoutLoggingFixture = {
  date: string;
  sessionId: string;
  title: string;
  plannedDurationMinutes: number;
};


export async function seedAuthenticatedWorkoutLoggingState(
  userId: string
): Promise<AuthenticatedWorkoutLoggingFixture> {

  await seedAuthenticatedTestUserState(
    userId
  );


  const admin =
    createAdminClient();


  const {
    year,
    month,
    day,
  } =
    getOsloDateParts();


  const today =
    [
      String(year).padStart(
        4,
        "0"
      ),
      String(month).padStart(
        2,
        "0"
      ),
      String(day).padStart(
        2,
        "0"
      ),
    ].join(
      "-"
    );


  const {
    data,
    error,
  } =
    await admin
      .from(
        "training_state"
      )
      .select(
        "active_plan"
      )
      .eq(
        "user_id",
        userId
      )
      .single();


  if (
    error ||
    !data?.active_plan
  ) {
    throw new Error(
      [
        "Could not read authenticated E2E active plan.",
        error?.message,
      ]
        .filter(
          Boolean
        )
        .join(
          " "
        )
    );
  }


  const plan =
    data.active_plan as unknown as TrainingPlan;


  const todayIndex =
    plan.days.findIndex(
      (workout) =>
        workout.date ===
        today
    );


  if (
    todayIndex <
    0
  ) {
    throw new Error(
      `Could not find ${today} in authenticated E2E active plan.`
    );
  }


  const originalWorkout =
    plan.days[
      todayIndex
    ];


  const sessionId =
    `${today}-e2e-workout-logging-primary`;

  const title =
    "E2E persistence run";

  const plannedDurationMinutes =
    42;


  const loggingWorkout:
    TrainingPlan["days"][number] = {
      ...originalWorkout,

      sessionId,

      date:
        today,

      sessionSource:
        "coach",

      sessionRole:
        "primary",

      sessionSlot:
        "Flexible",

      sport:
        "Run",

      title,

      durationMinutes:
        plannedDurationMinutes,

      intensity:
        "Easy",

      purpose:
        "Verify workout logging and cloud persistence.",

      details: [
        "Run comfortably at an easy aerobic effort.",
      ],

      workoutStructure:
        undefined,

      strengthStructure:
        undefined,
    };


  const updatedPlan:
    TrainingPlan = {
      ...plan,

      days:
        plan.days.map(
          (
            workout,
            index
          ) =>
            index ===
            todayIndex
              ? loggingWorkout
              : workout
        ),
  };


  const {
    error:
      updateError,
  } =
    await admin
      .from(
        "training_state"
      )
      .update({
        active_plan:
          updatedPlan,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "user_id",
        userId
      );


  if (updateError) {
    throw new Error(
      `Could not seed authenticated workout logging state: ${updateError.message}`
    );
  }


  return {
    date:
      today,

    sessionId,

    title,

    plannedDurationMinutes,
  };
}


export async function readAuthenticatedWorkoutHistory(
  userId: string
): Promise<WorkoutFeedback[]> {

  const admin =
    createAdminClient();


  const {
    data,
    error,
  } =
    await admin
      .from(
        "training_state"
      )
      .select(
        "workout_history"
      )
      .eq(
        "user_id",
        userId
      )
      .single();


  if (error) {
    throw new Error(
      `Could not read authenticated E2E workout history: ${error.message}`
    );
  }


  return Array.isArray(
    data?.workout_history
  )
    ? data.workout_history as unknown as WorkoutFeedback[]
    : [];
}



export async function addAuthenticatedWorkoutLoggingSecondarySession(
  userId: string
): Promise<AuthenticatedWorkoutLoggingFixture> {

  const admin =
    createAdminClient();


  const {
    year,
    month,
    day,
  } =
    getOsloDateParts();


  const today =
    [
      String(year).padStart(
        4,
        "0"
      ),
      String(month).padStart(
        2,
        "0"
      ),
      String(day).padStart(
        2,
        "0"
      ),
    ].join(
      "-"
    );


  const {
    data,
    error,
  } =
    await admin
      .from(
        "training_state"
      )
      .select(
        "active_plan"
      )
      .eq(
        "user_id",
        userId
      )
      .single();


  if (
    error ||
    !data?.active_plan
  ) {
    throw new Error(
      [
        "Could not read authenticated E2E active plan for secondary session.",
        error?.message,
      ]
        .filter(
          Boolean
        )
        .join(
          " "
        )
    );
  }


  const plan =
    data.active_plan as unknown as TrainingPlan;


  const primaryWorkout =
    plan.days.find(
      (workout) =>
        workout.date ===
        today
    );


  if (!primaryWorkout) {
    throw new Error(
      `Could not find ${today} in authenticated E2E active plan.`
    );
  }


  const sessionId =
    `${today}-e2e-workout-logging-secondary`;

  const title =
    "E2E secondary ride";

  const plannedDurationMinutes =
    36;


  const secondaryWorkout:
    TrainingPlan["days"][number] = {
      ...primaryWorkout,

      sessionId,

      date:
        today,

      sessionSource:
        "coach",

      sessionRole:
        "secondary",

      sessionSlot:
        "PM",

      sport:
        "Bike",

      title,

      durationMinutes:
        plannedDurationMinutes,

      intensity:
        "Easy",

      purpose:
        "Verify same-day workout logs remain independent.",

      details: [
        "Ride comfortably at an easy aerobic effort.",
      ],

      workoutStructure:
        undefined,

      strengthStructure:
        undefined,
    };


  const updatedPlan:
    TrainingPlan = {
      ...plan,

      additionalSessions: [
        ...(
          plan.additionalSessions ??
          []
        ).filter(
          (workout) =>
            workout.sessionId !==
            sessionId
        ),

        secondaryWorkout,
      ],
    };


  const {
    error:
      updateError,
  } =
    await admin
      .from(
        "training_state"
      )
      .update({
        active_plan:
          updatedPlan,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "user_id",
        userId
      );


  if (updateError) {
    throw new Error(
      `Could not seed authenticated secondary workout: ${updateError.message}`
    );
  }


  return {
    date:
      today,

    sessionId,

    title,

    plannedDurationMinutes,
  };
}


export type AuthenticatedCrossDeviceTrainingContextFixture = {
  nextWeekPreview: TrainingPlan;
  trainingAvailability: TrainingAvailability[];
};


export async function seedAuthenticatedCrossDeviceTrainingContext(
  userId: string
): Promise<AuthenticatedCrossDeviceTrainingContextFixture> {

  await seedAuthenticatedTestUserState(
    userId
  );


  const admin =
    createAdminClient();

  const currentWeekStart =
    getCurrentOsloWeekStart();

  const nextWeekPreview =
    buildAuthenticatedCloudNextWeekPreview(
      currentWeekStart,
      "Cross-device cloud run"
    );

  const trainingAvailability:
    TrainingAvailability[] = [
      {
        date:
          addDays(
            currentWeekStart,
            9
          ),

        status:
          "Limited",

        allowedSports:
          [
            "Swim",
          ],

        maxDurationMinutes:
          45,

        note:
          "Cross-device E2E swim-only window.",
      },

      {
        date:
          addDays(
            currentWeekStart,
            12
          ),

        status:
          "Unavailable",

        note:
          "Cross-device E2E unavailable day.",
      },
    ];


  const {
    error,
  } =
    await admin
      .from(
        "training_state"
      )
      .update({
        next_week_preview:
          nextWeekPreview,

        training_availability:
          trainingAvailability,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "user_id",
        userId
      );


  if (error) {
    throw new Error(
      `Could not seed cross-device training context: ${error.message}`
    );
  }


  return {
    nextWeekPreview,
    trainingAvailability,
  };
}


export async function readAuthenticatedTrainingContext(
  userId: string
): Promise<{
  nextWeekPreview: TrainingPlan | null;
  trainingAvailability: TrainingAvailability[];
}> {

  const admin =
    createAdminClient();


  const {
    data,
    error,
  } =
    await admin
      .from(
        "training_state"
      )
      .select(
        "next_week_preview,training_availability"
      )
      .eq(
        "user_id",
        userId
      )
      .single();


  if (error) {
    throw new Error(
      `Could not read authenticated training context: ${error.message}`
    );
  }


  return {
    nextWeekPreview:
      data?.next_week_preview
        ? data.next_week_preview as unknown as TrainingPlan
        : null,

    trainingAvailability:
      Array.isArray(
        data?.training_availability
      )
        ? data.training_availability as unknown as TrainingAvailability[]
        : [],
  };
}


export type AuthenticatedWeekRolloverFixture = {
  previousWeekStart: string;
  currentWeekStart: string;
  outgoingPlan: TrainingPlan;
  outgoingFeedback: WorkoutFeedback[];
  outgoingReview: WeeklyReview;
  promotedPlan: TrainingPlan;
  trainingAvailability: TrainingAvailability[];
};


export async function seedAuthenticatedWeekRolloverState(
  userId: string
): Promise<AuthenticatedWeekRolloverFixture> {

  await seedAuthenticatedTestUserState(
    userId
  );


  const admin =
    createAdminClient();


  const {
    data,
    error,
  } =
    await admin
      .from(
        "training_state"
      )
      .select(
        "active_plan,workout_history,weekly_review"
      )
      .eq(
        "user_id",
        userId
      )
      .single();


  if (
    error ||
    !data?.active_plan ||
    !data?.weekly_review
  ) {
    throw new Error(
      [
        "Could not prepare authenticated rollover fixture.",
        error?.message,
      ]
        .filter(
          Boolean
        )
        .join(
          " "
        )
    );
  }


  const currentPlan =
    data.active_plan as unknown as TrainingPlan;

  if (!currentPlan.weekStart) {
    throw new Error(
      "Authenticated rollover fixture is missing current weekStart."
    );
  }


  const currentWeekStart =
    currentPlan.weekStart;

  const previousWeekStart =
    addDays(
      currentWeekStart,
      -7
    );


  /*
    Build the genuinely outgoing week.

    Dates and session IDs belong to the previous calendar week,
    while the prescription remains deterministic.
  */
  const outgoingPlan:
    TrainingPlan = {
      ...currentPlan,

      summary:
        "Deterministic outgoing week for rollover E2E.",

      focus:
        "Outgoing rollover context",

      weekStart:
        previousWeekStart,

      weekNumber:
        Math.max(
          1,
          Number(
            currentPlan.weekNumber ??
            2
          ) - 1
        ),

      days:
        currentPlan.days.map(
          (
            session,
            index
          ) => ({
            ...session,

            sessionId:
              `${previousWeekStart}-${index}-rollover-outgoing`,

            date:
              addDays(
                previousWeekStart,
                index
              ),
          })
        ),

      additionalSessions:
        [],
    };


  /*
    This preview now matches the real current calendar week.

    Restore must promote it instead of generating another
    current-week plan.
  */
  const promotedPlan:
    TrainingPlan = {
      ...currentPlan,

      summary:
        "Deterministic current-week preview for rollover E2E.",

      focus:
        "Promoted rollover week",

      days:
        currentPlan.days.map(
          (
            session,
            index
          ) => ({
            ...session,

            title:
              index === 2
                ? "Promoted rollover swim"
                : session.title,
          })
        ),
    };


  const outgoingFeedback =
    Array.isArray(
      data.workout_history
    )
      ? data.workout_history as unknown as WorkoutFeedback[]
      : [];


  const outgoingReview =
    data.weekly_review as unknown as WeeklyReview;


  /*
    Hard Calendar constraints that are valid for the promoted
    current-week plan and must survive rollover unchanged.
  */
  const trainingAvailability:
    TrainingAvailability[] = [
      {
        date:
          addDays(
            currentWeekStart,
            0
          ),

        status:
          "Unavailable",

        note:
          "Rollover E2E rest-only Monday.",
      },

      {
        date:
          addDays(
            currentWeekStart,
            2
          ),

        status:
          "Limited",

        allowedSports:
          [
            "Swim",
          ],

        maxDurationMinutes:
          45,

        note:
          "Rollover E2E swim window.",
      },
    ];


  const {
    error:
      updateError,
  } =
    await admin
      .from(
        "training_state"
      )
      .update({
        active_plan:
          outgoingPlan,

        workout_history:
          outgoingFeedback,

        plan_history:
          [],

        training_archive:
          [],

        weekly_review:
          outgoingReview,

        next_week_preview:
          promotedPlan,

        training_availability:
          trainingAvailability,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "user_id",
        userId
      );


  if (updateError) {
    throw new Error(
      `Could not seed authenticated rollover state: ${updateError.message}`
    );
  }


  return {
    previousWeekStart,
    currentWeekStart,
    outgoingPlan,
    outgoingFeedback,
    outgoingReview,
    promotedPlan,
    trainingAvailability,
  };
}


export async function readAuthenticatedWeekRolloverState(
  userId: string
): Promise<{
  activePlan: TrainingPlan | null;
  workoutHistory: WorkoutFeedback[];
  planHistory: TrainingPlan[];
  trainingArchive: Array<{
    plan: TrainingPlan;
    feedback: WorkoutFeedback[];
    review: WeeklyReview | null;
    archivedAt: string;
  }>;
  weeklyReview: WeeklyReview | null;
  nextWeekPreview: TrainingPlan | null;
  trainingAvailability: TrainingAvailability[];
}> {

  const admin =
    createAdminClient();


  const {
    data,
    error,
  } =
    await admin
      .from(
        "training_state"
      )
      .select(
        "active_plan,workout_history,plan_history,training_archive,weekly_review,next_week_preview,training_availability"
      )
      .eq(
        "user_id",
        userId
      )
      .single();


  if (error) {
    throw new Error(
      `Could not read authenticated rollover state: ${error.message}`
    );
  }


  return {
    activePlan:
      data?.active_plan
        ? data.active_plan as unknown as TrainingPlan
        : null,

    workoutHistory:
      Array.isArray(
        data?.workout_history
      )
        ? data.workout_history as unknown as WorkoutFeedback[]
        : [],

    planHistory:
      Array.isArray(
        data?.plan_history
      )
        ? data.plan_history as unknown as TrainingPlan[]
        : [],

    trainingArchive:
      Array.isArray(
        data?.training_archive
      )
        ? data.training_archive as unknown as Array<{
            plan: TrainingPlan;
            feedback: WorkoutFeedback[];
            review: WeeklyReview | null;
            archivedAt: string;
          }>
        : [],

    weeklyReview:
      data?.weekly_review
        ? data.weekly_review as unknown as WeeklyReview
        : null,

    nextWeekPreview:
      data?.next_week_preview
        ? data.next_week_preview as unknown as TrainingPlan
        : null,

    trainingAvailability:
      Array.isArray(
        data?.training_availability
      )
        ? data.training_availability as unknown as TrainingAvailability[]
        : [],
  };
}
