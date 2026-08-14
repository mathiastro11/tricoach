from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")
plan_route = Path("app/api/plan/route.ts")
coach_route = Path("app/api/coach/route.ts")
next_week_route = Path("app/api/next-week/route.ts")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

for file in [page, plan_route, coach_route, next_week_route]:
    if file.exists():
        shutil.copy(
            file,
            file.with_name(
                file.stem + f".v08-backup-{stamp}" + file.suffix
            )
        )

page_text = page.read_text()
plan_text = plan_route.read_text()
coach_text = coach_route.read_text()
next_text = next_week_route.read_text()


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"STOPP: Fant ikke delen for {label}")
    return text.replace(old, new, 1)


# =========================================================
# 1. UTVID ATHLETE-TYPEN
# =========================================================

page_text = replace_once(
    page_text,
    '''type Athlete = {
  name: string;
  goal: Goal;
  raceDate: string;
  hoursPerWeek: string;
  weakestDiscipline: Discipline;
};''',
    '''type Athlete = {
  name: string;
  goal: Goal;
  raceDate: string;
  hoursPerWeek: string;
  weakestDiscipline: Discipline;

  experience: "Beginner" | "Intermediate" | "Experienced";
  currentTrainingHours: string;

  swimLevel: "Beginner" | "Developing" | "Confident";
  bikeLevel: "Beginner" | "Developing" | "Confident";
  runLevel: "Beginner" | "Developing" | "Confident";

  availableDays: string[];
  longestSessionMinutes: string;

  poolAccess: boolean;
  indoorTrainer: boolean;
  gymAccess: boolean;

  limitations: string;
};''',
    "Athlete type"
)


# =========================================================
# 2. DEFAULT ATHLETE STATE
# =========================================================

page_text = replace_once(
    page_text,
    '''    hoursPerWeek: "8",
    weakestDiscipline: "Swimming",
  });''',
    '''    hoursPerWeek: "8",
    weakestDiscipline: "Swimming",

    experience: "Beginner",
    currentTrainingHours: "5",

    swimLevel: "Beginner",
    bikeLevel: "Developing",
    runLevel: "Developing",

    availableDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],

    longestSessionMinutes: "150",

    poolAccess: true,
    indoorTrainer: false,
    gymAccess: false,

    limitations: "",
  });''',
    "default athlete"
)


# =========================================================
# 3. HJELPEFUNKSJON FOR DAGER
# =========================================================

marker = '''  const onboarding = [
'''

helper = '''  function toggleAvailableDay(day: string) {
    setAthlete((current) => {
      const exists = current.availableDays.includes(day);

      return {
        ...current,
        availableDays: exists
          ? current.availableDays.filter((d) => d !== day)
          : [...current.availableDays, day],
      };
    });
  }

'''

if marker not in page_text:
    raise SystemExit("STOPP: Fant ikke onboarding")

page_text = page_text.replace(marker, helper + marker, 1)


# =========================================================
# 4. LEGG TIL FLERE ONBOARDING-STEG
# =========================================================

old_last_step = '''    {
      eyebrow: "Priority",

      title: "Which discipline needs the most work?",

      content: (
        <div className="choiceGrid three">
          {(["Swimming", "Cycling", "Running"] as Discipline[]).map(
            (discipline) => (
              <button
                key={discipline}
                className={
                  athlete.weakestDiscipline === discipline
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  setAthlete({
                    ...athlete,
                    weakestDiscipline: discipline,
                  })
                }
              >
                <strong>{discipline}</strong>
              </button>
            )
          )}
        </div>
      ),
    },
  ];'''

