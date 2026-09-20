import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createServerClient,
} from "@/lib/supabase-server";

import {
  discoverRaces,
  type RaceDiscoveryFilter,
} from "@/lib/race-discovery";

import type {
  RaceCatalogEntry,
  RaceSeries,
  RaceDataQuality,
} from "@/lib/race-catalog";


const VALID_FORMATS = [
  "Sprint",
  "Olympic",
  "70.3",
  "Ironman",
] as const;


const VALID_SERIES:
  RaceSeries[] = [
    "XTRI",
    "IRONMAN",
    "Challenge",
    "Independent",
  ];


const VALID_QUALITY:
  RaceDataQuality[] = [
    "Verified",
    "Partial",
  ];


type RaceRow = {
  id: string;

  slug: string;

  name: string;
  short_name: string;

  location:
    string | null;

  country:
    string | null;

  country_code:
    string | null;

  series:
    RaceSeries;

  format:
    RaceCatalogEntry["format"];

  emoji:
    string | null;

  data_quality:
    RaceDataQuality;

  characteristics:
    string[] | null;

  notes:
    string | null;
};


type RaceEditionRow = {
  id: string;

  race_id: string;

  race_date:
    string | null;

  edition_year:
    number | null;

  swim:
    RaceCatalogEntry["swim"] |
    null;

  bike:
    RaceCatalogEntry["bike"] |
    null;

  run:
    RaceCatalogEntry["run"] |
    null;

  data_quality:
    RaceDataQuality;

  verified_fields:
    string[] | null;

  data_warning:
    string | null;
};


function normalize(
  value:
    string | null | undefined
) {
  return (
    value
      ?.trim()
      .toLowerCase() ??
    ""
  );
}


function displayRaceEmoji(
  countryCode: string,
  emoji:
    string | null | undefined
) {
  /*
    Subdivision flag emoji such as Wales and
    Scotland are not rendered consistently
    across browsers/platforms.

    Use the UK flag for GB races so athletes
    never see a black fallback flag.
  */
  if (countryCode === "GB") {
    return "🇬🇧";
  }

  return emoji || "🏁";
}


function compactRaceIdentity(
  value:
    string | null | undefined
) {
  return normalize(value)
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      ""
    );
}


function raceIdentityKey(
  race: RaceCatalogEntry
) {
  /*
    Intentionally ignore spaces, punctuation
    and branding differences such as:

    "JevnakerFULL"
    "Jevnaker Full"

    Format + country protect against most
    genuinely different events sharing names.
  */
  return [
    compactRaceIdentity(
      race.shortName ||
      race.name
    ),
    race.countryCode,
    race.format,
  ].join("|");
}


function raceRichnessScore(
  race: RaceCatalogEntry
) {
  let score =
    race.dataQuality ===
    "Verified"
      ? 10
      : 0;

  if (
    race.swim?.distanceKm
  ) {
    score += 2;
  }

  if (
    race.bike?.distanceKm
  ) {
    score += 2;
  }

  if (
    race.run?.distanceKm
  ) {
    score += 2;
  }

  if (
    race.bike
      ?.elevationGainM !==
      undefined &&
    race.bike
      ?.elevationGainM !==
      null
  ) {
    score += 2;
  }

  if (
    race.run
      ?.elevationGainM !==
      undefined &&
    race.run
      ?.elevationGainM !==
      null
  ) {
    score += 2;
  }

  score += Math.min(
    race.characteristics
      .length,
    8
  );

  return score;
}


