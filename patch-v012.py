from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")
coach = Path("app/api/coach/route.ts")
next_week = Path("app/api/next-week/route.ts")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

for file in [page, coach, next_week]:
    shutil.copy(
        file,
        file.with_name(
            file.stem + f".v011-backup-{stamp}" + file.suffix
        )
    )

page_text = page.read_text()
coach_text = coach.read_text()
next_text = next_week.read_text()


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"STOPP: Fant ikke delen for {label}")
    return text.replace(old, new, 1)


# =========================================================
# FRONTEND — MULTI-WEEK ARCHIVE
# =========================================================

# 1. Archive type
page_text = replace_once(
    page_text,
    '''type WeeklyReview = {''',
    '''type TrainingArchiveWeek = {
  plan: TrainingPlan;
  feedback: WorkoutFeedback[];
  review: WeeklyReview | null;
  archivedAt: string;
};

type WeeklyReview = {''',
    "TrainingArchiveWeek type"
)


# 2. Archive state
page_text = replace_once(
    page_text,
    '''  const [planHistory, setPlanHistory] = useState<TrainingPlan[]>([]);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);''',
    '''  const [planHistory, setPlanHistory] = useState<TrainingPlan[]>([]);
  const [trainingArchive, setTrainingArchive] =
    useState<TrainingArchiveWeek[]>([]);

  const [weeklyReview, setWeeklyReview] =
    useState<WeeklyReview | null>(null);''',
    "trainingArchive state"
)


# 3. Restore key from localStorage
page_text = replace_once(
    page_text,
    '''          const savedPlanHistory =
            localStorage.getItem("tricoach-plan-history");
          const savedWeeklyReview =
            localStorage.getItem("tricoach-weekly-review");''',
    '''          const savedPlanHistory =
            localStorage.getItem("tricoach-plan-history");
          const savedTrainingArchive =
            localStorage.getItem("tricoach-training-archive");
          const savedWeeklyReview =
            localStorage.getItem("tricoach-weekly-review");''',
    "archive local restore key"
)


page_text = replace_once(
    page_text,
    '''          if (savedPlanHistory) {
            setPlanHistory(JSON.parse(savedPlanHistory));
          }

          if (savedWeeklyReview) {''',
    '''          if (savedPlanHistory) {
            setPlanHistory(JSON.parse(savedPlanHistory));
          }

          if (savedTrainingArchive) {
            setTrainingArchive(
              JSON.parse(savedTrainingArchive)
            );
          }

          if (savedWeeklyReview) {''',
    "archive local restore"
)


# 4. Restore archive from Supabase
page_text = replace_once(
    page_text,
    '''          if (trainingData?.plan_history) {
            setPlanHistory(trainingData.plan_history);
          }

          if (trainingData?.weekly_review) {''',
    '''          if (trainingData?.plan_history) {
            setPlanHistory(trainingData.plan_history);
          }

          if (trainingData?.training_archive) {
            setTrainingArchive(
              trainingData.training_archive
            );
          }

          if (trainingData?.weekly_review) {''',
    "archive database restore"
)


# 5. Persist archive to localStorage
marker = '''  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-plan-history",
      JSON.stringify(planHistory)
    );
  }, [planHistory, hasRestoredData]);
'''

archive_storage = marker + '''
  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-training-archive",
      JSON.stringify(trainingArchive)
    );
  }, [trainingArchive, hasRestoredData]);
'''

if marker not in page_text:
    raise SystemExit("STOPP: Fant ikke planHistory persistence")

page_text = page_text.replace(
    marker,
    archive_storage,
    1
)


# 6. Persist archive to Supabase
page_text = replace_once(
    page_text,
    '''            plan_history: planHistory,
            weekly_review: weeklyReview,''',
    '''            plan_history: planHistory,
            training_archive: trainingArchive,
            weekly_review: weeklyReview,''',
    "archive Supabase persistence"
)


page_text = replace_once(
    page_text,
    '''    planHistory,
    weeklyReview,
    hasRestoredData,''',
    '''    planHistory,
    trainingArchive,
    weeklyReview,
    hasRestoredData,''',
    "archive persistence dependency"
)


# 7. Send multi-week archive to coach
page_text = replace_once(
    page_text,
    '''          trainingPlan,
          workoutHistory,
          history: oldChat,''',
    '''          trainingPlan,
          workoutHistory,
          trainingArchive,
          history: oldChat,''',
    "archive to coach"
)


# 8. Send archive to next-week engine
page_text = replace_once(
    page_text,
    '''            workoutHistory,
            planHistory,
          }),''',
    '''            workoutHistory,
            planHistory,
            trainingArchive,
          }),''',
    "archive to next-week"
)


