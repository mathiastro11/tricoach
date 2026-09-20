import {
  loadEnvConfig,
} from "@next/env";

loadEnvConfig(
  process.cwd()
);

import {
  CURATED_2026_RACES,
} from "../data/races/curated-2026";

import {
  validateRaceImport,
} from "../lib/race-ingestion";

import {
  importRaceBatch,
} from "../lib/race-batch-import";


async function main() {
  const dryRun =
    process.argv.includes(
      "--dry-run"
    );


  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    " TriCoach · Curated Race Import"
  );
  console.log(
    "========================================"
  );

  console.log(
    `Mode: ${
      dryRun
        ? "DRY RUN"
        : "WRITE TO SUPABASE"
    }`
  );

  console.log(
    `Races: ${CURATED_2026_RACES.length}`
  );

  console.log("");


  let invalid = false;


  for (
    const race
    of CURATED_2026_RACES
  ) {
    const result =
      validateRaceImport(
        race
      );

    console.log(
      `${
        result.valid
          ? "✓"
          : "✗"
      } ${race.shortName}`
    );


    for (
      const error
      of result.errors
    ) {
      console.log(
        `  ERROR: ${error}`
      );
    }


    for (
      const warning
      of result.warnings
    ) {
      console.log(
        `  ⚠ ${warning}`
      );
    }


    if (!result.valid) {
      invalid = true;
    }
  }


  if (invalid) {
    console.error("");
    console.error(
      "Import aborted."
    );

    process.exitCode = 1;
    return;
  }


  if (dryRun) {
    console.log("");
    console.log(
      "✓ Dry run complete."
    );

    console.log(
      "No database changes were made."
    );

    return;
  }


  console.log("");
  console.log(
    "Writing races to Supabase..."
  );


  const result =
    await importRaceBatch(
      CURATED_2026_RACES
    );


  console.log("");
  console.log(
    `Imported: ${result.imported}/${result.total}`
  );

  console.log(
    `Failed:   ${result.failed}`
  );

  console.log(
    `Warnings: ${result.warnings}`
  );


  for (
    const item
    of result.results
  ) {
    if (!item.ok) {
      console.log("");
      console.log(
        `✗ ${item.slug}`
      );

      for (
        const error
        of item.errors
      ) {
        console.log(
          `  ERROR: ${error}`
        );
      }
    }
  }


  if (!result.ok) {
    process.exitCode = 1;
  }
}


main().catch(
  (error) => {
    console.error(error);

    process.exitCode = 1;
  }
);
