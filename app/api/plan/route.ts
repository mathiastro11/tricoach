import {
  createOpenAIClient,
} from "@/lib/openai-server";
import { NextResponse } from "next/server";

import {
  applyBenchmarkPrescriptionToPlan,
} from "@/lib/benchmark-plan-prescription";
import {
  buildTrainingScienceGuidance,
  inferEvidenceTrainingPhase,
} from "@/lib/training-science";

import {
  buildRaceDistanceGuidance,
} from "@/lib/race-distance";

import {
  buildRaceSpecificityGuidance,
} from "@/lib/race-specificity";

import {
  buildBenchmarkGuidance,
} from "@/lib/performance-benchmarks";

import {
  buildBenchmarkPrescriptionGuidance,
} from "@/lib/benchmark-prescription";

import {
  buildSessionLibraryGuidance,
} from "@/lib/session-library";

import { INTENSITY_PRESCRIPTION_POLICY } from "@/lib/intensity-prescription-policy";

import {
  buildMultiSessionPlanningGuidance,
  normalizeCoachGeneratedPlan,
} from "@/lib/multi-session-planning";

import {
  buildDisciplineAllocationGuidance,
} from "@/lib/discipline-allocation";

import {
  buildAvailabilityGuidance,
  buildWeeklyAvailabilityGuidance,
  validatePlanAgainstResolvedAvailability,
} from "@/lib/training-availability";

import {
  getInitialWeekFeasibleCapacity,
  getInitialWeekRecommendedHoursMin,
} from "@/lib/initial-week-load";

import {
  auditTrainingPlan,
} from "@/lib/training-plan-audit";

import {
  auditBenchmarkUsage,
} from "@/lib/benchmark-usage-audit";

import {
  validateCanonicalGeneratedPlan,
} from "@/lib/canonical-workout-validation";

import {
  attachWeekDates,
  getISOWeekNumber,
  toISODate,
} from "@/lib/training";

import type {
  Athlete,
  TrainingPlan,
} from "@/types/training";


const openai =
  createOpenAIClient();


function numberOrNull(
  value: unknown
): number | null {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}


function getInitialWeekContext(
  todayIso: unknown
) {

  let today =
    new Date();

  today.setHours(
    12,
    0,
    0,
    0
  );


  if (
    typeof todayIso === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      todayIso
    )
  ) {

    const parsed =
      new Date(
        `${todayIso}T12:00:00`
      );

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      today = parsed;
    }
  }


  /*
    JS:
    Sunday = 0
    Monday = 1

    Convert to:
    Monday = 0
    ...
    Sunday = 6
  */
  const mondayIndex =
    (
      today.getDay() +
      6
    ) % 7;


  const monday =
    new Date(today);

  monday.setDate(
    today.getDate() -
    mondayIndex
  );

  monday.setHours(
    12,
    0,
    0,
    0
  );


  return {
    /*
      Keep both representations from the SAME normalized
      athlete/client calendar context.

      todayDate is for deterministic date calculations.
      todayIso is for storage, prompts and comparisons.
    */
    todayDate:
      new Date(today),

    todayIso:
      toISODate(today),

    weekStart:
      toISODate(monday),

    weekNumber:
      getISOWeekNumber(
        monday
      ),

    remainingDays:
      7 -
      mondayIndex,
  };
}


/*
  FIRST-WEEK LOAD CEILING

  hoursPerWeek is a real-life capacity ceiling.

  currentTrainingHours represents the athlete's actual
  current tolerance and prevents onboarding from immediately
  jumping to the aspirational time budget.

  This is deliberately a ceiling, not a forced target.
  The model may prescribe less when athlete context,
  availability or recovery justify it.

  There is deliberately NO universal "10% rule" here.
*/
function getInitialWeekHoursMax(
  athlete: Athlete,
  remainingDays: number
): number | null {

  const availableHours =
    numberOrNull(
      athlete.hoursPerWeek
    );

  const currentHours =
    numberOrNull(
      athlete.currentTrainingHours
    );


  let fullWeekCeiling:
    number | null =
      availableHours !== null &&
      availableHours >= 0
        ? availableHours
        : null;


  if (
    currentHours !== null &&
    currentHours >= 0
  ) {

    let toleranceCeiling:
      number;


    if (
      currentHours === 0
    ) {

      const experience =
        (
          athlete.experience ??
          ""
        ).toLowerCase();


      /*
        A zero-current-volume athlete must not receive a
        large week simply because they theoretically have
        many hours available.

        These are conservative onboarding ceilings,
        not long-term training targets.
      */
      toleranceCeiling =
        experience.includes(
          "beginner"
        )
          ? 3.5
          : experience.includes(
              "intermediate"
            )
            ? 4.5
            : 5.5;

    } else {

      /*
        Permit modest headroom above current tolerance
        without forcing progression.

        Relative headroom scales with established volume,
        while 30 minutes prevents tiny-volume athletes from
        being trapped by rounding noise.
      */
      toleranceCeiling =
        currentHours +
        Math.max(
          0.5,
          currentHours *
          0.15
        );
    }


    fullWeekCeiling =
      fullWeekCeiling ===
      null
        ? toleranceCeiling
        : Math.min(
            fullWeekCeiling,
            toleranceCeiling
          );
  }


  if (
    fullWeekCeiling ===
      null ||
    fullWeekCeiling <=
      0
  ) {
    return fullWeekCeiling;
  }


  /*
    Partial first week:

    Never squeeze a normal Monday-Sunday load into only the
    remaining calendar days.

    A small buffer avoids pathological rounding around a
    single missing day while still reducing the ceiling
    meaningfully later in the week.
  */
  const partialFactor =
    remainingDays >= 7
      ? 1
      : Math.min(
          1,
          (
            remainingDays /
            7
          ) +
          0.12
        );


  return Number(
    (
      fullWeekCeiling *
      partialFactor
    ).toFixed(1)
  );
}


