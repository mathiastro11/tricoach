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

const playwrightConfig =
  readFileSync(
    "playwright.config.ts",
    "utf8"
  );

const browserTest =
  readFileSync(
    "tests/e2e/public-surfaces.spec.ts",
    "utf8"
  );

const gitignore =
  readFileSync(
    ".gitignore",
    "utf8"
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
  "npm run test:route-states",
  "npm run typecheck",
  "npm run lint",
  "npm run test:security",
  "npm run test:coaching-all",
  "npx playwright install --with-deps chromium webkit",
  "npm run test:e2e",
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


check(
  packageJson
    .devDependencies?.[
      "@playwright/test"
    ] === "1.63.0" &&
  packageJson
    .devDependencies?.[
      "@axe-core/playwright"
    ] === "4.13.0",
  "Browser QA dependencies are exactly pinned"
);

check(
  packageJson
    .scripts?.[
      "test:e2e"
    ] ===
      "playwright test" &&
  packageJson
    .scripts?.[
      "test:e2e:install"
    ] ===
      "playwright install chromium webkit" &&
  packageJson
    .scripts?.[
      "test:ci"
    ]?.endsWith(
      "npm run test:e2e"
    ),
  "Local quality gate includes production browser QA"
);

check(
  playwrightConfig.includes(
    "npm run build && npm run start"
  ) &&
  playwrightConfig.includes(
    '"desktop-chromium"'
  ) &&
  playwrightConfig.includes(
    '"android-chromium"'
  ) &&
  playwrightConfig.includes(
    '"iphone-webkit"'
  ) &&
  playwrightConfig.includes(
    '"ipad-webkit"'
  ),
  "Browser QA covers production builds and target devices"
);

check(
  browserTest.includes(
    '"/login"'
  ) &&
  browserTest.includes(
    '"/account-deletion"'
  ) &&
  browserTest.includes(
    '"wcag22aa"'
  ) &&
  browserTest.includes(
    '"warning"'
  ) &&
  browserTest.includes(
    "Horizontal overflow detected"
  ),
  "Public browser QA covers accessibility and runtime health"
);

check(
  gitignore.includes(
    "/playwright-report/"
  ) &&
  gitignore.includes(
    "/test-results/"
  ) &&
  gitignore.includes(
    "/blob-report/"
  ),
  "Browser test artifacts stay outside version control"
);


console.log(
  `CI configuration regression result: ${passed} passed, 0 failed`
);

console.log(
  "✓ BASSE CI CONFIGURATION REGRESSION GREEN"
);
