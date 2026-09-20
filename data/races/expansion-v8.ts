import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


type Course =
  Pick<
    RaceImportRecord["editions"][number],
    "swim" | "bike" | "run"
  >;


type Seed = {
  slug: string;
  name: string;
  shortName: string;

  location: string;
  country: string;
  countryCode: string;

  series:
    RaceImportRecord["series"];

  format:
    RaceImportRecord["format"];

  emoji: string;

  date?: string;

  course: Course;

  characteristics:
    string[];

  sourceName: string;
  sourceUrl: string;

  verifiedFields:
    string[];

  warning?: string;
};


const RACES:
  Seed[] = [

  // ======================================================
  // HAMBURG
  // ======================================================

  {
    slug:
      "world-triathlon-hamburg-olympic",

    name:
      "World Triathlon Hamburg Open Race",

    shortName:
      "Hamburg Triathlon",

    location:
      "Hamburg, Germany",

    country:
      "Germany",

    countryCode:
      "DE",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇩🇪",

    date:
      "2026-07-12",

    course: {
      swim: {
        distanceKm:
          1.5,

        environment:
          "Lake",
      },

      bike: {
        distanceKm:
          40,

        profile:
          "Flat",

        technicality:
          "Moderate",
      },

      run: {
        distanceKm:
          10,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    characteristics: [
      "One of the world's largest triathlons",
      "Mass-participation city race",
      "Binnenalster swim",
      "Closed city-centre roads",
      "Rathausmarkt finish",
      "Flat bike course",
      "Flat run",
      "Huge spectator support",
    ],

    sourceName:
      "World Triathlon Hamburg",

    sourceUrl:
      "https://events.triathlon.org/2026-wtcs-hamburg/open-races-courses",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "bike profile",
      "run profile",
      "course character",
    ],
  },


  // ======================================================
  // LONDON
  // ======================================================

  {
    slug:
      "london-t100-olympic",

    name:
      "London T100 Olympic Triathlon",

    shortName:
      "London Triathlon",

    location:
      "London, United Kingdom",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇬🇧",

    date:
      "2026-07-26",

    course: {
      swim: {
        distanceKm:
          1.5,

        environment:
          "Open water",

        expectedWaterTempC:
          20,

        wetsuitLikely:
          true,
      },

      bike: {
        distanceKm:
          40,

        profile:
          "Flat",

        technicality:
          "Moderate",
      },

      run: {
        distanceKm:
          10,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    characteristics: [
      "Royal Victoria Dock swim",
      "Major London city triathlon",
      "Closed-road racing",
      "Olympic-distance mass participation",
      "Flat bike",
      "Flat run",
      "Landmark city racing",
      "Large spectator event",
    ],

    sourceName:
      "London T100",

    sourceUrl:
      "https://t100triathlon.com/london/participate/",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "run profile",
      "course character",
    ],
  },


  // ======================================================
  // CHICAGO
  // ======================================================

  {
    slug:
      "chicago-triathlon-olympic",

    name:
      "Supertri Chicago Triathlon Olympic",

    shortName:
      "Chicago Triathlon",

    location:
      "Chicago, Illinois, USA",

    country:
      "United States",

    countryCode:
      "US",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇺🇸",

    date:
      "2026-08-23",

    course: {
      swim: {
        distanceKm:
          1.5,

        environment:
          "Lake",
      },

      bike: {
        distanceKm:
          40,

        technicality:
          "Moderate",
      },

      run: {
        distanceKm:
          10,

        surface:
          "Road",
      },
    },

    characteristics: [
      "One of the world's largest city triathlons",
      "Lake Michigan swim",
      "Chicago skyline",
      "Closed urban roads",
      "Technical turns",
      "Grant Park finish",
      "Large beginner and age-group field",
    ],

    sourceName:
      "Supertri Chicago",

    sourceUrl:
      "https://supertri.com/chicago-triathlon/olympic/",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "bike technicality",
      "course character",
    ],
  },


  // ======================================================
  // ESCAPE FROM ALCATRAZ
  // ======================================================

  {
    slug:
      "escape-from-alcatraz-triathlon",

    name:
      "Escape From Alcatraz Triathlon",

    shortName:
      "Escape From Alcatraz",

    location:
      "San Francisco, California, USA",

    country:
      "United States",

    countryCode:
      "US",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇺🇸",

    date:
      "2026-06-07",

    course: {
      swim: {
        distanceKm:
          2.4,

        environment:
          "Sea",

        expectedWaterTempC:
          13,

        wetsuitLikely:
          true,
      },

      bike: {
        distanceKm:
          29,

        profile:
          "Hilly",

        technicality:
          "High",
      },

      run: {
        distanceKm:
          13,

        profile:
          "Hilly",

        surface:
          "Mixed",
      },
    },

    characteristics: [
      "Iconic Alcatraz swim start",
      "Cold San Francisco Bay",
      "Modified international distance",
      "Presidio bike course",
      "Golden Gate Park",
      "Baker Beach",
      "Sand Ladder",
      "Hilly technical racing",
      "Bucket-list triathlon",
    ],

    sourceName:
      "Escape From Alcatraz Triathlon",

    sourceUrl:
      "https://www.escapealcatraztri.com/frequently-asked-questions",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "run profile",
      "run surface",
      "course character",
    ],
  },


  // ======================================================
  // BARCELONA
  // ======================================================

  {
    slug:
      "challenge-barcelona-triatlo-olympic",

    name:
      "Challenge Barcelona Triatló Olympic",

    shortName:
      "Barcelona Triathlon",

    location:
      "Barcelona, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "Challenge",

    format:
      "Olympic",

    emoji:
      "🇪🇸",

    date:
      "2026-10-25",

    course: {
      swim: {
        distanceKm:
          1.5,

        environment:
          "Sea",
      },

      bike: {
        distanceKm:
          40,
      },

      run: {
        distanceKm:
          10,

        surface:
          "Road",
      },
    },

    characteristics: [
      "Major Barcelona city triathlon",
      "Mediterranean sea swim",
      "Olympic-distance mass participation",
      "Urban bike course",
      "City run",
      "Large international field",
      "Multiple race distances",
    ],

    sourceName:
      "Challenge Barcelona Triatló",

    sourceUrl:
      "https://www.triathlon.barcelona/en/",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "course character",
    ],
  },


  // ======================================================
  // NOOSA
  // ======================================================

  {
    slug:
      "noosa-triathlon",

    name:
      "Garmin Noosa Triathlon",

    shortName:
      "Noosa Triathlon",

    location:
      "Noosa Heads, Queensland, Australia",

    country:
      "Australia",

    countryCode:
      "AU",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇦🇺",

    date:
      "2026-11-01",

    course: {
      swim: {
        distanceKm:
          1.5,

        environment:
          "Sea",
      },

      bike: {
        distanceKm:
          40,

        profile:
          "Rolling",

        technicality:
          "Moderate",
      },

      run: {
        distanceKm:
          10,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    characteristics: [
      "One of the world's largest Olympic-distance triathlons",
      "Noosa Main Beach swim",
      "Laguna Bay",
      "Sunshine Coast hinterland bike",
      "Garmin Hill climb",
      "Fast flat 10 km run",
      "More than 10,000 competitors across the festival",
      "Iconic Australian triathlon",
    ],

    sourceName:
      "Garmin Noosa Triathlon",

    sourceUrl:
      "https://noosatri.com.au/events/noosa-triathlon/",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "bike profile",
      "run profile",
      "course character",
    ],
  },


  // ======================================================
  // QATAR
  // ======================================================

  {
    slug:
      "qatar-t100-sprint",

    name:
      "Qatar T100 Sprint Triathlon",

    shortName:
      "Qatar T100 Sprint",

    location:
      "Lusail, Qatar",

    country:
      "Qatar",

    countryCode:
      "QA",

    series:
      "Independent",

    format:
      "Sprint",

    emoji:
      "🇶🇦",

    date:
      "2026-12-12",

    course: {
      swim: {
        distanceKm:
          0.75,

        environment:
          "Sea",

        expectedWaterTempC:
          25,
      },

      bike: {
        distanceKm:
          20,

        profile:
          "Flat",

        technicality:
          "Low",
      },

      run: {
        distanceKm:
          5,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    characteristics: [
      "Lusail city racing",
      "T100 World Championship weekend",
      "Sea swim",
      "Flat bike",
      "Flat run",
      "Closed roads",
      "Large international event",
      "Beginner-friendly sprint option",
    ],

    sourceName:
      "Qatar T100",

    sourceUrl:
      "https://t100triathlon.com/qatar/participate/",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "run profile",
      "course character",
    ],
  },


  // ======================================================
  // GOLD COAST — FUTURE 2027
  // ======================================================

  {
    slug:
      "gold-coast-t100-olympic",

    name:
      "Gold Coast T100 Olympic Triathlon",

    shortName:
      "Gold Coast Triathlon",

    location:
      "Gold Coast, Queensland, Australia",

    country:
      "Australia",

    countryCode:
      "AU",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇦🇺",

    date:
      "2027-03-20",

    course: {
      swim: {
        distanceKm:
          1.5,

        environment:
          "Sea",

        expectedWaterTempC:
          25,
      },

      bike: {
        distanceKm:
          40,

        profile:
          "Flat",

        technicality:
          "Low",
      },

      run: {
        distanceKm:
          10,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    characteristics: [
      "Broadwater Parklands swim",
      "Major Gold Coast multisport festival",
      "Closed coastal roads",
      "Flat fast bike",
      "Flat run",
      "Surfers Paradise finish",
      "PB-friendly Olympic race",
    ],

    sourceName:
      "Gold Coast T100",

    sourceUrl:
      "https://t100triathlon.com/gold-coast/participate/",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "run profile",
      "course character",
    ],
  },


  // ======================================================
  // SINGAPORE
  // Exact 2027 sprint day not yet published,
  // so verified 2026 edition retained instead of guessing.
  // ======================================================

  {
    slug:
      "singapore-t100-sprint",

    name:
      "Singapore T100 Sprint Triathlon",

    shortName:
      "Singapore T100 Sprint",

    location:
      "Marina Bay, Singapore",

    country:
      "Singapore",

    countryCode:
      "SG",

    series:
      "Independent",

    format:
      "Sprint",

    emoji:
      "🇸🇬",

    date:
      "2026-04-25",

    course: {
      swim: {
        distanceKm:
          0.75,

        environment:
          "Open water",

        expectedWaterTempC:
          27,
      },

      bike: {
        distanceKm:
          20,

        profile:
          "Rolling",

        technicality:
          "Moderate",
      },

      run: {
        distanceKm:
          5,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    characteristics: [
      "Marina Bay swim",
      "Iconic Singapore skyline",
      "Closed city roads",
      "Hot and humid racing",
      "Major international T100 weekend",
      "Sprint mass-participation option",
      "Flat run",
    ],

    sourceName:
      "Singapore T100",

    sourceUrl:
      "https://t100triathlon.com/singapore/participate/",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "run profile",
      "course character",
    ],

    warning:
      "The 2027 Singapore event is confirmed for 10–11 April 2027, but the exact 2027 Sprint race day is not yet stored because TriCoach does not guess edition dates.",
  },
];


export const RACE_EXPANSION_V8:
  RaceImportRecord[] =
    RACES.map((race) => {

      const quality:
        RaceImportRecord["dataQuality"] =
          "Verified";

      const profileEdition:
        RaceImportRecord["editions"][number] = {
          year:
            0,

          ...race.course,

          dataQuality:
            quality,

          verifiedFields:
            race.verifiedFields,

          ...(race.warning
            ? {
                dataWarning:
                  race.warning,
              }
            : {}),
        };


      const editions:
        RaceImportRecord["editions"] = [
          profileEdition,
        ];


      if (race.date) {

        editions.push({
          year:
            Number(
              race.date.slice(
                0,
                4
              )
            ),

          date:
            race.date,

          ...race.course,

          dataQuality:
            quality,

          verifiedFields: [
            "race_date",
            ...race.verifiedFields.filter(
              (field) =>
                field !==
                "race_date"
            ),
          ],

          ...(race.warning
            ? {
                dataWarning:
                  race.warning,
              }
            : {}),
        });
      }


      return {
        slug:
          race.slug,

        name:
          race.name,

        shortName:
          race.shortName,

        location:
          race.location,

        country:
          race.country,

        countryCode:
          race.countryCode,

        series:
          race.series,

        format:
          race.format,

        emoji:
          race.emoji,

        characteristics:
          race.characteristics,

        dataQuality:
          quality,

        notes:
          "TriCoach international city-triathlon profile. Race dates and course facts are stored only when supported by published event information.",

        editions,

        sources: [
          {
            name:
              race.sourceName,

            url:
              race.sourceUrl,

            type:
              "Official",

            verifiedAt:
              "2026-08-26",

            supportsFields:
              race.verifiedFields,
          },
        ],
      };
    });
