import assert from "node:assert/strict";

import type {
  TrainingPlan,
  TrainingPlanDay,
} from "../types/training";

import {
  isDemandingSession,
} from "../lib/session-classification";

import {
  isDemandingSession as multiSessionDemanding,
  normalizeCoachGeneratedPlan,
} from "../lib/multi-session-planning";

import {
  validateCanonicalGeneratedPlan,
} from "../lib/canonical-workout-validation";

import {
  auditBenchmarkUsage,
} from "../lib/benchmark-usage-audit";


let passed = 0;
let failed = 0;


function test(
  name: string,
  fn: () => void
) {
  try {
    fn();

    passed += 1;

    console.log(
      `✓ ${name}`
    );

  } catch (error) {

    failed += 1;

    console.error(
      `✗ ${name}`
    );

    console.error(error);
  }
}


function rest(
  day: string
): TrainingPlanDay {
  return {
    day,
    sport:
      "Rest",
    title:
      "Rest",
    durationMinutes:
      0,
    intensity:
      "Recovery",
    purpose:
      "Recovery",
    details:
      [],
    workoutStructure:
      [],
    strengthStructure:
      null,
  };
}


function endurance(
  {
    day,
    sport,
    title,
    durationMinutes,
    intensity,
  }: {
    day: string;
    sport:
      | "Swim"
      | "Bike"
      | "Run";
    title: string;
    durationMinutes: number;
    intensity: string;
  }
): TrainingPlanDay {

  return {
    day,
    sport,
    title,
    durationMinutes,
    intensity,
    purpose:
      "Develop endurance",
    details: [
      "Complete the prescribed session.",
    ],
    workoutStructure: [
      {
        sport,
        kind:
          "segment",
        phase:
          "Main",
        label:
          "Main aerobic work",
        repeatCount:
          1,
        workDurationSeconds:
          durationMinutes *
          60,
        workDistanceMeters:
          null,
        workIntensity:
          intensity,
        workInstruction:
          "Complete the work at the prescribed effort.",
        recoveryDurationSeconds:
          null,
        recoveryDistanceMeters:
          null,
        recoveryIntensity:
          null,
        recoveryInstruction:
          null,
      },
    ],
    strengthStructure:
      null,
  };
}


function strength(
  day: string
): TrainingPlanDay {

  return {
    day,
    sport:
      "Strength",
    title:
      "Strength maintenance",
    durationMinutes:
      45,
    intensity:
      "Controlled",
    purpose:
      "Maintain useful strength",
    details: [
      "Controlled working sets with repetitions in reserve.",
    ],
    workoutStructure:
      [],
    strengthStructure: {
      goal:
        "Maintenance",
      warmup: [
        "5 min easy movement",
        "Progressive warm-up sets",
      ],
      exercises: [
        {
          exerciseKey:
            "goblet-squat",
          name:
            "Goblet squat",
          movementPattern:
            "Squat",
          sets:
            3,
          reps:
            "6–8",
          loadGuidance:
            "RPE 7 · 3 RIR",
          restSeconds:
            120,
          instruction:
            "Move with control.",
          alternatives: [
            "Leg press",
          ],
        },
      ],
    },
  };
}


function basePlan(): TrainingPlan {

  return {
    summary:
      "Regression fixture",
    focus:
      "Safe training",
    totalHours:
      3,
    days: [
      endurance({
        day:
          "Monday",
        sport:
          "Swim",
        title:
          "Aerobic swim",
        durationMinutes:
          45,
        intensity:
          "Easy aerobic",
      }),

      rest(
        "Tuesday"
      ),

      endurance({
        day:
          "Wednesday",
        sport:
          "Bike",
        title:
          "Endurance ride",
        durationMinutes:
          60,
        intensity:
          "Easy Zone 2",
      }),

      rest(
        "Thursday"
      ),

      endurance({
        day:
          "Friday",
        sport:
          "Run",
        title:
          "Easy run",
        durationMinutes:
          45,
        intensity:
          "Conversational",
      }),

      strength(
        "Saturday"
      ),

      rest(
        "Sunday"
      ),
    ],
    additionalSessions:
      [],
  };
}