function attachCanonicalInitialWeekDates(
  plan: TrainingPlan,
  context: {
    weekStart: string;
    weekNumber: number;
  }
): TrainingPlan {

  /*
    Never trust dates produced by a repair model.

    Weekday name + authoritative weekStart define the date.
  */
  return attachWeekDates({
    ...plan,

    weekStart:
      context.weekStart,

    weekNumber:
      context.weekNumber,

    days:
      plan.days.map(
        (day) => ({
          ...day,
          date: undefined,
        })
      ),

    additionalSessions:
      (
        plan.additionalSessions ??
        []
      ).map(
        (session) => ({
          ...session,
          date: undefined,
        })
      ),
  });
}


function isGeneratedSessionShape(
  value: unknown
) {

  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const session =
    value as Record<
      string,
      unknown
    >;


  return (
    typeof session.day ===
      "string" &&
    typeof session.sport ===
      "string" &&
    typeof session.title ===
      "string" &&
    typeof session.durationMinutes ===
      "number" &&
    typeof session.intensity ===
      "string" &&
    typeof session.purpose ===
      "string" &&
    Array.isArray(
      session.details
    ) &&
    Array.isArray(
      session.workoutStructure
    ) &&
    "strengthStructure" in
      session
  );
}


function isGeneratedPlanShape(
  value: unknown
): value is TrainingPlan {

  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const candidate =
    value as Record<
      string,
      unknown
    >;


  return (
    typeof candidate.summary ===
      "string" &&
    typeof candidate.totalHours ===
      "number" &&
    typeof candidate.focus ===
      "string" &&
    Array.isArray(
      candidate.days
    ) &&
    candidate.days.length ===
      7 &&
    candidate.days.every(
      isGeneratedSessionShape
    ) &&
    Array.isArray(
      candidate.additionalSessions
    ) &&
    candidate.additionalSessions.every(
      isGeneratedSessionShape
    )
  );
}


/*
  ========================================================
  CANONICAL STRENGTH STRUCTURE SCHEMA
  ========================================================

  Strength uses sets / reps / loading / rest rather than
  artificial time-distance workout blocks.

  Strict structured output requires this field on every
  generated session. Non-strength sessions return null.
*/
const strengthStructureSchema: Record<string, unknown> = {
  anyOf: [
    {
      type: "object",
      additionalProperties: false,

      properties: {
        goal: {
          type: "string",
          enum: [
            "Adaptation",
            "MaxStrength",
            "StrengthPower",
            "Maintenance",
            "Taper",
          ],
        },

        warmup: {
          type: "array",
          maxItems: 4,

          items: {
            type: "string",
          },
        },

        exercises: {
          type: "array",
          minItems: 1,
          maxItems: 8,

          items: {
            type: "object",
            additionalProperties: false,

            properties: {
              exerciseKey: {
                type: "string",
                enum: [
                  "back-squat",
                  "front-squat",
                  "goblet-squat",
                  "leg-press",
                  "hack-squat",
                  "romanian-deadlift",
                  "trap-bar-deadlift",
                  "hip-thrust",
                  "bulgarian-split-squat",
                  "reverse-lunge",
                  "step-up",
                  "single-leg-press",
                  "seated-calf-raise",
                  "standing-calf-raise",
                  "single-leg-calf-raise",
                  "pull-up",
                  "lat-pulldown",
                  "chest-supported-row",
                  "cable-row",
                  "bench-press",
                  "incline-dumbbell-press",
                  "dumbbell-press",
                  "push-up",
                  "landmine-press",
                  "pallof-press",
                  "dead-bug",
                  "side-plank",
                  "cable-anti-rotation",
                  "carry",
                  "countermovement-jump",
                  "box-jump",
                  "jump-squat",
                  "other",
                ],
              },

              name: {
                type: "string",
              },

              movementPattern: {
                type: "string",
                enum: [
                  "Squat",
                  "Hinge",
                  "Single-leg",
                  "Calf",
                  "Pull",
                  "Push",
                  "Trunk",
                  "Power",
                ],
              },

              sets: {
                type: "integer",
                minimum: 1,
                maximum: 5,
              },

              reps: {
                type: "string",
              },

              loadGuidance: {
                type: "string",
              },

              restSeconds: {
                type: "integer",
                minimum: 30,
                maximum: 300,
              },

              instruction: {
                type: "string",
              },

              alternatives: {
                type: "array",
                maxItems: 3,

                items: {
                  type: "string",
                },
              },
            },

            required: [
              "exerciseKey",
              "name",
              "movementPattern",
              "sets",
              "reps",
              "loadGuidance",
              "restSeconds",
              "instruction",
              "alternatives",
            ],
          },
        },
      },

      required: [
        "goal",
        "warmup",
        "exercises",
      ],
    },

    {
      type: "null",
    },
  ],
};


