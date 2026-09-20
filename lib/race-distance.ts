type RaceGoal =
  | "Sprint"
  | "Olympic"
  | "70.3"
  | "Ironman"
  | string;


type RaceDistanceAthlete = {
  goal?: RaceGoal | null;

  experience?: string | null;

  currentTrainingHours?:
    | string
    | number
    | null;

  hoursPerWeek?:
    | string
    | number
    | null;

  swimLevel?: string | null;
  bikeLevel?: string | null;
  runLevel?: string | null;

  weakestDiscipline?: string | null;

  longestSessionMinutes?:
    | string
    | number
    | null;
};


export type RaceDistanceProfile = {
  goal:
    | "Sprint"
    | "Olympic"
    | "70.3"
    | "Ironman";

  category:
    | "Short course"
    | "Middle distance"
    | "Long course";

  primaryDemands: string[];

  longSessionPriority:
    | "Low"
    | "Moderate"
    | "High"
    | "Very high";

  fuelingPriority:
    | "Low"
    | "Moderate"
    | "High"
    | "Very high";

  brickPriority:
    | "Moderate"
    | "High"
    | "Very high";

  raceSpecificity:
    | "Speed-endurance"
    | "Balanced"
    | "Sustained endurance"
    | "Ultra-endurance";

  guidance: string;
};


