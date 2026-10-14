import {
  NextResponse,
  type NextRequest,
} from "next/server";


const NATIVE_API_ORIGINS =
  new Set([
    "capacitor://localhost",
    "https://localhost",
  ]);


const CORS_HEADERS = {
  "Access-Control-Allow-Methods":
    "GET, POST, DELETE, OPTIONS",

  "Access-Control-Allow-Headers":
    "Authorization, Content-Type",

  "Access-Control-Max-Age":
    "86400",
};


function applyCorsHeaders(
  response: NextResponse,
  origin: string
) {

  response.headers.set(
    "Access-Control-Allow-Origin",
    origin
  );

  response.headers.set(
    "Vary",
    "Origin"
  );


  for (
    const [
      key,
      value,
    ] of Object.entries(
      CORS_HEADERS
    )
  ) {
    response.headers.set(
      key,
      value
    );
  }


  return response;
}


export function proxy(
  request: NextRequest
) {

  const origin =
    request.headers.get(
      "origin"
    ) ?? "";


  const isAllowedNativeOrigin =
    NATIVE_API_ORIGINS.has(
      origin
    );


  /*
    Capacitor's local WebView origin is different from
    the deployed Basse API origin.

    Native requests authenticate with an explicit Supabase
    Bearer token, never cross-origin cookies.
  */
  if (
    request.method ===
    "OPTIONS"
  ) {

    if (
      !isAllowedNativeOrigin
    ) {
      return NextResponse.json(
        {
          error:
            "Origin not allowed.",
        },
        {
          status:
            403,

          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }


    return applyCorsHeaders(
      new NextResponse(
        null,
        {
          status:
            204,
        }
      ),
      origin
    );
  }


  const response =
    NextResponse.next();


  /*
    Same-origin web requests do not need CORS headers.

    Only explicitly approved native origins receive them.
  */
  if (
    isAllowedNativeOrigin
  ) {
    applyCorsHeaders(
      response,
      origin
    );
  }


  return response;
}


export const config = {
  matcher:
    "/api/:path*",
};
