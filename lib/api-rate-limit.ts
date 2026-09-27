import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase-admin";


export type AiRateLimitRoute =
  | "coach"
  | "goal-change-week"
  | "next-week"
  | "plan"
  | "roadmap";


type AiRouteLimit = {
  requests: number;
  windowSeconds: number;
};


export const AI_DAILY_LIMIT = {
  requests: 60,
  windowSeconds: 86_400,
} as const;


export const AI_ROUTE_LIMITS:
  Record<
    AiRateLimitRoute,
    AiRouteLimit
  > = {
    coach: {
      requests: 15,
      windowSeconds: 900,
    },

    "goal-change-week": {
      requests: 6,
      windowSeconds: 900,
    },

    "next-week": {
      requests: 6,
      windowSeconds: 900,
    },

    plan: {
      requests: 6,
      windowSeconds: 900,
    },

    roadmap: {
      requests: 4,
      windowSeconds: 900,
    },
  };


export type AiRateLimitDecision = {
  allowed: boolean;
  routeRemaining: number;
  dailyRemaining: number;
  retryAfterSeconds: number;
  routeLimit: number;
  dailyLimit: number;
};


type ConsumeAiRateLimitInput = {
  userId: string;
  route: AiRateLimitRoute;
  routeLimit: number;
  routeWindowSeconds: number;
  dailyLimit: number;
  dailyWindowSeconds: number;
};


export type AiRateLimitConsumer = (
  input: ConsumeAiRateLimitInput
) => Promise<AiRateLimitDecision>;


type AiRateLimitResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      response: NextResponse;
    };


function requireFiniteInteger(
  value: unknown,
  field: string
) {

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value)
  ) {
    throw new Error(
      `Invalid ${field} returned by the AI rate limiter.`
    );
  }

  return value;
}


async function consumePersistentAiRateLimit(
  input: ConsumeAiRateLimitInput
): Promise<AiRateLimitDecision> {

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "consume_ai_rate_limit",
      {
        p_user_id:
          input.userId,

        p_route:
          input.route,

        p_route_limit:
          input.routeLimit,

        p_route_window_seconds:
          input.routeWindowSeconds,

        p_daily_limit:
          input.dailyLimit,

        p_daily_window_seconds:
          input.dailyWindowSeconds,
      }
    );


  if (error) {
    throw new Error(
      "Persistent AI rate-limit storage failed."
    );
  }


  const row =
    Array.isArray(data)
      ? data[0]
      : null;


  if (
    !row ||
    typeof row.allowed !== "boolean"
  ) {
    throw new Error(
      "Persistent AI rate-limit storage returned an invalid decision."
    );
  }


  return {
    allowed:
      row.allowed,

    routeRemaining:
      requireFiniteInteger(
        row.route_remaining,
        "route_remaining"
      ),

    dailyRemaining:
      requireFiniteInteger(
        row.daily_remaining,
        "daily_remaining"
      ),

    retryAfterSeconds:
      requireFiniteInteger(
        row.retry_after_seconds,
        "retry_after_seconds"
      ),

    routeLimit:
      requireFiniteInteger(
        row.route_limit,
        "route_limit"
      ),

    dailyLimit:
      requireFiniteInteger(
        row.daily_limit,
        "daily_limit"
      ),
  };
}


export async function enforceAiRateLimit({
  userId,
  route,
  consume =
    consumePersistentAiRateLimit,
}: {
  userId: string;
  route: AiRateLimitRoute;
  consume?: AiRateLimitConsumer;
}): Promise<AiRateLimitResult> {

  const routeLimit =
    AI_ROUTE_LIMITS[route];


  try {
    const decision =
      await consume({
        userId,
        route,

        routeLimit:
          routeLimit.requests,

        routeWindowSeconds:
          routeLimit.windowSeconds,

        dailyLimit:
          AI_DAILY_LIMIT.requests,

        dailyWindowSeconds:
          AI_DAILY_LIMIT.windowSeconds,
      });


    if (decision.allowed) {
      return {
        ok: true,
      };
    }


    const retryAfter =
      Math.max(
        1,
        decision.retryAfterSeconds
      );


    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "Too many AI requests. Please wait before trying again.",
          },
          {
            status: 429,

            headers: {
              "Cache-Control":
                "no-store",

              "Retry-After":
                String(retryAfter),

              "X-RateLimit-Limit":
                String(
                  decision.routeLimit
                ),

              "X-RateLimit-Remaining":
                String(
                  decision.routeRemaining
                ),

              "X-RateLimit-Daily-Remaining":
                String(
                  decision.dailyRemaining
                ),
            },
          }
        ),
    };

  } catch (error) {

    console.error(
      "Basse AI rate limiter unavailable.",
      {
        route,

        reason:
          error instanceof Error
            ? error.message
            : "Unknown rate-limit failure",
      }
    );


    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "AI request protection is temporarily unavailable. Please try again shortly.",
          },
          {
            status: 503,

            headers: {
              "Cache-Control":
                "no-store",

              "Retry-After":
                "30",
            },
          }
        ),
    };
  }
}
