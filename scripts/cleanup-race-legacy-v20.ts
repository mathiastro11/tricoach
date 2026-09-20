import {
  loadEnvConfig,
} from "@next/env";

loadEnvConfig(process.cwd());

import {
  createAdminClient,
} from "../lib/supabase-admin";


const LEGACY =
  "the-championship-samorin";


function targetUsesLegacy(
  targetRace: unknown
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
      id === LEGACY ||
      id.startsWith(
        `${LEGACY}-`
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
    "TriCoach · Race Cleanup V20"
  );

  console.log(
    `Mode: ${
      dryRun
        ? "DRY RUN"
        : "DELETE FROM SUPABASE"
    }`
  );

  console.log("");

  const {
    data: race,
    error: raceError,
  } =
    await supabase
      .from("races")
      .select(`
        slug,
        short_name,
        format,
        data_quality
      `)
      .eq(
        "slug",
        LEGACY
      )
      .maybeSingle();

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

  const refs =
    (profiles ?? []).filter(
      (profile) =>
        targetUsesLegacy(
          profile.target_race
        )
    ).length;

  console.log(
    `Race row: ${
      race
        ? "YES"
        : "ALREADY ABSENT"
    }`
  );

  if (race) {
    console.log(
      `Current format: ${race.format}`
    );

    console.log(
      `Current quality: ${race.data_quality}`
    );
  }

  console.log(
    `Profiles scanned: ${
      (profiles ?? []).length
    }`
  );

  console.log(
    `Profile references: ${refs}`
  );

  console.log(
    "Reason: 2027 The Championship "
    + "uses 2/80/18 km (100 km format), "
    + "which TriCoach does not currently support."
  );

  if (refs > 0) {
    throw new Error(
      "V20 cleanup blocked: "
      + "profile references remain."
    );
  }

  if (dryRun) {
    console.log("");
    console.log(
      "✓ V20 cleanup dry run complete."
    );

    console.log(
      "No database rows were deleted."
    );

    return;
  }

  const {
    error: deleteError,
  } =
    await supabase
      .from("races")
      .delete()
      .eq(
        "slug",
        LEGACY
      );

  if (deleteError) {
    throw deleteError;
  }

  const {
    data: remaining,
    error: verifyError,
  } =
    await supabase
      .from("races")
      .select("slug")
      .eq(
        "slug",
        LEGACY
      );

  if (verifyError) {
    throw verifyError;
  }

  if (
    (remaining ?? []).length >
    0
  ) {
    throw new Error(
      "V20 cleanup failed: "
      + "race row remains."
    );
  }

  console.log("");
  console.log(
    "✓ The Championship 70.3 row deleted."
  );

  console.log(
    "✓ Cascading delete handles its "
    + "edition/source rows."
  );
}


main().catch(
  (error) => {
    console.error(error);

    process.exitCode = 1;
  }
);
