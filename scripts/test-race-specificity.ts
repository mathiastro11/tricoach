import {
  buildRaceSpecificityProfile,
  buildRaceSpecificityGuidance,
} from "../lib/race-specificity";

import type {
  TargetRace,
} from "../types/training";


const norseman: TargetRace = {
  id: "test-norseman",
  name: "Norseman",
  date: "2027-08-07",
  location: "Eidfjord → Gausta, Norway",
  source: "database",
  format: "Ironman",

  swim: {
    distanceKm: 3.8,
    environment: "Fjord",
    wetsuitLikely: true,
  },

  bike: {
    distanceKm: 180,
    elevationGainM: 3000,
    profile: "Mountainous",
    technicality: "High",
  },

  run: {
    distanceKm: 42.2,
    elevationGainM: 1800,
    profile: "Mountainous",
    surface: "Mixed",
  },

  characteristics: [
    "Mountainous",
    "Cold water",
    "Extreme terrain",
  ],
};


const flat703: TargetRace = {
  id: "test-flat-703",
  name: "Test Flat 70.3",
  date: "2027-06-20",
  location: "Test City",
  source: "manual",
  format: "70.3",

  swim: {
    distanceKm: 1.9,
    environment: "Sea",
  },

  bike: {
    distanceKm: 90,
    elevationGainM: 200,
    profile: "Flat",
    technicality: "Low",
  },

  run: {
    distanceKm: 21.1,
    elevationGainM: 50,
    profile: "Flat",
    surface: "Road",
  },
};


function printRace(
  race: TargetRace
) {
  const profile =
    buildRaceSpecificityProfile(
      race
    );

  console.log("");
  console.log(
    "========================================"
  );
  console.log(race.name);
  console.log(
    "========================================"
  );

  console.log("");
  console.log("PRIORITIES:");

  for (
    const priority
    of profile.priorities
  ) {
    console.log(
      `${priority.priority.padEnd(6)} | ${priority.discipline.padEnd(7)} | ${priority.title}`
    );
  }

  console.log("");
  console.log("AI GUIDANCE:");
  console.log("");

  console.log(
    buildRaceSpecificityGuidance(
      race
    )
  );
}


printRace(norseman);
printRace(flat703);
