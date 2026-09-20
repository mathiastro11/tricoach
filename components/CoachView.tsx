"use client";

import {
  formatDuration,
} from "@/lib/format-duration";

import type {
  ChatMessage,
  ReadinessEntry,
  TrainingPlan,
  WeeklyReview,
} from "@/types/training";

function renderCoachInline(
  text: string
) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong
            key={`${part}-${index}`}
            className="coachMessageBold"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      return part;
    });
}


function renderCoachMessage(
  text: string
) {
  const lines = text.split(/\r?\n/);

  return (
    <div className="coachStructuredMessage">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();

        if (!line) {
          return (
            <div
              key={`space-${index}`}
              className="coachMessageSpace"
              aria-hidden="true"
            />
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h4
              key={`heading-${index}`}
              className="coachMessageHeading"
            >
              {renderCoachInline(
                line.slice(3).trim()
              )}
            </h4>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <div
              key={`bullet-${index}`}
              className="coachMessageBullet"
            >
              <span aria-hidden="true">
                •
              </span>

              <p>
                {renderCoachInline(
                  line.slice(2).trim()
                )}
              </p>
            </div>
          );
        }

        return (
          <p
            key={`paragraph-${index}`}
            className="coachMessageParagraph"
          >
            {renderCoachInline(line)}
          </p>
        );
      })}
    </div>
  );
}


type CoachViewProps = {
  chat: ChatMessage[];
  message: string;
  quickReplies: string[];
  isCoachThinking: boolean;

  today: string[];
  trainingPlan: TrainingPlan | null;
  todayReadiness: ReadinessEntry | null;
  weeklyReview: WeeklyReview | null;

  onMessageChange: (
    value: string
  ) => void;

  onSendMessage: (
    message?: string
  ) => void;
};

