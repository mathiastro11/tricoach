import {
  loadEnvConfig,
} from "@next/env";

loadEnvConfig(
  process.cwd()
);

import {
  BASIC_SHORT_COURSE_RACES,
} from "../data/races/basic-short-course";

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
    " TriCoach · Basic Race Import"
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
    `Races: ${BASIC_SHORT_COURSE_RACES.length}`
  );

  console.log("");


  let invalid =
    false;


  for (
    const race
    of BASIC_SHORT_COURSE_RACES
  ) {
    const validation =
      validateRaceImport(
        race
      );

    console.log(
      `${
        validation.valid
          ? "✓"
          : "✗"
      } ${race.shortName} · ${race.format}`
    );


    for (
      const error
      of validation.errors
    ) {
      console.log(
        `  ERROR: ${error}`
      );
    }


    for (
      const warning
      of validation.warnings
    ) {
      console.log(
        `  ⚠ ${warning}`
      );
    }


    if (!validation.valid) {
      invalid =
        true;
    }
  }


  if (invalid) {
    console.log("");
    console.log(
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
    "Writing basic races to Supabase..."
  );


  const result =
    await importRaceBatch(
      BASIC_SHORT_COURSE_RACES
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
