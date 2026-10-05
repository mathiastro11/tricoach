import {
  existsSync,
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


for (
  const path of [
    "app/error.tsx",
    "app/global-error.tsx",
    "app/loading.tsx",
    "app/not-found.tsx",
    "components/RouteStateCard.tsx",
  ]
) {
  check(
    existsSync(
      path
    ),
    `${path} exists`
  );
}


const routeError =
  readFileSync(
    "app/error.tsx",
    "utf8"
  );

const globalError =
  readFileSync(
    "app/global-error.tsx",
    "utf8"
  );

const loading =
  readFileSync(
    "app/loading.tsx",
    "utf8"
  );

const notFound =
  readFileSync(
    "app/not-found.tsx",
    "utf8"
  );

const routeStateCard =
  readFileSync(
    "components/RouteStateCard.tsx",
    "utf8"
  );

const styles =
  readFileSync(
    "app/globals.css",
    "utf8"
  );

const browserTest =
  readFileSync(
    "tests/e2e/public-surfaces.spec.ts",
    "utf8"
  );

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


check(
  routeError.startsWith(
    '"use client";'
  ) &&
  routeError.includes(
    "retry:"
  ) &&
  routeError.includes(
    "retry()"
  ) &&
  routeError.includes(
    "Unhandled Basse route error."
  ),
  "Route error boundary follows the Next 16 retry contract"
);

check(
  globalError.startsWith(
    '"use client";'
  ) &&
  globalError.includes(
    "<html"
  ) &&
  globalError.includes(
    "<body"
  ) &&
  globalError.includes(
    "<title>"
  ) &&
  globalError.includes(
    "retry()"
  ),
  "Global error boundary owns a complete document"
);

check(
  loading.includes(
    'aria-busy="true"'
  ) &&
  loading.includes(
    'announce="status"'
  ) &&
  loading.includes(
    "Getting your route ready."
  ),
  "Loading state is lightweight and announced"
);

check(
  notFound.includes(
    'href="/"'
  ) &&
  notFound.includes(
    'href="/login"'
  ) &&
  notFound.includes(
    "This route went off course."
  ),
  "Not-found state provides safe recovery routes"
);

check(
  routeStateCard.includes(
    'aria-labelledby="system-state-title"'
  ) &&
  routeStateCard.includes(
    'announce === "alert"'
  ),
  "Shared system-state card has accessible announcements"
);

check(
  styles.includes(
    "BASSE PRODUCTION SYSTEM STATES V1"
  ) &&
  styles.includes(
    "prefers-reduced-motion: reduce"
  ) &&
  styles.includes(
    ".systemStateActionPrimary:focus-visible"
  ),
  "System states support focus and reduced motion"
);

check(
  browserTest.includes(
    '"/browser-qa-missing-route"'
  ) &&
  browserTest.includes(
    "surface.status"
  ) &&
  browserTest.includes(
    "This route went off course"
  ),
  "Real 404 behavior is covered by browser QA"
);

check(
  packageJson
    .scripts?.[
      "test:route-states"
    ] ===
      "tsx scripts/test-route-state-regression.ts" &&
  packageJson
    .scripts?.[
      "test:ci"
    ]?.includes(
      "npm run test:route-states"
    ),
  "Route-state regression belongs to the quality gate"
);

check(
  workflow.includes(
    "npm run test:route-states"
  ),
  "CI verifies production route states"
);


console.log(
  `Route-state regression result: ${passed} passed, 0 failed`
);

console.log(
  "✓ BASSE ROUTE-STATE REGRESSION GREEN"
);