function normalizeGoal(
  value?: string | null
):
  | "Sprint"
  | "Olympic"
  | "70.3"
  | "Ironman" {

  const goal =
    (value ?? "")
      .toLowerCase()
      .trim();

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


function buildDistancePhaseGuidance({
  goal,
  phase,
}: {
  goal:
    | "Sprint"
    | "Olympic"
    | "70.3"
    | "Ironman";

  phase: string;
}) {
  const normalizedPhase =
    String(phase ?? "")
      .trim()
      .toLowerCase();

  const isBase =
    normalizedPhase.includes("base");

  const isBuild =
    normalizedPhase.includes("build");

  const isPeak =
    normalizedPhase.includes("peak") ||
    normalizedPhase.includes("specific");

  const isTaper =
    normalizedPhase.includes("taper");

  const general = `
DISTANCE × PHASE PRESCRIPTION

The race distance determines WHAT matters most.
The phase determines HOW that priority is expressed now.

GENERAL:
- Easy aerobic training remains the foundation.
- Increase race specificity progressively.
- Protect running durability from excessive mechanical load.
- Use cycling as the safest place to accumulate large aerobic volume.
- Preserve useful swim frequency.
- Strength must support, not compromise, endurance training.
- Doubles distribute load; they are not a goal themselves.
- Peak does not mean maximizing hours or constantly race-simulating.
`;

  if (goal === "Sprint") {
    if (isBase) {
      return `${general}

SPRINT · BASE
- Prioritize aerobic consistency, swim technique, run durability and strength.
- Use controlled threshold sparingly.
- Keep long sessions proportionate.
- Occasional short easy bricks are sufficient.
`;
    }

    if (isBuild) {
      return `${general}

SPRINT · BUILD
- Increase sustainable speed and controlled threshold work.
- Use selected high-aerobic work when level and recovery support it.
- Make short bricks more regular.
- Long sessions remain supportive, not dominant.
`;
    }

    if (isPeak) {
      return `${general}

SPRINT · PEAK
- Prioritize race-relevant speed endurance and transition execution.
- Use short race-specific bike, run and swim work.
- Keep overall fatigue controlled.
- Do not repeatedly simulate the full race.
`;
    }

    if (isTaper) {
      return `${general}

SPRINT · TAPER
- Clearly reduce total volume.
- Retain short familiar race-speed efforts and swim feel.
- Remove unnecessary long work and strength fatigue.
`;
    }
  }

  if (goal === "Olympic") {
    if (isBase) {
      return `${general}

OLYMPIC · BASE
- Prioritize aerobic durability, swim frequency, easy running and bike endurance.
- Introduce controlled threshold progressively.
- Use occasional short easy bricks.
`;
    }

    if (isBuild) {
      return `${general}

OLYMPIC · BUILD
- Develop sustainable bike power and controlled threshold running.
- Maintain strong aerobic swimming.
- Use short purposeful bricks and selected higher-aerobic work.
- Keep substantial easy volume around quality sessions.
`;
    }

    if (isPeak) {
      return `${general}

OLYMPIC · PEAK
- Prioritize race-effort familiarity and bike-to-run execution.
- Use selected race-relevant bike blocks and controlled 10 km-relevant running.
- Preserve race-specific swimming.
- Do not make the whole week medium-hard.
`;
    }

    if (isTaper) {
      return `${general}

OLYMPIC · TAPER
- Reduce total duration.
- Retain short bike/run intensity reminders and swim frequency.
- Reduce long endurance work and strength volume.
`;
    }
  }

  if (goal === "70.3") {
    if (isBase) {
      return `${general}

70.3 · BASE
- Prioritize aerobic durability and cycling endurance.
- Build run frequency conservatively.
- Maintain swim technique and aerobic frequency.
- Use occasional short bricks.
- Begin fueling practice during sufficiently long training.
`;
    }

    if (isBuild) {
      return `${general}

70.3 · BUILD
- Progress long-bike durability.
- Add sustainable race-relevant bike work.
- Develop running durability after cycling.
- Use regular short bricks.
- Practice fueling and hydration.
- Put more additional endurance volume into cycling than running.
`;
    }

    if (isPeak) {
      return `${general}

70.3 · PEAK
- Prioritize race-specific bike durability, pacing and fueling.
- Use controlled transition running.
- Include selected larger race-specific sessions.
- Do not perform weekly 70.3 simulations.
`;
    }

    if (isTaper) {
      return `${general}

70.3 · TAPER
- Substantially reduce accumulated volume.
- Retain short race-effort bike/run reminders and swim feel.
- Remove giant long rides, long bricks and unnecessary strength fatigue.
`;
    }
  }

  /*
    IRONMAN
  */

  if (isBase) {
    return `${general}

IRONMAN · BASE
- Prioritize aerobic consistency and cycling durability.
- Build safe run frequency rather than oversized long runs.
- Maintain swim frequency and strength.
- Use doubles naturally as weekly volume becomes high.
- Begin fueling practice during longer endurance work.
`;
  }

  if (isBuild) {
    return `${general}

IRONMAN · BUILD
- Progress long-bike durability and race-position riding.
- Practice fueling and hydration deliberately.
- Progress long running conservatively.
- Use regular short controlled bricks.
- Most additional endurance load should come from cycling rather than running.
`;
  }

  if (isPeak) {
    return `${general}

IRONMAN · PEAK
- Prioritize race-specific endurance execution.
- Rehearse bike pacing, fueling, race position and transition routines.
- Run controlled off prolonged cycling.
- Reduce strength volume.
- Do not maximize hours simply because this is Peak.
`;
  }

  if (isTaper) {
    return `${general}

IRONMAN · TAPER
- Remove accumulated fatigue.
- Substantially reduce total volume.
- Retain swim feel, short familiar bike intensity and brief race-feel running.
- Remove giant endurance sessions, long bricks and heavy strength.
`;
  }

  return general;
}


export function buildRaceDistanceProfile({
  athlete,
  phase,
  weeksUntilRace,
}: {
  athlete:
    RaceDistanceAthlete;

  phase: string;

  weeksUntilRace?:
    number | null;
}): RaceDistanceProfile {

  const goal =
    normalizeGoal(
      athlete.goal
    );

  const phaseGuidance =
    buildDistancePhaseGuidance({
      goal,
      phase,
    });

  const developing =
    (
      athlete.experience ??
      ""
    )
      .toLowerCase()
      .includes("beginner");


  const raceTiming =
    typeof weeksUntilRace ===
      "number"
      ? `${weeksUntilRace} weeks remain until race day.`
      : "Exact weeks until race are unavailable.";


  // =====================================================
  // SPRINT
  // =====================================================

  if (goal === "Sprint") {

    return {
      goal,

      category:
        "Short course",

      primaryDemands: [
        "Aerobic capacity",
        "Threshold performance",
        "Technical swimming",
        "Bike-to-run transition",
        "Running well after a relatively intense bike",
      ],

      longSessionPriority:
        "Low",

      fuelingPriority:
        "Low",

      brickPriority:
        "High",

      raceSpecificity:
        "Speed-endurance",

      guidance: `
RACE-DISTANCE MODEL: SPRINT TRIATHLON

${raceTiming}

${phaseGuidance}

The Sprint distance is NOT a miniature Ironman.

Primary preparation should emphasize:
- aerobic fitness
- sustainable speed
- threshold development
- technically efficient swimming
- cycling strongly without destroying the run
- familiarity with a quick bike-to-run transition

LONG TRAINING:
Long-duration training is supportive rather than the defining stimulus.

Do not create giant rides or runs simply because more time is available.

A developing athlete often gains more from:
- consistent frequency
- controlled quality
- technical swim exposure
- repeatable aerobic work

than from very long endurance sessions.

BIKE:
Include aerobic endurance plus controlled threshold / high-aerobic work.

RUN:
Maintain a strong easy-running base but include controlled race-relevant quality.

The ability to run well after the bike matters.

BRICKS:
Short bricks are valuable.

Typical useful brick:
bike
+
10-20 min controlled run.

Build / Peak may include selected faster race-feel transitions.

Do not make every brick maximal.

SWIM:
Technique remains important.
For competitive Sprint preparation,
faster swimming and race-start confidence can matter more than accumulating very large swim volume.

FUELING:
Training nutrition still matters, but elaborate race-fueling practice is less central than for long-course racing.

TAPER:
Keep some short race-speed familiarity while reducing fatigue.

For this athlete:
${developing
  ? "Keep the overall structure simple and avoid excessive high-intensity density."
  : "A slightly greater proportion of controlled race-specific quality may be appropriate when recovery supports it."
}
      `,
    };
  }


  // =====================================================
  // OLYMPIC
  // =====================================================

  if (goal === "Olympic") {

    return {
      goal,

      category:
        "Short course",

      primaryDemands: [
        "Aerobic endurance",
        "Threshold performance",
        "Strong swimming",
        "Sustainable cycling",
        "Running quality after cycling",
      ],

      longSessionPriority:
        "Moderate",

      fuelingPriority:
        "Moderate",

      brickPriority:
        "High",

      raceSpecificity:
        "Balanced",

      guidance: `
RACE-DISTANCE MODEL: OLYMPIC TRIATHLON

${raceTiming}

${phaseGuidance}

Olympic-distance preparation requires a blend of endurance and sustainable speed.

The athlete needs enough aerobic durability to race for several hours,
but preparation should not resemble Ironman training with shorter sessions.

PRIORITIES:
- technically effective swimming
- aerobic endurance
- threshold development
- controlled sustained bike power
- ability to run efficiently after cycling

SWIM:
Swimming deserves meaningful frequency and technical attention.

Do not treat the swim merely as a warm-up for the bike.

BIKE:
Develop endurance plus sustainable race-relevant effort.

Selected Build / Peak sessions can include longer controlled tempo / threshold blocks.

RUN:
Easy running remains the foundation.

Controlled threshold running is particularly useful.

Maintain enough run durability that the athlete can execute the 10 km run after cycling rather than merely survive it.

BRICKS:
Use regularly enough to make the bike-to-run transition familiar.

Most bricks can be short.

Examples:
60-90 min bike + 15-25 min easy run

or a race-specific bike followed by a controlled transition run.

LONG SESSIONS:
Useful, but they should support the event rather than dramatically exceed race demands.

FUELING:
Longer training sessions should include basic hydration and carbohydrate practice.

TAPER:
Reduce volume while preserving small amounts of race-relevant intensity.
      `,
    };
  }


  // =====================================================
  // 70.3
  // =====================================================

  if (goal === "70.3") {

    return {
      goal,

      category:
        "Middle distance",

      primaryDemands: [
        "Sustained aerobic endurance",
        "Cycling durability",
        "Race fueling",
        "Running durability after a long bike",
        "Race-specific pacing",
      ],

      longSessionPriority:
        "High",

      fuelingPriority:
        "Very high",

      brickPriority:
        "Very high",

      raceSpecificity:
        "Sustained endurance",

      guidance: `
RACE-DISTANCE MODEL: IRONMAN 70.3

${raceTiming}

${phaseGuidance}

70.3 preparation is substantially different from short-course preparation.

The challenge is not simply generating high power or speed.
The athlete must sustain useful output for several hours while preserving the ability to run.

KEY PRIORITIES:
- aerobic durability
- strong sustainable cycling
- long-course pacing
- race fueling and hydration
- running well after prolonged cycling
- fatigue resistance

BIKE:
The bike receives substantial training emphasis.

Progressively develop:
- long aerobic rides
- sustained race-relevant blocks
- position comfort
- pacing discipline
- fueling practice

Do not make every long ride hard.

RUN:
Running durability matters greatly,
but avoid trying to replicate the half marathon distance every week.

Progress long running conservatively from actual recent tolerance.

Quality may include:
- threshold work
- steady race-relevant segments
- controlled bricks

BRICKS:
Regular bricks become increasingly important during Build / Peak.

Most brick runs do NOT need to be long.

Useful examples:
long endurance bike + 15-30 min easy run

race-specific bike + 20-40 min controlled run

Occasionally a larger race-specific brick may be justified for an experienced athlete,
but it must not become a weekly race simulation.

FUELING:
Fueling practice is part of the training prescription.

Long bikes and selected bricks should teach:
- what the athlete can tolerate
- timing of intake
- drinking routine
- race product familiarity

Do not prescribe an exact carbohydrate target unless sufficient athlete-specific context exists.

RACE SPECIFICITY:
During Build and especially Peak,
selected long rides should contain meaningful periods at sustainable race-relevant effort.

Do not race every long session.

TAPER:
Substantially reduce fatigue while maintaining movement frequency and short race-specific reminders.

Avoid one last giant weekend for confidence.
      `,
    };
  }


  // =====================================================
  // IRONMAN
  // =====================================================

  return {
    goal:
      "Ironman",

    category:
      "Long course",

    primaryDemands: [
      "Extreme aerobic durability",
      "Cycling endurance",
      "Fueling and hydration execution",
      "Pacing discipline",
      "Running durability under accumulated fatigue",
    ],

    longSessionPriority:
      "Very high",

    fuelingPriority:
      "Very high",

    brickPriority:
      "Very high",

    raceSpecificity:
      "Ultra-endurance",

    guidance: `
RACE-DISTANCE MODEL: FULL IRONMAN

${raceTiming}

${phaseGuidance}

Ironman preparation is primarily a durability,
pacing and execution problem.

It is NOT solved by maximizing exhaustion in training.

KEY PRIORITIES:
- robust aerobic base
- very strong cycling durability
- sustainable pacing
- race fueling / hydration
- durability late in sessions
- preserving the ability to run after prolonged cycling

BIKE:
The bike is the most practical place to accumulate large amounts of race-specific endurance.

Long rides are important,
but should progress from what the athlete can actually absorb.

Build toward:
- sustained aerobic riding
- time in race position
- pacing discipline
- race-specific fueling
- selected race-effort blocks

Avoid repeated race-distance bike simulations.

RUN:
The marathon must be respected,
but repeated extremely long runs create substantial recovery cost.

Do NOT assume Ironman preparation requires marathon-length training runs.

Prioritize:
- consistent running frequency
- easy aerobic durability
- carefully progressed long runs
- running well while carrying accumulated training fatigue
- controlled brick exposure

The athlete should arrive healthy enough to run,
not prove marathon fitness every weekend.

BRICKS:
Use often enough during Build / Peak to make running after cycling normal.

Most brick runs should remain relatively short.

The long bike provides much of the endurance load.

FUELING:
Fueling practice is mandatory in important long-course sessions.

Training should progressively rehearse:
- breakfast / pre-session routine
- bike nutrition
- hydration
- product tolerance
- timing
- transition into running nutrition

Do not experiment with new products on race day.

RACE-SPECIFIC WORK:
Specificity should increase as race day approaches,
but race simulation should remain selective.

A massive race-simulation workout can create more recovery cost than training benefit.

STRENGTH:
Maintain useful strength,
but volume should fall as key endurance demands rise.

TAPER:
Ironman athletes carry large cumulative fatigue.

The taper must create freshness.

Reduce volume substantially,
retain some frequency,
retain small familiar intensity doses,
and avoid last-minute fitness chasing.

Race day success depends heavily on:
- pacing restraint
- nutrition execution
- durability
- arriving healthy.
    `,
  };
}


export function buildRaceDistanceGuidance({
  athlete,
  phase,
  weeksUntilRace,
}: {
  athlete:
    RaceDistanceAthlete;

  phase: string;

  weeksUntilRace?:
    number | null;
}) {

  return buildRaceDistanceProfile({
    athlete,
    phase,
    weeksUntilRace,
  }).guidance;
}
