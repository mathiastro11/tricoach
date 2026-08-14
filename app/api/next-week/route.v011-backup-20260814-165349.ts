import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      athlete,
      currentPlan,
      workoutHistory = [],
      planHistory = [],
    } = body;

    if (!athlete || !currentPlan) {
      return NextResponse.json(
        {
          error:
            "Athlete and current plan are required",
        },
        { status: 400 }
      );
    }

    const response =
      await openai.responses.create({
        model: "gpt-5.6-luna",

        instructions: `
You are the adaptive weekly planning engine for TriCoach.

You are reviewing one completed training week and creating the next week.

ATHLETE:
${JSON.stringify(athlete, null, 2)}

Treat the athlete profile as hard context:
- respect available training days
- respect maximum realistic session length
- use current discipline levels
- respect equipment access
- respect athlete limitations
- do not increase volume aggressively beyond recent training tolerance

CURRENT / PREVIOUS WEEK PLAN:
${JSON.stringify(currentPlan, null, 2)}

WHAT THE ATHLETE ACTUALLY LOGGED:
${JSON.stringify(workoutHistory, null, 2)}

OLDER PLAN HISTORY:
${JSON.stringify(
  planHistory.slice(-3),
  null,
  2
)}

YOUR JOB:

1. Review the week honestly.
2. Identify meaningful patterns.
3. Decide whether next week's overall load should:
   - increase slightly
   - remain similar
   - reduce
4. Create the next 7-day plan.
5. Explain the main reason for the decision.

TRAINING PRINCIPLES:

- Consistency matters more than isolated heroic workouts.
- Do not "repay" missed sessions.
- Do not aggressively increase volume.
- A successful week does not automatically require more training.
- Repeated high RPE, heavy sessions, worsening fatigue, illness signals,
  or poor recovery should push the plan toward caution.
- One bad session alone should not cause an overreaction.
- Preserve recovery around demanding sessions.
- Avoid unnecessary hard-session stacking.
- Keep most endurance work easy or controlled.
- Prioritize the athlete's weakest discipline when appropriate.
- Beginner swimmers should emphasize technique, confidence,
  frequency and relaxed aerobic work.
- Long-bike volume is generally preferable to excessive run-volume
  increases for age-group triathlon endurance.
- The athlete has a life outside training.
- Keep the plan reasonably close to their available weekly hours.
- Do not diagnose injury or illness.
- If workout feedback suggests concerning symptoms,
  be conservative and tell the athlete to seek appropriate
  professional medical assessment where warranted.

WEEK STRUCTURE:

Return exactly Monday through Sunday.

Each day must contain only one primary sport category:
Swim, Bike, Run, Strength, or Rest.

A brick session can use Bike as the sport and describe
the short run in details.

Do not invent performance numbers such as FTP, threshold pace,
heart-rate zones, or swim CSS if the athlete has not provided them.
Use RPE / easy / moderate descriptions instead.

Your output must follow the JSON schema exactly.
        `,

        input:
          "Review the athlete's completed week and build the next training week.",

        text: {
          format: {
            type: "json_schema",
            name: "tricoach_week_transition",
            strict: true,

            schema: {
              type: "object",
              additionalProperties: false,

              properties: {
                review: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    headline: {
                      type: "string",
                    },

                    summary: {
                      type: "string",
                    },

                    completedSessions: {
                      type: "number",
                    },

                    skippedSessions: {
                      type: "number",
                    },

                    averageRpe: {
                      anyOf: [
                        {
                          type: "number",
                        },
                        {
                          type: "null",
                        },
                      ],
                    },

                    loadDecision: {
                      type: "string",
                      enum: [
                        "Increase slightly",
                        "Maintain",
                        "Reduce",
                      ],
                    },

                    positives: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },

                    concerns: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },

                    nextWeekFocus: {
                      type: "string",
                    },
                  },

                  required: [
                    "headline",
                    "summary",
                    "completedSessions",
                    "skippedSessions",
                    "averageRpe",
                    "loadDecision",
                    "positives",
                    "concerns",
                    "nextWeekFocus",
                  ],
                },

                nextPlan: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    summary: {
                      type: "string",
                    },

                    totalHours: {
                      type: "number",
                    },

                    focus: {
                      type: "string",
                    },

                    days: {
                      type: "array",
                      minItems: 7,
                      maxItems: 7,

                      items: {
                        type: "object",
                        additionalProperties: false,

                        properties: {
                          day: {
                            type: "string",
                            enum: [
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ],
                          },

                          sport: {
                            type: "string",
                            enum: [
                              "Swim",
                              "Bike",
                              "Run",
                              "Strength",
                              "Rest",
                            ],
                          },

                          title: {
                            type: "string",
                          },

                          durationMinutes: {
                            type: "number",
                          },

                          intensity: {
                            type: "string",
                          },

                          purpose: {
                            type: "string",
                          },

                          details: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                        },

                        required: [
                          "day",
                          "sport",
                          "title",
                          "durationMinutes",
                          "intensity",
                          "purpose",
                          "details",
                        ],
                      },
                    },
                  },

                  required: [
                    "summary",
                    "totalHours",
                    "focus",
                    "days",
                  ],
                },
              },

              required: [
                "review",
                "nextPlan",
              ],
            },
          },
        },
      });

    let result;

    try {
      result = JSON.parse(
        response.output_text
      );
    } catch {
      console.error(
        "Invalid next-week JSON:",
        response.output_text
      );

      return NextResponse.json(
        {
          error:
            "TriCoach returned invalid weekly data",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      review: result.review,
      nextPlan: result.nextPlan,
    });

  } catch (error) {
    console.error(
      "TriCoach next-week API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not review and generate next week",
      },
      { status: 500 }
    );
  }
}
