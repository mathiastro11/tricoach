from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")
stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

shutil.copy(
    page,
    f"app/page.v010-backup-{stamp}.tsx"
)

text = page.read_text()


def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f"STOPP: Fant ikke delen for {label}")
    text = text.replace(old, new, 1)


# =========================================================
# 1. EXTEND PLAN TYPES
# =========================================================

replace_once(
'''type TrainingPlanDay = {
  day: string;
  sport: string;
  title: string;
  durationMinutes: number;
  intensity: string;
  purpose: string;
  details: string[];
};''',
'''type TrainingPlanDay = {
  day: string;
  date?: string;
  sport: string;
  title: string;
  durationMinutes: number;
  intensity: string;
  purpose: string;
  details: string[];
};''',
"TrainingPlanDay date"
)

replace_once(
'''type TrainingPlan = {
  summary: string;
  totalHours: number;
  focus: string;
  days: TrainingPlanDay[];
};''',
'''type TrainingPlan = {
  summary: string;
  totalHours: number;
  focus: string;
  weekNumber?: number;
  weekStart?: string;
  days: TrainingPlanDay[];
};''',
"TrainingPlan week metadata"
)


# =========================================================
# 2. ADD HELPERS
# =========================================================

marker = '''export default function Home() {
'''

helpers = '''function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonday(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function getISOWeekNumber(date = new Date()) {
  const copy = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));

  const dayNum = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));

  return Math.ceil(
    (((copy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );
}

function attachWeekDates(plan: TrainingPlan): TrainingPlan {
  const start = plan.weekStart
    ? new Date(`${plan.weekStart}T12:00:00`)
    : getMonday();

  const days = plan.days.map((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      ...day,
      date: day.date || toISODate(date),
    };
  });

  return {
    ...plan,
    weekNumber: plan.weekNumber ?? getISOWeekNumber(start),
    weekStart: plan.weekStart ?? toISODate(start),
    days,
  };
}

'''

if marker not in text:
    raise SystemExit("STOPP: Fant ikke Home-komponenten")

text = text.replace(marker, helpers + marker, 1)


# =========================================================
# 3. NORMALIZE GENERATED PLAN
# =========================================================

replace_once(
'''      setTrainingPlan(data.plan);
      setScreen("dashboard");''',
'''      setTrainingPlan(
        attachWeekDates(data.plan)
      );
      setScreen("dashboard");''',
"initial plan dates"
)


# =========================================================
# 4. NORMALIZE NEXT WEEK
# =========================================================

replace_once(
'''      setWeeklyReview(data.review);
      setTrainingPlan(data.nextPlan);

      // Start a clean feedback log for the new week.''',
'''      setWeeklyReview(data.review);

      const previousStart = trainingPlan.weekStart
        ? new Date(`${trainingPlan.weekStart}T12:00:00`)
        : getMonday();

      const nextStart = new Date(previousStart);
      nextStart.setDate(previousStart.getDate() + 7);

      setTrainingPlan(
        attachWeekDates({
          ...data.nextPlan,
          weekNumber: getISOWeekNumber(nextStart),
          weekStart: toISODate(nextStart),
        })
      );

      // Start a clean feedback log for the new week.''',
"next week dates"
)


# =========================================================
# 5. NORMALIZE DB RESTORE
# =========================================================

replace_once(
'''          if (trainingData?.active_plan) {
            setTrainingPlan(trainingData.active_plan);
            setScreen("dashboard");
          }''',
'''          if (trainingData?.active_plan) {
            setTrainingPlan(
              attachWeekDates(trainingData.active_plan)
            );
            setScreen("dashboard");
          }''',
"database restore dates"
)


# =========================================================
# 6. NORMALIZE LOCAL RESTORE
# =========================================================

replace_once(
'''          if (savedPlan) {
            setTrainingPlan(JSON.parse(savedPlan));
            setScreen("dashboard");
          }''',
'''          if (savedPlan) {
            setTrainingPlan(
              attachWeekDates(JSON.parse(savedPlan))
            );
            setScreen("dashboard");
          }''',
"local restore dates"
)


# =========================================================
# 7. IMPROVE WEEK HEADER
# =========================================================

