import {
  createOpenAIClient,
} from "@/lib/openai-server";
import { NextResponse } from "next/server";
import {
  buildTrainingScienceGuidance,
  inferEvidenceTrainingPhase,
} from "@/lib/training-science";

import {
  getCanonicalTrainingPhase,
  getCanonicalWeeksUntilRace,
} from "@/lib/training-phase";

import {
  buildRaceDistanceGuidance,
} from "@/lib/race-distance";

import {
  buildRaceSpecificityGuidance,
} from "@/lib/race-specificity";

const openai =
  createOpenAIClient();

function getMonday(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copy.setDate(copy.getDate() + diff);
  copy.setHours(12, 0, 0, 0);

  return copy;
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      athlete,
      trainingArchive = [],
    } = body;

    if (!athlete?.raceDate) {
      return NextResponse.json(
        {
          error:
            "Race date is required",
        },
        { status: 400 }
      );
    }

    const startDate =
      getMonday();


    /*
      The roadmap begins at startDate: the Monday of the
      current roadmap week.

      Both season distance and the first strategic phase must
      use that same calendar anchor.

      Do not use elapsed local milliseconds here because DST
      can make an exact number of calendar weeks appear longer
      or shorter.
    */
    const totalWeeks =
      Math.max(
        1,
        getCanonicalWeeksUntilRace(
          athlete.raceDate,
          startDate
        ) ?? 1
      );


    const evidencePhase =
      inferEvidenceTrainingPhase(
        athlete.raceDate,
        startDate
      );

    const trainingScience =
      buildTrainingScienceGuidance({
        athlete,
        phase: evidencePhase,
      });

    const raceDistanceGuidance =
      buildRaceDistanceGuidance({
        athlete: athlete ?? {},
        phase: evidencePhase,
        weeksUntilRace:
          totalWeeks,
      });


    const raceSpecificityGuidance =
      buildRaceSpecificityGuidance(
        athlete?.targetRace
      );


    const response =
      await openai.responses.create({
        model: "gpt-5.6-luna",

        instructions: `
You are the long-term season planning engine for TriCoach.

Build a high-level triathlon season roadmap from the current week to race day.

ATHLETE:
${JSON.stringify(athlete, null, 2)}

RECENT TRAINING HISTORY:
${JSON.stringify(
  trainingArchive.slice(-4),
  null,
  2
)}

START DATE:
${toISODate(startDate)}

RACE DATE:
${athlete.raceDate}

TOTAL WEEKS AVAILABLE:
${totalWeeks}

EVIDENCE-BASED TRAINING MODEL:
${trainingScience}

RACE-DISTANCE SPECIFIC MODEL:
${raceDistanceGuidance}

RACE-COURSE SPECIFIC MODEL:
${raceSpecificityGuidance}

TARGET RACE DETAILS:
${athlete?.targetRace
  ? JSON.stringify(
      athlete.targetRace,
      null,
      2
    )
  : "No detailed target race supplied."}

RACE-DISTANCE RULE:
The athlete's target distance changes the balance of endurance,
quality, bricks, fueling and race specificity.

Do not simply scale the same generic training week up or down by hours.

Race distance does NOT override:
- athlete safety
- current training tolerance
- readiness
- availability
- equipment
- deterministic load guardrails.

ROADMAP APPLICATION:
Use the science model strategically rather than copying weekly workouts into the roadmap.

The roadmap should progressively evolve from:
consistency → development → race specificity → fatigue reduction.

YOUR JOB:

Create exactly ${totalWeeks} weekly roadmap entries.

Each week should define:

- phase
- weekly focus
- target total training hours
- priority discipline
- key objectives

Do NOT create daily workouts here.
This is strategic season architecture.

PHASE PRINCIPLES:

BASE
- Build consistency.
- Aerobic development.
- Technique improvement.
- Conservative intensity.
- Improve the weakest discipline.

BUILD
- Add race-specific endurance.
- Controlled threshold / quality work where suitable.
- Maintain recovery.
- Gradually increase specificity.

PEAK
- Race-specific key sessions.
- Highest specificity.
- Do not aggressively increase volume.
- Protect recovery.

TAPER
- Reduce fatigue.
- Lower volume.
- Maintain small amounts of controlled intensity.
- Race readiness matters more than adding fitness.

IMPORTANT RULES:

- Respect current training volume.
- Do not jump directly to the athlete's maximum available hours.
- Target hours should progress conservatively.
- Use recovery / lighter weeks periodically when appropriate.
- Do not assume every week must increase.
- Account for the athlete's weakest discipline.
- Respect available days, equipment and limitations.
- Do not prescribe unsafe volume.
- Race proximity overrides aggressive progression.
- Final weeks must transition logically into taper.
- The roadmap must feel like one coherent progression,
  not independent random weeks.
- Keep keyObjectives short and practical.

Return valid JSON only.
        `,

        input:
          "Build the athlete's season roadmap.",

        text: {
          format: {
            type: "json_schema",
            name:
              "tricoach_season_roadmap",
            strict: true,

            schema: {
              type: "object",
              additionalProperties: false,

              properties: {
                createdAt: {
                  type: "string",
                },

                raceDate: {
                  type: "string",
                },

                raceGoal: {
                  type: "string",
                },

                totalWeeks: {
                  type: "number",
                },

                summary: {
                  type: "string",
                },

                weeks: {
                  type: "array",
                  minItems: totalWeeks,
                  maxItems: totalWeeks,

                  items: {
                    type: "object",
                    additionalProperties: false,

                    properties: {
                      weekIndex: {
                        type: "number",
                      },

                      startDate: {
                        type: "string",
                      },

                      phase: {
                        type: "string",
                        enum: [
                          "Base",
                          "Build",
                          "Peak",
                          "Taper",
                        ],
                      },

                      focus: {
                        type: "string",
                      },

                      targetHours: {
                        type: "number",
                      },

                      priorityDiscipline: {
                        type: "string",
                      },

                      keyObjectives: {
                        type: "array",
                        items: {
                          type: "string",
                        },
                      },
                    },

                    required: [
                      "weekIndex",
                      "startDate",
                      "phase",
                      "focus",
                      "targetHours",
                      "priorityDiscipline",
                      "keyObjectives",
                    ],
                  },
                },
              },

              required: [
                "createdAt",
                "raceDate",
                "raceGoal",
                "totalWeeks",
                "summary",
                "weeks",
              ],
            },
          },
        },
      });

    let roadmap;

    try {
      roadmap = JSON.parse(
        response.output_text
      );


      /*
        AI owns strategic roadmap content such as summary,
        focus, targetHours, priority discipline and objectives.

        Calendar identity and training phase are deterministic
        planning facts owned by the server.

        Never trust AI-provided raceDate, totalWeeks,
        weekIndex, startDate or phase as authoritative.
      */
      roadmap.raceDate =
        athlete.raceDate;

      roadmap.totalWeeks =
        totalWeeks;


      if (
        Array.isArray(
          roadmap?.weeks
        )
      ) {

        roadmap.weeks =
          roadmap.weeks.map(
            (
              week: {
                [key: string]:
                  unknown;
              },
              index: number
            ) => {

              const canonicalWeekStart =
                new Date(
                  startDate
                );


              canonicalWeekStart.setDate(
                startDate.getDate() +
                  index * 7
              );


              return {
                ...week,

                weekIndex:
                  index + 1,

                startDate:
                  toISODate(
                    canonicalWeekStart
                  ),

                phase:
                  getCanonicalTrainingPhase(
                    athlete.raceDate,
                    canonicalWeekStart
                  ),
              };
            }
          );
      }
    } catch {
      console.error(
        "Invalid roadmap JSON:",
        response.output_text
      );

      return NextResponse.json(
        {
          error:
            "TriCoach returned invalid roadmap data",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      roadmap,
    });

  } catch (error) {
    console.error(
      "TriCoach roadmap API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not generate season roadmap",
      },
      { status: 500 }
    );
  }
}
