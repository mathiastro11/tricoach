import assert from "node:assert/strict";

import {
  inferEvidenceTrainingPhase,
  buildTrainingScienceGuidance,
} from "../lib/training-science";

import {
  getCanonicalTrainingPhase,
  getCanonicalTrainingPhaseFromWeeks,
  getCanonicalWeeksUntilRace,
} from "../lib/training-phase";

import {
  buildRaceDistanceProfile,
} from "../lib/race-distance";

import {
  getDisciplineAllocationRanges,
  buildDisciplineAllocationGuidance,
} from "../lib/discipline-allocation";

import {
  buildSessionLibraryGuidance,
} from "../lib/session-library";

import {
  getMultiSessionPlanningProfile,
} from "../lib/multi-session-planning";

import {
  buildCoachingSignals,
  buildReadinessTrend,
} from "../lib/adaptive-coaching";

import {
  buildRaceSpecificityProfile,
} from "../lib/race-specificity";

import {
  buildAthleteState,
} from "../lib/athlete-state";

import {
  buildAthleteCapabilityProfile,
  resolveAthleteCapabilityProfile,
  toLegacyExperience,
  toLegacyDisciplineLevel,
} from "../lib/athlete-capability";


let passed = 0;
let failed = 0;


function test(
  name: string,
  fn: () => void
) {
  try {
    fn();

    passed += 1;

    console.log(
      `✓ ${name}`
    );

  } catch (error) {

    failed += 1;

    console.error(
      `✗ ${name}`
    );

    console.error(error);
  }
}


function futureDate(
  daysFromNow: number
) {

  const date =
    new Date();

  date.setHours(
    12,
    0,
    0,
    0
  );

  date.setDate(
    date.getDate() +
    daysFromNow
  );


  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;
}


/*
  ========================================================
  PHASE / RACE PROXIMITY
  ========================================================
*/

test(
  "Race inside two weeks maps to Taper",
  () => {

    assert.equal(
      inferEvidenceTrainingPhase(
        futureDate(7)
      ),
      "Taper"
    );
  }
);


test(
  "Canonical five-week boundary is Peak",
  () => {

    assert.equal(
      getCanonicalTrainingPhaseFromWeeks(
        5
      ),
      "Peak"
    );
  }
);


test(
  "Canonical date-based phase uses the five-week Peak boundary",
  () => {

    assert.equal(
      getCanonicalTrainingPhase(
        "2026-10-24",
        new Date(
          "2026-09-19T12:00:00"
        )
      ),
      "Peak"
    );
  }
);



test(
  "Canonical weeks-until-race uses calendar days across autumn DST",
  () => {

    /*
      2026-09-21 -> 2026-10-26 is exactly
      35 calendar days = 5 weeks.

      A daylight-saving transition inside that interval
      must not turn five calendar weeks into six.
    */
    const referenceDate =
      new Date(
        "2026-09-21T12:00:00"
      );


    assert.equal(
      getCanonicalWeeksUntilRace(
        "2026-10-26",
        referenceDate
      ),
      5
    );


    assert.equal(
      getCanonicalTrainingPhase(
        "2026-10-26",
        referenceDate
      ),
      "Peak"
    );
  }
);


test(
  "Race around four weeks away maps to Peak",
  () => {

    assert.equal(
      inferEvidenceTrainingPhase(
        futureDate(28)
      ),
      "Peak"
    );
  }
);


test(
  "Race around ten weeks away maps to Build",
  () => {

    assert.equal(
      inferEvidenceTrainingPhase(
        futureDate(70)
      ),
      "Build"
    );
  }
);


test(
  "Distant race maps to Base",
  () => {

    assert.equal(
      inferEvidenceTrainingPhase(
        futureDate(140)
      ),
      "Base"
    );
  }
);


/*
  ========================================================
  RACE DISTANCE ARCHITECTURE
  ========================================================
*/

