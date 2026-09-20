import assert from "node:assert/strict";

import {
  repairNextWeekVolumeShortfall,
} from "../lib/next-week-volume-repair";

import type {
  TrainingPlan,
  TrainingPlanDay,
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
      "Easy",
    purpose:
      "Regression test",
    details: [],
    workoutStructure: [],
    strengthStructure:
      null,
  };
}


const originalPlan:
  TrainingPlan = {
    summary:
      "Regression test",
    totalHours:
      10,

    focus:
      "Base",

    days: [
      session(
        "Monday",
        "Bike",
        60
      ),
      session(
        "Tuesday",
        "Run",
        60
      ),
      session(
        "Wednesday",
        "Swim",
        70
      ),
      session(
        "Thursday",
        "Strength",
        60
      ),
      session(
        "Friday",
        "Bike",
        80
      ),
      session(
        "Saturday",
        "Run",
        120
      ),
      session(
        "Sunday",
        "Rest",
        0
      ),
    ],
  };


const repaired =
  repairNextWeekVolumeShortfall({
    plan:
      originalPlan,

    missingMinutes:
      48,

    longestSessionMinutes:
      180,
  });


assert.equal(
  repaired.fullyApplied,
  true,
  "48-minute shortfall should be fully repairable."
);


assert.deepEqual(
  repaired.appliedRepairs.map(
    (repair) =>
      repair.minutes
  ),
  [
    20,
    20,
    8,
  ],
  "48 minutes must be distributed as 20 + 20 + 8."
);


assert.equal(
  repaired.appliedRepairs.some(
    (repair) =>
      repair.sport ===
      "Run"
  ),
  false,
  "Local volume repair must never extend Run sessions."
);


assert.equal(
  repaired.appliedRepairs.every(
    (repair) =>
      repair.sport ===
        "Bike" ||
      repair.sport ===
        "Swim"
  ),
  true,
  "Only Bike and Swim sessions may receive extensions."
);


assert.equal(
  originalPlan.days[0]
    .durationMinutes,
  60,
  "Repair must not mutate the original plan."
);


const totalAdded =
  repaired.appliedRepairs.reduce(
    (
      total,
      repair
    ) =>
      total +
      repair.minutes,
    0
  );


assert.equal(
  totalAdded,
  48,
  "Exactly the missing weekly volume must be added."
);


for (
  const repair
  of repaired.appliedRepairs
) {
  assert.ok(
    repair.minutes <= 20,
    "No individual session may receive more than 20 minutes."
  );
}


const repairedSessions = [
  ...repaired.plan.days,
  ...(
    repaired.plan
      .additionalSessions ??
    []
  ),
];


for (
  const repair
  of repaired.appliedRepairs
) {

  const workout =
    repairedSessions.find(
      (candidate) =>
        candidate.day ===
          repair.day &&
        candidate.sport ===
          repair.sport
    );


  assert.ok(
    workout,
    "Every repair must correspond to a real workout."
  );


  const finalBlock =
    workout.workoutStructure?.[
      workout.workoutStructure
        .length - 1
    ];


  assert.equal(
    finalBlock?.phase,
    "Main",
    "Added aerobic time must remain a Main block."
  );


  assert.equal(
    finalBlock
      ?.workDurationSeconds,
    repair.minutes *
      60,
    "Canonical workout structure must match the added duration."
  );
}


const insufficientHeadroomPlan:
  TrainingPlan = {
    summary:
      "Limited headroom",

    totalHours:
      4,

    focus:
      "Base",

    days: [
      session(
        "Monday",
        "Bike",
        175
      ),
      session(
        "Tuesday",
        "Run",
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


const insufficient =
  repairNextWeekVolumeShortfall({
    plan:
      insufficientHeadroomPlan,

    missingMinutes:
      30,

    longestSessionMinutes:
      180,
  });


assert.equal(
  insufficient.fullyApplied,
  false,
  "Insufficient safe headroom must not be reported as a successful repair."
);


assert.deepEqual(
  insufficient.appliedRepairs.map(
    (repair) =>
      repair.minutes
  ),
  [
    5,
  ],
  "Repair must respect maximum session duration headroom."
);


console.log(
  "✓ Next Week deterministic volume repair regression tests passed"
);
