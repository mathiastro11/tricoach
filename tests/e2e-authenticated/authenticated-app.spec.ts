import {
  expect,
  test,
} from "@playwright/test";

import {
  createAuthenticatedTestUser,
  deleteAuthenticatedTestUser,
  seedAuthenticatedTestUserState,
  type AuthenticatedTestUser,
} from "./support/authenticated-test-user";


function addIsoDays(
  isoDate: string,
  days: number
) {

  const date =
    new Date(
      `${isoDate}T12:00:00Z`
    );

  date.setUTCDate(
    date.getUTCDate() +
      days
  );

  return date
    .toISOString()
    .slice(
      0,
      10
    );
}


function getNextOsloWeekStart() {

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Europe/Oslo",
        year:
          "numeric",
        month:
          "2-digit",
        day:
          "2-digit",
      }
    ).formatToParts(
      new Date()
    );

  const values =
    Object.fromEntries(
      parts.map(
        ({
          type,
          value,
        }) => [
          type,
          value,
        ]
      )
    );

  const date =
    new Date(
      Date.UTC(
        Number(
          values.year
        ),
        Number(
          values.month
        ) - 1,
        Number(
          values.day
        )
      )
    );

  const daysSinceMonday =
    (
      date.getUTCDay() +
      6
    ) % 7;

  date.setUTCDate(
    date.getUTCDate() -
      daysSinceMonday +
      7
  );

  return date
    .toISOString()
    .slice(
      0,
      10
    );
}


function buildDeterministicNextWeekPreview() {

  const weekStart =
    getNextOsloWeekStart();

  const sessions = [
    {
      day:
        "Monday",
      sport:
        "Rest",
      title:
        "Recovery day",
      durationMinutes:
        0,
      intensity:
        "Rest",
      purpose:
        "Absorb training and prepare for the week.",
      details: [],
    },
    {
      day:
        "Tuesday",
      sport:
        "Run",
      title:
        "Easy aerobic run",
      durationMinutes:
        40,
      intensity:
        "Easy aerobic",
      purpose:
        "Build aerobic durability.",
      details: [
        "Keep the effort controlled and conversational.",
      ],
    },
    {
      day:
        "Wednesday",
      sport:
        "Swim",
      title:
        "Technique swim",
      durationMinutes:
        45,
      intensity:
        "Easy",
      purpose:
        "Develop efficient swim mechanics.",
      details: [
        "Prioritize relaxed technique and consistent form.",
      ],
    },
    {
      day:
        "Thursday",
      sport:
        "Bike",
      title:
        "Aerobic bike",
      durationMinutes:
        60,
      intensity:
        "Easy aerobic",
      purpose:
        "Build cycling endurance.",
      details: [
        "Ride smoothly at a sustainable aerobic effort.",
      ],
    },
    {
      day:
        "Friday",
      sport:
        "Strength",
      title:
        "Triathlon strength",
      durationMinutes:
        30,
      intensity:
        "Controlled",
      purpose:
        "Maintain robust movement and strength.",
      details: [
        "Use controlled technique throughout.",
      ],
    },
    {
      day:
        "Saturday",
      sport:
        "Bike",
      title:
        "Long aerobic ride",
      durationMinutes:
        90,
      intensity:
        "Easy aerobic",
      purpose:
        "Build long-course aerobic durability.",
      details: [
        "Keep pacing steady from start to finish.",
      ],
    },
    {
      day:
        "Sunday",
      sport:
        "Run",
      title:
        "Steady endurance run",
      durationMinutes:
        70,
      intensity:
        "Conversational",
      purpose:
        "Build durable running endurance.",
      details: [
        "Stay relaxed and finish with good form.",
      ],
    },
  ];

  return {
    summary:
      "Deterministic authenticated E2E preview.",
    totalHours:
      5.58,
    focus:
      "Aerobic consistency",
    weekStart,
    days:
      sessions.map(
        (
          session,
          index
        ) => ({
          ...session,
          date:
            addIsoDays(
              weekStart,
              index
            ),
          sessionSource:
            "coach",
          sessionRole:
            "primary",
          sessionSlot:
            "Flexible",
        })
      ),
    additionalSessions: [],
  };
}


let testUser:
  AuthenticatedTestUser | null =
    null;


test.beforeEach(
  async (
    {},
    testInfo
  ) => {

    testUser =
      await createAuthenticatedTestUser(
        testInfo.project.name
      );

    await seedAuthenticatedTestUserState(
      testUser.id
    );
  }
);


test.afterEach(
  async () => {

    if (!testUser) {
      return;
    }

    await deleteAuthenticatedTestUser(
      testUser.id
    );

    testUser =
      null;
  }
);


