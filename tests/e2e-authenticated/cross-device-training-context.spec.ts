import {
  expect,
  test,
} from "@playwright/test";

import {
  createAuthenticatedTestUser,
  deleteAuthenticatedTestUser,
  readAuthenticatedTrainingContext,
  seedAuthenticatedCrossDeviceTrainingContext,
  type AuthenticatedCrossDeviceTrainingContextFixture,
  type AuthenticatedTestUser,
} from "./support/authenticated-test-user";


let testUser:
  AuthenticatedTestUser |
  null =
    null;

let fixture:
  AuthenticatedCrossDeviceTrainingContextFixture |
  null =
    null;


test.beforeEach(
  async (
    {},
    testInfo
  ) => {

    testUser =
      await createAuthenticatedTestUser(
        `cross-device-${testInfo.project.name}`
      );

    fixture =
      await seedAuthenticatedCrossDeviceTrainingContext(
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
  "Next Week and Calendar context restore from cloud after local cache loss",
  async ({
    page,
  }) => {

    if (
      !testUser ||
      !fixture
    ) {
      throw new Error(
        "Cross-device E2E fixture was not created."
      );
    }


    const browserProblems:
      string[] =
        [];

    const unexpectedAiRequests:
      string[] =
        [];


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
      A correctly restored cloud preview must mean that opening
      an established athlete session does not regenerate Next Week.

      Block every AI endpoint so this test can never consume a
      live model request.
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
                "Blocked by cross-device E2E.",
            }),
        });
      }
    );


    /*
      Device A: real authentication against the seeded cloud row.
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


    /*
      Cloud hydration must materialize the exact planning context
      into the normal local cache.
    */
    await expect
      .poll(
        async () =>
          page.evaluate(
            () => {

              const raw =
                localStorage.getItem(
                  "tricoach-next-week-preview"
                );

              if (!raw) {
                return null;
              }

              try {
                const parsed =
                  JSON.parse(
                    raw
                  );

                return {
                  weekStart:
                    parsed?.weekStart ??
                    null,

                  markerTitle:
                    parsed?.days?.[1]
                      ?.title ??
                    null,
                };
              } catch {
                return null;
              }
            }
          )
      )
      .toEqual({
        weekStart:
          fixture.nextWeekPreview
            .weekStart,

        markerTitle:
          "Cross-device cloud run",
      });


    await expect
      .poll(
        async () =>
          page.evaluate(
            () => {

              const raw =
                localStorage.getItem(
                  "tricoach-training-availability"
                );

              if (!raw) {
                return null;
              }

              try {
                return JSON.parse(
                  raw
                );
              } catch {
                return null;
              }
            }
          )
      )
      .toEqual(
        fixture.trainingAvailability
      );


    /*
      Verify the source of truth itself before simulating a
      different device / reinstall.
    */
    let cloudContext =
      await readAuthenticatedTrainingContext(
        testUser.id
      );

    expect(
      cloudContext.nextWeekPreview
        ?.weekStart
    ).toBe(
      fixture.nextWeekPreview
        .weekStart
    );

    expect(
      cloudContext.nextWeekPreview
        ?.days?.[1]
        ?.title
    ).toBe(
      "Cross-device cloud run"
    );

    expect(
      cloudContext.trainingAvailability
    ).toEqual(
      fixture.trainingAvailability
    );


    /*
      Hydration also starts the normal persistence effects.

      WebKit reports an aborted fetch as "TypeError: Load failed"
      if we deliberately reload while one of those Supabase writes
      is still in flight. Wait for the page to become network-idle
      before simulating loss of the local device cache.
    */
    await page.waitForLoadState(
      "networkidle"
    );


    /*
      Device B / reinstall simulation:

      Remove every Basse-owned local cache entry while preserving
      the Supabase authentication session, then reload.

      Nothing under tricoach-* may be required for recovery.
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


    expect(
      await page.evaluate(
        () =>
          localStorage.getItem(
            "tricoach-next-week-preview"
          )
      )
    ).toBeNull();

    expect(
      await page.evaluate(
        () =>
          localStorage.getItem(
            "tricoach-training-availability"
          )
      )
    ).toBeNull();


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
      The fresh device must rebuild both values from Supabase.
    */
    await expect
      .poll(
        async () =>
          page.evaluate(
            () => {

              const raw =
                localStorage.getItem(
                  "tricoach-next-week-preview"
                );

              if (!raw) {
                return null;
              }

              try {
                const parsed =
                  JSON.parse(
                    raw
                  );

                return {
                  weekStart:
                    parsed?.weekStart ??
                    null,

                  markerTitle:
                    parsed?.days?.[1]
                      ?.title ??
                    null,
                };
              } catch {
                return null;
              }
            }
          )
      )
      .toEqual({
        weekStart:
          fixture.nextWeekPreview
            .weekStart,

        markerTitle:
          "Cross-device cloud run",
      });


    await expect
      .poll(
        async () =>
          page.evaluate(
            () => {

              const raw =
                localStorage.getItem(
                  "tricoach-training-availability"
                );

              if (!raw) {
                return null;
              }

              try {
                return JSON.parse(
                  raw
                );
              } catch {
                return null;
              }
            }
          )
      )
      .toEqual(
        fixture.trainingAvailability
      );


    /*
      Restore must not race with persistence and overwrite the
      cloud row with empty defaults.
    */
    await expect
      .poll(
        async () => {

          cloudContext =
            await readAuthenticatedTrainingContext(
              testUser!.id
            );

          return {
            weekStart:
              cloudContext
                .nextWeekPreview
                ?.weekStart ??
              null,

            markerTitle:
              cloudContext
                .nextWeekPreview
                ?.days?.[1]
                ?.title ??
              null,

            availability:
              cloudContext
                .trainingAvailability,
          };
        }
      )
      .toEqual({
        weekStart:
          fixture.nextWeekPreview
            .weekStart,

        markerTitle:
          "Cross-device cloud run",

        availability:
          fixture.trainingAvailability,
      });


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
