import {
  writeFileSync,
} from "node:fs";

import type {
  Athlete,
  TrainingPlan,
  TrainingPlanDay,
} from "../types/training";

import {
  validateCanonicalGeneratedPlan,
} from "../lib/canonical-workout-validation";

import {
  auditBenchmarkUsage,
} from "../lib/benchmark-usage-audit";

import {
  isDemandingSession,
} from "../lib/session-classification";


type ScenarioContext = {
  plan: TrainingPlan;
  athlete: Athlete;
  todayIso: string;

  trainingSessions: TrainingPlanDay[];
  demandingSessions: TrainingPlanDay[];

  computedHours: number;

  swimCount: number;
  bikeCount: number;
  runCount: number;
  strengthCount: number;

  longestBikeMinutes: number;
  longestRunMinutes: number;

  brickCount: number;

  hasFuelingGuidance: boolean;
};


type Scenario = {
  name: string;

  athlete: Athlete;

  todayIso: string;

  hardChecks: (
    context: ScenarioContext
  ) => string[];

  qualityChecks: (
    context: ScenarioContext
  ) => string[];
};


type ScenarioResult = {
  name: string;

  status:
    | "PASS"
    | "QUALITY_GAPS"
    | "HARD_FAIL";

  responseStatus: number;

  hardFailures: string[];

  qualityGaps: string[];

  summary:
    Record<
      string,
      unknown
    >;

  plan?: TrainingPlan;

  error?: string;
};


const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;


function toIso(
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


  return `${year}-${month}-${day}`;
}


function fromIso(
  value: string
) {

  return new Date(
    `${value}T12:00:00`
  );
}


function addDays(
  iso: string,
  days: number
) {

  const date =
    fromIso(
      iso
    );

  date.setDate(
    date.getDate() +
    days
  );

  return toIso(
    date
  );
}


function currentMondayIso() {

  const now =
    new Date();

  now.setHours(
    12,
    0,
    0,
    0
  );

  const jsDay =
    now.getDay();

  const mondayOffset =
    jsDay === 0
      ? -6
      : 1 - jsDay;

  now.setDate(
    now.getDate() +
    mondayOffset
  );

  return toIso(
    now
  );
}


function makeTargetRace(
  goal:
    Athlete["goal"],

  date:
    string
): NonNullable<
  Athlete["targetRace"]
> {

  return {
    id:
      `qa-${goal
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )}`,

    name:
      `${goal} QA Race`,

    date,

    source:
      "manual",

    format:
      goal,
  };
}


function makeAthlete(
  overrides:
    Partial<Athlete> & {
      goal:
        Athlete["goal"];

      raceDate:
        string;
    }
): Athlete {

  const goal =
    overrides.goal;

  const raceDate =
    overrides.raceDate;


  /*
    Important:
    overrides is spread BEFORE the required goal/raceDate
    fields are written.

    This avoids TS2783 while keeping the caller-provided
    values authoritative.
  */
  const athlete: Athlete = {
    name:
      "Basse QA Athlete",

    unitSystem:
      "Metric",

    hoursPerWeek:
      "8",

    weakestDiscipline:
      "Swimming",

    experience:
      "Intermediate",

    performanceTier:
      "Recreational",

    currentTrainingHours:
      "6",

    swimLevel:
      "Developing",

    bikeLevel:
      "Developing",

    runLevel:
      "Developing",

    availableDays:
      [...DAYS],

    longestSessionMinutes:
      "180",

    poolAccess:
      true,

    indoorTrainer:
      true,

    gymAccess:
      true,

    limitations:
      "",

    ...overrides,

    goal,

    raceDate,

    targetRace:
      overrides.targetRace ??
      makeTargetRace(
        goal,
        raceDate
      ),
  };


  return athlete;
}


function getAllSessions(
  plan:
    TrainingPlan
) {

  return [
    ...plan.days,

    ...(
      plan.additionalSessions ??
      []
    ),
  ];
}


