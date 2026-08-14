from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")
text = page.read_text()

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = f"app/page.v011-training-data-backup-{stamp}.tsx"

# =========================================================
# PREFLIGHT
# =========================================================

checks = {
    "WorkoutFeedback type": '''type WorkoutFeedback = {
  id: string;
  day: string;
  sport: string;
  title: string;
  status: "Completed" | "Skipped" | "Modified";
  rpe: number | null;
  feeling: "Great" | "Normal" | "Heavy" | null;
  comment: string;
  completedAt: string;
};''',

    "selectedWorkout state": '''  const [selectedWorkout, setSelectedWorkout] =
    useState<TrainingPlanDay | null>(null);
''',

    "saveWorkoutFeedback": '''  function saveWorkoutFeedback() {''',

    "feedback modal": '''        {feedbackOpen && (''',
}

for label, snippet in checks.items():
    if snippet not in text:
        raise SystemExit(
            f"STOPP: Fant ikke forventet struktur for {label}"
        )

shutil.copy(page, backup)


def replace_once(old, new, label):
    global text

    if old not in text:
        raise SystemExit(
            f"STOPP: Fant ikke delen for {label}"
        )

    text = text.replace(old, new, 1)


# =========================================================
# 1. UTVID WORKOUT FEEDBACK
# =========================================================

replace_once(
'''type WorkoutFeedback = {
  id: string;
  day: string;
  sport: string;
  title: string;
  status: "Completed" | "Skipped" | "Modified";
  rpe: number | null;
  feeling: "Great" | "Normal" | "Heavy" | null;
  comment: string;
  completedAt: string;
};''',

'''type WorkoutFeedback = {
  id: string;
  day: string;
  date?: string;
  sport: string;
  title: string;

  plannedDurationMinutes: number | null;

  status: "Completed" | "Skipped" | "Modified";

  actualDurationMinutes: number | null;
  distance: number | null;
  distanceUnit: "km" | "m" | null;

  rpe: number | null;
  feeling: "Great" | "Normal" | "Heavy" | null;

  comment: string;
  completedAt: string;
};''',

"WorkoutFeedback fields"
)


# =========================================================
# 2. NY STATE FOR HVILKEN ØKT SOM LOGGES
# =========================================================

replace_once(
'''  const [selectedWorkout, setSelectedWorkout] =
    useState<TrainingPlanDay | null>(null);
''',

'''  const [selectedWorkout, setSelectedWorkout] =
    useState<TrainingPlanDay | null>(null);

  const [feedbackWorkout, setFeedbackWorkout] =
    useState<TrainingPlanDay | null>(null);

  const [actualDurationMinutes, setActualDurationMinutes] =
    useState("");

  const [actualDistance, setActualDistance] =
    useState("");
''',

"training data state"
)


# =========================================================
# 3. ERSTATT SAVE WORKOUT FEEDBACK
# =========================================================

start = text.find("  function saveWorkoutFeedback() {")
end = text.find("\n  async function generateNextWeek()", start)

if start == -1 or end == -1:
    raise SystemExit(
        "STOPP: Fant ikke hele saveWorkoutFeedback-funksjonen"
    )

new_feedback_function = '''  function saveWorkoutFeedback() {
    const workout =
      feedbackWorkout ??
      trainingPlan?.days?.find(
        (item) =>
          item.day.slice(0, 3) === today[0]
      );

    if (!workout) {
      alert("Could not identify the workout.");
      return;
    }

    const isSkipped =
      feedbackStatus === "Skipped";

    const parsedDuration =
      actualDurationMinutes.trim() === ""
        ? null
        : Number(actualDurationMinutes);

    const parsedDistance =
      actualDistance.trim() === ""
        ? null
        : Number(actualDistance);

    const usesDistance =
      workout.sport === "Run" ||
      workout.sport === "Bike" ||
      workout.sport === "Swim";

    const distanceUnit =
      workout.sport === "Swim"
        ? "m"
        : workout.sport === "Run" ||
          workout.sport === "Bike"
        ? "km"
        : null;

    const feedback: WorkoutFeedback = {
      id: `${Date.now()}`,

      day: workout.day,
      date: workout.date,

      sport: workout.sport,
      title: workout.title,

      plannedDurationMinutes:
        workout.durationMinutes ?? null,

      status: feedbackStatus,

      actualDurationMinutes:
        isSkipped
          ? null
          : parsedDuration ??
            workout.durationMinutes ??
            null,

      distance:
        isSkipped || !usesDistance
          ? null
          : parsedDistance,

      distanceUnit,

      rpe:
        isSkipped
          ? null
          : feedbackRpe,

      feeling:
        isSkipped
          ? null
          : feedbackFeeling,

      comment: feedbackComment.trim(),

      completedAt:
        new Date().toISOString(),
    };

    setWorkoutHistory((current) => [
      ...current,
      feedback,
    ]);

    setFeedbackOpen(false);
    setFeedbackWorkout(null);

    setFeedbackStatus("Completed");
    setFeedbackRpe(5);
    setFeedbackFeeling("Normal");
    setFeedbackComment("");

    setActualDurationMinutes("");
    setActualDistance("");
  }

'''

