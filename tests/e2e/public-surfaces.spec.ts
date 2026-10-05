import AxeBuilder from "@axe-core/playwright";

import {
  expect,
  test,
} from "@playwright/test";


const publicSurfaces = [
  {
    name:
      "landing",

    path:
      "/",
  },

  {
    name:
      "login",

    path:
      "/login",
  },

  {
    name:
      "account deletion",

    path:
      "/account-deletion",
  },
] as const;


for (
  const surface of
  publicSurfaces
) {

  test(
    `${surface.name} is usable, responsive and accessible`,
    async ({
      page,
    }) => {

      const consoleProblems:
        string[] = [];

      const pageErrors:
        string[] = [];


      page.on(
        "console",
        (message) => {

          if (
            message.type() ===
              "error" ||
            message.type() ===
              "warning"
          ) {
            consoleProblems.push(
              [
                message.type(),
                message.text(),
              ].join(
                ": "
              )
            );
          }

        }
      );


      page.on(
        "pageerror",
        (error) => {

          pageErrors.push(
            error.message
          );

        }
      );


      await page.addInitScript(
        () => {

          window.localStorage
            .clear();

          window.sessionStorage
            .clear();

        }
      );


      const response =
        await page.goto(
          surface.path,
          {
            waitUntil:
              "networkidle",
          }
        );


      expect(
        response,
        `${surface.path} did not return a document response`
      ).not.toBeNull();

      expect(
        response?.ok(),
        `${surface.path} returned HTTP ${response?.status()}`
      ).toBeTruthy();


      await page.evaluate(
        async () => {

          await document.fonts
            .ready;

        }
      );


      await expect(
        page
          .locator(
            "main"
          )
          .first()
      ).toBeVisible();

      await expect(
        page
          .locator(
            "h1"
          )
          .first()
      ).toBeVisible();


      if (
        surface.path ===
        "/"
      ) {

        await expect(
          page.getByRole(
            "link",
            {
              name:
                "Log in",
            }
          )
        ).toBeVisible();

      }


      if (
        surface.path ===
        "/login"
      ) {

        await expect(
          page.getByRole(
            "heading",
            {
              name:
                /Your coach is ready/i,
            }
          )
        ).toBeVisible();

        await expect(
          page.getByLabel(
            "EMAIL"
          )
        ).toBeVisible();

        await expect(
          page.getByLabel(
            "PASSWORD"
          )
        ).toBeVisible();

        await expect(
          page.getByRole(
            "button",
            {
              name:
                /Log in/i,
            }
          )
        ).toBeDisabled();

      }


      if (
        surface.path ===
        "/account-deletion"
      ) {

        await expect(
          page.getByRole(
            "heading",
            {
              name:
                /Delete your Basse account/i,
            }
          )
        ).toBeVisible();

        await expect(
          page.getByRole(
            "link",
            {
              name:
                /Sign in to delete account/i,
            }
          )
        ).toBeVisible();

      }


      const dimensions =
        await page.evaluate(
          () => ({
            viewport:
              document
                .documentElement
                .clientWidth,

            document:
              document
                .documentElement
                .scrollWidth,

            body:
              document
                .body
                .scrollWidth,
          })
        );

      const widestContent =
        Math.max(
          dimensions.document,
          dimensions.body
        );


      expect(
        widestContent,
        [
          "Horizontal overflow detected.",
          `Viewport: ${dimensions.viewport}px.`,
          `Document: ${dimensions.document}px.`,
          `Body: ${dimensions.body}px.`,
        ].join(
          " "
        )
      ).toBeLessThanOrEqual(
        dimensions.viewport + 1
      );


      const accessibility =
        await new AxeBuilder({
          page,
        })
          .withTags([
            "wcag2a",
            "wcag2aa",
            "wcag21a",
            "wcag21aa",
            "wcag22a",
            "wcag22aa",
          ])
          .analyze();

      const accessibilityReport =
        accessibility
          .violations
          .map(
            (violation) => {

              const targets =
                violation.nodes
                  .slice(
                    0,
                    4
                  )
                  .map(
                    (node) =>
                      JSON.stringify(
                        node.target
                      )
                  )
                  .join(
                    ", "
                  );

              return [
                violation.id,
                `impact=${violation.impact ?? "unknown"}`,
                violation.help,
                `targets=${targets}`,
              ].join(
                " | "
              );

            }
          )
          .join(
            "\\n"
          );


      expect(
        accessibility
          .violations
          .length,
        accessibilityReport ||
          "No accessibility violations"
      ).toBe(
        0
      );


      expect(
        pageErrors,
        `Uncaught browser errors: ${pageErrors.join(" | ")}`
      ).toEqual(
        []
      );

      expect(
        consoleProblems,
        `Browser console problems: ${consoleProblems.join(" | ")}`
      ).toEqual(
        []
      );

    }
  );

}
