type DisciplineAllocationAthlete = {
  goal?: string | null;

  experience?: string | null;

  currentTrainingHours?:
    | string
    | number
    | null;

  hoursPerWeek?:
    | string
    | number
    | null;

  weakestDiscipline?: string | null;

  swimLevel?: string | null;
  bikeLevel?: string | null;
  runLevel?: string | null;

  gymAccess?: boolean;
};


type Goal =
  | "Sprint"
  | "Olympic"
  | "70.3"
  | "Ironman";


function normalizeGoal(
  value?: string | null
): Goal {

  const goal =
    String(value ?? "")
      .trim()
      .toLowerCase();

  if (
    goal.includes("70.3") ||
    goal.includes("half")
  ) {
    return "70.3";
  }

  if (
    goal.includes("ironman") ||
    goal.includes("140.6") ||
    goal.includes("full")
  ) {
    return "Ironman";
  }

  if (
    goal.includes("olympic")
  ) {
    return "Olympic";
  }

  return "Sprint";
}


export type DisciplineAllocationRanges = {
  Swim: {
    min: number;
    max: number;
  };
  Bike: {
    min: number;
    max: number;
  };
  Run: {
    min: number;
    max: number;
  };
  Strength: {
    min: number;
    max: number;
  } | null;
};


export function getDisciplineAllocationRanges({
  goal,
  gymAccess,
}: {
  goal?: string | null;
  gymAccess?: boolean;
}): DisciplineAllocationRanges {

  const normalizedGoal =
    normalizeGoal(goal);

  const base =
    normalizedGoal === "Sprint"
      ? {
          Swim: { min: 18, max: 24 },
          Bike: { min: 35, max: 42 },
          Run: { min: 28, max: 34 },
          Strength: { min: 5, max: 10 },
        }
      : normalizedGoal === "Olympic"
        ? {
            Swim: { min: 15, max: 21 },
            Bike: { min: 38, max: 46 },
            Run: { min: 27, max: 34 },
            Strength: { min: 5, max: 9 },
          }
        : normalizedGoal === "70.3"
          ? {
              Swim: { min: 12, max: 18 },
              Bike: { min: 47, max: 56 },
              Run: { min: 24, max: 31 },
              Strength: { min: 4, max: 8 },
            }
          : {
              Swim: { min: 10, max: 16 },
              Bike: { min: 51, max: 60 },
              Run: { min: 22, max: 29 },
              Strength: { min: 3, max: 7 },
            };

  return {
    ...base,
    Strength:
      gymAccess === false
        ? null
        : base.Strength,
  };
}


function levelText(
  value?: string | null
) {
  return String(
    value ?? "Unknown"
  )
    .trim()
    .toLowerCase();
}


