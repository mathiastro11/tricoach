import {
  getCanonicalTrainingPhase,
} from "./training-phase";

type AthleteLike = {
  experience?: string | null;

  performanceTier?: string | null;

  currentTrainingHours?:
    | number
    | string
    | null;

  hoursPerWeek?:
    | number
    | string
    | null;

  weakestDiscipline?:
    | string
    | null;

  swimLevel?: string | null;
  bikeLevel?: string | null;
  runLevel?: string | null;

  poolAccess?: boolean;
  gymAccess?: boolean;

  longestSessionMinutes?:
    | number
    | string
    | null;

  limitations?: string | null;
};


export type EvidenceTrainingPhase =
  | "Base"
  | "Build"
  | "Peak"
  | "Taper";


function numberOrNull(
  value: unknown
): number | null {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}


export function inferEvidenceTrainingPhase(
  raceDate?: string | null,
  referenceDate =
    new Date()
): EvidenceTrainingPhase {

  return getCanonicalTrainingPhase(
    raceDate,
    referenceDate
  );
}


export function buildTrainingScienceGuidance({
  athlete,
  phase,
}: {
  athlete: AthleteLike;
  phase: EvidenceTrainingPhase | string;
}) {

  const experience =
    (
      athlete.experience ??
      "Beginner"
    ).toLowerCase();


  const performanceTier =
    (
      athlete.performanceTier ??
      "Recreational"
    ).toLowerCase();

  const swimLevel =
    (
      athlete.swimLevel ??
      "Beginner"
    ).toLowerCase();

  const bikeLevel =
    (
      athlete.bikeLevel ??
      "Beginner"
    ).toLowerCase();

  const runLevel =
    (
      athlete.runLevel ??
      "Beginner"
    ).toLowerCase();

  const currentHours =
    numberOrNull(
      athlete.currentTrainingHours
    );

  const availableHours =
    numberOrNull(
      athlete.hoursPerWeek
    );

  const maxSession =
    numberOrNull(
      athlete.longestSessionMinutes
    );


  const developingAthlete =
    experience.includes(
      "beginner"
    ) ||
    experience.includes(
      "develop"
    ) ||
    experience.includes(
      "recreational"
    );


  const beginnerSwimmer =
    swimLevel.includes(
      "beginner"
    ) ||
    swimLevel.includes(
      "novice"
    );

  const advancedSwimmer =
    swimLevel.includes(
      "advanced"
    ) ||
    swimLevel.includes(
      "expert"
    ) ||
    swimLevel.includes(
      "elite"
    );

  const developingCyclist =
    bikeLevel.includes(
      "beginner"
    ) ||
    bikeLevel.includes(
      "novice"
    ) ||
    bikeLevel.includes(
      "develop"
    );

  const advancedCyclist =
    bikeLevel.includes(
      "advanced"
    ) ||
    bikeLevel.includes(
      "expert"
    ) ||
    bikeLevel.includes(
      "elite"
    );

  const developingRunner =
    runLevel.includes(
      "beginner"
    ) ||
    runLevel.includes(
      "novice"
    ) ||
    runLevel.includes(
      "develop"
    );

  const advancedRunner =
    runLevel.includes(
      "advanced"
    ) ||
    runLevel.includes(
      "expert"
    ) ||
    runLevel.includes(
      "elite"
    );


  return `
TRICOACH TRAINING SCIENCE MODEL
Current phase: ${phase}

ATHLETE DEVELOPMENT PROFILE

Overall triathlon experience:
${developingAthlete ? "Developing / recreational" : "Trained / experienced"}

Performance context:
${
  performanceTier.includes("professional")
    ? "Professional athlete"
    : performanceTier.includes("elite")
      ? "Elite competitive athlete"
      : performanceTier.includes("competitive")
        ? "Competitive athlete"
        : "Recreational athlete"
}

Performance tier is context, NOT permission to assume
greater training tolerance or recovery capacity.

Swimming:
${
  beginnerSwimmer
    ? "Developing swimmer — technique, confidence and repeatable aerobic swimming are the priority."
    : advancedSwimmer
      ? "Advanced swimmer — maintain technique while using substantial aerobic, threshold and race-specific work where appropriate."
      : "Competent swimmer — continue technical development while progressively using aerobic and controlled threshold work."
}

Cycling:
${
  developingCyclist
    ? "Developing cyclist — build aerobic durability first; normally keep structured bike intensity simple and limited."
    : advancedCyclist
      ? "Advanced cyclist — can tolerate more accumulated bike quality and race-specific work when recovery and history support it."
      : "Trained cyclist — use regular controlled quality while preserving substantial easy endurance volume."
}

Running:
${
  developingRunner
    ? "Developing runner — protect mechanical durability; normally use no more than one structured demanding run in most weeks."
    : advancedRunner
      ? "Advanced runner — may use one to two purposeful quality exposures when training history, phase and recovery support it."
      : "Trained runner — usually one primary structured run-quality session, with additional race-specific work only when justified."
}

DISCIPLINE-SPECIFIC DOSING RULES

- Never infer equal ability across swim, bike and run.
- A strong cyclist who is a novice swimmer must still receive novice-appropriate swimming.
- A strong runner who is a developing cyclist must receive bike progression appropriate to cycling history.
- Overall experience does not override discipline-specific level.
- Performance tier does not override discipline-specific level, recent tolerance, readiness or availability.
- A professional athlete who is new to one triathlon discipline still receives development-appropriate work in that discipline.
- Higher level means greater tolerance for appropriate training, NOT automatically more intensity.
- Increase interval volume before making efforts more extreme where practical.
- Keep hard running more conservative than hard cycling because of greater mechanical cost.
- For developing runners, avoid using VO2-oriented running as routine weekly training.
- For developing cyclists, usually begin with one clearly structured bike-quality stimulus rather than several.
- Advanced athletes may accumulate more quality, but only when easy volume, recovery and execution remain intact.
- Never schedule extra intensity merely because an athlete is labelled Advanced.

Use these principles as the physiological foundation of the plan.

--------------------------------------------------
1. TRAINING INTENSITY DISTRIBUTION
--------------------------------------------------

Most endurance training must be genuinely easy.

For beginner, recreational and developing athletes:
- Prefer a broadly PYRAMIDAL distribution.
- Easy aerobic work should dominate.
- Some controlled moderate / threshold work is useful.
- A relatively small amount of high-intensity work is enough.

For highly trained athletes:
- Polarized periods may sometimes be appropriate.
- Still avoid excessive threshold work and chronic medium-hard training.

Do NOT force an exact 80/20 percentage.
Do NOT turn every endurance session into tempo work.

Easy means conversational, relaxed and repeatable.
A typical easy session should feel approximately RPE 2-4 / 10.

Moderate / controlled threshold work is approximately RPE 6-7.

Hard aerobic intervals are approximately RPE 8-9 and should be used deliberately.

${
  developingAthlete
    ? `
This athlete is developing / recreational:
Normally use no more than TWO genuinely demanding endurance sessions in a 7-day week.
Often ONE quality session is sufficient when training volume is low or recovery is uncertain.
`
    : `
This athlete may tolerate more structured quality work, but intensity must still be earned through recovery and training history.
`
}

Do not schedule hard sessions on consecutive days unless there is a strong sport-specific reason.

--------------------------------------------------
2. PROGRESSION
--------------------------------------------------

Progress from what the athlete is CURRENTLY tolerating,
not from their theoretical available time.

${
  currentHours !== null
    ? `Current reported training volume: ${currentHours} h/week.`
    : ""
}

${
  availableHours !== null
    ? `Maximum available training time: ${availableHours} h/week.`
    : ""
}

Availability is a ceiling, not a target.

Do NOT use a universal "10% rule".
There is no scientifically reliable single weekly percentage that is appropriate for every athlete.

Instead:
- increase load gradually
- respond to completion
- respond to RPE
- respond to readiness
- respond to injury / pain signals
- consider multi-week load
- use recovery weeks or reduced weeks when accumulated fatigue suggests they are useful

Do not compensate for missed sessions by stacking extra load later.

Running load should generally progress more conservatively than cycling load because of its greater mechanical loading.

--------------------------------------------------
3. RUN TRAINING
--------------------------------------------------

The run program should contain mostly easy running.

Useful run session families include:

EASY RUN
- relaxed aerobic running
- RPE 2-4
- conversational
- optional short relaxed strides if appropriate

LONG EASY RUN
- controlled aerobic endurance
- avoid turning the final section into a race unless specifically planned
- duration must reflect current running durability

THRESHOLD / CONTROLLED QUALITY
Examples:
- 3 x 6-10 min controlled hard
- 4 x 5-8 min controlled hard
- easy recoveries between efforts
- approximately RPE 6-8 depending on athlete level

VO2-ORIENTED RUN
Examples:
- 4-6 x 2-4 min hard
- adequate easy recovery
- use sparingly
- approximately RPE 8-9

Do not prescribe arbitrary pace numbers unless the athlete has supplied valid performance data.

Do not make long runs unnecessarily long simply to increase weekly hours.

--------------------------------------------------
4. BIKE TRAINING
--------------------------------------------------

Cycling is a useful place to accumulate aerobic volume with lower impact than running.

Useful bike session families include:

EASY ENDURANCE
- mostly RPE 2-4
- smooth sustainable riding

LONG ENDURANCE
- predominantly easy
- duration progresses with athlete experience and race demands
- include fueling / hydration practice when sufficiently long

CONTROLLED THRESHOLD / SWEET-SPOT STYLE WORK
Examples:
- 3 x 8-15 min
- 2-4 x 10-20 min
- controlled rather than maximal
- RPE approximately 6-8

HIGH AEROBIC / VO2 WORK
Examples:
- 4-6 x 3-5 min hard
- generous easy recovery
- RPE 8-9

Do not prescribe FTP percentages unless valid FTP information is available.

--------------------------------------------------
5. SWIM TRAINING
--------------------------------------------------

Swimming is skill-dependent.

For developing swimmers:
- frequency and technical quality matter
- avoid making every swim one long continuous effort
- use short repeatable segments
- keep instructions simple
- prioritize body position, breathing, relaxation and efficient stroke mechanics

${
  beginnerSwimmer
    ? `
This athlete is a beginner swimmer.

When pool access and schedule permit:
prefer multiple manageable technique/aerobic exposures rather than one disproportionately large swim.

A useful swim structure is:
1. easy warm-up
2. simple technique drills
3. repeatable aerobic main set
4. short relaxed cool-down

Avoid complex elite-swimmer sets.
`
    : `
Use progressively more race-specific aerobic and threshold swimming while retaining technical focus.
`
}

Do not prescribe pool swimming when pool access is unavailable.

--------------------------------------------------
6. STRENGTH TRAINING
--------------------------------------------------

Strength training is useful for endurance athletes and should not automatically disappear from triathlon training.

When gym / appropriate resistance access exists:

BASE:
- normally 1-2 strength sessions per week
- progressive resistance
- full-body emphasis
- prioritize useful lower-body and trunk strength

BUILD:
- normally 1-2 sessions depending on total load
- maintain / progress strength without compromising key endurance sessions

PEAK:
- usually reduce strength volume
- retain enough stimulus to maintain strength

TAPER:
- avoid creating residual soreness
- use low-volume maintenance only when appropriate

Prioritize quality movements rather than circuit-style exhaustion.

Typical useful categories:
- squat / knee-dominant movement
- hinge / hip-dominant movement
- unilateral lower-body movement
- calf work
- pulling / pushing
- trunk stability

Heavy strength does NOT mean training to failure.
Avoid excessive soreness.

If gym access is unavailable, use sensible bodyweight or simple resistance alternatives.

--------------------------------------------------
7. BRICK TRAINING
--------------------------------------------------

Bike-to-run adaptation is triathlon-specific.

Brick sessions should be purposeful rather than automatic.

BASE:
- occasional short easy transition runs are enough

BUILD:
- introduce more regular short bricks
- mostly controlled
- teach the athlete to run efficiently after cycling

PEAK:
- include selected race-specific bike-to-run sessions
- do not turn every long ride into a hard brick

TAPER:
- short race-feel transitions may be used
- avoid fatigue-producing bricks

A short 10-25 minute controlled run after cycling can provide useful transition practice without requiring a second full run workout.

--------------------------------------------------
8. RACE SPECIFICITY
--------------------------------------------------

Training should become progressively more specific as race day approaches.

BASE:
- consistency
- technique
- aerobic development
- durability
- strength

BUILD:
- increase race-relevant endurance
- controlled threshold work
- bricks
- race fueling practice

PEAK:
- selected race-specific sessions
- key long sessions
- race-intensity familiarity
- do not simply maximize total volume

TAPER:
- reduce fatigue
- retain familiarity with race intensity
- maintain movement frequency where practical

--------------------------------------------------
9. TAPER
--------------------------------------------------

The taper is NOT complete rest.

In the final roughly 1-3 weeks:
- substantially reduce total training volume
- retain some training frequency
- retain small doses of intensity
- progressively reduce fatigue
- remove unnecessary long or damaging sessions

For many age-group athletes,
the largest volume reduction should occur in the final 7-14 days.

Avoid hard strength work and very long runs close to race day.

--------------------------------------------------
10. FUELING AND HYDRATION PRACTICE
--------------------------------------------------

For sufficiently long endurance sessions:
- explicitly remind the athlete to practice race fueling and hydration
- use training to test what is tolerated
- do not wait until race day to experiment

For long-course preparation this becomes increasingly important during Build and Peak.

Do not invent precise carbohydrate or fluid targets without adequate athlete context.
If specific nutrition targets are needed, frame them separately and individualize them.

--------------------------------------------------
11. SESSION QUALITY AND WORKOUT COPY
--------------------------------------------------

Every workout needs ONE clear primary purpose.

The athlete should understand the workout within a few seconds.

TITLE:
- usually 2-5 words
- describe what the athlete is doing
- use normal training language
- avoid vague titles such as "Quality session"
- avoid unnecessary physiological jargon

Good:
"Easy aerobic run"
"Bike threshold"
"Swim technique"
"Long endurance ride"

PURPOSE:
- ONE short sentence
- normally about 6-14 words
- explain why the workout matters
- do not repeat the title
- do not write a paragraph

Good:
"Build sustainable bike power without excessive fatigue."

DETAILS:
Normally use 3-5 short execution lines.

Each line should contain ONE useful action.

Prefer this order where relevant:
1. warm-up
2. main work
3. recovery between intervals
4. cooldown
5. one essential execution / fueling cue

Example:
- 12 min easy
- 3 x 8 min controlled hard, RPE 7
- 3 min easy between
- 10 min easy

Do NOT produce:
- long explanatory paragraphs
- redundant coaching language
- several lines saying essentially the same thing
- complex interval ladders without a clear reason
- unexplained abbreviations
- invented pace, power or HR targets

For easy sessions:
details may be even simpler.

Example:
- 45 min relaxed running
- Keep it conversational, RPE 2-4
- Finish feeling fresh

For advanced athletes:
precise pace / power / HR may be included ONLY when valid athlete data exists.

Advanced does NOT mean verbose.

The best workout prescription is:
short,
specific,
easy to scan,
and impossible to misunderstand.

--------------------------------------------------
12. RECOVERY
--------------------------------------------------

Recovery is training.

At least one low-load / rest day should normally exist each week.

After demanding sessions:
prefer easy aerobic training, technique training or recovery rather than another hard session.

Poor readiness, repeated high RPE or heavy sessions should reduce ambition before they increase it.

--------------------------------------------------
13. SESSION LENGTH
--------------------------------------------------

${
  maxSession !== null
    ? `The athlete reports a maximum realistic session length of ${maxSession} minutes. Do not exceed it.`
    : "Respect realistic session-length constraints."
}

--------------------------------------------------
14. PRIORITY ORDER
--------------------------------------------------

When principles conflict, use this order:

1. Safety / health
2. Recovery and current tolerance
3. Consistency
4. Athlete availability
5. Race specificity
6. Weakest-discipline development
7. Additional volume

Do not sacrifice the first four simply to maximize training hours.

--------------------------------------------------
15. OUTPUT PHILOSOPHY
--------------------------------------------------

The athlete should receive a SIMPLE plan built on sophisticated reasoning.

Do not explain sports-science terminology unless it helps the athlete execute the workout.

The final plan should feel:
- clear
- purposeful
- realistic
- progressive
- repeatable
- individualized
`;
}
