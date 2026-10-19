import {
  readFileSync,
} from "node:fs";

import {
  ACCOUNT_DELETION_CONFIRMATION,
  isAccountDeletionConfirmed,
} from "../lib/account-deletion";


let passed = 0;


function check(
  valid: boolean,
  name: string
) {

  if (!valid) {
    throw new Error(
      `Failed: ${name}`
    );
  }


  passed += 1;

  console.log(
    `✓ ${name}`
  );
}


const route =
  readFileSync(
    "app/api/account/route.ts",
    "utf8"
  );

const page =
  readFileSync(
    "app/page.tsx",
    "utf8"
  );

const settings =
  readFileSync(
    "components/SettingsModal.tsx",
    "utf8"
  );

const modal =
  readFileSync(
    "components/DeleteAccountModal.tsx",
    "utf8"
  );

const publicPage =
  readFileSync(
    "app/account-deletion/page.tsx",
    "utf8"
  );

const login =
  readFileSync(
    "app/login/page.tsx",
    "utf8"
  );

const userSecurityMigration =
  readFileSync(
    "supabase/migrations/20260927190000_user_data_security.sql",
    "utf8"
  );

const limiterMigration =
  readFileSync(
    "supabase/migrations/20260927201500_ai_rate_limits.sql",
    "utf8"
  );


check(
  ACCOUNT_DELETION_CONFIRMATION ===
    "DELETE" &&
  isAccountDeletionConfirmed(
    "DELETE"
  ),
  "Exact destructive confirmation is accepted"
);

check(
  !isAccountDeletionConfirmed(
    "delete"
  ) &&
  !isAccountDeletionConfirmed(
    " DELETE "
  ),
  "Approximate destructive confirmations are rejected"
);


const authIndex =
  route.indexOf(
    "requireApiUser"
  );

const bodyIndex =
  route.indexOf(
    "readApiJsonBody",
    authIndex + 1
  );

const deletionIndex =
  route.indexOf(
    ".deleteUser(",
    bodyIndex + 1
  );


check(
  authIndex >= 0 &&
  bodyIndex > authIndex &&
  deletionIndex > bodyIndex,
  "Account deletion authenticates before parsing and deletion"
);

check(
  route.includes(
    "authentication.user.id"
  ) &&
  !route.includes(
    "bodyResult.value.userId"
  ) &&
  !route.includes(
    "bodyResult.value.email"
  ),
  "Deletion target comes only from the verified identity"
);

check(
  route.includes(
    "isAccountDeletionConfirmed"
  ) &&
  route.includes(
    '"Cache-Control"'
  ) &&
  route.includes(
    '"no-store, max-age=0"'
  ),
  "Deletion requires confirmation and forbids caching"
);

const deletionFetch =
  page.indexOf(
    'apiFetch(\n          "/api/account"'
  );

check(
  deletionFetch > 0 &&
  page.lastIndexOf(
    "setHasRestoredData(false)",
    deletionFetch
  ) <
    deletionFetch &&
  page.lastIndexOf(
    "trainingStateWriteQueueRef.current",
    deletionFetch
  ) <
    deletionFetch,
  "Client disables persistence and drains writes before deletion"
);

check(
  page.includes(
    'scope:\n              "local"'
  ) &&
  page.includes(
    "localStorage.clear()"
  ) &&
  page.includes(
    "sessionStorage.clear()"
  ) &&
  page.includes(
    '"/account-deletion?deleted=1"'
  ),
  "Successful deletion clears browser state and exits the dashboard"
);

check(
  settings.includes(
    "onDeleteAccount"
  ) &&
  settings.includes(
    "Delete account"
  ),
  "Settings exposes in-app account deletion"
);

check(
  modal.includes(
    "ACCOUNT_DELETION_CONFIRMATION"
  ) &&
  modal.includes(
    "aria-modal"
  ) &&
  modal.includes(
    "!confirmed"
  ) &&
  modal.includes(
    ".toUpperCase()"
  ) &&
  !modal.includes(
    "useEffect"
  ),
  "Deletion modal requires accessible event-driven confirmation"
);

check(
  publicPage.includes(
    "Sign in to delete account"
  ) &&
  publicPage.includes(
    "What is deleted"
  ) &&
  publicPage.includes(
    'href="/login"'
  ),
  "Public web deletion resource explains and starts the flow"
);

check(
  publicPage.includes(
    'parameters.deleted === "1"'
  ) &&
  publicPage.includes(
    "associated data were deleted"
  ),
  "Deleted users receive a server-rendered completion message"
);

check(
  login.includes(
    '"/account-deletion"'
  ),
  "Login exposes the public deletion resource"
);

for (
  const table of [
    "profiles",
    "training_state",
    "app_feedback",
  ]
) {
  check(
    userSecurityMigration.includes(
      `public.${table}`
    ) &&
    userSecurityMigration.includes(
      "on delete cascade"
    ),
    `${table} remains linked to account deletion`
  );
}

check(
  limiterMigration.includes(
    "public.ai_rate_limit_buckets"
  ) &&
  limiterMigration.includes(
    "on delete cascade"
  ),
  "AI rate-limit data remains linked to account deletion"
);


console.log(
  `Account deletion regression result: ${passed} passed, 0 failed`
);

console.log(
  "✓ BASSE ACCOUNT DELETION REGRESSION GREEN"
);
