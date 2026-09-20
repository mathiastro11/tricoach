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
      "finnskogen-triathlon-sprint-2026",

    replacement:
      "finnskogen-triathlon",
  },

  {
    legacy:
      "haugesund-triatlon-sprint-2026",

    replacement:
      "haugesund-triatlon",
  },

  {
    legacy:
      "jevnakerfull-2026",

    replacement:
      "jevnakerfull",
  },

  {
    legacy:
      "lunde-triatlon-sprint-2026",

    replacement:
      "lunde-triatlon",
  },

  {
    legacy:
      "os-triathlon-sprint-2026",

    replacement:
      "os-triathlon",
  },

  {
    legacy:
      "soon-tryathlon-sprint-2026",

    replacement:
      "soon-tryathlon",
  },
] as const;


function targetUsesLegacy(
  targetRace: unknown,
  legacy: string
) {
  if (
    !targetRace ||
    typeof targetRace !== "object"
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
    "TriCoach · Race Legacy Cleanup V19"
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

    const canonical =
      raceBySlug.get(
        item.replacement
      );

    const refs =
      profileRows.filter(
        (profile) =>
          targetUsesLegacy(
            profile.target_race,
            item.legacy
          )
      ).length;

    console.log(
      `----- ${item.legacy} -----`
    );

    console.log(
      `Legacy row: ${
        legacy
          ? "YES"
          : "ALREADY ABSENT"
      }`
    );

    console.log(
      `Profile references: ${refs}`
    );

    console.log(
      `Replacement: ${
        item.replacement
      }`
    );

    console.log(
      `Replacement row: ${
        canonical
          ? "YES"
          : "NO"
      }`
    );

    console.log(
      `Replacement quality: ${
        canonical?.data_quality
        ?? "N/A"
      }`
    );

    if (
      !canonical ||
      canonical.data_quality !==
        "Verified" ||
      refs > 0
    ) {
      invalid =
        true;
    }

    console.log("");
  }

  if (invalid) {
    throw new Error(
      "V19 cleanup safety validation failed."
    );
  }

  if (dryRun) {
    console.log(
      "✓ V19 cleanup dry run complete."
    );

    console.log(
      "No database rows were deleted."
    );

    return;
  }

  const slugs =
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
        slugs
      )
      .select("slug");

  if (deleteError) {
    throw deleteError;
  }

  console.log(
    `Deleted: ${
      (deleted ?? []).length
    }/${slugs.length}`
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
        slugs
      );

  if (remainingError) {
    throw remainingError;
  }

  if (
    (remaining ?? []).length >
    0
  ) {
    throw new Error(
      "Legacy rows remain after V19 cleanup."
    );
  }

  console.log(
    "✓ No V19 legacy rows remain."
  );

  console.log(
    "✓ Cascading deletes handle editions and sources."
  );
}


main().catch(
  (error) => {
    console.error(error);

    process.exitCode = 1;
  }
);
