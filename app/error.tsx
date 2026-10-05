"use client";

import Link from "next/link";

import {
  useEffect,
} from "react";

import RouteStateCard from "@/components/RouteStateCard";


type RouteErrorProps = {
  error:
    Error & {
      digest?:
        string;
    };

  retry:
    () => void;
};


export default function RouteError({
  error,
  retry,
}: RouteErrorProps) {

  useEffect(
    () => {

      console.error(
        "Unhandled Basse route error.",
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
    <main className="systemStatePage">

      <RouteStateCard
        signal="!"
        announce="alert"
        eyebrow="TEMPORARY DETOUR"
        title="Something interrupted this route."
        description="Your saved training data has not been changed. Try loading this view again, or return to the start."
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
          Return to Basse
        </Link>

      </RouteStateCard>

    </main>
  );
}