# 9. Archive current completed week before clearing feedback
page_text = replace_once(
    page_text,
    '''      setPlanHistory((current) => [
        ...current,
        trainingPlan,
      ]);

      setWeeklyReview(data.review);
''',
    '''      setPlanHistory((current) => [
        ...current,
        trainingPlan,
      ]);

      setTrainingArchive((current) => [
        ...current,
        {
          plan: trainingPlan,
          feedback: workoutHistory,
          review: data.review,
          archivedAt: new Date().toISOString(),
        },
      ]);

      setWeeklyReview(data.review);
''',
    "archive completed week"
)


# =========================================================
# SHARED BACKEND HELPERS
# =========================================================

helper_code = r'''
type ArchiveWeek = {
  plan?: {
    totalHours?: number;
  };
  feedback?: Array<{
    status?: string;
    rpe?: number | null;
    feeling?: string | null;
    actualDurationMinutes?: number | null;
    plannedDurationMinutes?: number | null;
  }>;
};

function weeksUntilRace(raceDate?: string) {
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

function getTrainingPhase(raceDate?: string) {
  const weeks = weeksUntilRace(raceDate);

  if (weeks === null) return "Base";
  if (weeks <= 2) return "Taper";
  if (weeks <= 4) return "Peak";
  if (weeks <= 12) return "Build";

  return "Base";
}

function summarizeTrainingTrend(
  trainingArchive: ArchiveWeek[] = [],
  currentFeedback: ArchiveWeek["feedback"] = []
) {
  const recentWeeks = trainingArchive.slice(-3);

  const feedback = [
    ...recentWeeks.flatMap(
      (week) => week.feedback ?? []
    ),
    ...(currentFeedback ?? []),
  ];

  const completed = feedback.filter(
    (item) =>
      item.status === "Completed" ||
      item.status === "Modified"
  );

  const skipped = feedback.filter(
    (item) => item.status === "Skipped"
  );

  const rpes = completed
    .map((item) => item.rpe)
    .filter(
      (value): value is number =>
        typeof value === "number"
    );

  const averageRpe =
    rpes.length > 0
      ? rpes.reduce((a, b) => a + b, 0) /
        rpes.length
      : null;

  const heavySessions = completed.filter(
    (item) =>
      (item.rpe ?? 0) >= 8 ||
      item.feeling === "Heavy"
  ).length;

  const plannedMinutes = feedback.reduce(
    (sum, item) =>
      sum + (item.plannedDurationMinutes ?? 0),
    0
  );

  const actualMinutes = feedback.reduce(
    (sum, item) =>
      sum + (item.actualDurationMinutes ?? 0),
    0
  );

  const completionRate =
    plannedMinutes > 0
      ? actualMinutes / plannedMinutes
      : null;

  return {
    weeksAnalyzed: recentWeeks.length,
    sessionsAnalyzed: feedback.length,
    completedSessions: completed.length,
    skippedSessions: skipped.length,
    averageRpe:
      averageRpe === null
        ? null
        : Number(averageRpe.toFixed(1)),
    heavySessions,
    completionRate:
      completionRate === null
        ? null
        : Number(
            (completionRate * 100).toFixed(0)
          ),
  };
}
'''


def add_helpers(text, label):
    marker = '''const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
'''

    if marker not in text:
        raise SystemExit(
            f"STOPP: Fant ikke OpenAI client i {label}"
        )

    return text.replace(
        marker,
        marker + helper_code,
        1
    )


coach_text = add_helpers(coach_text, "coach")
next_text = add_helpers(next_text, "next-week")


# =========================================================
# COACH — MULTI-WEEK MEMORY + PHASE
# =========================================================

coach_text = replace_once(
    coach_text,
    '''      trainingPlan,
      workoutHistory = [],
      history = [],''',
    '''      trainingPlan,
      workoutHistory = [],
      trainingArchive = [],
      history = [],''',
    "coach archive request"
)


# Insert phase/trend calculation
marker = '''    if (!message) {
'''

coach_context = '''    const trainingPhase =
      getTrainingPhase(athlete?.raceDate);

    const weeksRemaining =
      weeksUntilRace(athlete?.raceDate);

    const trainingTrend =
      summarizeTrainingTrend(
        trainingArchive,
        workoutHistory
      );

'''

if marker not in coach_text:
    raise SystemExit(
        "STOPP: Fant ikke coach message validation"
    )

coach_text = coach_text.replace(
    marker,
    coach_context + marker,
    1
)


coach_text = replace_once(
    coach_text,
    '''RECENT WORKOUT FEEDBACK:
${workoutHistory?.length
  ? JSON.stringify(workoutHistory.slice(-14), null, 2)
  : "No workout feedback has been logged yet."}
''',
    '''CURRENT TRAINING PHASE:
${trainingPhase}

WEEKS TO RACE:
${weeksRemaining ?? "Unknown"}

MULTI-WEEK TRAINING TREND:
${JSON.stringify(trainingTrend, null, 2)}

PREVIOUS TRAINING WEEKS:
${trainingArchive?.length
  ? JSON.stringify(
      trainingArchive.slice(-3),
      null,
      2
    )
  : "No archived training weeks yet."}

RECENT WORKOUT FEEDBACK:
${workoutHistory?.length
  ? JSON.stringify(workoutHistory.slice(-14), null, 2)
  : "No workout feedback has been logged yet."}
''',
    "coach multi-week context"
)


