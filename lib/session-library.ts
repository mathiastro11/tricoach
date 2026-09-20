type SessionLibraryAthlete = {
  goal?: string | null;
  experience?: string | null;

  swimLevel?: string | null;
  bikeLevel?: string | null;
  runLevel?: string | null;

  weakestDiscipline?: string | null;

  poolAccess?: boolean;
  indoorTrainer?: boolean;
  gymAccess?: boolean;

  longestSessionMinutes?:
    | string
    | number
    | null;
};


export function buildSessionLibraryGuidance({
  athlete,
  phase,
}: {
  athlete: SessionLibraryAthlete;
  phase: string;
}) {

  const experience =
    (
      athlete.experience ??
      "Beginner"
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

  const developing =
    experience.includes("beginner") ||
    experience.includes("develop") ||
    experience.includes("recreational");

  const beginnerSwimmer =
    swimLevel.includes("beginner") ||
    swimLevel.includes("novice");

  const advancedSwimmer =
    swimLevel.includes("advanced") ||
    swimLevel.includes("expert") ||
    swimLevel.includes("elite");

  const developingCyclist =
    bikeLevel.includes("beginner") ||
    bikeLevel.includes("novice") ||
    bikeLevel.includes("develop");

  const advancedCyclist =
    bikeLevel.includes("advanced") ||
    bikeLevel.includes("expert") ||
    bikeLevel.includes("elite");

  const developingRunner =
    runLevel.includes("beginner") ||
    runLevel.includes("novice") ||
    runLevel.includes("develop");

  const advancedRunner =
    runLevel.includes("advanced") ||
    runLevel.includes("expert") ||
    runLevel.includes("elite");

  return `
TRICOACH SESSION LIBRARY

Use these session families as the DEFAULT building blocks.

Do not copy them mechanically.
Choose the family that matches:
- the weekly purpose
- athlete level
- training phase
- available duration
- fatigue / readiness
- discipline history
- race demands

The goal is controlled, repeatable training — not novelty.

==================================================
ATHLETE-SPECIFIC SESSION DOSING
==================================================

RUN LEVEL:
${
  developingRunner
    ? `
Developing runner:
- Easy runs commonly 25-55 min.
- Long runs should progress conservatively from recent tolerance.
- Controlled threshold examples should usually start around 12-24 min total quality.
- Prefer intervals such as 3 x 5-6 min or 4 x 4-5 min before larger sets.
- VO2-oriented running is optional, not routine.
- Usually no more than one genuinely demanding run session in a normal week.
`
    : advancedRunner
      ? `
Advanced runner:
- Easy runs may commonly range from 35-90+ min when volume and history support it.
- Long runs may become substantial, but should remain appropriate to race distance and injury history.
- Controlled threshold may commonly accumulate around 24-40 min of quality.
- VO2 work may be used selectively in Build / Peak.
- One to two purposeful run-quality exposures may be appropriate, but only when recovery and total load support them.
`
      : `
Trained runner:
- Easy runs commonly 30-75 min.
- Long runs should progress from recent durability.
- Controlled threshold commonly accumulates around 18-32 min of quality.
- VO2 work should be selective rather than automatic.
- Usually one primary run-quality session per week.
`
}

BIKE LEVEL:
${
  developingCyclist
    ? `
Developing cyclist:
- Prioritize aerobic endurance and comfortable bike frequency.
- Structured threshold should usually begin with about 16-30 min accumulated quality.
- Prefer simple formats such as 3 x 6-8 min or 2 x 10-12 min.
- VO2 work should be used sparingly.
- Long rides should grow gradually rather than jumping to race-distance sessions.
`
    : advancedCyclist
      ? `
Advanced cyclist:
- Can use substantial aerobic volume when schedule and recovery permit.
- Controlled threshold may commonly accumulate around 30-60 min of quality.
- Longer sustained intervals and race-specific blocks may be appropriate.
- VO2 work may be used deliberately in appropriate phases.
- High bike ability does not justify turning easy rides into tempo.
`
      : `
Trained cyclist:
- Maintain substantial easy endurance volume.
- Controlled threshold commonly accumulates around 24-45 min of quality.
- VO2 work may be used selectively.
- Long rides should progressively reflect race demands and fueling needs.
`
}

SWIM LEVEL:
${
  beginnerSwimmer
    ? `
Developing swimmer:
- Prefer frequent manageable exposures when possible.
- Keep sets simple.
- Short repeats such as 25-100 m are usually preferred.
- Technique and relaxed breathing take priority over intensity.
- Avoid long continuous swims that cause major stroke breakdown.
`
    : advancedSwimmer
      ? `
Advanced swimmer:
- Maintain technical quality while allowing more substantial aerobic and threshold work.
- Longer repeats such as 200-400 m may be used when appropriate.
- Race-specific continuous work can be used in Build / Peak.
- Do not add unnecessary drill volume when technique is already stable.
`
      : `
Competent swimmer:
- Combine technique maintenance with aerobic development.
- Use mostly repeat-based sets with progressively longer repetitions.
- Controlled threshold work is appropriate when technique remains stable.
`
}

DOUBLE-SESSION DOSING:
- Doubles are a load-distribution tool, not a badge of seriousness.
- Prefer combinations that separate stress:
  swim + easy run,
  swim + bike,
  strength + easy endurance,
  key bike + short controlled brick.
- Developing athletes should only use doubles when needed to fit realistic volume or improve swim frequency.
- Trained athletes may use doubles regularly when weekly volume warrants it.
- Advanced high-volume athletes may use doubles frequently and occasional three-session days when recovery, schedule and purpose clearly justify it.
- Do not schedule two genuinely hard endurance sessions on the same day as a default.
- If two sessions occur on one day, at least one should usually be technically focused or easy.
- Three-session days should normally contain no more than one demanding session.
- Avoid stacking heavy lower-body strength with demanding running unless deliberately planned and well tolerated.

==================================================
GENERAL EXECUTION STANDARD
==================================================

QUALITY SESSIONS:

Intervals should normally be controlled rather than exhaustive.

The athlete should finish most interval sessions feeling that:
- the intended quality was achieved
- technique remained good
- the final repetition was demanding but not desperate
- one more repetition may have been possible if truly required

Avoid frequent all-out work.

As intensity increases:
- individual intervals may become shorter
- recovery can become relatively more important
- total accumulated high-intensity duration should remain sensible

Do not prescribe physiological numbers the athlete has not measured.

Use:
- RPE
- conversational descriptions
- athlete-supplied pace / power / HR data when available

==================================================
RUN SESSION FAMILIES
==================================================

1. EASY AEROBIC RUN

PURPOSE:
Aerobic development, durability and recovery-compatible volume.

STRUCTURE:
- 5-10 min very easy start
- continuous relaxed running
- optional easy cooldown

EFFORT:
RPE 2-4 / 10
Conversational.

COMMON DURATIONS:
Developing athlete:
25-60 min

More experienced:
35-90 min depending on phase and history.

Do not make the athlete "earn" an easy run by adding tempo at the end.


2. EASY RUN + STRIDES

PURPOSE:
Aerobic volume plus relaxed neuromuscular speed.

STRUCTURE:
- mostly easy running
- near the end: 4-8 relaxed strides
- each stride about 10-20 sec
- full easy recovery between

STRIDES:
Fast and smooth, NOT sprinting.
Technique should remain relaxed.

Good in:
Base
Build
Taper


3. LONG EASY RUN

PURPOSE:
Running durability and aerobic endurance.

EFFORT:
Mostly RPE 2-4.

STRUCTURE:
- easy beginning
- controlled continuous running
- no forced fast finish unless specifically justified

Progress duration from recent run tolerance.

Do not use the long run merely as a tool for filling weekly hours.


4. CONTROLLED THRESHOLD RUN

PURPOSE:
Improve sustainable high-aerobic performance.

DEFAULT EXAMPLES:

Shorter:
3 x 6 min
2 min easy recovery

Moderate:
3 x 8 min
2-3 min easy recovery

Experienced:
3 x 10 min
or
4 x 8 min
2-3 min easy recovery

FULL SESSION:
- 10-15 min easy warm-up
- optional 3-4 short strides
- main intervals
- easy recovery between
- 8-15 min cooldown

EFFORT:
Usually RPE 6-8.
Controlled.
Not race-to-the-finish intervals.

Use fewer / shorter intervals when athlete experience or current load is low.

LEVEL DOSING:
${
  developingRunner
    ? "Prefer roughly 12-24 min accumulated controlled quality."
    : advancedRunner
      ? "Roughly 24-40 min accumulated controlled quality may be appropriate when well tolerated."
      : "Prefer roughly 18-32 min accumulated controlled quality."
}


5. HIGH AEROBIC / VO2 RUN

PURPOSE:
High aerobic power.

USE:
Sparingly.
Mostly Build / selected Peak work.

EXAMPLES:
5 x 3 min hard
2-3 min easy recovery

or

4 x 4 min hard
2-3 min easy recovery

or for experienced athletes:
5 x 4 min

EFFORT:
RPE about 8-9.

The first repetition must not be maximal.
Aim for similar quality across all repetitions.

Avoid placing this next to another demanding run or heavy lower-body strength session.


6. HILL INTERVAL RUN

PURPOSE:
Running strength, mechanics and aerobic quality.

EXAMPLE:
- easy warm-up
- 6-10 x 45-90 sec uphill
- controlled hard effort
- easy jog / walk recovery downhill
- cooldown

Longer aerobic hill intervals may also be used.

Do not turn every hill workout into maximal sprinting.


7. EASY BRICK RUN

PURPOSE:
Become comfortable running after cycling.

STRUCTURE:
Immediately or shortly after bike:
10-25 min easy controlled run

EFFORT:
RPE 2-4 initially.

The purpose is transition adaptation,
not creating another hard workout.

==================================================
BIKE SESSION FAMILIES
==================================================

1. EASY / AEROBIC ENDURANCE BIKE

PURPOSE:
Aerobic volume with relatively low mechanical impact.

EFFORT:
RPE 2-4.

DURATION:
Can vary widely with experience and race distance.

Keep the majority genuinely comfortable.


2. LONG ENDURANCE RIDE

PURPOSE:
Durability, race preparation and aerobic volume.

EFFORT:
Predominantly RPE 2-4.

STRUCTURE:
- easy opening
- sustained aerobic riding
- optional selected race-effort blocks in Build / Peak
- easy finish where practical

Long rides should increasingly include:
- fueling practice
- hydration practice
- position / equipment practice
- race-day routine practice


3. CONTROLLED BIKE THRESHOLD

PURPOSE:
Improve sustainable cycling power.

EXAMPLES:

3 x 8 min
3 min easy

3 x 10 min
3-4 min easy

3 x 12 min
4 min easy

2 x 15-20 min
5 min easy

EFFORT:
RPE 6-8.

Do not prescribe FTP percentages unless FTP data is valid and available.

Prefer controlled accumulated quality to a single exhaustive effort.

LEVEL DOSING:
${
  developingCyclist
    ? "Usually about 16-30 min accumulated controlled quality."
    : advancedCyclist
      ? "About 30-60 min accumulated controlled quality may be appropriate when history and recovery support it."
      : "Usually about 24-45 min accumulated controlled quality."
}


4. BIKE HIGH-AEROBIC / VO2

PURPOSE:
High aerobic power.

EXAMPLES:
4 x 4 min
3-4 min easy

5 x 3 min
3 min easy

5 x 4 min
3-4 min easy

EFFORT:
RPE 8-9.

Use selectively.
Quality should remain stable across repetitions.


5. TEMPO / RACE-SPECIFIC BIKE

PURPOSE:
Develop sustained race-relevant riding.

Useful particularly in Build / Peak.

EXAMPLES:
2 x 15 min controlled tempo

3 x 15 min race-relevant effort

2 x 20 min controlled sustained work

For long-course athletes:
race-specific blocks may progressively become longer.

Do not confuse race specificity with making the entire ride hard.


6. BIKE + SHORT BRICK

STRUCTURE:
Bike session
+
10-25 min run

Base:
bike mostly easy + very short easy run

Build:
endurance / controlled bike + easy-to-steady brick

Peak:
selected race-specific bike + controlled race-feel run

Do not make both parts maximal.

==================================================
SWIM SESSION FAMILIES
==================================================

${
  beginnerSwimmer
    ? `
BEGINNER SWIM PRIORITY:

The primary goals are:
- relaxed breathing
- body position
- confidence
- stroke consistency
- sustainable repeatable swimming

Do not prescribe elite-style complexity.

Short repeats with recovery are often more useful than one long continuous swim.
`
    : `
SWIM PRIORITY:

Retain technical quality while progressively developing aerobic and race-specific swimming.
`
}

1. TECHNIQUE + EASY AEROBIC

STRUCTURE EXAMPLE:
- easy warm-up
- simple drill block
- short aerobic repeats
- relaxed cooldown

Example:
200-400 m easy
4-8 x 25-50 m drill / technique
6-10 x 50-100 m easy aerobic
100-200 m easy

Adjust total distance to swimmer ability.


2. AEROBIC REPEAT SWIM

PURPOSE:
Accumulate quality aerobic swimming without stroke breakdown.

EXAMPLES:
8 x 100 m

10 x 100 m

6 x 200 m

Recovery:
short enough to maintain aerobic continuity,
long enough to preserve technique.

For beginners, shorter repetitions are preferred.


3. CONTROLLED THRESHOLD SWIM

For swimmers with sufficient competence.

EXAMPLES:
8-12 x 100 m controlled strong

or

5-8 x 200 m controlled strong

or

3-5 x 300 m

Recovery should allow consistent quality.

Use CSS / threshold pace only if the athlete has valid CSS or equivalent testing data.


4. SPEED / TECHNIQUE QUALITY

PURPOSE:
Stroke quality at higher speed.

EXAMPLE:
8-12 x 25-50 m fast but technically controlled
with generous recovery.

Do not make this an exhausting sprint session.


5. CONTINUOUS / LONG AEROBIC SWIM

Use when appropriate, but do not rely on it as the default session.

Especially for developing swimmers:
repeat-based aerobic swimming is often easier to execute with good form.


6. OPEN-WATER SKILLS

When safe open-water access is explicitly available:

Potential components:
- sighting
- straight-line swimming
- starts
- drafting practice
- buoy turns
- wetsuit familiarity
- controlled continuous race-feel swimming

Never assume safe open-water access simply because the race is a triathlon.

==================================================
TRIATHLON STRENGTH ENGINE
==================================================

STRENGTH IS SUPPORT TRAINING FOR TRIATHLON.

Its purpose is to improve:
- maximal force production
- running and cycling economy
- neuromuscular efficiency
- lower-limb force capacity
- robustness under endurance load
- useful upper-body pulling strength for swimming

The PRIMARY purpose is NOT:
- bodybuilding-style fatigue
- chasing muscle soreness
- exhausting circuits
- maximizing gym volume
- turning strength into another endurance workout

However, useful muscle development is allowed and can be desirable.

When recovery budget, training phase and endurance load permit,
Strength may also support:
- an athletic and muscular physique
- moderate chest, back and shoulder development
- maintenance or development of useful lean mass
- athlete enjoyment and motivation

This secondary hypertrophy goal must NEVER compromise:
- key endurance sessions
- recovery
- race-specific training
- useful lower-body strength quality
- the athlete's primary triathlon goal.

Strength sessions must be clear enough that the athlete knows:
- the exact exercise
- working sets
- repetitions
- RPE / repetitions in reserve
- rest between sets
- one short execution cue

Never prescribe only:
"lower-body strength",
"full-body strength",
"gym session",
or vague movement categories without an executable prescription.


==================================================
STRENGTH SAFETY + EXPERIENCE
==================================================

Triathlon experience does NOT automatically mean strength-training experience.

If the athlete's lifting experience is unknown:
- do not assume competence with near-maximal lifting
- start conservatively
- use technically simple movements where appropriate
- use RPE / RIR rather than invented kilogram targets
- progress loading only when technique and tolerance are established

${
  developing
    ? `
For this developing athlete:
- prefer an adaptation period before genuinely heavy strength
- use simple stable exercises
- normally start around 2 working sets per exercise
- usually use roughly 6-8 controlled reps on main strength movements
- target approximately RPE 6-7 with about 3 reps in reserve
- avoid aggressive plyometrics or technically complex lifts
`
    : `
For this athlete:
- heavier strength may be appropriate when lifting experience and technique support it
- do not confuse endurance fitness with lifting readiness
- retain conservative RPE / RIR control when recent strength history is uncertain
`
}

GYM ACCESS:
${
  athlete.gymAccess === false
    ? `
No confirmed gym access:
- do not prescribe exercises that require a barbell, rack or machines as the only option
- use practical alternatives such as split squats, loaded backpacks, bands, single-leg work, push-ups, rows and calf work
- acknowledge that maximal-strength loading may be limited by available equipment
`
    : `
Gym access is available or not explicitly excluded:
- barbells, dumbbells, machines and cables may be used when appropriate
- choose the simplest effective exercise rather than the most technical exercise
`
}


==================================================
CORE PROGRAMMING PRINCIPLES
==================================================

1. PRIORITIZE STRENGTH, NOT FATIGUE

For trained and technically competent athletes,
the most important lower-body lifts may commonly use:
- about 3 working sets
- about 4-6 reps
- substantial but controlled load
- approximately RPE 7-8
- usually 2-3 repetitions in reserve

Do not routinely prescribe sets to failure.

The final repetition should remain technically sound.
The athlete should normally feel capable of another
roughly 2 repetitions if absolutely required.


2. HEAVY LOADS ARE SELECTIVE

Do not make every exercise a heavy 4-6 rep lift.

Usually:
- 1-2 primary strength movements receive the heaviest loading
- secondary movements use moderate rep ranges
- trunk work remains controlled
- power work uses very low repetition counts


3. FULL RECOVERY BETWEEN IMPORTANT SETS

Rest periods should protect force production,
technical quality and the athlete's endurance recovery.

For heavy primary multi-joint strength exercises:
- normally use about 3-4 minutes between working sets
- around 3 minutes is a strong default
- use the longer end when the set is particularly demanding
  or when force quality is clearly improved by more recovery

For moderate secondary multi-joint exercises:
- normally use about 2-3 minutes

For smaller accessory, trunk and isolation-style work:
- normally use about 60-120 seconds
- use longer when needed to preserve movement quality

For explosive / power exercises:
- normally allow about 2-3 minutes
- the athlete should begin the next set fresh enough
  to remain fast and technically sharp

Do NOT deliberately shorten rest simply to:
- raise heart rate
- make the session feel harder
- save a few minutes at the expense of strength quality

If the session must be shortened,
prefer reducing low-priority sets or accessories
rather than compressing important rest periods.

These are practical defaults, not rigid physiological cutoffs.
Individual recovery between sets may vary.


4. QUALITY BEFORE QUANTITY

When endurance load rises,
reduce strength VOLUME before unnecessarily removing
all meaningful strength stimulus.

Common first reductions:
- remove one accessory exercise
- remove one working set
- reduce unilateral/accessory volume

Where tolerated, retain technically high-quality
moderate-heavy work on the most useful main movements.


5. NO ROUTINE 1RM TESTING

TriCoach should not require maximal strength testing
to prescribe effective strength training.

Use:
- RPE
- RIR
- recent successful training
- technical quality

Do not invent kilogram loads.


==================================================
MOVEMENT PRIORITIES
==================================================

A triathlon strength week should usually draw from these
movement families.

Do NOT force every category into every session.

A. KNEE-DOMINANT STRENGTH
Examples:
- back squat
- front squat
- hack squat
- leg press
- goblet squat

B. HIP-DOMINANT / HINGE
Examples:
- Romanian deadlift
- trap-bar deadlift
- hip thrust
- controlled deadlift variation

C. SINGLE-LEG STRENGTH
Examples:
- Bulgarian split squat
- reverse lunge
- step-up
- single-leg press

D. CALF / ANKLE FORCE
Examples:
- seated calf raise
- standing calf raise
- single-leg calf raise

Include calf work regularly when appropriate.
Both bent-knee and straight-knee variants may be used
across the training cycle rather than forcing both
into every session.

E. UPPER-BODY PULL
Examples:
- pull-up
- lat pulldown
- chest-supported row
- cable row

This is usually more relevant to swim support than
large bodybuilding-style upper-body volume.

F. UPPER-BODY PUSH
Examples:
- bench press
- incline dumbbell press
- flat dumbbell press
- push-up
- landmine press

Upper-body pushing is not a primary determinant of triathlon
performance, but it can be programmed deliberately when the
athlete has recovery capacity.

Benefits may include:
- useful general upper-body strength
- chest / shoulder / triceps development
- a more athletic muscular physique
- athlete motivation and enjoyment

Do not automatically remove pressing merely because it is
less triathlon-specific than lower-body strength.

In Base and lower-endurance-load periods,
1-2 purposeful upper-body pushing exercises across the week
can be entirely appropriate.

Use moderate volume.
Do not let chest or shoulder fatigue compromise swimming
quality or important endurance work.

G. TRUNK
Examples:
- Pallof press
- dead bug
- side plank
- cable anti-rotation
- controlled carry

Prefer useful trunk control over exhausting high-repetition
abdominal circuits.

H. POWER
Only when technically appropriate:
- countermovement jump
- box jump
- low-volume jump squat
- other simple explosive movements

Power repetitions must be fresh and fast.
Stop the set when movement quality or explosiveness drops.


==================================================
SYSTEMATIC VARIATION + ATHLETIC HYPERTROPHY
==================================================

1. CONSISTENCY BEFORE NOVELTY

Strength exercises need enough repeated exposure for:
- technical learning
- measurable progression
- reliable RPE interpretation
- meaningful strength adaptation

Do NOT replace exercises every week simply to create variety.

An identical session in consecutive weeks is acceptable
when it is intentional and supports progression.

However, do not lazily copy the exact same full Strength
session indefinitely when useful systematic variation is possible.


2. USE A STABLE A / B MODEL WHEN APPROPRIATE

When two Strength sessions fit safely within the week,
prefer two related but distinct sessions rather than
two identical workouts.

Example structure:

STRENGTH A
- knee-dominant primary lift
- hinge
- single-leg
- calf
- upper pull
- upper push
- trunk if useful

STRENGTH B
- hinge or alternative lower-body primary lift
- different knee-dominant pattern
- different single-leg pattern
- calf
- different upper pull
- different upper push
- optional low-volume power or trunk work

A and B should train the same important physical qualities
without being random collections of exercises.


3. IF ONLY ONE STRENGTH SESSION PER WEEK

Do not completely redesign the workout every week.

Prefer one of these:
- retain key anchor exercises and vary 1-2 secondary movements
- alternate an established A and B session
- repeat the same session while progressing reps / load quality

When previous-week context is available,
avoid exact duplication purely through inertia.

There should normally be either:
- purposeful progression
OR
- purposeful small variation.


4. EXERCISE BLOCKS

When an exercise works well,
normally retain important anchor movements for roughly
3-6 weeks before considering a meaningful rotation.

Earlier replacement is appropriate for:
- pain or discomfort
- unavailable equipment
- poor technical fit
- excessive soreness
- athlete dislike
- a changed training phase
- a clearly better exercise for the current purpose

Do not rotate a successful exercise merely because it
has appeared several times.


5. SYSTEMATIC VARIATION

Good variation:
- back squat -> leg press in an alternative session
- Romanian deadlift -> hip thrust
- Bulgarian split squat -> step-up
- bench press -> incline dumbbell press
- pull-up -> lat pulldown
- chest-supported row -> cable row

These substitutions should preserve the intended movement
or training purpose.

Bad variation:
- choosing entirely new exercises every week
- changing several exercises simultaneously without reason
- adding technical lifts merely for novelty
- replacing effective movements with inferior but unusual ones


6. MOTIVATION MATTERS

When two exercises provide a similarly useful training effect,
athlete enjoyment and preference are legitimate selection factors.

A Strength program the athlete enjoys and executes consistently
is preferable to a theoretically elegant program they dislike.

TriCoach may therefore include familiar motivating exercises
such as:
- bench press
- incline dumbbell press
- pull-ups
- rows
- leg press
- squats
- Romanian deadlifts

as long as they fit the athlete, phase and recovery budget.


7. ATHLETIC HYPERTROPHY — SECONDARY GOAL

Moderate hypertrophy is compatible with the Strength program.

Priority order remains:

1. Triathlon performance
2. Recovery and injury-risk management
3. Useful maximal strength / power
4. Moderate athletic muscle development

When there is adequate recovery capacity,
include enough upper-body work to provide a genuine stimulus,
not merely token exercises.

Useful hypertrophy-oriented work may commonly use:
- roughly 6-12 repetitions for compound exercises
- roughly 8-15 repetitions for smaller accessory work
- usually about 1-3 repetitions in reserve
- controlled technique and useful range of motion
- sufficient rest to maintain quality

Do NOT automatically push hypertrophy sets to failure.

Do NOT chase maximal bodybuilding volume.

Base phase and lower endurance-load periods are the best time
to allow somewhat more hypertrophy-oriented work.

As race specificity and endurance stress rise:
- reduce hypertrophy volume first
- preserve important strength quality where possible
- remove low-priority upper-body accessories if recovery demands it


8. CHEST + UPPER-BODY DEVELOPMENT

When appropriate, Strength programming may deliberately include
some chest and upper-body development.

Good options:
- bench press
- incline dumbbell press
- dumbbell press
- weighted or normal push-ups
- pull-ups / lat pulldowns
- chest-supported rows
- cable rows

A practical TriCoach Strength week may therefore contain both:
- performance-oriented lower-body strength
AND
- a modest amount of enjoyable upper-body muscle-building work.

This is intentional and not a programming error.


9. DO NOT LET "TRIATHLON SPECIFIC" BECOME TOO NARROW

Not every useful gym exercise needs to imitate swimming,
cycling or running.

General maximal strength and useful muscle development
can support the athlete without visually resembling
the endurance disciplines.

Choose exercises based on:
- adaptation
- fatigue cost
- safety
- progression
- practicality
- athlete enjoyment

not on superficial sport resemblance alone.


==================================================
SESSION FAMILY 1 — STRENGTH ADAPTATION
==================================================

USE:
- athlete new to structured strength
- returning after a long strength break
- early Base when tolerance must be rebuilt

GOAL:
Learn movements and develop tolerance without creating
large soreness that disrupts endurance training.

EXAMPLE:

1. Goblet squat OR leg press
2 x 6-8
RPE 6-7 · about 3 RIR
Rest 90-120 s

2. Romanian deadlift
2 x 6-8
RPE 6-7 · about 3 RIR
Rest 90-120 s

3. Split squat
2 x 6 each side
RPE 6-7
Rest 90 s

4. Seated or standing calf raise
2 x 8-10
RPE 7
Rest 60-90 s

5. Lat pulldown or chest-supported row
2 x 8
RPE 6-7
Rest 60-90 s

6. Pallof press or dead bug
2 x 8-10 each side
Controlled
Rest about 60 s

Normally keep the first exposures deliberately manageable.
Do not create soreness for its own sake.


==================================================
SESSION FAMILY 2 — MAX STRENGTH A
==================================================

USE:
Base and selected Build periods when the athlete has
appropriate strength experience and recovery capacity.

GOAL:
Improve useful lower-body force with low unnecessary fatigue.

EXAMPLE:

1. Back squat OR leg press
3 x 4-6
RPE 7-8 · about 2-3 RIR
Rest 2.5-3 min

2. Romanian deadlift
3 x 4-6
RPE 7-8
Rest 2-3 min

3. Bulgarian split squat
2 x 5-6 each side
RPE 7-8
Rest 90-120 s

4. Seated calf raise
3 x 6-8
RPE about 8
Rest 90 s

5. Lat pulldown OR pull-up
3 x 6-8
RPE 7-8
Rest 90-120 s

6. Pallof press
2 x 8-10 each side
Controlled
Rest about 60 s

Do not add extra leg exercises just because time remains.


==================================================
SESSION FAMILY 3 — STRENGTH + POWER B
==================================================

USE:
Technically competent athletes after a strength foundation
has been established.

GOAL:
Retain heavy-force development while adding a small
high-quality explosive stimulus.

EXAMPLE:

1. Countermovement jump
3 x 3
Fast and explosive
Full quality
Rest 60-90 s

2. Trap-bar deadlift OR squat
3 x 4-5
RPE 7-8
Rest 2.5-3 min

3. Step-up
2 x 5-6 each side
RPE 7-8
Rest 90-120 s

4. Hip thrust
2 x 6
RPE 7-8
Rest 90-120 s

5. Chest-supported row
3 x 6-8
RPE 7-8
Rest 90 s

6. Standing calf raise
2 x 6-8
RPE about 8
Rest 90 s

7. Landmine press OR controlled push variation
2 x 6-8
RPE 7
Rest 60-90 s

Power work belongs near the beginning of the session,
after preparation but before fatigue.

Do not turn power work into high-repetition conditioning.


==================================================
SESSION FAMILY 4 — MAINTENANCE STRENGTH
==================================================

USE:
Build / Peak or other periods where endurance-specific
load has increased.

GOAL:
Retain meaningful strength while minimizing interference
with key swim, bike and run sessions.

Typical:
- 3-5 exercises
- usually 2 working sets per exercise
- retain some moderate-heavy loading
- approximately RPE 7-8
- avoid failure
- remove low-priority accessory volume first

EXAMPLE:

1. Squat OR leg press
2 x 4-5
RPE 7-8
Rest 2-3 min

2. Romanian deadlift OR hip thrust
2 x 5
RPE 7-8
Rest 2 min

3. Split squat OR step-up
2 x 5 each side
RPE 7
Rest 90 s

4. Lat pulldown OR row
2 x 6-8
RPE 7
Rest 90 s

5. Calf raise
2 x 6-8
RPE 7-8
Rest 90 s

Optional brief trunk work only if it does not
unnecessarily extend the session.


==================================================
SESSION FAMILY 5 — TAPER / RACE MAINTENANCE
==================================================

Strength during taper exists only to preserve familiarity
and neuromuscular quality.

Use only familiar movements.

Typical:
- 2-4 familiar exercises
- 1-2 working sets
- no failure
- no novel eccentric loading
- no new plyometrics
- no maximal testing
- very low soreness risk

Do not insert strength close enough to the race that
residual soreness or leg fatigue can affect race readiness.

If strength creates meaningful recovery cost,
remove it rather than protecting gym volume at the
expense of race performance.


==================================================
PHASE-BASED STRENGTH DOSING
==================================================

CURRENT TRAINING PHASE:
${phase}

BASE:

Preferred when recovery and schedule support it:
- commonly 2 strength exposures per week
- adaptation first when lifting history is limited
- progress toward meaningful heavier strength
- build technical consistency before adding load
- use low-to-moderate total gym volume


BUILD:

Usually:
- 1-2 strength sessions depending on total endurance load
- maintain meaningful load
- reduce accessory volume as race-specific training rises
- protect key run, bike and brick sessions
- do not chase new gym PRs every week


PEAK:

Usually:
- low-volume maintenance
- often one purposeful strength exposure is enough
- preserve force qualities without creating soreness
- race-specific endurance sessions have priority


TAPER:

Usually:
- 0-1 very short familiar strength exposure if appropriate
- no attempt to create new strength adaptations
- remove strength entirely when recovery or race readiness
  would be better without it


==================================================
CONCURRENT TRAINING — WEEK INTEGRATION
==================================================

Strength must be planned WITH the endurance week,
not inserted independently.


1. PROTECT KEY RUNNING

Avoid placing heavy lower-body strength immediately before:
- key run intervals
- long run
- demanding hill running
- race-specific brick run

Running has relatively high musculoskeletal loading,
so unnecessary strength-induced soreness before key running
should be avoided.


2. USE DOUBLES INTELLIGENTLY

Good pairings often include:
- strength + easy swim
- strength + technique swim
- strength + easy bike
- strength + short easy endurance

Heavy lower-body strength + demanding running
should NOT be the default double.


3. SEPARATE CONTRADICTORY STRESS WHEN PRACTICAL

When strength and endurance must happen on the same day,
several hours of recovery between sessions is preferable
when schedule permits.

Around 6+ hours separation is a useful practical target,
not a magical physiological cutoff.

Do not claim that exactly six hours is required.


4. SAME SESSION

If strength development is an important objective
and strength must share the same continuous session
with easy endurance, strength quality should generally
not be performed after exhaustive endurance work.

If the endurance session is the week's major priority,
protect that endurance objective and reduce or relocate
the strength dose instead of compromising both.


5. FATIGUE MANAGEMENT

When the athlete reports:
- unusual soreness
- repeated high RPE
- poor recovery
- illness
- declining key-session quality

reduce strength stress.

Usually reduce:
1. accessory exercises
2. number of working sets
3. power / plyometric additions

before automatically removing all useful strength work.


6. NOVELTY COSTS RECOVERY

New exercises commonly create more soreness.

Do not introduce multiple unfamiliar exercises during:
- high-load Build weeks
- Peak
- taper
- race week

Prefer stable exercise selection across several weeks.


==================================================
STRENGTH PROGRESSION
==================================================

Progress only when:
- all prescribed repetitions are completed
- technique remains sound
- target RPE / RIR is respected
- the athlete is recovering well
- endurance quality is not deteriorating

Possible progression:
- a small load increase
- then repeat the same set / rep structure

Do not progress:
load + sets + reps + exercise complexity simultaneously.

For a triathlete,
consistent strength quality with controlled fatigue
is more valuable than rapid gym progression.


==================================================
STRENGTH OUTPUT STANDARD
==================================================

Every generated Strength workout must name the exercises.

For every working exercise include:
- sets
- repetitions
- RPE / RIR or another clear load instruction
- rest between sets

Include only one short technical cue where useful.

GOOD:
Back squat — 3 x 5 · RPE 7-8 · 2-3 RIR · rest 2:30.
Controlled descent, drive up strongly.

BAD:
Lower body strength — 20 min.

BAD:
3 rounds of squats, lunges, burpees and mountain climbers
with minimal rest.

BAD:
Leg day to failure.

Strength training must remain strength training,
not disguised metabolic conditioning.

==================================================
PHASE SELECTION
==================================================

BASE

Prefer:
- easy aerobic sessions
- technique swim
- aerobic swim repeats
- easy run + strides
- controlled introductory threshold
- endurance bike
- strength development
- occasional short brick

Avoid:
too much race-intensity work.


BUILD

Prefer:
- maintain high easy volume
- threshold run / bike
- selected VO2 sessions
- longer endurance riding
- progressive long run
- more regular bricks
- race fueling practice
- maintain strength


PEAK

Prefer:
- race-specific bike
- race-specific bricks
- key endurance sessions
- enough intensity to maintain fitness
- reduced strength volume

Do NOT simply maximize training hours.


TAPER

Prefer:
- reduced duration
- easy training
- short familiar intensity
- short race-feel efforts
- low-fatigue transition work

Avoid:
- novel workouts
- exhaustive intervals
- giant long runs
- high-volume strength
- trying to build new fitness at the last moment

==================================================
SESSION SELECTION RULES
==================================================

A week should not contain every session family.

Choose the minimum number of sessions required to achieve the week's objectives.

For ${
  developing
    ? "this developing athlete"
    : "this athlete"
}:

- keep quality purposeful
- protect easy days
- do not create unnecessary intensity
- progress one variable at a time where practical
- prefer repeatability over hero sessions

If training time is limited:
protect the most important stimulus rather than compressing several different stimuli into one chaotic workout.

If fatigue is elevated:
reduce interval number / duration before increasing intensity.

If a session is shortened:
preserve its primary purpose.

Example:
A 60-minute threshold bike becoming 40 minutes should usually keep a smaller amount of threshold work rather than becoming 40 minutes of unrelated training.

==================================================
TRICOACH WORKOUT COPY CONTRACT
==================================================

Every generated workout must be athlete-readable immediately.

TITLE:
- 2-5 words where practical
- concrete and familiar
- state the session type

PURPOSE:
- one short sentence
- explain the training reason
- no mini-essay

DETAILS:
- normally 3-5 lines
- one instruction per line
- shortest wording that remains unambiguous
- include interval recovery when relevant
- include warm-up / cooldown only when useful
- include fueling only when it matters to execution

Preferred style:

"Bike threshold — 70 min"

- 15 min easy
- 3 x 10 min controlled hard, RPE 7
- 5 min easy between
- 10 min easy

Purpose:
Build sustainable bike power with controlled fatigue.

Another example:

"Easy swim — 40 min"

- Relaxed easy swimming
- Short technique work
- Keep breathing calm and stroke smooth

Purpose:
Build swim consistency and technique.

Do not make instructions more complicated because the athlete is advanced.

Complex physiology belongs inside the coaching engine.
The athlete should receive simple execution.

==================================================
SIMPLE OUTPUT
==================================================

The athlete should not see this entire library.

The final workout should remain easy to understand.

Good example:

"Controlled threshold run — 50 min"

- 12 min easy
- 3 x 7 min controlled hard, RPE 7
- 2 min easy jog between
- 10 min easy

Purpose:
Build sustainable running speed without excessive fatigue.

Bad example:

"Run quality — moderate/hard"

Do not leave the athlete guessing.
`;
}
