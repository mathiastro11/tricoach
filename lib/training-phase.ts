export type CanonicalTrainingPhase =
  | "Base"
  | "Build"
  | "Peak"
  | "Taper";


const WEEK_MS =
  7 *
  24 *
  60 *
  60 *
  1000;


export function getCanonicalTrainingPhaseFromWeeks(
  weeksUntilRace:
    number | null
): CanonicalTrainingPhase {

  if (weeksUntilRace === null) {
    return "Base";
  }


  if (weeksUntilRace <= 2) {
    return "Taper";
  }


  if (weeksUntilRace <= 5) {
    return "Peak";
  }


  if (weeksUntilRace <= 12) {
    return "Build";
  }


  return "Base";
}


export function getCanonicalWeeksUntilRace(
  raceDate?:
    string | null,

  now =
    new Date()
): number | null {

  if (!raceDate) {
    return null;
  }


  const race =
    new Date(
      `${raceDate}T12:00:00`
    );


  if (
    Number.isNaN(
      race.getTime()
    )
  ) {
    return null;
  }


  /*
    Training phase is a CALENDAR concept.

    Using elapsed local milliseconds is incorrect across
    daylight-saving transitions because a span of exactly
    N calendar days can contain 23- or 25-hour days.

    Normalize both dates to UTC calendar midnights so
    week distance depends only on YYYY-MM-DD.
  */
  const raceCalendarUtc =
    Date.UTC(
      race.getFullYear(),
      race.getMonth(),
      race.getDate()
    );


  const nowCalendarUtc =
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );


  return Math.max(
    0,
    Math.ceil(
      (
        raceCalendarUtc -
        nowCalendarUtc
      ) /
      WEEK_MS
    )
  );
}


export function getCanonicalTrainingPhase(
  raceDate?:
    string | null,

  now =
    new Date()
): CanonicalTrainingPhase {

  return getCanonicalTrainingPhaseFromWeeks(
    getCanonicalWeeksUntilRace(
      raceDate,
      now
    )
  );
}