coach_text = replace_once(
    coach_text,
    '''COACHING PRINCIPLES:
''',
    '''PHASE PRINCIPLES:

BASE:
- Build consistency and general aerobic capacity.
- Improve technique, especially in weak disciplines.
- Keep intensity conservative.

BUILD:
- Increase race-relevant endurance gradually.
- Add controlled quality without sacrificing consistency.
- Avoid aggressive volume jumps.

PEAK:
- Prioritize race-specific sessions and quality.
- Do not chase large fitness gains with excessive volume.
- Protect recovery between key sessions.

TAPER:
- Reduce fatigue while preserving race readiness.
- Lower volume.
- Keep small amounts of controlled intensity.
- Do not add last-minute fitness-chasing sessions.

MULTI-WEEK DECISION RULES:
- Look for trends, not one unusual workout.
- Repeated high RPE or heavy feedback is a reason for caution.
- Low completion means do not automatically increase load.
- Strong completion does not automatically require more volume.
- Never increase training simply because the athlete has unused available hours.
- Prefer sustainable progression over maximal progression.

COACHING PRINCIPLES:
''',
    "coach phase rules"
)


# =========================================================
# NEXT-WEEK — PHASE + TREND
# =========================================================

next_text = replace_once(
    next_text,
    '''      workoutHistory = [],
      planHistory = [],
    } = body;''',
    '''      workoutHistory = [],
      planHistory = [],
      trainingArchive = [],
    } = body;''',
    "next-week archive request"
)


marker = '''    if (!athlete || !currentPlan) {
'''

next_context = '''    const trainingPhase =
      getTrainingPhase(athlete?.raceDate);

    const weeksRemaining =
      weeksUntilRace(athlete?.raceDate);

    const trainingTrend =
      summarizeTrainingTrend(
        trainingArchive,
        workoutHistory
      );

'''

if marker not in next_text:
    raise SystemExit(
        "STOPP: Fant ikke next-week validation"
    )

next_text = next_text.replace(
    marker,
    next_context + marker,
    1
)


next_text = replace_once(
    next_text,
    '''OLDER PLAN HISTORY:
${JSON.stringify(
  planHistory.slice(-3),
  null,
  2
)}

YOUR JOB:
''',
    '''OLDER PLAN HISTORY:
${JSON.stringify(
  planHistory.slice(-3),
  null,
  2
)}

CURRENT TRAINING PHASE:
${trainingPhase}

WEEKS UNTIL RACE:
${weeksRemaining ?? "Unknown"}

MULTI-WEEK TRAINING TREND:
${JSON.stringify(
  trainingTrend,
  null,
  2
)}

ARCHIVED TRAINING WEEKS:
${JSON.stringify(
  trainingArchive.slice(-3),
  null,
  2
)}

YOUR JOB:
''',
    "next-week phase context"
)


next_text = replace_once(
    next_text,
    '''TRAINING PRINCIPLES:

- Consistency matters more than isolated heroic workouts.''',
    '''TRAINING PHASE LOGIC:

BASE:
- Emphasize aerobic consistency and technical development.
- Build durability gradually.
- Keep intensity limited and purposeful.

BUILD:
- Progress race-specific endurance.
- Introduce controlled quality.
- Maintain enough recovery to absorb training.

PEAK:
- Prioritize race-specific key sessions.
- Avoid large volume increases.
- Fitness should be expressed, not forced.

TAPER:
- Reduce overall volume and fatigue.
- Preserve some short controlled intensity.
- Arrive fresh rather than chasing fitness.

TREND RULES:

- Use the multi-week trend before changing load.
- If completion has been poor, do not reward that with more volume.
- If several recent sessions are RPE 8+ or Heavy, be cautious.
- A single hard day should not trigger a full deload.
- Several weeks of stable completion and manageable RPE may justify a small progression.
- Never increase volume aggressively.
- Do not exceed the athlete's realistic time availability.
- Do not let phase progression override recovery signals.

TRAINING PRINCIPLES:

- Consistency matters more than isolated heroic workouts.''',
    "next-week phase rules"
)


# =========================================================
# WRITE
# =========================================================

page.write_text(page_text)
coach.write_text(coach_text)
next_week.write_text(next_text)

print("✅ TriCoach v0.12 patch ferdig!")
print("")
print("Nytt:")
print("- Multi-week training archive")
print("- Faktisk feedback beholdes mellom uker")
print("- Coach ser siste 3 treningsuker")
print("- Completion / RPE / heavy-session trend")
print("- Base / Build / Peak / Taper")
print("- Weeks-to-race context")
print("- Next-week engine bruker treningsfase")
print("- Coach bruker treningsfase")
print("- Konservativ progresjonslogikk")
print("- Backup laget automatisk")
print("")
print("VIKTIG: Supabase trenger én ny kolonne før appen startes.")
