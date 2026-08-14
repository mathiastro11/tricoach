"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type Goal = "Sprint" | "Olympic" | "70.3" | "Ironman";
type Discipline = "Swimming" | "Cycling" | "Running";

type Athlete = {
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
};

type ChatMessage = {
  role: "coach" | "user";
  text: string;
};

type TrainingPlanDay = {
  day: string;
  date?: string;
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
  weekNumber?: number;
  weekStart?: string;
  days: TrainingPlanDay[];
};

type WorkoutFeedback = {
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

const starterWeek = [
  ["Mon", "Rest", "Recovery day", "—"],
  ["Tue", "Run", "Aerobic run + strides", "45 min"],
  ["Wed", "Swim", "Technique + aerobic swim", "45 min"],
  ["Thu", "Bike", "Endurance ride", "60 min"],
  ["Fri", "Strength", "Simple full-body strength", "35 min"],
  ["Sat", "Bike", "Long ride + short brick", "2 h"],
  ["Sun", "Run", "Easy long run", "70 min"],
];

const quickReplies = [
  "I only have 30 minutes today",
  "I slept badly last night",
  "I missed yesterday's workout",
];

function toISODate(date: Date) {
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

export default function Home() {
  const [screen, setScreen] =
    useState<"home" | "onboarding" | "dashboard">("home");

  const [step, setStep] = useState(0);

  const [athlete, setAthlete] = useState<Athlete>({
    name: "",
    goal: "70.3",
    raceDate: "",
    hoursPerWeek: "8",
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
  });

  const [message, setMessage] = useState("");
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [hasRestoredData, setHasRestoredData] = useState(false);

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutFeedback[]>([]);
  const [planHistory, setPlanHistory] = useState<TrainingPlan[]>([]);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [isNextWeekLoading, setIsNextWeekLoading] = useState(false);

  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [dbReady, setDbReady] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackStatus, setFeedbackStatus] =
    useState<"Completed" | "Skipped" | "Modified">("Completed");
  const [feedbackRpe, setFeedbackRpe] = useState(5);
  const [feedbackFeeling, setFeedbackFeeling] =
    useState<"Great" | "Normal" | "Heavy">("Normal");
  const [feedbackComment, setFeedbackComment] = useState("");

  const [selectedWorkout, setSelectedWorkout] =
    useState<TrainingPlanDay | null>(null);

  const [feedbackWorkout, setFeedbackWorkout] =
    useState<TrainingPlanDay | null>(null);

  const [actualDurationMinutes, setActualDurationMinutes] =
    useState("");

  const [actualDistance, setActualDistance] =
    useState("");

  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "coach",
      text:
        "Tell me what real life threw at you today. I’ll adapt the training without losing sight of the goal.",
    },
  ]);

  useEffect(() => {
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
          setUserEmail(user.email ?? "");

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
            });
          }

          if (trainingData?.active_plan) {
            setTrainingPlan(
              attachWeekDates(trainingData.active_plan)
            );
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
            setTrainingPlan(
              attachWeekDates(JSON.parse(savedPlan))
            );
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

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-workout-history",
      JSON.stringify(workoutHistory)
    );
  }, [workoutHistory, hasRestoredData]);

  useEffect(() => {
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

  const today = useMemo(() => {
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

  async function sendMessage(text?: string) {
    const content = (text ?? message).trim();

    if (!content || isCoachThinking) return;

    const oldChat = chat;

    setChat([
      ...oldChat,
      {
        role: "user",
        text: content,
      },
    ]);

    setMessage("");
    setIsCoachThinking(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: content,
          athlete,
          trainingPlan,
          workoutHistory,
          history: oldChat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Coach request failed");
      }

      setChat((current) => [
        ...current,
        {
          role: "coach",
          text: data.reply,
        },
      ]);

      if (data.updatedPlan) {
        setTrainingPlan(data.updatedPlan);
      }
    } catch (error) {
      console.error(error);

      setChat((current) => [
        ...current,
        {
          role: "coach",
          text:
            "I couldn't reach the coaching service. Try sending that again in a moment.",
        },
      ]);
    } finally {
      setIsCoachThinking(false);
    }
  }

  function saveWorkoutFeedback() {
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


  async function generateNextWeek() {
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

  async function generatePlan() {
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

      setTrainingPlan(
        attachWeekDates(data.plan)
      );
      setScreen("dashboard");
    } catch (error) {
      console.error("Plan generation error:", error);
      alert("TriCoach could not build your week. Please try again.");
    } finally {
      setIsPlanLoading(false);
    }
  }

  async function logOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      localStorage.removeItem("tricoach-athlete");
      localStorage.removeItem("tricoach-plan");
      localStorage.removeItem("tricoach-workout-history");
      localStorage.removeItem("tricoach-plan-history");
      localStorage.removeItem("tricoach-weekly-review");

      window.location.href = "/login";
    } catch (error) {
      console.error("Could not log out:", error);
      alert("Could not log out. Please try again.");
    }
  }

  function editAthleteProfile() {
    setSettingsOpen(false);
    setStep(0);
    setScreen("onboarding");
  }

  async function resetTrainingPlan() {
    const confirmed = window.confirm(
      "Reset your training plan? Your account and athlete profile will be kept, but your active plan, workout feedback and weekly review will be cleared."
    );

    if (!confirmed) return;

    setIsResetting(true);

    try {
      if (userId) {
        const { error } = await supabase
          .from("training_state")
          .delete()
          .eq("user_id", userId);

        if (error) {
          throw error;
        }
      }

      localStorage.removeItem("tricoach-plan");
      localStorage.removeItem("tricoach-workout-history");
      localStorage.removeItem("tricoach-plan-history");
      localStorage.removeItem("tricoach-weekly-review");

      setTrainingPlan(null);
      setWorkoutHistory([]);
      setPlanHistory([]);
      setWeeklyReview(null);

      setSettingsOpen(false);
      setStep(0);
      setScreen("onboarding");

    } catch (error) {
      console.error(
        "Could not reset training plan:",
        error
      );

      alert(
        "Could not reset the training plan. Please try again."
      );
    } finally {
      setIsResetting(false);
    }
  }

  function toggleAvailableDay(day: string) {
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

  const onboarding = [
    {
      eyebrow: "Athlete profile",

      title: "What should I call you?",

      content: (
        <input
          className="field"
          value={athlete.name}
          placeholder="Your name"
          onChange={(e) =>
            setAthlete({
              ...athlete,
              name: e.target.value,
            })
          }
        />
      ),
    },

    {
      eyebrow: "Your goal",

      title: "What are you training for?",

      content: (
        <div className="choiceGrid">
          {(["Sprint", "Olympic", "70.3", "Ironman"] as Goal[]).map(
            (goal) => (
              <button
                key={goal}
                className={
                  athlete.goal === goal
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  setAthlete({
                    ...athlete,
                    goal,
                  })
                }
              >
                <strong>{goal}</strong>
              </button>
            )
          )}
        </div>
      ),
    },

    {
      eyebrow: "Race day",

      title: "When is the race?",

      content: (
        <input
          className="field"
          type="date"
          value={athlete.raceDate}
          onChange={(e) =>
            setAthlete({
              ...athlete,
              raceDate: e.target.value,
            })
          }
        />
      ),
    },

    {
      eyebrow: "Real life first",

      title: "How much can you realistically train?",

      content: (
        <div className="sliderWrap">
          <div className="bigNumber">
            {athlete.hoursPerWeek} h
          </div>

          <input
            type="range"
            min="4"
            max="14"
            value={athlete.hoursPerWeek}
            onChange={(e) =>
              setAthlete({
                ...athlete,
                hoursPerWeek: e.target.value,
              })
            }
          />

          <p>
            per week — on a normal week, not your perfect week.
          </p>
        </div>
      ),
    },

    {
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
  ];

  if (screen === "home") {
    return (
      <main className="landing">
        <nav className="nav">
          <div className="brand">
            <span>▲</span> TRI//COACH
          </div>

          <button
            className="ghost"
            onClick={() => setScreen("onboarding")}
          >
            Open beta
          </button>
        </nav>

        <section className="hero">
          <div className="heroCopy">
            <div className="pill">
              BUILT FOR AGE-GROUP TRIATHLETES
            </div>

            <h1>
              Your training plan should adapt to{" "}
              <em>your life.</em>
            </h1>

            <p>
              A personal triathlon coach that tells you what
              to do today, explains why, and adapts when work,
              sleep, travel or tired legs change the plan.
            </p>

            <div className="heroActions">
              <button
                className="primary"
                onClick={() => setScreen("onboarding")}
              >
                Build my plan →
              </button>

              <span>No perfect schedule required.</span>
            </div>
          </div>

          <div className="phoneCard">
            <div className="phoneTop">
              <span>Today</span>
              <span className="status">READY</span>
            </div>

            <div className="sportMark">BIKE</div>

            <h2>60 min endurance ride</h2>

            <p>
              Keep it conversational. Smooth cadence.
              No chasing numbers today.
            </p>

            <div className="metricRow">
              <div>
                <small>INTENSITY</small>
                <strong>Z2</strong>
              </div>

              <div>
                <small>DURATION</small>
                <strong>60m</strong>
              </div>

              <div>
                <small>FOCUS</small>
                <strong>Aerobic</strong>
              </div>
            </div>

            <div className="whyBox">
              <span>WHY THIS?</span>
              Builds endurance without compromising
              tomorrow’s run.
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "onboarding") {
    const item = onboarding[step];

    return (
      <main className="onboarding">
        <div className="topline">
          <button
            className="back"
            onClick={() => {
              if (step === 0) {
                setScreen("home");
              } else {
                setStep(step - 1);
              }
            }}
          >
            ← Back
          </button>

          <div className="progress">
            <div
              style={{
                width: `${
                  ((step + 1) / onboarding.length) * 100
                }%`,
              }}
            />
          </div>

          <span>
            {step + 1}/{onboarding.length}
          </span>
        </div>

        <section className="questionCard">
          <div className="eyebrow">
            {item.eyebrow}
          </div>

          <h1>{item.title}</h1>

          {item.content}

          <button
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
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      {screen === "dashboard" && (
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          style={{
            position: "fixed",
            top: "22px",
            right: "22px",
            zIndex: 40,
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "1px solid #d8d7cf",
            background: "#ffffff",
            cursor: "pointer",
            fontSize: "20px",
            boxShadow: "0 8px 24px rgba(0,0,0,.08)",
          }}
        >
          ⚙
        </button>
      )}
      <aside className="sidebar">
        <div className="brand">
          <span>▲</span> TRI//COACH
        </div>

        <div className="sideNav">
          <button className="active">
            Today
          </button>

          <button>My week</button>
          <button>Coach</button>
          <button>Race plan</button>
        </div>

        <div className="athleteMini">
          <div className="avatar">
            {(athlete.name || "A")
              .slice(0, 1)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {athlete.name || "Athlete"}
            </strong>

            <span>
              {athlete.goal} ·{" "}
              {athlete.hoursPerWeek}h/week
            </span>
          </div>
        </div>
      </aside>

      <section className="mainPanel">
        <header className="dashHeader">
          <div>
            <span className="eyebrow">
              TODAY
            </span>

            <h1>
              Good training starts with the right decision.
            </h1>
          </div>
        </header>

        {athlete.raceDate && (
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

        <div className="dashboardGrid">
          <div className="todayCard">
            <div className="cardHead">
              <span className="sportBadge">
                {today[1].toUpperCase()}
              </span>

              <span>KEY SESSION</span>
            </div>

            <h2>{today[2]}</h2>

            <div className="duration">
              {today[3]}
            </div>

            <p>
              {today[4]}
            </p>

            <div className="workoutSteps">
              <div>
                <b>01</b>

                <span>
                  <strong>Start easy</strong>
                  <small>
                    Let effort rise gradually.
                  </small>
                </span>
              </div>

              <div>
                <b>02</b>

                <span>
                  <strong>Stay controlled</strong>
                  <small>
                    Consistency beats proving fitness.
                  </small>
                </span>
              </div>

              <div>
                <b>03</b>

                <span>
                  <strong>Finish fresh</strong>
                  <small>
                    You should be able to train
                    well tomorrow.
                  </small>
                </span>
              </div>
            </div>

            <div className="actionRow">
              <button
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
              </button>

              <button
                className="secondary"
                onClick={() =>
                  sendMessage(
                    "I need to change today's workout"
                  )
                }
              >
                Adapt
              </button>
            </div>
          </div>

          <div className="coachCard">
            <div className="coachTitle">
              <div>
                <span className="pulseDot" />
                COACH
              </div>

              <small>
                {isCoachThinking
                  ? "Thinking..."
                  : "AI coach online"}
              </small>
            </div>

            <div className="chat">
              {chat.map((item, index) => (
                <div
                  key={index}
                  className={`bubble ${item.role}`}
                >
                  {item.text}
                </div>
              ))}

              {isCoachThinking && (
                <div className="bubble coach">
                  Thinking through your plan...
                </div>
              )}
            </div>

            <div className="quickRow">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  disabled={isCoachThinking}
                  onClick={() =>
                    sendMessage(reply)
                  }
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className="composer">
              <input
                value={message}
                disabled={isCoachThinking}
                placeholder={
                  isCoachThinking
                    ? "Coach is thinking..."
                    : "Tell your coach what changed..."
                }
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                disabled={
                  isCoachThinking ||
                  !message.trim()
                }
                onClick={() =>
                  sendMessage()
                }
              >
                ↑
              </button>
            </div>
          </div>
        </div>

        {feedbackOpen && (
          <section className="questionCard" style={{ marginTop: "1.5rem" }}>
            <div className="eyebrow">
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
            )}

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

        <section className="weekSection">
          <div className="sectionTitle">
            <div>
              <span className="eyebrow">
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
              </h2>
            </div>

            <span>
              {trainingPlan
                ? `${trainingPlan.totalHours} planned hours · focus: ${trainingPlan.focus}`
                : `${athlete.hoursPerWeek} planned hours · focus: ${athlete.weakestDiscipline}`}
            </span>
          </div>

          <div className="weekGrid">
            {(trainingPlan?.days ?? []).map((workout) => (
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

                <h3>{workout.title}</h3>
                <p>
                  {workout.durationMinutes === 0
                    ? "Rest"
                    : `${workout.durationMinutes} min`}
                </p>
              </button>
            ))}
          </div>

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

        {planHistory.length > 0 && (
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

        {weeklyReview && (
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

        {workoutHistory.length > 0 && (() => {
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
      {selectedWorkout && (
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

      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 22, 18, .45)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
        >
          <section
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "#f8f7f2",
              borderRadius: "24px",
              padding: "28px",
              boxShadow:
                "0 30px 80px rgba(0,0,0,.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                alignItems: "flex-start",
                marginBottom: "28px",
              }}
            >
              <div>
                <div className="eyebrow">
                  ACCOUNT
                </div>

                <h2
                  style={{
                    marginTop: ".4rem",
                    marginBottom: ".3rem",
                  }}
                >
                  Settings
                </h2>

                <p
                  style={{
                    color: "#6f7268",
                    margin: 0,
                  }}
                >
                  {userEmail || "TriCoach athlete"}
                </p>
              </div>

              <button
                onClick={() =>
                  setSettingsOpen(false)
                }
                style={{
                  border: 0,
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              <button
                className="primary full"
                onClick={editAthleteProfile}
              >
                Edit athlete profile
              </button>

              <button
                className="secondary full"
                disabled={isResetting}
                onClick={resetTrainingPlan}
              >
                {isResetting
                  ? "Resetting..."
                  : "Reset training plan"}
              </button>

              <button
                onClick={logOut}
                style={{
                  marginTop: "10px",
                  border: "1px solid #d8d7cf",
                  background: "transparent",
                  borderRadius: "12px",
                  padding: "14px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Log out
              </button>
            </div>

            <p
              style={{
                marginTop: "22px",
                marginBottom: 0,
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#85877f",
              }}
            >
              Resetting your training plan keeps
              your account and athlete profile.
              Logging out does not delete your
              data from TriCoach.
            </p>
          </section>
        </div>
      )}

    </main>
  );
}
