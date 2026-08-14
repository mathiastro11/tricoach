from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")
coach = Path("app/api/coach/route.ts")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

shutil.copy(page, f"app/page.v03-backup-{stamp}.tsx")
shutil.copy(coach, f"app/api/coach/route.v03-backup-{stamp}.ts")

page_text = page.read_text()
coach_text = coach.read_text()


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"STOPP: Fant ikke delen for {label}")
    return text.replace(old, new, 1)


# --------------------------------------------------
# FRONTEND
# --------------------------------------------------

# 1. useEffect
page_text = replace_once(
    page_text,
    '''import { useMemo, useState } from "react";''',
    '''import { useEffect, useMemo, useState } from "react";''',
    "useEffect import"
)


# 2. legg til restored-state
page_text = replace_once(
    page_text,
    '''  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
''',
    '''  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [hasRestoredData, setHasRestoredData] = useState(false);
''',
    "restore state"
)


# 3. legg inn localStorage-logikk før today
marker = '''  const today = useMemo(() => {
'''

storage_logic = '''  useEffect(() => {
    try {
      const savedAthlete = localStorage.getItem("tricoach-athlete");
      const savedPlan = localStorage.getItem("tricoach-plan");

      if (savedAthlete) {
        setAthlete(JSON.parse(savedAthlete));
      }

      if (savedPlan) {
        setTrainingPlan(JSON.parse(savedPlan));
        setScreen("dashboard");
      }
    } catch (error) {
      console.error("Could not restore TriCoach data:", error);
    } finally {
      setHasRestoredData(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-athlete",
      JSON.stringify(athlete)
    );
  }, [athlete, hasRestoredData]);

  useEffect(() => {
    if (!hasRestoredData) return;

    if (trainingPlan) {
      localStorage.setItem(
        "tricoach-plan",
        JSON.stringify(trainingPlan)
      );
    }
  }, [trainingPlan, hasRestoredData]);

'''

if marker not in page_text:
    raise SystemExit("STOPP: Fant ikke today-markøren")

page_text = page_text.replace(
    marker,
    storage_logic + marker,
    1
)


# 4. send treningsplanen med til coachen
page_text = replace_once(
    page_text,
    '''          message: content,
          athlete,
          history: oldChat,
''',
    '''          message: content,
          athlete,
          trainingPlan,
          history: oldChat,
''',
    "trainingPlan til coach"
)


# --------------------------------------------------
# COACH API
# --------------------------------------------------

# 5. hent trainingPlan + history
coach_text = replace_once(
    coach_text,
    '''    const body = await request.json();
    const { message, athlete } = body;
''',
    '''    const body = await request.json();
    const {
      message,
      athlete,
      trainingPlan,
      history = [],
    } = body;
''',
    "coach request body"
)


# 6. legg faktisk ukeplan inn i coachens kontekst
coach_text = replace_once(
    coach_text,
    '''Weakest discipline: ${athlete?.weakestDiscipline || "Unknown"}

COACHING PRINCIPLES:
''',
    '''Weakest discipline: ${athlete?.weakestDiscipline || "Unknown"}

CURRENT TRAINING PLAN:
${trainingPlan
  ? JSON.stringify(trainingPlan, null, 2)
  : "No active training plan available."}

When the athlete asks about changing, missing, moving, shortening,
or replacing a workout, use the CURRENT TRAINING PLAN above.

Be concrete:
- refer to the actual day and workout
- consider what comes before and after it
- protect important recovery
- do not stack hard sessions
- explain what you would change and why

COACHING PRINCIPLES:
''',
    "training plan context"
)


# 7. gi coachen samtalehistorikk
coach_text = replace_once(
    coach_text,
    '''      input: message,
''',
    '''      input: [
        ...history.slice(-10).map(
          (item: { role: string; text: string }) => ({
            role:
              item.role === "coach"
                ? "assistant" as const
                : "user" as const,
            content: item.text,
          })
        ),
        {
          role: "user",
          content: message,
        },
      ],
''',
    "chat history"
)


page.write_text(page_text)
coach.write_text(coach_text)

print("✅ TriCoach v0.4 patch ferdig!")
print("")
print("Nytt:")
print("- Athlete profile lagres lokalt")
print("- Treningsplan lagres lokalt")
print("- Refresh beholder planen")
print("- Coach ser den ekte ukeplanen")
print("- Coach ser nylig samtalehistorikk")
print("- Backup ble laget automatisk")
