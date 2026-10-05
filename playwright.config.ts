import {
  defineConfig,
  devices,
} from "@playwright/test";


const port =
  3100;

const baseURL =
  `http://127.0.0.1:${port}`;


export default defineConfig({
  testDir:
    "./tests/e2e",

  outputDir:
    "test-results",

  timeout:
    30_000,

  expect: {
    timeout:
      7_500,
  },

  fullyParallel:
    true,

  forbidOnly:
    Boolean(
      process.env.CI
    ),

  retries:
    process.env.CI
      ? 1
      : 0,

  workers:
    process.env.CI
      ? 2
      : undefined,

  reporter:
    process.env.CI
      ? [
          [
            "line",
          ],
          [
            "html",
            {
              open:
                "never",
            },
          ],
        ]
      : [
          [
            "line",
          ],
        ],

  use: {
    baseURL,

    locale:
      "en-US",

    timezoneId:
      "Europe/Oslo",

    trace:
      "retain-on-failure",

    screenshot:
      "only-on-failure",

    video:
      "retain-on-failure",
  },

  projects: [
    {
      name:
        "desktop-chromium",

      use: {
        ...devices[
          "Desktop Chrome"
        ],

        viewport: {
          width:
            1440,

          height:
            900,
        },
      },
    },

    {
      name:
        "android-chromium",

      use: {
        ...devices[
          "Pixel 7"
        ],
      },
    },

    {
      name:
        "iphone-webkit",

      use: {
        ...devices[
          "iPhone 13"
        ],
      },
    },

    {
      name:
        "ipad-webkit",

      use: {
        ...devices[
          "iPad Pro 11"
        ],
      },
    },
  ],

  webServer: {
    command:
      `npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}`,

    url:
      baseURL,

    reuseExistingServer:
      !process.env.CI,

    timeout:
      180_000,

    stdout:
      "pipe",

    stderr:
      "pipe",

    gracefulShutdown: {
      signal:
        "SIGTERM",

      timeout:
        5_000,
    },
  },
});