test(
  "authenticated athlete can log in and navigate the main app",
  async ({
    page,
  }) => {

    if (!testUser) {
      throw new Error(
        "Authenticated E2E test user was not provisioned."
      );
    }


    const browserProblems:
      string[] = [];

    const networkProblems:
      string[] = [];

    const unexpectedAiRequests:
      string[] = [];

    const aiRoutePaths =
      new Set([
        "/api/coach",
        "/api/goal-change-week",
        "/api/next-week",
        "/api/plan",
        "/api/roadmap",
      ]);


    page.on(
      "pageerror",
      (error) => {
        browserProblems.push(
          `pageerror: ${error.message}`
        );
      }
    );


    page.on(
      "console",
      (message) => {

        if (
          message.type() ===
            "error" ||
          message.type() ===
            "warning"
        ) {
          browserProblems.push(
            `${message.type()}: ${message.text()}`
          );
        }
      }
    );


    page.on(
      "response",
      (response) => {

        if (
          response.status() <
          400
        ) {
          return;
        }

        networkProblems.push(
          [
            response.status(),
            response.request()
              .resourceType(),
            response.url(),
          ].join(
            " "
          )
        );
      }
    );


    page.on(
      "request",
      (request) => {

        const url =
          new URL(
            request.url()
          );

        if (
          url.origin ===
            "http://127.0.0.1:3100" &&
          aiRoutePaths.has(
            url.pathname
          )
        ) {
          unexpectedAiRequests.push(
            `${request.method()} ${url.pathname}`
          );
        }
      }
    );


    async function expectNoDocumentOverflow(
      view:
        string
    ) {

      const dimensions =
        await page.evaluate(
          () => ({
            scrollWidth:
              document.documentElement
                .scrollWidth,

            clientWidth:
              document.documentElement
                .clientWidth,
          })
        );

      expect(
        dimensions.scrollWidth,
        `${view} causes document-level horizontal overflow: ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`
      ).toBeLessThanOrEqual(
        dimensions.clientWidth +
          2
      );
    }


    const deterministicNextWeekPreview =
      buildDeterministicNextWeekPreview();


    /*
      Established athletes normally already have the
      provisional upcoming week persisted locally.

      Preload that real production state so this read-only
      browser smoke test does not spend an AI request merely
      because Playwright starts with an empty browser profile.
    */
    await page.addInitScript(
      (preview) => {

        localStorage.setItem(
          "tricoach-next-week-preview",
          JSON.stringify(
            preview
          )
        );
      },
      deterministicNextWeekPreview
    );


    await page.goto(
      "/login"
    );


    await page
      .locator(
        'input[type="email"]'
      )
      .fill(
        testUser.email
      );

    await page
      .locator(
        'input[type="password"]'
      )
      .fill(
        testUser.password
      );


    await page
      .getByRole(
        "button",
        {
          name:
            /Log in/,
        }
      )
      .click();


    await page.waitForURL(
      (url) =>
        url.pathname ===
        "/",
      {
        timeout:
          15_000,
      }
    );


    await expect(
      page.locator(
        ".todayAlpineView"
      )
    ).toBeVisible({
      timeout:
        15_000,
    });


    await expect(
      page
        .getByText(
          "WELCOME BACK"
        )
    ).toHaveCount(
      0
    );


    const navigation =
      page.locator(
        ".sideNav"
      );


    await expectNoDocumentOverflow(
      "Today"
    );


    await navigation
      .getByRole(
        "button",
        {
          name:
            "Week",
          exact:
            true,
        }
      )
      .click();

    await expect(
      page.locator(
        ".smartWeekHero"
      )
    ).toBeVisible();

    await expectNoDocumentOverflow(
      "Week"
    );


    await navigation
      .getByRole(
        "button",
        {
          name:
            "Calendar",
          exact:
            true,
        }
      )
      .click();

    await expect(
      page.locator(
        ".calendarPage"
      )
    ).toBeVisible();

    await expectNoDocumentOverflow(
      "Calendar"
    );


    await navigation
      .getByRole(
        "button",
        {
          name:
            "Coach",
          exact:
            true,
        }
      )
      .click();

    await expect(
      page.locator(
        ".coachCleanShell"
      )
    ).toBeVisible();

    await expectNoDocumentOverflow(
      "Coach"
    );


    await navigation
      .getByRole(
        "button",
        {
          name:
            "Progress",
          exact:
            true,
        }
      )
      .click();

    await expect(
      page.locator(
        ".completedProgress"
      )
    ).toBeVisible();

    await expectNoDocumentOverflow(
      "Progress"
    );


    await navigation
      .getByRole(
        "button",
        {
          name:
            "Season",
          exact:
            true,
        }
      )
      .click();

    await expect(
      page.locator(
        ".racePlanShell"
      )
    ).toBeVisible();

    await expectNoDocumentOverflow(
      "Season"
    );


    await navigation
      .getByRole(
        "button",
        {
          name:
            "Today",
          exact:
            true,
        }
      )
      .click();

    await expect(
      page.locator(
        ".todayAlpineView"
      )
    ).toBeVisible();

    await expectNoDocumentOverflow(
      "Today after navigation"
    );


    /*
      This smoke path is deliberately read-only.

      Merely opening the authenticated views must not
      trigger expensive AI generation or plan mutation.
    */
    expect(
      unexpectedAiRequests,
      `Unexpected AI/API generation requests: ${unexpectedAiRequests.join(" | ")}`
    ).toEqual(
      []
    );


    expect(
      networkProblems,
      `Unexpected HTTP failures: ${networkProblems.join(" | ")}`
    ).toEqual(
      []
    );


    expect(
      browserProblems,
      `Browser console/runtime problems: ${browserProblems.join(" | ")}`
    ).toEqual(
      []
    );
  }
);