function clone<T>(
  value: T
): T {

  return structuredClone(
    value
  );
}


/*
  ========================================================
  CANONICAL DEMANDING-SESSION CLASSIFIER
  ========================================================
*/

test(
  "Threshold is demanding",
  () => {

    assert.equal(
      isDemandingSession(
        endurance({
          day:
            "Monday",
          sport:
            "Run",
          title:
            "Threshold intervals",
          durationMinutes:
            50,
          intensity:
            "Threshold",
        })
      ),
      true
    );
  }
);


test(
  "Tempo is demanding",
  () => {

    assert.equal(
      isDemandingSession(
        endurance({
          day:
            "Monday",
          sport:
            "Run",
          title:
            "Tempo run",
          durationMinutes:
            45,
          intensity:
            "Tempo",
        })
      ),
      true
    );
  }
);


test(
  "VO2 is demanding",
  () => {

    assert.equal(
      isDemandingSession(
        endurance({
          day:
            "Monday",
          sport:
            "Bike",
          title:
            "VO2 intervals",
          durationMinutes:
            60,
          intensity:
            "VO2",
        })
      ),
      true
    );
  }
);


test(
  "RPE 8 is demanding",
  () => {

    const workout =
      endurance({
        day:
          "Monday",
        sport:
          "Bike",
        title:
          "Quality bike",
        durationMinutes:
          60,
        intensity:
          "RPE 8",
      });

    assert.equal(
      isDemandingSession(
        workout
      ),
      true
    );
  }
);


test(
  "Easy brick is not automatically demanding",
  () => {

    const workout =
      endurance({
        day:
          "Monday",
        sport:
          "Bike",
        title:
          "Easy brick",
        durationMinutes:
          60,
        intensity:
          "Easy aerobic",
      });

    workout.purpose =
      "Easy transition practice";

    assert.equal(
      isDemandingSession(
        workout
      ),
      false
    );
  }
);


test(
  "Easy aerobic intervals are not automatically demanding",
  () => {

    const workout =
      endurance({
        day:
          "Monday",
        sport:
          "Swim",
        title:
          "Easy aerobic intervals",
        durationMinutes:
          45,
        intensity:
          "Easy aerobic",
      });

    assert.equal(
      isDemandingSession(
        workout
      ),
      false
    );
  }
);


test(
  "Multi-session planning uses the same demanding classifier",
  () => {

    const workout =
      endurance({
        day:
          "Monday",
        sport:
          "Run",
        title:
          "Tempo run",
        durationMinutes:
          45,
        intensity:
          "Tempo",
      });

    assert.equal(
      multiSessionDemanding(
        workout
      ),
      isDemandingSession(
        workout
      )
    );
  }
);


/*
  ========================================================
  CANONICAL WORKOUT VALIDATION
  ========================================================
*/

test(
  "Valid generated plan passes canonical validation",
  () => {

    const result =
      validateCanonicalGeneratedPlan(
        basePlan()
      );

    assert.equal(
      result.valid,
      true,
      result.errors.join(
        "\n"
      )
    );
  }
);


test(
  "Endurance workout without workoutStructure fails",
  () => {

    const plan =
      basePlan();

    plan.days[0]
      .workoutStructure =
      [];

    const result =
      validateCanonicalGeneratedPlan(
        plan
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.errors.some(
        (error) =>
          error.includes(
            "executable workoutStructure"
          )
      )
    );
  }
);


test(
  "Strength workout without strengthStructure fails",
  () => {

    const plan =
      basePlan();

    plan.days[5]
      .strengthStructure =
      null;

    const result =
      validateCanonicalGeneratedPlan(
        plan
      );

    assert.equal(
      result.valid,
      false
    );
  }
);