new_steps = '''    {
      eyebrow: "Priority",

      title: "Which discipline needs the most work?",

      content: (
        <div className="choiceGrid three">
          {(["Swimming", "Cycling", "Running"] as Discipline[]).map(
            (discipline) => (
              <button
                key={discipline}
                className={
                  athlete.weakestDiscipline === discipline
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  setAthlete({
                    ...athlete,
                    weakestDiscipline: discipline,
                  })
                }
              >
                <strong>{discipline}</strong>
              </button>
            )
          )}
        </div>
      ),
    },

    {
      eyebrow: "Experience",
      title: "How experienced are you with triathlon?",
      content: (
        <div className="choiceGrid three">
          {(["Beginner", "Intermediate", "Experienced"] as const).map(
            (value) => (
              <button
                key={value}
                className={
                  athlete.experience === value
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  setAthlete({
                    ...athlete,
                    experience: value,
                  })
                }
              >
                <strong>{value}</strong>
              </button>
            )
          )}
        </div>
      ),
    },

    {
      eyebrow: "Current training",
      title: "How much are you training right now?",
      content: (
        <div className="sliderWrap">
          <div className="bigNumber">
            {athlete.currentTrainingHours} h
          </div>

          <input
            type="range"
            min="0"
            max="14"
            value={athlete.currentTrainingHours}
            onChange={(e) =>
              setAthlete({
                ...athlete,
                currentTrainingHours: e.target.value,
              })
            }
          />

          <p>Average training hours in a normal current week.</p>
        </div>
      ),
    },

    {
      eyebrow: "Discipline level",
      title: "How would you rate your current level?",
      content: (
        <div>
          {[
            ["Swimming", "swimLevel"],
            ["Cycling", "bikeLevel"],
            ["Running", "runLevel"],
          ].map(([label, key]) => (
            <div key={key} style={{ marginBottom: "1.4rem" }}>
              <div
                style={{
                  fontWeight: 900,
                  marginBottom: ".6rem",
                }}
              >
                {label}
              </div>

              <div className="choiceGrid three">
                {(["Beginner", "Developing", "Confident"] as const).map(
                  (value) => (
                    <button
                      key={value}
                      className={
                        athlete[key as "swimLevel" | "bikeLevel" | "runLevel"] === value
                          ? "choice selected"
                          : "choice"
                      }
                      onClick={() =>
                        setAthlete({
                          ...athlete,
                          [key]: value,
                        })
                      }
                    >
                      <strong>{value}</strong>
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },

    {
      eyebrow: "Schedule",
      title: "Which days can you usually train?",
      content: (
        <div className="choiceGrid">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <button
              key={day}
              className={
                athlete.availableDays.includes(day)
                  ? "choice selected"
                  : "choice"
              }
              onClick={() => toggleAvailableDay(day)}
            >
              <strong>{day}</strong>
            </button>
          ))}
        </div>
      ),
    },

    {
      eyebrow: "Long sessions",
      title: "What is the longest session you can usually fit in?",
      content: (
        <div className="sliderWrap">
          <div className="bigNumber">
            {athlete.longestSessionMinutes} min
          </div>

          <input
            type="range"
            min="45"
            max="300"
            step="15"
            value={athlete.longestSessionMinutes}
            onChange={(e) =>
              setAthlete({
                ...athlete,
                longestSessionMinutes: e.target.value,
              })
            }
          />
        </div>
      ),
    },

    {
      eyebrow: "Equipment",
      title: "What do you have access to?",
      content: (
        <div className="choiceGrid three">
          {[
            ["Pool", "poolAccess"],
            ["Indoor trainer", "indoorTrainer"],
            ["Gym", "gymAccess"],
          ].map(([label, key]) => (
            <button
              key={key}
              className={
                athlete[key as "poolAccess" | "indoorTrainer" | "gymAccess"]
                  ? "choice selected"
                  : "choice"
              }
              onClick={() =>
                setAthlete({
                  ...athlete,
                  [key]:
                    !athlete[
                      key as "poolAccess" | "indoorTrainer" | "gymAccess"
                    ],
                })
              }
            >
              <strong>{label}</strong>
            </button>
          ))}
        </div>
      ),
    },

    {
      eyebrow: "Limitations",
      title: "Anything your coach should know?",
      content: (
        <textarea
          className="field"
          style={{
            minHeight: "140px",
            resize: "vertical",
          }}
          value={athlete.limitations}
          placeholder="Example: knee issues, cannot train mornings, nervous in open water..."
          onChange={(e) =>
            setAthlete({
              ...athlete,
              limitations: e.target.value,
            })
          }
        />
      ),
    },
  ];'''

page_text = replace_once(
    page_text,
    old_last_step,
    new_steps,
    "expanded onboarding"
)


# =========================================================
# 5. SUPABASE PROFILE RESTORE
# =========================================================

page_text = replace_once(
    page_text,
    '''              weakestDiscipline:
                profileData.weakest_discipline ?? "Swimming",
            });''',
    '''              weakestDiscipline:
                profileData.weakest_discipline ?? "Swimming",

              experience:
                profileData.experience ?? "Beginner",

              currentTrainingHours:
                profileData.current_training_hours?.toString() ?? "5",

              swimLevel:
                profileData.swim_level ?? "Beginner",

              bikeLevel:
                profileData.bike_level ?? "Developing",

              runLevel:
                profileData.run_level ?? "Developing",

              availableDays:
                profileData.available_days ?? [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],

              longestSessionMinutes:
                profileData.longest_session_minutes?.toString() ?? "150",

              poolAccess:
                profileData.pool_access ?? true,

              indoorTrainer:
                profileData.indoor_trainer ?? false,

              gymAccess:
                profileData.gym_access ?? false,

              limitations:
                profileData.limitations ?? "",
            });''',
    "restore expanded profile"
)


# =========================================================
# 6. SUPABASE PROFILE SAVE
# =========================================================

