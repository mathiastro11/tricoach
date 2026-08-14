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
      workoutHistory = [],
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

RECENT WORKOUT FEEDBACK:
${workoutHistory?.length
  ? JSON.stringify(workoutHistory.slice(-14), null, 2)
  : "No workout feedback has been logged yet."}

Use RECENT WORKOUT FEEDBACK when relevant.

Look for patterns such as:
- repeated high RPE
- unusually heavy sessions
- skipped sessions
- poor recovery
- strong training consistency

Do not overreact to one imperfect workout.

When the athlete asks about changing, missing, moving, shortening,
or replacing a workout, use the CURRENT TRAINING PLAN above.

COACHING PRINCIPLES:
1. Consistency is more important than individual heroic workouts.
2. Do not encourage athletes to make up missed training by stacking hard workouts.
3. Protect recovery and important key sessions.
4. Adapt training to real life.
5. Explain WHY you recommend a change.
6. Give practical and specific advice.
7. For beginner swimmers, prioritize technique and confidence.
8. Keep responses relatively concise and conversational.
9. Do not pretend to diagnose injuries or medical conditions.
10. If an athlete describes severe, unusual or concerning symptoms,
recommend stopping or reducing training and seeking appropriate medical assessment.

PLAN CHANGE RULES:
- Only return an updatedPlan if a concrete plan change is actually useful.
- If no change is needed, updatedPlan must be null.
- If you change the plan, preserve exactly 7 days Monday through Sunday.
- Do not casually increase total weekly load.
- Do not stack hard sessions.
- Protect recovery.
- Preserve the athlete's available weekly hours as closely as practical.
- Keep unchanged days unchanged where possible.
- Be conservative with injury, illness, severe fatigue, or poor recovery.

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

      text: {
        format: {
          type: "json_schema",
          name: "tricoach_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              reply: {
                type: "string",
              },
              updatedPlan: {
                anyOf: [
                  {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      summary: { type: "string" },
                      totalHours: { type: "number" },
                      focus: { type: "string" },
                      days: {
                        type: "array",
                        minItems: 7,
                        maxItems: 7,
                        items: {
                          type: "object",
                          additionalProperties: false,
                          properties: {
                            day: { type: "string" },
                            sport: {
                              type: "string",
                              enum: [
                                "Swim",
                                "Bike",
                                "Run",
                                "Strength",
                                "Rest"
                              ]
                            },
                            title: { type: "string" },
                            durationMinutes: { type: "number" },
                            intensity: { type: "string" },
                            purpose: { type: "string" },
                            details: {
                              type: "array",
                              items: { type: "string" }
                            }
                          },
                          required: [
                            "day",
                            "sport",
                            "title",
                            "durationMinutes",
                            "intensity",
                            "purpose",
                            "details"
                          ]
                        }
                      }
                    },
                    required: [
                      "summary",
                      "totalHours",
                      "focus",
                      "days"
                    ]
                  },
                  {
                    type: "null"
                  }
                ]
              }
            },
            required: [
              "reply",
              "updatedPlan"
            ]
          }
        }
      }
    });

    let coachResult;

    try {
      coachResult = JSON.parse(response.output_text);
    } catch {
      console.error(
        "TriCoach returned invalid structured output:",
        response.output_text
      );

      return NextResponse.json(
        { error: "Coach returned invalid data." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: coachResult.reply,
      updatedPlan: coachResult.updatedPlan,
    });

  } catch (error) {
    console.error("TriCoach API error:", error);

    return NextResponse.json(
      { error: "Coach could not respond." },
      { status: 500 }
    );
  }
}
