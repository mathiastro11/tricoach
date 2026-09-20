import {
  NextResponse,
} from "next/server";

import {
  createAuthServerClient,
} from "@/lib/supabase-auth-server";


export async function GET(
  request: Request
) {

  const url =
    new URL(
      request.url
    );


  const providerError =
    url.searchParams.get(
      "error_description"
    );


  if (providerError) {

    console.error(
      "Supabase confirmation error:",
      providerError
    );


    return new Response(
      `Basse could not confirm this email.\n\n${providerError}`,
      {
        status: 400,
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
        },
      }
    );

  }


  const code =
    url.searchParams.get(
      "code"
    );


  if (!code) {

    return new Response(
      "Basse could not confirm this email because the authentication code is missing.",
      {
        status: 400,
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
        },
      }
    );

  }


  const supabase =
    await createAuthServerClient();


  const {
    error,
  } =
    await supabase.auth
      .exchangeCodeForSession(
        code
      );


  if (error) {

    console.error(
      "Could not exchange confirmation code:",
      error
    );


    return new Response(
      `Basse could not complete email confirmation.\n\n${error.message}`,
      {
        status: 400,
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
        },
      }
    );

  }


  const destination =
    new URL(
      "/",
      url.origin
    );


  if (
    url.searchParams.get(
      "flow"
    ) === "onboarding"
  ) {

    destination.searchParams.set(
      "completeOnboarding",
      "1"
    );

  }


  return NextResponse.redirect(
    destination
  );
}
