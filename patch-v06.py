from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")
coach = Path("app/api/coach/route.ts")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

shutil.copy(page, f"app/page.v05-backup-{stamp}.tsx")
shutil.copy(coach, f"app/api/coach/route.v05-backup-{stamp}.ts")

page_text = page.read_text()
coach_text = coach.read_text()


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"STOPP: Fant ikke delen for {label}")
    return text.replace(old, new, 1)


# --------------------------------------------------
# FRONTEND TYPES
# --------------------------------------------------

page_text = replace_once(
    page_text,
    '''type TrainingPlan = {
  summary: string;
  totalHours: number;
  focus: string;
  days: TrainingPlanDay[];
};
''',
    '''type TrainingPlan = {
  summary: string;
  totalHours: number;
  focus: string;
  days: TrainingPlanDay[];
};

type WorkoutFeedback = {
  id: string;
  day: string;
  sport: string;
  title: string;
  status: "Completed" | "Skipped" | "Modified";
  rpe: number | null;
  feeling: "Great" | "Normal" | "Heavy" | null;
  comment: string;
  completedAt: string;
};
''',
    "feedback type"
)


# --------------------------------------------------
# FRONTEND STATE
# --------------------------------------------------

page_text = replace_once(
    page_text,
    '''  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [hasRestoredData, setHasRestoredData] = useState(false);
''',
    '''  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [hasRestoredData, setHasRestoredData] = useState(false);

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutFeedback[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackStatus, setFeedbackStatus] =
    useState<"Completed" | "Skipped" | "Modified">("Completed");
  const [feedbackRpe, setFeedbackRpe] = useState(5);
  const [feedbackFeeling, setFeedbackFeeling] =
    useState<"Great" | "Normal" | "Heavy">("Normal");
  const [feedbackComment, setFeedbackComment] = useState("");
''',
    "feedback state"
)


# --------------------------------------------------
# RESTORE WORKOUT HISTORY
# --------------------------------------------------

page_text = replace_once(
    page_text,
    '''      const savedAthlete = localStorage.getItem("tricoach-athlete");
      const savedPlan = localStorage.getItem("tricoach-plan");
''',
    '''      const savedAthlete = localStorage.getItem("tricoach-athlete");
      const savedPlan = localStorage.getItem("tricoach-plan");
      const savedHistory = localStorage.getItem("tricoach-workout-history");
''',
    "restore history lookup"
)

page_text = replace_once(
    page_text,
    '''      if (savedPlan) {
        setTrainingPlan(JSON.parse(savedPlan));
        setScreen("dashboard");
      }
''',
    '''      if (savedPlan) {
        setTrainingPlan(JSON.parse(savedPlan));
        setScreen("dashboard");
      }

      if (savedHistory) {
        setWorkoutHistory(JSON.parse(savedHistory));
      }
''',
    "restore workout history"
)


# --------------------------------------------------
# SAVE WORKOUT HISTORY
# --------------------------------------------------

marker = '''  const today = useMemo(() => {
'''

history_save = '''  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-workout-history",
      JSON.stringify(workoutHistory)
    );
  }, [workoutHistory, hasRestoredData]);

'''

if marker not in page_text:
    raise SystemExit("STOPP: Fant ikke today-markør")

page_text = page_text.replace(
    marker,
    history_save + marker,
    1
)


# --------------------------------------------------
# SEND HISTORY TO COACH
# --------------------------------------------------

page_text = replace_once(
    page_text,
    '''          athlete,
          trainingPlan,
          history: oldChat,
''',
    '''          athlete,
          trainingPlan,
          workoutHistory,
          history: oldChat,
''',
    "workout history to coach"
)


# --------------------------------------------------
# SAVE FEEDBACK FUNCTION
# --------------------------------------------------

marker = '''  async function generatePlan() {
'''

feedback_function = '''  function saveWorkoutFeedback() {
    const feedback: WorkoutFeedback = {
      id: `${Date.now()}`,
      day: today[0],
      sport: today[1],
      title: today[2],
      status: feedbackStatus,
      rpe:
        feedbackStatus === "Skipped"
          ? null
          : feedbackRpe,
      feeling:
        feedbackStatus === "Skipped"
          ? null
          : feedbackFeeling,
      comment: feedbackComment.trim(),
      completedAt: new Date().toISOString(),
    };

    setWorkoutHistory((current) => [
      ...current,
      feedback,
    ]);

    setFeedbackOpen(false);
    setFeedbackStatus("Completed");
    setFeedbackRpe(5);
    setFeedbackFeeling("Normal");
    setFeedbackComment("");
  }

'''

if marker not in page_text:
    raise SystemExit("STOPP: Fant ikke generatePlan-markør")

page_text = page_text.replace(
    marker,
    feedback_function + marker,
    1
)


# --------------------------------------------------
# REPLACE START WORKOUT BUTTON
# --------------------------------------------------

page_text = replace_once(
    page_text,
    '''              <button className="primary">
                Start workout
              </button>
''',
    '''              <button
                className="primary"
                onClick={() => setFeedbackOpen(true)}
              >
                Log workout
              </button>
''',
    "log workout button"
)


# --------------------------------------------------
# INSERT FEEDBACK UI
# --------------------------------------------------

marker = '''        <section className="weekSection">
'''