test(
  "Rest with positive duration fails",
  () => {

    const plan =
      basePlan();

    plan.days[1]
      .durationMinutes =
      20;

    const result =
      validateCanonicalGeneratedPlan(
        plan
      );

    assert.equal(
      result.valid,
      false
    );
  }
);


test(
  "Swim block cannot secretly become Run",
  () => {

    const plan =
      basePlan();

    const block =
      plan.days[0]
        .workoutStructure![0];

    block.sport =
      "Run";

    const result =
      validateCanonicalGeneratedPlan(
        plan
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.errors.some(
        (error) =>
          error.includes(
            "does not match its Swim session"
          )
      )
    );
  }
);


test(
  "Normal segment must have repeatCount 1",
  () => {

    const plan =
      basePlan();

    plan.days[2]
      .workoutStructure![0]
      .repeatCount =
      4;

    const result =
      validateCanonicalGeneratedPlan(
        plan
      );

    assert.equal(
      result.valid,
      false
    );
  }
);


test(
  "Repeat block requires measurable recovery",
  () => {

    const plan =
      basePlan();

    const block =
      plan.days[2]
        .workoutStructure![0];

    block.kind =
      "repeat";

    block.repeatCount =
      4;

    block.workDurationSeconds =
      300;

    block.recoveryDurationSeconds =
      null;

    block.recoveryDistanceMeters =
      null;

    block.recoveryIntensity =
      null;

    block.recoveryInstruction =
      null;

    const result =
      validateCanonicalGeneratedPlan(
        plan
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.errors.some(
        (error) =>
          error.includes(
            "does not prescribe measurable recovery"
          )
      )
    );
  }
);


test(
  "Canonical timed structure cannot exceed session duration",
  () => {

    const plan =
      basePlan();

    plan.days[2]
      .durationMinutes =
      30;

    plan.days[2]
      .workoutStructure![0]
      .workDurationSeconds =
      3600;

    const result =
      validateCanonicalGeneratedPlan(
        plan
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.errors.some(
        (error) =>
          error.includes(
            "exceeds durationMinutes"
          )
      )
    );
  }
);


test(
  "Explicit Bike-to-Run brick passes",
  () => {

    const plan =
      basePlan();

    const brick =
      plan.days[2];

    brick.title =
      "Bike to Run Brick";

    brick.purpose =
      "Practice bike-to-run transition";

    brick.durationMinutes =
      75;

    brick.details = [
      "Complete the bike work, transition quickly, then run easy.",
    ];

    brick.workoutStructure = [
      {
        sport:
          "Bike",
        kind:
          "segment",
        phase:
          "Main",
        label:
          "Bike endurance",
        repeatCount:
          1,
        workDurationSeconds:
          3600,
        workDistanceMeters:
          null,
        workIntensity:
          "Easy aerobic",
        workInstruction:
          "Ride smoothly.",
        recoveryDurationSeconds:
          null,
        recoveryDistanceMeters:
          null,
        recoveryIntensity:
          null,
        recoveryInstruction:
          null,
      },
      {
        sport:
          "Run",
        kind:
          "segment",
        phase:
          "Main",
        label:
          "Transition run",
        repeatCount:
          1,
        workDurationSeconds:
          900,
        workDistanceMeters:
          null,
        workIntensity:
          "Easy",
        workInstruction:
          "Run relaxed off the bike.",
        recoveryDurationSeconds:
          null,
        recoveryDistanceMeters:
          null,
        recoveryIntensity:
          null,
        recoveryInstruction:
          null,
      },
    ];

    const result =
      validateCanonicalGeneratedPlan(
        plan
      );

    assert.equal(
      result.valid,
      true,
      result.errors.join(
        "\n"
      )
    );
  }
);


