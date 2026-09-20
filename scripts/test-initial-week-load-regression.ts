import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import type {
  Athlete,
} from "../types/training";

import {
  getInitialWeekFeasibleCapacity,
  getInitialWeekRecommendedHoursMin,
} from "../lib/initial-week-load";


let passed =
  0;

let failed =
  0;


function test(
  name: string,
  fn: () => void
) {

  try {
    fn();

    passed +=
      1;

    console.log(
      `✓ ${name}`
    );

  } catch (error) {

    failed +=
      1;

    console.error(
      `✗ ${name}`
    );

    console.error(
      error
    );
  }
}


const athlete:
  Pick<
    Athlete,
    | "weeklyAvailability"
    | "availableDays"
    | "longestSessionMinutes"
  > = {
  availableDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],

  weeklyAvailability: {
    Swim: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],

    Bike: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],

    Run: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],

    Strength: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },

  longestSessionMinutes:
    "90",
};


test(
  "Full available Monday-Sunday week has deterministic hard scheduling capacity",
  () => {

    const result =
      getInitialWeekFeasibleCapacity({
        athlete,

        availability:
          [],

        todayIso:
          "2026-09-14",
      });


    /*
      7 available dates
      × maximum 3 real sessions/day
      × 90 min maximum realistic session

      = 1890 minutes.

      This is NOT a training target.
      It is only the absolute scheduling ceiling that a
      future minimum must never exceed.
    */
    assert.equal(
      result.feasibleMinutes,
      1890
    );

    assert.equal(
      result.feasibleHours,
      31.5
    );

    assert.equal(
      result.remainingDates.length,
      7
    );
  }
);


test(
  "Unavailable Calendar date contributes zero feasible capacity",
  () => {

    const result =
      getInitialWeekFeasibleCapacity({
        athlete,

        availability: [
          {
            date:
              "2026-09-16",

            status:
              "Unavailable",
          },
        ],

        todayIso:
          "2026-09-14",
      });


    assert.equal(
      result.feasibleMinutes,
      1620
    );
  }
);


test(
  "Calendar maxDurationMinutes caps the entire date rather than each session",
  () => {

    const result =
      getInitialWeekFeasibleCapacity({
        athlete,

        availability: [
          {
            date:
              "2026-09-16",

            status:
              "Limited",

            allowedSports: [
              "Bike",
            ],

            maxDurationMinutes:
              60,
          },
        ],

        todayIso:
          "2026-09-14",
      });


    /*
      Six unrestricted dates:
      6 × 270 = 1620

      Limited Wednesday:
      60

      Total = 1680.
    */
    assert.equal(
      result.feasibleMinutes,
      1680
    );
  }
);


test(
  "Partial first week only counts today through Sunday",
  () => {

    const result =
      getInitialWeekFeasibleCapacity({
        athlete,

        availability:
          [],

        todayIso:
          "2026-09-18",
      });


    /*
      Friday + Saturday + Sunday
      = 3 × 270.
    */
    assert.equal(
      result.feasibleMinutes,
      810
    );

    assert.deepEqual(
      result.remainingDates,
      [
        "2026-09-18",
        "2026-09-19",
        "2026-09-20",
      ]
    );
  }
);


test(
  "Calendar Available may reopen a date blocked by recurring weekly availability",
  () => {

    const restrictedAthlete:
      Pick<
        Athlete,
        | "weeklyAvailability"
        | "availableDays"
        | "longestSessionMinutes"
      > = {
      ...athlete,

      weeklyAvailability: {
        Swim: [
          "Monday",
        ],

        Bike: [
          "Monday",
        ],

        Run: [
          "Monday",
        ],

        Strength: [
          "Monday",
        ],
      },
    };


    const withoutOverride =
      getInitialWeekFeasibleCapacity({
        athlete:
          restrictedAthlete,

        availability:
          [],

        todayIso:
          "2026-09-14",
      });


    assert.equal(
      withoutOverride
        .feasibleMinutes,
      270
    );


    const withOverride =
      getInitialWeekFeasibleCapacity({
        athlete:
          restrictedAthlete,

        availability: [
          {
            date:
              "2026-09-15",

            status:
              "Available",
          },
        ],

        todayIso:
          "2026-09-14",
      });


    assert.equal(
      withOverride
        .feasibleMinutes,
      540
    );
  }
);




test(
  "Full first week prevents severe undertraining for an established 8 h athlete",
  () => {

    const minimum =
      getInitialWeekRecommendedHoursMin({
        currentTrainingHours:
          8,

        safeInitialHoursMax:
          8.8,

        feasibility: {
          remainingDates: [
            "2026-09-14",
            "2026-09-15",
            "2026-09-16",
            "2026-09-17",
            "2026-09-18",
            "2026-09-19",
            "2026-09-20",
          ],

          feasibleMinutes:
            1890,

          feasibleHours:
            31.5,
        },

        phase:
          "Base",

        todayIso:
          "2026-09-14",
      });


    assert.equal(
      minimum,
      6.4
    );
  }
);


