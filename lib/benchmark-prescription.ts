import {
  buildBenchmarkState,
  type PerformanceBenchmarks,
} from "@/lib/performance-benchmarks";


function formatPace(
  seconds:
    number | null
) {
  if (
    seconds === null ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return null;
  }

  const rounded =
    Math.round(seconds);

  const minutes =
    Math.floor(
      rounded / 60
    );

  const remaining =
    rounded % 60;

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}


function wattRange(
  ftp: number,
  low: number,
  high: number
) {
  return {
    low:
      Math.round(
        ftp * low
      ),

    high:
      Math.round(
        ftp * high
      ),
  };
}


function paceRange(
  baseSeconds: number,
  fasterOffset: number,
  slowerOffset: number
) {
  return {
    faster:
      formatPace(
        baseSeconds +
        fasterOffset
      ),

    slower:
      formatPace(
        baseSeconds +
        slowerOffset
      ),
  };
}


export function buildBenchmarkPrescriptionGuidance(
  benchmarks:
    PerformanceBenchmarks |
    null |
    undefined
) {

  const state =
    buildBenchmarkState(
      benchmarks
    );


  // =====================================================
  // SWIM
  // =====================================================

  let swimGuidance = `
SWIM BENCHMARK PRESCRIPTION:

No valid CSS is available.

Use:
- RPE
- technical quality
- repeatability
- breathing control

Do not invent swim pace targets.
`;


  if (
    state.swim.usable &&
    state.swim.cssSecondsPer100m
  ) {
    const css =
      state.swim
        .cssSecondsPer100m;

    const aerobic =
      paceRange(
        css,
        8,
        18
      );

    const steady =
      paceRange(
        css,
        4,
        10
      );

    const threshold =
      paceRange(
        css,
        -2,
        4
      );


    swimGuidance = `
SWIM BENCHMARK PRESCRIPTION:

Valid CSS:
${formatPace(css)} /100 m

Use CSS only where pace improves execution.

PRACTICAL GUIDANCE:

Easy / aerobic repeats:
approximately
${aerobic.faster}-${aerobic.slower} /100 m

Steady aerobic / race-relevant work:
approximately
${steady.faster}-${steady.slower} /100 m

Controlled threshold work:
approximately
${threshold.faster}-${threshold.slower} /100 m

IMPORTANT:
- Technique overrides pace.
- Developing swimmers should not chase CSS when stroke quality breaks down.
- Easy technique work does not need a pace target.
- Do not turn every swim into CSS work.
- Pool length and repeat distance may affect practical pacing.
`;
  }


  // =====================================================
  // BIKE
  // =====================================================

  let bikeGuidance = `
BIKE BENCHMARK PRESCRIPTION:

No valid FTP is available.

Use RPE and controlled execution.

Do not invent watt targets.
`;


  if (
    state.bike.ftpWatts
  ) {
    const ftp =
      state.bike.ftpWatts;

    const recovery =
      wattRange(
        ftp,
        0.50,
        0.60
      );

    const endurance =
      wattRange(
        ftp,
        0.60,
        0.75
      );

    const tempo =
      wattRange(
        ftp,
        0.75,
        0.85
      );

    const threshold =
      wattRange(
        ftp,
        0.90,
        1.00
      );

    const highAerobic =
      wattRange(
        ftp,
        1.05,
        1.15
      );


    bikeGuidance = `
BIKE BENCHMARK PRESCRIPTION:

Valid FTP:
${ftp} W

Use broad ranges rather than false precision.

Recovery / very easy:
approximately
${recovery.low}-${recovery.high} W
RPE 1-3

Aerobic endurance:
approximately
${endurance.low}-${endurance.high} W
RPE 2-4

Controlled tempo / race-specific:
approximately
${tempo.low}-${tempo.high} W
RPE 5-7 depending on purpose

Controlled threshold intervals:
approximately
${threshold.low}-${threshold.high} W
RPE 7-8

High aerobic / VO2-oriented intervals:
approximately
${highAerobic.low}-${highAerobic.high} W
RPE 8-9

IMPORTANT:
- These are practical training ranges, not physiological absolutes.
- RPE and ability to complete the session remain important.
- Heat, fatigue, terrain and indoor/outdoor differences can change appropriate power.
- Do not force the athlete to hold a number when execution is clearly deteriorating.
- Long-course race-specific intensity must also reflect race distance and durability.
`;
  } else if (
    state.bike
      .twentyMinutePowerWatts
  ) {
    bikeGuidance = `
BIKE BENCHMARK PRESCRIPTION:

Recent 20-minute power:
${state.bike.twentyMinutePowerWatts} W

No explicit FTP is stored.

Use this result only as performance context.

Do NOT silently convert it into an exact FTP.
Continue prescribing primary intensity with RPE until a valid FTP estimate is available.
`;
  }


  // =====================================================
  // RUN
  // =====================================================

  let runGuidance = `
RUN BENCHMARK PRESCRIPTION:

No valid threshold pace is available.

Use:
- RPE
- conversational effort
- session purpose
- recent execution

Do not invent running pace zones.
`;


  if (
    state.run
      .thresholdSecondsPerKm
  ) {
    const threshold =
      state.run
        .thresholdSecondsPerKm;

    const controlledThreshold =
      paceRange(
        threshold,
        -3,
        7
      );


    runGuidance = `
RUN BENCHMARK PRESCRIPTION:

Valid threshold pace:
${formatPace(
  threshold
)} /km

Controlled threshold work may normally target approximately:

${controlledThreshold.faster}-${controlledThreshold.slower} /km

with RPE approximately 6-8.

IMPORTANT:
- Do not prescribe easy pace simply by applying a fixed formula to threshold pace.
- Easy running should remain conversational / RPE 2-4.
- Heat, hills, surface and accumulated fatigue matter.
- Threshold intervals should remain controlled rather than becoming time trials.
- Do not derive VO2 pace automatically from threshold pace.
`;
  }


  // =====================================================
  // RUN PERFORMANCE CONTEXT
  // =====================================================

  const runContext:
    string[] = [];

  if (
    state.run.fiveKSeconds
  ) {
    runContext.push(
      `Recent 5K: ${formatPace(
        state.run.fiveKSeconds
      )} total`
    );

    const fiveKPace =
      state.run.fiveKSeconds /
      5;

    runContext.push(
      `Recent 5K average pace: ${formatPace(
        fiveKPace
      )} /km`
    );
  }


  if (
    state.run.tenKSeconds
  ) {
    runContext.push(
      `Recent 10K: ${formatPace(
        state.run.tenKSeconds
      )} total`
    );

    const tenKPace =
      state.run.tenKSeconds /
      10;

    runContext.push(
      `Recent 10K average pace: ${formatPace(
        tenKPace
      )} /km`
    );
  }


  const runPerformanceContext =
    runContext.length > 0
      ? `
RUN PERFORMANCE CONTEXT:

${runContext.join("\n")}

These are real performance anchors.

They may help assess progression and athlete capability.

They do NOT automatically equal:
- threshold pace
- easy pace
- race pace for another distance
- interval pace
`
      : "";


  return `
==================================================
BENCHMARK-BASED SESSION PRESCRIPTION
==================================================

${swimGuidance}

${bikeGuidance}

${runGuidance}

${runPerformanceContext}

GLOBAL BENCHMARK RULES:

1. A benchmark target should make a workout easier to execute,
   not harder to understand.

2. Never include a benchmark number merely because it exists.

3. Easy training remains primarily effort-controlled.

4. Use benchmark targets mainly for:
   - structured intervals
   - controlled threshold work
   - selected race-specific work
   - repeatable swim sets

5. Always pair numerical targets with simple effort guidance.

Example:

GOOD:
3 x 10 min at approximately 225-245 W,
controlled RPE 7,
4 min easy between.

BAD:
3 x 10 min at 237 W exactly.

6. Do not create fake precision.

7. When the athlete cannot execute the prescribed target at
   the intended RPE, athlete response matters more than the number.

8. Readiness, fatigue, pain and illness always outrank benchmark targets.

9. Do not convert every workout into pace / watt targets.

10. When benchmark data is absent, RPE-based training is fully valid.
`;
}
