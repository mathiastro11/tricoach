import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildCoachingSignals,
} from "../lib/adaptive-coaching";


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


/*
  ========================================================
  ROADMAP LOAD SAFETY CONTRACT
  ========================================================

  A season roadmap is strategic guidance.

  It must never become a new physiological baseline merely
  because an AI-generated target happens to be much larger
  than the athlete's current tolerated weekly load.
*/

test(
  "Extreme roadmap target cannot force a large Maintain jump",
  () => {

    const signals =
      buildCoachingSignals({
        workoutHistory: [],
        readinessHistory: [],

        physiologicalBaselineHours:
          5,

        currentPlanHours:
          5,

        roadmapTargetHours:
          12,

        athleteHours:
          15,
      });


    assert.equal(
      signals.loadDecision,
      "Maintain"
    );


    /*
      The roadmap may guide the upper edge of the allowed
      range, but it must not replace the 5 h physiological
      baseline with 12 h.

      A small roadmap-guided extension of the current load
      is acceptable; a multi-hour jump is not.
    */
    assert.ok(
      signals.recommendedHoursMax <= 5.4,
      `Expected roadmap-guided Maintain ceiling <= 5.4 h, got ${signals.recommendedHoursMax} h`
    );


    assert.ok(
      signals.recommendedHoursMin <= 5.0,
      `Expected Maintain minimum to stay near the 5 h physiological baseline, got ${signals.recommendedHoursMin} h`
    );
  }
);


test(
  "Reasonable roadmap target may still guide the Maintain envelope",
  () => {

    const signals =
      buildCoachingSignals({
        workoutHistory: [],
        readinessHistory: [],

        physiologicalBaselineHours:
          5,

        currentPlanHours:
          5,

        roadmapTargetHours:
          5.3,

        athleteHours:
          8,
      });


    assert.equal(
      signals.loadDecision,
      "Maintain"
    );


    /*
      Existing behavior permits a modest strategic roadmap
      target to influence the Maintain envelope.

      5.3 h currently produces a rounded upper edge of 5.6 h.
      That is acceptable here because this test is only meant
      to distinguish reasonable guidance from an extreme
      roadmap-driven baseline replacement.
    */
    assert.ok(
      signals.recommendedHoursMax >= 5.3,
      `Expected reasonable roadmap guidance to remain usable, got ${signals.recommendedHoursMax} h`
    );


    assert.ok(
      signals.recommendedHoursMax <= 5.6,
      `Expected moderate roadmap guidance to stay within the existing Maintain envelope, got ${signals.recommendedHoursMax} h`
    );


    assert.ok(
      signals.recommendedHoursMin <= 5.1,
      `Expected moderate roadmap guidance not to create an excessive minimum, got ${signals.recommendedHoursMin} h`
    );
  }
);



test(
  "Next Week consumes roadmap load only through the safe deterministic envelope",
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
      Physiological ownership must stay consistent all the
      way through Next Week.

      1. Athlete current training volume is preferred before
         a strategic roadmap target when reconstructing a
         full-week reference.

      2. Discipline allocation must use the already-safe
         deterministic weekly envelope, not raw roadmap hours.
    */

    assert.match(
      routeSource,
      /const fullWeekReferenceHours\s*=\s*athleteCurrentHours\s*>\s*0\s*\?\s*athleteCurrentHours\s*:\s*roadmapHours\s*>\s*0\s*\?\s*roadmapHours\s*:\s*currentPlanHours/,
      "Full-week reference must prefer athleteCurrentHours before roadmapHours."
    );


    const allocationStart =
      routeSource.indexOf(
        "const disciplineAllocationGuidance"
      );

    assert.ok(
      allocationStart >= 0,
      "Discipline allocation guidance block must exist."
    );


    const allocationTail =
      routeSource.slice(
        allocationStart,
        allocationStart + 900
      );


    assert.doesNotMatch(
      allocationTail,
      /roadmapWeek\?\.targetHours/,
      "Discipline allocation must not consume raw roadmap targetHours."
    );


    assert.match(
      allocationTail,
      /weeklyHours:\s*coachingSignals\.recommendedHoursMax/,
      "Discipline allocation must use the deterministic safe weekly envelope."
    );
  }
);


console.log(
  `Roadmap load safety regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {

  process.exitCode =
    1;

} else {

  console.log(
    "✓ BASSE ROADMAP LOAD SAFETY REGRESSION GREEN"
  );
}