test(
  "Sprint and Ironman receive fundamentally different race profiles",
  () => {

    const sprint =
      buildRaceDistanceProfile({
        athlete: {
          goal:
            "Sprint",
          experience:
            "Intermediate",
        },
        phase:
          "Build",
        weeksUntilRace:
          8,
      });


    const ironman =
      buildRaceDistanceProfile({
        athlete: {
          goal:
            "Ironman",
          experience:
            "Intermediate",
        },
        phase:
          "Build",
        weeksUntilRace:
          8,
      });


    assert.equal(
      sprint.raceSpecificity,
      "Speed-endurance"
    );

    assert.equal(
      ironman.raceSpecificity,
      "Ultra-endurance"
    );

    assert.equal(
      sprint.longSessionPriority,
      "Low"
    );

    assert.equal(
      ironman.longSessionPriority,
      "Very high"
    );

    assert.notEqual(
      sprint.guidance,
      ironman.guidance
    );
  }
);


test(
  "70.3 has very high fueling priority",
  () => {

    const profile =
      buildRaceDistanceProfile({
        athlete: {
          goal:
            "70.3",
          experience:
            "Experienced",
        },
        phase:
          "Build",
        weeksUntilRace:
          10,
      });


    assert.equal(
      profile.fuelingPriority,
      "Very high"
    );

    assert.equal(
      profile.brickPriority,
      "Very high"
    );
  }
);


/*
  ========================================================
  DISCIPLINE ALLOCATION
  ========================================================
*/

test(
  "Ironman shifts more weekly time toward cycling than Sprint",
  () => {

    const sprint =
      getDisciplineAllocationRanges({
        goal:
          "Sprint",
        gymAccess:
          true,
      });


    const ironman =
      getDisciplineAllocationRanges({
        goal:
          "Ironman",
        gymAccess:
          true,
      });


    assert.ok(
      ironman.Bike.min >
      sprint.Bike.min
    );

    assert.ok(
      ironman.Run.max <
      sprint.Run.max
    );
  }
);


test(
  "No gym access removes gym-strength allocation",
  () => {

    const ranges =
      getDisciplineAllocationRanges({
        goal:
          "Olympic",
        gymAccess:
          false,
      });


    assert.equal(
      ranges.Strength,
      null
    );
  }
);


test(
  "Weak swimmer guidance biases frequency rather than giant swim volume",
  () => {

    const guidance =
      buildDisciplineAllocationGuidance({
        athlete: {
          goal:
            "Olympic",
          weakestDiscipline:
            "Swim",
          swimLevel:
            "Beginner",
          bikeLevel:
            "Confident",
          runLevel:
            "Confident",
          currentTrainingHours:
            7,
          gymAccess:
            true,
        },
        phase:
          "Base",
        weeklyHours:
          7,
      });


    assert.match(
      guidance,
      /Bias swim FREQUENCY upward/i
    );

    assert.match(
      guidance,
      /extra manageable technique\/aerobic exposures/i
    );
  }
);


test(
  "Weak runner guidance does not solve weakness with oversized long runs",
  () => {

    const guidance =
      buildDisciplineAllocationGuidance({
        athlete: {
          goal:
            "70.3",
          weakestDiscipline:
            "Run",
          swimLevel:
            "Confident",
          bikeLevel:
            "Confident",
          runLevel:
            "Developing",
          currentTrainingHours:
            9,
          gymAccess:
            true,
        },
        phase:
          "Build",
        weeklyHours:
          9,
      });


    assert.match(
      guidance,
      /Do NOT solve weak running by making the long run disproportionately large/i
    );
  }
);


test(
  "First-week allocation explicitly prevents catch-up training",
  () => {

    const guidance =
      buildDisciplineAllocationGuidance({
        athlete: {
          goal:
            "Sprint",
          weakestDiscipline:
            "Swim",
          swimLevel:
            "Beginner",
          bikeLevel:
            "Developing",
          runLevel:
            "Developing",
          currentTrainingHours:
            4,
          gymAccess:
            false,
        },
        phase:
          "Base",
        weeklyHours:
          4,
        firstWeek:
          true,
      });


    assert.match(
      guidance,
      /Do NOT make up Monday-to-yesterday training/i
    );

    assert.match(
      guidance,
      /PARTIAL calendar week/i
    );
  }
);


/*
  ========================================================
  ATHLETE LEVEL / SESSION DOSING
  ========================================================
*/

