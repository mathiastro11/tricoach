import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";


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


test(
  "Instant Season Roadmap uses the canonical phase and race-distance engine",
  () => {

    const source =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "lib/instant-season-roadmap.ts"
        ),
        "utf8"
      );


    assert.match(
      source,
      /getCanonicalWeeksUntilRace/,
      "Instant roadmap must use getCanonicalWeeksUntilRace."
    );


    assert.match(
      source,
      /getCanonicalTrainingPhase/,
      "Instant roadmap must use getCanonicalTrainingPhase."
    );


    assert.match(
      source,
      /getCanonicalWeeksUntilRace\(\s*athlete\.raceDate,\s*start\s*\)/,
      "Instant roadmap totalWeeks must be derived from its authoritative Monday start."
    );


    assert.match(
      source,
      /getCanonicalTrainingPhase\(\s*athlete\.raceDate,\s*startDate\s*\)/,
      "Each instant roadmap week must derive phase from its actual calendar startDate."
    );


    assert.doesNotMatch(
      source,
      /function weeksUntilRace\(/,
      "Instant roadmap must not maintain its own race-distance implementation."
    );


    assert.doesNotMatch(
      source,
      /function phaseForWeek\(/,
      "Instant roadmap must not maintain its own phase engine."
    );


    assert.doesNotMatch(
      source,
      /86_400_000/,
      "Instant roadmap must not calculate race distance using raw elapsed milliseconds."
    );
  }
);


console.log(
  `Instant roadmap canonical regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {

  process.exitCode =
    1;

} else {

  console.log(
    "✓ BASSE INSTANT ROADMAP CANONICAL REGRESSION GREEN"
  );
}
