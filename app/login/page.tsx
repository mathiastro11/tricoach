"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";


export default function LoginPage() {

  const router =
    useRouter();

  const supabase =
    createClient();


  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");


  async function handleSubmit() {

    setLoading(true);
    setMessage("");


    try {

      const { error } =
        await supabase.auth
          .signInWithPassword({
            email,
            password,
          });


      if (error) {
        throw error;
      }


      router.push("/");
      router.refresh();

    } catch (error) {

      if (error instanceof Error) {
        setMessage(
          error.message
        );
      } else {
        setMessage(
          "Something went wrong."
        );
      }

    } finally {

      setLoading(false);

    }
  }


  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        padding:
          "max(24px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom))",
        background:
          `
            linear-gradient(
              180deg,
              rgba(5,14,10,.52),
              rgba(5,14,10,.82)
            ),
            linear-gradient(
              90deg,
              rgba(5,14,10,.78),
              rgba(5,14,10,.30),
              rgba(5,14,10,.76)
            ),
            url("/races/backgrounds/norseman.webp")
            center / cover
            no-repeat
          `,
        color: "#d5ded8",
      }}
    >

      <button
        type="button"
        onClick={() =>
          router.push("/")
        }
        style={{
          position: "absolute",
          top:
            "max(22px, env(safe-area-inset-top))",
          left: "22px",
          border: 0,
          background:
            "transparent",
          color:
            "#9aaba1",
          fontSize:
            "13px",
          fontWeight:
            700,
          cursor:
            "pointer",
        }}
      >
        ← Back
      </button>


      <section
        style={{
          width: "100%",
          maxWidth: "430px",
          padding:
            "34px 30px 30px",
          border:
            "1px solid rgba(255,255,255,.09)",
          borderRadius:
            "26px",
          background:
            "linear-gradient(155deg, rgba(27,44,35,.84), rgba(10,23,17,.88))",
          boxShadow:
            "0 34px 90px rgba(0,0,0,.38)",
          backdropFilter:
            "blur(20px)",
          WebkitBackdropFilter:
            "blur(20px)",
        }}
      >

        <div
          style={{
            marginBottom:
              "42px",
            color:
              "#a7b9ae",
            fontSize:
              "13px",
            fontWeight:
              850,
            letterSpacing:
              ".12em",
          }}
        >
          BASSE
        </div>


        <span
          style={{
            display:
              "block",
            marginBottom:
              "10px",
            color:
              "#8aaa98",
            fontSize:
              "11px",
            fontWeight:
              800,
            letterSpacing:
              ".14em",
          }}
        >
          WELCOME BACK
        </span>


        <h1
          style={{
            maxWidth:
              "360px",
            margin:
              "0 0 14px",
            color:
              "#d7e0da",
            fontSize:
              "clamp(38px, 7vw, 52px)",
            lineHeight:
              ".96",
            letterSpacing:
              "-.055em",
            fontWeight:
              620,
          }}
        >
          Your coach
          <br />
          is ready.
        </h1>


        <p
          style={{
            margin:
              "0 0 30px",
            color:
              "#87998f",
            fontSize:
              "14px",
            lineHeight:
              1.55,
          }}
        >
          Log in to continue with
          your training plan.
        </p>


        <label
          style={{
            display:
              "grid",
            gap:
              "7px",
            marginBottom:
              "14px",
          }}
        >

          <span
            style={{
              color:
                "#7f9387",
              fontSize:
                "10px",
              fontWeight:
                800,
              letterSpacing:
                ".11em",
            }}
          >
            EMAIL
          </span>

          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(
                e.target.value
              );

              setMessage("");
            }}
            style={{
              width:
                "100%",
              minHeight:
                "52px",
              boxSizing:
                "border-box",
              padding:
                "0 15px",
              outline:
                "none",
              border:
                "1px solid rgba(255,255,255,.075)",
              borderRadius:
                "12px",
              background:
                "rgba(6,17,12,.28)",
              color:
                "#d3ddd7",
              fontSize:
                "15px",
            }}
          />

        </label>


        <label
          style={{
            display:
              "grid",
            gap:
              "7px",
            marginBottom:
              "19px",
          }}
        >

          <span
            style={{
              color:
                "#7f9387",
              fontSize:
                "10px",
              fontWeight:
                800,
              letterSpacing:
                ".11em",
            }}
          >
            PASSWORD
          </span>

          <input
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => {
              setPassword(
                e.target.value
              );

              setMessage("");
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                email &&
                password.length >= 6
              ) {
                void handleSubmit();
              }
            }}
            style={{
              width:
                "100%",
              minHeight:
                "52px",
              boxSizing:
                "border-box",
              padding:
                "0 15px",
              outline:
                "none",
              border:
                "1px solid rgba(255,255,255,.075)",
              borderRadius:
                "12px",
              background:
                "rgba(6,17,12,.28)",
              color:
                "#d3ddd7",
              fontSize:
                "15px",
            }}
          />

        </label>


        <button
          type="button"
          onClick={() =>
            void handleSubmit()
          }
          disabled={
            loading ||
            !email ||
            password.length < 6
          }
          style={{
            width:
              "100%",
            minHeight:
              "52px",
            border:
              0,
            borderRadius:
              "12px",
            background:
              loading ||
              !email ||
              password.length < 6
                ? "rgba(154,190,168,.35)"
                : "#a6cbb3",
            color:
              "#102019",
            fontSize:
              "14px",
            fontWeight:
              800,
            cursor:
              loading ||
              !email ||
              password.length < 6
                ? "default"
                : "pointer",
          }}
        >
          {loading
            ? "Logging in..."
            : "Log in →"}
        </button>


        {message && (
          <div
            role="status"
            style={{
              marginTop:
                "15px",
              padding:
                "11px 12px",
              border:
                "1px solid rgba(255,255,255,.065)",
              borderRadius:
                "10px",
              background:
                "rgba(7,17,12,.22)",
              color:
                "#aab9b0",
              fontSize:
                "13px",
              lineHeight:
                1.45,
            }}
          >
            {message}
          </div>
        )}


        <div
          style={{
            marginTop:
              "25px",
            paddingTop:
              "20px",
            borderTop:
              "1px solid rgba(255,255,255,.055)",
            textAlign:
              "center",
          }}
        >

          <span
            style={{
              color:
                "#72867a",
              fontSize:
                "12px",
            }}
          >
            New to Basse?{" "}
          </span>

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            style={{
              padding:
                0,
              border:
                0,
              background:
                "transparent",
              color:
                "#9db9a8",
              fontSize:
                "12px",
              fontWeight:
                750,
              cursor:
                "pointer",
            }}
          >
            Get started
          </button>

        </div>


        <button
          type="button"
          onClick={() =>
            router.push(
              "/account-deletion"
            )
          }
          style={{
            display:
              "block",
            margin:
              "18px auto 0",
            padding:
              0,
            border:
              0,
            background:
              "transparent",
            color:
              "#6f8477",
            fontSize:
              "11px",
            cursor:
              "pointer",
          }}
        >
          Account deletion
        </button>

      </section>

    </main>
  );
}