feedback_ui = '''        {feedbackOpen && (
          <section className="questionCard" style={{ marginTop: "1.5rem" }}>
            <div className="eyebrow">WORKOUT FEEDBACK</div>

            <h1 style={{ fontSize: "2.4rem" }}>
              How did today go?
            </h1>

            <div className="choiceGrid three">
              {(["Completed", "Modified", "Skipped"] as const).map(
                (status) => (
                  <button
                    key={status}
                    className={
                      feedbackStatus === status
                        ? "choice selected"
                        : "choice"
                    }
                    onClick={() =>
                      setFeedbackStatus(status)
                    }
                  >
                    <strong>{status}</strong>
                  </button>
                )
              )}
            </div>

            {feedbackStatus !== "Skipped" && (
              <>
                <div style={{ marginTop: "1.5rem" }}>
                  <div className="eyebrow">RPE</div>

                  <div className="bigNumber">
                    {feedbackRpe}/10
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={feedbackRpe}
                    onChange={(e) =>
                      setFeedbackRpe(
                        Number(e.target.value)
                      )
                    }
                    style={{ width: "100%" }}
                  />
                </div>

                <div
                  className="choiceGrid three"
                  style={{ marginTop: "1.5rem" }}
                >
                  {(["Great", "Normal", "Heavy"] as const).map(
                    (feeling) => (
                      <button
                        key={feeling}
                        className={
                          feedbackFeeling === feeling
                            ? "choice selected"
                            : "choice"
                        }
                        onClick={() =>
                          setFeedbackFeeling(feeling)
                        }
                      >
                        <strong>{feeling}</strong>
                      </button>
                    )
                  )}
                </div>
              </>
            )}

            <textarea
              className="field"
              style={{
                marginTop: "1.5rem",
                minHeight: "110px",
                resize: "vertical",
              }}
              value={feedbackComment}
              placeholder="Anything your coach should know?"
              onChange={(e) =>
                setFeedbackComment(e.target.value)
              }
            />

            <div
              className="actionRow"
              style={{ marginTop: "1.5rem" }}
            >
              <button
                className="primary"
                onClick={saveWorkoutFeedback}
              >
                Save feedback
              </button>

              <button
                className="secondary"
                onClick={() => setFeedbackOpen(false)}
              >
                Cancel
              </button>
            </div>
          </section>
        )}

'''

if marker not in page_text:
    raise SystemExit("STOPP: Fant ikke weekSection-markør")

page_text = page_text.replace(
    marker,
    feedback_ui + marker,
    1
)


# --------------------------------------------------
# WEEKLY REVIEW SUMMARY UI
# --------------------------------------------------

marker = '''        </section>
      </section>
    </main>
'''

weekly_review = '''        </section>

        {workoutHistory.length > 0 && (
          <section className="weekSection">
            <div className="sectionTitle">
              <div>
                <span className="eyebrow">
                  TRAINING HISTORY
                </span>

                <h2>This week's feedback</h2>
              </div>

              <span>
                {workoutHistory.filter(
                  (item) =>
                    item.status === "Completed"
                ).length} completed ·{" "}
                {workoutHistory.filter(
                  (item) =>
                    item.status === "Skipped"
                ).length} skipped
              </span>
            </div>

            <div className="weekGrid">
              {workoutHistory
                .slice(-7)
                .map((item) => (
                  <div
                    className="dayCard"
                    key={item.id}
                  >
                    <div className="dayTop">
                      <strong>{item.day}</strong>
                      <span>{item.status}</span>
                    </div>

                    <h3>{item.title}</h3>

                    <p>
                      {item.rpe
                        ? `RPE ${item.rpe}/10 · ${item.feeling}`
                        : "No training completed"}
                    </p>

                    {item.comment && (
                      <p style={{ marginTop: ".6rem" }}>
                        {item.comment}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}
      </section>
    </main>
'''

if marker not in page_text:
    raise SystemExit("STOPP: Fant ikke dashboard-slutten")

page_text = page_text.replace(
    marker,
    weekly_review,
    1
)


# --------------------------------------------------
# COACH API
# --------------------------------------------------

coach_text = replace_once(
    coach_text,
    '''      trainingPlan,
      history = [],
''',
    '''      trainingPlan,
      workoutHistory = [],
      history = [],
''',
    "coach workout history body"
)


coach_text = replace_once(
    coach_text,
    '''CURRENT TRAINING PLAN:
${trainingPlan
  ? JSON.stringify(trainingPlan, null, 2)
  : "No active training plan available."}

When the athlete asks about changing, missing, moving, shortening,
''',
    '''CURRENT TRAINING PLAN:
${trainingPlan
  ? JSON.stringify(trainingPlan, null, 2)
  : "No active training plan available."}

RECENT WORKOUT FEEDBACK:
${workoutHistory?.length
  ? JSON.stringify(workoutHistory.slice(-14), null, 2)
  : "No workout feedback has been logged yet."}

Use RECENT WORKOUT FEEDBACK when relevant.

Look for patterns such as:
- repeated high RPE
- unusually heavy sessions
- skipped sessions
- poor recovery
- strong training consistency

Do not overreact to one imperfect workout.

When the athlete asks about changing, missing, moving, shortening,
''',
    "coach history context"
)


page.write_text(page_text)
coach.write_text(coach_text)

print("✅ TriCoach v0.6 patch ferdig!")
print("")
print("Nytt:")
print("- Workout feedback")
print("- Completed / Modified / Skipped")
print("- RPE 1–10")
print("- Great / Normal / Heavy")
print("- Athlete comments")
print("- Lokal treningshistorikk")
print("- Coach får tilgang til historikken")
print("- Enkel weekly review-visning")
print("- Backup laget automatisk")
