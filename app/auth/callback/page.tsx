"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase";


export default function AuthCallbackPage() {

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");


  useEffect(() => {

    let active =
      true;


    async function completeAuth() {

      try {

        const url =
          new URL(
            window.location.href
          );

        const code =
          url.searchParams.get(
            "code"
          );

        const flow =
          url.searchParams.get(
            "flow"
          );


        if (!code) {
          throw new Error(
            "The confirmation link is missing its authentication code."
          );
        }


        const supabase =
          createClient();


        const {
          error,
        } =
          await supabase.auth
            .exchangeCodeForSession(
              code
            );


        if (error) {
          throw error;
        }


        if (!active) {
          return;
        }


        if (
          flow ===
          "onboarding"
        ) {

          window.location.replace(
            "/?completeOnboarding=1"
          );

          return;
        }


        window.location.replace(
          "/"
        );

      } catch (error) {

        console.error(
          "Could not complete email confirmation:",
          error
        );


        if (!active) {
          return;
        }


        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Basse could not complete email confirmation."
        );

      }

    }


    void completeAuth();


    return () => {
      active =
        false;
    };

  }, []);


  return (
    <main className="tricoachAuthCallback">

      <div className="tricoachAuthCallbackGlass">

        <span>
          BASSE
        </span>

        {errorMessage ? (
          <>
            <h1>
              Confirmation failed
            </h1>

            <p>
              {errorMessage}
            </p>

            <a href="/login">
              Go to log in
            </a>
          </>
        ) : (
          <>
            <div
              className="tricoachAuthCallbackPulse"
              aria-hidden="true"
            />

            <h1>
              Account confirmed
            </h1>

            <p>
              Preparing your training plan…
            </p>
          </>
        )}

      </div>

    </main>
  );
}
