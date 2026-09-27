import {
  readFileSync,
} from "node:fs";


const serverSource =
  readFileSync(
    "lib/openai-server.ts",
    "utf8"
  );

const nextWeekSource =
  readFileSync(
    "app/api/next-week/route.ts",
    "utf8"
  );


const checks: Array<{
  name: string;
  valid: boolean;
}> = [
  {
    name:
      "Short interactive requests retain the 35-second bound",

    valid:
      serverSource.includes(
        "OPENAI_REQUEST_TIMEOUT_MS =\n  35_000;"
      ),
  },
  {
    name:
      "Short interactive requests retain one retry",

    valid:
      serverSource.includes(
        "OPENAI_MAX_RETRIES =\n  1;"
      ),
  },
  {
    name:
      "Complex planning requests receive a 90-second bound",

    valid:
      serverSource.includes(
        "OPENAI_PLANNING_REQUEST_TIMEOUT_MS =\n  90_000;"
      ),
  },
  {
    name:
      "Complex planning requests disable automatic retries",

    valid:
      serverSource.includes(
        "OPENAI_PLANNING_MAX_RETRIES =\n  0;"
      ),
  },
  {
    name:
      "Planning client uses the dedicated timeout profile",

    valid:
      serverSource.includes(
        "timeout:\n      OPENAI_PLANNING_REQUEST_TIMEOUT_MS"
      ) &&
      serverSource.includes(
        "maxRetries:\n      OPENAI_PLANNING_MAX_RETRIES"
      ),
  },
  {
    name:
      "Next Week uses the dedicated planning client",

    valid:
      nextWeekSource.includes(
        "createPlanningOpenAIClient,"
      ) &&
      nextWeekSource.includes(
        "createPlanningOpenAIClient();"
      ) &&
      !nextWeekSource.includes(
        "createOpenAIClient,"
      ),
  },
];


let passed = 0;


for (
  const check of checks
) {

  if (
    !check.valid
  ) {
    throw new Error(
      `Failed: ${check.name}`
    );
  }

  passed += 1;

  console.log(
    `✓ ${check.name}`
  );
}


console.log(
  `OpenAI timeout regression result: ${passed} passed, 0 failed`
);

console.log(
  "✓ BASSE OPENAI TIMEOUT REGRESSION GREEN"
);
