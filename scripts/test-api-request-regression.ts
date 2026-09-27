import {
  readFile,
} from "node:fs/promises";

import {
  MAX_API_JSON_BYTES,
  readApiJsonBody,
} from "../lib/api-json";


function assert(
  condition: unknown,
  message: string
): asserts condition {

  if (!condition) {
    throw new Error(message);
  }
}


async function expectFailure(
  name: string,
  request: Request,
  expectedStatus: number
) {

  const result =
    await readApiJsonBody(
      request
    );


  assert(
    !result.ok,
    `${name}: expected rejection`
  );

  assert(
    result.response.status ===
      expectedStatus,
    `${name}: expected ${expectedStatus}, received ${result.response.status}`
  );

  assert(
    result.response.headers.get(
      "cache-control"
    ) === "no-store",
    `${name}: error response must disable caching`
  );


  console.log(
    `✓ ${name}`
  );
}


async function main() {

  await expectFailure(
    "Missing JSON Content-Type returns 415",
    new Request(
      "http://localhost/api/plan",
      {
        method: "POST",
        body: "{}",
      }
    ),
    415
  );


  await expectFailure(
    "Malformed JSON returns 400",
    new Request(
      "http://localhost/api/plan",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          '{"broken":',
      }
    ),
    400
  );


  await expectFailure(
    "Non-object JSON returns 400",
    new Request(
      "http://localhost/api/plan",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          "[]",
      }
    ),
    400
  );


  await expectFailure(
    "Declared oversized body returns 413",
    new Request(
      "http://localhost/api/plan",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",

          "Content-Length":
            String(
              MAX_API_JSON_BYTES +
              1
            ),
        },
        body: "{}",
      }
    ),
    413
  );


  await expectFailure(
    "Actually oversized streamed body returns 413",
    new Request(
      "http://localhost/api/plan",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            data:
              "x".repeat(
                MAX_API_JSON_BYTES
              ),
          }),
      }
    ),
    413
  );


  const valid =
    await readApiJsonBody(
      new Request(
        "http://localhost/api/plan",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json; charset=utf-8",
          },
          body:
            JSON.stringify({
              athlete: {
                name:
                  "Safety Test",
              },
            }),
        }
      )
    );


  assert(
    valid.ok,
    "Valid JSON object should pass"
  );

  assert(
    valid.value.athlete.name ===
      "Safety Test",
    "Valid JSON payload changed during parsing"
  );


  console.log(
    "✓ Valid JSON object remains intact"
  );


  const routePaths = [
    "app/api/coach/route.ts",
    "app/api/goal-change-week/route.ts",
    "app/api/next-week/route.ts",
    "app/api/plan/route.ts",
    "app/api/roadmap/route.ts",
  ];


  for (
    const routePath of
    routePaths
  ) {

    const source =
      await readFile(
        routePath,
        "utf-8"
      );

    const authIndex =
      source.indexOf(
        "await requireApiUser"
      );

    const bodyIndex =
      source.indexOf(
        "await readApiJsonBody"
      );

    const openAiIndex =
      source.indexOf(
        ".responses.create"
      );


    assert(
      authIndex >= 0 &&
      bodyIndex > authIndex,
      `${routePath}: body parsing must follow authentication`
    );

    assert(
      openAiIndex < 0 ||
      bodyIndex < openAiIndex,
      `${routePath}: body validation must precede OpenAI work`
    );


    console.log(
      `✓ ${routePath} uses bounded JSON parsing`
    );
  }


  console.log(
    "API request safety regression result: 11 passed, 0 failed"
  );

  console.log(
    "✓ BASSE API REQUEST SAFETY REGRESSION GREEN"
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
