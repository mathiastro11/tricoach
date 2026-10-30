/// <reference types="vite/client" />

import { createRoot } from "react-dom/client";
import { configureNativeRuntime } from "../lib/client-runtime";
import "../app/globals.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Basse native root element is missing.");
}

const root = createRoot(container);

async function startNativeApp() {
  configureNativeRuntime({
    apiBaseUrl: import.meta.env.VITE_BASSE_API_BASE_URL ?? "",
    supabaseUrl: import.meta.env.VITE_BASSE_SUPABASE_URL ?? "",
    supabaseAnonKey: import.meta.env.VITE_BASSE_SUPABASE_ANON_KEY ?? "",
  });

  const { default: BasseApp } = await import("../app/page");

  root.render(<BasseApp />);
}

void startNativeApp().catch((error) => {
  console.error("Basse native startup failed:", error);

  root.render(
    <main role="alert" style={{ padding: "2rem" }}>
      <h1>Basse could not start</h1>
      <p>Please restart the application or contact support.</p>
    </main>
  );
});