text = (
    text[:start]
    + new_feedback_function
    + text[end:]
)


# =========================================================
# 4. TODAY LOG WORKOUT SKAL VITE HVILKEN ØKT DET ER
# =========================================================

replace_once(
'''              <button
                className="primary"
                onClick={() => setFeedbackOpen(true)}
              >
                Log workout
              </button>''',

'''              <button
                className="primary"
                onClick={() => {
                  const currentWorkout =
                    trainingPlan?.days?.find(
                      (item) =>
                        item.day.slice(0, 3) === today[0]
                    ) ?? null;

                  setFeedbackWorkout(currentWorkout);

                  if (currentWorkout) {
                    setActualDurationMinutes(
                      String(currentWorkout.durationMinutes)
                    );
                  }

                  setActualDistance("");
                  setFeedbackOpen(true);
                }}
              >
                Log workout
              </button>''',

"today log button"
)


# =========================================================
# 5. WORKOUT DETAIL LOG BUTTON
# =========================================================

replace_once(
'''              <button
                className="primary"
                onClick={() => {
                  setFeedbackOpen(true);
                  setSelectedWorkout(null);
                }}
              >
                Log workout
              </button>''',

'''              <button
                className="primary"
                onClick={() => {
                  setFeedbackWorkout(selectedWorkout);

                  setActualDurationMinutes(
                    String(
                      selectedWorkout.durationMinutes
                    )
                  );

                  setActualDistance("");

                  setFeedbackOpen(true);
                  setSelectedWorkout(null);
                }}
              >
                Log workout
              </button>''',

"workout detail log button"
)


# =========================================================
# 6. BEDRE FEEDBACK MODAL – OVERSKRIFT
# =========================================================

replace_once(
'''            <div className="eyebrow">WORKOUT FEEDBACK</div>

            <h1 style={{ fontSize: "2.4rem" }}>
              How did today go?
            </h1>''',

'''            <div className="eyebrow">
              WORKOUT FEEDBACK
            </div>

            <h1 style={{ fontSize: "2.4rem" }}>
              How did the workout go?
            </h1>

            {feedbackWorkout && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  borderRadius: "12px",
                  background: "#ecebe4",
                }}
              >
                <strong>
                  {feedbackWorkout.day} ·{" "}
                  {feedbackWorkout.sport}
                </strong>

                <div
                  style={{
                    marginTop: ".35rem",
                    color: "#6f7268",
                  }}
                >
                  {feedbackWorkout.title} ·{" "}
                  {feedbackWorkout.durationMinutes} min planned
                </div>
              </div>
            )}''',

"feedback modal heading"
)


# =========================================================
# 7. LEGG TIL FAKTISK VARIGHET + DISTANSE
# =========================================================

marker = '''            {feedbackStatus !== "Skipped" && (
              <>'''

replacement = '''            {feedbackStatus !== "Skipped" && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      feedbackWorkout?.sport === "Strength"
                        ? "1fr"
                        : "1fr 1fr",
                    gap: "10px",
                    marginTop: "1.5rem",
                  }}
                >
                  <div>
                    <div
                      className="eyebrow"
                      style={{
                        marginBottom: ".5rem",
                      }}
                    >
                      ACTUAL DURATION
                    </div>

                    <input
                      className="field"
                      type="number"
                      min="0"
                      step="1"
                      value={actualDurationMinutes}
                      placeholder="Minutes"
                      onChange={(e) =>
                        setActualDurationMinutes(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {feedbackWorkout &&
                    ["Run", "Bike", "Swim"].includes(
                      feedbackWorkout.sport
                    ) && (
                      <div>
                        <div
                          className="eyebrow"
                          style={{
                            marginBottom: ".5rem",
                          }}
                        >
                          {feedbackWorkout.sport === "Swim"
                            ? "DISTANCE (METERS)"
                            : "DISTANCE (KM)"}
                        </div>

                        <input
                          className="field"
                          type="number"
                          min="0"
                          step={
                            feedbackWorkout.sport === "Swim"
                              ? "25"
                              : "0.1"
                          }
                          value={actualDistance}
                          placeholder={
                            feedbackWorkout.sport === "Swim"
                              ? "e.g. 1800"
                              : "e.g. 9.2"
                          }
                          onChange={(e) =>
                            setActualDistance(
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}
                </div>
'''

