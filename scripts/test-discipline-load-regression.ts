import assert from "node:assert/strict";

import {
  buildDisciplineLoadState,
} from "../lib/discipline-load";

import type {
  TrainingArchiveWeek,
  TrainingPlan,
  TrainingPlanDay,
  WorkoutFeedback,
} from "../types/training";


function session(
  day: string,
  sport: string,
  durationMinutes: number
): TrainingPlanDay {

  return {
    day,
    sport,
    title:
      `${sport} session`,
    durationMinutes,
    intensity:
      sport === "Rest"
        ? "Rest"
        : "Easy",
    purpose:
      sport === "Rest"
        ? "Recovery"
        : "Regression test",
    details: [],
    workoutStructure: [],
    strengthStructure:
      null,
  };
}


function plan(): TrainingPlan {

  return {
    summary:
      "Discipline-load regression",
    totalHours:
      3,
    focus:
      "Base",

    days: [
      session(
        "Monday",
        "Swim",
        120
      ),
      session(
        "Tuesday",
        "Bike",
        60
      ),
      session(
        "Wednesday",
        "Rest",
        0
      ),
      session(
        "Thursday",
        "Rest",
        0
      ),
      session(
        "Friday",
        "Rest",
        0
      ),
      session(
        "Saturday",
        "Rest",
        0
      ),
      session(
        "Sunday",
        "Rest",
        0
      ),
    ],
  };
}


function bikeFeedback(
  id: string
): WorkoutFeedback {

  return {
    id,
    day:
      "Tuesday",
    sport:
      "Bike",
    title:
      "Bike session",
    plannedDurationMinutes:
      60,
    status:
      "Completed",
    actualDurationMinutes:
      60,
    distance:
      null,
    distanceUnit:
      null,
    rpe:
      5,
    feeling:
      "Normal",
    comment:
      "",
    completedAt:
      "2026-09-01T12:00:00.000Z",
  };
}


function archiveWeek(
  id: string,
  archivedAt: string
): TrainingArchiveWeek {

  return {
    plan:
      plan(),

    /*
      Important:
      Bike has feedback, but Swim has NO feedback record.

      That means Swim execution is unknown.
      It must not silently become 0 minutes.
    */
    feedback: [
      bikeFeedback(id),
    ],

    review:
      null,

    archivedAt,
  };
}


const proposedPlan =
  plan();


const state =
  buildDisciplineLoadState({
    proposedPlan,

    trainingArchive: [
      archiveWeek(
        "bike-week-1",
        "2026-09-07T12:00:00.000Z"
      ),
      archiveWeek(
        "bike-week-2",
        "2026-09-14T12:00:00.000Z"
      ),
    ],
  });


const swim =
  state.disciplines.Swim;


assert.deepEqual(
  swim.recentMinutes,
  [
    120,
    120,
  ],
  "Missing Swim feedback in a partially logged week must fall back to planned Swim minutes rather than becoming 0."
);


assert.equal(
  swim.recentMedianMinutes,
  120,
  "Swim median should reflect the archived planned exposure when Swim execution is unknown."
);


assert.equal(
  swim.status,
  "Normal",
  "A proposed 120-minute Swim week should not be classified as an increase when the previous two weeks also planned 120 minutes."
);


console.log(
  "✓ Partial discipline feedback preserves unknown discipline load context"
);


/*
  Explicit discipline feedback is different from missing feedback.

  If Swim itself was marked Skipped,
  the actual Swim exposure really is 0 minutes.
*/
function skippedSwimFeedback(
  id: string
): WorkoutFeedback {

  return {
    id,
    day:
      "Monday",
    sport:
      "Swim",
    title:
      "Swim session",
    plannedDurationMinutes:
      120,
    status:
      "Skipped",
    actualDurationMinutes:
      0,
    distance:
      null,
    distanceUnit:
      null,
    rpe:
      null,
    feeling:
      null,
    comment:
      "",
    completedAt:
      "2026-09-01T12:00:00.000Z",
  };
}


const explicitlySkippedState =
  buildDisciplineLoadState({
    proposedPlan,

    trainingArchive: [
      {
        ...archiveWeek(
          "bike-skip-week-1",
          "2026-09-07T12:00:00.000Z"
        ),

        feedback: [
          bikeFeedback(
            "bike-skip-week-1"
          ),
          skippedSwimFeedback(
            "swim-skip-week-1"
          ),
        ],
      },

      {
        ...archiveWeek(
          "bike-skip-week-2",
          "2026-09-14T12:00:00.000Z"
        ),

        feedback: [
          bikeFeedback(
            "bike-skip-week-2"
          ),
          skippedSwimFeedback(
            "swim-skip-week-2"
          ),
        ],
      },
    ],
  });