export async function POST(request: Request) {
  try {
    const body =
      await request.json();

    const trainingAvailability =
      Array.isArray(
        body.trainingAvailability
      )
        ? body.trainingAvailability
        : [];

    const availabilityGuidance =
      buildAvailabilityGuidance(
        trainingAvailability
      );


    

    const weeklyAvailabilityGuidance =
      buildWeeklyAvailabilityGuidance(
        body.athlete ?? null
      );
const {
      athlete,

      /*
        Calendar date in the athlete/client context.
        Example: 2026-08-18.
      */
      todayIso,
    } = body;

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile is required" },
        { status: 400 }
      );
    }

    /*
      The first plan belongs to the athlete/client calendar
      date supplied through todayIso.

      Normalize once and use the SAME context for training
      phase, calendar handling, load guardrails, prompts,
      auditing and final plan dates.
    */
    const initialWeekContext =
      getInitialWeekContext(
        todayIso
      );


    const evidencePhase =
      inferEvidenceTrainingPhase(
        athlete.raceDate,
        initialWeekContext.todayDate
      );

    const trainingScience =
      buildTrainingScienceGuidance({
        athlete,
        phase: evidencePhase,
      });

    const sessionLibrary =
      buildSessionLibraryGuidance({
        athlete: athlete ?? {},
        phase: evidencePhase,
      });


    const multiSessionGuidance =
      buildMultiSessionPlanningGuidance({
        athlete,
        firstWeek:
          true,
      });

    const raceDistanceGuidance =
      buildRaceDistanceGuidance({
        athlete: athlete ?? {},
        phase: evidencePhase,
        weeksUntilRace:
          null,
      });


    const disciplineAllocationGuidance =
      buildDisciplineAllocationGuidance({
        athlete: athlete ?? {},
        phase: evidencePhase,

        weeklyHours:
          Number(
            athlete.currentTrainingHours
          ) || null,

        firstWeek:
          true,
      });


    const raceSpecificityGuidance =
      buildRaceSpecificityGuidance(
        athlete?.targetRace
      );


    const benchmarkGuidance =
      buildBenchmarkGuidance(
        athlete?.benchmarks
      );

    const benchmarkPrescription =
      buildBenchmarkPrescriptionGuidance(
        athlete?.benchmarks
      );


    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      instructions: `
You are the planning engine for TriCoach.

Create a safe, realistic 7-day triathlon training plan for the specific athlete described below.

The athlete may be recreational, competitive, elite or professional.

Performance tier is context, not permission to assume greater training tolerance.
Current training history, discipline-specific level, availability, recovery and race demands remain authoritative.

FIRST-WEEK CALENDAR CONTEXT:
Today is ${initialWeekContext.todayIso}.

This is the athlete's FIRST generated plan.

If today is later than Monday:
- Monday through the day before today have already happened.
- Do NOT schedule training sessions on those past days.
- Represent past days as Rest / Past day / 0 minutes.
- Start useful training on today or later.
- Do NOT redistribute all missed Monday/Tuesday volume into the remaining days.
- Do NOT make the remaining week unusually dense or aggressive.
- Treat this as a partial first week and prioritize a safe introduction to the plan.
- The athlete should never be asked to "make up" training that predates creation of the plan.
- totalHours must reflect only actual planned training from today through Sunday.

If today is Monday, build the normal full Monday-Sunday week.

ATHLETE PROFILE:
Name: ${athlete.name || "Unknown"}
Unit system: ${athlete.unitSystem || "Metric"}
Goal: ${athlete.goal || "Unknown"}
Race date: ${athlete.raceDate || "Unknown"}
Available training time: ${athlete.hoursPerWeek || "Unknown"} hours/week
Weakest discipline: ${athlete.weakestDiscipline || "Unknown"}

Triathlon experience: ${athlete.experience || "Unknown"}
Performance tier: ${athlete.performanceTier || "Recreational"}
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
${athlete.limitations || "None supplied"}

EVIDENCE-BASED TRAINING MODEL:
${INTENSITY_PRESCRIPTION_POLICY}

${trainingScience}

RACE-DISTANCE SPECIFIC MODEL:
${raceDistanceGuidance}

RACE-COURSE SPECIFIC MODEL:
${raceSpecificityGuidance}

ATHLETE PERFORMANCE BENCHMARKS:
${benchmarkGuidance}

BENCHMARK-BASED PRESCRIPTION:
${benchmarkPrescription}

PRESCRIPTION RULE:
Use these targets only when they improve the athlete's ability
to execute the intended session.

Numerical targets must never replace the simple explanation
of what the workout should feel like.

BENCHMARK PRIORITY:
Use valid athlete benchmarks when they genuinely improve
the precision of the prescribed session.

Never invent missing:
- FTP
- CSS
- threshold pace
- race pace
- heart-rate threshold
- training zones

If benchmark data is unavailable for a discipline,
use RPE and execution descriptions instead.

Benchmark numbers do NOT override:
- readiness
- recent workout execution
- recovery
- pain / illness concerns
- athlete availability
- deterministic load guardrails.

A workout should remain understandable even when it contains
a benchmark-based target.

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

FIRST-WEEK RACE SPECIFICITY RULE:
Use the target race course to establish the DIRECTION of
training progression, not to imitate race day immediately.

The first generated week should primarily establish:
- sustainable training frequency
- appropriate volume
- discipline balance
- technique
- aerobic consistency
- athlete tolerance

Race-course information may influence workout selection when
the athlete is already prepared for that type of work.

Examples:
- a mountainous target race can justify moderate climbing exposure
- a flat race can favor steady sustained bike work
- a trail target can justify appropriate terrain exposure
- an open-water target establishes future open-water preparation
- a long-course race establishes future fueling and durability priorities

However, DO NOT prescribe a disproportionately difficult first
week merely because the target race is difficult.

For example:
- Norseman does not justify a huge climbing week for a new athlete
- 3000 m of race-day climbing does not mean the athlete needs
  anything close to 3000 m of climbing in week one
- a mountainous marathon does not justify excessive downhill
  running before the athlete has developed run durability
- cold-water racing does not justify unsafe cold exposure
- long-course racing does not justify excessive brick frequency

Specificity should increase progressively across the training
cycle as fitness, tolerance and proximity to race day increase.

Athlete-edited race data is authoritative for that athlete.

TRICOACH SESSION LIBRARY:
${sessionLibrary}

${multiSessionGuidance}

${weeklyAvailabilityGuidance}

${availabilityGuidance}

CALENDAR AVAILABILITY RULE:
- Calendar availability is a HARD real-life constraint.
- Never schedule training on an Unavailable date.
- On a Limited date, use only explicitly allowed disciplines.
- Respect maxDurationMinutes as the TOTAL across every session that date.
- Primary and additional sessions are both subject to the same restriction.
- Do not make up blocked training by creating unsafe density elsewhere.
- Move, replace, shorten or omit training when necessary.
- A note gives context but never overrides the structured restriction.

DISCIPLINE ALLOCATION:

${disciplineAllocationGuidance}

SESSION LIBRARY RULE:
Choose and scale appropriate session families from this library instead of inventing unnecessarily novel workouts.
The library is guidance, not a requirement to use every workout type.
Athlete-specific constraints and recovery remain more important than library templates.

UNIT RULES:
- Metric uses kilometres, metres and min/km where relevant.
- Imperial uses miles, yards and min/mi where relevant.
- Do not invent numerical targets just to demonstrate the selected unit system.
- Preserve athlete-supplied benchmark values unless conversion genuinely improves execution.

PLANNING PRINCIPLES:
- Use race-course demands as a long-term direction, not as a reason to overload week one.
- Balance swim, bike, run and recovery.
- Respect the athlete's available training days.
- Do not schedule pool swimming if the athlete has no pool access.
- Respect the athlete's longest realistic session duration.
- Consider current training volume when setting first-week volume.
- Do not jump aggressively from current weekly training volume to target availability.
- Use the athlete's discipline levels when selecting session complexity.
- Treat limitations and athlete notes as meaningful constraints.
- Prioritize the weakest discipline where sensible.
- Do not stack unnecessary hard sessions.
- Avoid more than 2 demanding sessions in the week for a beginner/intermediate athlete.
- Include at least 1 proper recovery/rest day.
- Keep total planned training reasonably close to the athlete's available weekly hours.
- For beginner swimmers, prioritize technique and aerobic confidence.
- Long bike sessions are generally safer than very long runs for adding endurance volume.
- Do not prescribe extreme intensity or volume.
- Do not diagnose medical conditions.
- Explain the purpose of each workout clearly.
- Use simple language.

SESSION CONSTRUCTION STANDARD:

Every non-rest workout must be executable without the athlete having to guess what to do.

details must contain only the execution instructions the athlete needs.

Use normally 2-4 short execution lines.

Each detail should be immediately actionable.

GOOD:
- 10 min very easy warm-up
- 30 min relaxed conversational running, RPE 2-3
- 5 min very easy cool-down

BAD:
- long explanations
- coaching theory
- benchmark interpretation
- repeated pace / watt information
- repeating the purpose of the session

Keep PURPOSE separate from EXECUTION.

purpose = one short reason why the workout exists.

details = only what the athlete physically needs to do.

For easy sessions, do not repeat estimated pace in details if
it is already available as a secondary reference elsewhere.

For easy endurance sessions:
- state the intended easy effort / RPE
- avoid unnecessary complexity

For interval sessions:
- include warm-up
- exact number and duration of intervals
- recovery duration / style
- intended RPE
- cool-down where useful

For swimming:
- separate warm-up, technique and main aerobic work where appropriate
- use manageable repeats rather than vague continuous swimming for developing swimmers

For strength:
- use strengthStructure as the canonical prescription
- name every exercise explicitly
- include exact working sets and repetitions
- include RPE / RIR or another clear load instruction
- include exact rest between working sets
- include one short execution cue per exercise
- use practical same-pattern alternatives
- avoid training to failure
- do not turn the session into metabolic circuit training

For bricks:
- clearly separate the bike and run components

For sufficiently long sessions:
- mention fueling / hydration practice when useful

Do not include fake precision.
Do not invent threshold pace, FTP, CSS or heart-rate zones the athlete has not supplied.

Return ONLY valid JSON.

The JSON must use exactly this structure:

{
  "summary": "Short explanation of the week",
  "totalHours": 8,
  "focus": "Main focus of this week",
  "days": [
    {
      "day": "Monday",
      "sport": "Rest",
      "title": "Recovery day",
      "durationMinutes": 0,
      "intensity": "Rest",
      "purpose": "Why this day is planned this way",
      "details": [
        "Optional mobility",
        "Easy walking if desired"
      ],
      "workoutStructure": [],
      "strengthStructure": null
    }
  ],
  "additionalSessions": []
}

Rules:
- Include exactly 7 PRIMARY days, Monday through Sunday.
- additionalSessions must always be present.
- Use [] when a second session is not justified.
- totalHours must include primary AND secondary sessions.
- sport must be one of: Swim, Bike, Run, Strength, Rest
- durationMinutes must be a number.
- workoutStructure must always be present.
- strengthStructure must always be present.
- For Swim, Bike and Run, workoutStructure is the executable source of truth and strengthStructure must be null.
- For Strength, strengthStructure is the executable source of truth and workoutStructure must be [].
- For Rest, workoutStructure must be [] and strengthStructure must be null.
- details must describe the same workout as the relevant canonical structure and must never contradict it.
- Every workoutStructure block must include its actual sport.
- Single-discipline Swim, Bike and Run workouts use that workout's sport on every block.
- A connected Bike-to-Run brick must use sport "Bike" on Bike blocks and sport "Run" on Run blocks.
- Never hide a planned Run component only inside title, purpose or details.
- Never leave recoveries, rests, warm-up, cool-down or repeated work implicit when they are needed to execute an endurance session.

STRENGTH STRUCTURE RULES:
- Every Strength session must contain a non-null strengthStructure.
- Never return strengthStructure for Swim, Bike, Run or Rest.
- goal must reflect the role of the session: Adaptation, MaxStrength, StrengthPower, Maintenance or Taper.
- warmup contains only short practical preparation instructions.
- exercises must be ordered in the sequence the athlete should perform them.
- Every working exercise must contain exerciseKey, exact exercise name, movementPattern, sets, reps, loadGuidance, restSeconds, instruction and alternatives.
- exerciseKey is the stable canonical identity of the exercise.
- Choose the most specific matching exerciseKey from the schema.
- Different naming variants of the same exercise must use the same exerciseKey.
- Example: "Romanian deadlift", "Barbell Romanian deadlift" and "RDL" all use exerciseKey "romanian-deadlift".
- Example: "Incline DB press" and "Incline dumbbell press" both use exerciseKey "incline-dumbbell-press".
- Use exerciseKey "other" only when none of the canonical keys genuinely matches.
- Do not choose an incorrect canonical key merely because the movementPattern is similar.
- Use RPE / RIR for loading guidance unless the athlete has explicitly supplied valid strength-loading data.
- Never invent kilogram loads or 1RM values.
- Main strength exercises should usually preserve repetitions in reserve rather than train to failure.
- Rest must be long enough to preserve strength quality; do not deliberately shorten rest to create cardiovascular fatigue.
- Power exercises, when justified, belong early in the workout and use low repetitions with full movement quality.
- Exercise selection, total sets and session goal must respect the current triathlon phase, athlete experience, gym access, recovery and the surrounding endurance week.
- Protect important run, bike and brick sessions from unnecessary strength-induced fatigue.
- details must remain useful for the current UI and should concisely describe the same exercises, sets, reps, loading guidance and rest that are stored in strengthStructure.
- Use one "repeat" block for repeated intervals rather than writing each repetition separately.
- repeatCount must be 1 for normal segments and greater than 1 for repeated work.
- For repeated intervals, recoveryDurationSeconds / recoveryDistanceMeters describe recovery BETWEEN repetitions.
- There are normally repeatCount - 1 recoveries unless the written instruction explicitly requires recovery after the final repetition.
- Use seconds for time inside workoutStructure, including long durations. Example: 6 minutes = 360 seconds.
- Use metres for distance inside workoutStructure. Example: 100 m = 100.
- If a block is time-based, workDistanceMeters should normally be null.
- If a block is distance-based, workDurationSeconds should normally be null unless both are genuinely prescribed.
- Use phase "Warm-up", "Main", "Recovery", or "Cool-down".
- Use kind "segment" for a normal continuous block and "repeat" for repeated work.
- workIntensity and recoveryIntensity must describe the intended effort clearly enough for both the athlete and the workout visualizer.
- Return no markdown.
- Return no text before or after the JSON.
      `,

      input: `
Create the athlete's first training week now.
      `,

      text: {
        format: {
          type: "json_schema",
          name: "tricoach_initial_plan",
          strict: true,
          schema: {
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

                    workoutStructure: {
                      type: "array",

                      items: {
                        type: "object",
                        additionalProperties: false,

                        properties: {
                          sport: {
                            type: "string",
                            enum: [
                              "Swim",
                              "Bike",
                              "Run",
                            ],
                          },

                          kind: {
                            type: "string",
                            enum: [
                              "segment",
                              "repeat",
                            ],
                          },

                          phase: {
                            type: "string",
                            enum: [
                              "Warm-up",
                              "Main",
                              "Recovery",
                              "Cool-down",
                            ],
                          },

                          label: {
                            type: "string",
                          },

                          repeatCount: {
                            type: "number",
                          },

                          workDurationSeconds: {
                            type: [
                              "number",
                              "null",
                            ],
                          },

                          workDistanceMeters: {
                            type: [
                              "number",
                              "null",
                            ],
                          },

                          workIntensity: {
                            type: "string",
                          },

                          workInstruction: {
                            type: "string",
                          },

                          recoveryDurationSeconds: {
                            type: [
                              "number",
                              "null",
                            ],
                          },

                          recoveryDistanceMeters: {
                            type: [
                              "number",
                              "null",
                            ],
                          },

                          recoveryIntensity: {
                            type: [
                              "string",
                              "null",
                            ],
                          },

                          recoveryInstruction: {
                            type: [
                              "string",
                              "null",
                            ],
                          },
                        },

                        required: [
                          "sport",
                          "kind",
                          "phase",
                          "label",
                          "repeatCount",
                          "workDurationSeconds",
                          "workDistanceMeters",
                          "workIntensity",
                          "workInstruction",
                          "recoveryDurationSeconds",
                          "recoveryDistanceMeters",
                          "recoveryIntensity",
                          "recoveryInstruction",
                        ],
                      },
                    },

                    strengthStructure:
                      strengthStructureSchema,

                  },

                  required: [
                    "day",
                    "sport",
                    "title",
                    "durationMinutes",
                    "intensity",
                    "purpose",
                    "details",
                    "workoutStructure",
                    "strengthStructure",
                  ],
                },
              },

              additionalSessions: {
                type: "array",
                maxItems: 4,

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

                    workoutStructure: {
                      type: "array",

                      items: {
                        type: "object",
                        additionalProperties: false,

                        properties: {
                          sport: {
                            type: "string",
                            enum: [
                              "Swim",
                              "Bike",
                              "Run",
                            ],
                          },

                          kind: {
                            type: "string",
                            enum: [
                              "segment",
                              "repeat",
                            ],
                          },

                          phase: {
                            type: "string",
                            enum: [
                              "Warm-up",
                              "Main",
                              "Recovery",
                              "Cool-down",
                            ],
                          },

                          label: {
                            type: "string",
                          },

                          repeatCount: {
                            type: "number",
                          },

                          workDurationSeconds: {
                            type: [
                              "number",
                              "null",
                            ],
                          },

                          workDistanceMeters: {
                            type: [
                              "number",
                              "null",
                            ],
                          },

                          workIntensity: {
                            type: "string",
                          },

                          workInstruction: {
                            type: "string",
                          },

                          recoveryDurationSeconds: {
                            type: [
                              "number",
                              "null",
                            ],
                          },

                          recoveryDistanceMeters: {
                            type: [
                              "number",
                              "null",
                            ],
                          },

                          recoveryIntensity: {
                            type: [
                              "string",
                              "null",
                            ],
                          },

                          recoveryInstruction: {
                            type: [
                              "string",
                              "null",
                            ],
                          },
                        },

                        required: [
                          "sport",
                          "kind",
                          "phase",
                          "label",
                          "repeatCount",
                          "workDurationSeconds",
                          "workDistanceMeters",
                          "workIntensity",
                          "workInstruction",
                          "recoveryDurationSeconds",
                          "recoveryDistanceMeters",
                          "recoveryIntensity",
                          "recoveryInstruction",
                        ],
                      },
                    },

                    strengthStructure:
                      strengthStructureSchema,

                    sessionSource: {
                      type: "string",
                      enum: ["coach"],
                    },

                    sessionRole: {
                      type: "string",
                      enum: ["secondary"],
                    },

                    sessionSlot: {
                      type: "string",
                      enum: [
                        "AM",
                        "PM",
                        "Flexible",
                      ],
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
                    "workoutStructure",
                    "strengthStructure",
                    "sessionSource",
                    "sessionRole",
                    "sessionSlot",
                  ],
                },
              },
            },

            required: [
              "summary",
              "totalHours",
              "focus",
              "days",
              "additionalSessions",
            ],
          },
        },
      },
    });

    let parsedPlan:
      unknown;

    try {
      parsedPlan =
        JSON.parse(
          response.output_text
        );
    } catch {
      console.error(
        "Invalid plan JSON:",
        response.output_text
      );

      return NextResponse.json(
        {
          error:
            "Coach returned an invalid training plan",
        },
        {
          status: 500,
        }
      );
    }


    if (
      !isGeneratedPlanShape(
        parsedPlan
      )
    ) {
      console.error(
        "Initial plan failed runtime shape validation:",
        parsedPlan
      );

      return NextResponse.json(
        {
          error:
            "Coach returned an incomplete training plan",
        },
        {
          status: 422,
        }
      );
    }


    const initialHoursMax =
      getInitialWeekHoursMax(
        athlete,
        initialWeekContext
          .remainingDays
      );


    const initialWeekFeasibility =
      getInitialWeekFeasibleCapacity({
        athlete,

        availability:
          trainingAvailability,

        todayIso:
          initialWeekContext
            .todayIso,
      });


    const initialHoursMin =
      getInitialWeekRecommendedHoursMin({
        currentTrainingHours:
          numberOrNull(
            athlete.currentTrainingHours
          ) ??
          0,

        safeInitialHoursMax:
          initialHoursMax ??
          0,

        feasibility:
          initialWeekFeasibility,

        todayIso:
          initialWeekContext
            .todayIso,

        phase:
          evidencePhase,
      });


    function finalizeCandidate(
      candidate:
        TrainingPlan
    ) {

      const prescribed =
        applyBenchmarkPrescriptionToPlan(
          candidate,
          athlete
        );


      const normalized =
        normalizeCoachGeneratedPlan(
          prescribed
        );


      return attachCanonicalInitialWeekDates(
        normalized,
        initialWeekContext
      );
    }


    function auditInitialCandidate(
      candidate:
        TrainingPlan
    ) {

      const planAudit =
        auditTrainingPlan({
          plan:
            candidate,

          athlete,

          phase:
            evidencePhase,

          previousPlan:
            null,

          recommendedHoursMin:
            initialHoursMin >
            0
              ? initialHoursMin
              : null,

          recommendedHoursMax:
            initialHoursMax,
        });


      const benchmarkAudit =
        auditBenchmarkUsage({
          plan:
            candidate,

          benchmarks:
            athlete?.benchmarks,
        });


      const canonicalAudit =
        validateCanonicalGeneratedPlan(
          candidate
        );


      const availabilityCheck =
        validatePlanAgainstResolvedAvailability({
          plan:
            candidate,

          athlete,

          availability:
            trainingAvailability,
        });


      const allSessions = [
        ...candidate.days,
        ...(
          candidate
            .additionalSessions ??
          []
        ),
      ];


      const pastDayErrors =
        allSessions
          .filter(
            (session) =>
              session.sport !==
                "Rest" &&
              session.durationMinutes >
                0 &&
              !!session.date &&
              session.date <
                initialWeekContext
                  .todayIso
          )
          .map(
            (session) =>
              `${session.day} contains training on past date ${session.date}.`
          );


      const errors = [
        ...planAudit.errors,
        ...benchmarkAudit.errors,
        ...canonicalAudit.errors,
        ...availabilityCheck
          .violations
          .map(
            (violation) =>
              violation.message
          ),
        ...pastDayErrors,
      ];


      const warnings = [
        ...planAudit.warnings,
        ...benchmarkAudit.warnings,
      ];


      return {
        valid:
          errors.length ===
          0,

        errors,
        warnings,

        planAudit,
        benchmarkAudit,
        canonicalAudit,
        availabilityCheck,
      };
    }


    let plan =
      finalizeCandidate(
        parsedPlan
      );


    let quality =
      auditInitialCandidate(
        plan
      );


    if (
      !quality.valid
    ) {

      console.warn(
        "Initial TriCoach plan failed quality wall. Attempting minimal repair.",
        {
          errors:
            quality.errors,

          warnings:
            quality.warnings,

          firstWeekHoursMin:
            initialHoursMin,

          firstWeekHoursMax:
            initialHoursMax,

          firstWeekFeasibleHours:
            initialWeekFeasibility
              .feasibleHours,

          today:
            initialWeekContext
              .todayIso,

          weekStart:
            initialWeekContext
              .weekStart,
        }
      );


      const repairResponse =
        await openai.responses.create({
          model:
            "gpt-5.6-luna",

          instructions: `
You are the quality-control repair engine for Basse / TriCoach.

A FIRST-WEEK triathlon plan has already been generated.
Deterministic quality checks found one or more hard problems.

Your job is NOT to redesign the week creatively.

Make the SMALLEST changes necessary to make the plan safe,
executable and internally consistent.

AUTHORITATIVE ATHLETE:
${JSON.stringify(
  athlete,
  null,
  2
)}

AUTHORITATIVE DATE CONTEXT:
Today: ${initialWeekContext.todayIso}
Monday of this week: ${initialWeekContext.weekStart}
Days remaining including today: ${initialWeekContext.remainingDays}

FIRST-WEEK LOAD ENVELOPE:

Minimum:
${
  initialHoursMin > 0
    ? `${initialHoursMin} hours minimum.`
    : "No deterministic numerical minimum applies."
}

Maximum:
${
  initialHoursMax === null
    ? "No deterministic numerical ceiling available."
    : `${initialHoursMax} hours maximum.`
}

The minimum already accounts for:
- recent tolerated training volume
- training phase
- partial first-week timing
- Calendar / weekly scheduling feasibility
- the safe initial load ceiling

Do NOT add unsafe density merely to reach the minimum.
If the deterministic minimum is present, repair the week
with the smallest sensible changes that reach it while
still satisfying every safety and availability rule.

WEEKLY AVAILABILITY:
${weeklyAvailabilityGuidance}

CALENDAR AVAILABILITY:
${availabilityGuidance}

PLAN THAT FAILED:
${JSON.stringify(
  plan,
  null,
  2
)}

HARD QUALITY ERRORS:
${JSON.stringify(
  quality.errors,
  null,
  2
)}

QUALITY WARNINGS:
${JSON.stringify(
  quality.warnings,
  null,
  2
)}

REPAIR RULES:

1. Fix EVERY hard error.

2. Preserve the original week wherever it is already safe.

3. This is the athlete's FIRST generated week.
Do not create catch-up training.

4. Never schedule training before ${initialWeekContext.todayIso}.
Past weekdays must remain Rest with 0 minutes.

5. Respect Calendar and recurring weekly availability exactly.

6. Respect the athlete's maximum realistic session duration.

7. Respect equipment access.

8. Never invent FTP, CSS, threshold pace, race pace,
heart-rate zones, kilogram loads or 1RM values.

9. Do not add numerical benchmark targets unless valid athlete
benchmark data supports them.

10. Do not stack unnecessary demanding sessions.

11. At most one demanding session may occur on a calendar day.

12. Keep exactly seven PRIMARY Monday-Sunday entries.

13. additionalSessions must always be present.
Use [] if none are justified.

14. Keep no more than three real sessions on a single day.

15. Recalculate totalHours from every primary and secondary
session duration.

16. ${
  initialHoursMax === null
    ? "Keep total load conservative for the athlete's current tolerance."
    : `totalHours MUST NOT exceed ${initialHoursMax} hours.`
}

16a. ${
  initialHoursMin > 0
    ? `totalHours MUST be at least ${initialHoursMin} hours unless another hard safety or availability rule makes that impossible. The deterministic feasibility calculation has already reduced this floor for known Calendar constraints.`
    : "No deterministic minimum-volume floor applies to this week."
}

17. Swim, Bike and Run use workoutStructure as their executable
source of truth and strengthStructure must be null.

17a. Every workoutStructure block must include its actual sport.
A normal single-discipline workout uses its workout sport on every block.
A Bike-to-Run brick uses sport "Bike" for Bike blocks and sport "Run" for Run blocks.
Never hide a planned Run component only inside title, purpose or details.

18. Strength uses strengthStructure as its executable source of
truth and workoutStructure must be [].

19. Rest uses workoutStructure [] and strengthStructure null.

20. details must describe the SAME workout as its canonical
structure.

21. Preserve useful workoutStructure / strengthStructure when
the workout itself does not need to change.

22. If a workout must change, update its canonical structure
to exactly match the repaired workout.

23. Endurance workoutStructure time values use seconds and
distance values use metres.

24. Keep the athlete-facing wording simple and executable.

Return ONLY one JSON object with:

{
  "summary": "string",
  "totalHours": 0,
  "focus": "string",
  "days": [
    {
      "day": "Monday",
      "sport": "Swim | Bike | Run | Strength | Rest",
      "title": "string",
      "durationMinutes": 0,
      "intensity": "string",
      "purpose": "string",
      "details": ["string"],
      "workoutStructure": [],
      "strengthStructure": null
    }
  ],
  "additionalSessions": []
}

No markdown.
No explanation.
No text before or after the JSON.
          `,

          input:
            "Repair the first training week using the deterministic audit findings.",
        });


      let repairedRaw:
        unknown;

      try {
        repairedRaw =
          JSON.parse(
            repairResponse
              .output_text
          );
      } catch {
        console.error(
          "Initial-plan repair returned invalid JSON:",
          repairResponse
            .output_text
        );

        return NextResponse.json(
          {
            error:
              "Basse could not safely repair the first training week.",
          },
          {
            status: 422,
          }
        );
      }


      if (
        !isGeneratedPlanShape(
          repairedRaw
        )
      ) {
        console.error(
          "Initial-plan repair failed runtime shape validation:",
          repairedRaw
        );

        return NextResponse.json(
          {
            error:
              "Basse could not safely repair the first training week.",
          },
          {
            status: 422,
          }
        );
      }


      plan =
        finalizeCandidate(
          repairedRaw
        );


      quality =
        auditInitialCandidate(
          plan
        );


      if (
        !quality.valid
      ) {

        console.error(
          "Initial-plan repair failed quality wall:",
          {
            errors:
              quality.errors,

            warnings:
              quality.warnings,

            plan,
          }
        );

        return NextResponse.json(
          {
            error:
              "Basse could not create a first training week that passed its safety checks.",

            audit: {
              errors:
                quality.errors,

              warnings:
                quality.warnings,
            },
          },
          {
            status: 422,
          }
        );
      }


      console.info(
        "Initial TriCoach plan automatically repaired and passed quality wall.",
        {
          remainingWarnings:
            quality.warnings,

          finalHours:
            plan.totalHours,

          firstWeekHoursMin:
            initialHoursMin,

          firstWeekHoursMax:
            initialHoursMax,

          firstWeekFeasibleHours:
            initialWeekFeasibility
              .feasibleHours,
        }
      );
    }


    if (
      quality.warnings.length >
      0
    ) {
      console.warn(
        "Initial TriCoach plan quality warnings:",
        quality.warnings
      );
    }


    return NextResponse.json({
      plan,
    });
  } catch (error) {
    console.error("TriCoach plan API error:", error);

    return NextResponse.json(
      { error: "Could not generate training plan" },
      { status: 500 }
    );
  }
}