function getTrainingSessions(
  plan:
    TrainingPlan
) {

  return getAllSessions(
    plan
  ).filter(
    (session) =>
      session.sport !==
        "Rest" &&
      session.durationMinutes >
        0
  );
}


function workoutText(
  workout:
    TrainingPlanDay
) {

  const blocks =
    (
      workout.workoutStructure ??
      []
    )
      .flatMap(
        (block) => [
          block.label,
          block.workIntensity,
          block.workInstruction,
          block.recoveryIntensity,
          block.recoveryInstruction,
        ]
      );


  return [
    workout.title,
    workout.intensity,
    workout.purpose,
    ...(workout.details ?? []),
    ...blocks,
  ]
    .filter(
      Boolean
    )
    .join(
      " "
    )
    .toLowerCase();
}


function isBrick(
  workout:
    TrainingPlanDay
) {

  const sports =
    new Set(
      (
        workout.workoutStructure ??
        []
      )
        .map(
          (block) =>
            block.sport
        )
        .filter(
          Boolean
        )
    );


  /*
    Canonical structure is authoritative.

    Text mentioning "brick" or "transition" is not enough.
    A real connected brick must contain both Bike and Run
    blocks in workoutStructure.
  */
  return (
    sports.has(
      "Bike"
    ) &&
    sports.has(
      "Run"
    )
  );
}


function hasFuelingGuidance(
  workout:
    TrainingPlanDay
) {

  const text =
    workoutText(
      workout
    );


  return (
    /\bfuel(?:ing)?\b/.test(
      text
    ) ||
    /\bcarb(?:s|ohydrate|ohydrates)?\b/.test(
      text
    ) ||
    /\bnutrition\b/.test(
      text
    ) ||
    /\bg\/h\b/.test(
      text
    ) ||
    /\bhydrat(?:e|ion)\b/.test(
      text
    )
  );
}


function longestSport(
  sessions:
    TrainingPlanDay[],

  sport:
    string
) {

  return Math.max(
    0,

    ...sessions
      .filter(
        (session) =>
          session.sport ===
          sport
      )
      .map(
        (session) =>
          session.durationMinutes
      )
  );
}


function buildContext(
  plan:
    TrainingPlan,

  athlete:
    Athlete,

  todayIso:
    string
): ScenarioContext {

  const trainingSessions =
    getTrainingSessions(
      plan
    );

  const demandingSessions =
    trainingSessions.filter(
      (session) =>
        isDemandingSession(
          session
        )
    );


  const totalMinutes =
    trainingSessions.reduce(
      (
        total,
        session
      ) =>
        total +
        session.durationMinutes,
      0
    );


  type ExposureSport =
    | "Swim"
    | "Bike"
    | "Run"
    | "Strength";


  const hasDisciplineExposure =
    (
      session:
        TrainingPlanDay,

      sport:
        ExposureSport
    ) => {

      if (
        session.sport ===
        sport
      ) {
        return true;
      }


      return (
        session.workoutStructure ??
        []
      ).some(
        (block) =>
          block.sport ===
          sport
      );
    };


  const countDisciplineExposure =
    (
      sport:
        ExposureSport
    ) =>
      trainingSessions.filter(
        (session) =>
          hasDisciplineExposure(
            session,
            sport
          )
      ).length;


  return {
    plan,

    athlete,

    todayIso,

    trainingSessions,

    demandingSessions,

    computedHours:
      totalMinutes /
      60,

    swimCount:
      countDisciplineExposure(
        "Swim"
      ),

    bikeCount:
      countDisciplineExposure(
        "Bike"
      ),

    runCount:
      countDisciplineExposure(
        "Run"
      ),

    strengthCount:
      countDisciplineExposure(
        "Strength"
      ),

    longestBikeMinutes:
      longestSport(
        trainingSessions,
        "Bike"
      ),

    longestRunMinutes:
      longestSport(
        trainingSessions,
        "Run"
      ),

    brickCount:
      trainingSessions.filter(
        isBrick
      ).length,

    hasFuelingGuidance:
      trainingSessions.some(
        hasFuelingGuidance
      ),
  };
}