page_text = replace_once(
    page_text,
    '''            weakest_discipline: athlete.weakestDiscipline,
            updated_at: new Date().toISOString(),''',
    '''            weakest_discipline: athlete.weakestDiscipline,

            experience: athlete.experience,
            current_training_hours:
              Number(athlete.currentTrainingHours),

            swim_level: athlete.swimLevel,
            bike_level: athlete.bikeLevel,
            run_level: athlete.runLevel,

            available_days: athlete.availableDays,

            longest_session_minutes:
              Number(athlete.longestSessionMinutes),

            pool_access: athlete.poolAccess,
            indoor_trainer: athlete.indoorTrainer,
            gym_access: athlete.gymAccess,

            limitations: athlete.limitations,

            updated_at: new Date().toISOString(),''',
    "save expanded profile"
)


# =========================================================
# 7. PLAN MOTOR
# =========================================================

plan_text = replace_once(
    plan_text,
    '''Weakest discipline: ${athlete.weakestDiscipline || "Unknown"}''',
    '''Weakest discipline: ${athlete.weakestDiscipline || "Unknown"}

Triathlon experience: ${athlete.experience || "Unknown"}
Current training volume: ${athlete.currentTrainingHours || "Unknown"} hours/week

Swim level: ${athlete.swimLevel || "Unknown"}
Bike level: ${athlete.bikeLevel || "Unknown"}
Run level: ${athlete.runLevel || "Unknown"}

Available training days:
${JSON.stringify(athlete.availableDays || [])}

Longest realistic session:
${athlete.longestSessionMinutes || "Unknown"} minutes

Equipment:
Pool access: ${athlete.poolAccess ? "Yes" : "No"}
Indoor trainer: ${athlete.indoorTrainer ? "Yes" : "No"}
Gym access: ${athlete.gymAccess ? "Yes" : "No"}

Athlete limitations / notes:
${athlete.limitations || "None supplied"}''',
    "plan athlete context"
)


plan_text = replace_once(
    plan_text,
    '''- Balance swim, bike, run and recovery.''',
    '''- Balance swim, bike, run and recovery.
- Respect the athlete's available training days.
- Do not schedule pool swimming if the athlete has no pool access.
- Respect the athlete's longest realistic session duration.
- Consider current training volume when setting first-week volume.
- Do not jump aggressively from current weekly training volume to target availability.
- Use the athlete's discipline levels when selecting session complexity.
- Treat limitations and athlete notes as meaningful constraints.''',
    "plan rules"
)


# =========================================================
# 8. COACH CONTEXT
# =========================================================

coach_text = replace_once(
    coach_text,
    '''Weakest discipline: ${athlete?.weakestDiscipline || "Unknown"}''',
    '''Weakest discipline: ${athlete?.weakestDiscipline || "Unknown"}

Triathlon experience: ${athlete?.experience || "Unknown"}
Current weekly training: ${athlete?.currentTrainingHours || "Unknown"} hours

Swim level: ${athlete?.swimLevel || "Unknown"}
Bike level: ${athlete?.bikeLevel || "Unknown"}
Run level: ${athlete?.runLevel || "Unknown"}

Available training days:
${JSON.stringify(athlete?.availableDays || [])}

Longest realistic session:
${athlete?.longestSessionMinutes || "Unknown"} minutes

Equipment:
Pool access: ${athlete?.poolAccess ? "Yes" : "No"}
Indoor trainer: ${athlete?.indoorTrainer ? "Yes" : "No"}
Gym access: ${athlete?.gymAccess ? "Yes" : "No"}

Limitations / athlete notes:
${athlete?.limitations || "None supplied"}''',
    "coach athlete context"
)


# =========================================================
# 9. NEXT WEEK MOTOR
# =========================================================

next_text = replace_once(
    next_text,
    '''ATHLETE:
${JSON.stringify(athlete, null, 2)}''',
    '''ATHLETE:
${JSON.stringify(athlete, null, 2)}

Treat the athlete profile as hard context:
- respect available training days
- respect maximum realistic session length
- use current discipline levels
- respect equipment access
- respect athlete limitations
- do not increase volume aggressively beyond recent training tolerance''',
    "next week profile rules"
)


# =========================================================
# WRITE FILES
# =========================================================

page.write_text(page_text)
plan_route.write_text(plan_text)
coach_route.write_text(coach_text)
next_week_route.write_text(next_text)

print("✅ TriCoach v0.9 code patch ferdig!")
print("")
print("Onboarding now includes:")
print("- Triathlon experience")
print("- Current training volume")
print("- Swim / bike / run level")
print("- Available training days")
print("- Longest realistic session")
print("- Pool / trainer / gym access")
print("- Athlete limitations")
print("")
print("Plan engine, coach and next-week engine now use the expanded profile.")
print("")
print("VIKTIG: Database columns must be added next.")