export default function CoachView({
  chat,
  message,
  quickReplies,
  isCoachThinking,
  today,
  trainingPlan,
  todayReadiness,
  weeklyReview,
  onMessageChange,
  onSendMessage,
}: CoachViewProps) {

  const todaysWorkout =
    trainingPlan?.days?.find(
      (item) =>
        item.day.slice(0, 3) ===
        today[0]
    ) ?? null;

  const loadDecision =
    weeklyReview?.coachingDecision
      ?.loadDecision ??
    weeklyReview?.loadDecision ??
    null;

  const coachActions = [
    {
      eyebrow: "TODAY",
      title:
        "Adapt today's session",
      text:
        "Change today's workout based on time, fatigue or schedule.",
      prompt:
        "I need to change today's workout. Review my plan and today's context and suggest the best adjustment.",
    },
    {
      eyebrow: "THIS WEEK",
      title:
        "Review my week",
      text:
        "Check whether my training week still makes sense.",
      prompt:
        "Review my current training week and tell me if anything should change based on what I have logged and my readiness.",
    },
    {
      eyebrow: "RECOVERY",
      title:
        "I'm feeling tired",
      text:
        "Decide whether to train, reduce or recover.",
      prompt:
        "I'm feeling more tired than expected. Use my readiness and recent training to help me decide what to do.",
    },
    {
      eyebrow: "PLAN",
      title:
        "Explain the strategy",
      text:
        "Understand why your current week looks the way it does.",
      prompt:
        "Explain the reasoning behind my current training week and how it supports my race goal.",
    },
  ];

  return (
    <>
      <header className="dashHeader coachCleanHeader">
        <div>
          <span className="eyebrow">
            COACH
          </span>

          <h1>
            What do you need help with?
          </h1>

          <p>
            Basse knows your current plan,
            recent training and recovery context.
          </p>
        </div>


      </header>

      <section className="coachCleanShell">

        <div className="coachCleanContext">
          <div>
            <span>
              TODAY
            </span>

            <strong>
              {todaysWorkout
                ? todaysWorkout.title
                : today[2] || "No session"}
            </strong>

            <small>
              {todaysWorkout
                ? todaysWorkout.durationMinutes === 0
                  ? "Recovery day"
                  : `${todaysWorkout.sport} · ${formatDuration(
                      todaysWorkout.durationMinutes
                    )}`
                : today[3] || "—"}
            </small>
          </div>

          <span className="coachContextSeparator" />

          <div>
            <span>
              READINESS
            </span>

            <strong>
              {todayReadiness
                ? todayReadiness.status
                : "Not checked"}
            </strong>

            <small>
              {todayReadiness
                ? `${todayReadiness.score}/100`
                : "No check-in today"}
            </small>
          </div>

          <span className="coachContextSeparator" />

          <div className="coachCleanContextWide">
            <span>
              THIS WEEK
            </span>

            <strong>
              {trainingPlan?.focus ??
                "No active plan"}
            </strong>

            <small>
              {trainingPlan
                ? `${trainingPlan.totalHours}h planned${
                    loadDecision
                      ? ` · ${loadDecision}`
                      : ""
                  }`
                : "—"}
            </small>
          </div>
        </div>


        <section className="coachCleanConversation">

          <div className="coachChatTopBar">
            <div>
              <span className="eyebrow">
                COACH CHAT
              </span>

              <strong>
                Ask about your training
              </strong>
            </div>

            <span className="coachChatStatus">
              <i className="pulseDot" />

              {isCoachThinking
                ? "Reviewing"
                : "Context loaded"}
            </span>
          </div>

          <div className="coachCleanChat">
            {chat.map(
              (item, index) => (
                <div
                  key={index}
                  className={`bubble ${item.role}`}
                >
                  {item.role === "coach"
                    ? renderCoachMessage(
                        item.text
                      )
                    : item.text}
                </div>
              )
            )}

            {isCoachThinking && (
              <div className="bubble coach coachThinkingBubble">
                <span className="thinkingDots">
                  <i />
                  <i />
                  <i />
                </span>

                Reviewing your training context...
              </div>
            )}
          </div>


          {chat.length <= 1 && (
            <div className="coachStartArea">
              <span className="coachStartLabel">
                QUICK QUESTIONS
              </span>

              <div className="coachStartActions">
                {coachActions.map(
                  (action) => (
                    <button
                      key={action.title}
                      className={[
                        "coachStartAction",
                        `coachStartAction${action.eyebrow.replace(/\s+/g, "")}`,
                      ].join(" ")}
                      disabled={
                        isCoachThinking
                      }
                      onClick={() =>
                        onSendMessage(
                          action.prompt
                        )
                      }
                    >
                      <span>
                        {action.eyebrow}
                      </span>

                      <strong>
                        {action.title}
                      </strong>

                      <p>
                        {action.text}
                      </p>

                      <b aria-hidden="true">
                        →
                      </b>
                    </button>
                  )
                )}
              </div>
            </div>
          )}


          {chat.length > 1 &&
            quickReplies.length > 0 && (
            <div className="coachCleanReplies">
              {quickReplies.map(
                (reply) => (
                  <button
                    key={reply}
                    disabled={
                      isCoachThinking
                    }
                    onClick={() =>
                      onSendMessage(reply)
                    }
                  >
                    {reply}
                  </button>
                )
              )}
            </div>
          )}


          <div className="coachCleanComposer">
            <input
              value={message}
              disabled={
                isCoachThinking
              }
              placeholder={
                isCoachThinking
                  ? "Coach is reviewing your plan..."
                  : "Tell your coach what changed..."
              }
              onChange={(e) =>
                onMessageChange(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  message.trim()
                ) {
                  onSendMessage();
                }
              }}
            />

            <button
              className={
                message.trim()
                  ? "coachComposerSend active"
                  : "coachComposerSend"
              }
              aria-label="Send message"
              disabled={
                isCoachThinking ||
                !message.trim()
              }
              onClick={() =>
                onSendMessage()
              }
            >
              <span aria-hidden="true">
                ↑
              </span>
            </button>
          </div>

          <div className="coachCleanHint">
            Your plan, recent training and readiness
            are already part of the conversation.
          </div>
        </section>
      </section>
    </>
  );
}
