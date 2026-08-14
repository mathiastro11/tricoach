from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

shutil.copy(
    page,
    f"app/page.v09-backup-{stamp}.tsx"
)

text = page.read_text()


def replace_once(old, new, label):
    global text

    if old not in text:
        raise SystemExit(
            f"STOPP: Fant ikke delen for {label}"
        )

    text = text.replace(old, new, 1)


# =========================================================
# 1. SETTINGS STATE
# =========================================================

replace_once(
'''  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [dbReady, setDbReady] = useState(false);
''',

'''  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [dbReady, setDbReady] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
''',

"settings state"
)


# =========================================================
# 2. SAVE USER EMAIL
# =========================================================

replace_once(
'''        if (user) {
          setUserId(user.id);
''',

'''        if (user) {
          setUserId(user.id);
          setUserEmail(user.email ?? "");
''',

"user email"
)


# =========================================================
# 3. SETTINGS FUNCTIONS
# =========================================================

marker = '''  function toggleAvailableDay(day: string) {
'''

functions = '''  async function logOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      localStorage.removeItem("tricoach-athlete");
      localStorage.removeItem("tricoach-plan");
      localStorage.removeItem("tricoach-workout-history");
      localStorage.removeItem("tricoach-plan-history");
      localStorage.removeItem("tricoach-weekly-review");

      window.location.href = "/login";
    } catch (error) {
      console.error("Could not log out:", error);
      alert("Could not log out. Please try again.");
    }
  }

  function editAthleteProfile() {
    setSettingsOpen(false);
    setStep(0);
    setScreen("onboarding");
  }

  async function resetTrainingPlan() {
    const confirmed = window.confirm(
      "Reset your training plan? Your account and athlete profile will be kept, but your active plan, workout feedback and weekly review will be cleared."
    );

    if (!confirmed) return;

    setIsResetting(true);

    try {
      if (userId) {
        const { error } = await supabase
          .from("training_state")
          .delete()
          .eq("user_id", userId);

        if (error) {
          throw error;
        }
      }

      localStorage.removeItem("tricoach-plan");
      localStorage.removeItem("tricoach-workout-history");
      localStorage.removeItem("tricoach-plan-history");
      localStorage.removeItem("tricoach-weekly-review");

      setTrainingPlan(null);
      setWorkoutHistory([]);
      setPlanHistory([]);
      setWeeklyReview(null);

      setSettingsOpen(false);
      setStep(0);
      setScreen("onboarding");

    } catch (error) {
      console.error(
        "Could not reset training plan:",
        error
      );

      alert(
        "Could not reset the training plan. Please try again."
      );
    } finally {
      setIsResetting(false);
    }
  }

'''

if marker not in text:
    raise SystemExit(
        "STOPP: Fant ikke toggleAvailableDay"
    )

text = text.replace(
    marker,
    functions + marker,
    1
)


# =========================================================
# 4. ADD SETTINGS BUTTON TO DASHBOARD HEADER
# =========================================================

# We insert a floating settings button directly after <main>
dashboard_marker = '''    <main className="dashboard">
'''

settings_button = '''    <main className="dashboard">
      {screen === "dashboard" && (
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          style={{
            position: "fixed",
            top: "22px",
            right: "22px",
            zIndex: 40,
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "1px solid #d8d7cf",
            background: "#ffffff",
            cursor: "pointer",
            fontSize: "20px",
            boxShadow: "0 8px 24px rgba(0,0,0,.08)",
          }}
        >
          ⚙
        </button>
      )}
'''

if dashboard_marker not in text:
    raise SystemExit(
        "STOPP: Fant ikke dashboard"
    )

text = text.replace(
    dashboard_marker,
    settings_button,
    1
)


# =========================================================
# 5. SETTINGS MODAL
# =========================================================

# Insert just before final </main>
marker = '''    </main>
  );
}'''

settings_modal = '''      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 22, 18, .45)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
        >
          <section
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "#f8f7f2",
              borderRadius: "24px",
              padding: "28px",
              boxShadow:
                "0 30px 80px rgba(0,0,0,.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                alignItems: "flex-start",
                marginBottom: "28px",
              }}
            >
              <div>
                <div className="eyebrow">
                  ACCOUNT
                </div>

                <h2
                  style={{
                    marginTop: ".4rem",
                    marginBottom: ".3rem",
                  }}
                >
                  Settings
                </h2>

                <p
                  style={{
                    color: "#6f7268",
                    margin: 0,
                  }}
                >
                  {userEmail || "TriCoach athlete"}
                </p>
              </div>

              <button
                onClick={() =>
                  setSettingsOpen(false)
                }
                style={{
                  border: 0,
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              <button
                className="primary full"
                onClick={editAthleteProfile}
              >
                Edit athlete profile
              </button>

              <button
                className="secondary full"
                disabled={isResetting}
                onClick={resetTrainingPlan}
              >
                {isResetting
                  ? "Resetting..."
                  : "Reset training plan"}
              </button>

              <button
                onClick={logOut}
                style={{
                  marginTop: "10px",
                  border: "1px solid #d8d7cf",
                  background: "transparent",
                  borderRadius: "12px",
                  padding: "14px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Log out
              </button>
            </div>

            <p
              style={{
                marginTop: "22px",
                marginBottom: 0,
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#85877f",
              }}
            >
              Resetting your training plan keeps
              your account and athlete profile.
              Logging out does not delete your
              data from TriCoach.
            </p>
          </section>
        </div>
      )}

    </main>
  );
}'''

if marker not in text:
    raise SystemExit(
        "STOPP: Fant ikke slutten av komponenten"
    )

text = text.replace(
    marker,
    settings_modal,
    1
)


# =========================================================
# WRITE
# =========================================================

page.write_text(text)

print("✅ TriCoach v0.10 Beta Ready patch ferdig!")
print("")
print("Nytt:")
print("- Settings")
print("- Logged-in email")
print("- Edit athlete profile")
print("- Reset training plan")
print("- Log out")
print("- Supabase + localStorage reset")
print("- Automatisk backup av v0.9")
