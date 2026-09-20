import assert from "node:assert/strict";

import {
  prepareCoachPlanForReturn,
  validateCoachCanonicalChanges,
  validateCoachPlanAvailability,
} from "../lib/coach-plan-safety";

import type {
  TrainingPlan,
  TrainingPlanDay,
} from "../types/training";


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


function legacyStrength():
  TrainingPlanDay {

  return {
    sessionId:
      "legacy-strength",

    day:
      "Tuesday",

    sport:
      "Strength",

    title:
      "Legacy strength",

    durationMinutes:
      40,

    intensity:
      "Moderate",

    purpose:
      "General strength",

    details: [
      "Legacy stored prescription",
    ],

    workoutStructure:
      [],

    strengthStructure:
      null,
  };
}


function bike(
  durationMinutes:
    number
): TrainingPlanDay {

  return {
    sessionId:
      "bike-1",

    day:
      "Wednesday",

    sport:
      "Bike",

    title:
      "Aerobic bike",

    durationMinutes,

    intensity:
      "Easy aerobic RPE 2-3",

    purpose:
      "Aerobic endurance",

    details: [
      `${durationMinutes} min easy aerobic riding.`,
    ],

    workoutStructure: [
      {
        sport:
          "Bike",
        kind:
          "segment",
        phase:
          "Main",
        label:
          "Aerobic endurance",
        repeatCount:
          1,
        workDurationSeconds:
          durationMinutes * 60,
        workDistanceMeters:
          null,
        workIntensity:
          "Easy aerobic RPE 2-3",
        workInstruction:
          "Ride smoothly at conversational effort.",
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


function currentPlan():
  TrainingPlan {

  return {
    summary:
      "Current week",

    totalHours:
      1.67,

    focus:
      "Consistency",

    weekStart:
      "2026-09-14",

    weekNumber:
      38,

    days: [
      rest(
        "Monday"
      ),
      legacyStrength(),
      bike(
        60
      ),
      rest(
        "Thursday"
      ),
      rest(
        "Friday"
      ),
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


test(
  "Unchanged legacy Strength may pass through",
  () => {

    const current =
      currentPlan();

    const proposed =
      structuredClone(
        current
      );


    const result =
      validateCoachCanonicalChanges({
        currentPlan:
          current,

        proposedPlan:
          proposed,
      });


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
  "Modified legacy Strength must become canonical",
  () => {

    const current =
      currentPlan();

    const proposed =
      structuredClone(
        current
      );

    proposed.days[1] = {
      ...proposed.days[1],

      durationMinutes:
        45,

      details: [
        "Modified without canonical strength structure",
      ],
    };


    const result =
      validateCoachCanonicalChanges({
        currentPlan:
          current,

        proposedPlan:
          proposed,
      });


    assert.equal(
      result.valid,
      false
    );

    assert.equal(
      result.errors.length >
        0,
      true
    );
  }
);


test(
  "Malformed new endurance session is rejected",
  () => {

    const current =
      currentPlan();

    const proposed =
      structuredClone(
        current
      );

    proposed.days[3] = {
      day:
        "Thursday",

      sport:
        "Run",

      title:
        "New run",

      durationMinutes:
        40,

      intensity:
        "Easy",

      purpose:
        "Aerobic endurance",

      details: [
        "40 min easy running",
      ],

      workoutStructure:
        [],

      strengthStructure:
        null,
    };


    const result =
      validateCoachCanonicalChanges({
        currentPlan:
          current,

        proposedPlan:
          proposed,
      });


    assert.equal(
      result.valid,
      false
    );
  }
);


test(
  "Coach return plan receives authoritative active-week dates",
  () => {

    const current =
      currentPlan();

    const proposed =
      structuredClone(
        current
      );

    proposed.days[2].date =
      "2099-01-01";


    const prepared =
      prepareCoachPlanForReturn({
        currentPlan:
          current,

        proposedPlan:
          proposed,
      });


    assert.equal(
      prepared.weekStart,
      "2026-09-14"
    );

    assert.equal(
      prepared.days[2].date,
      "2026-09-16"
    );
  }
);


test(
  "Coach server rejects Calendar availability conflict",
  () => {

    const current =
      currentPlan();

    const prepared =
      prepareCoachPlanForReturn({
        currentPlan:
          current,

        proposedPlan:
          structuredClone(
            current
          ),
      });


    const result =
      validateCoachPlanAvailability({
        plan:
          prepared,

        athlete:
          null,

        availability: [
          {
            date:
              "2026-09-16",

            status:
              "Unavailable",
          },
        ],
      });


    assert.equal(
      result.valid,
      false
    );

    assert.equal(
      result.violations.length >
        0,
      true
    );
  }
);


console.log(
  `Coach plan safety regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {

  process.exitCode =
    1;

} else {

  console.log(
    "✓ BASSE COACH PLAN SAFETY REGRESSION GREEN"
  );
}
