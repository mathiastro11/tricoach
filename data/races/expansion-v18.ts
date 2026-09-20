import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


const VERIFIED_AT =
  "2026-09-02";


export const RACE_EXPANSION_V18:
  RaceImportRecord[] = [

  {
    slug:
      "challenge-barcelona",

    name:
      "Challenge Barcelona",

    shortName:
      "Challenge Barcelona",

    location:
      "Barcelona, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "Challenge",

    format:
      "70.3",

    emoji:
      "🇪🇸",

    dataQuality:
      "Verified",

    characteristics: [
      "Mar Bella beach swim",
      "Mediterranean sea swim",
      "Flat and fast coastal bike",
      "Barcelona city racing",
      "Seafront run",
      "Late-season European race",
    ],

    notes:
      "Challenge Family verifies the 2026 Middle Distance as 1.9 km swim, 90 km bike and 21 km run. The bike course is described as flat and fast. Exact elevation totals and a categorical run profile remain intentionally unstored.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            90,

          profile:
            "Flat",
        },

        run: {
          distanceKm:
            21,

          surface:
            "Road",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "bike profile",
          "run surface",
          "course character",
        ],

        dataWarning:
          "Exact bike/run elevation and a categorical run profile remain intentionally unstored.",
      },

      {
        year:
          2026,

        date:
          "2026-10-25",

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
        ],
      },
    ],

    sources: [
      {
        name:
          "Challenge Barcelona Triathlon",

        url:
          "https://www.challenge-family.com/challenge-family/races/challenge-barcelona/",

        type:
          "Organizer",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race identity",
          "course distances",
          "swim environment",
          "bike profile",
          "run surface",
          "course character",
        ],
      },

      {
        name:
          "Challenge Barcelona Triathlon 2026",

        url:
          "https://www.challenge-family.com/challenge-family/races/challenge-barcelona/",

        type:
          "Organizer",

        editionYear:
          2026,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
        ],
      },
    ],
  },
];
