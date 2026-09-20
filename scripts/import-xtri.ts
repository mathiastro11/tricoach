import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());


import {
  XTRI_VERIFIED_RACES,
} from "../data/races/xtri-verified";

import {
  xtriSnapshotToImport,
} from "../lib/race-providers/xtri";

import {
  validateRaceImport,
  normalizeRaceImport,
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
    " TriCoach · XTRI Import"
  );
  console.log(
    "========================================"
  );
  console.log("");

  console.log(
    `Mode: ${
      dryRun
        ? "DRY RUN"
        : "WRITE TO SUPABASE"
    }`
  );

  console.log(
    `Snapshots: ${XTRI_VERIFIED_RACES.length}`
  );

  console.log("");


  const imports =
    XTRI_VERIFIED_RACES.map(
      (snapshot) =>
        normalizeRaceImport(
          xtriSnapshotToImport(
            snapshot
          )
        )
    );


  let validationFailed =
    false;


  for (
    const race
    of imports
  ) {
    const validation =
      validateRaceImport(
        race
      );


    const status =
      validation.valid
        ? "✓"
        : "✗";


    console.log(
      `${status} ${race.shortName}`
    );

    console.log(
      `  slug: ${race.slug}`
    );

    console.log(
      `  country: ${race.countryCode}`
    );


    const edition =
      race.editions[0];


    if (edition?.date) {
      console.log(
        `  date: ${edition.date}`
      );
    } else {
      console.log(
        "  date: no verified exact date"
      );
    }


    if (
      edition?.bike
        ?.elevationGainM != null
    ) {
      console.log(
        `  bike elevation: ${edition.bike.elevationGainM} m`
      );
    }


    if (
      edition?.run
        ?.elevationGainM != null
    ) {
      console.log(
        `  run elevation: ${edition.run.elevationGainM} m`
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


    for (
      const error
      of validation.errors
    ) {
      console.log(
        `  ERROR: ${error}`
      );
    }


    if (!validation.valid) {
      validationFailed =
        true;
    }


    console.log("");
  }


  if (validationFailed) {
    console.error(
      "Import aborted: validation failed."
    );

    process.exitCode = 1;
    return;
  }


  if (dryRun) {
    console.log(
      "✓ Dry run complete."
    );

    console.log(
      "No database changes were made."
    );

    return;
  }


  console.log(
    "Writing verified races to Supabase..."
  );

  console.log("");


  const result =
    await importRaceBatch(
      imports
    );


  console.log(
    "========================================"
  );

  console.log(
    `Imported: ${result.imported}/${result.total}`
  );

  console.log(
    `Failed:   ${result.failed}`
  );

  console.log(
    `Warnings: ${result.warnings}`
  );

  console.log(
    "========================================"
  );

  console.log("");


  for (
    const item
    of result.results
  ) {
    console.log(
      `${
        item.ok
          ? "✓"
          : "✗"
      } ${item.slug}`
    );


    for (
      const error
      of item.errors
    ) {
      console.log(
        `  ERROR: ${error}`
      );
    }


    for (
      const warning
      of item.warnings
    ) {
      console.log(
        `  ⚠ ${warning}`
      );
    }
  }


  if (!result.ok) {
    process.exitCode = 1;
  }
}


main().catch(
  (error) => {
    console.error("");
    console.error(
      "XTRI import crashed:"
    );
    console.error(error);

    process.exitCode = 1;
  }
);
