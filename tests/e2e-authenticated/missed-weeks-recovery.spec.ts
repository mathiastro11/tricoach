import {
  expect,
  test,
} from "@playwright/test";

import {
  createAuthenticatedTestUser,
  deleteAuthenticatedTestUser,
  readAuthenticatedWeekRolloverState,
  seedAuthenticatedMissedWeeksRecoveryState,
  type AuthenticatedMissedWeeksRecoveryFixture,
  type AuthenticatedTestUser,
} from "./support/authenticated-test-user";


let testUser:
  AuthenticatedTestUser |
  null =
    null;

let fixture:
  AuthenticatedMissedWeeksRecoveryFixture |
  null =
    null;


function addIsoDays(
  isoDate:
    string,
  days:
    number
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


function buildRecoveredCurrentWeekPlan() {

  const sessions = [
    {
      sport:
        "Rest",

      title:
        "Recovery Monday",

      durationMinutes:
        0,

      intensity:
        "Recovery",

      purpose:
        "Respect the unavailable Calendar day.",

      details:
        [
          "No structured training.",
        ],
    },

    {
      sport:
        "Bike",

      title:
        "Recovered current-week bike",

      durationMinutes:
        45,

      intensity:
        "Easy",

      purpose:
        "Restart aerobic training conservatively.",

      details:
        [
          "Keep the ride comfortable.",
        ],
    },

    {
      sport:
        "Swim",

      title:
        "Recovered current-week swim",

      durationMinutes:
        45,

      intensity:
        "Easy",

      purpose:
        "Use the limited swim-only Calendar window.",

      details:
        [
          "Focus on relaxed technique.",
        ],
    },

    {
      sport:
        "Rest",

      title:
        "Recovery Thursday",

      durationMinutes:
        0,

      intensity:
        "Recovery",

      purpose:
        "Avoid compressing missed training into the new week.",

      details:
        [
          "No structured training.",
        ],
    },

    {
      sport:
        "Run",

      title:
        "Recovered current-week run",

      durationMinutes:
        40,

      intensity:
        "Easy",

      purpose:
        "Restore run consistency safely.",

      details:
        [
          "Stay conversational.",
        ],
    },

    {
      sport:
        "Bike",

      title:
        "Recovered endurance ride",

      durationMinutes:
        60,

      intensity:
        "Easy–Moderate",

      purpose:
        "Re-establish aerobic durability.",

      details:
        [
          "Ride steadily.",
        ],
    },

    {
      sport:
        "Rest",

      title:
        "Recovery Sunday",

      durationMinutes:
        0,

      intensity:
        "Recovery",

      purpose:
        "Finish the recovery week fresh.",

      details:
        [
          "No structured training.",
        ],
    },
  ];


  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];


  return {
    summary:
      "Deterministic current-week plan after a multi-week absence.",

    totalHours:
      3.17,

    focus:
      "Safe return after missed weeks",

    days:
      sessions.map(
        (
          session,
          index
        ) => ({
          sessionId:
            `recovered-current-${index}`,

          day:
            weekdays[index],

          sessionSource:
            "coach",

          sessionRole:
            "primary",

          sessionSlot:
            "Flexible",

          ...session,
        })
      ),

    additionalSessions:
      [],
  };
}


function buildFollowingWeekPreview() {

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];


  return {
    summary:
      "Deterministic following week after missed-weeks recovery.",

    totalHours:
      0.75,

    focus:
      "Continue rebuilding consistency",

    days:
      weekdays.map(
        (
          day,
          index
        ) => ({
          day,

          sport:
            index === 1
              ? "Run"
              : "Rest",

          title:
            index === 1
              ? "Post-recovery Next Week run"
              : "Recovery day",

          durationMinutes:
            index === 1
              ? 45
              : 0,

          intensity:
            index === 1
              ? "Easy"
              : "Recovery",

          purpose:
            index === 1
              ? "Verify Next Week resumes after recovery."
              : "Recover.",

          details:
            index === 1
              ? [
                  "Keep the run controlled.",
                ]
              : [
                  "No structured training.",
                ],
        })
      ),

    additionalSessions:
      [],
  };
}


