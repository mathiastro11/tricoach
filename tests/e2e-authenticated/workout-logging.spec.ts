import {
  expect,
  test,
  type Page,
} from "@playwright/test";

import {
  addAuthenticatedWorkoutLoggingSecondarySession,
  createAuthenticatedTestUser,
  deleteAuthenticatedTestUser,
  readAuthenticatedWorkoutHistory,
  seedAuthenticatedWorkoutLoggingState,
  type AuthenticatedTestUser,
  type AuthenticatedWorkoutLoggingFixture,
} from "./support/authenticated-test-user";


let testUser:
  AuthenticatedTestUser |
  null =
    null;

let workoutFixture:
  AuthenticatedWorkoutLoggingFixture |
  null =
    null;


function buildSafeNextWeekPlan() {

  return {
    summary:
      "Deterministic E2E next-week preview.",

    totalHours:
      0,

    focus:
      "Recovery",

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
        (day) => ({
          day,

          sport:
            "Rest",

          title:
            "Recovery day",

          durationMinutes:
            0,

          intensity:
            "Rest",

          purpose:
            "Recover between training weeks.",

          details: [
            "No structured training.",
          ],
        })
      ),

    additionalSessions:
      [],
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


test.beforeEach(
  async (
    {},
    testInfo
  ) => {

    testUser =
      await createAuthenticatedTestUser(
        `workout-log-${testInfo.project.name}`
      );


    workoutFixture =
      await seedAuthenticatedWorkoutLoggingState(
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

    workoutFixture =
      null;

  }
);


test(
  "logged workout persists to cloud and survives local-cache reload",
  async ({
    page,
  }) => {

    if (
      !testUser ||
      !workoutFixture
    ) {
      throw new Error(
        "Workout logging E2E fixture was not created."
      );
    }


    const unexpectedAiRequests:
      string[] =
        [];

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


    /*
      Logging feedback is allowed to refresh the provisional
      next week. Keep that deterministic and prevent every
      other AI endpoint from reaching the live service.
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

          await route.fulfill({
            status:
              200,

            contentType:
              "application/json",

            body:
              JSON.stringify({
                nextPlan:
                  buildSafeNextWeekPlan(),
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
                "Blocked by workout logging E2E.",
            }),
        });

      }
    );


    /*
      Real authentication.
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
    ).toBeVisible();


    /*
      The test fixture guarantees that TODAY has one known
      training session even if the suite happens to run on
      a Monday.
    */
    const sessionCard =
      page
        .locator(
          ".todayMultiSessionCard"
        )
        .filter({
          hasText:
            workoutFixture.title,
        });


    await expect(
      sessionCard
    ).toBeVisible();


    await expect(
      sessionCard.getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expectNoDocumentOverflow(
      page
    );


    await sessionCard
      .getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
      .click();


    /*
      Complete the real workout-feedback UI.
    */
    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "How did it go?",
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
            "Completed",
          exact:
            true,
        }
      )
      .click();


    await page
      .getByPlaceholder(
        "Minutes"
      )
      .fill(
        "44"
      );


    await page
      .locator(
        ".feedbackRpeSlider"
      )
      .fill(
        "6"
      );


    await page
      .getByRole(
        "button",
        {
          name:
            "Great",
          exact:
            true,
        }
      )
      .click();


    await page
      .getByPlaceholder(
        "Anything worth noting?"
      )
      .fill(
        "Persistence verified by E2E."
      );


    await page
      .getByRole(
        "button",
        {
          name:
            "Save workout",
          exact:
            true,
        }
      )
      .click();


    /*
      Immediate UI state must change from Log session
      to Completed.
    */
    await expect(
      sessionCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      sessionCard.getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
    ).toHaveCount(
      0
    );


    /*
      Do not trust only React state or localStorage.

      Wait until the exact feedback record is present in
      the real Supabase training_state row.
    */
    await expect
      .poll(
        async () => {

          const history =
            await readAuthenticatedWorkoutHistory(
              testUser!.id
            );


          const feedback =
            history.find(
              (entry) =>
                entry.sessionId ===
                workoutFixture!.sessionId
            );


          if (!feedback) {
            return null;
          }


          return {
            status:
              feedback.status,

            actualDurationMinutes:
              feedback.actualDurationMinutes,

            rpe:
              feedback.rpe,

            feeling:
              feedback.feeling,

            comment:
              feedback.comment,
          };

        },
        {
          timeout:
            15_000,
        }
      )
      .toEqual({
        status:
          "Completed",

        actualDurationMinutes:
          44,

        rpe:
          6,

        feeling:
          "Great",

        comment:
          "Persistence verified by E2E.",
      });


    /*
      Capture the original persisted feedback identity.

      Editing the workout later must UPDATE this record,
      not create a second feedback entry.
    */
    const initialHistory =
      await readAuthenticatedWorkoutHistory(
        testUser.id
      );


    const initialMatches =
      initialHistory.filter(
        (entry) =>
          entry.sessionId ===
          workoutFixture!.sessionId
      );


    expect(
      initialMatches
    ).toHaveLength(
      1
    );


    const initialFeedback =
      initialMatches[0];


    if (!initialFeedback) {
      throw new Error(
        "Initial persisted workout feedback was not found."
      );
    }


    const originalFeedbackId =
      initialFeedback.id;

    const originalCompletedAt =
      initialFeedback.completedAt;


    expect(
      originalFeedbackId
    ).toBeTruthy();


    expect(
      originalCompletedAt
    ).toBeTruthy();


    /*
      Remove only Basse application state.

      Supabase authentication storage is intentionally
      preserved. Reload must therefore reconstruct the
      workout from CLOUD state instead of tricoach-* cache.
    */
    await page.evaluate(
      () => {

        for (
          const key
          of Object.keys(
            localStorage
          )
        ) {

          if (
            key.startsWith(
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
    ).toBeVisible();


    const restoredSessionCard =
      page
        .locator(
          ".todayMultiSessionCard"
        )
        .filter({
          hasText:
            workoutFixture.title,
        });


    await expect(
      restoredSessionCard
    ).toBeVisible();


    await expect(
      restoredSessionCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      restoredSessionCard.getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
    ).toHaveCount(
      0
    );


    /*
      Completed state must also survive inside the detailed
      workout surface and expose Edit log instead of Log session.
    */
    await restoredSessionCard
      .getByRole(
        "button",
        {
          name:
            "View session →",
          exact:
            true,
        }
      )
      .click();


    await expect(
      page.locator(
        ".sessionCompletedLabel"
      )
    ).toContainText(
      "Completed"
    );


    const editLogButton =
      page.getByRole(
        "button",
        {
          name:
            "Edit log",
          exact:
            true,
        }
      );


    await expect(
      editLogButton
    ).toBeVisible();


    /*
      Open the real edit flow.

      Existing values must be restored into the form before
      the athlete changes anything.
    */
    await editLogButton.click();


    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "How did it go?",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      page.getByPlaceholder(
        "Minutes"
      )
    ).toHaveValue(
      "44"
    );


    await expect(
      page.locator(
        ".feedbackRpeSlider"
      )
    ).toHaveValue(
      "6"
    );


    await expect(
      page.getByPlaceholder(
        "Anything worth noting?"
      )
    ).toHaveValue(
      "Persistence verified by E2E."
    );


    /*
      Edit several independent fields so a false-positive
      persistence result is very unlikely.
    */
    await page
      .getByPlaceholder(
        "Minutes"
      )
      .fill(
        "51"
      );


    await page
      .locator(
        ".feedbackRpeSlider"
      )
      .fill(
        "8"
      );


    await page
      .getByRole(
        "button",
        {
          name:
            "Heavy",
          exact:
            true,
        }
      )
      .click();


    await page
      .getByPlaceholder(
        "Anything worth noting?"
      )
      .fill(
        "Edited persistence verified by E2E."
      );


    await page
      .getByRole(
        "button",
        {
          name:
            "Save workout",
          exact:
            true,
        }
      )
      .click();


    /*
      Supabase must contain exactly ONE feedback record for
      this session.

      Editing must preserve record identity and original
      completion timestamp while replacing mutable values.
    */
    await expect
      .poll(
        async () => {

          const history =
            await readAuthenticatedWorkoutHistory(
              testUser!.id
            );


          const matches =
            history.filter(
              (entry) =>
                entry.sessionId ===
                workoutFixture!.sessionId
            );


          const feedback =
            matches[0];


          return {
            count:
              matches.length,

            id:
              feedback?.id ??
              null,

            completedAt:
              feedback?.completedAt ??
              null,

            status:
              feedback?.status ??
              null,

            actualDurationMinutes:
              feedback?.actualDurationMinutes ??
              null,

            rpe:
              feedback?.rpe ??
              null,

            feeling:
              feedback?.feeling ??
              null,

            comment:
              feedback?.comment ??
              null,
          };

        },
        {
          timeout:
            15_000,
        }
      )
      .toEqual({
        count:
          1,

        id:
          originalFeedbackId,

        completedAt:
          originalCompletedAt,

        status:
          "Completed",

        actualDurationMinutes:
          51,

        rpe:
          8,

        feeling:
          "Heavy",

        comment:
          "Edited persistence verified by E2E.",
      });


    /*
      Prove the EDITED values also survive a cold Basse
      application-state reload from cloud.
    */
    await page.evaluate(
      () => {

        for (
          const key
          of Object.keys(
            localStorage
          )
        ) {

          if (
            key.startsWith(
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
    ).toBeVisible();


    const editedRestoredSessionCard =
      page
        .locator(
          ".todayMultiSessionCard"
        )
        .filter({
          hasText:
            workoutFixture.title,
        });


    await expect(
      editedRestoredSessionCard
    ).toBeVisible();


    await expect(
      editedRestoredSessionCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await editedRestoredSessionCard
      .getByRole(
        "button",
        {
          name:
            "View session →",
          exact:
            true,
        }
      )
      .click();


    const completedRecord =
      page.locator(
        ".completedWorkoutRecord"
      );


    await expect(
      completedRecord
    ).toBeVisible();


    await expect(
      completedRecord.getByText(
        "51 min",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      completedRecord.getByText(
        "8/10",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      completedRecord.getByText(
        "Heavy",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      completedRecord.getByText(
        "Edited persistence verified by E2E.",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      page.getByRole(
        "button",
        {
          name:
            "Edit log",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expectNoDocumentOverflow(
      page
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



test(
  "same-day workout logs remain isolated through cloud reload",
  async ({
    page,
  }) => {

    if (
      !testUser ||
      !workoutFixture
    ) {
      throw new Error(
        "Workout logging E2E fixture was not created."
      );
    }


    const secondaryFixture =
      await addAuthenticatedWorkoutLoggingSecondarySession(
        testUser.id
      );


    expect(
      secondaryFixture.sessionId
    ).not.toBe(
      workoutFixture.sessionId
    );


    const unexpectedAiRequests:
      string[] =
        [];

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

          await route.fulfill({
            status:
              200,

            contentType:
              "application/json",

            body:
              JSON.stringify({
                nextPlan:
                  buildSafeNextWeekPlan(),
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
                "Blocked by same-day workout logging E2E.",
            }),
        });

      }
    );


    /*
      Real authentication.
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
    ).toBeVisible();


    const primaryCard =
      page
        .locator(
          ".todayMultiSessionCard"
        )
        .filter({
          hasText:
            workoutFixture.title,
        });


    const secondaryCard =
      page
        .locator(
          ".todayMultiSessionCard"
        )
        .filter({
          hasText:
            secondaryFixture.title,
        });


    await expect(
      primaryCard
    ).toBeVisible();


    await expect(
      secondaryCard
    ).toBeVisible();


    await expect(
      primaryCard.getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      secondaryCard.getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
    ).toBeVisible();


    /*
      Log ONLY the primary workout first.
    */
    await primaryCard
      .getByRole(
        "button",
        {
          name:
            "Log session",
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
            "Completed",
          exact:
            true,
        }
      )
      .click();


    await page
      .getByPlaceholder(
        "Minutes"
      )
      .fill(
        "47"
      );


    await page
      .locator(
        ".feedbackRpeSlider"
      )
      .fill(
        "7"
      );


    await page
      .getByRole(
        "button",
        {
          name:
            "Great",
          exact:
            true,
        }
      )
      .click();


    await page
      .getByPlaceholder(
        "Anything worth noting?"
      )
      .fill(
        "Primary same-day session."
      );


    await page
      .getByRole(
        "button",
        {
          name:
            "Save workout",
          exact:
            true,
        }
      )
      .click();


    /*
      Logging A must not change B.
    */
    await expect(
      primaryCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      secondaryCard.getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      secondaryCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toHaveCount(
      0
    );


    /*
      Cloud must contain exactly one record for A
      and zero for B.
    */
    await expect
      .poll(
        async () => {

          const history =
            await readAuthenticatedWorkoutHistory(
              testUser!.id
            );


          const primaryMatches =
            history.filter(
              (entry) =>
                entry.sessionId ===
                workoutFixture!.sessionId
            );


          const secondaryMatches =
            history.filter(
              (entry) =>
                entry.sessionId ===
                secondaryFixture.sessionId
            );


          return {
            primaryCount:
              primaryMatches.length,

            secondaryCount:
              secondaryMatches.length,

            primaryDuration:
              primaryMatches[0]
                ?.actualDurationMinutes ??
              null,

            primaryComment:
              primaryMatches[0]
                ?.comment ??
              null,
          };

        },
        {
          timeout:
            15_000,
        }
      )
      .toEqual({
        primaryCount:
          1,

        secondaryCount:
          0,

        primaryDuration:
          47,

        primaryComment:
          "Primary same-day session.",
      });


    /*
      Cold reload from cloud.

      A must remain completed while B must remain unlogged.
    */
    await page.evaluate(
      () => {

        for (
          const key
          of Object.keys(
            localStorage
          )
        ) {

          if (
            key.startsWith(
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
    ).toBeVisible();


    const restoredPrimaryCard =
      page
        .locator(
          ".todayMultiSessionCard"
        )
        .filter({
          hasText:
            workoutFixture.title,
        });


    const restoredSecondaryCard =
      page
        .locator(
          ".todayMultiSessionCard"
        )
        .filter({
          hasText:
            secondaryFixture.title,
        });


    await expect(
      restoredPrimaryCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      restoredSecondaryCard.getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
    ).toBeVisible();


    /*
      Now log B.

      A must remain unchanged.
    */
    await restoredSecondaryCard
      .getByRole(
        "button",
        {
          name:
            "Log session",
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
            "Completed",
          exact:
            true,
        }
      )
      .click();


    await page
      .getByPlaceholder(
        "Minutes"
      )
      .fill(
        "39"
      );


    await page
      .locator(
        ".feedbackRpeSlider"
      )
      .fill(
        "5"
      );


    await page
      .getByRole(
        "button",
        {
          name:
            "Normal",
          exact:
            true,
        }
      )
      .click();


    await page
      .getByPlaceholder(
        "Anything worth noting?"
      )
      .fill(
        "Secondary same-day session."
      );


    await page
      .getByRole(
        "button",
        {
          name:
            "Save workout",
          exact:
            true,
        }
      )
      .click();


    await expect(
      restoredPrimaryCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      restoredSecondaryCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    /*
      There must now be exactly one record per sessionId.
      Primary data must be unchanged by logging secondary.
    */
    await expect
      .poll(
        async () => {

          const history =
            await readAuthenticatedWorkoutHistory(
              testUser!.id
            );


          const primaryMatches =
            history.filter(
              (entry) =>
                entry.sessionId ===
                workoutFixture!.sessionId
            );


          const secondaryMatches =
            history.filter(
              (entry) =>
                entry.sessionId ===
                secondaryFixture.sessionId
            );


          const primary =
            primaryMatches[0];

          const secondary =
            secondaryMatches[0];


          return {
            primaryCount:
              primaryMatches.length,

            secondaryCount:
              secondaryMatches.length,

            primaryId:
              primary?.id ??
              null,

            secondaryId:
              secondary?.id ??
              null,

            primaryDuration:
              primary?.actualDurationMinutes ??
              null,

            primaryRpe:
              primary?.rpe ??
              null,

            primaryComment:
              primary?.comment ??
              null,

            secondaryDuration:
              secondary?.actualDurationMinutes ??
              null,

            secondaryRpe:
              secondary?.rpe ??
              null,

            secondaryComment:
              secondary?.comment ??
              null,
          };

        },
        {
          timeout:
            15_000,
        }
      )
      .toMatchObject({
        primaryCount:
          1,

        secondaryCount:
          1,

        primaryDuration:
          47,

        primaryRpe:
          7,

        primaryComment:
          "Primary same-day session.",

        secondaryDuration:
          39,

        secondaryRpe:
          5,

        secondaryComment:
          "Secondary same-day session.",
      });


    const finalHistory =
      await readAuthenticatedWorkoutHistory(
        testUser.id
      );


    const finalPrimary =
      finalHistory.find(
        (entry) =>
          entry.sessionId ===
          workoutFixture!.sessionId
      );


    const finalSecondary =
      finalHistory.find(
        (entry) =>
          entry.sessionId ===
          secondaryFixture.sessionId
      );


    expect(
      finalPrimary?.id
    ).toBeTruthy();


    expect(
      finalSecondary?.id
    ).toBeTruthy();


    expect(
      finalPrimary?.id
    ).not.toBe(
      finalSecondary?.id
    );


    /*
      Second cold reload proves both identities and statuses
      reconstruct correctly from persisted cloud state.
    */
    await page.evaluate(
      () => {

        for (
          const key
          of Object.keys(
            localStorage
          )
        ) {

          if (
            key.startsWith(
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
    ).toBeVisible();


    const finalPrimaryCard =
      page
        .locator(
          ".todayMultiSessionCard"
        )
        .filter({
          hasText:
            workoutFixture.title,
        });


    const finalSecondaryCard =
      page
        .locator(
          ".todayMultiSessionCard"
        )
        .filter({
          hasText:
            secondaryFixture.title,
        });


    await expect(
      finalPrimaryCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      finalSecondaryCard.getByText(
        "Completed",
        {
          exact:
            true,
        }
      )
    ).toBeVisible();


    await expect(
      finalPrimaryCard.getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
    ).toHaveCount(
      0
    );


    await expect(
      finalSecondaryCard.getByRole(
        "button",
        {
          name:
            "Log session",
          exact:
            true,
        }
      )
    ).toHaveCount(
      0
    );


    await expectNoDocumentOverflow(
      page
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
