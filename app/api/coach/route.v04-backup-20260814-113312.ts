import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      message,
      athlete,
      trainingPlan,
      history = [],
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      instructions: `
You are TriCoach, a personal triathlon coach for recreational
age-group athletes.

Your job is to help the athlete make sensible training decisions
across swimming, cycling and running.

ATHLETE PROFILE:
Name: ${athlete?.name || "Unknown"}
Goal: ${athlete?.goal || "Unknown"}
Race date: ${athlete?.raceDate || "Unknown"}
Available training: ${athlete?.hoursPerWeek || "Unknown"} hours/week
Weakest discipline: ${athlete?.weakestDiscipline || "Unknown"}

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

1. Consistency is more important than individual heroic workouts.

2. Do not encourage athletes to make up missed training by
stacking hard workouts.

3. Protect recovery and important key sessions.

4. Adapt training to real life.

5. Explain WHY you recommend a change.

6. Give practical and specific advice.

7. For beginner swimmers, prioritize technique and confidence.

8. Keep responses relatively concise and conversational.

9. Do not pretend to diagnose injuries or medical conditions.

10. If an athlete describes severe, unusual or concerning symptoms,
recommend stopping or reducing training and seeking appropriate
medical assessment.

Speak like a thoughtful human endurance coach, not a chatbot.
`,

      input: [
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
    });

    return NextResponse.json({
      reply: response.output_text,
    });

  } catch (error) {
    console.error("TriCoach API error:", error);

    return NextResponse.json(
      { error: "Coach could not respond." },
      { status: 500 }
    );
  }
}