function commonHardChecks(
  context:
    ScenarioContext
) {

  const failures:
    string[] = [];

  const {
    plan,
    athlete,
    trainingSessions,
    computedHours,
  } =
    context;


  if (
    plan.days.length !==
    7
  ) {

    failures.push(
      `Expected 7 primary days, got ${plan.days.length}.`
    );
  }


  const canonical =
    validateCanonicalGeneratedPlan(
      plan
    );


  if (
    !canonical.valid
  ) {

    failures.push(
      `Canonical validation failed: ${canonical.errors.join(" | ")}`
    );
  }


  const benchmark =
    auditBenchmarkUsage({
      plan,

      benchmarks:
        athlete.benchmarks,
    });


  if (
    !benchmark.valid
  ) {

    failures.push(
      `Benchmark audit failed: ${benchmark.errors.join(" | ")}`
    );
  }


  if (
    Math.abs(
      plan.totalHours -
      computedHours
    ) >
    0.06
  ) {

    failures.push(
      `totalHours mismatch: reported ${plan.totalHours}, computed ${computedHours.toFixed(2)}.`
    );
  }


  const maxMinutes =
    Number(
      athlete.longestSessionMinutes
    );


  if (
    Number.isFinite(
      maxMinutes
    ) &&
    trainingSessions.some(
      (session) =>
        session.durationMinutes >
        maxMinutes
    )
  ) {

    failures.push(
      `A session exceeds longestSessionMinutes=${maxMinutes}.`
    );
  }


  if (
    !athlete.poolAccess &&
    context.swimCount >
      0
  ) {

    failures.push(
      "Swim training generated despite poolAccess=false."
    );
  }


  return failures;
}


function summarize(
  context:
    ScenarioContext
) {

  return {
    totalHours:
      context.plan.totalHours,

    computedHours:
      Number(
        context.computedHours.toFixed(
          2
        )
      ),

    totalSessions:
      context.trainingSessions.length,

    additionalSessions:
      context.plan
        .additionalSessions
        ?.length ??
      0,

    swim:
      context.swimCount,

    bike:
      context.bikeCount,

    run:
      context.runCount,

    strength:
      context.strengthCount,

    demanding:
      context.demandingSessions.length,

    bricks:
      context.brickCount,

    longestBikeMinutes:
      context.longestBikeMinutes,

    longestRunMinutes:
      context.longestRunMinutes,

    fueling:
      context.hasFuelingGuidance,
  };
}


const monday =
  currentMondayIso();


