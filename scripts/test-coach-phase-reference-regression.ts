import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  getCanonicalTrainingPhase,
  getCanonicalWeeksUntilRace,
} from "../lib/training-phase";


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
  BEHAVIORAL CONTRACT
  ========================================================
*/

test(
  "Coach current-day phase can differ from active-week Monday at a boundary",
  () => {

    /*
      This is deliberate.

      An active week may begin while the athlete is still
      six weeks from race day, then reach the five-week Peak
      boundary later in that same week.

      Coach is current-day adaptive coaching, so its phase
      and race proximity should follow the athlete's actual
      client calendar date rather than freezing to Monday.
    */
    const raceDate =
      "2026-10-26";

    const activeWeekStart =
      new Date(
        "2026-09-14T12:00:00"
      );

    const currentDay =
      new Date(
        "2026-09-19T12:00:00"
      );


    assert.equal(
      getCanonicalWeeksUntilRace(
        raceDate,
        activeWeekStart
      ),
      6
    );


    assert.equal(
      getCanonicalTrainingPhase(
        raceDate,
        activeWeekStart
      ),
      "Build"
    );


    assert.equal(
      getCanonicalWeeksUntilRace(
        raceDate,
        currentDay
      ),
      6
    );

    /*
      Use a clear boundary example separately below.
    */
    const boundaryRace =
      "2026-10-24";


    assert.equal(
      getCanonicalTrainingPhase(
        boundaryRace,
        new Date(
          "2026-09-14T12:00:00"
        )
      ),
      "Build"
    );


    assert.equal(
      getCanonicalTrainingPhase(
        boundaryRace,
        new Date(
          "2026-09-19T12:00:00"
        )
      ),
      "Peak"
    );
  }
);


/*
  ========================================================
  PRODUCTION WIRING CONTRACT
  ========================================================
*/

test(
  "Coach builds one authoritative client-calendar reference date",
  () => {

    const routeSource =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "app/api/coach/route.ts"
        ),
        "utf8"
      );


    assert.match(
      routeSource,
      /const coachReferenceDate\s*=/,
      "Coach must create one shared authoritative reference date."
    );


    const todayIndex =
      routeSource.indexOf(
        "todayContext?.date"
      );

    const weekIndex =
      routeSource.indexOf(
        "trainingPlan?.weekStart"
      );

    assert.ok(
      todayIndex >= 0,
      "Coach reference logic must consider todayContext.date."
    );

    assert.ok(
      weekIndex >= 0,
      "Coach reference logic must retain trainingPlan.weekStart as fallback."
    );


    /*
      This source-order assertion is intentionally broad:
      current-day client context must be considered before
      the active-week fallback in the canonical reference
      resolver.
    */
    const referenceBlockIndex =
      routeSource.indexOf(
        "const coachReferenceDate"
      );

    const referenceTail =
      routeSource.slice(
        referenceBlockIndex,
        referenceBlockIndex + 1800
      );

    assert.ok(
      referenceTail.indexOf(
        "todayContext?.date"
      ) >= 0,
      "coachReferenceDate must use todayContext.date."
    );

    assert.ok(
      referenceTail.indexOf(
        "trainingPlan?.weekStart"
      ) >= 0,
      "coachReferenceDate must fall back to trainingPlan.weekStart."
    );

    assert.ok(
      referenceTail.indexOf(
        "todayContext?.date"
      ) <
        referenceTail.indexOf(
          "trainingPlan?.weekStart"
        ),
      "todayContext.date must have priority over trainingPlan.weekStart."
    );
  }
);


test(
  "All Coach phase and race-proximity calculations use coachReferenceDate",
  () => {

    const routeSource =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "app/api/coach/route.ts"
        ),
        "utf8"
      );


    assert.match(
      routeSource,
      /getCanonicalTrainingPhase\(\s*athlete\?\.raceDate,\s*coachReferenceDate\s*\)/,
      "trainingPhase must use coachReferenceDate."
    );


    assert.match(
      routeSource,
      /inferEvidenceTrainingPhase\(\s*athlete\?\.raceDate,\s*coachReferenceDate\s*\)/,
      "evidencePhase must use coachReferenceDate."
    );


    const weekCalls =
      routeSource.match(
        /getCanonicalWeeksUntilRace\(\s*athlete\?\.raceDate,\s*coachReferenceDate\s*\)/g
      ) ?? [];


    assert.equal(
      weekCalls.length,
      2,
      "Both Coach weeks-until-race consumers must use coachReferenceDate."
    );


    assert.doesNotMatch(
      routeSource,
      /getCanonicalTrainingPhase\(\s*athlete\?\.raceDate\s*\)/,
      "Coach must not leave trainingPhase on server wall-clock time."
    );


    assert.doesNotMatch(
      routeSource,
      /inferEvidenceTrainingPhase\(\s*athlete\?\.raceDate\s*\)/,
      "Coach must not leave evidencePhase on server wall-clock time."
    );


    assert.doesNotMatch(
      routeSource,
      /getCanonicalWeeksUntilRace\(\s*athlete\?\.raceDate\s*\)/,
      "Coach must not leave race proximity on server wall-clock time."
    );
  }
);


console.log(
  `Coach phase-reference regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {

  process.exitCode =
    1;

} else {

  console.log(
    "✓ BASSE COACH PHASE REFERENCE REGRESSION GREEN"
  );
}
