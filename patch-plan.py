from pathlib import Path

path = Path("app/page.tsx")
text = path.read_text()

def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f"STOPP: Fant ikke delen for: {label}")
    text = text.replace(old, new, 1)

# 1. Legg til typer for AI-generert treningsplan
replace_once(
'''type ChatMessage = {
  role: "coach" | "user";
  text: string;
};
''',
'''type ChatMessage = {
  role: "coach" | "user";
  text: string;
};

type TrainingPlanDay = {
  day: string;
  sport: string;
  title: string;
  durationMinutes: number;
  intensity: string;
  purpose: string;
  details: string[];
};

type TrainingPlan = {
  summary: string;
  totalHours: number;
  focus: string;
  days: TrainingPlanDay[];
};
''',
"plan-typer"
)

# 2. Legg til state for planen
replace_once(
'''  const [isCoachThinking, setIsCoachThinking] = useState(false);

  const [chat, setChat] = useState<ChatMessage[]>([
''',
'''  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);

  const [chat, setChat] = useState<ChatMessage[]>([
''',
"plan-state"
)

# 3. Gjør dagens økt avhengig av den ekte planen
replace_once(
'''  const today = useMemo(() => {
    const day = new Date().getDay();
    const map = [6, 0, 1, 2, 3, 4, 5];

    return starterWeek[map[day]];
  }, []);
''',
'''  const today = useMemo(() => {
    const day = new Date().getDay();
    const map = [6, 0, 1, 2, 3, 4, 5];
    const index = map[day];

    if (trainingPlan?.days?.length === 7) {
      const workout = trainingPlan.days[index];

      return [
        workout.day.slice(0, 3),
        workout.sport,
        workout.title,
        workout.durationMinutes === 0
          ? "—"
          : `${workout.durationMinutes} min`,
        workout.purpose,
      ];
    }

    return [
      ...starterWeek[index],
      "The goal is to build fitness without compromising the rest of your week.",
    ];
  }, [trainingPlan]);
''',
"dagens-økt"
)

# 4. Legg inn funksjon som henter personlig ukeplan fra API-et
marker = '''  const onboarding = [
'''

generate_plan = '''  async function generatePlan() {
    setIsPlanLoading(true);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          athlete,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Plan generation failed");
      }

      setTrainingPlan(data.plan);
      setScreen("dashboard");
    } catch (error) {
      console.error("Plan generation error:", error);
      alert("TriCoach could not build your week. Please try again.");
    } finally {
      setIsPlanLoading(false);
    }
  }

'''

if marker not in text:
    raise SystemExit("STOPP: Fant ikke onboarding-markøren")

text = text.replace(marker, generate_plan + marker, 1)

# 5. Endre Create my first week-knappen
replace_once(
'''          <button
            className="primary full"
            disabled={
              step === 0 && !athlete.name.trim()
            }
            onClick={() => {
              if (step < onboarding.length - 1) {
                setStep(step + 1);
              } else {
                setScreen("dashboard");
              }
            }}
          >
            {step === onboarding.length - 1
              ? "Create my first week →"
              : "Continue →"}
          </button>
''',
'''          <button
            className="primary full"
            disabled={
              isPlanLoading ||
              (step === 0 && !athlete.name.trim())
            }
            onClick={async () => {
              if (step < onboarding.length - 1) {
                setStep(step + 1);
              } else {
                await generatePlan();
              }
            }}
          >
            {isPlanLoading
              ? "Building your week..."
              : step === onboarding.length - 1
              ? "Create my first week →"
              : "Continue →"}
          </button>
''',
"onboarding-knapp"
)

# 6. Vis formålet fra den ekte AI-planen på Today's workout
replace_once(
'''            <p>
              The goal is to build fitness without
              compromising the rest of your week.
            </p>
''',
'''            <p>
              {today[4]}
            </p>
''',
"dagens-formål"
)

# 7. Vis AI-planens fokus og timeantall
replace_once(
'''            <span>
              {athlete.hoursPerWeek} planned hours
              · focus: {athlete.weakestDiscipline}
            </span>
''',
'''            <span>
              {trainingPlan
                ? `${trainingPlan.totalHours} planned hours · focus: ${trainingPlan.focus}`
                : `${athlete.hoursPerWeek} planned hours · focus: ${athlete.weakestDiscipline}`}
            </span>
''',
"ukeoppsummering"
)

# 8. Bytt eksempeluken med AI-generert uke
replace_once(
'''          <div className="weekGrid">
            {starterWeek.map((workout) => (
              <div
                className="dayCard"
                key={workout[0]}
              >
                <div className="dayTop">
                  <strong>{workout[0]}</strong>
                  <span>{workout[1]}</span>
                </div>

                <h3>{workout[2]}</h3>
                <p>{workout[3]}</p>
              </div>
            ))}
          </div>
''',
'''          <div className="weekGrid">
            {(trainingPlan?.days ?? []).map((workout) => (
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
            ))}
          </div>
''',
"ukeplan"
)

path.write_text(text)

print("✅ TriCoach v0.3 patch ferdig!")
print("AI-planen er nå koblet til Create my first week.")