const scenarios:
  Scenario[] = [

  {
    name:
      "Zero-volume beginner Sprint",

    todayIso:
      monday,

    athlete:
      makeAthlete({
        goal:
          "Sprint",

        raceDate:
          addDays(
            monday,
            140
          ),

        hoursPerWeek:
          "6",

        currentTrainingHours:
          "0",

        experience:
          "Beginner",

        performanceTier:
          "Recreational",

        swimLevel:
          "Beginner",

        bikeLevel:
          "Beginner",

        runLevel:
          "Beginner",

        weakestDiscipline:
          "Swimming",

        longestSessionMinutes:
          "75",

        gymAccess:
          false,
      }),

    hardChecks:
      (
        context
      ) => {

        const failures =
          commonHardChecks(
            context
          );


        if (
          context.plan.totalHours >
          3.5
        ) {

          failures.push(
            `Beginner onboarding ceiling exceeded: ${context.plan.totalHours} h.`
          );
        }


        return failures;
      },

    qualityChecks:
      (
        context
      ) => {

        const gaps:
          string[] = [];


        if (
          context.plan.totalHours <
          1.5
        ) {

          gaps.push(
            "Zero-volume beginner may be excessively underloaded."
          );
        }


        if (
          context.runCount <
          1
        ) {

          gaps.push(
            "Zero-volume Sprint beginner received no run exposure at all."
          );
        }


        if (
          context.demandingSessions.length >
          1
        ) {

          gaps.push(
            `Zero-volume beginner received ${context.demandingSessions.length} demanding sessions.`
          );
        }


        if (
          context.runCount >
          2
        ) {

          gaps.push(
            "Zero-volume beginner received more than two runs."
          );
        }


        return gaps;
      },
  },


  {
    name:
      "Weak-swimmer Olympic athlete",

    todayIso:
      monday,

    athlete:
      makeAthlete({
        goal:
          "Olympic",

        raceDate:
          addDays(
            monday,
            84
          ),

        hoursPerWeek:
          "8",

        currentTrainingHours:
          "7",

        experience:
          "Intermediate",

        performanceTier:
          "Competitive",

        swimLevel:
          "Beginner",

        bikeLevel:
          "Confident",

        runLevel:
          "Confident",

        weakestDiscipline:
          "Swimming",

        longestSessionMinutes:
          "150",
      }),

    hardChecks:
      (
        context
      ) => {

        const failures =
          commonHardChecks(
            context
          );


        if (
          context.plan.totalHours >
          8.01
        ) {

          failures.push(
            `8 h capacity exceeded: ${context.plan.totalHours} h.`
          );
        }


        return failures;
      },

    qualityChecks:
      (
        context
      ) => {

        const gaps:
          string[] = [];


        if (
          context.swimCount <
          2
        ) {

          gaps.push(
            `Weak swimmer received only ${context.swimCount} swim session(s).`
          );
        }


        if (
          context.runCount <
          2
        ) {

          gaps.push(
            `Olympic athlete received only ${context.runCount} run session(s); swim emphasis should not normally erase basic run frequency.`
          );
        }


        if (
          context.plan.totalHours <
          5.5
        ) {

          gaps.push(
            `7 h athlete received only ${context.plan.totalHours} h.`
          );
        }


        if (
          context.demandingSessions.length >
          2
        ) {

          gaps.push(
            `Intermediate athlete received ${context.demandingSessions.length} demanding sessions.`
          );
        }


        return gaps;
      },
  },


  {
    name:
      "70.3 athlete without pool access",

    todayIso:
      monday,

    athlete:
      makeAthlete({
        goal:
          "70.3",

        raceDate:
          addDays(
            monday,
            91
          ),

        hoursPerWeek:
          "10",

        currentTrainingHours:
          "9",

        experience:
          "Experienced",

        performanceTier:
          "Competitive",

        swimLevel:
          "Developing",

        bikeLevel:
          "Confident",

        runLevel:
          "Confident",

        weakestDiscipline:
          "Swimming",

        longestSessionMinutes:
          "210",

        poolAccess:
          false,
      }),

    hardChecks:
      (
        context
      ) => {

        const failures =
          commonHardChecks(
            context
          );


        if (
          context.swimCount !==
          0
        ) {

          failures.push(
            "No-pool athlete received Swim."
          );
        }


        if (
          context.plan.totalHours >
          10.01
        ) {

          failures.push(
            `10 h capacity exceeded: ${context.plan.totalHours} h.`
          );
        }


        return failures;
      },

    qualityChecks:
      (
        context
      ) => {

        const gaps:
          string[] = [];


        if (
          context.plan.totalHours <
          7.5
        ) {

          gaps.push(
            `9 h athlete received only ${context.plan.totalHours} h.`
          );
        }


        if (
          context.bikeCount <
          2
        ) {

          gaps.push(
            "70.3 no-pool plan contains fewer than two bike sessions."
          );
        }


        return gaps;
      },
  },


  {
    name:
      "High-volume competitive 70.3",

    todayIso:
      monday,

    athlete:
      makeAthlete({
        goal:
          "70.3",

        raceDate:
          addDays(
            monday,
            84
          ),

        hoursPerWeek:
          "16",

        currentTrainingHours:
          "14",

        experience:
          "Advanced",

        performanceTier:
          "Competitive",

        swimLevel:
          "Advanced",

        bikeLevel:
          "Advanced",

        runLevel:
          "Advanced",

        weakestDiscipline:
          "Cycling",

        longestSessionMinutes:
          "240",
      }),

    hardChecks:
      (
        context
      ) => {

        const failures =
          commonHardChecks(
            context
          );


        if (
          context.plan.totalHours >
          16.01
        ) {

          failures.push(
            `16 h capacity exceeded: ${context.plan.totalHours} h.`
          );
        }


        return failures;
      },

    qualityChecks:
      (
        context
      ) => {

        const gaps:
          string[] = [];


        if (
          context.plan.totalHours <
          12.5
        ) {

          gaps.push(
            `14 h athlete received only ${context.plan.totalHours} h.`
          );
        }


        if (
          context.trainingSessions.length <
          8
        ) {

          gaps.push(
            `High-volume athlete received only ${context.trainingSessions.length} sessions.`
          );
        }


        if (
          context.longestBikeMinutes <
          120
        ) {

          gaps.push(
            `Longest 70.3 bike is only ${context.longestBikeMinutes} min.`
          );
        }


        if (
          !context.hasFuelingGuidance
        ) {

          gaps.push(
            "High-volume 70.3 week has no detectable fueling guidance."
          );
        }


        return gaps;
      },
  },


  {
    name:
      "Professional Ironman athlete",

    todayIso:
      monday,

    athlete:
      makeAthlete({
        goal:
          "Ironman",

        raceDate:
          addDays(
            monday,
            98
          ),

        hoursPerWeek:
          "22",

        currentTrainingHours:
          "18",

        experience:
          "Advanced",

        performanceTier:
          "Professional",

        swimLevel:
          "Elite",

        bikeLevel:
          "Elite",

        runLevel:
          "Advanced",

        weakestDiscipline:
          "Running",

        longestSessionMinutes:
          "330",
      }),

    hardChecks:
      (
        context
      ) => {

        const failures =
          commonHardChecks(
            context
          );


        if (
          context.plan.totalHours >
          20.71
        ) {

          failures.push(
            `18 h athlete exceeded onboarding tolerance ceiling: ${context.plan.totalHours} h.`
          );
        }


        return failures;
      },

    qualityChecks:
      (
        context
      ) => {

        const gaps:
          string[] = [];


        if (
          context.plan.totalHours <
          15
        ) {

          gaps.push(
            `18 h professional athlete received only ${context.plan.totalHours} h.`
          );
        }


        if (
          context.trainingSessions.length <
          9
        ) {

          gaps.push(
            `Professional athlete received only ${context.trainingSessions.length} sessions.`
          );
        }


        if (
          context.swimCount <
          2
        ) {

          gaps.push(
            `Elite swimmer received only ${context.swimCount} swim session(s).`
          );
        }


        if (
          context.longestBikeMinutes <
          180
        ) {

          gaps.push(
            `Ironman longest bike is only ${context.longestBikeMinutes} min.`
          );
        }


        if (
          !context.hasFuelingGuidance
        ) {

          gaps.push(
            "Ironman plan has no detectable fueling practice."
          );
        }


        if (
          context.brickCount <
          1
        ) {

          gaps.push(
            "Ironman plan has no detectable brick/transition session."
          );
        }


        return gaps;
      },
  },


  {
    name:
      "Midweek first-plan safety",

    todayIso:
      addDays(
        monday,
        2
      ),

    athlete:
      makeAthlete({
        goal:
          "Olympic",

        raceDate:
          addDays(
            monday,
            70
          ),

        hoursPerWeek:
          "10",

        currentTrainingHours:
          "8",

        experience:
          "Experienced",

        performanceTier:
          "Competitive",

        swimLevel:
          "Confident",

        bikeLevel:
          "Confident",

        runLevel:
          "Confident",

        weakestDiscipline:
          "Running",

        longestSessionMinutes:
          "180",
      }),

    hardChecks:
      (
        context
      ) => {

        const failures =
          commonHardChecks(
            context
          );


        const mondayDay =
          context.plan.days.find(
            (day) =>
              day.day ===
              "Monday"
          );

        const tuesdayDay =
          context.plan.days.find(
            (day) =>
              day.day ===
              "Tuesday"
          );


        if (
          !mondayDay ||
          mondayDay.sport !==
            "Rest" ||
          mondayDay.durationMinutes !==
            0
        ) {

          failures.push(
            "Past Monday was not protected."
          );
        }


        if (
          !tuesdayDay ||
          tuesdayDay.sport !==
            "Rest" ||
          tuesdayDay.durationMinutes !==
            0
        ) {

          failures.push(
            "Past Tuesday was not protected."
          );
        }


        if (
          context.plan.totalHours >
          7.71
        ) {

          failures.push(
            `Midweek week exceeded partial-week ceiling: ${context.plan.totalHours} h.`
          );
        }


        return failures;
      },

    qualityChecks:
      (
        context
      ) => {

        const gaps:
          string[] = [];


        if (
          context.plan.totalHours <
          4
        ) {

          gaps.push(
            `Experienced athlete received only ${context.plan.totalHours} h Wednesday-Sunday.`
          );
        }


        return gaps;
      },
  },
];


