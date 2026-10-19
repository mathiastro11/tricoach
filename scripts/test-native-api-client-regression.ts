import fs from "node:fs";

import {
  clearNativeRuntimeForTests,
  configureNativeRuntime,
  getApiUrl,
  getSupabasePublicConfig,
  isNativeRuntimeConfigured,
} from "../lib/client-runtime";


let passed =
  0;

let failed =
  0;


function check(
  condition: boolean,
  description: string
) {

  if (
    condition
  ) {
    passed += 1;
    console.log(
      `✓ ${description}`
    );
    return;
  }


  failed += 1;
  console.error(
    `✗ ${description}`
  );
}


clearNativeRuntimeForTests();


check(
  !isNativeRuntimeConfigured(),
  "Web runtime is the default"
);

check(
  getApiUrl(
    "/api/coach"
  ) ===
    "/api/coach",
  "Web API requests remain same-origin"
);


configureNativeRuntime({
  apiBaseUrl:
    "https://app.basse.example/",

  supabaseUrl:
    "https://project.supabase.co/",

  supabaseAnonKey:
    "native-test-anon-key",
});


check(
  isNativeRuntimeConfigured(),
  "Native runtime can be explicitly activated"
);

check(
  getApiUrl(
    "/api/coach"
  ) ===
    "https://app.basse.example/api/coach",
  "Native API requests use the configured HTTPS backend"
);


const nativeSupabase =
  getSupabasePublicConfig();


check(
  nativeSupabase.url ===
    "https://project.supabase.co",
  "Native Supabase URL is normalized"
);

check(
  nativeSupabase.anonKey ===
    "native-test-anon-key",
  "Native Supabase public key comes from runtime configuration"
);


const previousApiUrl = getApiUrl("/api/coach");
let missingKeyRejected = false;
try {
  configureNativeRuntime({ apiBaseUrl: nativeSupabase.url, supabaseUrl: nativeSupabase.url, supabaseAnonKey: " " });
} catch {
  missingKeyRejected = true;
}
check(
  missingKeyRejected && getApiUrl("/api/coach") === previousApiUrl && getSupabasePublicConfig().anonKey === nativeSupabase.anonKey,
  "Invalid configuration preserves previous valid native runtime"
);

const unsafeUrls = [
  "https:" + "//api.example/path",
  "https:" + "//api.example?debug=1",
  "https:" + "//api.example#fragment",
  "https:" + "//user:pass@api.example",
];

for (const unsafeUrl of unsafeUrls) {
  for (const field of ["apiBaseUrl", "supabaseUrl"] as const) {
    let rejected = false;
    try {
      configureNativeRuntime({
        apiBaseUrl: field === "apiBaseUrl" ? unsafeUrl : "https:" + "//app.basse.example",
        supabaseUrl: field === "supabaseUrl" ? unsafeUrl : "https:" + "//project.supabase.co",
        supabaseAnonKey: "native-test-anon-key",
      });
    } catch {
      rejected = true;
    }
    check(
      rejected && getApiUrl("/api/coach") === "https:" + "//app.basse.example/api/coach" && getSupabasePublicConfig().url === nativeSupabase.url,
      `${field} rejects unsafe URL: ${unsafeUrl}`
    );
  }
}

let invalidProtocolRejected =
  false;


try {
  configureNativeRuntime({
    apiBaseUrl:
      "http://insecure.example",

    supabaseUrl:
      "https://project.supabase.co",

    supabaseAnonKey:
      "test",
  });
} catch {
  invalidProtocolRejected =
    true;
}


check(
  invalidProtocolRejected,
  "Native backend configuration rejects insecure HTTP"
);


clearNativeRuntimeForTests();


const apiClientSource =
  fs.readFileSync(
    "lib/api-client.ts",
    "utf8"
  );


check(
  apiClientSource.includes(
    'headers.set('
  ) &&
  apiClientSource.includes(
    '"Authorization"'
  ) &&
  apiClientSource.includes(
    "`Bearer ${accessToken}`"
  ),
  "Native API client sends an explicit Bearer token"
);

check(
  apiClientSource.includes(
    'credentials:'
  ) &&
  apiClientSource.includes(
    '"omit"'
  ),
  "Native API client never opts into cross-origin cookies"
);


const supabaseSource =
  fs.readFileSync(
    "lib/supabase.ts",
    "utf8"
  );


check(
  supabaseSource.includes(
    "getSupabasePublicConfig"
  ),
  "Supabase client uses shared runtime configuration"
);


const pageSource =
  fs.readFileSync(
    "app/page.tsx",
    "utf8"
  );

const racePickerSource =
  fs.readFileSync(
    "components/RacePickerModal.tsx",
    "utf8"
  );


check(
  pageSource.includes(
    'from "@/lib/api-client"'
  ) &&
  !pageSource.includes(
    'fetch("/api/'
  ),
  "Main Basse client routes API traffic through apiFetch"
);

check(
  racePickerSource.includes(
    'from "@/lib/api-client"'
  ) &&
  !racePickerSource.includes(
    "await fetch("
  ),
  "Race discovery routes API traffic through apiFetch"
);


console.log(
  `Native API client regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {
  process.exitCode =
    1;
} else {
  console.log(
    "✓ BASSE NATIVE API CLIENT REGRESSION GREEN"
  );
}