assert.deepEqual(
  explicitlySkippedState
    .disciplines
    .Swim
    .recentMinutes,
  [
    0,
    0,
  ],
  "Explicitly skipped Swim sessions must remain 0 actual minutes rather than falling back to planned volume."
);


console.log(
  "✓ Explicit discipline skips remain real zero-minute execution"
);


/*
  ========================================================
  CANONICAL BIKE -> RUN BRICK DISCIPLINE LOAD
  ========================================================

  One connected brick remains one workout overall.

  Planned discipline exposure comes from block-level
  workoutStructure.sport.

  Actual discipline exposure comes from disciplineSplits.

  Top-level sport="Bike" must NOT hide the Run load.
*/
function brickPlan(): TrainingPlan {

  const brick =
    session(
      "Saturday",
      "Bike",
      75
    );

  brick.title =
    "Bike to Run Brick";

  brick.purpose =
    "Practice bike-to-run transition";

  brick.details = [
    "Ride steady, transition quickly, then run easy.",
  ];

  brick.workoutStructure = [
    {
      sport:
        "Bike",
      kind:
        "segment",
      phase:
        "Main",
      label:
        "Bike endurance",
      repeatCount:
        1,
      workDurationSeconds:
        3600,
      workDistanceMeters:
        null,
      workIntensity:
        "Easy aerobic",
      workInstruction:
        "Ride smoothly.",
      recoveryDurationSeconds:
        null,
      recoveryDistanceMeters:
        null,
      recoveryIntensity:
        null,
      recoveryInstruction:
        null,
    },
    {
      sport:
        "Run",
      kind:
        "segment",
      phase:
        "Main",
      label:
        "Transition run",
      repeatCount:
        1,
      workDurationSeconds:
        900,
      workDistanceMeters:
        null,
      workIntensity:
        "Easy",
      workInstruction:
        "Run relaxed off the bike.",
      recoveryDurationSeconds:
        null,
      recoveryDistanceMeters:
        null,
      recoveryIntensity:
        null,
      recoveryInstruction:
        null,
    },
  ];


  return {
    summary:
      "Brick load regression",
    totalHours:
      1.25,
    focus:
      "Build",

    days: [
      session(
        "Monday",
        "Rest",
        0
      ),
      session(
        "Tuesday",
        "Rest",
        0
      ),
      session(
        "Wednesday",
        "Rest",
        0
      ),
      session(
        "Thursday",
        "Rest",
        0
      ),
      session(
        "Friday",
        "Rest",
        0
      ),
      brick,
      session(
        "Sunday",
        "Rest",
        0
      ),
    ],
  };
}


function completedBrickFeedback(
  id: string
): WorkoutFeedback {

  return {
    id,
    day:
      "Saturday",

    /*
      Brick is stored as ONE Bike-led workout.
    */
    sport:
      "Bike",

    title:
      "Bike to Run Brick",

    plannedDurationMinutes:
      75,

    status:
      "Completed",

    actualDurationMinutes:
      70,

    distance:
      null,

    distanceUnit:
      null,

    disciplineSplits: [
      {
        sport:
          "Bike",
        plannedDurationMinutes:
          60,
        actualDurationMinutes:
          58,
        distance:
          null,
        distanceUnit:
          "km",
      },
      {
        sport:
          "Run",
        plannedDurationMinutes:
          15,
        actualDurationMinutes:
          12,
        distance:
          null,
        distanceUnit:
          "km",
      },
    ],

    rpe:
      5,

    feeling:
      "Normal",

    comment:
      "",

    completedAt:
      "2026-09-01T12:00:00.000Z",
  };
}


function brickArchiveWeek(
  id: string,
  archivedAt: string
): TrainingArchiveWeek {

  return {
    plan:
      brickPlan(),

    feedback: [
      completedBrickFeedback(
        id
      ),
    ],

    review:
      null,

    archivedAt,
  };
}


const brickLoadState =
  buildDisciplineLoadState({
    proposedPlan:
      brickPlan(),

    trainingArchive: [
      brickArchiveWeek(
        "brick-week-1",
        "2026-09-07T12:00:00.000Z"
      ),
      brickArchiveWeek(
        "brick-week-2",
        "2026-09-14T12:00:00.000Z"
      ),
    ],
  });


