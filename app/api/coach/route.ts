import {
  getCanonicalTrainingPhase,
  getCanonicalWeeksUntilRace,
} from "@/lib/training-phase";

import {
  createOpenAIClient,
} from "@/lib/openai-server";
import { NextResponse } from "next/server";

import type {
  TrainingPlanDay,
} from "@/types/training";

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
  buildBenchmarkAwareness,
} from "@/lib/benchmark-awareness";

import {
  buildSessionLibraryGuidance,
} from "@/lib/session-library";

import {
  buildMultiSessionPlanningGuidance,
} from "@/lib/multi-session-planning";

import {
  buildDisciplineAllocationGuidance,
} from "@/lib/discipline-allocation";

import {
  buildAvailabilityGuidance,
  buildWeeklyAvailabilityGuidance,
} from "@/lib/training-availability";

import {
  prepareCoachPlanForReturn,
  validateCoachCanonicalChanges,
  validateCoachPlanAvailability,
} from "@/lib/coach-plan-safety";

import { INTENSITY_PRESCRIPTION_POLICY } from "@/lib/intensity-prescription-policy";
import { buildCoachingSignals } from "@/lib/adaptive-coaching";
import { buildAthleteState } from "@/lib/athlete-state";
import { buildDecisionTrace } from "@/lib/decision-trace";

const openai =
  createOpenAIClient();


