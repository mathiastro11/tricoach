import {
  readFileSync,
} from "node:fs";

import {
  AI_DAILY_LIMIT,
  AI_ROUTE_LIMITS,
  enforceAiRateLimit,
} from "../lib/api-rate-limit";


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


async function run() {

  let capturedRouteLimit =
    -1;

  let capturedRouteWindow =
    -1;

  let capturedDailyLimit =
    -1;

  let capturedDailyWindow =
    -1;


  const allowed =
    await enforceAiRateLimit({
      userId:
        "00000000-0000-4000-8000-000000000001",

      route:
        "next-week",

      consume:
        async (input) => {

          capturedRouteLimit =
            input.routeLimit;

          capturedRouteWindow =
            input.routeWindowSeconds;

          capturedDailyLimit =
            input.dailyLimit;

          capturedDailyWindow =
            input.dailyWindowSeconds;


          return {
            allowed: true,
            routeRemaining: 5,
            dailyRemaining: 59,
            retryAfterSeconds: 0,
            routeLimit: 6,
            dailyLimit: 60,
          };
        },
    });


  check(
    allowed.ok,
    "Allowed requests continue normally"
  );

  check(
    capturedRouteLimit === 6 &&
    capturedRouteWindow === 900,
    "Next Week receives its route-specific limit"
  );

  check(
    capturedDailyLimit === 60 &&
    capturedDailyWindow === 86_400,
    "Every route receives the shared daily budget"
  );


  const denied =
    await enforceAiRateLimit({
      userId:
        "00000000-0000-4000-8000-000000000001",

      route:
        "roadmap",

      consume:
        async () => ({
          allowed: false,
          routeRemaining: 0,
          dailyRemaining: 12,
          retryAfterSeconds: 417,
          routeLimit: 4,
          dailyLimit: 60,
        }),
    });


  check(
    !denied.ok &&
    denied.response.status === 429,
    "Exhausted limits return HTTP 429"
  );

  check(
    !denied.ok &&
    denied.response.headers.get(
      "Retry-After"
    ) === "417",
    "Rate-limit response includes Retry-After"
  );

  check(
    !denied.ok &&
    denied.response.headers.get(
      "Cache-Control"
    ) === "no-store",
    "Rate-limit responses cannot be cached"
  );


  const originalConsoleError =
    console.error;

  console.error =
    () => undefined;

  const unavailable =
    await enforceAiRateLimit({
      userId:
        "00000000-0000-4000-8000-000000000001",

      route:
        "coach",

      consume:
        async () => {
          throw new Error(
            "Simulated database outage"
          );
        },
    });

  console.error =
    originalConsoleError;


  check(
    !unavailable.ok &&
    unavailable.response.status === 503,
    "Limiter outages fail closed before OpenAI"
  );

  check(
    !unavailable.ok &&
    unavailable.response.headers.get(
      "Retry-After"
    ) === "30",
    "Fail-closed response provides a retry delay"
  );

  check(
    AI_ROUTE_LIMITS.coach.requests === 15 &&
    AI_ROUTE_LIMITS.roadmap.requests === 4 &&
    AI_ROUTE_LIMITS["next-week"].requests === 6,
    "Route budgets match the production policy"
  );

  check(
    AI_DAILY_LIMIT.requests === 60,
    "Shared daily AI budget is bounded"
  );


  const routeFiles = [
    ["app/api/coach/route.ts", "coach"],
    [
      "app/api/goal-change-week/route.ts",
      "goal-change-week",
    ],
    [
      "app/api/next-week/route.ts",
      "next-week",
    ],
    ["app/api/plan/route.ts", "plan"],
    [
      "app/api/roadmap/route.ts",
      "roadmap",
    ],
  ] as const;


  for (
    const [
      file,
      route,
    ] of routeFiles
  ) {

    const source =
      readFileSync(
        file,
        "utf8"
      );

    const authIndex =
      source.indexOf(
        "await requireApiUser"
      );

    const limiterIndex =
      source.indexOf(
        "await enforceAiRateLimit"
      );

    const bodyIndex =
      source.indexOf(
        "await readApiJsonBody"
      );


    check(
      source.includes(
        'from "@/lib/api-rate-limit"'
      ) &&
      source.includes(
        `route:\n        "${route}"`
      ),
      `${file} uses its persistent limiter bucket`
    );

    check(
      authIndex >= 0 &&
      limiterIndex > authIndex &&
      bodyIndex > limiterIndex,
      `${file} authenticates, rate-limits, then parses`
    );
  }


  const migration =
    readFileSync(
      "supabase/migrations/20260927201500_ai_rate_limits.sql",
      "utf8"
    )
      .toLowerCase();


  check(
    migration.includes(
      "enable row level security"
    ),
    "Rate-limit storage enables RLS"
  );

  check(
    migration.includes(
      "security definer"
    ) &&
    migration.includes(
      "set search_path = ''"
    ),
    "Limiter function has a hardened execution context"
  );

  check(
    migration.includes(
      "pg_advisory_xact_lock"
    ),
    "Concurrent requests are serialized per user"
  );

  check(
    migration.includes(
      "from public, anon, authenticated"
    ) &&
    migration.includes(
      "to service_role"
    ),
    "Only the server service role may consume limits"
  );

  check(
    migration.includes(
      "on delete cascade"
    ),
    "Rate-limit data is removed with its user"
  );


  console.log(
    `AI rate-limit regression result: ${passed} passed, 0 failed`
  );

  console.log(
    "✓ BASSE AI RATE-LIMIT REGRESSION GREEN"
  );
}


run();
