import {
  isDemandingSession,
} from "@/lib/session-classification";

import {
  getMultiSessionPlanningProfile,
} from "@/lib/multi-session-planning";


type AuditWorkout = {
  day: string;
  sport: string;
  title: string;
  durationMinutes: number;
  intensity: string;
  purpose: string;
  details?: string[];

  workoutStructure?: Array<{
    sport?: string | null;
    kind?: string | null;
    repeatCount?: number | null;

    workDurationSeconds?: number | null;
    workDistanceMeters?: number | null;

    recoveryDurationSeconds?: number | null;
    recoveryDistanceMeters?: number | null;

    recoveryIntensity?: string | null;
    recoveryInstruction?: string | null;
  }>;

  isRaceDay?: boolean;
  isPostRace?: boolean;

  sessionSource?:
    | "coach"
    | "athlete";

  sessionRole?:
    | "primary"
    | "secondary";
};

type AuditPlan = {
  totalHours: number;
  days: AuditWorkout[];
  additionalSessions?: AuditWorkout[];
};

type AuditAthlete = {
  goal?: string | null;

  experience?: string | null;
  swimLevel?: string | null;
  poolAccess?: boolean;
  gymAccess?: boolean;

  longestSessionMinutes?:
    | string
    | number
    | null;
};

export type PlanAuditResult = {
  valid: boolean;

  errors: string[];
  warnings: string[];

  metrics: {
    totalMinutes: number;
    hardSessions: number;
    restDays: number;

    swimSessions: number;
    bikeSessions: number;
    runSessions: number;
    strengthSessions: number;
  };
};


const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];