replace_once(
'''              <span className="eyebrow">
                THIS WEEK
              </span>

              <h2>Your plan</h2>''',
'''              <span className="eyebrow">
                {trainingPlan?.weekNumber
                  ? `WEEK ${trainingPlan.weekNumber}`
                  : "THIS WEEK"}
              </span>

              <h2>
                {trainingPlan?.weekStart
                  ? new Date(
                      `${trainingPlan.weekStart}T12:00:00`
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                    })
                  : "Your plan"}
              </h2>''',
"week header"
)


# =========================================================
# 8. SHOW REAL DATES ON WORKOUT CARDS
# =========================================================

replace_once(
'''                <div className="dayTop">
                  <strong>{workout.day.slice(0, 3)}</strong>
                  <span>{workout.sport}</span>
                </div>

                <h3>{workout.title}</h3>''',
'''                <div className="dayTop">
                  <strong>
                    {workout.date
                      ? new Date(
                          `${workout.date}T12:00:00`
                        ).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                        })
                      : workout.day.slice(0, 3)}
                  </strong>

                  <span>{workout.sport}</span>
                </div>

                <h3>{workout.title}</h3>''',
"workout card dates"
)


# =========================================================
# 9. RACE PROGRESS CARD
# =========================================================

marker = '''        <div className="dashboardGrid">
'''

race_card = '''        {athlete.raceDate && (
          <section
            className="todayCard"
            style={{
              minHeight: "auto",
              marginBottom: "1rem",
            }}
          >
            <div className="cardHead">
              <span>RACE COUNTDOWN</span>
              <span>{athlete.goal}</span>
            </div>

            {(() => {
              const todayDate = new Date();
              const raceDate = new Date(
                `${athlete.raceDate}T12:00:00`
              );

              const daysRemaining = Math.max(
                0,
                Math.ceil(
                  (raceDate.getTime() - todayDate.getTime()) /
                    86400000
                )
              );

              const weeksRemaining = Math.ceil(
                daysRemaining / 7
              );

              return (
                <>
                  <h2
                    style={{
                      marginTop: "1rem",
                      marginBottom: ".25rem",
                    }}
                  >
                    {daysRemaining} days to race day
                  </h2>

                  <p>
                    Approximately {weeksRemaining} training weeks
                    remain until{" "}
                    {raceDate.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    .
                  </p>
                </>
              );
            })()}
          </section>
        )}

'''

if marker not in text:
    raise SystemExit("STOPP: Fant ikke dashboardGrid")

text = text.replace(
    marker,
    race_card + marker,
    1
)


# =========================================================
# 10. PLAN HISTORY SECTION
# =========================================================

marker = '''        {weeklyReview && (
'''

history_ui = '''        {planHistory.length > 0 && (
          <section className="weekSection">
            <div className="sectionTitle">
              <div>
                <span className="eyebrow">
                  TRAINING HISTORY
                </span>

                <h2>Previous weeks</h2>
              </div>

              <span>
                {planHistory.length} completed{" "}
                {planHistory.length === 1 ? "week" : "weeks"}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: "1rem",
              }}
            >
              {planHistory
                .slice()
                .reverse()
                .slice(0, 6)
                .map((plan, index) => (
                  <div
                    key={`${plan.weekStart ?? index}-${index}`}
                    className="dayCard"
                    style={{
                      minHeight: "auto",
                    }}
                  >
                    <div className="dayTop">
                      <strong>
                        {plan.weekNumber
                          ? `Week ${plan.weekNumber}`
                          : `Previous week ${planHistory.length - index}`}
                      </strong>

                      <span>
                        {plan.totalHours} h
                      </span>
                    </div>

                    <h3
                      style={{
                        marginTop: "1rem",
                      }}
                    >
                      {plan.focus}
                    </h3>

                    <p>
                      {plan.weekStart
                        ? new Date(
                            `${plan.weekStart}T12:00:00`
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })
                        : plan.summary}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        )}

'''

if marker not in text:
    raise SystemExit("STOPP: Fant ikke weeklyReview")

text = text.replace(
    marker,
    history_ui + marker,
    1
)


page.write_text(text)

print("✅ TriCoach v0.11 Training Calendar patch ferdig!")
print("")
print("Nytt:")
print("- Faktiske datoer på ukeøkter")
print("- ISO-ukenummer")
print("- Week start")
print("- Race countdown")
print("- Planhistorikk med tidligere uker")
print("- Nye uker flyttes automatisk 7 dager frem")
print("- Gamle planer normaliseres automatisk")
print("- Backup laget automatisk")