test(
  "Developing swimmer receives technique-first dosing",
  () => {

    const guidance =
      buildSessionLibraryGuidance({
        athlete: {
          experience:
            "Beginner",
          swimLevel:
            "Beginner",
          bikeLevel:
            "Developing",
          runLevel:
            "Developing",
        },
        phase:
          "Base",
      });


    assert.match(
      guidance,
      /Short repeats such as 25-100 m/i
    );

    assert.match(
      guidance,
      /Technique and relaxed breathing take priority over intensity/i
    );
  }
);


test(
  "Advanced swim signal receives more substantial work than beginner signal",
  () => {

    const beginner =
      buildSessionLibraryGuidance({
        athlete: {
          experience:
            "Beginner",
          swimLevel:
            "Beginner",
          bikeLevel:
            "Developing",
          runLevel:
            "Developing",
        },
        phase:
          "Build",
      });


    const advanced =
      buildSessionLibraryGuidance({
        athlete: {
          experience:
            "Elite",
          swimLevel:
            "Elite",
          bikeLevel:
            "Elite",
          runLevel:
            "Elite",
        },
        phase:
          "Build",
      });


    assert.match(
      advanced,
      /Advanced swimmer/i
    );

    assert.match(
      advanced,
      /200-400 m/i
    );

    assert.notEqual(
      beginner,
      advanced
    );
  }
);


test(
  "Developing and elite run dosing are different",
  () => {

    const developing =
      buildSessionLibraryGuidance({
        athlete: {
          experience:
            "Beginner",
          swimLevel:
            "Developing",
          bikeLevel:
            "Developing",
          runLevel:
            "Beginner",
        },
        phase:
          "Build",
      });


    const elite =
      buildSessionLibraryGuidance({
        athlete: {
          experience:
            "Elite",
          swimLevel:
            "Elite",
          bikeLevel:
            "Elite",
          runLevel:
            "Elite",
        },
        phase:
          "Build",
      });


    assert.match(
      developing,
      /12-24 min accumulated controlled quality/i
    );

    assert.match(
      elite,
      /24-40 min accumulated controlled quality/i
    );
  }
);


test(
  "Training science guidance changes with athlete level",
  () => {

    const beginner =
      buildTrainingScienceGuidance({
        athlete: {
          experience:
            "Beginner",
          swimLevel:
            "Beginner",
          bikeLevel:
            "Beginner",
          runLevel:
            "Beginner",
          currentTrainingHours:
            3,
          hoursPerWeek:
            6,
          longestSessionMinutes:
            75,
        },
        phase:
          "Base",
      });


    const advanced =
      buildTrainingScienceGuidance({
        athlete: {
          experience:
            "Elite",
          swimLevel:
            "Elite",
          bikeLevel:
            "Elite",
          runLevel:
            "Elite",
          currentTrainingHours:
            18,
          hoursPerWeek:
            22,
          longestSessionMinutes:
            300,
        },
        phase:
          "Build",
      });


    assert.notEqual(
      beginner,
      advanced
    );
  }
);


/*
  ========================================================
  MULTI-SESSION LOAD DISTRIBUTION
  ========================================================
*/

test(
  "Low-volume athlete normally needs very few additional sessions",
  () => {

    const profile =
      getMultiSessionPlanningProfile({
        experience:
          "Beginner",
        weeklyHours:
          5,
      });


    assert.equal(
      profile.normalAdditionalMin,
      0
    );

    assert.equal(
      profile.normalAdditionalMax,
      1
    );

    assert.equal(
      profile.developing,
      true
    );
  }
);


test(
  "High-volume athlete distributes load across substantially more sessions",
  () => {

    const profile =
      getMultiSessionPlanningProfile({
        experience:
          "Experienced",
        weeklyHours:
          19,
      });


    assert.equal(
      profile.normalAdditionalMin,
      4
    );

    assert.equal(
      profile.normalAdditionalMax,
      8
    );

    assert.equal(
      profile.maxSessionsPerDay,
      3
    );

    assert.equal(
      profile.developing,
      false
    );
  }
);


/*
  ========================================================
  ADAPTIVE LOAD DECISIONS
  ========================================================
*/

