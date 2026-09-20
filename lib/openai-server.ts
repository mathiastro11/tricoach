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


export function createOpenAIClient() {

  return new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY,

    timeout:
      OPENAI_REQUEST_TIMEOUT_MS,

    maxRetries:
      OPENAI_MAX_RETRIES,
  });
}
