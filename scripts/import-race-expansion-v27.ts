import {
  loadEnvConfig,
} from "@next/env";

loadEnvConfig(
  process.cwd()
);

import {
  RACE_EXPANSION_V27,
} from "../data/races/expansion-v27";

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
    "Basse · Final Global Race Expansion V27"
  );

  console.log(
    `Mode: ${
      dryRun
        ? "DRY RUN"
        : "WRITE TO SUPABASE"
    }`
  );

  console.log(
    `Races: ${RACE_EXPANSION_V27.length}`
  );

  console.log("");


  let invalid =
    false;


  for (
    const race
    of RACE_EXPANSION_V27
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
    throw new Error(
      "Race validation failed."
    );
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


  const result =
    await importRaceBatch(
      RACE_EXPANSION_V27
    );


  console.log("");
  console.log(
    `Imported: ${result.imported}/${result.total}`
  );

  console.log(
    `Failed: ${result.failed}`
  );


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