test(
  "Consistent manageable training allows slight progression",
  () => {

    const history =
      Array.from(
        {
          length:
            6,
        },
        () => ({
          status:
            "Completed",
          rpe:
            5,
          feeling:
            "Good",
          plannedDurationMinutes:
            60,
          actualDurationMinutes:
            60,
        })
      );


    const signals =
      buildCoachingSignals({
        workoutHistory:
          history,
        currentPlanHours:
          10,
        athleteHours:
          14,
      });


    assert.equal(
      signals.consistency,
      "High"
    );

    assert.equal(
      signals.fatigueRisk,
      "Low"
    );

    assert.equal(
      signals.loadDecision,
      "Increase slightly"
    );

    assert.equal(
      signals.recommendedHoursMin,
      10
    );

    assert.equal(
      signals.recommendedHoursMax,
      10.8
    );
  }
);



test(
  "Large extra actual load blocks automatic progression even with strong adherence",
  () => {

    /*
      Planned:
      4 x 60 min = 240 min

      Actual:
      4 x 90 min = 360 min

      Adherence is still perfect:
      each session contributes at most its planned 60 min
      to consistency.

      But actual training load is 150% of planned load.

      Strong completion + manageable RPE must therefore
      NOT automatically unlock another progression.
    */
    const signals =
      buildCoachingSignals({
        workoutHistory: [
          {
            status:
              "Completed",

            rpe:
              5,

            feeling:
              "Good",

            plannedDurationMinutes:
              60,

            actualDurationMinutes:
              90,
          },

          {
            status:
              "Completed",

            rpe:
              5,

            feeling:
              "Good",

            plannedDurationMinutes:
              60,

            actualDurationMinutes:
              90,
          },

          {
            status:
              "Completed",

            rpe:
              5,

            feeling:
              "Good",

            plannedDurationMinutes:
              60,

            actualDurationMinutes:
              90,
          },

          {
            status:
              "Completed",

            rpe:
              5,

            feeling:
              "Good",

            plannedDurationMinutes:
              60,

            actualDurationMinutes:
              90,
          },
        ],

        currentPlanHours:
          4,

        athleteHours:
          8,
      });


    assert.equal(
      signals.consistency,
      "High"
    );


    assert.equal(
      signals.completionRate,
      100
    );


    /*
      The athlete has already accumulated substantially
      more load than prescribed.

      Automatic progression would stack progression on
      top of unplanned load accumulation.
    */
    assert.equal(
      signals.loadDecision,
      "Maintain"
    );
  }
);



test(
  "Athlete-added completed sessions block automatic progression when extra load is meaningful",
  () => {

    /*
      Formal coach plan:
      4 x 60 min = 240 min

      Athlete-added completed work:
      3 x 40 min = 120 extra min

      Total actual training:
      360 min

      The formal plan was completed perfectly with
      manageable effort.

      But adding another progression on top of 120 min
      of athlete-added work would ignore real accumulated
      training load.
    */
    type CoachingHistoryItem =
      NonNullable<
        Parameters<
          typeof buildCoachingSignals
        >[0]["workoutHistory"]
      >[number];


    const workoutHistory:
      Array<
        CoachingHistoryItem & {
          sessionId?: string;
        }
      > = [
      {
        status:
          "Completed",

        rpe:
          5,

        feeling:
          "Good",

        plannedDurationMinutes:
          60,

        actualDurationMinutes:
          60,
      },

      {
        status:
          "Completed",

        rpe:
          5,

        feeling:
          "Good",

        plannedDurationMinutes:
          60,

        actualDurationMinutes:
          60,
      },

      {
        status:
          "Completed",

        rpe:
          5,

        feeling:
          "Good",

        plannedDurationMinutes:
          60,

        actualDurationMinutes:
          60,
      },

      {
        status:
          "Completed",

        rpe:
          5,

        feeling:
          "Good",

        plannedDurationMinutes:
          60,

        actualDurationMinutes:
          60,
      },

      {
        sessionId:
          "manual-extra-1",

        status:
          "Completed",

        rpe:
          4,

        feeling:
          "Good",

        plannedDurationMinutes:
          40,

        actualDurationMinutes:
          40,
      },

      {
        sessionId:
          "manual-extra-2",

        status:
          "Completed",

        rpe:
          4,

        feeling:
          "Good",

        plannedDurationMinutes:
          40,

        actualDurationMinutes:
          40,
      },

      {
        sessionId:
          "manual-extra-3",

        status:
          "Completed",

        rpe:
          4,

        feeling:
          "Good",

        plannedDurationMinutes:
          40,

        actualDurationMinutes:
          40,
      },
    ];


    const signals =
      buildCoachingSignals({
        workoutHistory,

        currentPlanHours:
          4,

        athleteHours:
          8,
      });


    assert.equal(
      signals.consistency,
      "High"
    );


    /*
      Extra training must affect load progression,
      not adherence quality.

      Strong adherence should remain High while
      deterministic progression is blocked.
    */
    assert.equal(
      signals.loadDecision,
      "Maintain"
    );
  }
);