function isRecord(
  value:
    unknown
): value is Record<
  string,
  unknown
> {

  return (
    !!value &&
    typeof value ===
      "object" &&
    !Array.isArray(
      value
    )
  );
}


function looksLikePlan(
  value:
    unknown
): value is TrainingPlan {

  return (
    isRecord(
      value
    ) &&
    typeof value.summary ===
      "string" &&
    typeof value.totalHours ===
      "number" &&
    Array.isArray(
      value.days
    )
  );
}


async function main() {

  const {
    loadEnvConfig,
  } =
    await import(
      "@next/env"
    );


  loadEnvConfig(
    process.cwd()
  );


  if (
    !process.env
      .OPENAI_API_KEY
  ) {

    throw new Error(
      "OPENAI_API_KEY is unavailable after loading Next.js environment files."
    );
  }


  const testUserEmail =
    process.env
      .BASSE_TEST_USER_EMAIL;

  const testUserPassword =
    process.env
      .BASSE_TEST_USER_PASSWORD;

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;


  if (
    !testUserEmail ||
    !testUserPassword
  ) {
    throw new Error(
      "BASSE_TEST_USER_EMAIL and BASSE_TEST_USER_PASSWORD are required for the authenticated live AI plan matrix."
    );
  }


  if (
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    throw new Error(
      "Supabase public environment configuration is unavailable."
    );
  }


  const {
    createClient,
  } =
    await import(
      "@supabase/supabase-js"
    );

  const scenarioAuthClient =
    createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession:
            false,

          autoRefreshToken:
            false,
        },
      }
    );

  const {
    data: authenticationData,
    error: authenticationError,
  } =
    await scenarioAuthClient
      .auth
      .signInWithPassword({
        email:
          testUserEmail,

        password:
          testUserPassword,
      });


  if (
    authenticationError ||
    !authenticationData.session
  ) {
    throw new Error(
      "The Basse AI test account could not be authenticated."
    );
  }


  const scenarioAccessToken =
    authenticationData
      .session
      .access_token;


  /*
    Import AFTER environment loading because the route
    initializes its OpenAI client at module load.
  */
  const {
    POST,
  } =
    await import(
      "../app/api/plan/route"
    );


  const results:
    ScenarioResult[] = [];


  const requestedScenario =
    Number(
      process.env
        .BASSE_AI_SCENARIO ??
      "0"
    );


  if (
    requestedScenario !== 0 &&
    (
      !Number.isInteger(
        requestedScenario
      ) ||
      requestedScenario < 1 ||
      requestedScenario >
        scenarios.length
    )
  ) {

    throw new Error(
      `BASSE_AI_SCENARIO must be between 1 and ${scenarios.length}.`
    );
  }


  const scenarioEntries =
    scenarios
      .map(
        (
          scenario,
          index
        ) =>
          [
            index,
            scenario,
          ] as const
      )
      .filter(
        (
          [
            index,
          ]
        ) =>
          requestedScenario ===
            0 ||
          index ===
            requestedScenario -
              1
      );


  console.log(
    "========================================================"
  );

  console.log(
    "BASSE — LIVE AI PLAN MATRIX LAYER 2B V1.1"
  );

  console.log(
    "========================================================"
  );

  console.log(
    `Monday anchor: ${monday}`
  );

  console.log(
    `Selected AI scenarios: ${scenarioEntries.length} of ${scenarios.length}`
  );

  if (
    requestedScenario >
    0
  ) {

    console.log(
      `Running scenario: ${requestedScenario}`
    );
  }

  console.log("");


  for (
    const [
      index,
      scenario,
    ] of scenarioEntries
  ) {

    console.log(
      `--- ${index + 1}/${scenarios.length}: ${scenario.name} ---`
    );


    try {

      const request =
        new Request(
          "http://localhost/api/plan",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${scenarioAccessToken}`,
            },

            body:
              JSON.stringify({
                athlete:
                  scenario.athlete,

                trainingAvailability:
                  [],

                todayIso:
                  scenario.todayIso,
              }),
          }
        );


      const response =
        await POST(
          request as Parameters<
            typeof POST
          >[0]
        );


      const payload:
        unknown =
        await response.json();


      if (
        !response.ok
      ) {

        const error =
          isRecord(
            payload
          ) &&
          typeof payload.error ===
            "string"
            ? payload.error
            : `HTTP ${response.status}`;


        console.log(
          `HARD FAIL — API ${response.status}: ${error}`
        );

        console.log("");


        results.push({
          name:
            scenario.name,

          status:
            "HARD_FAIL",

          responseStatus:
            response.status,

          hardFailures: [
            `API failed: ${error}`,
          ],

          qualityGaps:
            [],

          summary:
            {},

          error,
        });

        continue;
      }


      const candidate =
        (
          isRecord(
            payload
          ) &&
          looksLikePlan(
            payload.plan
          )
        )
          ? payload.plan
          : payload;


      if (
        !looksLikePlan(
          candidate
        )
      ) {

        console.log(
          "HARD FAIL — 200 response was not a recognizable TrainingPlan."
        );

        console.log("");


        results.push({
          name:
            scenario.name,

          status:
            "HARD_FAIL",

          responseStatus:
            response.status,

          hardFailures: [
            "200 response was not a recognizable TrainingPlan.",
          ],

          qualityGaps:
            [],

          summary:
            {},
        });

        continue;
      }


      const plan =
        candidate;


      const context =
        buildContext(
          plan,
          scenario.athlete,
          scenario.todayIso
        );


      const hardFailures =
        scenario.hardChecks(
          context
        );


      const qualityGaps =
        scenario.qualityChecks(
          context
        );


      const summary =
        summarize(
          context
        );


      console.log(
        `totalHours: ${plan.totalHours}`
      );

      console.log(
        `sessions: ${context.trainingSessions.length} (${plan.additionalSessions?.length ?? 0} additional)`
      );

      console.log(
        `discipline exposures: Swim ${context.swimCount} | Bike ${context.bikeCount} | Run ${context.runCount} | Strength ${context.strengthCount}`
      );

      console.log(
        `demanding: ${context.demandingSessions.length} | bricks: ${context.brickCount}`
      );

      console.log(
        `longest bike: ${context.longestBikeMinutes} min | longest run: ${context.longestRunMinutes} min`
      );

      console.log(
        `fueling guidance: ${context.hasFuelingGuidance ? "yes" : "no"}`
      );


      if (
        hardFailures.length >
        0
      ) {

        console.log(
          "HARD FAILURES:"
        );

        for (
          const failure of
          hardFailures
        ) {

          console.log(
            `  ✗ ${failure}`
          );
        }

      } else {

        console.log(
          "  ✓ hard safety checks passed"
        );
      }


      if (
        qualityGaps.length >
        0
      ) {

        console.log(
          "QUALITY GAPS:"
        );

        for (
          const gap of
          qualityGaps
        ) {

          console.log(
            `  ! ${gap}`
          );
        }

      } else {

        console.log(
          "  ✓ scenario coaching checks passed"
        );
      }


      const status:
        ScenarioResult["status"] =
        hardFailures.length >
        0
          ? "HARD_FAIL"
          : qualityGaps.length >
              0
            ? "QUALITY_GAPS"
            : "PASS";


      results.push({
        name:
          scenario.name,

        status,

        responseStatus:
          response.status,

        hardFailures,

        qualityGaps,

        summary,

        plan,
      });


      console.log(
        `RESULT: ${status}`
      );

      console.log("");


    } catch (
      error
    ) {

      const message =
        error instanceof Error
          ? error.message
          : String(
              error
            );


      console.log(
        `HARD FAIL — exception: ${message}`
      );

      console.log("");


      results.push({
        name:
          scenario.name,

        status:
          "HARD_FAIL",

        responseStatus:
          0,

        hardFailures: [
          message,
        ],

        qualityGaps:
          [],

        summary:
          {},

        error:
          message,
      });
    }
  }


  const passCount =
    results.filter(
      (result) =>
        result.status ===
        "PASS"
    ).length;


  const qualityGapCount =
    results.filter(
      (result) =>
        result.status ===
        "QUALITY_GAPS"
    ).length;


  const hardFailCount =
    results.filter(
      (result) =>
        result.status ===
        "HARD_FAIL"
    ).length;


  const resultPath =
    requestedScenario >
    0
      ? `/tmp/basse-ai-plan-scenario-${requestedScenario}-result.json`
      : "/tmp/basse-ai-plan-scenarios-v1-results.json";


  writeFileSync(
    resultPath,

    JSON.stringify(
      {
        generatedAt:
          new Date().toISOString(),

        monday,

        passCount,

        qualityGapCount,

        hardFailCount,

        results,
      },
      null,
      2
    )
  );


  console.log(
    "========================================================"
  );

  console.log(
    "LAYER 2B V1.1 RESULT"
  );

  console.log(
    "========================================================"
  );

  console.log(
    `PASS: ${passCount}`
  );

  console.log(
    `QUALITY GAPS: ${qualityGapCount}`
  );

  console.log(
    `HARD FAIL: ${hardFailCount}`
  );

  console.log("");

  console.log(
    "Full plan JSON:"
  );

  console.log(
    resultPath
  );


  if (
    hardFailCount >
    0
  ) {

    console.log(
      "✗ LIVE AI PLAN MATRIX FOUND HARD FAILURES"
    );

    process.exitCode =
      1;

    return;
  }


  if (
    qualityGapCount >
    0
  ) {

    console.log(
      "⚠ SAFETY PASSED, BUT COACHING QUALITY GAPS WERE FOUND"
    );

    return;
  }


  console.log(
    "✓ BASSE LIVE AI PLAN MATRIX LAYER 2B GREEN"
  );
}


void main().catch(
  (
    error
  ) => {

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);