export function buildDisciplineAllocationGuidance({
  athlete,
  phase,
  weeklyHours,
  firstWeek = false,
}: {
  athlete:
    DisciplineAllocationAthlete;

  phase: string;

  weeklyHours?:
    | number
    | null;

  firstWeek?: boolean;
}) {

  const goal =
    normalizeGoal(
      athlete.goal
    );

  const phaseText =
    String(
      phase ?? ""
    ).toLowerCase();

  const isBase =
    phaseText.includes("base");

  const isBuild =
    phaseText.includes("build");

  const isPeak =
    phaseText.includes("peak") ||
    phaseText.includes("specific");

  const isTaper =
    phaseText.includes("taper");

  const referenceHours =
    typeof weeklyHours === "number" &&
    Number.isFinite(weeklyHours) &&
    weeklyHours > 0
      ? weeklyHours
      : Number(
          athlete.currentTrainingHours
        ) || 0;

  const weakest =
    String(
      athlete.weakestDiscipline ??
      ""
    ).toLowerCase();

  const swimLevel =
    levelText(
      athlete.swimLevel
    );

  const bikeLevel =
    levelText(
      athlete.bikeLevel
    );

  const runLevel =
    levelText(
      athlete.runLevel
    );

  const developingSwimmer =
    swimLevel.includes("beginner") ||
    swimLevel.includes("novice") ||
    swimLevel.includes("develop");

  const developingCyclist =
    bikeLevel.includes("beginner") ||
    bikeLevel.includes("novice") ||
    bikeLevel.includes("develop");

  const developingRunner =
    runLevel.includes("beginner") ||
    runLevel.includes("novice") ||
    runLevel.includes("develop");

  const baseRanges =
    goal === "Sprint"
      ? {
          swim: "approximately 18-24%",
          bike: "approximately 35-42%",
          run: "approximately 28-34%",
          strength: "approximately 5-10%",
        }
      : goal === "Olympic"
        ? {
            swim: "approximately 15-21%",
            bike: "approximately 38-46%",
            run: "approximately 27-34%",
            strength: "approximately 5-9%",
          }
        : goal === "70.3"
          ? {
              swim: "approximately 12-18%",
              bike: "approximately 47-56%",
              run: "approximately 24-31%",
              strength: "approximately 4-8%",
            }
          : {
              swim: "approximately 10-16%",
              bike: "approximately 51-60%",
              run: "approximately 22-29%",
              strength: "approximately 3-7%",
            };

  const phaseGuidance =
    isBase
      ? `
BASE ALLOCATION:
- Preserve meaningful swim frequency.
- Build aerobic bike volume progressively.
- Build running durability conservatively.
- Strength may receive a somewhat larger share than later phases.
- Do not chase race-specific distribution prematurely.
`
      : isBuild
        ? `
BUILD ALLOCATION:
- Shift more useful endurance volume toward race demands.
- For 70.3 / Ironman, cycling should carry much of the added duration.
- Preserve sufficient run frequency without aggressively expanding run minutes.
- Maintain swim consistency.
- Strength normally moves toward maintenance rather than development.
`
        : isPeak
          ? `
PEAK / RACE-SPECIFIC ALLOCATION:
- Allocation should increasingly reflect race execution.
- Preserve key swim frequency.
- For long-course racing, prioritize race-relevant cycling durability.
- Run volume must remain absorbable.
- Reduce strength volume before sacrificing important endurance specificity.
- Do not maximize total volume merely because the athlete is in Peak.
`
          : isTaper
            ? `
TAPER ALLOCATION:
- Absolute volume reduction matters more than hitting discipline percentages.
- Preserve movement frequency and race familiarity where practical.
- Reduce strength and long-session volume substantially.
- Do not compensate for reduced volume by increasing intensity density.
`
            : `
CURRENT-PHASE ALLOCATION:
- Keep distribution balanced around race demands, recent tolerance and discipline needs.
`;

  const weaknessGuidance =
    weakest.includes("swim")
      ? `
WEAKEST DISCIPLINE — SWIM:
- Bias swim FREQUENCY upward where pool access permits.
- Prefer extra manageable technique/aerobic exposures over one oversized swim.
- Reallocate some weekly time toward swimming rather than simply adding more total hours.
`
      : weakest.includes("bike")
        ? `
WEAKEST DISCIPLINE — BIKE:
- Give cycling modestly greater frequency and/or aerobic duration.
- Easy cycling is usually the safest place to add discipline-specific endurance.
- Do not turn extra bike volume into extra threshold work.
`
        : weakest.includes("run")
          ? `
WEAKEST DISCIPLINE — RUN:
- Improve running primarily through consistency and appropriate frequency.
- Do NOT solve weak running by making the long run disproportionately large.
- Because running has greater mechanical cost, shift volume gradually.
- Short easy runs may be preferable to one additional large run.
`
          : `
WEAKEST DISCIPLINE:
No clear weakest discipline is supplied.
Do not invent one.
`;

  const levelGuidance = `
DISCIPLINE LEVEL MODIFIERS:

SWIM:
${
  developingSwimmer
    ? "- Developing swimmer: favor frequency, technique and repeatable aerobic work over large or complex sets."
    : "- Competent/advanced swimmer: maintain technical quality while allowing more substantial aerobic and race-specific work."
}

BIKE:
${
  developingCyclist
    ? "- Developing cyclist: build comfortable aerobic duration before aggressively increasing structured quality."
    : "- Trained/advanced cyclist: can carry substantial aerobic volume when recovery and history support it."
}

RUN:
${
  developingRunner
    ? "- Developing runner: preserve conservative run progression and avoid using running to fill missing weekly hours."
    : "- Trained/advanced runner: greater run workload may be appropriate, but mechanical cost still matters."
}
`;

  const firstWeekGuidance =
    firstWeek
      ? `
FIRST-WEEK APPLICATION:

This may be a PARTIAL calendar week.

Use the discipline allocation only as directional guidance.

Do NOT attempt to hit full-week discipline percentages
between today and Sunday.

Do NOT make up Monday-to-yesterday training.

Preserve a sensible mix of disciplines in the remaining days
without creating an unusually dense first week.
`
      : "";

  return `
TRICOACH DISCIPLINE ALLOCATION ENGINE

Race distance:
${goal}

Training phase:
${phase}

Reference full-week load:
${referenceHours || "Unknown"} hours.

PURPOSE

Use weekly time intentionally across Swim, Bike, Run and Strength.

These ranges are SOFT PLANNING RANGES.
They are not mathematical quotas.

A good plan may sit outside them because of:
- athlete history
- weakest discipline
- recovery
- training phase
- equipment access
- race specificity
- recent discipline-specific load

NEVER distort a good week merely to hit a percentage.

NORMAL DIRECTIONAL TIME RANGES FOR ${goal.toUpperCase()}:

Swim:
${baseRanges.swim}

Bike:
${baseRanges.bike}

Run:
${baseRanges.run}

Strength:
${athlete.gymAccess === false
  ? "No gym-based strength requirement. Use appropriate alternatives only when useful."
  : baseRanges.strength
}

IMPORTANT:

- The ranges may overlap and do not need to sum perfectly.
- Use them as a distribution compass, not a spreadsheet target.
- Frequency matters separately from minutes.
- A weak swimmer may need more swim sessions without a huge increase in swim minutes.
- High-volume triathlon weeks should normally distribute load across more sessions rather than creating seven oversized workouts.
- Additional volume should generally be safer to place into Swim/Bike than Run.
- Running volume must respect recent running tolerance.
- Strength should support endurance performance rather than create excessive soreness.

${phaseGuidance}

${weaknessGuidance}

${levelGuidance}

${firstWeekGuidance}
`;
}