test(
  "One overlong completed session cannot erase a skipped session and unlock progression",
  () => {

    /*
      Planned:
      - 60 min completed session
      - 60 min skipped session

      Actual:
      - completed session runs 120 min
      - skipped session contributes 0 min

      Raw actual/planned minutes are therefore 120 / 120 = 100%.

      That extra duration is real training LOAD,
      but it must not turn 50% session adherence into
      High consistency or unlock progression.
    */
    const signals =
      buildCoachingSignals({
        workoutHistory: [
          {
            status:
              "Completed",
            rpe:
              5,
            feeling:
              "Good",
            plannedDurationMinutes:
              60,
            actualDurationMinutes:
              120,
          },
          {
            status:
              "Skipped",
            plannedDurationMinutes:
              60,
            actualDurationMinutes:
              0,
          },
        ],

        currentPlanHours:
          10,

        athleteHours:
          14,
      });


    assert.equal(
      signals.consistency,
      "Low"
    );


    assert.equal(
      signals.loadDecision,
      "Maintain"
    );


    assert.equal(
      signals.completionRate,
      50
    );
  }
);


test(
  "Repeated poor readiness forces load reduction",
  () => {

    const signals =
      buildCoachingSignals({
        workoutHistory: [
          {
            status:
              "Completed",
            rpe:
              6,
            plannedDurationMinutes:
              60,
            actualDurationMinutes:
              60,
          },
          {
            status:
              "Completed",
            rpe:
              6,
            plannedDurationMinutes:
              60,
            actualDurationMinutes:
              60,
          },
        ],

        readinessHistory: [
          {
            date:
              "2026-09-14",
            status:
              "Recover",
          },
          {
            date:
              "2026-09-15",
            status:
              "Recover",
          },
        ],

        currentPlanHours:
          10,

        athleteHours:
          14,
      });


    assert.equal(
      signals.fatigueRisk,
      "High"
    );

    assert.equal(
      signals.loadDecision,
      "Reduce"
    );

    assert.equal(
      signals.recommendedHoursMin,
      7.5
    );

    assert.equal(
      signals.recommendedHoursMax,
      9
    );
  }
);


test(
  "Low consistency blocks progression",
  () => {

    const signals =
      buildCoachingSignals({
        workoutHistory: [
          {
            status:
              "Skipped",
            plannedDurationMinutes:
              60,
            actualDurationMinutes:
              0,
          },
          {
            status:
              "Skipped",
            plannedDurationMinutes:
              60,
            actualDurationMinutes:
              0,
          },
          {
            status:
              "Skipped",
            plannedDurationMinutes:
              60,
            actualDurationMinutes:
              0,
          },
          {
            status:
              "Completed",
            rpe:
              5,
            plannedDurationMinutes:
              60,
            actualDurationMinutes:
              60,
          },
        ],

        currentPlanHours:
          8,

        athleteHours:
          12,
      });


    assert.equal(
      signals.consistency,
      "Low"
    );

    assert.equal(
      signals.loadDecision,
      "Maintain"
    );

    assert.ok(
      signals.recommendedHoursMax <=
      8.4
    );
  }
);


test(
  "Athlete weekly capacity caps recommended load",
  () => {

    const signals =
      buildCoachingSignals({
        workoutHistory:
          Array.from(
            {
              length:
                5,
            },
            () => ({
              status:
                "Completed",
              rpe:
                5,
              plannedDurationMinutes:
                60,
              actualDurationMinutes:
                60,
            })
          ),

        currentPlanHours:
          10,

        athleteHours:
          10.2,
      });


    assert.ok(
      signals.recommendedHoursMax <=
      10.2
    );
  }
);


