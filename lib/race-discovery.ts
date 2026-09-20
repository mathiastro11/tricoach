import {
  RACE_CATALOG,
  type RaceCatalogEntry,
  type RaceSeries,
  type RaceDataQuality,
} from "@/lib/race-catalog";


export type RaceDiscoveryFilter = {
  query?: string;

  format?:
    | "Sprint"
    | "Olympic"
    | "70.3"
    | "Ironman";

  series?:
    RaceSeries;

  countryCode?: string;

  dataQuality?:
    RaceDataQuality;
};


export type RaceDiscoveryResult = {
  races:
    RaceCatalogEntry[];

  total:
    number;

  filters: {
    series:
      RaceSeries[];

    countries: {
      code: string;
      name: string;
    }[];

    formats: string[];
  };
};


function normalize(
  value:
    string | undefined
) {
  return (
    value
      ?.trim()
      .toLowerCase() ??
    ""
  );
}


function matchesQuery(
  race: RaceCatalogEntry,
  query: string
) {
  if (!query) {
    return true;
  }

  const haystack = [
    race.name,
    race.shortName,
    race.location,
    race.country,
    race.countryCode,
    race.format,
    race.series,
    ...race.characteristics,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(
    query
  );
}


export function discoverRaces(
  filter:
    RaceDiscoveryFilter = {}
): RaceDiscoveryResult {

  const query =
    normalize(
      filter.query
    );


  const races =
    RACE_CATALOG
      .filter(
        (race) =>
          matchesQuery(
            race,
            query
          )
      )
      .filter(
        (race) =>
          !filter.format ||
          race.format ===
            filter.format
      )
      .filter(
        (race) =>
          !filter.series ||
          race.series ===
            filter.series
      )
      .filter(
        (race) =>
          !filter.countryCode ||
          race.countryCode ===
            filter.countryCode
      )
      .filter(
        (race) =>
          !filter.dataQuality ||
          race.dataQuality ===
            filter.dataQuality
      )
      .sort(
        (a, b) => {

          /*
            Verified races first.
          */

          if (
            a.dataQuality !==
            b.dataQuality
          ) {
            return (
              a.dataQuality ===
              "Verified"
                ? -1
                : 1
            );
          }


          /*
            Races with a known future
            edition come next.
          */

          const aDate =
            a.editions[0]
              ?.date ?? null;

          const bDate =
            b.editions[0]
              ?.date ?? null;


          if (
            aDate &&
            !bDate
          ) {
            return -1;
          }

          if (
            !aDate &&
            bDate
          ) {
            return 1;
          }


          /*
            Stable alphabetical fallback.
          */

          return a.shortName
            .localeCompare(
              b.shortName
            );
        }
      );


  const series =
    Array.from(
      new Set(
        RACE_CATALOG.map(
          (race) =>
            race.series
        )
      )
    ).sort();


  const countries =
    Array.from(
      new Map(
        RACE_CATALOG.map(
          (race) => [
            race.countryCode,
            {
              code:
                race.countryCode,

              name:
                race.country,
            },
          ]
        )
      ).values()
    ).sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );


  const formats =
    Array.from(
      new Set(
        RACE_CATALOG.map(
          (race) =>
            race.format
        )
      )
    ).sort();


  return {
    races,

    total:
      races.length,

    filters: {
      series,
      countries,
      formats,
    },
  };
}
