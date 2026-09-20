import type {
  TargetRace,
} from "@/types/training";


export type StandardRaceFormat =
  | "Sprint"
  | "Olympic"
  | "70.3"
  | "Ironman";


export type RaceFormatDefaults = {
  swimKm: number;
  bikeKm: number;
  runKm: number;
};


export const RACE_FORMAT_DEFAULTS:
  Record<
    StandardRaceFormat,
    RaceFormatDefaults
  > = {

  Sprint: {
    swimKm: 0.75,
    bikeKm: 20,
    runKm: 5,
  },

  Olympic: {
    swimKm: 1.5,
    bikeKm: 40,
    runKm: 10,
  },

  "70.3": {
    swimKm: 1.9,
    bikeKm: 90,
    runKm: 21.1,
  },

  Ironman: {
    swimKm: 3.8,
    bikeKm: 180,
    runKm: 42.2,
  },
};


export function getRaceFormatDefaults(
  format:
    TargetRace["format"]
):
  RaceFormatDefaults |
  null {

  if (
    format === "Other"
  ) {
    return null;
  }

  return (
    RACE_FORMAT_DEFAULTS[
      format
    ] ?? null
  );
}
