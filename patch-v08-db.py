from pathlib import Path
from datetime import datetime
import shutil

page = Path("app/page.tsx")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
shutil.copy(page, f"app/page.v08-pre-db-backup-{stamp}.tsx")

text = page.read_text()

def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f"STOPP: Fant ikke delen for {label}")
    text = text.replace(old, new, 1)

# 1. Import Supabase client
replace_once(
'''import { useEffect, useMemo, useState } from "react";''',
'''import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";''',
"supabase import"
)

# 2. Add auth/db state
replace_once(
'''  const [isNextWeekLoading, setIsNextWeekLoading] = useState(false);
''',
'''  const [isNextWeekLoading, setIsNextWeekLoading] = useState(false);

  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [dbReady, setDbReady] = useState(false);
''',
"db state"
)

# 3. Replace first restore useEffect with hybrid Supabase + localStorage restore
old_restore_start = '''  useEffect(() => {
    try {
      const savedAthlete = localStorage.getItem("tricoach-athlete");
      const savedPlan = localStorage.getItem("tricoach-plan");
      const savedHistory = localStorage.getItem("tricoach-workout-history");
      const savedPlanHistory = localStorage.getItem("tricoach-plan-history");
      const savedWeeklyReview = localStorage.getItem("tricoach-weekly-review");

      if (savedAthlete) {
        setAthlete(JSON.parse(savedAthlete));
      }

      if (savedPlan) {
        setTrainingPlan(JSON.parse(savedPlan));
        setScreen("dashboard");
      }

      if (savedHistory) {
        setWorkoutHistory(JSON.parse(savedHistory));
      }

      if (savedPlanHistory) {
        setPlanHistory(JSON.parse(savedPlanHistory));
      }

      if (savedWeeklyReview) {
        setWeeklyReview(JSON.parse(savedWeeklyReview));
      }
    } catch (error) {
      console.error("Could not restore TriCoach data:", error);
    } finally {
      setHasRestoredData(true);
    }
  }, []);
'''

new_restore = '''  useEffect(() => {
    async function restoreTriCoach() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Could not verify Supabase user:", userError);
        }

        if (user) {
          setUserId(user.id);

          const { data: profileData, error: profileError } =
            await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();

          if (profileError) {
            console.error("Could not load profile:", profileError);
          }

          const { data: trainingData, error: trainingError } =
            await supabase
              .from("training_state")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();

          if (trainingError) {
            console.error("Could not load training state:", trainingError);
          }

          if (profileData) {
            setAthlete({
              name: profileData.name ?? "",
              goal: profileData.goal ?? "70.3",
              raceDate: profileData.race_date ?? "",
              hoursPerWeek:
                profileData.hours_per_week?.toString() ?? "8",
              weakestDiscipline:
                profileData.weakest_discipline ?? "Swimming",
            });
          }

          if (trainingData?.active_plan) {
            setTrainingPlan(trainingData.active_plan);
            setScreen("dashboard");
          }

          if (trainingData?.workout_history) {
            setWorkoutHistory(trainingData.workout_history);
          }

          if (trainingData?.plan_history) {
            setPlanHistory(trainingData.plan_history);
          }

          if (trainingData?.weekly_review) {
            setWeeklyReview(trainingData.weekly_review);
          }

          setDbReady(true);
        } else {
          // Local fallback for current development mode.
          const savedAthlete =
            localStorage.getItem("tricoach-athlete");
          const savedPlan =
            localStorage.getItem("tricoach-plan");
          const savedHistory =
            localStorage.getItem("tricoach-workout-history");
          const savedPlanHistory =
            localStorage.getItem("tricoach-plan-history");
          const savedWeeklyReview =
            localStorage.getItem("tricoach-weekly-review");

          if (savedAthlete) {
            setAthlete(JSON.parse(savedAthlete));
          }

          if (savedPlan) {
            setTrainingPlan(JSON.parse(savedPlan));
            setScreen("dashboard");
          }

          if (savedHistory) {
            setWorkoutHistory(JSON.parse(savedHistory));
          }

          if (savedPlanHistory) {
            setPlanHistory(JSON.parse(savedPlanHistory));
          }

          if (savedWeeklyReview) {
            setWeeklyReview(JSON.parse(savedWeeklyReview));
          }
        }
      } catch (error) {
        console.error("Could not restore TriCoach data:", error);
      } finally {
        setHasRestoredData(true);
      }
    }

    restoreTriCoach();
  }, [supabase]);
'''

replace_once(
    old_restore_start,
    new_restore,
    "restore logic"
)

# 4. Add profile save to Supabase
marker = '''  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-athlete",
      JSON.stringify(athlete)
    );
  }, [athlete, hasRestoredData]);
'''

replacement = '''  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-athlete",
      JSON.stringify(athlete)
    );

    if (userId && dbReady) {
      supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            name: athlete.name,
            goal: athlete.goal,
            race_date: athlete.raceDate || null,
            hours_per_week: Number(athlete.hoursPerWeek),
            weakest_discipline: athlete.weakestDiscipline,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        )
        .then(({ error }) => {
          if (error) {
            console.error("Could not save profile:", error);
          }
        });
    }
  }, [
    athlete,
    hasRestoredData,
    userId,
    dbReady,
    supabase,
  ]);
'''

replace_once(
    marker,
    replacement,
    "profile persistence"
)

# 5. Replace separate training persistence effects with one DB sync effect
marker = '''  useEffect(() => {
    if (!hasRestoredData) return;

    if (trainingPlan) {
      localStorage.setItem(
        "tricoach-plan",
        JSON.stringify(trainingPlan)
      );
    }
  }, [trainingPlan, hasRestoredData]);
'''

replacement = '''  useEffect(() => {
    if (!hasRestoredData) return;

    if (trainingPlan) {
      localStorage.setItem(
        "tricoach-plan",
        JSON.stringify(trainingPlan)
      );
    }

    if (userId && dbReady) {
      supabase
        .from("training_state")
        .upsert(
          {
            user_id: userId,
            active_plan: trainingPlan,
            workout_history: workoutHistory,
            plan_history: planHistory,
            weekly_review: weeklyReview,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        )
        .then(({ error }) => {
          if (error) {
            console.error(
              "Could not save training state:",
              error
            );
          }
        });
    }
  }, [
    trainingPlan,
    workoutHistory,
    planHistory,
    weeklyReview,
    hasRestoredData,
    userId,
    dbReady,
    supabase,
  ]);
'''

replace_once(
    marker,
    replacement,
    "training state persistence"
)

page.write_text(text)

print("✅ TriCoach v0.8 database patch ferdig!")
print("")
print("Nytt:")
print("- Henter innlogget Supabase-bruker")
print("- Laster profil fra profiles")
print("- Laster treningsdata fra training_state")
print("- Lagrer profil med upsert")
print("- Lagrer plan/historikk/review med upsert")
print("- Beholder localStorage som fallback")
print("- Backup laget automatisk")
