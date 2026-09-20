import {
  loadEnvConfig,
} from "@next/env";

loadEnvConfig(process.cwd());

import {
  createAdminClient,
} from "../lib/supabase-admin";


const candidates = [
  {
    legacy:
      "barcelona-triathlon-olympic",
    replacement:
      "challenge-barcelona-triatlo-olympic",
  },

  {
    legacy:
      "london-triathlon-olympic",
    replacement:
      "london-t100-olympic",
  },

  {
    legacy:
      "oslo-triathlon-sprint",
    replacement:
      "oslo-triatlon-sprint",
  },

  {
    legacy:
      "oslo-triathlon-olympic",
    replacement:
      "oslo-triatlon",
  },

  {
    legacy:
      "oslo-triatlon-olympic",
    replacement:
      "oslo-triatlon",
  },

  {
    legacy:
      "trondheim-triathlon-olympic",
    replacement:
      "trondheim-triatlon",
  },

  {
    legacy:
      "trondheim-triathlon-sprint",
    replacement:
      null,
  },

  {
    legacy:
      "copenhagen-triathlon-sprint",
    replacement:
      null,
  },

  {
    legacy:
      "copenhagen-triathlon-olympic",
    replacement:
      null,
  },

  {
    legacy:
      "helsinki-triathlon-sprint",
    replacement:
      null,
  },

  {
    legacy:
      "helsinki-triathlon-olympic",
    replacement:
      null,
  },
] as const;


const legacySlugs =
  candidates.map(
    (item) =>
      item.legacy
  );


function targetUsesLegacy(
  targetRace: unknown,
  legacy: string
) {
  if (
    !targetRace ||
    typeof targetRace !==
      "object"
  ) {
    return false;
  }

  const id =
    (
      targetRace as {
        id?: unknown;
      }
    ).id;

  if (
    typeof id !==
      "string"
  ) {
    return false;
  }

  return (
    id === legacy ||
    id.startsWith(
      `${legacy}-`
    )
  );
}


async function main() {

  const dryRun =
    process.argv.includes(
      "--dry-run"
    );


  const supabase =
    createAdminClient();


  console.log("");
  console.log(
    "TriCoach · Race Legacy Cleanup V15"
  );

  console.log(
    `Mode: ${
      dryRun
        ? "DRY RUN"
        : "DELETE FROM SUPABASE"
    }`
  );

  console.log(
    `Legacy races: ${
      candidates.length
    }`
  );

  console.log("");


  const {
    data: races,
    error: raceError,
  } =
    await supabase
      .from("races")
      .select(`
        slug,
        short_name,
        format,
        data_quality
      `);


  if (raceError) {
    throw raceError;
  }


  const {
    data: profiles,
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .select(
        "target_race"
      );


  if (profileError) {
    throw profileError;
  }


  const raceRows =
    races ?? [];

  const profileRows =
    profiles ?? [];


  const raceBySlug =
    new Map(
      raceRows.map(
        (race) => [
          race.slug,
          race,
        ]
      )
    );


  let invalid =
    false;

  let references =
    0;


  for (
    const item
    of candidates
  ) {

    const legacy =
      raceBySlug.get(
        item.legacy
      );


    const usedByProfiles =
      profileRows.filter(
        (profile) =>
          targetUsesLegacy(
            profile.target_race,
            item.legacy
          )
      ).length;


    references +=
      usedByProfiles;


    console.log(
      `${
        legacy
          ? "✓"
          : "⚠"
      } ${item.legacy}`
    );


    console.log(
      `  DB row: ${
        legacy
          ? "YES"
          : "ALREADY ABSENT"
      }`
    );


    console.log(
      `  Profile references: ${
        usedByProfiles
      }`
    );


    if (
      usedByProfiles >
      0
    ) {
      invalid =
        true;
    }


    if (
      item.replacement
    ) {

      const replacement =
        raceBySlug.get(
          item.replacement
        );


      console.log(
        `  Replacement: ${
          item.replacement
        }`
      );


      console.log(
        `  Replacement row: ${
          replacement
            ? "YES"
            : "NO"
        }`
      );


      if (!replacement) {
        invalid =
          true;
      }
    }


    console.log("");
  }


  console.log(
    `Profiles scanned: ${
      profileRows.length
    }`
  );

  console.log(
    `Legacy target references: ${
      references
    }`
  );


  if (invalid) {
    throw new Error(
      "V15 safety validation failed."
    );
  }


  if (dryRun) {

    console.log("");
    console.log(
      "✓ Dry run complete."
    );

    console.log(
      "No Supabase rows were deleted."
    );

    return;
  }


  const {
    data: deleted,
    error: deleteError,
  } =
    await supabase
      .from("races")
      .delete()
      .in(
        "slug",
        legacySlugs
      )
      .select("slug");


  if (deleteError) {
    throw deleteError;
  }


  const deletedSlugs =
    new Set(
      (
        deleted ??
        []
      ).map(
        (race) =>
          race.slug
      )
    );


  console.log("");
  console.log(
    `Deleted: ${
      deletedSlugs.size
    }/${legacySlugs.length}`
  );


  for (
    const slug
    of legacySlugs
  ) {
    console.log(
      `${
        deletedSlugs.has(
          slug
        )
          ? "✓"
          : "⚠"
      } ${slug}`
    );
  }


  const {
    data: remaining,
    error: verifyError,
  } =
    await supabase
      .from("races")
      .select("slug")
      .in(
        "slug",
        legacySlugs
      );


  if (verifyError) {
    throw verifyError;
  }


  if (
    (
      remaining ??
      []
    ).length >
    0
  ) {
    throw new Error(
      "Some legacy race rows remain after delete."
    );
  }


  console.log("");
  console.log(
    "✓ No legacy rows remain."
  );

  console.log(
    "✓ Cascade handles race_editions and race_sources."
  );
}


main().catch(
  (error) => {

    console.error(
      "V15 ERROR:",
      error
    );

    process.exitCode =
      1;
  }
);
