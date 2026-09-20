import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  getCanonicalTrainingPhase,
  getCanonicalWeeksUntilRace,
} from "../lib/training-phase";

import {
  prepareGeneratedNextWeekPlan,
  validateFinalNextWeekAvailability,
} from "../lib/next-week-safety";

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
    day,
    sport:
      "Bike",
    title:
      "Aerobic bike",
    durationMinutes,
    intensity:
      "Easy aerobic RPE 2-3",
    purpose:
      "Build aerobic endurance",
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


function planFixture(): TrainingPlan {

  return {
    summary:
      "Next Week safety fixture",

    totalHours:
      1,

    focus:
      "Aerobic consistency",

    days: [
      bike(
        "Monday",
        60
      ),
      rest(
        "Tuesday"
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
  "Next Week receives authoritative server dates",
  () => {

    const plan =
      planFixture();

    /*
      Deliberately inject a false model date.
      The server helper must discard it.
    */
    plan.days[0].date =
      "2099-01-01";


    const prepared =
      prepareGeneratedNextWeekPlan({
        plan,

        weekStart:
          new Date(
            "2026-09-21T12:00:00"
          ),
      });


    assert.equal(
      prepared.plan.weekStart,
      "2026-09-21"
    );

    assert.equal(
      prepared.plan.days[0].date,
      "2026-09-21"
    );

    assert.equal(
      prepared.plan.days[6].date,
      "2026-09-27"
    );

    assert.equal(
      prepared.canonical.valid,
      true,
      prepared.canonical.errors.join(
        "\n"
      )
    );
  }
);


test(
  "Malformed generated workout fails canonical safety",
  () => {

    const plan =
      planFixture();

    plan.days[0] = {
      ...plan.days[0],
      workoutStructure:
        [],
    };


    const prepared =
      prepareGeneratedNextWeekPlan({
        plan,

        weekStart:
          new Date(
            "2026-09-21T12:00:00"
          ),
      });


    assert.equal(
      prepared.canonical.valid,
      false
    );

    assert.equal(
      prepared.canonical.errors.length >
        0,
      true
    );
  }
);


test(
  "Dated Next Week cannot violate Calendar availability",
  () => {

    const prepared =
      prepareGeneratedNextWeekPlan({
        plan:
          planFixture(),

        weekStart:
          new Date(
            "2026-09-21T12:00:00"
          ),
      });


    const availability =
      validateFinalNextWeekAvailability({
        plan:
          prepared.plan,

        athlete:
          null,

        availability: [
          {
            date:
              "2026-09-21",
            status:
              "Unavailable",
          },
        ],
      });


    assert.equal(
      availability.valid,
      false
    );

    assert.equal(
      availability.violations.length >
        0,
      true
    );
  }
);



test(
  "Next Week phase uses the upcoming week's canonical reference date",
  () => {

    /*
      The request may occur before the week being generated.

      Race:
      2026-10-26

      Request day:
      2026-09-19 -> 6 weeks -> Build

      Upcoming week:
      2026-09-21 -> 5 weeks -> Peak

      The generated plan belongs to Sep 21, therefore
      Peak is the correct planning phase.
    */
    const raceDate =
      "2026-10-26";

    const requestDay =
      new Date(
        "2026-09-19T12:00:00"
      );

    const nextWeekStart =
      new Date(
        "2026-09-21T12:00:00"
      );


    assert.equal(
      getCanonicalWeeksUntilRace(
        raceDate,
        requestDay
      ),
      6
    );


    assert.equal(
      getCanonicalTrainingPhase(
        raceDate,
        requestDay
      ),
      "Build"
    );


    assert.equal(
      getCanonicalWeeksUntilRace(
        raceDate,
        nextWeekStart
      ),
      5
    );


    assert.equal(
      getCanonicalTrainingPhase(
        raceDate,
        nextWeekStart
      ),
      "Peak"
    );
  }
);


test(
  "Next Week production wires nextWeekStart into phase and race proximity",
  () => {

    const routeSource =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "app/api/next-week/route.ts"
        ),
        "utf8"
      );


    assert.match(
      routeSource,
      /getCanonicalTrainingPhase\(\s*athlete\?\.raceDate,\s*nextWeekStart\s*\)/,
      "trainingPhase must use nextWeekStart."
    );


    assert.match(
      routeSource,
      /getCanonicalWeeksUntilRace\(\s*athlete\?\.raceDate,\s*nextWeekStart\s*\)/,
      "weeksRemaining must use nextWeekStart."
    );
  }
);



test(
  "Next Week roadmap fallback targets the authoritative upcoming week",
  () => {

    const routeSource =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "app/api/next-week/route.ts"
        ),
        "utf8"
      );


    /*
      The fallback must use the already-resolved upcoming
      calendar week.

      Using wall-clock `now` is subtly wrong on Monday
      mornings because a roadmap entry dated that same
      Monday at 12:00 can still compare greater than `now`,
      even though Next Week represents the following Monday.
    */
    assert.match(
      routeSource,
      /week\.startDate\s*===\s*nextWeekStartIso/,
      "Roadmap fallback must target nextWeekStartIso."
    );


    const fallbackStart =
      routeSource.indexOf(
        "if (\n      !roadmapWeek"
      );

    assert.ok(
      fallbackStart >= 0,
      "Next Week roadmap fallback block must exist."
    );


    const fallbackTail =
      routeSource.slice(
        fallbackStart,
        fallbackStart + 1200
      );


    assert.doesNotMatch(
      fallbackTail,
      /const now = new Date\(\)/,
      "Roadmap fallback must not use server wall-clock now."
    );


    assert.doesNotMatch(
      fallbackTail,
      /date\.getTime\(\)\s*>\s*now\.getTime\(\)/,
      "Roadmap fallback must not choose a week by comparing against wall-clock now."
    );
  }
);


console.log(
  `Next Week safety regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {
  process.exitCode =
    1;
} else {
  console.log(
    "✓ BASSE NEXT WEEK SAFETY REGRESSION GREEN"
  );
}
