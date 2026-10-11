import {
  expect,
  test,
  type Page,
} from "@playwright/test";

import {
  createAuthenticatedTestUser,
  deleteAuthenticatedTestUser,
  type AuthenticatedTestUser,
} from "./support/authenticated-test-user";


let testUser:
  AuthenticatedTestUser |
  null =
    null;


function buildDeterministicPlan() {

  return {
    summary:
      "Deterministic onboarding E2E plan.",

    totalHours:
      5.5,

    focus:
      "Aerobic consistency",

    days: [
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
          "Recover and prepare for training.",
        details: [
          "Keep the day easy.",
        ],
      },
      {
        day:
          "Tuesday",
        sport:
          "Run",
        title:
          "Easy aerobic run",
        durationMinutes:
          45,
        intensity:
          "Easy aerobic",
        purpose:
          "Build aerobic durability.",
        details: [
          "Keep the effort conversational.",
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
          "Build efficient swim mechanics.",
        details: [
          "Prioritize relaxed technique.",
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
          "Ride at a sustainable aerobic effort.",
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
          "Maintain strength and robustness.",
        details: [
          "Use controlled technique.",
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
          "Build aerobic durability.",
        details: [
          "Keep pacing steady.",
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
          60,
        intensity:
          "Easy aerobic",
        purpose:
          "Build durable run fitness.",
        details: [
          "Stay relaxed and controlled.",
        ],
      },
    ],

    additionalSessions: [],
  };

}


async function expectNoDocumentOverflow(
  page:
    Page
) {

  const dimensions =
    await page.evaluate(
      () => ({
        clientWidth:
          document.documentElement.clientWidth,
        scrollWidth:
          document.documentElement.scrollWidth,
      })
    );

  expect(
    dimensions.scrollWidth
  ).toBeLessThanOrEqual(
    dimensions.clientWidth +
      2
  );

}


async function continueFrom(
  page:
    Page,
  title:
    string
) {

  await expect(
    page.getByRole(
      "heading",
      {
        name:
          title,
        exact:
          true,
      }
    )
  ).toBeVisible();

  await expectNoDocumentOverflow(
    page
  );

  await page
    .getByRole(
      "button",
      {
        name:
          /^Continue/,
      }
    )
    .click();

}


test.beforeEach(
  async (
    {},
    testInfo
  ) => {

    testUser =
      await createAuthenticatedTestUser(
        `onboarding-${testInfo.project.name}`
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
  "authenticated athlete can complete fresh onboarding without live AI",
  async ({
    page,
  }) => {

    if (!testUser) {
      throw new Error(
        "Authenticated onboarding test user was not created."
      );
    }


    const unexpectedAiRequests:
      string[] =
        [];

    let planRequestCount =
      0;

    let nextWeekRequestCount =
      0;


    await page.route(
      /\/api\/(?:coach|goal-change-week|next-week|plan|roadmap)(?:\?|$)/,
      async (
        route
      ) => {

        const url =
          new URL(
            route.request().url()
          );


        if (
          url.pathname ===
          "/api/plan"
        ) {

          planRequestCount +=
            1;

          await route.fulfill({
            status:
              200,

            contentType:
              "application/json",

            body:
              JSON.stringify({
                plan:
                  buildDeterministicPlan(),
              }),
          });

          return;
        }


        if (
          url.pathname ===
          "/api/next-week"
        ) {

          nextWeekRequestCount +=
            1;

          await route.fulfill({
            status:
              200,

            contentType:
              "application/json",

            body:
              JSON.stringify({
                nextPlan:
                  buildDeterministicPlan(),
              }),
          });

          return;
        }


        unexpectedAiRequests.push(
          url.pathname
        );


        await route.fulfill({
          status:
            503,

          contentType:
            "application/json",

          body:
            JSON.stringify({
              error:
                "Blocked by authenticated onboarding E2E.",
            }),
        });

      }
    );


    const pageErrors:
      string[] =
        [];

    const consoleProblems:
      string[] =
        [];


    page.on(
      "pageerror",
      (
        error
      ) => {
        pageErrors.push(
          error.message
        );
      }
    );


    page.on(
      "console",
      (
        message
      ) => {

        if (
          message.type() ===
            "error" ||
          message.type() ===
            "warning"
        ) {
          consoleProblems.push(
            `${message.type()}: ${message.text()}`
          );
        }

      }
    );


    await page.goto(
      "/login"
    );


    /*
      The flag survives the same-tab navigation from
      /login to / and is consumed once by restoreTriCoach.
    */
    await page.evaluate(
      () => {
        sessionStorage.setItem(
          "tricoach-force-fresh-onboarding",
          "1"
        );
      }
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
            /^Log in/,
        }
      )
      .click();


    await expect(
      page
    ).toHaveURL(
      "/"
    );


    /*
      STEP 1 — Athlete name
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "What should I call you?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await page
      .getByPlaceholder(
        "Your name"
      )
      .fill(
        "Basse Onboarding E2E"
      );


    await page
      .getByRole(
        "button",
        {
          name:
            /^Continue/,
        }
      )
      .click();


    /*
      STEP 2 — Units
    */
    await continueFrom(
      page,
      "Which units do you prefer?"
    );


    /*
      STEP 3 — Goal
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "What are you training for?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await page
      .getByRole(
        "button",
        {
          name:
            "70.3",
          exact:
            true,
        }
      )
      .click();


    await page
      .getByRole(
        "button",
        {
          name:
            /^Continue/,
        }
      )
      .click();


    /*
      STEP 4 — Target race
      A target race is deliberately optional here.
    */
    await continueFrom(
      page,
      "Which race are you training for?"
    );


    /*
      STEP 5 — Optional benchmarks
    */
    await continueFrom(
      page,
      "Want to make your training targets more precise?"
    );


    /*
      STEP 6 — Weekly training capacity
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "How much can you realistically train?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await page
      .locator(
        'input[type="range"]'
      )
      .fill(
        "8"
      );


    await page
      .getByRole(
        "button",
        {
          name:
            /^Continue/,
        }
      )
      .click();


    /*
      STEP 7 — Priority
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "Which discipline needs the most work?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await page
      .getByRole(
        "button",
        {
          name:
            "Swimming",
          exact:
            true,
        }
      )
      .click();


    await page
      .getByRole(
        "button",
        {
          name:
            /^Continue/,
        }
      )
      .click();


    /*
      STEP 8 — Experience
    */
    await continueFrom(
      page,
      "How experienced are you with triathlon?"
    );


    /*
      STEP 9 — Performance context
    */
    await continueFrom(
      page,
      "What competitive context best describes you?"
    );


    /*
      STEP 10 — Current training volume
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "How much are you training right now?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await page
      .locator(
        'input[type="range"]'
      )
      .fill(
        "6"
      );


    await page
      .getByRole(
        "button",
        {
          name:
            /^Continue/,
        }
      )
      .click();


    /*
      STEP 11 — Discipline levels
    */
    await continueFrom(
      page,
      "How would you rate your current level?"
    );


    /*
      STEP 12 — Weekly availability
    */
    await continueFrom(
      page,
      "When can you usually train each discipline?"
    );


    /*
      STEP 13 — Longest session
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "What is the longest session you can usually fit in?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await page
      .locator(
        'input[type="range"]'
      )
      .fill(
        "180"
      );


    await page
      .getByRole(
        "button",
        {
          name:
            /^Continue/,
        }
      )
      .click();


    /*
      STEP 14 — Equipment
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "What do you have access to?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expectNoDocumentOverflow(
      page
    );


    await page
      .getByRole(
        "button",
        {
          name:
            /^Continue/,
        }
      )
      .click();


    /*
      STEP 15 — Limitations
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "Anything your coach should know?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await page
      .getByPlaceholder(
        "Example: knee issues, cannot train mornings, nervous in open water..."
      )
      .fill(
        "No known limitations."
      );


    await page
      .getByRole(
        "button",
        {
          name:
            /^Continue/,
        }
      )
      .click();


    /*
      STEP 16 — Existing authenticated account.
      No signUp or confirmation email should be needed.
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "Ready to build your plan?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      page.getByText(
        "ACCOUNT CONNECTED",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expectNoDocumentOverflow(
      page
    );


    await page
      .getByRole(
        "button",
        {
          name:
            "Create my first week →",
          exact:
            true,
        }
      )
      .click();


    /*
      The mocked first plan must take the athlete into
      the real Today dashboard.
    */
    await expect(
      page.locator(
        ".todayAlpineView"
      )
    ).toBeVisible();


    expect(
      planRequestCount
    ).toBe(
      1
    );


    /*
      Give background effects enough time to reveal an
      accidental AI request. Those routes are blocked above.
    */
    await page.waitForTimeout(
      1_200
    );


    expect(
      nextWeekRequestCount
    ).toBe(
      1
    );


    expect(
      unexpectedAiRequests,
      `Unexpected AI requests: ${unexpectedAiRequests.join(", ")}`
    ).toEqual(
      []
    );


    expect(
      pageErrors,
      `Page errors: ${pageErrors.join("\n")}`
    ).toEqual(
      []
    );


    expect(
      consoleProblems,
      `Console problems: ${consoleProblems.join("\n")}`
    ).toEqual(
      []
    );

  }
);
