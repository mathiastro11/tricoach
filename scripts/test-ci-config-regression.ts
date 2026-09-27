import {
  readFileSync,
} from "node:fs";


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


const nodeVersion =
  readFileSync(
    ".nvmrc",
    "utf8"
  )
    .trim();

const workflow =
  readFileSync(
    ".github/workflows/quality.yml",
    "utf8"
  );

const packageJson =
  JSON.parse(
    readFileSync(
      "package.json",
      "utf8"
    )
  );

const packageLock =
  JSON.parse(
    readFileSync(
      "package-lock.json",
      "utf8"
    )
  );


check(
  nodeVersion ===
    "24.19.0",
  "Local and CI Node version is pinned"
);

check(
  packageJson.engines?.node ===
    ">=24.19.0 <25" &&
  packageJson.engines?.npm ===
    ">=11.17.0 <12",
  "Package runtime requirements are explicit"
);

check(
  packageJson.packageManager ===
    "npm@11.17.0",
  "Package manager version is pinned"
);

check(
  packageLock
    .packages?.[""]
    ?.engines?.node ===
      packageJson.engines.node &&
  packageLock
    .packages?.[""]
    ?.engines?.npm ===
      packageJson.engines.npm,
  "Lockfile carries the runtime requirements"
);

check(
  workflow.includes(
    "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1"
  ) &&
  workflow.includes(
    "actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38"
  ),
  "Third-party workflow actions are SHA-pinned"
);

check(
  workflow.includes(
    "permissions:\n  contents: read"
  ) &&
  workflow.includes(
    "persist-credentials: false"
  ),
  "Workflow token is least-privileged"
);

check(
  workflow.includes(
    "node-version-file: .nvmrc"
  ) &&
  workflow.includes(
    "npm@11.17.0"
  ),
  "Workflow uses the pinned toolchain"
);

check(
  workflow.includes(
    "npm ci --no-audit --no-fund"
  ),
  "CI installs the exact dependency lock"
);

for (const command of [
  "npm run test:ci-config",
  "npm run typecheck",
  "npm run lint",
  "npm run test:security",
  "npm run test:coaching-all",
  "npm run build",
]) {
  check(
    workflow.includes(command),
    `Workflow runs ${command}`
  );
}

check(
  !workflow.includes(
    "pull_request_target"
  ),
  "Workflow avoids privileged fork execution"
);

check(
  !workflow.includes(
    "${{ secrets."
  ),
  "Deterministic quality checks require no production secrets"
);

check(
  workflow.includes(
    "timeout-minutes: 20"
  ) &&
  workflow.includes(
    "cancel-in-progress: true"
  ),
  "CI work is time-bounded and superseded runs are cancelled"
);


console.log(
  `CI configuration regression result: ${passed} passed, 0 failed`
);

console.log(
  "✓ BASSE CI CONFIGURATION REGRESSION GREEN"
);