test(
  "Roadmap target anchors next full week instead of a partial current week",
  () => {

    const signals =
      buildCoachingSignals({
        workoutHistory:
          [],

        physiologicalBaselineHours:
          10,

        currentPlanHours:
          3,

        roadmapTargetHours:
          10,

        athleteHours:
          12,
      });


    assert.equal(
      signals.recommendedHoursMin,
      9.5
    );

    assert.equal(
      signals.recommendedHoursMax,
      10.5
    );
  }
);


/*
  ========================================================
  READINESS TREND
  ========================================================
*/

test(
  "Stable readiness remains Stable",
  () => {

    const trend =
      buildReadinessTrend([
        {
          date:
            "2026-09-13",
          status:
            "Ready",
        },
        {
          date:
            "2026-09-14",
          status:
            "Ready",
        },
        {
          date:
            "2026-09-15",
          status:
            "Ready",
        },
      ]);


    assert.equal(
      trend.level,
      "Stable"
    );
  }
);


test(
  "Two poor readiness days trigger Watch",
  () => {

    const trend =
      buildReadinessTrend([
        {
          date:
            "2026-09-13",
          status:
            "Ready",
        },
        {
          date:
            "2026-09-14",
          status:
            "Caution",
        },
        {
          date:
            "2026-09-15",
          status:
            "Caution",
        },
      ]);


    assert.equal(
      trend.level,
      "Watch"
    );
  }
);


test(
  "Repeated Recover readiness becomes Strained",
  () => {

    const trend =
      buildReadinessTrend([
        {
          date:
            "2026-09-13",
          status:
            "Ready",
        },
        {
          date:
            "2026-09-14",
          status:
            "Recover",
        },
        {
          date:
            "2026-09-15",
          status:
            "Recover",
        },
      ]);


    assert.equal(
      trend.level,
      "Strained"
    );
  }
);


/*
  ========================================================
  RACE-COURSE SPECIFICITY
  ========================================================
*/

test(
  "Mountainous cold-water Ironman creates course-specific priorities",
  () => {

    const race = {
      name:
        "Regression Ironman",
      date:
        futureDate(70),
      format:
        "Ironman",
      characteristics: [
        "mountainous",
        "cold-water",
        "remote",
      ],
      bike: {
        profile:
          "Mountainous",
        elevationGainM:
          2800,
        technicality:
          "High",
      },
      run: {
        profile:
          "Mountainous",
        surface:
          "Trail",
        elevationGainM:
          1300,
      },
      swim: {
        environment:
          "Lake",
        expectedWaterTempC:
          14,
      },
    } as unknown as NonNullable<
      Parameters<
        typeof buildRaceSpecificityProfile
      >[0]
    >;


    const profile =
      buildRaceSpecificityProfile(
        race
      );


    const ids =
      new Set(
        profile.priorities.map(
          (priority) =>
            priority.id
        )
      );


    assert.equal(
      profile.available,
      true
    );

    assert.ok(
      ids.has(
        "bike-climbing-durability"
      )
    );

    assert.ok(
      ids.has(
        "bike-technical"
      )
    );

    assert.ok(
      ids.has(
        "run-terrain-durability"
      )
    );

    assert.ok(
      ids.has(
        "open-water"
      )
    );

    assert.ok(
      ids.has(
        "cold-water"
      )
    );

    assert.ok(
      ids.has(
        "race-fueling"
      )
    );

    assert.ok(
      ids.has(
        "bike-run-durability"
      )
    );
  }
);


/*
  ========================================================
  LEARNED ATHLETE STATE
  ========================================================
*/