function raceMatchesQuery(
  race:
    RaceCatalogEntry,

  query:
    string
) {
  if (!query) {
    return true;
  }

  const searchable = [
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

  return searchable.includes(
    query
  );
}


async function loadRacesFromSupabase(
  filter:
    RaceDiscoveryFilter
) {
  const supabase =
    createServerClient();


  const {
    data:
      raceRowsRaw,

    error:
      raceError,
  } =
    await supabase
      .from("races")
      .select(`
        id,
        slug,
        name,
        short_name,
        location,
        country,
        country_code,
        series,
        format,
        emoji,
        data_quality,
        characteristics,
        notes
      `);


  if (raceError) {
    throw raceError;
  }


  const raceRows =
    (
      raceRowsRaw ??
      []
    ) as RaceRow[];


  /*
    Empty database is valid.

    It is NOT treated as an API failure.
  */

  if (
    raceRows.length === 0
  ) {
    return {
      races:
        [] as
          RaceCatalogEntry[],

      total:
        0,

      filters: {
        series:
          [] as RaceSeries[],

        countries:
          [] as {
            code: string;
            name: string;
          }[],

        formats:
          [] as string[],
      },
    };
  }


  const raceIds =
    raceRows.map(
      (race) =>
        race.id
    );


  const {
    data:
      editionRowsRaw,

    error:
      editionError,
  } =
    await supabase
      .from(
        "race_editions"
      )
      .select(`
        id,
        race_id,
        race_date,
        edition_year,
        swim,
        bike,
        run,
        data_quality,
        verified_fields,
        data_warning
      `)
      .in(
        "race_id",
        raceIds
      )
      .order(
        "race_date",
        {
          ascending:
            true,
        }
      );


  if (editionError) {
    throw editionError;
  }


  const editionRows =
    (
      editionRowsRaw ??
      []
    ) as RaceEditionRow[];


  const editionsByRace =
    new Map<
      string,
      RaceEditionRow[]
    >();


  for (
    const edition
    of editionRows
  ) {
    const existing =
      editionsByRace.get(
        edition.race_id
      ) ?? [];

    existing.push(
      edition
    );

    editionsByRace.set(
      edition.race_id,
      existing
    );
  }


  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  const races:
    RaceCatalogEntry[] =
      raceRows.map(
        (race) => {

          const allEditions =
            editionsByRace.get(
              race.id
            ) ?? [];


          /*
            Prefer upcoming editions.

            Completed historical editions remain
            in the database, but should not be the
            default choice for a new target race.
          */

          /*
            edition_year = 0 is a special
            course-profile row.

            It contains reusable course data,
            but is NEVER a real race edition.
          */

          const profileEdition =
            allEditions.find(
              (edition) =>
                edition.edition_year === 0
            );


          const realEditions =
            allEditions.filter(
              (edition) =>
                edition.edition_year !== 0
            );


          const futureEditions =
            realEditions.filter(
              (edition) =>
                Boolean(
                  edition.race_date
                ) &&
                edition.race_date! >=
                  today
            );


          const preferredEditions =
            futureEditions;


          /*
            Prefer the upcoming edition's
            course data.

            If there is no upcoming edition,
            use the dedicated course-profile
            row.

            Historical editions are only the
            final fallback for course context.
          */

          /*
            A future race edition may have a verified date
            before its final course has been published.

            Do not force TriCoach to copy an older course
            into that edition just to make it selectable.

            Instead:
            - selectedDateEdition owns the upcoming date
            - courseEdition owns the best available course
            - the reusable year=0 profile remains the main
              fallback for course specificity
          */

          const selectedDateEdition =
            preferredEditions[0];


          const upcomingCourseEdition =
            preferredEditions.find(
              (edition) =>
                Boolean(
                  edition.swim ||
                  edition.bike ||
                  edition.run
                )
            );


          const latestHistoricalCourseEdition =
            [
              ...realEditions,
            ]
              .reverse()
              .find(
                (edition) =>
                  Boolean(
                    edition.swim ||
                    edition.bike ||
                    edition.run
                  )
              );


          const courseEdition =
            upcomingCourseEdition ??
            profileEdition ??
            latestHistoricalCourseEdition;


          const combinedVerifiedFields =
            Array.from(
              new Set([
                ...(
                  courseEdition
                    ?.verified_fields ??
                  []
                ),

                ...(
                  selectedDateEdition
                    ?.verified_fields ??
                  []
                ),
              ])
            );


          const combinedDataQuality:
            RaceDataQuality =
              (
                courseEdition
                  ?.data_quality ===
                  "Partial" ||
                selectedDateEdition
                  ?.data_quality ===
                  "Partial"
              )
                ? "Partial"
                : (
                    courseEdition
                      ?.data_quality ??
                    selectedDateEdition
                      ?.data_quality ??
                    race.data_quality
                  );


          return {
            id:
              race.slug,

            name:
              race.name,

            shortName:
              race.short_name,

            location:
              race.location ??
              "",

            country:
              race.country ??
              "",

            countryCode:
              race.country_code ??
              "",

            series:
              race.series,

            format:
              race.format,

            editions:
              preferredEditions
                .filter(
                  (edition) =>
                    Boolean(
                      edition.race_date
                    )
                )
                .map(
                  (edition) => ({
                    date:
                      edition.race_date!,
                  })
                ),

            swim:
              courseEdition
                ?.swim ??
              undefined,

            bike:
              courseEdition
                ?.bike ??
              undefined,

            run:
              courseEdition
                ?.run ??
              undefined,

            characteristics:
              Array.isArray(
                race.characteristics
              )
                ? race.characteristics
                : [],

            emoji:
              displayRaceEmoji(
                race.country_code ??
                  "",
                race.emoji
              ),

            dataQuality:
              combinedDataQuality,

            verifiedFields:
              combinedVerifiedFields,

            dataWarning:
              selectedDateEdition
                ?.data_warning ??
              courseEdition
                ?.data_warning ??
              undefined,

            dataNote:
              race.notes ??
              undefined,
          };
        }
      );


  /*
    PICKER VISIBILITY RULE

    Keep recurring race events discoverable even when
    the organiser has not published the next edition
    date yet.

    Historical editions remain stored in Supabase,
    but are not returned as selectable future dates.

    Therefore:
    - upcoming edition available -> show its date
    - no upcoming edition yet -> keep race visible as TBA
    - historical dates are never presented as future dates

    The athlete still needs a real selectedDate before
    confirming a target race.
  */


  /*
    Imports from different catalog generations can
    occasionally leave two database rows describing
    the same real-world race.

    Do not expose those duplicates to athletes.

    We keep the richer profile and merge any unique
    upcoming dates. No database rows are deleted here.
  */
  const deduplicatedRaceMap =
    new Map<
      string,
      RaceCatalogEntry
    >();


  for (
    const race
    of races
  ) {
    const key =
      raceIdentityKey(race);

    const existing =
      deduplicatedRaceMap.get(
        key
      );

    if (!existing) {
      deduplicatedRaceMap.set(
        key,
        race
      );
      continue;
    }


    const richer =
      raceRichnessScore(race) >
      raceRichnessScore(existing)
        ? race
        : existing;

    const other =
      richer === race
        ? existing
        : race;


    const mergedDates =
      Array.from(
        new Set([
          ...richer.editions.map(
            (edition) =>
              edition.date
          ),
          ...other.editions.map(
            (edition) =>
              edition.date
          ),
        ])
      )
        .sort()
        .map(
          (date) => ({
            date,
          })
        );


    deduplicatedRaceMap.set(
      key,
      {
        ...richer,

        editions:
          mergedDates,
      }
    );
  }


  const pickerRaces =
    Array.from(
      deduplicatedRaceMap.values()
    );


  const query =
    normalize(
      filter.query
    );


  const filtered =
    pickerRaces
      .filter(
        (race) =>
          raceMatchesQuery(
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


          const aDate =
            a.editions[0]
              ?.date;

          const bDate =
            b.editions[0]
              ?.date;


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


          return a.shortName
            .localeCompare(
              b.shortName
            );
        }
      );


  const series =
    Array.from(
      new Set(
        races.map(
          (race) =>
            race.series
        )
      )
    ).sort();


  const countries =
    Array.from(
      new Map(
        races
          .filter(
            (race) =>
              race.countryCode &&
              race.country
          )
          .map(
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
        races.map(
          (race) =>
            race.format
        )
      )
    ).sort();


  return {
    races:
      filtered,

    total:
      filtered.length,

    filters: {
      series,
      countries,
      formats,
    },
  };
}


export async function GET(
  request: NextRequest
) {

  const params =
    request.nextUrl
      .searchParams;


  const query =
    params.get("q") ??
    undefined;


  const formatRaw =
    params.get("format");


  const seriesRaw =
    params.get("series");


  const countryCode =
    params.get(
      "country"
    )?.toUpperCase();


  const qualityRaw =
    params.get(
      "quality"
    );


  const filter:
    RaceDiscoveryFilter = {
      query,
      countryCode,
    };


  if (
    formatRaw &&
    VALID_FORMATS.includes(
      formatRaw as
        typeof VALID_FORMATS[
          number
        ]
    )
  ) {
    filter.format =
      formatRaw as
        RaceDiscoveryFilter[
          "format"
        ];
  }


  if (
    seriesRaw &&
    VALID_SERIES.includes(
      seriesRaw as
        RaceSeries
    )
  ) {
    filter.series =
      seriesRaw as
        RaceSeries;
  }


  if (
    qualityRaw &&
    VALID_QUALITY.includes(
      qualityRaw as
        RaceDataQuality
    )
  ) {
    filter.dataQuality =
      qualityRaw as
        RaceDataQuality;
  }


  try {

    const result =
      await loadRacesFromSupabase(
        filter
      );


    return NextResponse.json({
      ok: true,

      source:
        "supabase",

      ...result,
    });

  } catch (error) {

    console.error(
      "Race database unavailable, using local fallback:",
      error
    );


    const fallback =
      discoverRaces(
        filter
      );


    return NextResponse.json({
      ok: true,

      source:
        "local-fallback",

      ...fallback,
    });
  }
}
