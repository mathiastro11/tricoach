import {
  createClient,
} from "@/lib/supabase";

import {
  getApiUrl,
  isNativeRuntimeConfigured,
} from "@/lib/client-runtime";


export async function apiFetch(
  path: string,
  init:
    RequestInit =
      {}
) {

  const url =
    getApiUrl(
      path
    );


  /*
    Web keeps its current same-origin request behavior.

    This deliberately does not add an Authorization header:
    requireApiUser() will continue using the secure Supabase
    cookie flow for the Next.js browser application.
  */
  if (
    !isNativeRuntimeConfigured()
  ) {
    return fetch(
      url,
      init
    );
  }


  /*
    Native does not depend on cross-origin cookies.

    Supabase owns session refresh/persistence client-side.
    The backend independently verifies this access token with
    supabase.auth.getUser(token) before accepting the request.
  */
  const supabase =
    createClient();


  const {
    data,
    error,
  } =
    await supabase.auth
      .getSession();


  if (error) {
    throw error;
  }


  const headers =
    new Headers(
      init.headers
    );


  const accessToken =
    data.session
      ?.access_token;


  if (
    accessToken &&
    !headers.has(
      "Authorization"
    )
  ) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  }


  return fetch(
    url,
    {
      ...init,
      headers,

      /*
        Native authentication is Bearer-only.
        Never opt into cross-origin cookie credentials.
      */
      credentials:
        "omit",
    }
  );
}
