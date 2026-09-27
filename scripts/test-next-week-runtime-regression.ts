import {
  readFileSync,
} from "node:fs";

import {
  repairNextWeekVolumeShortfall,
} from "../lib/next-week-volume-repair";

import type {
  TrainingPlan,
} from "../types/training";


let passed = 0;


function check(
  valid: boolean,
  name: string
) {

  if (!valid) {
    throw new Error(
      `Failed: ${name}`
    );
  }

  passed += 1;


  console.log(
    `✓ ${name}`
  );
}


function endurance(
  day: string,
  sport: "Bike" | "Swim"
) {

  return {
    day,
    sport,
    title:
      `${sport} endurance`,

    durationMinutes:
      100,

    intensity:
      "Easy",

    purpose:
      "Aerobic endurance",

    details: [
      "Relaxed aerobic work.",
    ],

    workoutStructure: [
      {
        kind:
          "segment",

        phase:
          "Main",

        label:
          "Aerobic endurance",

        repeatCount:
          1,

        workDurationSeconds:
          6_000,

        workDistanceMeters:
          null,

        workIntensity:
          "Easy, RPE 2-3",

        workInstruction:
          "Stay relaxed.",

        recoveryDurationSeconds:
          null,

        recoveryDistanceMeters:
          null,

        recoveryIntensity:
          null,

        recoveryInstruction:
          null,
      },
    ],

    strengthStructure:
      null,
  };
}


const plan = {
  summary:
    "Repair regression",

  totalHours:
    500 / 60,

  focus:
    "Aerobic durability",

  days: [
    endurance("Monday", "Bike"),
    endurance("Tuesday", "Swim"),
    endurance("Wednesday", "Bike"),
    endurance("Thursday", "Swim"),
    endurance("Friday", "Bike"),
  ],

  additionalSessions:
    [],
} as unknown as TrainingPlan;


const repaired =
  repairNextWeekVolumeShortfall({
    plan,
    missingMinutes:
      150,
    longestSessionMinutes:
      160,
  });

const totalMinutes =
  repaired.plan.days.reduce(
    (
      total,
      session
    ) =>
      total +
      session.durationMinutes,
    0
  );


check(
  repaired.fullyApplied,
  "150-minute shortfall is fully distributed"
);

check(
  repaired.appliedRepairs.length ===
    5,
  "Repair uses five safe sessions"
);

check(
  repaired.appliedRepairs.every(
    (item) =>
      item.minutes === 30
  ),
  "Per-session repair remains capped at 30 minutes"
);

check(
  totalMinutes === 650,
  "Repaired total minutes are exact"
);


const addedVolumeBlocks =
  repaired.plan.days.flatMap(
    (session) =>
      (
        session.workoutStructure ??
        []
      )
        .filter(
          (block) =>
            block.label ===
            "Easy aerobic extension"
        )
        .map(
          (block) => ({
            blockSport:
              block.sport,

            sessionSport:
              session.sport,
          })
        )
  );


check(
  addedVolumeBlocks.length === 5 &&
  addedVolumeBlocks.every(
    ({
      blockSport,
      sessionSport,
    }) =>
      blockSport === sessionSport
  ),
  "Added volume blocks retain their canonical discipline"
);


const page =
  readFileSync(
    "app/page.tsx",
    "utf8"
  );

const route =
  readFileSync(
    "app/api/next-week/route.ts",
    "utf8"
  );


check(
  page.includes(
    "previewRequestContextSignature"
  ) &&
  page.includes(
    "previewLatestContextSignature"
  ) &&
  page.includes(
    "confirmedRequestContextSignature"
  ) &&
  page.includes(
    "confirmedLatestContextSignature"
  ) &&
  page.includes(
    "previewLatestContextSignature !=="
  ) &&
  page.includes(
    "confirmedLatestContextSignature !=="
  ),
  "Equivalent restored state uses semantic request context"
);


check(
  page.includes(
    "const rolloverPending ="
  ),
  "Stale active weeks cannot launch previews"
);

check(
  page.includes(
    "nextWeekConfirmedRunningRef.current"
  ),
  "Confirmed rollover is single-flight"
);

check(
  page.includes(
    "weekRolloverAttemptedStartRef.current"
  ),
  "Automatic rollover attempts once per mount"
);

check(
  page.includes(
    "isTransientNextWeekPreviewFailure"
  ) &&
  page.includes(
    "responseStatus === 429"
  ) &&
  page.includes(
    "responseStatus >= 500"
  ),
  "Only transient preview failures retry"
);

check(
  route.includes(
    '"exerciseKey": "back-squat"'
  ) &&
  route.includes(
    "Every repaired strength exercise MUST include exerciseKey"
  ),
  "Repair contract requires canonical exercise keys"
);

check(
  route.includes(
    "finishingVolumeRepair"
  ),
  "Residual volume uses deterministic repair"
);


check(
  /\{\(isPlanLoading\s*\|\|\s*isNextWeekLoading\s*\|\|\s*isNextWeekPreviewLoading\)\s*&&\s*\(/.test(
    page
  ) &&
  page.includes(
    "Reviewing last week and preparing this week…"
  ) &&
  page.includes(
    "Completed training is being reviewed before the new active week is published."
  ),
  "Confirmed rollover displays the Coach Working status"
);


console.log(
  `Next Week runtime regression result: ${passed} passed, 0 failed`
);

console.log(
  "✓ BASSE NEXT WEEK RUNTIME REGRESSION GREEN"
);
