import assert from "node:assert/strict";

import {
  prepareCoachPlanForReturn,
  validateCoachCanonicalChanges,
  validateCoachPlanAvailability,
} from "../lib/coach-plan-safety";

import {
  applyTargetRaceWeekSpecialStates,
  validateTargetRaceWeekSpecialStates,
} from "../lib/target-race-week";

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


function bike(
  day: string,
  durationMinutes:
    number
): TrainingPlanDay {

  return {
    sessionId:
      `${day}-bike`,

    day,

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


function plan():
  TrainingPlan {

  return {
    summary:
      "Goal-change safety fixture",

    totalHours:
      1,

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
      bike(
        "Tuesday",
        60
      ),
      rest(
        "Wednesday"
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
  "Goal-change unchanged current week remains canonical",
  () => {

    const current =
      plan();

    const proposed =
      prepareCoachPlanForReturn({
        currentPlan:
          current,

        proposedPlan:
          structuredClone(
            current
          ),
      });


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
  "Goal-change malformed modified workout is rejected",
  () => {

    const current =
      plan();

    const proposed =
      structuredClone(
        current
      );


    proposed.days[1] = {
      ...proposed.days[1],

      durationMinutes:
        75,

      workoutStructure:
        [],
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
  "Goal-change current week receives authoritative dates",
  () => {

    const current =
      plan();

    const proposed =
      structuredClone(
        current
      );


    proposed.days[1].date =
      "2099-01-01";


    const prepared =
      prepareCoachPlanForReturn({
        currentPlan:
          current,

        proposedPlan:
          proposed,
      });


    assert.equal(
      prepared.days[1].date,
      "2026-09-15"
    );
  }
);


test(
  "Goal-change cannot violate Calendar availability",
  () => {

    const current =
      plan();

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
              "2026-09-15",

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




test(
  "Goal-change target race inside current week receives deterministic Race Day and post-race states",
  () => {

    const current =
      plan();


    /*
      Make the fixture more realistic:

      - Monday: 30 min Bike
      - Tuesday: 60 min Bike
      - Wednesday: Rest
      - Thursday: 20 min Bike
      - Friday: target race
      - Saturday/Sunday: must become post-race recovery

      Two secondary sessions are included:
      - Thursday should survive
      - Saturday must disappear
    */
    current.days[0] =
      bike(
        "Monday",
        30
      );

    current.days[3] =
      bike(
        "Thursday",
        20
      );

    current.days[4] =
      bike(
        "Friday",
        45
      );

    current.days[5] =
      bike(
        "Saturday",
        60
      );

    current.days[6] =
      bike(
        "Sunday",
        60
      );


    current.additionalSessions = [
      {
        ...bike(
          "Thursday",
          25
        ),

        sessionId:
          "thursday-secondary",

        sessionSource:
          "coach",

        sessionRole:
          "secondary",
      },

      {
        ...bike(
          "Saturday",
          30
        ),

        sessionId:
          "saturday-secondary",

        sessionSource:
          "coach",

        sessionRole:
          "secondary",
      },
    ];


    /*
      Authoritative dates are attached first,
      matching the real Goal Change safety flow.
    */
    const dated =
      prepareCoachPlanForReturn({
        currentPlan:
          current,

        proposedPlan:
          structuredClone(
            current
          ),
      });


    const overlaid =
      applyTargetRaceWeekSpecialStates({
        plan:
          dated,

        raceDate:
          "2026-09-18",

        raceName:
          "Basse Test Triathlon",

        raceFormat:
          "70.3",
      });


    const friday =
      overlaid.days[4];

    const saturday =
      overlaid.days[5];

    const sunday =
      overlaid.days[6];


    assert.equal(
      friday.date,
      "2026-09-18"
    );

    assert.equal(
      friday.sport,
      "Triathlon"
    );

    assert.equal(
      friday.isRaceDay,
      true
    );

    assert.equal(
      friday.isPostRace,
      false
    );

    assert.equal(
      friday.targetRaceName,
      "Basse Test Triathlon"
    );

    assert.equal(
      friday.durationMinutes,
      0
    );

    assert.deepEqual(
      friday.workoutStructure,
      []
    );

    assert.equal(
      friday.strengthStructure,
      null
    );


    assert.equal(
      saturday.sport,
      "Recovery"
    );

    assert.equal(
      saturday.isRaceDay,
      false
    );

    assert.equal(
      saturday.isPostRace,
      true
    );

    assert.equal(
      saturday.durationMinutes,
      0
    );


    assert.equal(
      sunday.sport,
      "Recovery"
    );

    assert.equal(
      sunday.isRaceDay,
      false
    );

    assert.equal(
      sunday.isPostRace,
      true
    );

    assert.equal(
      sunday.durationMinutes,
      0
    );


    const secondaryIds =
      (
        overlaid.additionalSessions ??
        []
      ).map(
        (session) =>
          session.sessionId
      );


    assert.deepEqual(
      secondaryIds,
      [
        "thursday-secondary",
      ],
      "Secondary sessions before the target race may remain, but none may survive on or after Race Day."
    );


    /*
      Remaining planned training:
      Monday     30
      Tuesday    60
      Thursday   20
      Thursday secondary 25

      Race Day and post-race states contribute 0.

      Total = 135 min = 2.25 h.
    */
    assert.equal(
      overlaid.totalHours,
      2.25
    );


    const raceStateCheck =
      validateTargetRaceWeekSpecialStates({
        plan:
          overlaid,

        raceDate:
          "2026-09-18",

        raceName:
          "Basse Test Triathlon",
      });


    assert.equal(
      raceStateCheck.valid,
      true,
      raceStateCheck.errors.join(
        "\n"
      )
    );
  }
);


console.log(
  `Goal-change safety regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {

  process.exitCode =
    1;

} else {

  console.log(
    "✓ BASSE GOAL-CHANGE WEEK SAFETY REGRESSION GREEN"
  );
}
