import {
  readFile,
} from "node:fs/promises";

import {
  loadEnvConfig,
} from "@next/env";


type PostHandler = (
  request: Request
) => Promise<Response>;


type ProtectedRoute = {
  name: string;
  path: string;
  sourcePath: string;
  load: () => Promise<{
    POST: PostHandler;
  }>;
};


const protectedRoutes:
  ProtectedRoute[] = [
    {
      name: "Coach",
      path: "/api/coach",
      sourcePath:
        "app/api/coach/route.ts",
      load: () =>
        import(
          "../app/api/coach/route"
        ),
    },
    {
      name: "Goal Change Week",
      path:
        "/api/goal-change-week",
      sourcePath:
        "app/api/goal-change-week/route.ts",
      load: () =>
        import(
          "../app/api/goal-change-week/route"
        ),
    },
    {
      name: "Next Week",
      path:
        "/api/next-week",
      sourcePath:
        "app/api/next-week/route.ts",
      load: () =>
        import(
          "../app/api/next-week/route"
        ),
    },
    {
      name: "Plan",
      path: "/api/plan",
      sourcePath:
        "app/api/plan/route.ts",
      load: () =>
        import(
          "../app/api/plan/route"
        ),
    },
    {
      name: "Roadmap",
      path: "/api/roadmap",
      sourcePath:
        "app/api/roadmap/route.ts",
      load: () =>
        import(
          "../app/api/roadmap/route"
        ),
    },
  ];


function assert(
  condition: unknown,
  message: string
): asserts condition {

  if (!condition) {
    throw new Error(message);
  }
}


async function assertUnauthorized(
  route: ProtectedRoute,
  headers:
    Record<string, string>
) {

  const {
    POST,
  } =
    await route.load();

  const response =
    await POST(
      new Request(
        `http://localhost${route.path}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            ...headers,
          },
          body:
            JSON.stringify({}),
        }
      )
    );

  const payload =
    await response.json() as {
      error?: unknown;
    };


  assert(
    response.status === 401,
    `${route.name}: expected 401, received ${response.status}`
  );

  assert(
    payload.error ===
      "Authentication required.",
    `${route.name}: unexpected authentication response`
  );
}


async function main() {

  loadEnvConfig(
    process.cwd()
  );


  for (
    const route of
    protectedRoutes
  ) {

    const source =
      await readFile(
        route.sourcePath,
        "utf-8"
      );

    const guardIndex =
      source.indexOf(
        "await requireApiUser"
      );

    const bodyIndex =
      source.indexOf(
        "request.json()"
      );


    assert(
      source.includes(
        '@/lib/api-auth'
      ),
      `${route.name}: missing centralized auth import`
    );

    assert(
      guardIndex >= 0 &&
      bodyIndex >= 0 &&
      guardIndex < bodyIndex,
      `${route.name}: auth must run before body parsing`
    );


    await assertUnauthorized(
      route,
      {}
    );

    await assertUnauthorized(
      route,
      {
        Authorization:
          "Basic invalid",
      }
    );


    console.log(
      `✓ ${route.name} rejects unauthenticated access before request processing`
    );
  }


  const raceSource =
    await readFile(
      "app/api/races/route.ts",
      "utf-8"
    );

  assert(
    !raceSource.includes(
      "requireApiUser"
    ),
    "Public race discovery must remain publicly readable"
  );


  const liveAiSource =
    await readFile(
      "scripts/test-ai-plan-scenarios.ts",
      "utf-8"
    );

  assert(
    liveAiSource.includes(
      "BASSE_TEST_USER_EMAIL"
    ) &&
    liveAiSource.includes(
      "BASSE_TEST_USER_PASSWORD"
    ) &&
    liveAiSource.includes(
      "Authorization:"
    ),
    "Live AI plan matrix must use real authenticated access"
  );


  console.log(
    "✓ Public race discovery remains public"
  );

  console.log(
    "✓ Live AI matrix now uses a verified test-user session"
  );

  console.log(
    "API auth regression result: 12 passed, 0 failed"
  );

  console.log(
    "✓ BASSE API AUTH REGRESSION GREEN"
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
