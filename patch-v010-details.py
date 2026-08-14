from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")
text = page.read_text()

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = f"app/page.v010-details-backup-{stamp}.tsx"

checks = {
    "training plan type": '''type TrainingPlanDay = {
  day: string;
  sport: string;
  title: string;
  durationMinutes: number;
  intensity: string;
  purpose: string;
  details: string[];
};''',

    "week cards": '''            {(trainingPlan?.days ?? []).map((workout) => (
              <div
                className="dayCard"
                key={workout.day}
              >
                <div className="dayTop">
                  <strong>{workout.day.slice(0, 3)}</strong>
                  <span>{workout.sport}</span>
                </div>

                <h3>{workout.title}</h3>
                <p>
                  {workout.durationMinutes === 0
                    ? "Rest"
                    : `${workout.durationMinutes} min`}
                </p>
              </div>
            ))}''',

    "feedback state": '''  const [feedbackComment, setFeedbackComment] = useState("");
''',
}

for label, snippet in checks.items():
    if snippet not in text:
        raise SystemExit(f"STOPP: Fant ikke forventet struktur for {label}")

# Backup only after all pre-flight checks pass
shutil.copy(page, backup)

def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f"STOPP: Fant ikke delen for {label}")
    text = text.replace(old, new, 1)

# --------------------------------------------------
# 1. State for selected workout
# --------------------------------------------------

replace_once(
'''  const [feedbackComment, setFeedbackComment] = useState("");
''',
'''  const [feedbackComment, setFeedbackComment] = useState("");

  const [selectedWorkout, setSelectedWorkout] =
    useState<TrainingPlanDay | null>(null);
''',
"selected workout state"
)

# --------------------------------------------------
# 2. Make week cards clickable
# --------------------------------------------------

replace_once(
'''            {(trainingPlan?.days ?? []).map((workout) => (
              <div
                className="dayCard"
                key={workout.day}
              >
                <div className="dayTop">
                  <strong>{workout.day.slice(0, 3)}</strong>
                  <span>{workout.sport}</span>
                </div>

                <h3>{workout.title}</h3>
                <p>
                  {workout.durationMinutes === 0
                    ? "Rest"
                    : `${workout.durationMinutes} min`}
                </p>
              </div>
            ))}''',
'''            {(trainingPlan?.days ?? []).map((workout) => (
              <button
                className="dayCard"
                key={workout.day}
                onClick={() => setSelectedWorkout(workout)}
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                  border: "1px solid #d8d7cf",
                }}
              >
                <div className="dayTop">
                  <strong>{workout.day.slice(0, 3)}</strong>
                  <span>{workout.sport}</span>
                </div>

                <h3>{workout.title}</h3>
                <p>
                  {workout.durationMinutes === 0
                    ? "Rest"
                    : `${workout.durationMinutes} min`}
                </p>
              </button>
            ))}''',
"clickable week cards"
)

# --------------------------------------------------
# 3. Insert workout detail modal before settings modal
# --------------------------------------------------

marker = '''      {settingsOpen && (
'''

detail_modal = '''      {selectedWorkout && (
        <div
          onClick={() => setSelectedWorkout(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 22, 18, .52)",
            zIndex: 90,
            display: "grid",
            placeItems: "center",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <section
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "720px",
              background: "#f8f7f2",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 30px 90px rgba(0,0,0,.25)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div className="eyebrow">
                  {selectedWorkout.day.toUpperCase()} ·{" "}
                  {selectedWorkout.sport.toUpperCase()}
                </div>

                <h2
                  style={{
                    fontSize: "2.6rem",
                    lineHeight: .95,
                    letterSpacing: "-.05em",
                    margin: ".6rem 0 .8rem",
                  }}
                >
                  {selectedWorkout.title}
                </h2>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span className="sportBadge">
                    {selectedWorkout.durationMinutes === 0
                      ? "REST"
                      : `${selectedWorkout.durationMinutes} MIN`}
                  </span>

                  <span
                    style={{
                      border: "1px solid #d8d7cf",
                      borderRadius: "8px",
                      padding: ".4rem .6rem",
                      fontSize: ".72rem",
                      fontWeight: 900,
                    }}
                  >
                    {selectedWorkout.intensity}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedWorkout(null)}
                aria-label="Close workout details"
                style={{
                  border: 0,
                  background: "transparent",
                  fontSize: "28px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              className="whyBox"
              style={{
                background: "#ecebe4",
                color: "#2c2f29",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  color: "#6f7268",
                }}
              >
                PURPOSE
              </span>
              {selectedWorkout.purpose}
            </div>

            {selectedWorkout.details?.length > 0 && (
              <div
                style={{
                  marginBottom: "1.8rem",
                }}
              >
                <div className="eyebrow">
                  WORKOUT
                </div>

                <div
                  className="workoutSteps"
                  style={{
                    marginTop: ".7rem",
                  }}
                >
                  {selectedWorkout.details.map((detail, index) => (
                    <div key={`${detail}-${index}`}>
                      <b>
                        {String(index + 1).padStart(2, "0")}
                      </b>

                      <span>
                        <strong>{detail}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                className="primary"
                onClick={() => {
                  setFeedbackOpen(true);
                  setSelectedWorkout(null);
                }}
              >
                Log workout
              </button>

              <button
                className="secondary"
                onClick={() => {
                  setSelectedWorkout(null);
                  sendMessage(
                    `I want to adapt my ${selectedWorkout.day} workout: ${selectedWorkout.title}.`
                  );
                }}
              >
                Ask coach to adapt
              </button>
            </div>

            <p
              style={{
                marginTop: "18px",
                marginBottom: 0,
                color: "#85877f",
                fontSize: "12px",
                lineHeight: 1.5,
              }}
            >
              TriCoach uses the purpose of the session, not just the
              duration, when adapting your week.
            </p>
          </section>
        </div>
      )}

'''

if marker not in text:
    raise SystemExit("STOPP: Fant ikke settings modal-markøren")

text = text.replace(marker, detail_modal + marker, 1)

page.write_text(text)

print("✅ TriCoach v0.10 Workout Details patch ferdig!")
print("")
print("Nytt:")
print("- Klikkbare ukeøkter")
print("- Full workout detail view")
print("- Intensitet, formål og hele workout-details")
print("- Log workout fra detaljvisning")
print("- Ask coach to adapt fra detaljvisning")
print("- Automatisk backup laget")
