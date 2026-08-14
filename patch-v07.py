from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")
next_week_route = Path("app/api/next-week/route.ts")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

# --------------------------------------------------
# BACKUP
# --------------------------------------------------

shutil.copy(
    page,
    f"app/page.v06-backup-{stamp}.tsx"
)

page_text = page.read_text()


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(
            f"STOPP: Fant ikke delen for {label}"
        )

    return text.replace(old, new, 1)


# ==================================================
# FRONTEND
# ==================================================

# --------------------------------------------------
# 1. WeeklyReview type
# --------------------------------------------------

page_text = replace_once(
    page_text,

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
};
''',

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
};

type WeeklyReview = {
  headline: string;
  summary: string;
  completedSessions: number;
  skippedSessions: number;
  averageRpe: number | null;
  loadDecision:
    | "Increase slightly"
    | "Maintain"
    | "Reduce";
  positives: string[];
  concerns: string[];
  nextWeekFocus: string;
};
''',

    "WeeklyReview type"
)


# --------------------------------------------------
# 2. State
# --------------------------------------------------

page_text = replace_once(
    page_text,

    '''  const [workoutHistory, setWorkoutHistory] = useState<WorkoutFeedback[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
''',

    '''  const [workoutHistory, setWorkoutHistory] = useState<WorkoutFeedback[]>([]);
  const [planHistory, setPlanHistory] = useState<TrainingPlan[]>([]);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [isNextWeekLoading, setIsNextWeekLoading] = useState(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
''',

    "v07 state"
)


# --------------------------------------------------
# 3. Restore extra data
# --------------------------------------------------

page_text = replace_once(
    page_text,

    '''      const savedHistory = localStorage.getItem("tricoach-workout-history");
''',

    '''      const savedHistory = localStorage.getItem("tricoach-workout-history");
      const savedPlanHistory = localStorage.getItem("tricoach-plan-history");
      const savedWeeklyReview = localStorage.getItem("tricoach-weekly-review");
''',

    "restore keys"
)


page_text = replace_once(
    page_text,

    '''      if (savedHistory) {
        setWorkoutHistory(JSON.parse(savedHistory));
      }
''',

    '''      if (savedHistory) {
        setWorkoutHistory(JSON.parse(savedHistory));
      }

      if (savedPlanHistory) {
        setPlanHistory(JSON.parse(savedPlanHistory));
      }

      if (savedWeeklyReview) {
        setWeeklyReview(JSON.parse(savedWeeklyReview));
      }
''',

    "restore v07 data"
)


# --------------------------------------------------
# 4. Persist planHistory + weeklyReview
# --------------------------------------------------

marker = '''  const today = useMemo(() => {
'''

save_logic = '''  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-plan-history",
      JSON.stringify(planHistory)
    );
  }, [planHistory, hasRestoredData]);

  useEffect(() => {
    if (!hasRestoredData) return;

    if (weeklyReview) {
      localStorage.setItem(
        "tricoach-weekly-review",
        JSON.stringify(weeklyReview)
      );
    }
  }, [weeklyReview, hasRestoredData]);

'''

if marker not in page_text:
    raise SystemExit(
        "STOPP: Fant ikke today-markøren"
    )

page_text = page_text.replace(
    marker,
    save_logic + marker,
    1
)


# --------------------------------------------------
# 5. Next week generator function
# --------------------------------------------------

marker = '''  async function generatePlan() {
'''

next_week_function = '''  async function generateNextWeek() {
    if (!trainingPlan) {
      alert("No active training plan found.");
      return;
    }

    if (workoutHistory.length === 0) {
      const continueAnyway = window.confirm(
        "You have not logged any workouts yet. Generate next week anyway?"
      );

      if (!continueAnyway) return;
    }

    setIsNextWeekLoading(true);

    try {
      const response = await fetch(
        "/api/next-week",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            athlete,
            currentPlan: trainingPlan,
            workoutHistory,
            planHistory,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not generate next week"
        );
      }

      setPlanHistory((current) => [
        ...current,
        trainingPlan,
      ]);

      setWeeklyReview(data.review);
      setTrainingPlan(data.nextPlan);

      // Start a clean feedback log for the new week.
      setWorkoutHistory([]);

    } catch (error) {
      console.error(
        "Next week generation error:",
        error
      );

      alert(
        "TriCoach could not generate the next week. Please try again."
      );
    } finally {
      setIsNextWeekLoading(false);
    }
  }

'''

if marker not in page_text:
    raise SystemExit(
        "STOPP: Fant ikke generatePlan"
    )

page_text = page_text.replace(
    marker,
    next_week_function + marker,
    1
)


# --------------------------------------------------
# 6. Add Weekly Review UI before history
# --------------------------------------------------