function textOf(
  workout: AuditWorkout
) {
  return [
    workout.sport,
    workout.title,
    workout.intensity,
    workout.purpose,
    ...(workout.details ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}


function hasCanonicalIntervalStructure(
  workout: AuditWorkout
) {

  return (
    workout.workoutStructure ??
    []
  ).some(
    (block) => {

      const repeated =
        block.kind === "repeat" ||
        (
          block.repeatCount ??
          1
        ) > 1;


      const measurableWork =
        (
          block.workDurationSeconds ??
          0
        ) > 0 ||
        (
          block.workDistanceMeters ??
          0
        ) > 0;


      return (
        repeated &&
        measurableWork
      );
    }
  );
}


function hasCanonicalRecovery(
  workout: AuditWorkout
) {

  return (
    workout.workoutStructure ??
    []
  ).some(
    (block) => {

      const repeated =
        block.kind === "repeat" ||
        (
          block.repeatCount ??
          1
        ) > 1;


      if (!repeated) {
        return false;
      }


      return (
        (
          block.recoveryDurationSeconds ??
          0
        ) > 0 ||
        (
          block.recoveryDistanceMeters ??
          0
        ) > 0
      );
    }
  );
}


/*
  Fueling reminders target genuinely long endurance work.

  Duration alone must not turn a 90–100 minute threshold
  workout into a "long endurance session".
*/
function isFuelingRelevantEndurance(
  workout: AuditWorkout
) {

  if (
    workout.sport !== "Bike" &&
    workout.sport !== "Run"
  ) {
    return false;
  }


  const text =
    textOf(
      workout
    );


  return (
    workout.durationMinutes >= 120 ||
    /\blong ride\b|\blong bike\b|\blong run\b|\blong endurance\b/.test(
      text
    )
  );
}


function isLongRun(
  workout: AuditWorkout
) {
  return (
    workout.sport === "Run" &&
    (
      workout.durationMinutes >= 75 ||
      /long run/.test(
        textOf(workout)
      )
    )
  );
}


function isHeavyStrength(
  workout: AuditWorkout
) {
  if (
    workout.sport !== "Strength"
  ) {
    return false;
  }

  const text = textOf(workout);

  return (
    /\bheavy\b/.test(text) ||
    /\bstrength\b/.test(text) &&
      (
        /\b3 x [3-6]\b/.test(text) ||
        /\b4 x [3-6]\b/.test(text) ||
        /\b5 x [3-6]\b/.test(text)
      )
  );
}


function numberOrNull(
  value: unknown
) {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}


export function auditTrainingPlan({
  plan,
  athlete,
  phase,
  previousPlan,
  recommendedHoursMin,
  recommendedHoursMax,
}: {
  plan: AuditPlan;
  athlete: AuditAthlete;
  phase?: string | null;

  previousPlan?: AuditPlan | null;

  recommendedHoursMin?: number | null;
  recommendedHoursMax?: number | null;
}): PlanAuditResult {

  const errors: string[] = [];
  const warnings: string[] = [];

  const additionalSessions =
    plan.additionalSessions ??
    [];


  const allSessions = [
    ...plan.days,
    ...additionalSessions,
  ];


  const trainingDays =
    allSessions.filter(
      (day) =>
        day.sport !==
          "Rest" &&
        day.durationMinutes >
          0
    );


  const totalMinutes =
    trainingDays.reduce(
      (sum, workout) =>
        sum +
        workout.durationMinutes,
      0
    );


  const calculatedHours =
    totalMinutes /
    60;


  const hardSessions =
    trainingDays.filter(
      isDemandingSession
    );


  /*
    Rest days are CALENDAR days with no training,
    not simply primary Rest placeholders.
  */
  const restDays =
    DAYS.filter(
      (day) =>
        !trainingDays.some(
          (workout) =>
            workout.day ===
            day
        )
    );

  const swimSessions =
    trainingDays.filter(
      (day) => day.sport === "Swim"
    );

  const bikeSessions =
    trainingDays.filter(
      (day) => day.sport === "Bike"
    );

  const runSessions =
    trainingDays.filter(
      (day) => day.sport === "Run"
    );

  const strengthSessions =
    trainingDays.filter(
      (day) =>
        day.sport === "Strength"
    );


  // =====================================================
  // BASIC WEEK STRUCTURE
  // =====================================================

  if (plan.days.length !== 7) {
    errors.push(
      `Plan contains ${plan.days.length} days instead of exactly 7.`
    );
  }


  for (const day of DAYS) {
    const matches =
      plan.days.filter(
        (item) =>
          item.day === day
      );

    if (matches.length !== 1) {
      errors.push(
        `${day} must appear exactly once.`
      );
    }
  }


  // =====================================================
  // TOTAL HOURS CONSISTENCY
  // =====================================================

  if (
    Math.abs(
      calculatedHours -
      plan.totalHours
    ) > 0.35
  ) {
    errors.push(
      `Plan totalHours (${plan.totalHours}) does not match daily durations (${calculatedHours.toFixed(1)} h).`
    );
  }


  // =====================================================
  // DETERMINISTIC LOAD ENVELOPE
  // =====================================================

  if (
    typeof recommendedHoursMin ===
      "number" &&
    calculatedHours <
      recommendedHoursMin - 0.15
  ) {
    errors.push(
      `Plan volume ${calculatedHours.toFixed(1)} h is below the allowed ${recommendedHoursMin} h minimum.`
    );
  }


  if (
    typeof recommendedHoursMax ===
      "number" &&
    calculatedHours >
      recommendedHoursMax + 0.15
  ) {
    errors.push(
      `Plan volume ${calculatedHours.toFixed(1)} h exceeds the allowed ${recommendedHoursMax} h maximum.`
    );
  }


  // =====================================================
  // ATHLETE SESSION LIMIT
  // =====================================================

  const maxSession =
    numberOrNull(
      athlete.longestSessionMinutes
    );

  if (maxSession !== null) {
    for (const workout of trainingDays) {
      if (
        workout.durationMinutes >
        maxSession
      ) {
        errors.push(
          `${workout.day} exceeds the athlete's maximum realistic session duration (${workout.durationMinutes} > ${maxSession} min).`
        );
      }
    }
  }


  // =====================================================
  // EQUIPMENT
  // =====================================================

  if (
    athlete.poolAccess === false &&
    swimSessions.length > 0
  ) {
    errors.push(
      "Plan contains swimming despite no pool access."
    );
  }


  // =====================================================
  // INTENSITY DENSITY
  // =====================================================

  const experience =
    (
      athlete.experience ?? ""
    ).toLowerCase();

  const developing =
    experience.includes(
      "beginner"
    ) ||
    experience.includes(
      "develop"
    ) ||
    experience.includes(
      "recreational"
    );


  const multiSessionProfile =
    getMultiSessionPlanningProfile({
      experience,
      weeklyHours:
        plan.totalHours,
    });

  if (
    additionalSessions.length >
    multiSessionProfile
      .normalAdditionalMax
  ) {
    warnings.push(
      `Plan has ${additionalSessions.length} additional sessions at ${plan.totalHours.toFixed(1)} h/week. The normal planning range is ${multiSessionProfile.normalAdditionalMin}-${multiSessionProfile.normalAdditionalMax}; confirm that the frequency is intentional and supported by recovery and training history.`
    );
  }

  if (
    plan.totalHours >= 13 &&
    additionalSessions.length <
      multiSessionProfile
        .normalAdditionalMin
  ) {
    warnings.push(
      `This is a ${plan.totalHours.toFixed(1)} h week with only ${additionalSessions.length} additional sessions. Consider whether doubles would distribute the load more naturally instead of relying on unusually long single sessions.`
    );
  }


  for (
    const day
    of DAYS
  ) {

    const sessions =
      trainingDays.filter(
        (workout) =>
          workout.day ===
          day
      );


    if (
      sessions.length >
      3
    ) {
      errors.push(
        `${day} contains ${sessions.length} structured sessions. Maximum is 3.`
      );
    }


    if (
      sessions.filter(
        isDemandingSession
      ).length >
      1
    ) {
      errors.push(
        `${day} contains two demanding sessions. Keep at most one hard session per day.`
      );
    }


    const secondaryOnDay =
      additionalSessions.filter(
        (workout) =>
          workout.day ===
          day
      );


    /*
      A demanding additional session is allowed when it is
      the day's single purposeful quality session.

      Storage role must not determine training quality.
      The real safety rule is no more than one demanding
      endurance session on the same calendar day.
    */


    const primary =
      plan.days.find(
        (workout) =>
          workout.day ===
          day
      );


    if (
      primary &&
      (
        primary.sport ===
          "Rest" ||
        primary.isRaceDay ||
        primary.isPostRace
      ) &&
      secondaryOnDay.length >
        0
    ) {
      errors.push(
        `${day} has a secondary session attached to Rest, race day or post-race.`
      );
    }
  }


  if (
    developing &&
    hardSessions.length > 2
  ) {
    errors.push(
      `Developing athlete has ${hardSessions.length} demanding sessions. Maximum should normally be 2.`
    );
  }


  if (
    !developing &&
    hardSessions.length > 3
  ) {
    warnings.push(
      `Week contains ${hardSessions.length} demanding sessions. Confirm that this density is intentional.`
    );
  }


  // =====================================================
  // QUALITY SESSION STRUCTURE
  // =====================================================

  for (
    const workout
    of hardSessions
  ) {
    const details =
      workout.details ?? [];

    const detailText =
      details
        .join(" ")
        .toLowerCase();

    /*
      Demanding sessions should contain enough
      information to execute the workout.

      We do not demand a specific interval format,
      but vague "go hard" prescriptions are not
      acceptable.
    */

    if (details.length < 3) {
      warnings.push(
        `${workout.day} ${workout.sport.toLowerCase()} quality session has too little execution detail. Include warm-up, main work and recovery / cooldown guidance.`
      );
    }


    const intervalLike =
      /interval|threshold|vo2|vo₂|hill repeat/.test(
        textOf(workout)
      );


    if (
      intervalLike &&
      !/\d/.test(detailText) &&
      !hasCanonicalIntervalStructure(
        workout
      )
    ) {
      warnings.push(
        `${workout.day} interval session does not specify measurable interval structure. State repetitions and/or work duration clearly.`
      );
    }


    if (
      intervalLike &&
      !hasCanonicalRecovery(
        workout
      ) &&
      !/recover|recovery|easy jog|easy spin|rest|between efforts|between intervals|between reps|between repetitions/.test(
        detailText
      )
    ) {
      warnings.push(
        `${workout.day} interval session does not clearly describe recovery between efforts.`
      );
    }
  }


  // =====================================================
  // BACK-TO-BACK HARD DAYS
  // =====================================================

  for (
    let i = 0;
    i < DAYS.length - 1;
    i++
  ) {

    const currentHard =
      trainingDays.some(
        (workout) =>
          workout.day ===
            DAYS[i] &&
          isDemandingSession(
            workout
          )
      );


    const nextHard =
      trainingDays.some(
        (workout) =>
          workout.day ===
            DAYS[i + 1] &&
          isDemandingSession(
            workout
          )
      );


    if (
      currentHard &&
      nextHard
    ) {
      errors.push(
        `${DAYS[i]} and ${DAYS[i + 1]} are both demanding. Avoid unnecessary consecutive hard days.`
      );
    }
  }


  // =====================================================
  // STRENGTH PLACEMENT
  // =====================================================

  for (
    let i = 0;
    i < plan.days.length - 1;
    i++
  ) {
    const current =
      plan.days[i];

    const next =
      plan.days[i + 1];

    if (
      isHeavyStrength(current) &&
      (
        isDemandingSession(next) ||
        isLongRun(next)
      )
    ) {
      warnings.push(
        `${current.day} heavy strength directly precedes an important ${next.sport.toLowerCase()} session on ${next.day}. Consider moving or reducing the strength session.`
      );
    }
  }


  // =====================================================
  // LONG RUN QUALITY
  // =====================================================

  for (const workout of trainingDays) {
    if (
      isLongRun(workout) &&
      isDemandingSession(workout)
    ) {
      warnings.push(
        `${workout.day} combines a long run with demanding intensity. Confirm that this is genuinely required.`
      );
    }
  }


  // =====================================================
  // BEGINNER SWIM STRUCTURE
  // =====================================================

  const beginnerSwimmer =
    (
      athlete.swimLevel ?? ""
    )
      .toLowerCase()
      .includes("beginner");


  if (
    beginnerSwimmer &&
    athlete.poolAccess !== false &&
    swimSessions.length === 1 &&
    calculatedHours >= 6
  ) {
    warnings.push(
      "Beginner swimmer has only one swim exposure despite a moderate weekly training volume. Consider two shorter technique-focused swims if schedule permits."
    );
  }


  // =====================================================
  // FUELING PRACTICE
  // =====================================================

  for (
    const workout
    of plan.days
  ) {

    if (
      isFuelingRelevantEndurance(
        workout
      )
    ) {

      const text =
        textOf(
          workout
        );


      if (
        !/fuel|carbohydrate|carbs|nutrition|drink|hydration/.test(
          text
        )
      ) {
        warnings.push(
          `${workout.day} is a long endurance session without an explicit fueling/hydration practice reminder.`
        );
      }
    }
  }


  // =====================================================
  // RACE-DISTANCE SPECIFICITY
  // =====================================================

  const goal =
    (
      athlete.goal ?? ""
    )
      .toLowerCase()
      .trim();


  const is703 =
    goal.includes("70.3") ||
    goal.includes("half");


  const isIronman =
    (
      goal.includes(
        "ironman"
      ) &&
      !goal.includes("70.3")
    ) ||
    goal.includes("140.6") ||
    goal.includes("full");


  const isLongCourse =
    is703 ||
    isIronman;


  const phaseLower =
    (
      phase ?? ""
    ).toLowerCase();


  const specificPhase =
    phaseLower === "build" ||
    phaseLower === "peak";


  if (
    isLongCourse &&
    specificPhase
  ) {

    const longestBike =
      bikeSessions.length > 0
        ? Math.max(
            ...bikeSessions.map(
              (bike) =>
                bike.durationMinutes
            )
          )
        : 0;


    if (
      is703 &&
      longestBike < 90
    ) {
      warnings.push(
        "70.3 Build/Peak week contains no 90+ minute bike. Confirm that cycling endurance and race specificity are being developed elsewhere."
      );
    }


    if (
      isIronman &&
      longestBike < 120
    ) {
      warnings.push(
        "Ironman Build/Peak week contains no 120+ minute bike. Confirm that long-course cycling durability is being developed appropriately."
      );
    }


    const longCourseSessions =
      trainingDays.filter(
        isFuelingRelevantEndurance
      );


    const fuelingPractice =
      longCourseSessions.some(
        (session) =>
          /fuel|carbohydrate|carbs|nutrition|hydration|drink/.test(
            textOf(session)
          )
      );


    if (
      longCourseSessions.length >
        0 &&
      !fuelingPractice
    ) {
      warnings.push(
        "Long-course Build/Peak week has substantial endurance training but no explicit fueling or hydration practice."
      );
    }


    const brickLike =
      trainingDays.some(
        (session) =>
          /brick|transition|bike.?to.?run/.test(
            textOf(session)
          )
      );


    if (
      phaseLower === "peak" &&
      !brickLike
    ) {
      warnings.push(
        "Long-course Peak week contains no obvious bike-to-run transition work. Confirm that brick familiarity is present elsewhere in the recent plan."
      );
    }
  }


  const isSprint =
    goal.includes("sprint");


  if (
    isSprint &&
    developing
  ) {
    const veryLongSessions =
      trainingDays.filter(
        (session) =>
          session.durationMinutes >=
            150
      );

    if (
      veryLongSessions.length >
        0
    ) {
      warnings.push(
        "Developing Sprint athlete has a 150+ minute session. Confirm that this large endurance dose is more valuable than frequency, technical work or controlled quality."
      );
    }
  }


  // =====================================================
  // TAPER
  // =====================================================

  if (
    phase?.toLowerCase() ===
      "taper"
  ) {
    if (
      previousPlan &&
      calculatedHours >=
        previousPlan.totalHours
    ) {
      errors.push(
        "Taper week does not reduce training volume relative to the previous week."
      );
    }

    const taperLongRuns =
      runSessions.filter(
        (run) =>
          run.durationMinutes >= 80
      );

    if (
      taperLongRuns.length > 0
    ) {
      warnings.push(
        "Taper contains a long run of 80+ minutes. Confirm that residual fatigue is justified this close to race day."
      );
    }

    const heavyStrength =
      strengthSessions.filter(
        isHeavyStrength
      );

    if (
      heavyStrength.length > 0
    ) {
      warnings.push(
        "Taper contains heavy strength work. Prefer low-volume maintenance that does not create soreness."
      );
    }
  }


  // =====================================================
  // REST / LOW LOAD
  // =====================================================

  if (
    developing &&
    restDays.length === 0
  ) {
    warnings.push(
      "Developing athlete has no full rest day. Confirm that at least one day is genuinely low-load."
    );
  }


  return {
    valid:
      errors.length === 0,

    errors,
    warnings,

    metrics: {
      totalMinutes,

      hardSessions:
        hardSessions.length,

      restDays:
        restDays.length,

      swimSessions:
        swimSessions.length,

      bikeSessions:
        bikeSessions.length,

      runSessions:
        runSessions.length,

      strengthSessions:
        strengthSessions.length,
    },
  };
}
