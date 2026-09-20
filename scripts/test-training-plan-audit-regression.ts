import assert from "node:assert/strict";

import type {
  TrainingPlan,
  TrainingPlanDay,
} from "../types/training";

import {
  auditTrainingPlan,
} from "../lib/training-plan-audit";


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

    console.error(
      error
    );
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
      "Rest",
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


function endurance({
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
}): TrainingPlanDay {

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
          "Main work",
        repeatCount:
          1,
        workDurationSeconds:
          durationMinutes * 60,
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


function basePlan(): TrainingPlan {

  return {
    summary:
      "Audit regression fixture",

    focus:
      "Safe training",

    totalHours:
      2.5,

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
          "Easy aerobic",
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

      rest(
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


function recalculate(
  plan: TrainingPlan
) {

  const totalMinutes = [
    ...plan.days,
    ...(
      plan.additionalSessions ??
      []
    ),
  ].reduce(
    (
      sum,
      session
    ) =>
      sum +
      Math.max(
        0,
        session.durationMinutes
      ),
    0
  );


  plan.totalHours =
    Number(
      (
        totalMinutes /
        60
      ).toFixed(
        2
      )
    );
}


function audit(
  plan: TrainingPlan
) {

  return auditTrainingPlan({
    plan,

    athlete: {
      goal:
        "Sprint",
      experience:
        "Experienced",
      swimLevel:
        "Confident",
      poolAccess:
        true,
      gymAccess:
        true,
      longestSessionMinutes:
        300,
    },

    phase:
      "Build",
  });
}


test(
  "Canonical repeat recovery prevents false recovery warning",
  () => {

    const plan =
      basePlan();

    const workout =
      plan.days[2];


    workout.title =
      "Bike threshold intervals";

    workout.durationMinutes =
      105;

    workout.intensity =
      "Controlled hard RPE 7";

    workout.details = [
      "Progressive warm-up.",
      "Complete the main set evenly.",
      "Cool down easily.",
    ];

    workout.workoutStructure = [
      {
        sport:
          "Bike",
        kind:
          "segment",
        phase:
          "Warm-up",
        label:
          "Warm-up",
        repeatCount:
          1,
        workDurationSeconds:
          1200,
        workDistanceMeters:
          null,
        workIntensity:
          "Easy",
        workInstruction:
          "Build gradually.",
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
          "Bike",
        kind:
          "repeat",
        phase:
          "Main",
        label:
          "Threshold work",
        repeatCount:
          3,
        workDurationSeconds:
          720,
        workDistanceMeters:
          null,
        workIntensity:
          "Controlled hard RPE 7",
        workInstruction:
          "Ride evenly.",
        recoveryDurationSeconds:
          240,
        recoveryDistanceMeters:
          null,
        recoveryIntensity:
          "Easy",
        recoveryInstruction:
          "Spin easily between efforts.",
      },

      {
        sport:
          "Bike",
        kind:
          "segment",
        phase:
          "Cool-down",
        label:
          "Cool-down",
        repeatCount:
          1,
        workDurationSeconds:
          960,
        workDistanceMeters:
          null,
        workIntensity:
          "Easy",
        workInstruction:
          "Finish easily.",
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


    recalculate(
      plan
    );


    const result =
      audit(
        plan
      );


    assert.equal(
      result.warnings.some(
        (warning) =>
          warning.includes(
            "does not clearly describe recovery between efforts"
          )
      ),
      false,
      result.warnings.join(
        "\n"
      )
    );


    assert.equal(
      result.warnings.some(
        (warning) =>
          warning.includes(
            "does not specify measurable interval structure"
          )
      ),
      false,
      result.warnings.join(
        "\n"
      )
    );
  }
);


test(
  "100-minute threshold bike is not mislabeled as long endurance",
  () => {

    const plan =
      basePlan();

    const workout =
      plan.days[2];


    workout.title =
      "Controlled bike threshold";

    workout.durationMinutes =
      100;

    workout.intensity =
      "Controlled hard RPE 7";

    workout.details = [
      "20 min progressive warm-up.",
      "4 x 10 min controlled hard.",
      "5 min easy spinning between efforts.",
      "20 min easy cooldown.",
    ];


    recalculate(
      plan
    );


    const result =
      audit(
        plan
      );


    assert.equal(
      result.warnings.some(
        (warning) =>
          warning.includes(
            "long endurance session without an explicit fueling/hydration"
          )
      ),
      false,
      result.warnings.join(
        "\n"
      )
    );
  }
);


test(
  "Genuine long endurance bike without fueling still warns",
  () => {

    const plan =
      basePlan();

    const workout =
      plan.days[2];


    workout.title =
      "Long endurance bike";

    workout.durationMinutes =
      150;

    workout.intensity =
      "Easy aerobic";

    workout.details = [
      "Ride steadily at conversational effort.",
    ];


    recalculate(
      plan
    );


    const result =
      audit(
        plan
      );


    assert.equal(
      result.warnings.some(
        (warning) =>
          warning.includes(
            "long endurance session without an explicit fueling/hydration"
          )
      ),
      true,
      result.warnings.join(
        "\n"
      )
    );
  }
);


console.log(
  `Audit regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {
  process.exitCode =
    1;
} else {
  console.log(
    "✓ BASSE TRAINING PLAN AUDIT REGRESSION GREEN"
  );
}