if marker not in text:
    raise SystemExit(
        "STOPP: Fant ikke feedbackStatus-blokken"
    )

text = text.replace(
    marker,
    replacement,
    1
)


# =========================================================
# 8. VIS BEDRE DATA I TRAINING HISTORY
# =========================================================

old_history = '''                    <p>
                      {item.rpe
                        ? `RPE ${item.rpe}/10 · ${item.feeling}`
                        : "No training completed"}
                    </p>

                    {item.comment && (
'''

new_history = '''                    <p>
                      {item.status === "Skipped"
                        ? "No training completed"
                        : [
                            item.actualDurationMinutes
                              ? `${item.actualDurationMinutes} min`
                              : null,

                            item.distance
                              ? `${item.distance} ${item.distanceUnit}`
                              : null,

                            item.rpe
                              ? `RPE ${item.rpe}/10`
                              : null,

                            item.feeling,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>

                    {item.status !== "Skipped" &&
                      item.plannedDurationMinutes &&
                      item.actualDurationMinutes && (
                        <p
                          style={{
                            marginTop: ".45rem",
                            fontSize: ".75rem",
                            color: "#85877f",
                          }}
                        >
                          Planned{" "}
                          {item.plannedDurationMinutes} min
                          → completed{" "}
                          {item.actualDurationMinutes} min
                        </p>
                      )}

                    {item.comment && (
'''

replace_once(
    old_history,
    new_history,
    "training history data"
)


# =========================================================
# 9. LEGG TIL WEEKLY COMPLETION SUMMARY
# =========================================================

marker = '''        {workoutHistory.length > 0 && (
          <section className="weekSection">
'''

summary = '''        {workoutHistory.length > 0 && (() => {
          const completedMinutes =
            workoutHistory.reduce(
              (total, item) =>
                total +
                (item.actualDurationMinutes ?? 0),
              0
            );

          const plannedMinutes =
            workoutHistory.reduce(
              (total, item) =>
                total +
                (item.plannedDurationMinutes ?? 0),
              0
            );

          const completion =
            plannedMinutes > 0
              ? Math.round(
                  (completedMinutes /
                    plannedMinutes) *
                    100
                )
              : 0;

          return (
            <section
              className="todayCard"
              style={{
                minHeight: "auto",
                marginTop: "2rem",
              }}
            >
              <div className="cardHead">
                <span>WEEK PROGRESS</span>
                <span>
                  {completion}% of logged planned time
                </span>
              </div>

              <div className="metricRow">
                <div>
                  <small>TRAINED</small>
                  <strong>
                    {Math.floor(
                      completedMinutes / 60
                    )}h{" "}
                    {completedMinutes % 60}m
                  </strong>
                </div>

                <div>
                  <small>PLANNED</small>
                  <strong>
                    {Math.floor(
                      plannedMinutes / 60
                    )}h{" "}
                    {plannedMinutes % 60}m
                  </strong>
                </div>

                <div>
                  <small>LOGGED</small>
                  <strong>
                    {workoutHistory.length}
                  </strong>
                </div>
              </div>
            </section>
          );
        })()}

'''

if marker not in text:
    raise SystemExit(
        "STOPP: Fant ikke training history section"
    )

text = text.replace(
    marker,
    summary + marker,
    1
)


# =========================================================
# WRITE
# =========================================================

page.write_text(text)

print("✅ TriCoach v0.11 Training Data patch ferdig!")
print("")
print("Nytt:")
print("- Faktisk varighet")
print("- Run/Bike distanse i km")
print("- Swim distanse i meter")
print("- Planlagt vs faktisk varighet")
print("- RPE + feeling + kommentar beholdes")
print("- Logging kobles til riktig valgt økt")
print("- Week Progress summary")
print("- Workout history viser rikere treningsdata")
print("- Backup laget automatisk")