history_marker = '''        {workoutHistory.length > 0 && (
          <section className="weekSection">
'''

review_ui = '''        {weeklyReview && (
          <section className="weekSection">
            <div className="sectionTitle">
              <div>
                <span className="eyebrow">
                  COACH REVIEW
                </span>

                <h2>
                  {weeklyReview.headline}
                </h2>
              </div>

              <span>
                {weeklyReview.loadDecision}
              </span>
            </div>

            <div
              className="todayCard"
              style={{
                minHeight: "auto",
                marginTop: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                }}
              >
                {weeklyReview.summary}
              </p>

              <div className="metricRow">
                <div>
                  <small>COMPLETED</small>
                  <strong>
                    {
                      weeklyReview.completedSessions
                    }
                  </strong>
                </div>

                <div>
                  <small>SKIPPED</small>
                  <strong>
                    {
                      weeklyReview.skippedSessions
                    }
                  </strong>
                </div>

                <div>
                  <small>AVG RPE</small>
                  <strong>
                    {weeklyReview.averageRpe ??
                      "—"}
                  </strong>
                </div>
              </div>

              <div
                className="workoutSteps"
                style={{
                  marginBottom: 0,
                }}
              >
                <div>
                  <b>+</b>

                  <span>
                    <strong>
                      What went well
                    </strong>

                    <small>
                      {weeklyReview.positives.length
                        ? weeklyReview.positives.join(
                            " · "
                          )
                        : "Keep building consistency."}
                    </small>
                  </span>
                </div>

                <div>
                  <b>!</b>

                  <span>
                    <strong>
                      What I'm watching
                    </strong>

                    <small>
                      {weeklyReview.concerns.length
                        ? weeklyReview.concerns.join(
                            " · "
                          )
                        : "No major concerns."}
                    </small>
                  </span>
                </div>

                <div>
                  <b>→</b>

                  <span>
                    <strong>
                      Next-week focus
                    </strong>

                    <small>
                      {
                        weeklyReview.nextWeekFocus
                      }
                    </small>
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

'''

if history_marker not in page_text:
    raise SystemExit(
        "STOPP: Fant ikke training history"
    )

page_text = page_text.replace(
    history_marker,
    review_ui + history_marker,
    1
)


# --------------------------------------------------
# 7. Add Generate Next Week button
# --------------------------------------------------

week_end_marker = '''          </div>
        </section>

        {weeklyReview && (
'''

next_week_button = '''          </div>

          <div
            className="actionRow"
            style={{
              marginTop: "1.2rem",
            }}
          >
            <button
              className="primary"
              disabled={isNextWeekLoading}
              onClick={generateNextWeek}
            >
              {isNextWeekLoading
                ? "Reviewing your week..."
                : "Generate next week →"}
            </button>

            <span
              style={{
                alignSelf: "center",
                color: "#6f7268",
                fontSize: ".85rem",
              }}
            >
              TriCoach will review what
              actually happened before
              progressing the plan.
            </span>
          </div>
        </section>

        {weeklyReview && (
'''

if week_end_marker not in page_text:
    raise SystemExit(
        "STOPP: Fant ikke slutten av ukeplanen"
    )

page_text = page_text.replace(
    week_end_marker,
    next_week_button,
    1
)


# Write patched frontend
page.write_text(page_text)


# ==================================================
# NEXT-WEEK API
# ==================================================

next_week_route.parent.mkdir(
    parents=True,
    exist_ok=True
)

