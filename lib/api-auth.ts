import type {
  User,
} from "@supabase/supabase-js";

import {
  NextResponse,
} from "next/server";

import {
  createAuthServerClient,
} from "@/lib/supabase-auth-server";

import {
  createServerClient,
} from "@/lib/supabase-server";


type ApiAuthentication =
  | {
      ok: true;
      user: User;
      mode: "cookie" | "bearer";
    }
  | {
      ok: false;
      response: NextResponse;
    };


function unauthorizedResponse() {
  return NextResponse.json(
    {
      error:
        "Authentication required.",
    },
    {
      status: 401,
      headers: {
        "Cache-Control":
          "no-store",
        "WWW-Authenticate":
          'Bearer realm="Basse API"',
      },
    }
  );
}


export async function requireApiUser(
  request: Request
): Promise<ApiAuthentication> {

  const authorizationHeader =
    request.headers.get(
      "authorization"
    );


  try {

    /*
      Native clients authenticate with a verified
      Supabase access token.

      A supplied but malformed Authorization header
      must never fall back to cookie authentication.
    */
    if (
      authorizationHeader !==
      null
    ) {

      const match =
        /^Bearer\s+(\S+)$/i.exec(
          authorizationHeader.trim()
        );

      const token =
        match?.[1];


      if (!token) {
        return {
          ok: false,
          response:
            unauthorizedResponse(),
        };
      }


      const supabase =
        createServerClient();

      const {
        data,
        error,
      } =
        await supabase.auth.getUser(
          token
        );


      if (
        error ||
        !data.user
      ) {
        return {
          ok: false,
          response:
            unauthorizedResponse(),
        };
      }


      return {
        ok: true,
        user: data.user,
        mode: "bearer",
      };
    }


    /*
      The existing browser application uses the
      Supabase session stored in secure cookies.
    */
    const supabase =
      await createAuthServerClient();

    const {
      data,
      error,
    } =
        await supabase.auth.getUser();


    if (
      error ||
      !data.user
    ) {
      return {
        ok: false,
        response:
          unauthorizedResponse(),
      };
    }


    return {
      ok: true,
      user: data.user,
      mode: "cookie",
    };

  } catch {

    /*
      Authentication failures deliberately expose
      no provider or token details to the client.
    */
    return {
      ok: false,
      response:
        unauthorizedResponse(),
    };
  }
}
