import OpenAI from "openai";


/*
  Runtime server boundary.

  This helper is intentionally used only by app/api routes.
  Avoid the Next-specific "server-only" marker here because
  our production QA harness imports route handlers directly
  through tsx outside the Next runtime.
*/
if (
  typeof window !== "undefined"
) {
  throw new Error(
    "openai-server.ts must never run in the browser."
  );
}


/*
  ========================================================
  BASSE OPENAI REQUEST FAIL-SAFE
  ========================================================

  Interactive AI requests must not be allowed to wait for
  the SDK's much longer default request window.

  One retry remains available for a temporary API/network
  failure, but every individual attempt is bounded.
*/

export const OPENAI_REQUEST_TIMEOUT_MS =
  35_000;

export const OPENAI_MAX_RETRIES =
  1;


/*
  Complex structured planning calls legitimately take longer
  than short interactive coaching requests.

  They receive one bounded attempt rather than two short
  attempts. This prevents duplicate long-running requests,
  duplicated cost and misleading 70-second retry failures.
*/
export const OPENAI_PLANNING_REQUEST_TIMEOUT_MS =
  90_000;

export const OPENAI_PLANNING_MAX_RETRIES =
  0;


type OpenAIClientProfile = {
  timeout: number;
  maxRetries: number;
};


function createConfiguredOpenAIClient(
  profile: OpenAIClientProfile
) {

  return new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY,

    timeout:
      profile.timeout,

    maxRetries:
      profile.maxRetries,
  });
}


export function createOpenAIClient() {

  return createConfiguredOpenAIClient({
    timeout:
      OPENAI_REQUEST_TIMEOUT_MS,

    maxRetries:
      OPENAI_MAX_RETRIES,
  });
}


export function createPlanningOpenAIClient() {

  return createConfiguredOpenAIClient({
    timeout:
      OPENAI_PLANNING_REQUEST_TIMEOUT_MS,

    maxRetries:
      OPENAI_PLANNING_MAX_RETRIES,
  });
}
