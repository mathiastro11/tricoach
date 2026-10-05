"use client";

import Link from "next/link";

import {
  useEffect,
} from "react";

import RouteStateCard from "@/components/RouteStateCard";

import "./globals.css";


type GlobalErrorProps = {
  error:
    Error & {
      digest?:
        string;
    };

  retry:
    () => void;
};


export default function GlobalError({
  error,
  retry,
}: GlobalErrorProps) {

  useEffect(
    () => {

      console.error(
        "Unhandled Basse root error.",
        {
          digest:
            error.digest,

          error,
        }
      );

    },
    [
      error,
    ]
  );


  return (
    <html lang="en">

      <body className="systemStateGlobalBody">

        <title>
          Unexpected error · Basse
        </title>

        <main className="systemStatePage">

          <RouteStateCard
            signal="!"
            announce="alert"
            eyebrow="RECOVERY MODE"
            title="Basse needs a fresh start."
            description="The app hit an unexpected problem before it could finish loading. Try again, or reload Basse from the beginning."
          >

            <button
              type="button"
              className="systemStateActionPrimary"
              onClick={() =>
                retry()
              }
            >
              Try again
            </button>

            <Link
              href="/"
              className="systemStateActionSecondary"
            >
              Reload Basse
            </Link>

          </RouteStateCard>

        </main>

      </body>

    </html>
  );
}