assert.equal(
  brickLoadState
    .disciplines
    .Run
    .proposedMinutes,
  15,
  "The Run block inside a canonical Bike-to-Run brick must count toward proposed Run load."
);


assert.deepEqual(
  brickLoadState
    .disciplines
    .Run
    .recentMinutes,
  [
    12,
    12,
  ],
  "Run disciplineSplits inside completed Bike-to-Run bricks must count toward actual Run history."
);


assert.equal(
  brickLoadState
    .disciplines
    .Run
    .recentMedianMinutes,
  12,
  "Run median must use actual brick Run execution rather than the Bike top-level duration or planned fallback."
);


assert.equal(
  brickLoadState
    .disciplines
    .Bike
    .proposedMinutes,
  60,
  "The Bike block inside the brick must count toward proposed Bike load without absorbing the Run block."
);


assert.deepEqual(
  brickLoadState
    .disciplines
    .Bike
    .recentMinutes,
  [
    58,
    58,
  ],
  "Bike history must use the Bike discipline split rather than the full top-level brick duration."
);


console.log(
  "✓ Canonical Bike-to-Run bricks preserve planned and actual discipline-specific load"
);


/*
  ========================================================
  SAME-DISCIPLINE PARTIAL FEEDBACK
  ========================================================

  Two Swim sessions exist in the archived plan.

  Swim A:
  - planned 60 min
  - completed 45 min
  - exact sessionId feedback exists

  Swim B:
  - planned 60 min
  - NO feedback exists

  Correct historical Swim exposure:
  45 actual + 60 unknown/planned fallback = 105 min.

  A discipline-level "there is some Swim feedback" switch
  is not sufficient because it would silently discard the
  unmatched second Swim session.
*/
function sameDisciplinePartialPlan(): TrainingPlan {

  const monday =
    session(
      "Monday",
      "Swim",
      60
    );

  monday.sessionId =
    "swim-a";

  monday.title =
    "Swim A";


  const thursday =
    session(
      "Thursday",
      "Swim",
      60
    );

  thursday.sessionId =
    "swim-b";

  thursday.title =
    "Swim B";


  return {
    summary:
      "Same-discipline partial feedback regression",

    totalHours:
      2,

    focus:
      "Base",

    days: [
      monday,

      session(
        "Tuesday",
        "Rest",
        0
      ),

      session(
        "Wednesday",
        "Rest",
        0
      ),

      thursday,

      session(
        "Friday",
        "Rest",
        0
      ),

      session(
        "Saturday",
        "Rest",
        0
      ),

      session(
        "Sunday",
        "Rest",
        0
      ),
    ],

    additionalSessions:
      [],
  };
}


function completedSwimAFeedback(
  id: string
): WorkoutFeedback {

  return {
    id,

    sessionId:
      "swim-a",

    day:
      "Monday",

    sport:
      "Swim",

    title:
      "Swim A",

    plannedDurationMinutes:
      60,

    status:
      "Completed",

    actualDurationMinutes:
      45,

    distance:
      null,

    distanceUnit:
      null,

    rpe:
      4,

    feeling:
      "Normal",

    comment:
      "",

    completedAt:
      "2026-09-01T12:00:00.000Z",
  };
}


const sameDisciplinePartialState =
  buildDisciplineLoadState({
    proposedPlan:
      sameDisciplinePartialPlan(),

    trainingArchive: [
      {
        plan:
          sameDisciplinePartialPlan(),

        feedback: [
          completedSwimAFeedback(
            "same-discipline-week-1"
          ),
        ],

        review:
          null,

        archivedAt:
          "2026-09-07T12:00:00.000Z",
      },

      {
        plan:
          sameDisciplinePartialPlan(),

        feedback: [
          completedSwimAFeedback(
            "same-discipline-week-2"
          ),
        ],

        review:
          null,

        archivedAt:
          "2026-09-14T12:00:00.000Z",
      },
    ],
  });


assert.deepEqual(
  sameDisciplinePartialState
    .disciplines
    .Swim
    .recentMinutes,
  [
    105,
    105,
  ],
  "Same-discipline partial feedback preserves unmatched planned session load"
);


assert.equal(
  sameDisciplinePartialState
    .disciplines
    .Swim
    .recentMedianMinutes,
  105,
  "Historical Swim median must combine matched actual execution with unmatched planned exposure."
);


console.log(
  "✓ Same-discipline partial feedback preserves unmatched planned session load"
);
