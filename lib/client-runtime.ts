export type NativeRuntimeConfig = {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};


let nativeRuntimeConfig:
  NativeRuntimeConfig |
  null =
    null;


function normalizeBaseUrl(
  value: string,
  fieldName: string
) {

  const trimmed =
    value
      .trim()
      .replace(
        /\/+$/,
        ""
      );


  if (!trimmed) {
    throw new Error(
      `${fieldName} is required.`
    );
  }


  const parsed =
    new URL(
      trimmed
    );


  if (
    parsed.protocol !==
    "https:"
  ) {
    throw new Error(
      `${fieldName} must use HTTPS.`
    );
  }


  if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error(`${fieldName} must be a plain HTTPS origin.`);
  }

  return parsed.origin;
}


export function configureNativeRuntime(
  config:
    NativeRuntimeConfig
) {

  const validatedConfig: NativeRuntimeConfig = {
    apiBaseUrl:
      normalizeBaseUrl(
        config.apiBaseUrl,
        "Native API base URL"
      ),

    supabaseUrl:
      normalizeBaseUrl(
        config.supabaseUrl,
        "Native Supabase URL"
      ),

    supabaseAnonKey:
      config.supabaseAnonKey
        .trim(),
  };


  if (
    !validatedConfig
      .supabaseAnonKey
  ) {
    throw new Error(
      "Native Supabase anon key is required."
    );
  }

  nativeRuntimeConfig = validatedConfig;
}


export function isNativeRuntimeConfigured() {

  return (
    nativeRuntimeConfig !==
    null
  );
}


export function getApiUrl(
  path: string
) {

  if (
    !path.startsWith(
      "/api/"
    )
  ) {
    throw new Error(
      `Basse API paths must begin with /api/: ${path}`
    );
  }


  if (
    !nativeRuntimeConfig
  ) {
    /*
      Existing Next.js web behavior.

      Keeping the relative URL means browser requests remain
      same-origin and continue to use secure Supabase cookies.
    */
    return path;
  }


  return (
    nativeRuntimeConfig
      .apiBaseUrl +
    path
  );
}


export function getSupabasePublicConfig() {

  if (
    nativeRuntimeConfig
  ) {
    return {
      url:
        nativeRuntimeConfig
          .supabaseUrl,

      anonKey:
        nativeRuntimeConfig
          .supabaseAnonKey,
    };
  }


  /*
    Next.js replaces NEXT_PUBLIC_* values in the web build.

    The typeof guard also lets this module exist inside the
    future Vite/Capacitor bundle, where process is not a
    browser global.
  */
  const url =
    typeof process !==
      "undefined"
      ? process.env
          .NEXT_PUBLIC_SUPABASE_URL
      : undefined;

  const anonKey =
    typeof process !==
      "undefined"
      ? process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY
      : undefined;


  if (
    !url ||
    !anonKey
  ) {
    throw new Error(
      "Basse Supabase public configuration is missing."
    );
  }


  return {
    url,
    anonKey,
  };
}


/*
  Deterministic regression-test cleanup.

  Production application code should never need to call this.
*/
export function clearNativeRuntimeForTests() {

  nativeRuntimeConfig =
    null;
}
