from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")
text = page.read_text()

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = f"app/page.v012-ui-backup-{stamp}.tsx"

# Preflight
required = [
    'type Athlete = {',
    'const [trainingArchive, setTrainingArchive]',
    'RACE COUNTDOWN',
]

for item in required:
    if item not in text:
        raise SystemExit(f"STOPP: Fant ikke forventet struktur: {item}")

shutil.copy(page, backup)

def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f"STOPP: Fant ikke delen for {label}")
    text = text.replace(old, new, 1)

# --------------------------------------------------
# 1. Helper functions for phase UI
# --------------------------------------------------

marker = '''export default function Home() {
'''

helpers = '''function getWeeksUntilRace(raceDate?: string) {
  if (!raceDate) return null;

  const race = new Date(`${raceDate}T12:00:00`);
  const now = new Date();

  return Math.max(
    0,
    Math.ceil(
      (race.getTime() - now.getTime()) /
        (7 * 86400000)
    )
  );
}

function getTrainingPhaseUI(raceDate?: string) {
  const weeks = getWeeksUntilRace(raceDate);

  if (weeks === null) return "Base";
  if (weeks <= 2) return "Taper";
  if (weeks <= 4) return "Peak";
  if (weeks <= 12) return "Build";

  return "Base";
}

function getPhaseDescription(phase: string) {
  if (phase === "Taper") {
    return "Reduce fatigue while keeping enough intensity to stay race-ready.";
  }

  if (phase === "Peak") {
    return "Prioritize race-specific sessions and protect recovery between key workouts.";
  }

  if (phase === "Build") {
    return "Develop race-specific endurance gradually while maintaining consistency.";
  }

  return "Build aerobic consistency, technical skill and durable training habits.";
}

'''

text = text.replace(marker, helpers + marker, 1)

# --------------------------------------------------
# 2. Add derived phase values inside component
# --------------------------------------------------

marker = '''  const today = useMemo(() => {
'''

phase_values = '''  const weeksToRace =
    getWeeksUntilRace(athlete.raceDate);

  const trainingPhase =
    getTrainingPhaseUI(athlete.raceDate);

'''

text = text.replace(marker, phase_values + marker, 1)

# --------------------------------------------------
# 3. Insert season progress UI after race countdown
# --------------------------------------------------

marker = '''        <div className="dashboardGrid">
'''

season_ui = '''        {athlete.raceDate && (
          <section
            className="todayCard"
            style={{
              minHeight: "auto",
              marginBottom: "1rem",
            }}
          >
            <div className="cardHead">
              <span>TRAINING PHASE</span>
              <span>{trainingPhase.toUpperCase()}</span>
            </div>

            <h2
              style={{
                marginTop: "1rem",
                marginBottom: ".4rem",
              }}
            >
              {trainingPhase} phase
            </h2>

            <p>
              {getPhaseDescription(trainingPhase)}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                marginTop: "1.2rem",
              }}
            >
              {["Base", "Build", "Peak", "Taper"].map(
                (phase) => {
                  const active = phase === trainingPhase;

                  return (
                    <div
                      key={phase}
                      style={{
                        borderRadius: "10px",
                        padding: "10px",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: 900,
                        border: active
                          ? "2px solid #171914"
                          : "1px solid #d8d7cf",
                        background: active
                          ? "#d6ff38"
                          : "#f7f6f1",
                      }}
                    >
                      {phase}
                    </div>
                  );
                }
              )}
            </div>

            <div
              style={{
                marginTop: "1rem",
                fontSize: "13px",
                color: "#6f7268",
              }}
            >
              {weeksToRace !== null
                ? `${weeksToRace} weeks to race day`
                : "Race date not set"}
            </div>
          </section>
        )}

'''

text = text.replace(marker, season_ui + marker, 1)

page.write_text(text)

print("✅ TriCoach v0.12 Season Progress UI patch ferdig!")
print("")
print("Nytt:")
print("- Synlig Base / Build / Peak / Taper")
print("- Aktiv fase markeres tydelig")
print("- Weeks-to-race vises")
print("- Kort forklaring av hva fasen betyr")
print("- Automatisk backup laget")