route_code = r'''import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      athlete,
      currentPlan,
      workoutHistory = [],
      planHistory = [],
    } = body;

    if (!athlete || !currentPlan) {
      return NextResponse.json(
        {
          error:
            "Athlete and current plan are required",
        },
        { status: 400 }
      );
    }

    const response =
      await openai.responses.create({
        model: "gpt-5.6-luna",

        instructions: `
You are the adaptive weekly planning engine for TriCoach.

You are reviewing one completed training week and creating the next week.

ATHLETE:
${JSON.stringify(athlete, null, 2)}

CURRENT / PREVIOUS WEEK PLAN:
${JSON.stringify(currentPlan, null, 2)}

WHAT THE ATHLETE ACTUALLY LOGGED:
${JSON.stringify(workoutHistory, null, 2)}

OLDER PLAN HISTORY:
${JSON.stringify(
  planHistory.slice(-3),
  null,
  2
)}

YOUR JOB:

1. Review the week honestly.
2. Identify meaningful patterns.
3. Decide whether next week's overall load should:
   - increase slightly
   - remain similar
   - reduce
4. Create the next 7-day plan.
5. Explain the main reason for the decision.

TRAINING PRINCIPLES:

- Consistency matters more than isolated heroic workouts.
- Do not "repay" missed sessions.
- Do not aggressively increase volume.
- A successful week does not automatically require more training.
- Repeated high RPE, heavy sessions, worsening fatigue, illness signals,
  or poor recovery should push the plan toward caution.
- One bad session alone should not cause an overreaction.
- Preserve recovery around demanding sessions.
- Avoid unnecessary hard-session stacking.
- Keep most endurance work easy or controlled.
- Prioritize the athlete's weakest discipline when appropriate.
- Beginner swimmers should emphasize technique, confidence,
  frequency and relaxed aerobic work.
- Long-bike volume is generally preferable to excessive run-volume
  increases for age-group triathlon endurance.
- The athlete has a life outside training.
- Keep the plan reasonably close to their available weekly hours.
- Do not diagnose injury or illness.
- If workout feedback suggests concerning symptoms,
  be conservative and tell the athlete to seek appropriate
  professional medical assessment where warranted.

WEEK STRUCTURE:

Return exactly Monday through Sunday.

Each day must contain only one primary sport category:
Swim, Bike, Run, Strength, or Rest.

A brick session can use Bike as the sport and describe
the short run in details.

Do not invent performance numbers such as FTP, threshold pace,
heart-rate zones, or swim CSS if the athlete has not provided them.
Use RPE / easy / moderate descriptions instead.

Your output must follow the JSON schema exactly.
        `,

        input:
          "Review the athlete's completed week and build the next training week.",

        text: {
          format: {
            type: "json_schema",
            name: "tricoach_week_transition",
            strict: true,

            schema: {
              type: "object",
              additionalProperties: false,

              properties: {
                review: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    headline: {
                      type: "string",
                    },

                    summary: {
                      type: "string",
                    },

                    completedSessions: {
                      type: "number",
                    },

                    skippedSessions: {
                      type: "number",
                    },

                    averageRpe: {
                      anyOf: [
                        {
                          type: "number",
                        },
                        {
                          type: "null",
                        },
                      ],
                    },

                    loadDecision: {
                      type: "string",
                      enum: [
                        "Increase slightly",
                        "Maintain",
                        "Reduce",
                      ],
                    },

                    positives: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },

                    concerns: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },

                    nextWeekFocus: {
                      type: "string",
                    },
                  },

                  required: [
                    "headline",
                    "summary",
                    "completedSessions",
                    "skippedSessions",
                    "averageRpe",
                    "loadDecision",
                    "positives",
                    "concerns",
                    "nextWeekFocus",
                  ],
                },

                nextPlan: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    summary: {
                      type: "string",
                    },

                    totalHours: {
                      type: "number",
                    },

                    focus: {
                      type: "string",
                    },

                    days: {
                      type: "array",
                      minItems: 7,
                      maxItems: 7,

                      items: {
                        type: "object",
                        additionalProperties: false,

                        properties: {
                          day: {
                            type: "string",
                            enum: [
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ],
                          },

                          sport: {
                            type: "string",
                            enum: [
                              "Swim",
                              "Bike",
                              "Run",
                              "Strength",
                              "Rest",
                            ],
                          },

                          title: {
                            type: "string",
                          },

                          durationMinutes: {
                            type: "number",
                          },

                          intensity: {
                            type: "string",
                          },

                          purpose: {
                            type: "string",
                          },

                          details: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                        },

                        required: [
                          "day",
                          "sport",
                          "title",
                          "durationMinutes",
                          "intensity",
                          "purpose",
                          "details",
                        ],
                      },
                    },
                  },

                  required: [
                    "summary",
                    "totalHours",
                    "focus",
                    "days",
                  ],
                },
              },

              required: [
                "review",
                "nextPlan",
              ],
            },
          },
        },
      });

    let result;

    try {
      result = JSON.parse(
        response.output_text
      );
    } catch {
      console.error(
        "Invalid next-week JSON:",
        response.output_text
      );

      return NextResponse.json(
        {
          error:
            "TriCoach returned invalid weekly data",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      review: result.review,
      nextPlan: result.nextPlan,
    });

  } catch (error) {
    console.error(
      "TriCoach next-week API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not review and generate next week",
      },
      { status: 500 }
    );
  }
}
'''

next_week_route.write_text(route_code)


print("✅ TriCoach v0.7 patch ferdig!")
print("")
print("Nytt:")
print("- AI Weekly Review")
print("- Generate next week")
print("- Neste uke bruker faktisk workout feedback")
print("- AI velger Increase / Maintain / Reduce")
print("- Tidligere planer lagres")
print("- Workout-loggen nullstilles etter ukeovergang")
print("- Ny uke lagres automatisk")
print("- Backup av v0.6 laget automatisk")
