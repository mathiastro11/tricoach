"use client";

import { useMemo, useState } from "react";

type Goal = "Sprint" | "Olympic" | "70.3" | "Ironman";
type Discipline = "Swimming" | "Cycling" | "Running";

type Athlete = {
  name: string;
  goal: Goal;
  raceDate: string;
  hoursPerWeek: string;
  weakestDiscipline: Discipline;
};

type ChatMessage = {
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
  });

  const [message, setMessage] = useState("");
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);

  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "coach",
      text:
        "Tell me what real life threw at you today. I’ll adapt the training without losing sight of the goal.",
    },
  ]);

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

      setTrainingPlan(data.plan);
      setScreen("dashboard");
    } catch (error) {
      console.error("Plan generation error:", error);
      alert("TriCoach could not build your week. Please try again.");
    } finally {
      setIsPlanLoading(false);
    }
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
              <button className="primary">
                Start workout
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

        <section className="weekSection">
          <div className="sectionTitle">
            <div>
              <span className="eyebrow">
                THIS WEEK
              </span>

              <h2>Your plan</h2>
            </div>

            <span>
              {trainingPlan
                ? `${trainingPlan.totalHours} planned hours · focus: ${trainingPlan.focus}`
                : `${athlete.hoursPerWeek} planned hours · focus: ${athlete.weakestDiscipline}`}
            </span>
          </div>

          <div className="weekGrid">
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
        </section>
      </section>
    </main>
  );
}
