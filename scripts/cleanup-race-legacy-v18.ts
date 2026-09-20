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
      "challenge-salou",

    replacement:
      null,

    reason:
      "Challenge Salou replaces its former Middle Distance with T100 2/80/18 for 2027, which is not currently a supported TriCoach format.",
  },

  {
    legacy:
      "singapore-triathlon-sprint",

    replacement:
      "singapore-t100-sprint",

    reason:
      "Generic basic seed duplicates the curated Singapore T100 Sprint race.",
  },

  {
    legacy:
      "singapore-triathlon-olympic",

    replacement:
      null,

    reason:
      "Generic basic Olympic seed is not a current 2027 Singapore T100 race offering.",
  },
] as const;


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

  return (
    typeof id === "string" &&
    (
      id === legacy ||
      id.startsWith(
        `${legacy}-`
      )
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
    "TriCoach · Race Legacy Cleanup V18"
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

    console.log(
      `  Reason: ${item.reason}`
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

  if (invalid) {
    throw new Error(
      "V18 cleanup safety validation failed."
    );
  }

  if (dryRun) {
    console.log(
      "✓ Cleanup dry run complete."
    );

    console.log(
      "No database rows were deleted."
    );

    return;
  }

  const legacySlugs =
    candidates.map(
      (item) =>
        item.legacy
    );

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

  const deletedRows =
    deleted ?? [];

  console.log(
    `Deleted: ${
      deletedRows.length
    }/${legacySlugs.length}`
  );

  const {
    data: remaining,
    error: remainingError,
  } =
    await supabase
      .from("races")
      .select("slug")
      .in(
        "slug",
        legacySlugs
      );

  if (remainingError) {
    throw remainingError;
  }

  if (
    (remaining ?? []).length >
    0
  ) {
    throw new Error(
      "Legacy race rows remain after V18 cleanup."
    );
  }

  console.log(
    "✓ No V18 legacy rows remain."
  );

  console.log(
    "✓ Cascade handles race_editions and race_sources."
  );
}


main().catch(
  (error) => {
    console.error(error);

    process.exitCode =
      1;
  }
);