test(
  "Hidden Run block inside normal Bike workout fails",
  () => {

    const plan =
      basePlan();

    const workout =
      plan.days[2];

    workout.title =
      "Endurance ride";

    workout.purpose =
      "Build bike endurance";

    workout.details = [
      "Steady aerobic ride.",
    ];

    workout.workoutStructure!.push({
      sport:
        "Run",
      kind:
        "segment",
      phase:
        "Main",
      label:
        "Easy run",
      repeatCount:
        1,
      workDurationSeconds:
        600,
      workDistanceMeters:
        null,
      workIntensity:
        "Easy",
      workInstruction:
        "Run easily.",
      recoveryDurationSeconds:
        null,
      recoveryDistanceMeters:
        null,
      recoveryIntensity:
        null,
      recoveryInstruction:
        null,
    });

    workout.durationMinutes =
      70;

    const result =
      validateCanonicalGeneratedPlan(
        plan
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.errors.some(
        (error) =>
          error.includes(
            "not described as a brick"
          )
      )
    );
  }
);


/*
  ========================================================
  MULTI-SESSION NORMALIZATION
  ========================================================
*/

test(
  "Normalization prevents two demanding sessions on one day",
  () => {

    const plan =
      basePlan();

    plan.days[2] =
      endurance({
        day:
          "Wednesday",
        sport:
          "Bike",
        title:
          "Threshold bike",
        durationMinutes:
          60,
        intensity:
          "Threshold",
      });

    plan.additionalSessions = [
      {
        ...endurance({
          day:
            "Wednesday",
          sport:
            "Run",
          title:
            "Tempo run",
          durationMinutes:
            30,
          intensity:
            "Tempo",
        }),
        sessionSource:
          "coach",
        sessionRole:
          "secondary",
        sessionSlot:
          "PM",
      },
    ];

    const normalized =
      normalizeCoachGeneratedPlan(
        clone(plan)
      );

    assert.equal(
      normalized
        .additionalSessions
        ?.length,
      0
    );
  }
);


/*
  ========================================================
  BENCHMARK SAFETY
  ========================================================
*/

test(
  "Bike watt target without FTP is rejected even inside workoutStructure",
  () => {

    const plan =
      basePlan();

    plan.days[2]
      .workoutStructure![0]
      .workIntensity =
      "250 W";

    const result =
      auditBenchmarkUsage({
        plan,
        benchmarks:
          undefined,
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.errors.some(
        (error) =>
          error.includes(
            "without a valid FTP"
          )
      )
    );
  }
);


test(
  "Swim pace target without CSS is rejected inside workoutStructure",
  () => {

    const plan =
      basePlan();

    plan.days[0]
      .workoutStructure![0]
      .workIntensity =
      "1:45 / 100 m";

    const result =
      auditBenchmarkUsage({
        plan,
        benchmarks:
          undefined,
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.errors.some(
        (error) =>
          error.includes(
            "without a valid CSS"
          )
      )
    );
  }
);


test(
  "Benchmark audit also checks additionalSessions",
  () => {

    const plan =
      basePlan();

    const secondary =
      endurance({
        day:
          "Saturday",
        sport:
          "Bike",
        title:
          "Secondary bike",
        durationMinutes:
          30,
        intensity:
          "Easy",
      });

    secondary
      .workoutStructure![0]
      .workIntensity =
      "300 W";

    plan.additionalSessions = [
      {
        ...secondary,
        sessionSource:
          "coach",
        sessionRole:
          "secondary",
        sessionSlot:
          "PM",
      },
    ];

    const result =
      auditBenchmarkUsage({
        plan,
        benchmarks:
          undefined,
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.errors.some(
        (error) =>
          error.includes(
            "without a valid FTP"
          )
      )
    );
  }
);


/*
  ========================================================
  RESULT
  ========================================================
*/

console.log("");
console.log(
  `Regression result: ${passed} passed, ${failed} failed`
);


if (failed > 0) {

  process.exitCode = 1;

} else {

  console.log(
    "✓ BASSE COACHING REGRESSION LAYER 1 GREEN"
  );
}