test(
  "Partial Friday-Sunday first week scales the minimum down by remaining-week fraction",
  () => {

    const minimum =
      getInitialWeekRecommendedHoursMin({
        currentTrainingHours:
          8,

        safeInitialHoursMax:
          8.8,

        feasibility: {
          remainingDates: [
            "2026-09-18",
            "2026-09-19",
            "2026-09-20",
          ],

          feasibleMinutes:
            810,

          feasibleHours:
            13.5,
        },

        phase:
          "Base",

        todayIso:
          "2026-09-18",
      });


    /*
      Full-week floor:
      8 h × 0.80 = 6.4 h

      Remaining fraction:
      3 / 7

      6.4 × 3/7 = 2.74 h
    */
    assert.equal(
      minimum,
      2.74
    );
  }
);


test(
  "Feasibility caps the minimum when Calendar restrictions are tighter than tolerance",
  () => {

    const minimum =
      getInitialWeekRecommendedHoursMin({
        currentTrainingHours:
          10,

        safeInitialHoursMax:
          11,

        feasibility: {
          remainingDates: [
            "2026-09-14",
            "2026-09-15",
            "2026-09-16",
            "2026-09-17",
            "2026-09-18",
            "2026-09-19",
            "2026-09-20",
          ],

          feasibleMinutes:
            180,

          feasibleHours:
            3,
        },

        phase:
          "Base",

        todayIso:
          "2026-09-14",
      });


    assert.equal(
      minimum,
      3
    );
  }
);


test(
  "Safe initial ceiling caps the minimum before audit wiring",
  () => {

    const minimum =
      getInitialWeekRecommendedHoursMin({
        currentTrainingHours:
          10,

        safeInitialHoursMax:
          6.5,

        feasibility: {
          remainingDates: [
            "2026-09-14",
            "2026-09-15",
            "2026-09-16",
            "2026-09-17",
            "2026-09-18",
            "2026-09-19",
            "2026-09-20",
          ],

          feasibleMinutes:
            1800,

          feasibleHours:
            30,
        },

        phase:
          "Base",

        todayIso:
          "2026-09-14",
      });


    assert.equal(
      minimum,
      6.5
    );
  }
);


test(
  "Zero feasibility means no forced minimum load",
  () => {

    const minimum =
      getInitialWeekRecommendedHoursMin({
        currentTrainingHours:
          8,

        safeInitialHoursMax:
          8.8,

        feasibility: {
          remainingDates: [
            "2026-09-14",
            "2026-09-15",
          ],

          feasibleMinutes:
            0,

          feasibleHours:
            0,
        },

        phase:
          "Base",

        todayIso:
          "2026-09-14",
      });


    assert.equal(
      minimum,
      0
    );
  }
);


test(
  "Peak first week allows deliberate reduction below normal Base floor",
  () => {

    const minimum =
      getInitialWeekRecommendedHoursMin({
        currentTrainingHours:
          10,

        safeInitialHoursMax:
          11,

        feasibility: {
          remainingDates: [
            "2026-09-14",
            "2026-09-15",
            "2026-09-16",
            "2026-09-17",
            "2026-09-18",
            "2026-09-19",
            "2026-09-20",
          ],

          feasibleMinutes:
            1800,

          feasibleHours:
            30,
        },

        phase:
          "Peak",

        todayIso:
          "2026-09-14",
      });


    assert.equal(
      minimum,
      7
    );
  }
);


test(
  "Taper first week does not force normal training-volume minimum",
  () => {

    const minimum =
      getInitialWeekRecommendedHoursMin({
        currentTrainingHours:
          10,

        safeInitialHoursMax:
          11,

        feasibility: {
          remainingDates: [
            "2026-09-14",
            "2026-09-15",
            "2026-09-16",
            "2026-09-17",
            "2026-09-18",
            "2026-09-19",
            "2026-09-20",
          ],

          feasibleMinutes:
            1800,

          feasibleHours:
            30,
        },

        phase:
          "Taper",

        todayIso:
          "2026-09-14",
      });


    assert.equal(
      minimum,
      0
    );
  }
);



test(
  "Initial plan phase uses normalized authoritative today context",
  () => {

    /*
      The first generated week belongs to the athlete's
      client calendar context supplied through todayIso.

      Production already normalizes todayIso through
      getInitialWeekContext().

      Phase inference must use that SAME authoritative
      date rather than silently falling back to the
      server wall clock.
    */
    const routeSource =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "app/api/plan/route.ts"
        ),
        "utf8"
      );


    const contextIndex =
      routeSource.indexOf(
        "const initialWeekContext ="
      );

    const phaseIndex =
      routeSource.indexOf(
        "const evidencePhase ="
      );


    assert.ok(
      contextIndex >= 0,
      "Initial plan must create initialWeekContext."
    );


    assert.ok(
      phaseIndex >= 0,
      "Initial plan must create evidencePhase."
    );


    assert.ok(
      contextIndex < phaseIndex,
      "initialWeekContext must exist before evidencePhase is inferred."
    );


    assert.match(
      routeSource,
      /inferEvidenceTrainingPhase\(\s*athlete\.raceDate,\s*initialWeekContext\.todayDate\s*\)/,
      "Initial plan phase must use the normalized authoritative first-week date."
    );


    assert.match(
      routeSource,
      /Today is \$\{initialWeekContext\.todayIso\}\./,
      "The initial generation prompt must use the same normalized authoritative todayIso."
    );
  }
);


console.log(
  `Initial-week load regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {

  process.exitCode =
    1;
}