/*
  ========================================================
  CANONICAL STRENGTH STRUCTURE SCHEMA
  ========================================================

  New or modified Strength sessions should use this as
  their executable source of truth.

  null remains allowed because Coach must be able to
  preserve unchanged legacy / athlete-owned sessions
  without silently rewriting them.
*/
const coachStrengthStructureSchema:
  Record<string, unknown> = {
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


type ArchiveWeek = {
  plan?: {
    totalHours?: number;
  };
  feedback?: Array<{
    status?: string;
    rpe?: number | null;
    feeling?: string | null;
    actualDurationMinutes?: number | null;
    plannedDurationMinutes?: number | null;
  }>;
};



function summarizeTrainingTrend(
  trainingArchive: ArchiveWeek[] = [],
  currentFeedback: ArchiveWeek["feedback"] = []
) {
  const recentWeeks = trainingArchive.slice(-3);

  const feedback = [
    ...recentWeeks.flatMap(
      (week) => week.feedback ?? []
    ),
    ...(currentFeedback ?? []),
  ];

  const completed = feedback.filter(
    (item) =>
      item.status === "Completed" ||
      item.status === "Modified"
  );

  const skipped = feedback.filter(
    (item) => item.status === "Skipped"
  );

  const rpes = completed
    .map((item) => item.rpe)
    .filter(
      (value): value is number =>
        typeof value === "number"
    );

  const averageRpe =
    rpes.length > 0
      ? rpes.reduce((a, b) => a + b, 0) /
        rpes.length
      : null;

  const heavySessions = completed.filter(
    (item) =>
      (item.rpe ?? 0) >= 8 ||
      item.feeling === "Heavy"
  ).length;

  const plannedMinutes = feedback.reduce(
    (sum, item) =>
      sum + (item.plannedDurationMinutes ?? 0),
    0
  );

  const actualMinutes = feedback.reduce(
    (sum, item) =>
      sum + (item.actualDurationMinutes ?? 0),
    0
  );

  const completionRate =
    plannedMinutes > 0
      ? actualMinutes / plannedMinutes
      : null;

  return {
    weeksAnalyzed: recentWeeks.length,
    sessionsAnalyzed: feedback.length,
    completedSessions: completed.length,
    skippedSessions: skipped.length,
    averageRpe:
      averageRpe === null
        ? null
        : Number(averageRpe.toFixed(1)),
    heavySessions,
    completionRate:
      completionRate === null
        ? null
        : Number(
            (completionRate * 100).toFixed(0)
          ),
  };
}


type ImpactWorkout = {
  sport?: string;
  durationMinutes?: number;

  coachAdjustment?: {
    originalWorkout?: {
      sport?: string;
      durationMinutes?: number;
    };
  };
};

type ImpactPlan = {
  days?: ImpactWorkout[];
  additionalSessions?: ImpactWorkout[];
};

function calculatePlanHours(
  plan:
    | {
        days?: Array<{
          durationMinutes?: number;
        }>;

        additionalSessions?: Array<{
          durationMinutes?: number;
        }>;
      }
    | null
    | undefined
) {
  const sessions = [
    ...(plan?.days ?? []),
    ...(plan?.additionalSessions ?? []),
  ];

  const totalMinutes =
    sessions.reduce(
      (
        total,
        session
      ) =>
        total +
        (
          Number(
            session.durationMinutes
          ) || 0
        ),
      0
    );

  return Number(
    (
      totalMinutes /
      60
    ).toFixed(2)
  );
}



function calculateCurrentWeekImpact(
  plan: ImpactPlan | null | undefined
) {
  const days = [
    ...(
      Array.isArray(
        plan?.days
      )
        ? plan.days
        : []
    ),

    ...(
      Array.isArray(
        plan?.additionalSessions
      )
        ? plan.additionalSessions
        : []
    ),
  ];

  let originalMinutes = 0;
  let currentMinutes = 0;

  let removedSessions = 0;
  let reducedSessions = 0;

  const lostMinutesByDiscipline:
    Record<string, number> = {};

  const originalSessionsByDiscipline:
    Record<string, number> = {};

  const currentSessionsByDiscipline:
    Record<string, number> = {};

  for (const day of days) {
    const original =
      day.coachAdjustment
        ?.originalWorkout;

    const originalSport =
      original?.sport ??
      day.sport ??
      "Unknown";

    const originalDuration =
      Number(
        original?.durationMinutes ??
        day.durationMinutes ??
        0
      ) || 0;

    const currentSport =
      day.sport ?? "Unknown";

    const currentDuration =
      Number(
        day.durationMinutes ?? 0
      ) || 0;

    originalMinutes +=
      originalDuration;

    currentMinutes +=
      currentDuration;

    if (
      originalSport !== "Rest" &&
      originalDuration > 0
    ) {
      originalSessionsByDiscipline[
        originalSport
      ] =
        (
          originalSessionsByDiscipline[
            originalSport
          ] ?? 0
        ) + 1;
    }

    if (
      currentSport !== "Rest" &&
      currentDuration > 0
    ) {
      currentSessionsByDiscipline[
        currentSport
      ] =
        (
          currentSessionsByDiscipline[
            currentSport
          ] ?? 0
        ) + 1;
    }

    const lostMinutes =
      Math.max(
        0,
        originalDuration -
          currentDuration
      );

    if (lostMinutes > 0) {
      lostMinutesByDiscipline[
        originalSport
      ] =
        (
          lostMinutesByDiscipline[
            originalSport
          ] ?? 0
        ) + lostMinutes;
    }

    const removed =
      originalSport !== "Rest" &&
      originalDuration > 0 &&
      (
        currentSport === "Rest" ||
        currentDuration === 0
      );

    if (removed) {
      removedSessions += 1;
    } else if (
      lostMinutes > 0
    ) {
      reducedSessions += 1;
    }
  }

  const lostMinutes =
    Math.max(
      0,
      originalMinutes -
        currentMinutes
    );

  const lossRatio =
    originalMinutes > 0
      ? lostMinutes /
        originalMinutes
      : 0;

  const missingDisciplines =
    Object.keys(
      originalSessionsByDiscipline
    ).filter(
      (sport) =>
        (
          originalSessionsByDiscipline[
            sport
          ] ?? 0
        ) > 0 &&
        (
          currentSessionsByDiscipline[
            sport
          ] ?? 0
        ) === 0
    );

  const meaningfulLoss =
    removedSessions >= 2 ||
    lostMinutes >= 90 ||
    lossRatio >= 0.2 ||
    missingDisciplines.length > 0;

  return {
    originalMinutes,
    currentMinutes,
    lostMinutes,

    originalHours:
      Number(
        (
          originalMinutes / 60
        ).toFixed(1)
      ),

    currentHours:
      Number(
        (
          currentMinutes / 60
        ).toFixed(1)
      ),

    lostHours:
      Number(
        (
          lostMinutes / 60
        ).toFixed(1)
      ),

    lossPercent:
      Math.round(
        lossRatio * 100
      ),

    removedSessions,
    reducedSessions,

    lostMinutesByDiscipline,
    missingDisciplines,

    impact:
      meaningfulLoss
        ? "Meaningful"
        : lostMinutes > 0
        ? "Small"
        : "None",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
      message,
      athlete,
      trainingPlan,
      workoutHistory = [],
      trainingArchive = [],
      readinessHistory = [],
      todayReadiness = null,
      todayContext = null,
      history = [],
    } = body;

    const allPlanSessions = [
      ...(
        trainingPlan?.days ??
        []
      ),

      ...(
        trainingPlan
          ?.additionalSessions ??
        []
      ),
    ];


    const todaysWorkouts =
      allPlanSessions.filter(
        (
          workout: {
            day?: string;
            date?: string;
          }
        ) => {

          if (
            todayContext?.date &&
            workout.date
          ) {
            return (
              workout.date ===
              todayContext.date
            );
          }


          if (
            todayContext?.dayKey &&
            workout.day
          ) {
            return (
              workout.day
                .slice(0, 3)
                .toLowerCase() ===
              String(
                todayContext.dayKey
              ).toLowerCase()
            );
          }


          return false;
        }
      );


    const todaysWorkout =
      todaysWorkouts[0] ??
      null;


    /*
      Coach is current-day adaptive coaching.

      Prefer the athlete/client calendar date explicitly sent
      in todayContext. This keeps phase and race proximity tied
      to the day the athlete is actually interacting with Coach,
      rather than to the server wall clock.

      trainingPlan.weekStart is retained as a legacy/fallback
      calendar anchor when todayContext is absent or invalid.

      Server time is only the final fallback.
    */
    const coachReferenceDate =
      (() => {

        const referenceIso =
          (
            typeof todayContext?.date ===
              "string" &&
            /^\\d{4}-\\d{2}-\\d{2}$/.test(
              todayContext.date
            )
          )
            ? todayContext.date
            : (
                typeof trainingPlan?.weekStart ===
                  "string" &&
                /^\\d{4}-\\d{2}-\\d{2}$/.test(
                  trainingPlan.weekStart
                )
              )
              ? trainingPlan.weekStart
              : null;


        if (
          referenceIso
        ) {

          const candidate =
            new Date(
              `${referenceIso}T12:00:00`
            );


          if (
            !Number.isNaN(
              candidate.getTime()
            )
          ) {
            return candidate;
          }
        }


        const fallback =
          new Date();

        fallback.setHours(
          12,
          0,
          0,
          0
        );

        return fallback;
      })();


    const trainingPhase =
      getCanonicalTrainingPhase(
        athlete?.raceDate,
        coachReferenceDate
      );

    const evidencePhase =
      inferEvidenceTrainingPhase(
        athlete?.raceDate,
        coachReferenceDate
      );

    const trainingScience =
      buildTrainingScienceGuidance({
        athlete: athlete ?? {},
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
      });

    const disciplineAllocationGuidance =
      buildDisciplineAllocationGuidance({
        athlete: athlete ?? {},
        phase: evidencePhase,

        weeklyHours:
          trainingPlan?.totalHours ??
          (
            Number(
              athlete?.currentTrainingHours
            ) || null
          ),
      });

    const currentWeekImpact =
      calculateCurrentWeekImpact(
        trainingPlan
      );

    const weeksRemaining =
      getCanonicalWeeksUntilRace(
        athlete?.raceDate,
        coachReferenceDate
      );

    const trainingTrend =
      summarizeTrainingTrend(
        trainingArchive,
        workoutHistory
      );

    const coachingSignals =
      buildCoachingSignals({
        workoutHistory,
        readinessHistory,

        currentPlanHours:
          trainingPlan?.totalHours ?? 0,

        roadmapTargetHours:
          null,

        athleteHours:
          athlete?.hoursPerWeek ?? null,
      });

    const athleteState =
      buildAthleteState({
        workoutHistory,
        trainingArchive,
        readinessHistory,
      });

    const decisionTrace =
      buildDecisionTrace({
        coachingSignals,
        athleteState,
      });

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    const raceDistanceGuidance =
      buildRaceDistanceGuidance({
        athlete: athlete ?? {},
        phase: evidencePhase,
        weeksUntilRace:
          getCanonicalWeeksUntilRace(
            athlete?.raceDate,
            coachReferenceDate
          ),
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

    const benchmarkAwareness =
      buildBenchmarkAwareness(
        athlete?.benchmarks
      );


    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      instructions: `
You are TriCoach, a personal triathlon coach.

The athlete may be recreational, competitive, elite or professional.

Your job is to help this specific athlete make sensible training
decisions across swimming, cycling and running.

Performance tier is context, not permission to assume greater
training tolerance, recovery or discipline-specific competence.

ATHLETE PROFILE:
Name: ${athlete?.name || "Unknown"}
Unit system: ${athlete?.unitSystem || "Metric"}
Goal: ${athlete?.goal || "Unknown"}
Race date: ${athlete?.raceDate || "Unknown"}
Available training: ${athlete?.hoursPerWeek || "Unknown"} hours/week
Weakest discipline: ${athlete?.weakestDiscipline || "Unknown"}

Triathlon experience: ${athlete?.experience || "Unknown"}
Performance tier: ${athlete?.performanceTier || "Recreational"}
Current weekly training: ${athlete?.currentTrainingHours || "Unknown"} hours

Swim level: ${athlete?.swimLevel || "Unknown"}
Bike level: ${athlete?.bikeLevel || "Unknown"}
Run level: ${athlete?.runLevel || "Unknown"}

Available training days:
${JSON.stringify(athlete?.availableDays || [])}

Longest realistic session:
${athlete?.longestSessionMinutes || "Unknown"} minutes

AUTHORITATIVE ATHLETE CONSTRAINTS:
- The CURRENT ATHLETE PROFILE above is the source of truth for the athlete's normal weekly training availability and longest realistic session.
- Available training is exactly ${athlete?.hoursPerWeek || "Unknown"} hours/week.
- Longest realistic session is exactly ${athlete?.longestSessionMinutes || "Unknown"} minutes.
- Never replace these values with older values mentioned in conversation history.
- Previous assistant messages may contain stale or incorrect athlete limits. Ignore them when they conflict with the current athlete profile.
- Do not infer weekly-hour or maximum-session limits from defaults, previous plans, currentTrainingHours, workout history, or normal weekly discipline availability.
- NORMAL WEEKLY DISCIPLINE AVAILABILITY controls which days/disciplines are normally available. It is NOT an hours-per-week or session-duration limit.
- Date-specific Calendar restrictions may temporarily impose a stricter limit for that specific date only.
- Before claiming that a plan exceeds the athlete's stated limits, compare it against the CURRENT values above.
- Never invent a numeric training constraint that is not present in the current athlete profile or a current date-specific Calendar restriction.

Equipment:
Pool access: ${athlete?.poolAccess ? "Yes" : "No"}
Indoor trainer: ${athlete?.indoorTrainer ? "Yes" : "No"}
Gym access: ${athlete?.gymAccess ? "Yes" : "No"}

Limitations / athlete notes:
${athlete?.limitations || "None supplied"}

UNIT RULES:
- Metric uses kilometres, metres and min/km where relevant.
- Imperial uses miles, yards and min/mi where relevant.
- Use the selected unit system in athlete-facing answers and proposed workout text.
- Do not alter physiological decisions or training load because of display units.
- Do not invent numerical targets merely to demonstrate the selected unit system.

TARGET RACE DETAILS:
${athlete?.targetRace
  ? JSON.stringify(
      athlete.targetRace,
      null,
      2
    )
  : "No detailed target race available."}

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

BENCHMARK AWARENESS:
${JSON.stringify(
  benchmarkAwareness,
  null,
  2
)}

BENCHMARK-AWARENESS RULES:

- Missing benchmark data is NOT a problem by itself.
- Do not repeatedly tell the athlete to test.
- Do not make benchmark testing a prerequisite for training.
- RPE-based training remains fully valid.
- Mention a benchmark test only when it would materially improve
  the current coaching decision or future prescription.
- Prefer natural opportunities for testing rather than adding
  unnecessary maximal tests.
- Do not recommend retesting merely because a fixed number of
  days has passed.
- "Stale" means consider whether an update would be useful,
  not that the stored benchmark is automatically invalid.
- Recent workout execution and race results may provide enough
  information without formal testing.
- Avoid maximal testing during inappropriate fatigue, recovery,
  illness, injury concern or immediately before an important race.
- Never alter an otherwise good training week simply to collect
  benchmark data.
- Keep any athlete-facing benchmark suggestion short and explain
  what practical benefit the test would provide.

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

RACE-COURSE COACHING RULES:
The detailed target race profile describes the actual demands
the athlete is preparing for.

Use it when it materially improves the answer.

In particular, use race-course information to:
- explain why a workout or training block is relevant
- identify important race-specific demands
- assess whether removing or replacing a session loses an
  important race-specific stimulus
- suggest appropriate alternatives when a workout must change
- explain how specificity should progress toward race day
- answer questions about why the plan contains climbing,
  steady aero work, terrain exposure, bricks, fueling practice,
  open-water preparation or other race-relevant work

Do not force race specificity into unrelated answers.

Race specificity changes the CONTENT and PURPOSE of training.
It does not independently authorize more training load.

Examples:
- a mountainous bike race may make a climbing session more
  strategically important than a generic endurance ride
- a flat long-course race may make sustained aero-position
  durability particularly relevant
- a mountainous or trail run may justify progressive terrain
  and climbing durability
- an open-water race may make open-water skills relevant
  when conditions, ability and safety allow
- long-course racing may make fueling practice strategically
  important during suitable longer sessions

When explaining race-specific training:
- connect the workout to the actual race demand
- explain the connection simply
- do not exaggerate the importance of one session
- remember that specificity should increase progressively
  with training phase and proximity to race day

When considering a plan change:
- preserve an important race-specific stimulus when practical
- but do NOT preserve it at the expense of recovery or safety
- replacing a race-specific session with a safer equivalent
  is preferable to blindly keeping the original workout

If targetRace.userModified is true, or the athlete has manually
edited race fields, treat the athlete-edited race values as
authoritative for coaching.

Never claim race-course details that are not present in the
provided target race data or race-specific guidance.

TRICOACH SESSION LIBRARY:
${sessionLibrary}

MULTI-SESSION PLANNING:

${multiSessionGuidance}

${weeklyAvailabilityGuidance}

${availabilityGuidance}
CALENDAR AVAILABILITY — NON-NEGOTIABLE

- Date-specific Calendar availability is a HARD constraint.
- It overrides preservation of the previous plan structure.
- A BRICK workout always uses BOTH Bike AND Run,
  even when its main sport field says only "Bike".
- If Bike is blocked, a Bike→Run brick is not allowed.
- If Run is blocked, a Bike→Run brick is not allowed.
- Never keep, create or move a brick onto a date where
  either Bike or Run is unavailable.
- If previousPreview conflicts with availability, CHANGE
  the conflicting workout. Do not preserve it.


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

CURRENT TRAINING PLAN:
${trainingPlan
  ? JSON.stringify(trainingPlan, null, 2)
  : "No active training plan available."}

TODAY'S DATE / DAY CONTEXT:
${todayContext
  ? JSON.stringify(todayContext, null, 2)
  : "No explicit today context available."}

TODAY'S SCHEDULED SESSIONS:
${todaysWorkouts.length > 0
  ? JSON.stringify(todaysWorkouts, null, 2)
  : "No scheduled workout matched today."}

IMPORTANT TODAY RULE:
- If the athlete refers to "today", use TODAY'S SCHEDULED SESSIONS above.
- A day may contain one or two sessions.
- Never assume that the first session is the only session scheduled today.
- If there are two sessions and the athlete refers to one specifically, identify it by sport, title, sessionId or sessionSlot when possible.
- Do not ask which workout is scheduled when the athlete's wording makes the intended session clear.
- If the athlete asks to change the whole day, consider both sessions together.
- When a concrete plan adjustment is useful, return it in updatedPlan so the athlete can review and approve the proposed change.

CURRENT TRAINING PHASE:
${trainingPhase}

WEEKS TO RACE:
${weeksRemaining ?? "Unknown"}

MULTI-WEEK TRAINING TREND:
${JSON.stringify(trainingTrend, null, 2)}

DETERMINISTIC COACHING SIGNALS:
${JSON.stringify(coachingSignals, null, 2)}

ATHLETE STATE — RECENT MULTI-WEEK PATTERNS:
${JSON.stringify(athleteState, null, 2)}

DECISION TRACE — USER-FACING EVIDENCE:
${JSON.stringify(decisionTrace, null, 2)}

DECISION TRACE RULES:
- This trace contains concise evidence that may be shown to the athlete.
- Do not expose hidden reasoning or chain-of-thought.
- If explaining a recommendation, prefer these explicit signals.
- Do not invent additional evidence.
- Keep explanations short and practical.

ATHLETE STATE RULES:
- Athlete State is derived from logged training and readiness data.
- Treat it as evidence, not personality.
- Never invent a pattern that is not supported by Athlete State.
- Respect athleteState.dataQuality.
- With Low data quality, avoid strong conclusions.
- Use discipline patterns only when they are relevant to the athlete's question.
- Do not repeat Athlete State mechanically to the athlete.
- Use it to make coaching decisions more individualized.

IMPORTANT:
These signals were calculated before the conversational AI step.

Treat them as coaching guardrails.

CURRENT LOAD DECISION:
${coachingSignals.loadDecision}

FATIGUE RISK:
${coachingSignals.fatigueRisk}

CONSISTENCY:
${coachingSignals.consistency}

SAFE WEEKLY LOAD RANGE:
${coachingSignals.recommendedHoursMin} to ${coachingSignals.recommendedHoursMax} hours.

DECISION REASONS:
${coachingSignals.reasons.join(" ")}

PREVIOUS TRAINING WEEKS:
${trainingArchive?.length
  ? JSON.stringify(
      trainingArchive.slice(-3),
      null,
      2
    )
  : "No archived training weeks yet."}

TODAY'S READINESS:
${todayReadiness
  ? JSON.stringify(todayReadiness, null, 2)
  : "No readiness check-in today."}

RECENT READINESS HISTORY:
${readinessHistory?.length
  ? JSON.stringify(
      readinessHistory.slice(-7),
      null,
      2
    )
  : "No readiness history available."}

READINESS RULES:
- Treat readiness as useful context, not diagnosis.
- One mediocre day should not automatically cancel training.
- Several poor days matter more than one isolated score.
- Caution may justify reduced intensity or duration.
- Recover status plus fatigue should push recommendations toward recovery.
- Good readiness alone is not a reason to increase training.
- Serious warning symptoms override all training goals.

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

MULTI-SESSION AWARENESS:
- trainingPlan.days contains the seven primary calendar slots.
- trainingPlan.additionalSessions may contain coach-planned secondary sessions or athlete-added sessions.
- sessionSource "athlete" means athlete-owned. Do not silently edit or delete it.
- sessionSource "coach" means it belongs to the coaching plan and may be adapted when appropriate.
- Never assume additionalSessions means "manual".
- A double-session day must still respect recovery and total weekly load.
- Never recommend two hard sessions on the same day.

PHASE PRINCIPLES:

BASE:
- Build consistency and general aerobic capacity.
- Improve technique, especially in weak disciplines.
- Keep intensity conservative.

BUILD:
- Increase race-relevant endurance gradually.
- Add controlled quality without sacrificing consistency.
- Avoid aggressive volume jumps.

PEAK:
- Prioritize race-specific sessions and quality.
- Do not chase large fitness gains with excessive volume.
- Protect recovery between key sessions.

TAPER:
- Reduce fatigue while preserving race readiness.
- Lower volume.
- Keep small amounts of controlled intensity.
- Do not add last-minute fitness-chasing sessions.

MULTI-WEEK DECISION RULES:
- Look for trends, not one unusual workout.
- Repeated high RPE or heavy feedback is a reason for caution.
- Low completion means do not automatically increase load.
- Strong completion does not automatically require more volume.
- Never increase training simply because the athlete has unused available hours.
- Prefer sustainable progression over maximal progression.

COACHING PRINCIPLES:
1. Consistency is more important than individual heroic workouts.
2. Do not encourage athletes to make up missed training by stacking hard workouts.
3. Protect recovery and important key sessions.
4. Adapt training to real life.
5. Explain WHY you recommend a change.
6. When race specificity materially influenced a workout or recommendation,
   explain the relevant race demand in simple athlete-facing language.
7. Give practical and specific advice.
7. For beginner swimmers, prioritize technique and confidence.
8. Keep responses relatively concise and conversational.

COACH REPLY FORMAT:
- Write athlete-facing replies so they are easy to scan in a chat.
- Do NOT return one long wall of text when the answer has several ideas.
- When structure helps, use short Markdown-style sections with headings beginning with "## ".
- Prefer 2-4 short sections, not many sections.
- Useful headings include "Recommendation", "Why", "What to do", and "Next".
- Use "- " bullets for short lists, steps, reasons, or key points.
- Keep paragraphs to roughly 1-3 sentences.
- Use blank lines between sections.
- You may use **bold text** sparingly for an important number, workout, or decision.
- Do not use Markdown tables.
- Do not use numbered headings.
- Do not add a heading when a simple one-paragraph answer is clearer.
- The goal is concise, coach-like communication that can be understood in a few seconds.

Example style:

## Recommendation

Keep today's run easy and shorten it to **40 minutes**.

## Why

- Readiness is lower than normal.
- Recent training load is already high.
- Tomorrow contains quality work.

## What to do

- 10 min very easy.
- 25 min conversational.
- 5 min easy cooldown.

## Next

Keep tomorrow unchanged unless recovery worsens.

9. Do not pretend to diagnose injuries or medical conditions.
10. If an athlete describes severe, unusual or concerning symptoms,
recommend stopping or reducing training and seeking appropriate medical assessment.

COACHING DECISION GUARDRAILS:

- The deterministic coachingSignals are the shared TriCoach coaching state.
- Do not contradict coachingSignals.loadDecision without a new safety reason contained in the athlete's current message.
- "Reduce" means recommendations should become easier, shorter, more recovery-oriented, or remain unchanged if changing the plan is unnecessary.
- Do not recommend extra load when loadDecision is "Reduce".
- "Maintain" means do not increase overall training load simply because the athlete feels good today.
- "Increase slightly" permits only conservative progression.
- Good readiness on one day does not override accumulated fatigue signals.
- One poor readiness day does not automatically require cancelling training.
- If the athlete reports new illness, injury, severe fatigue, or concerning symptoms, become more conservative than the deterministic signal if appropriate.
- Never become more aggressive than the deterministic signal because of one positive message.
- When giving advice, explain the most relevant reason behind the recommendation.

CURRENT WEEK IMPACT:

Original planned volume:
${currentWeekImpact.originalHours} hours

Current planned volume:
${currentWeekImpact.currentHours} hours

Volume removed or reduced:
${currentWeekImpact.lostHours} hours
(${currentWeekImpact.lossPercent}% of the original week)

Previously removed sessions:
${currentWeekImpact.removedSessions}

Previously reduced sessions:
${currentWeekImpact.reducedSessions}

Lost minutes by discipline:
${JSON.stringify(
  currentWeekImpact.lostMinutesByDiscipline
)}

Disciplines currently missing compared with the original week:
${JSON.stringify(
  currentWeekImpact.missingDisciplines
)}

Current impact level:
${currentWeekImpact.impact}

IMPORTANT:
This impact describes changes that have ALREADY been applied to the current week.
If the athlete is currently asking to remove or reduce another workout,
consider the additional effect of that requested change as well.

PLAN CHANGE RULES:
- Only return an updatedPlan if a concrete plan change is actually useful.
- If no change is needed, updatedPlan must be null.
- If you change the plan, preserve exactly 7 PRIMARY days Monday through Sunday.
- For every existing workout in updatedPlan.days, preserve and return its exact sessionId.
- Only a genuinely new primary workout may have sessionId null.
- updatedPlan.additionalSessions must contain all secondary sessions that should remain after the change.
- For every existing additional session, preserve and return its exact sessionId.
- If you explicitly adjust an athlete-owned session, keep the same sessionId and sessionSource "athlete".
- Only a genuinely new additional session may have sessionId null.
- Preserve athlete-owned secondary sessions unless the athlete explicitly asks to change or remove one.
- Coach-owned secondary sessions may be adapted when useful.
- Never create more than two secondary sessions on a calendar day.
- Never create a demanding secondary session.
- Never create more than three structured sessions on a calendar day.
- totalHours must include primary AND secondary sessions.
- Do not casually increase total weekly load.
- Do not stack hard sessions.
- Protect recovery.
- Preserve the athlete's available weekly hours as closely as practical.
- If returning updatedPlan, keep totalHours within the shared safe load range unless reducing further for a new safety reason.
- Do not increase totalHours above coachingSignals.recommendedHoursMax.

CANONICAL WORKOUT STRUCTURE — SOURCE OF TRUTH:
- Every workout returned inside updatedPlan must include BOTH workoutStructure and strengthStructure.
- For Swim, Bike and Run, workoutStructure is the executable source of truth and strengthStructure must be null.
- For Rest, workoutStructure must be [] and strengthStructure must be null.
- For a NEW or MODIFIED Strength workout, strengthStructure is the executable source of truth and workoutStructure must be [].
- For an UNCHANGED existing Strength workout, preserve its current canonical structure exactly.
- If an unchanged legacy or athlete-owned Strength workout has no strengthStructure yet, strengthStructure may remain null. Do not rewrite it merely to migrate data.
- Never convert an unchanged athlete-owned session into a different Strength prescription just to populate strengthStructure.
- Every workoutStructure block must include its actual sport.
- Single-discipline blocks normally use the workout's sport.
- A Bike-to-Run brick must use sport "Bike" on Bike blocks and sport "Run" on Run blocks.
- If a connected Bike workout includes planned running at the end, treat it explicitly as a Brick.
- Never hide a Run component only inside details.
- Never leave a Bike workout described as a normal ride when its canonical structure includes a planned Run component.
- details must describe the SAME workout and must never contradict the relevant canonical structure.
- Do not leave warm-up, cool-down, recoveries, rests, or repeated interval structure implicit when the athlete needs them to execute the workout.
- Use kind "segment" for a normal block.
- Use kind "repeat" for repeated intervals or repeated swim reps.
- Use phase only from: Warm-up, Main, Recovery, Cool-down.
- Phase describes the FUNCTION of the block, not merely how easy or hard it feels.
- Warm-up is only the preparatory opening part of the workout.
- Cool-down is only the final down-regulation block whose purpose is to finish the session easily.
- Do NOT label an easy aerobic block as Cool-down just because it is easy or appears late in the workout.
- Easy aerobic riding, endurance riding, steady Zone 1-2 work, technique work, or controlled aerobic work that still belongs to the planned training stimulus must use phase "Main".
- Recovery is only recovery between or after harder efforts when its purpose is to recover for subsequent work.
- Example: 10 min warm-up + 4 x 6 min threshold + 15 min easy aerobic riding + 10 min cool-down must use phases Warm-up, Main, Main, Cool-down respectively.
- repeatCount must be 1 for a normal segment.
- For repeated work, repeatCount is the number of work repetitions.
- Recovery fields in a repeat block describe recovery BETWEEN repetitions.
- Normally there are repeatCount - 1 recoveries. Do not invent a recovery after the final repetition.
- Use seconds for prescribed time inside workoutStructure. Example: 6 min = 360 seconds and 4 min = 240 seconds.
- Use metres for prescribed distance inside workoutStructure.
- A time-based block should normally use workDistanceMeters: null.
- A distance-based block should normally use workDurationSeconds: null unless both are genuinely prescribed.
- workIntensity and recoveryIntensity must clearly communicate the intended effort.
- workInstruction and recoveryInstruction must make the block executable without guessing.
- If a legacy Swim, Bike or Run workout has no workoutStructure and you modify it, create workoutStructure that exactly represents the updated prescription.
- If a legacy Strength workout has no strengthStructure and you modify it, create a complete strengthStructure that exactly represents the updated prescription and return workoutStructure: [].
- For swimming, prefer one repeat block for a repeated set instead of one block per repetition.
- Swim repeats should use workDistanceMeters and explicit recoveryDurationSeconds when rest is time-based.
- Do not collapse a clear repeated swim set into one vague continuous Main block.
- For a NEW or MODIFIED Strength workout, do NOT create descriptive fake workoutStructure blocks. Use workoutStructure: [] and store the complete prescription in strengthStructure.
- Every new or modified Strength exercise must include:
  exerciseKey,
  exact exercise name,
  movementPattern,
  working sets,
  repetitions,
  loadGuidance,
  exact restSeconds,
  one short execution instruction,
  and practical alternatives.
- Follow the supplied TriCoach Strength Engine and current training phase.
- exerciseKey is the stable canonical identity of the exercise.
- Preserve the existing exerciseKey when the exercise itself has not changed.
- If only sets, reps, rest or loadGuidance changes, do not change exerciseKey.
- If the exercise changes, update exerciseKey to match the new canonical exercise.
- Different naming variants of the same exercise must share the same exerciseKey.
- Use "other" only when no canonical key genuinely matches.
- Do not map an exercise to an incorrect key merely because it shares the same movementPattern.
- Use RPE / RIR rather than invented kilogram loads or invented 1RM values.
- Do not routinely prescribe failure.
- Preserve useful primary strength while controlling fatigue.
- If fatigue must be reduced, usually remove low-priority accessory volume or working sets before unnecessarily removing all meaningful strength stimulus.
- Protect important run, bike and brick sessions from avoidable residual strength fatigue.
- Do not introduce novel high-soreness movements during Peak, Taper or race week.
- Power exercises, when justified, belong early in the Strength session and use low repetitions with full movement quality.
- Do not turn Strength into metabolic circuit training.
- When changing one exercise because of equipment, preference or practicality, prefer an alternative with the same movementPattern unless the purpose of the session itself needs to change.
- If the athlete asks for a local Strength adjustment, preserve the remainder of strengthStructure unless changing more is necessary for safety, recovery or the stated goal.
- If loadDecision is "Reduce", do not return an updated plan with more totalHours than the current plan.
- Keep unchanged days unchanged unless changing them is necessary to solve the athlete's request safely.

CHANGE SCOPE RULES:
- Make the smallest useful change to the training plan.
- A local constraint should normally produce a local change.
- If the athlete asks to shorten, modify, replace, or adapt today's workout, change today's workout only unless another day must change for safety or recovery.
- If the athlete has less time available today, preserve the purpose of today's session as well as practical within the new time limit.
- Do not rewrite unrelated sessions merely to rebalance small differences in weekly volume.
- Do not change the week's focus, summary, or unrelated workouts for a simple one-session adjustment unless necessary.
- Moving a workout may require changing both the original day and the destination day.
- A multi-day availability problem may justify reorganizing the affected part of the week.
- Illness, injury, severe fatigue, or several days of poor recovery may justify broader changes when appropriate.
- If a broader change is necessary, explain briefly why more than one session needs to change.
- Be conservative with injury, illness, severe fatigue, or poor recovery.

REMOVAL IMPACT RULES:
- Removing one workout does NOT automatically mean it must be replaced.
- Do not chase the original weekly hour total for its own sake.
- When CURRENT WEEK IMPACT is None or Small, a single local removal should normally remain local unless the session is strategically important.
- When CURRENT WEEK IMPACT is Meaningful, actively assess whether the week has lost an important training stimulus.
- Multiple removed sessions, a loss of roughly 20% or more of original weekly volume, around 90+ lost minutes, or the disappearance of a discipline are strong reasons to consider a replacement or relocation.
- If the athlete is requesting another removal on top of existing losses, consider what the week would look like AFTER that removal, not only the current state.
- Prefer preserving important discipline frequency and key-session purpose over blindly restoring total hours.
- A replacement may be shorter than the removed workout if that preserves the important stimulus with less disruption.
- Use an existing Rest day for replacement only when doing so still leaves adequate recovery elsewhere in the week.
- Do not create unnecessary hard sessions or stack demanding days just to recover lost volume.
- If fatigueRisk is High, loadDecision is Reduce, or the removal is motivated by illness/injury/poor recovery, do NOT force replacement merely because volume has fallen.
- If a safe useful replacement exists, propose it explicitly in updatedPlan.
- If the lower-volume week is genuinely the better coaching choice, say so and leave the lost volume unreplaced.

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
                                      "Strength",
                                    ],
                                  },

                                  kind: {
                                    type: "string",
                                    enum: [
                                      "segment",
                                      "repeat"
                                    ]
                                  },

                                  phase: {
                                    type: "string",
                                    enum: [
                                      "Warm-up",
                                      "Main",
                                      "Recovery",
                                      "Cool-down"
                                    ]
                                  },

                                  label: {
                                    type: "string"
                                  },

                                  repeatCount: {
                                    type: "number"
                                  },

                                  workDurationSeconds: {
                                    type: [
                                      "number",
                                      "null"
                                    ]
                                  },

                                  workDistanceMeters: {
                                    type: [
                                      "number",
                                      "null"
                                    ]
                                  },

                                  workIntensity: {
                                    type: "string"
                                  },

                                  workInstruction: {
                                    type: "string"
                                  },

                                  recoveryDurationSeconds: {
                                    type: [
                                      "number",
                                      "null"
                                    ]
                                  },

                                  recoveryDistanceMeters: {
                                    type: [
                                      "number",
                                      "null"
                                    ]
                                  },

                                  recoveryIntensity: {
                                    type: [
                                      "string",
                                      "null"
                                    ]
                                  },

                                  recoveryInstruction: {
                                    type: [
                                      "string",
                                      "null"
                                    ]
                                  }
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
                                  "recoveryInstruction"
                                ]
                              }
                            },

                            strengthStructure:
                              coachStrengthStructureSchema,

                            sessionId: {
                              type: [
                                "string",
                                "null"
                              ]
                            }
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
                            "sessionId"
                          ]
                        }
                      },

                      additionalSessions: {
                        type: "array",
                        maxItems: 8,

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
                                "Sunday"
                              ]
                            },

                            sport: {
                              type: "string",
                              enum: [
                                "Swim",
                                "Bike",
                                "Run",
                                "Strength"
                              ]
                            },

                            title: {
                              type: "string"
                            },

                            durationMinutes: {
                              type: "number"
                            },

                            intensity: {
                              type: "string"
                            },

                            purpose: {
                              type: "string"
                            },

                            details: {
                              type: "array",
                              items: {
                                type: "string"
                              }
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
                                      "Strength",
                                    ],
                                  },

                                  kind: {
                                    type: "string",
                                    enum: [
                                      "segment",
                                      "repeat"
                                    ]
                                  },

                                  phase: {
                                    type: "string",
                                    enum: [
                                      "Warm-up",
                                      "Main",
                                      "Recovery",
                                      "Cool-down"
                                    ]
                                  },

                                  label: {
                                    type: "string"
                                  },

                                  repeatCount: {
                                    type: "number"
                                  },

                                  workDurationSeconds: {
                                    type: [
                                      "number",
                                      "null"
                                    ]
                                  },

                                  workDistanceMeters: {
                                    type: [
                                      "number",
                                      "null"
                                    ]
                                  },

                                  workIntensity: {
                                    type: "string"
                                  },

                                  workInstruction: {
                                    type: "string"
                                  },

                                  recoveryDurationSeconds: {
                                    type: [
                                      "number",
                                      "null"
                                    ]
                                  },

                                  recoveryDistanceMeters: {
                                    type: [
                                      "number",
                                      "null"
                                    ]
                                  },

                                  recoveryIntensity: {
                                    type: [
                                      "string",
                                      "null"
                                    ]
                                  },

                                  recoveryInstruction: {
                                    type: [
                                      "string",
                                      "null"
                                    ]
                                  }
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
                                  "recoveryInstruction"
                                ]
                              }
                            },

                            strengthStructure:
                              coachStrengthStructureSchema,

                            sessionId: {
                              type: [
                                "string",
                                "null"
                              ]
                            },

                            sessionSource: {
                              type: "string",
                              enum: [
                                "coach",
                                "athlete"
                              ]
                            },

                            sessionRole: {
                              type: "string",
                              enum: [
                                "secondary"
                              ]
                            },

                            sessionSlot: {
                              type: "string",
                              enum: [
                                "AM",
                                "PM",
                                "Flexible"
                              ]
                            }
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
                            "sessionId",
                            "sessionSource",
                            "sessionRole",
                            "sessionSlot"
                          ]
                        }
                      }
                    },

                    required: [
                      "summary",
                      "totalHours",
                      "focus",
                      "days",
                      "additionalSessions"
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

    let updatedPlan =
      coachResult.updatedPlan;

    // -----------------------------------------
    // LOCAL CHANGE GUARD
    //
    // Simple duration adjustments should not
    // cause unrelated sessions to be rewritten.
    // -----------------------------------------

    if (
      updatedPlan &&
      trainingPlan?.days?.length === 7
    ) {
      const normalizedMessage =
        String(message)
          .trim()
          .toLowerCase();

      const durationChangeRequest =
        /\\b\\d+(?:[.,]\\d+)?\\s*(?:min|mins|minute|minutes|h|hr|hrs|hour|hours)\\b/i
          .test(normalizedMessage) ||
        normalizedMessage.includes(
          "shorter"
        ) ||
        normalizedMessage.includes(
          "longer"
        ) ||
        normalizedMessage.includes(
          "more time"
        ) ||
        normalizedMessage.includes(
          "less time"
        );

      const broadScheduleRequest =
        /\\b(move|swap|reschedule|reorganize|reorganise|travel|travelling|traveling|tomorrow|another day|different day|rest of the week|whole week|entire week)\\b/i
          .test(normalizedMessage);

      const weekdayNames = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      const mentionedDays =
        weekdayNames.filter(
          (day) =>
            normalizedMessage.includes(
              day
            )
        );

      const explicitlyNamedDay =
        mentionedDays.length === 1
          ? mentionedDays[0]
          : null;

      /*
        A simple local request may target an additional/manual
        workout rather than the primary workout for that day.
      */
      const currentAdditionalSessions =
        trainingPlan.additionalSessions ??
        [];

      const explicitlyTargetedAdditionalSession =
        currentAdditionalSessions.find(
          (session: TrainingPlanDay) => {
            const sessionTitle =
              String(
                session.title ?? ""
              )
                .trim()
                .toLowerCase();

            if (
              sessionTitle.length >= 3 &&
              normalizedMessage.includes(
                sessionTitle
              )
            ) {
              return true;
            }

            const sessionDay =
              String(
                session.day ?? ""
              ).toLowerCase();

            const sessionSport =
              String(
                session.sport ?? ""
              ).toLowerCase();

            const dayAndSportMentioned =
              normalizedMessage.includes(
                sessionDay
              ) &&
              normalizedMessage.includes(
                sessionSport
              );

            if (dayAndSportMentioned) {
              const matchingAdditional =
                currentAdditionalSessions.filter(
                  (
                    candidate:
                      TrainingPlanDay
                  ) =>
                    candidate.day ===
                      session.day &&
                    candidate.sport ===
                      session.sport
                );

              return (
                matchingAdditional.length === 1
              );
            }

            const sportMentioned =
              normalizedMessage.includes(
                sessionSport
              );

            if (!sportMentioned) {
              return false;
            }

            const allRealSessions = [
              ...trainingPlan.days.filter(
                (
                  candidate:
                    TrainingPlanDay
                ) =>
                  candidate.sport !==
                    "Rest" &&
                  candidate.durationMinutes >
                    0
              ),
              ...currentAdditionalSessions,
            ];

            return (
              allRealSessions.filter(
                (
                  candidate:
                    TrainingPlanDay
                ) =>
                  candidate.sport ===
                    session.sport
              ).length === 1
            );
          }
        ) ?? null;


      const targetDay =
        explicitlyNamedDay
          ? trainingPlan.days.find(
              (
                day: {
                  day?: string;
                }
              ) =>
                day.day
                  ?.toLowerCase() ===
                explicitlyNamedDay
            )?.day ?? null
          : todaysWorkout?.day ?? null;

      /*
        SIMPLE MOVE / SWAP GUARD

        For a straightforward placement request between
        two explicitly named days, Coach may only change
        those affected days.

        Unrelated workouts must remain byte-for-byte
        equivalent from the user's perspective.
      */
      const simplePlacementRequest =
        /\b(move|swap|reschedule|flytt|flytte|bytt|bytte)\b/i
          .test(normalizedMessage) &&
        mentionedDays.length === 2;

      const secondaryPlacementRequest =
        /\b(second|secondary|extra|additional|andre|annen|ekstra|tilleggsøkt)\b/i
          .test(normalizedMessage);

      if (
        simplePlacementRequest &&
        !secondaryPlacementRequest
      ) {
        const affectedDays =
          new Set(
            mentionedDays.map(
              (day) =>
                day.charAt(0).toUpperCase() +
                day.slice(1)
            )
          );

        const protectedDays =
          trainingPlan.days.map(
            (currentDay: {
              day: string;
            }) => {
              if (
                !affectedDays.has(
                  currentDay.day
                )
              ) {
                return currentDay;
              }

              return (
                updatedPlan.days?.find(
                  (
                    proposedDay: {
                      day?: string;
                    }
                  ) =>
                    proposedDay.day ===
                    currentDay.day
                ) ??
                currentDay
              );
            }
          );

        const preservedSecondarySessions =
          trainingPlan.additionalSessions ??
          [];

        updatedPlan = {
          ...updatedPlan,

          focus:
            trainingPlan.focus,

          summary:
            trainingPlan.summary,

          days:
            protectedDays,

          additionalSessions:
            preservedSecondarySessions,

          totalHours:
            calculatePlanHours({
              days:
                protectedDays,

              additionalSessions:
                preservedSecondarySessions,
            }),
        };
      }

      if (
        durationChangeRequest &&
        !broadScheduleRequest
      ) {

        if (
          explicitlyTargetedAdditionalSession
        ) {
          const proposedAdditionalTarget =
            (
              updatedPlan.additionalSessions ??
              []
            ).find(
              (
                candidate:
                  TrainingPlanDay
              ) => {

                if (
                  explicitlyTargetedAdditionalSession.sessionId &&
                  candidate.sessionId
                ) {
                  return (
                    candidate.sessionId ===
                    explicitlyTargetedAdditionalSession.sessionId
                  );
                }

                return (
                  candidate.day ===
                    explicitlyTargetedAdditionalSession.day &&
                  candidate.sport ===
                    explicitlyTargetedAdditionalSession.sport &&
                  candidate.title ===
                    explicitlyTargetedAdditionalSession.title
                );
              }
            );

          if (proposedAdditionalTarget) {
            const protectedAdditionalSessions =
              currentAdditionalSessions.map(
                (
                  currentSession:
                    TrainingPlanDay
                ) => {
                  const matches = (() => {
                    if (
                      explicitlyTargetedAdditionalSession.sessionId &&
                      currentSession.sessionId
                    ) {
                      return (
                        currentSession.sessionId ===
                        explicitlyTargetedAdditionalSession.sessionId
                      );
                    }

                    return (
                      currentSession.day ===
                        explicitlyTargetedAdditionalSession.day &&
                      currentSession.sport ===
                        explicitlyTargetedAdditionalSession.sport &&
                      currentSession.title ===
                        explicitlyTargetedAdditionalSession.title
                    );
                  })();

                  if (!matches) {
                    return currentSession;
                  }

                  return {
                    ...proposedAdditionalTarget,

                    sessionId:
                      explicitlyTargetedAdditionalSession.sessionId ??
                      proposedAdditionalTarget.sessionId,

                    sessionSource:
                      explicitlyTargetedAdditionalSession.sessionSource ??
                      proposedAdditionalTarget.sessionSource,

                    sessionRole:
                      explicitlyTargetedAdditionalSession.sessionRole ??
                      proposedAdditionalTarget.sessionRole,

                    sessionSlot:
                      proposedAdditionalTarget.sessionSlot ??
                      explicitlyTargetedAdditionalSession.sessionSlot,
                  };
                }
              );

            updatedPlan = {
              ...updatedPlan,

              focus:
                trainingPlan.focus,

              summary:
                trainingPlan.summary,

              days:
                trainingPlan.days,

              additionalSessions:
                protectedAdditionalSessions,

              totalHours:
                calculatePlanHours({
                  days:
                    trainingPlan.days,

                  additionalSessions:
                    protectedAdditionalSessions,
                }),
            };
          }
        } else if (targetDay) {
          const proposedTarget =
            updatedPlan.days?.find(
              (
                day: {
                  day?: string;
                }
              ) =>
                day.day === targetDay
            );

          if (proposedTarget) {
            const protectedDays =
              trainingPlan.days.map(
                (
                  currentDay: {
                    day: string;
                    durationMinutes: number;
                  }
                ) => {

                  if (
                    currentDay.day ===
                    targetDay
                  ) {
                    return proposedTarget;
                  }

                  return currentDay;
                }
              );

            const preservedSecondarySessions =
              updatedPlan.additionalSessions ??
              trainingPlan.additionalSessions ??
              [];

            const recalculatedHours =
              calculatePlanHours({
                days:
                  protectedDays,

                additionalSessions:
                  preservedSecondarySessions,
              });

            updatedPlan = {
              ...updatedPlan,

              focus:
                trainingPlan.focus,

              summary:
                trainingPlan.summary,

              totalHours:
                Number(
                  recalculatedHours.toFixed(
                    2
                  )
                ),

              days:
                protectedDays,

              additionalSessions:
                preservedSecondarySessions,
            };
          }
        }
      }


      const addSecondSessionRequest =
        /\b(add|create|include|schedule)\b.*\b(second|extra|additional)\s+session\b/i
          .test(normalizedMessage);

      if (
        addSecondSessionRequest &&
        !broadScheduleRequest
      ) {
        const secondarySessions =
          updatedPlan.additionalSessions ??
          trainingPlan.additionalSessions ??
          [];

        updatedPlan = {
          ...updatedPlan,

          focus:
            trainingPlan.focus,

          summary:
            trainingPlan.summary,

          days:
            trainingPlan.days,

          additionalSessions:
            secondarySessions,

          totalHours:
            calculatePlanHours({
              days:
                trainingPlan.days,

              additionalSessions:
                secondarySessions,
            }),
        };
      }
    }

    // -----------------------------------------
    // PLAN NO-OP CLEANUP
    //
    // AI may rewrite wording on a session without
    // making a meaningful training change.
    //
    // Example:
    // Rest -> Rest
    //
    // Keep the original object so the client does
    // not present meaningless plan changes.
    // -----------------------------------------

    if (
      updatedPlan &&
      trainingPlan?.days?.length === 7 &&
      updatedPlan.days?.length === 7
    ) {
      const cleanedDays =
        updatedPlan.days.map(
          (proposedDay: {
            day: string;
            sport: string;
            title: string;
            durationMinutes: number;
            intensity: string;
            purpose: string;
            details: string[];
          }) => {
            const currentDay =
              trainingPlan.days.find(
                (
                  day: {
                    day?: string;
                  }
                ) =>
                  day.day ===
                  proposedDay.day
              );

            if (!currentDay) {
              return proposedDay;
            }

            // Rest is Rest.
            //
            // Different AI wording such as
            // "Recovery day" vs "Rest day"
            // must not appear as a plan change.
            const bothRest =
              currentDay.sport === "Rest" &&
              proposedDay.sport === "Rest" &&
              currentDay.durationMinutes === 0 &&
              proposedDay.durationMinutes === 0;

            if (bothRest) {
              return currentDay;
            }

            const sameDetails =
              JSON.stringify(
                currentDay.details ?? []
              ) ===
              JSON.stringify(
                proposedDay.details ?? []
              );

            const meaningfullyIdentical =
              currentDay.sport ===
                proposedDay.sport &&
              currentDay.title ===
                proposedDay.title &&
              currentDay.durationMinutes ===
                proposedDay.durationMinutes &&
              currentDay.intensity ===
                proposedDay.intensity &&
              currentDay.purpose ===
                proposedDay.purpose &&
              sameDetails;

            if (meaningfullyIdentical) {
              return currentDay;
            }

            return proposedDay;
          }
        );

      const preservedSecondarySessions =
        updatedPlan.additionalSessions ??
        trainingPlan.additionalSessions ??
        [];

      const recalculatedHours =
        calculatePlanHours({
          days:
            cleanedDays,

          additionalSessions:
            preservedSecondarySessions,
        });

      updatedPlan = {
        ...updatedPlan,

        totalHours:
          Number(
            recalculatedHours.toFixed(
              2
            )
          ),

        days:
          cleanedDays,

        additionalSessions:
          preservedSecondarySessions,
      };
    }

    // -----------------------------------------
    // REMOVE GUARD V2
    //
    // A simple "remove this workout" request must
    // not cause cosmetic rewrites of other sessions.
    //
    // Compare training meaning, not AI prose.
    // -----------------------------------------

    if (
      updatedPlan &&
      trainingPlan?.days?.length === 7 &&
      updatedPlan.days?.length === 7
    ) {
      const normalizedMessage =
        String(message)
          .trim()
          .toLowerCase();

      const removeRequest =
        /\b(remove|delete|drop|cancel)\b/.test(
          normalizedMessage
        );

      if (removeRequest) {
        const normalizeText = (
          value: unknown
        ) =>
          String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/[–—]/g, "-")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, " ");

        const normalizeIntensity = (
          value: unknown
        ) => {
          const normalized =
            normalizeText(value);

          if (
            normalized.includes("recovery") ||
            normalized === "rest"
          ) {
            return "recovery";
          }

          if (
            normalized.includes("easy") ||
            normalized.includes("low")
          ) {
            return "easy";
          }

          if (
            normalized.includes("moderate") ||
            normalized.includes("medium")
          ) {
            return "moderate";
          }

          if (
            normalized.includes("hard") ||
            normalized.includes("high") ||
            normalized.includes("threshold") ||
            normalized.includes("vo2")
          ) {
            return "hard";
          }

          return normalized;
        };

        const sameTrainingSession = (
          currentDay: {
            sport?: string;
            title?: string;
            durationMinutes?: number;
            intensity?: string;
          },
          proposedDay: {
            sport?: string;
            title?: string;
            durationMinutes?: number;
            intensity?: string;
          }
        ) => {
          const bothRest =
            currentDay.sport === "Rest" &&
            proposedDay.sport === "Rest" &&
            Number(
              currentDay.durationMinutes
            ) === 0 &&
            Number(
              proposedDay.durationMinutes
            ) === 0;

          if (bothRest) {
            return true;
          }

          return (
            normalizeText(
              currentDay.sport
            ) ===
              normalizeText(
                proposedDay.sport
              ) &&
            Number(
              currentDay.durationMinutes
            ) ===
              Number(
                proposedDay.durationMinutes
              ) &&
            normalizeIntensity(
              currentDay.intensity
            ) ===
              normalizeIntensity(
                proposedDay.intensity
              ) &&
            normalizeText(
              currentDay.title
            ) ===
              normalizeText(
                proposedDay.title
              )
          );
        };

        const weekdayNames = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];

        const requestedDayName =
          weekdayNames.find(
            (day) =>
              normalizedMessage.includes(
                day
              )
          ) ?? null;

        const requestedDay =
          requestedDayName
            ? trainingPlan.days.find(
                (
                  day: {
                    day?: string;
                  }
                ) =>
                  day.day
                    ?.toLowerCase() ===
                  requestedDayName
              )?.day ?? null
            : null;

        const protectedDays =
          updatedPlan.days.map(
            (proposedDay: {
              day: string;
              sport: string;
              title: string;
              durationMinutes: number;
              intensity: string;
              purpose: string;
              details: string[];
            }) => {
              const currentDay =
                trainingPlan.days.find(
                  (
                    day: {
                      day?: string;
                    }
                  ) =>
                    day.day ===
                    proposedDay.day
                );

              if (!currentDay) {
                return proposedDay;
              }

              // The explicitly removed day is
              // allowed to change.
              if (
                requestedDay &&
                proposedDay.day ===
                  requestedDay
              ) {
                return proposedDay;
              }

              // Same training prescription =
              // no real change.
              //
              // Ignore rewritten purpose text
              // and cosmetic detail wording.
              if (
                sameTrainingSession(
                  currentDay,
                  proposedDay
                )
              ) {
                return currentDay;
              }

              return proposedDay;
            }
          );

        const preservedSecondarySessions =
          updatedPlan.additionalSessions ??
          trainingPlan.additionalSessions ??
          [];

        const recalculatedHours =
          calculatePlanHours({
            days:
              protectedDays,

            additionalSessions:
              preservedSecondarySessions,
          });

        updatedPlan = {
          ...updatedPlan,

          // Removing one workout should not
          // rewrite the strategic identity
          // of the whole week.
          focus:
            trainingPlan.focus,

          summary:
            trainingPlan.summary,

          totalHours:
            Number(
              recalculatedHours.toFixed(
                2
              )
            ),

          days:
            protectedDays,

          additionalSessions:
            preservedSecondarySessions,
        };
      }
    }

    /*
      Final deterministic prescription layer.

      Coach decides whether/how the week changes.
      The central zone engine then guarantees that
      benchmark numbers match the session purpose.
    */
    if (
      updatedPlan
    ) {
      updatedPlan =
        applyBenchmarkPrescriptionToPlan(
          updatedPlan,
          athlete
        );

      const finalSecondarySessions =
        updatedPlan.additionalSessions ??
        trainingPlan?.additionalSessions ??
        [];

      updatedPlan = {
        ...updatedPlan,

        additionalSessions:
          finalSecondarySessions,

        totalHours:
          calculatePlanHours({
            days:
              updatedPlan.days,

            additionalSessions:
              finalSecondarySessions,
          }),
      };


      /*
        ====================================================
        FINAL COACH PLAN SAFETY WALL
        ====================================================

        1. Restore authoritative calendar identity.
        2. Strictly validate every new / modified workout.
        3. Permit only genuinely unchanged legacy structure.
        4. Enforce Calendar + weekly availability server-side.

        Fail closed: an unsafe updatedPlan must never reach
        the client for approval or auto-apply.
      */
      updatedPlan =
        prepareCoachPlanForReturn({
          proposedPlan:
            updatedPlan,

          currentPlan:
            trainingPlan,
        });


      const coachCanonicalCheck =
        validateCoachCanonicalChanges({
          currentPlan:
            trainingPlan,

          proposedPlan:
            updatedPlan,
        });


      if (
        !coachCanonicalCheck.valid
      ) {

        console.error(
          "Coach canonical safety wall failed:",
          coachCanonicalCheck
        );


        return NextResponse.json(
          {
            error:
              "Coach could not create a safe executable plan change.",

            canonical:
              coachCanonicalCheck
                .errors,
          },
          {
            status:
              422,
          }
        );
      }


      const coachAvailabilityCheck =
        validateCoachPlanAvailability({
          plan:
            updatedPlan,

          athlete,

          availability:
            trainingAvailability,
        });


      if (
        !coachAvailabilityCheck.valid
      ) {

        console.error(
          "Coach availability safety wall failed:",
          coachAvailabilityCheck
        );


        return NextResponse.json(
          {
            error:
              "Coach could not create a plan change that respects Calendar availability.",

            availability:
              coachAvailabilityCheck
                .violations,
          },
          {
            status:
              422,
          }
        );
      }
    }


    return NextResponse.json({
      reply: coachResult.reply,
      updatedPlan,

      decisionTrace:
        updatedPlan
          ? decisionTrace
          : null,
    });

  } catch (error) {
    console.error("TriCoach API error:", error);

    return NextResponse.json(
      { error: "Coach could not respond." },
      { status: 500 }
    );
  }
}
