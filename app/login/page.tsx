"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setMessage(
          "Account created. Check your email if confirmation is required."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        router.push("/");
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f3f1eb",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "white",
          border: "1px solid #d8d7cf",
          borderRadius: "24px",
          padding: "32px",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            marginBottom: "40px",
          }}
        >
          ▲ TRI//COACH
        </div>

        <div
          style={{
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.14em",
            marginBottom: "10px",
          }}
        >
          {mode === "login" ? "WELCOME BACK" : "JOIN THE BETA"}
        </div>

        <h1
          style={{
            fontSize: "44px",
            lineHeight: 0.95,
            letterSpacing: "-0.05em",
            marginBottom: "28px",
          }}
        >
          {mode === "login"
            ? "Your coach is ready."
            : "Build your athlete profile."}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "16px",
            border: "1px solid #d8d7cf",
            borderRadius: "12px",
            marginBottom: "12px",
            fontSize: "16px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          style={{
            width: "100%",
            padding: "16px",
            border: "1px solid #d8d7cf",
            borderRadius: "12px",
            marginBottom: "16px",
            fontSize: "16px",
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !email || password.length < 6}
          style={{
            width: "100%",
            background: "#171914",
            color: "white",
            border: 0,
            borderRadius: "12px",
            padding: "16px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {loading
            ? "Working..."
            : mode === "login"
            ? "Log in →"
            : "Create account →"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "16px",
              color: "#6f7268",
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        )}

        <button
          onClick={() =>
            setMode(mode === "login" ? "signup" : "login")
          }
          style={{
            width: "100%",
            marginTop: "20px",
            background: "transparent",
            border: 0,
            color: "#6f7268",
            cursor: "pointer",
          }}
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  );
}
