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
  "Roadmap week anchor remains calendar-safe across autumn DST",
  () => {

    const startDate =
      new Date(
        "2026-09-21T12:00:00"
      );


    assert.equal(
      getCanonicalWeeksUntilRace(
        "2026-10-26",
        startDate
      ),
      5
    );


    assert.equal(
      getCanonicalTrainingPhase(
        "2026-10-26",
        startDate
      ),
      "Peak"
    );
  }
);


test(
  "Each roadmap week can derive its own canonical phase",
  () => {

    const raceDate =
      "2026-12-14";


    /*
      Canonical boundaries:

      > 12 weeks  => Base
      6–12 weeks => Build
      3–5 weeks  => Peak
      <= 2 weeks => Taper
    */
    const weeks = [
      {
        date:
          "2026-09-14",
        expected:
          "Base",
      },
      {
        date:
          "2026-10-05",
        expected:
          "Build",
      },
      {
        date:
          "2026-11-09",
        expected:
          "Peak",
      },
      {
        date:
          "2026-11-30",
        expected:
          "Taper",
      },
    ] as const;


    for (
      const week
      of weeks
    ) {

      assert.equal(
        getCanonicalTrainingPhase(
          raceDate,
          new Date(
            `${week.date}T12:00:00`
          )
        ),
        week.expected
      );
    }
  }
);


/*
  ========================================================
  PRODUCTION WIRING CONTRACT
  ========================================================
*/

test(
  "Roadmap production uses startDate for canonical phase and week distance",
  () => {

    const routeSource =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "app/api/roadmap/route.ts"
        ),
        "utf8"
      );


    assert.match(
      routeSource,
      /inferEvidenceTrainingPhase\(\s*athlete\.raceDate,\s*startDate\s*\)/,
      "Roadmap evidencePhase must use the roadmap startDate."
    );


    assert.match(
      routeSource,
      /getCanonicalWeeksUntilRace\(\s*athlete\.raceDate,\s*startDate\s*\)/,
      "Roadmap totalWeeks must use the canonical calendar-date helper."
    );
  }
);


test(
  "Roadmap production canonicalizes every returned week phase",
  () => {

    const routeSource =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "app/api/roadmap/route.ts"
        ),
        "utf8"
      );


    assert.match(
      routeSource,
      /getCanonicalTrainingPhase\(\s*athlete\.raceDate,\s*canonicalWeekStart\s*\)/,
      "Each returned roadmap week must receive canonical phase from its deterministic canonical week date."
    );


    assert.doesNotMatch(
      routeSource,
      /`\$\{week\.startDate\}T12:00:00`/,
      "Roadmap phase must not depend on an AI-provided week.startDate."
    );
  }
);



test(
  "Roadmap production owns complete calendar identity",
  () => {

    const routeSource =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "app/api/roadmap/route.ts"
        ),
        "utf8"
      );


    /*
      AI owns strategy.

      The server owns calendar facts.

      A roadmap week must therefore never retain an
      AI-invented weekIndex or startDate merely because the
      JSON happens to satisfy the schema.
    */

    assert.match(
      routeSource,
      /roadmap\.raceDate\s*=\s*athlete\.raceDate/,
      "Roadmap raceDate must be overwritten from the authoritative athlete race date."
    );


    assert.match(
      routeSource,
      /roadmap\.totalWeeks\s*=\s*totalWeeks/,
      "Roadmap totalWeeks must be overwritten from the deterministic server value."
    );


    assert.match(
      routeSource,
      /weekIndex:\s*index\s*\+\s*1/,
      "Each roadmap week must receive a deterministic sequential weekIndex."
    );


    assert.match(
      routeSource,
      /const canonicalWeekStart\s*=\s*new Date\(\s*startDate\s*\)/,
      "Each roadmap week must derive from the authoritative roadmap startDate."
    );


    assert.match(
      routeSource,
      /canonicalWeekStart\.setDate\(\s*startDate\.getDate\(\)\s*\+\s*index\s*\*\s*7\s*\)/,
      "Roadmap week dates must advance in exact seven-calendar-day increments."
    );


    assert.match(
      routeSource,
      /startDate:\s*toISODate\(\s*canonicalWeekStart\s*\)/,
      "Returned roadmap startDate must be the deterministic canonical date."
    );


    assert.match(
      routeSource,
      /getCanonicalTrainingPhase\(\s*athlete\.raceDate,\s*canonicalWeekStart\s*\)/,
      "Roadmap phase must be derived from the canonical week date, not the AI-provided date."
    );


    assert.doesNotMatch(
      routeSource,
      /`\$\{week\.startDate\}T12:00:00`/,
      "Canonical roadmap phase must no longer depend on AI-provided week.startDate."
    );
  }
);


console.log(
  `Roadmap canonical phase regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {
  process.exitCode =
    1;
} else {
  console.log(
    "✓ BASSE ROADMAP CANONICAL PHASE REGRESSION GREEN"
  );
}
