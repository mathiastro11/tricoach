import {
  NextRequest,
} from "next/server";

import {
  config,
  proxy,
} from "../proxy";


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


function makeRequest(
  origin: string,
  method = "OPTIONS"
) {

  return new NextRequest(
    "https://basse.example/api/coach",
    {
      method,

      headers: {
        Origin:
          origin,

        "Access-Control-Request-Method":
          "POST",

        "Access-Control-Request-Headers":
          "authorization,content-type",
      },
    }
  );
}


const iosOrigin =
  "capacitor://localhost";

const androidOrigin =
  "https://localhost";


const iosPreflight =
  proxy(
    makeRequest(
      iosOrigin
    )
  );


check(
  iosPreflight.status ===
    204,
  "iOS native preflight is accepted"
);

check(
  iosPreflight.headers.get(
    "access-control-allow-origin"
  ) ===
    iosOrigin,
  "iOS native origin is echoed exactly"
);

check(
  iosPreflight.headers.get(
    "access-control-allow-headers"
  ) ===
    "Authorization, Content-Type",
  "Bearer and JSON headers are explicitly allowed"
);

check(
  iosPreflight.headers.get(
    "access-control-allow-methods"
  ) ===
    "GET, POST, DELETE, OPTIONS",
  "Native API methods are explicitly allowed"
);

check(
  !iosPreflight.headers.has(
    "access-control-allow-credentials"
  ),
  "Cross-origin cookie credentials are not enabled"
);


const androidPreflight =
  proxy(
    makeRequest(
      androidOrigin
    )
  );


check(
  androidPreflight.status ===
    204,
  "Android native preflight is accepted"
);

check(
  androidPreflight.headers.get(
    "access-control-allow-origin"
  ) ===
    androidOrigin,
  "Android native origin is echoed exactly"
);


const hostilePreflight =
  proxy(
    makeRequest(
      "https://evil.example"
    )
  );


check(
  hostilePreflight.status ===
    403,
  "Unknown cross-origin preflight is rejected"
);

check(
  !hostilePreflight.headers.has(
    "access-control-allow-origin"
  ),
  "Rejected origin receives no CORS permission"
);


const nativeRequest =
  proxy(
    makeRequest(
      iosOrigin,
      "POST"
    )
  );


check(
  nativeRequest.headers.get(
    "access-control-allow-origin"
  ) ===
    iosOrigin,
  "Normal native API responses receive CORS permission"
);

check(
  nativeRequest.headers.get(
    "vary"
  ) ===
    "Origin",
  "Native API responses vary by Origin"
);


const normalWebRequest =
  proxy(
    new NextRequest(
      "https://basse.example/api/coach",
      {
        method:
          "POST",
      }
    )
  );


check(
  !normalWebRequest.headers.has(
    "access-control-allow-origin"
  ),
  "Normal same-origin web traffic remains unchanged"
);

check(
  config.matcher ===
    "/api/:path*",
  "CORS boundary is restricted to API routes"
);


console.log(
  `Native API CORS regression result: ${passed} passed, ${failed} failed`
);


if (
  failed > 0
) {
  process.exitCode =
    1;
} else {
  console.log(
    "✓ BASSE NATIVE API CORS REGRESSION GREEN"
  );
}
