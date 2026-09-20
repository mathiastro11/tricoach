import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V23:
  RaceImportRecord[] = [
    {
      slug:
        "gran-triatlon-madrid-olympic",

      name:
        "Gran Triatlón Madrid Standard",

      shortName:
        "Madrid Triathlon",

      location:
        "Madrid, Spain",

      country:
        "Spain",

      countryCode:
        "ES",

      series:
        "Independent",

      format:
        "Olympic",

      emoji:
        "🇪🇸",

      characteristics: [
        "One of Spain's largest triathlons",
        "Casa de Campo lake swim",
        "Olympic-distance mass participation",
        "Draft-legal racing",
        "Urban park setting",
        "Flat run",
        "Multiple race distances",
      ],

      dataQuality:
        "Verified",

      notes:
        "Current organizer information and the 2026 regulations describe the Standard course as 1.5 km swim, 37 km bike and 10 km run. The official 2026 results PDF labels that specific edition as 1.5/40/10 km, so TriCoach keeps 40 km only on the historical 2026 edition while the reusable course profile follows the organizer's current 37 km description. No 2027 race date is stored until the organizer publishes an exact date.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              1.5,

            environment:
              "Lake",
          },

          bike: {
            distanceKm:
              37,

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

          dataQuality:
            "Verified",

          verifiedFields: [
            "course distances",
            "swim environment",
            "run profile",
            "course character",
          ],

          dataWarning:
            "The official 2026 results PDF labels the historical 2026 edition as a 40 km bike, while the organizer's current information and 2026 regulations describe the Standard bike course as 37 km.",
        },

        {
          year:
            2026,

          date:
            "2026-06-20",

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

          dataQuality:
            "Verified",

          verifiedFields: [
            "race_date",
            "course distances",
            "swim environment",
            "run profile",
            "course character",
          ],

          dataWarning:
            "The 2026 results PDF reports 1.5/40/10 km, while the organizer's information page and regulations describe the Standard bike course as 37 km.",
        },
      ],

      sources: [
        {
          name:
            "Gran Triatlón Madrid — Información",

          url:
            "https://grantriatlonmadrid.com/informacion/",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-03",

          supportsFields: [
            "course distances",
            "swim environment",
            "course character",
          ],
        },

        {
          name:
            "Gran Triatlón Madrid — Reglamento 2026",

          url:
            "https://grantriatlonmadrid.com/wp-content/uploads/2026/04/REGLAMENTO-2026-GTM.pdf",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-03",

          supportsFields: [
            "course distances",
            "standard race",
          ],
        },

        {
          name:
            "Gran Triatlón Madrid — Resultados Estándar 2026",

          url:
            "https://grantriatlonmadrid.com/wp-content/uploads/2026/06/Estadar-General.pdf",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            "2026-09-03",

          supportsFields: [
            "race_date",
            "course distances",
            "standard race",
          ],
        },

        {
          name:
            "Madrid Tourism",

          url:
            "https://www.esmadrid.com/agenda/gran-triatlon-madrid-casa-campo",

          type:
            "Trusted third party",

          verifiedAt:
            "2026-09-03",

          supportsFields: [
            "event scale",
            "swim environment",
            "run profile",
            "course character",
          ],
        },
      ],
    },
  ];