test.beforeEach(
  async (
    {},
    testInfo
  ) => {

    testUser =
      await createAuthenticatedTestUser(
        `missed-weeks-${testInfo.project.name}`
      );

    fixture =
      await seedAuthenticatedMissedWeeksRecoveryState(
        testUser.id
      );
  }
);


test.afterEach(
  async () => {

    if (testUser) {
      await deleteAuthenticatedTestUser(
        testUser.id
      );
    }

    testUser =
      null;

    fixture =
      null;
  }
);


test(
  "multi-week absence archives only last real week and rebuilds current week",
  async ({
    page,
  }) => {

    if (
      !testUser ||
      !fixture
    ) {
      throw new Error(
        "Missed-weeks recovery E2E fixture was not created."
      );
    }


    const browserProblems:
      string[] =
        [];

    const unexpectedAiRequests:
      string[] =
        [];

    let planRequests =
      0;

    let nextWeekRequests =
      0;


    page.on(
      "pageerror",
      (
        error
      ) => {
        browserProblems.push(
          `pageerror: ${error.message}`
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
          browserProblems.push(
            `${message.type()}: ${message.text()}`
          );
        }
      }
    );


    /*
      No live AI is allowed.

      /api/plan is the one legitimate recovery request.
      After that, one /api/next-week request should rebuild
      the normal one-week-ahead preview.
    */
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

          planRequests +=
            1;

          await route.fulfill({
            status:
              200,

            contentType:
              "application/json",

            body:
              JSON.stringify({
                plan:
                  buildRecoveredCurrentWeekPlan(),
              }),
          });

          return;
        }


        if (
          url.pathname ===
            "/api/next-week"
        ) {

          nextWeekRequests +=
            1;

          await route.fulfill({
            status:
              200,

            contentType:
              "application/json",

            body:
              JSON.stringify({
                nextPlan:
                  buildFollowingWeekPreview(),
              }),
          });

          return;
        }


        unexpectedAiRequests.push(
          `${route.request().method()} ${url.pathname}`
        );

        await route.fulfill({
          status:
            503,

          contentType:
            "application/json",

          body:
            JSON.stringify({
              error:
                "Blocked by missed-weeks recovery E2E.",
            }),
        });
      }
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
            /^Log in/,
        }
      )
      .click();


    await expect(
      page
    ).toHaveURL(
      "/"
    );

    await expect(
      page.locator(
        ".todayAlpineView"
      )
    ).toBeVisible({
      timeout:
        15_000,
    });


    const followingWeekStart =
      addIsoDays(
        fixture.currentWeekStart,
        7
      );


    /*
      Wait for recovery + persistence + new Next Week preview.
    */
    await expect
      .poll(
        async () => {

          const state =
            await readAuthenticatedWeekRolloverState(
              testUser!.id
            );


          const outgoingHistoryMatches =
            state.planHistory.filter(
              (plan) =>
                plan.weekStart ===
                fixture!.staleWeekStart
            );


          const outgoingArchiveMatches =
            state.trainingArchive.filter(
              (entry) =>
                entry.plan.weekStart ===
                fixture!.staleWeekStart
            );


          const stalePreviewArchiveMatches =
            state.trainingArchive.filter(
              (entry) =>
                entry.plan.weekStart ===
                fixture!.stalePreviewWeekStart
            );


          const archived =
            outgoingArchiveMatches[0] ??
            null;


          return {
            activeWeekStart:
              state.activePlan
                ?.weekStart ??
              null,

            activeMarker:
              state.activePlan
                ?.days?.[1]
                ?.title ??
              null,

            workoutHistoryLength:
              state.workoutHistory.length,

            weeklyReview:
              state.weeklyReview,

            outgoingPlanHistoryCount:
              outgoingHistoryMatches.length,

            outgoingArchiveCount:
              outgoingArchiveMatches.length,

            staleIntermediateArchiveCount:
              stalePreviewArchiveMatches.length,

            archivedFeedbackIds:
              archived
                ?.feedback
                ?.map(
                  (entry) =>
                    entry.id
                ) ??
              [],

            archivedReviewHeadline:
              archived
                ?.review
                ?.headline ??
              null,

            nextWeekStart:
              state.nextWeekPreview
                ?.weekStart ??
              null,

            nextWeekMarker:
              state.nextWeekPreview
                ?.days?.[1]
                ?.title ??
              null,

            availability:
              state.trainingAvailability,
          };
        },
        {
          timeout:
            20_000,
        }
      )
      .toEqual({
        activeWeekStart:
          fixture.currentWeekStart,

        activeMarker:
          "Recovered current-week bike",

        workoutHistoryLength:
          0,

        weeklyReview:
          null,

        outgoingPlanHistoryCount:
          1,

        outgoingArchiveCount:
          1,

        staleIntermediateArchiveCount:
          0,

        archivedFeedbackIds:
          fixture.outgoingFeedback.map(
            (entry) =>
              entry.id
          ),

        archivedReviewHeadline:
          fixture.outgoingReview
            .headline,

        nextWeekStart:
          followingWeekStart,

        nextWeekMarker:
          "Post-recovery Next Week run",

        availability:
          fixture.trainingAvailability,
      });


    expect(
      planRequests
    ).toBe(
      1
    );

    expect(
      nextWeekRequests
    ).toBe(
      1
    );


    await page.waitForLoadState(
      "networkidle"
    );


    /*
      Simulate a second device / reinstall.

      Recovery must not execute a second time, and the archived
      week must remain unique.
    */
    await page.evaluate(
      () => {

        for (
          let index =
            localStorage.length - 1;
          index >= 0;
          index -= 1
        ) {

          const key =
            localStorage.key(
              index
            );

          if (
            key?.startsWith(
              "tricoach-"
            )
          ) {
            localStorage.removeItem(
              key
            );
          }
        }
      }
    );


    await page.reload();


    await expect(
      page.locator(
        ".todayAlpineView"
      )
    ).toBeVisible({
      timeout:
        15_000,
    });


    await page.waitForTimeout(
      1200
    );


    await expect
      .poll(
        async () => {

          const state =
            await readAuthenticatedWeekRolloverState(
              testUser!.id
            );

          return {
            activeWeekStart:
              state.activePlan
                ?.weekStart ??
              null,

            outgoingPlanHistoryCount:
              state.planHistory.filter(
                (plan) =>
                  plan.weekStart ===
                  fixture!.staleWeekStart
              ).length,

            outgoingArchiveCount:
              state.trainingArchive.filter(
                (entry) =>
                  entry.plan.weekStart ===
                  fixture!.staleWeekStart
              ).length,

            staleIntermediateArchiveCount:
              state.trainingArchive.filter(
                (entry) =>
                  entry.plan.weekStart ===
                  fixture!.stalePreviewWeekStart
              ).length,

            workoutHistoryLength:
              state.workoutHistory.length,

            weeklyReview:
              state.weeklyReview,

            nextWeekStart:
              state.nextWeekPreview
                ?.weekStart ??
              null,

            availability:
              state.trainingAvailability,
          };
        }
      )
      .toEqual({
        activeWeekStart:
          fixture.currentWeekStart,

        outgoingPlanHistoryCount:
          1,

        outgoingArchiveCount:
          1,

        staleIntermediateArchiveCount:
          0,

        workoutHistoryLength:
          0,

        weeklyReview:
          null,

        nextWeekStart:
          followingWeekStart,

        availability:
          fixture.trainingAvailability,
      });


    expect(
      planRequests
    ).toBe(
      1
    );

    expect(
      nextWeekRequests
    ).toBe(
      1
    );

    expect(
      unexpectedAiRequests
    ).toEqual(
      []
    );

    expect(
      browserProblems
    ).toEqual(
      []
    );
  }
);