test(
  "Athlete state identifies repeated discipline-specific execution problems",
  () => {

    const workoutHistory = [
      {
        status:
          "Skipped",
        sport:
          "Run",
        plannedDurationMinutes:
          45,
        actualDurationMinutes:
          0,
      },
      {
        status:
          "Skipped",
        sport:
          "Run",
        plannedDurationMinutes:
          45,
        actualDurationMinutes:
          0,
      },
      {
        status:
          "Skipped",
        sport:
          "Run",
        plannedDurationMinutes:
          45,
        actualDurationMinutes:
          0,
      },

      {
        status:
          "Completed",
        sport:
          "Bike",
        plannedDurationMinutes:
          60,
        actualDurationMinutes:
          60,
        rpe:
          5,
      },
      {
        status:
          "Completed",
        sport:
          "Bike",
        plannedDurationMinutes:
          60,
        actualDurationMinutes:
          60,
        rpe:
          5,
      },
      {
        status:
          "Completed",
        sport:
          "Bike",
        plannedDurationMinutes:
          60,
        actualDurationMinutes:
          60,
        rpe:
          5,
      },
    ] as unknown as NonNullable<
      Parameters<
        typeof buildAthleteState
      >[0]["workoutHistory"]
    >;


    const state =
      buildAthleteState({
        workoutHistory,
      });


    assert.equal(
      state.dataQuality,
      "Moderate"
    );

    assert.equal(
      state.consistency
        .byDiscipline
        .Run,
      0
    );

    assert.equal(
      state.consistency
        .byDiscipline
        .Bike,
      100
    );

    assert.ok(
      state.coachingNotes.some(
        (note) =>
          note.includes(
            "Run is currently the least consistent observed discipline"
          )
      )
    );
  }
);



/*
  ========================================================
  ATHLETE CAPABILITY MODEL
  ========================================================
*/

test(
  "Legacy athlete resolves into Capability Profile V1",
  () => {

    const result =
      resolveAthleteCapabilityProfile(
        undefined,
        {
          experience:
            "Experienced",
          swimLevel:
            "Beginner",
          bikeLevel:
            "Confident",
          runLevel:
            "Developing",
        }
      );


    assert.equal(
      result.experience,
      "Experienced"
    );

    assert.equal(
      result.swimLevel,
      "Beginner"
    );

    assert.equal(
      result.performanceTier,
      "Recreational"
    );
  }
);


test(
  "Capability profile preserves advanced and professional values",
  () => {

    const result =
      resolveAthleteCapabilityProfile(
        {
          version:
            1,
          experience:
            "Advanced",
          swimLevel:
            "Advanced",
          bikeLevel:
            "Elite",
          runLevel:
            "Confident",
          performanceTier:
            "Professional",
        }
      );


    assert.equal(
      result.experience,
      "Advanced"
    );

    assert.equal(
      result.bikeLevel,
      "Elite"
    );

    assert.equal(
      result.performanceTier,
      "Professional"
    );
  }
);


test(
  "Legacy cloud fields never receive unsupported advanced values",
  () => {

    assert.equal(
      toLegacyExperience(
        "Advanced"
      ),
      "Experienced"
    );

    assert.equal(
      toLegacyDisciplineLevel(
        "Advanced"
      ),
      "Confident"
    );

    assert.equal(
      toLegacyDisciplineLevel(
        "Elite"
      ),
      "Confident"
    );
  }
);


test(
  "Capability payload retains exact high-performance profile",
  () => {

    const payload =
      buildAthleteCapabilityProfile({
        experience:
          "Advanced",
        swimLevel:
          "Developing",
        bikeLevel:
          "Elite",
        runLevel:
          "Advanced",
        performanceTier:
          "Professional",
      });


    assert.equal(
      payload.experience,
      "Advanced"
    );

    assert.equal(
      payload.bikeLevel,
      "Elite"
    );

    assert.equal(
      payload.performanceTier,
      "Professional"
    );
  }
);


test(
  "Professional tier does not override novice swim development",
  () => {

    const guidance =
      buildTrainingScienceGuidance({
        athlete: {
          experience:
            "Beginner",

          performanceTier:
            "Professional",

          swimLevel:
            "Beginner",

          bikeLevel:
            "Elite",

          runLevel:
            "Advanced",

          currentTrainingHours:
            12,

          hoursPerWeek:
            18,

          longestSessionMinutes:
            240,
        },

        phase:
          "Base",
      });


    assert.match(
      guidance,
      /Professional athlete/i
    );

    assert.match(
      guidance,
      /Developing swimmer/i
    );

    assert.match(
      guidance,
      /Performance tier does not override discipline-specific level/i
    );
  }
);


/*
  ========================================================
  RESULT
  ========================================================
*/

console.log("");

console.log(
  `Scenario matrix result: ${passed} passed, ${failed} failed`
);


if (failed > 0) {

  process.exitCode = 1;

} else {

  console.log(
    "✓ BASSE ATHLETE SCENARIO MATRIX LAYER 2A GREEN"
  );
}
