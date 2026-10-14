import {
  expect,
  test,
} from "@playwright/test";

import {
  createAuthenticatedTestUser,
  deleteAuthenticatedTestUser,
  readAuthenticatedWeekRolloverState,
  seedAuthenticatedWeekRolloverState,
  type AuthenticatedTestUser,
  type AuthenticatedWeekRolloverFixture,
} from "./support/authenticated-test-user";


let testUser:
  AuthenticatedTestUser |
  null =
    null;

let fixture:
  AuthenticatedWeekRolloverFixture |
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


function buildFollowingWeekPreview() {

  return {
    summary:
      "Deterministic following-week preview after rollover.",

    totalHours:
      0.67,

    focus:
      "Post-rollover continuity",

    days:
      [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].map(
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
              ? "Following-week rollover run"
              : "Recovery day",

          durationMinutes:
            index === 1
              ? 40
              : 0,

          intensity:
            index === 1
              ? "Easy"
              : "Recovery",

          purpose:
            index === 1
              ? "Verify automatic post-rollover preview generation."
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
        `rollover-${testInfo.project.name}`
      );

    fixture =
      await seedAuthenticatedWeekRolloverState(
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
  "stored current-week preview is promoted exactly once and outgoing week is archived",
  async ({
    page,
  }) => {

    if (
      !testUser ||
      !fixture
    ) {
      throw new Error(
        "Week rollover E2E fixture was not created."
      );
    }


    const browserProblems:
      string[] =
        [];

    const unexpectedAiRequests:
      string[] =
        [];

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
      Promotion itself must not need AI.

      Once the stored current-week preview has become active,
      Basse is expected to build exactly one preview for the
      following week. Keep that request deterministic.
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
                "Blocked by week rollover E2E.",
            }),
        });
      }
    );


    /*
      Open the app with only Supabase carrying the stale active
      week + current-week provisional preview.
    */
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
      Wait for:
      1. restore-time promotion,
      2. archive persistence,
      3. clean current-week state,
      4. automatic following-week preview persistence.
    */
    await expect
      .poll(
        async () => {

          const state =
            await readAuthenticatedWeekRolloverState(
              testUser!.id
            );

          const previousHistoryMatches =
            state.planHistory.filter(
              (plan) =>
                plan.weekStart ===
                fixture!.previousWeekStart
            );

          const previousArchiveMatches =
            state.trainingArchive.filter(
              (entry) =>
                entry.plan.weekStart ===
                fixture!.previousWeekStart
            );

          const archived =
            previousArchiveMatches[0] ??
            null;


          return {
            activeWeekStart:
              state.activePlan
                ?.weekStart ??
              null,

            activeMarker:
              state.activePlan
                ?.days?.[2]
                ?.title ??
              null,

            workoutHistoryLength:
              state.workoutHistory.length,

            weeklyReview:
              state.weeklyReview,

            planHistoryMatches:
              previousHistoryMatches.length,

            archiveMatches:
              previousArchiveMatches.length,

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
            15_000,
        }
      )
      .toEqual({
        activeWeekStart:
          fixture.currentWeekStart,

        activeMarker:
          "Promoted rollover swim",

        workoutHistoryLength:
          0,

        weeklyReview:
          null,

        planHistoryMatches:
          1,

        archiveMatches:
          1,

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
          "Following-week rollover run",

        availability:
          fixture.trainingAvailability,
      });


    expect(
      nextWeekRequests
    ).toBe(
      1
    );


    /*
      The normal persistence writes caused by promotion must
      finish before we simulate another device / reinstall.
    */
    await page.waitForLoadState(
      "networkidle"
    );


    /*
      A second device must restore the already-promoted state,
      not archive the old week again.
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


    /*
      Give the automatic preview effect enough time to run.

      Because the following-week preview is already restored
      from Supabase it must return locally without another
      /api/next-week request.
    */
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

            previousPlanHistoryCount:
              state.planHistory.filter(
                (plan) =>
                  plan.weekStart ===
                  fixture!.previousWeekStart
              ).length,

            previousArchiveCount:
              state.trainingArchive.filter(
                (entry) =>
                  entry.plan.weekStart ===
                  fixture!.previousWeekStart
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

        previousPlanHistoryCount:
          1,

        previousArchiveCount:
          1,

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
