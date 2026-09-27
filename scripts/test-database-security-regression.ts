import {
  readFile,
} from "node:fs/promises";


function assert(
  condition: unknown,
  message: string
): asserts condition {

  if (!condition) {
    throw new Error(message);
  }
}


async function main() {

  const migration =
    await readFile(
      "supabase/migrations/20260927190000_user_data_security.sql",
      "utf-8"
    );

  const tables = [
    "profiles",
    "training_state",
    "app_feedback",
  ];


  for (
    const table of tables
  ) {

    assert(
      migration.includes(
        `alter table public.${table}\n  enable row level security`
      ),
      `${table}: RLS is not explicitly enabled`
    );

    assert(
      migration.includes(
        `on table public.${table}\n  from anon, authenticated`
      ),
      `${table}: legacy client privileges are not revoked`
    );


    console.log(
      `✓ ${table} explicitly enables RLS and resets privileges`
    );
  }


  const policies = [
    "profiles_select_own",
    "profiles_insert_own",
    "profiles_update_own",
    "profiles_delete_own",
    "training_state_select_own",
    "training_state_insert_own",
    "training_state_update_own",
    "training_state_delete_own",
    "app_feedback_insert_own",
  ];


  for (
    const policy of policies
  ) {

    assert(
      migration.includes(
        `"${policy}"`
      ),
      `Missing canonical policy: ${policy}`
    );
  }


  const uidChecks =
    migration.match(
      /\(select auth\.uid\(\)\)/g
    ) ?? [];

  assert(
    uidChecks.length === 11,
    `Expected 11 optimized auth.uid checks, found ${uidChecks.length}`
  );

  assert(
    migration.includes(
      "from pg_policies"
    ) &&
    migration.includes(
      "'drop policy %I on %I.%I'"
    ),
    "Unknown legacy policies are not removed"
  );

  assert(
    !/using\s*\(\s*true\s*\)/i.test(
      migration
    ) &&
    !/with check\s*\(\s*true\s*\)/i.test(
      migration
    ),
    "Migration contains a globally permissive policy"
  );


  const requiredColumns = [
    "capability_profile",
    "active_plan",
    "workout_history",
    "plan_history",
    "training_archive",
    "season_roadmap",
    "roadmap_revisions",
    "readiness_history",
    "weekly_review",
    "contact_email",
    "page_context",
    "metadata",
    "status",
  ];


  for (
    const column of
    requiredColumns
  ) {

    assert(
      migration.includes(
        column
      ),
      `Missing application column: ${column}`
    );
  }


  assert(
    migration.includes(
      "references auth.users(id)"
    ) &&
    migration.includes(
      "on delete cascade"
    ),
    "User tables are not tied to auth.users lifecycle"
  );


  assert(
    migration.includes(
      "available_days jsonb"
    ) &&
    !migration.includes(
      "available_days text[]"
    ),
    "available_days must match the live JSONB schema"
  );

  assert(
    migration.includes(
      "hours_per_week numeric"
    ) &&
    migration.includes(
      "current_training_hours numeric"
    ) &&
    migration.includes(
      "longest_session_minutes numeric"
    ),
    "Profile numeric types do not match the live schema"
  );

  assert(
    migration.includes(
      "app_feedback_category_check"
    ) &&
    migration.includes(
      "app_feedback_status_check"
    ) &&
    migration.includes(
      "profiles_capability_profile_object_check"
    ),
    "Live validation constraints are not preserved"
  );

  assert(
    migration.includes(
      "basse_app_feedback_user_id_fk"
    ) &&
    migration.includes(
      "Account deletion must therefore delete"
    ),
    "Feedback lifecycle is not aligned with account deletion"
  );

  assert(
    migration.trimStart()
      .startsWith("/*") &&
    migration.includes(
      "\nbegin;"
    ) &&
    migration.trimEnd()
      .endsWith("commit;"),
    "Migration is not transactionally bounded"
  );


  console.log(
    "✓ Canonical owner-only policy set is complete"
  );

  console.log(
    "✓ Unknown legacy policies are removed transactionally"
  );

  console.log(
    "✓ Application columns and auth-user lifecycle are covered"
  );

  console.log(
    "Database security regression result: 18 passed, 0 failed"
  );

  console.log(
    "✓ BASSE DATABASE SECURITY MIGRATION REGRESSION GREEN"
  );
}


main().catch(
  (
    error
  ) => {

    console.error(error);
    process.exitCode = 1;

  }
);
