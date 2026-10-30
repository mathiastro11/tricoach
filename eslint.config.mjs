import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated native build artifacts:
    "native/dist/**",
    "ios/App/App/public/**",
    "ios/DerivedData/**",
    "android/app/src/main/assets/public/**",
    "android/.gradle/**",
    "android/build/**",
    "android/app/build/**",
  ]),
]);

export default eslintConfig;
