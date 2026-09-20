import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V24:
  RaceImportRecord[] = [

    // ====================================================
    // ESCAPE FROM ALCATRAZ
    // ====================================================

    {
      slug:
        "escape-from-alcatraz",

      name:
        "Sokin Escape From Alcatraz Triathlon",

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
        "Other",

      emoji:
        "🇺🇸",

      characteristics: [
        "Iconic bucket-list triathlon",
        "San Francisco Bay swim",
        "Cold open-water conditions",
        "Alcatraz Island swim start",
        "Rolling and hilly bike",
        "Presidio terrain",
        "Baker Beach sand",
        "Sand Ladder",
        "Mixed-surface run",
        "Technical pacing",
      ],

      dataQuality:
        "Verified",

      notes:
        "The organizer describes Escape From Alcatraz as a modified international-distance triathlon with a 1.5-mile swim, 18-mile bike and 8-mile run. The 2027 race date has not yet been announced, so Basse stores a reusable verified course profile without inventing a future edition date.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              2.4,

            environment:
              "Sea",
          },

          bike: {
            distanceKm:
              29,

            profile:
              "Hilly",

            technicality:
              "Moderate",
          },

          run: {
            distanceKm:
              13,

            profile:
              "Hilly",

            surface:
              "Mixed",
          },

          dataQuality:
            "Verified",

          verifiedFields: [
            "course distances",
            "swim environment",
            "bike profile",
            "run profile",
            "run surface",
            "course character",
          ],

          dataWarning:
            "2027 race date is currently TBA. Distances are rounded metric equivalents of the organizer-published 1.5 mi / 18 mi / 8 mi course.",
        },
      ],

      sources: [
        {
          name:
            "Escape From Alcatraz — FAQ",

          url:
            "https://www.escapealcatraztri.com/frequently-asked-questions",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "course distances",
            "2027 date status",
            "swim environment",
            "race identity",
          ],
        },

        {
          name:
            "Escape From Alcatraz — Overview",

          url:
            "https://www.escapealcatraztri.com/event-information/overview",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "race identity",
            "event scale",
            "course character",
            "bike profile",
            "run profile",
          ],
        },

        {
          name:
            "Escape From Alcatraz — Course",

          url:
            "https://acc.srv.escapealcatraztri.com/race-information/the-course",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "run surface",
            "run profile",
            "Sand Ladder",
            "course character",
          ],
        },
      ],
    },


    // ====================================================
    // ALPE D'HUEZ TRIATHLON L
    // ====================================================

    {
      slug:
        "alpe-dhuez-triathlon-l",

      name:
        "Alpe d’Huez Triathlon L",

      shortName:
        "Alpe d’Huez L",

      location:
        "Alpe d’Huez, France",

      country:
        "France",

      countryCode:
        "FR",

      series:
        "Independent",

      format:
        "Other",

      emoji:
        "🇫🇷",

      characteristics: [
        "Iconic Alpine triathlon",
        "Lake swim",
        "Cold mountain water",
        "3,200+ m bike climbing",
        "Alpine mountain passes",
        "Alpe d’Huez 21 bends",
        "Long sustained climbing",
        "High-speed descending",
        "Mountain run",
        "Altitude exposure",
      ],

      dataQuality:
        "Verified",

      notes:
        "The organizer lists the 2027 Triathlon L for 28 July 2027. The course is 2.2 km swim, 118 km bike and 19.2 km run. Official course information lists more than 3,200 m of bike climbing and an average recent swim temperature of approximately 17°C.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              2.2,

            environment:
              "Lake",

            expectedWaterTempC:
              17,
          },

          bike: {
            distanceKm:
              118,

            elevationGainM:
              3200,

            elevationDisplay:
              "3,200+ m",

            profile:
              "Mountainous",

            technicality:
              "High",
          },

          run: {
            distanceKm:
              19.2,

            profile:
              "Hilly",
          },

          dataQuality:
            "Verified",

          verifiedFields: [
            "course distances",
            "swim environment",
            "expected water temperature",
            "bike elevation",
            "bike profile",
            "course character",
          ],
        },

        {
          year:
            2027,

          date:
            "2027-07-28",

          swim: {
            distanceKm:
              2.2,

            environment:
              "Lake",

            expectedWaterTempC:
              17,
          },

          bike: {
            distanceKm:
              118,

            elevationGainM:
              3200,

            elevationDisplay:
              "3,200+ m",

            profile:
              "Mountainous",

            technicality:
              "High",
          },

          run: {
            distanceKm:
              19.2,

            profile:
              "Hilly",
          },

          dataQuality:
            "Verified",

          verifiedFields: [
            "race_date",
            "course distances",
            "swim environment",
            "expected water temperature",
            "bike elevation",
            "bike profile",
            "course character",
          ],
        },
      ],

      sources: [
        {
          name:
            "Alpe d’Huez Triathlon — Triathlon L",

          url:
            "https://www.alpetriathlon.com/alpe-dhuez-triathlon-l/?lang=en",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "course distances",
            "swim environment",
            "expected water temperature",
            "bike elevation",
            "bike profile",
            "course character",
          ],
        },

        {
          name:
            "Alpe d’Huez Triathlon — 2027 Triathlon L",

          url:
            "https://www.alpetriathlon.com/triathlon-de-lalpe-dhuez-l/",

          type:
            "Official",

          editionYear:
            2027,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "race_date",
            "course distances",
            "bike elevation",
            "course character",
          ],
        },
      ],
    },


    // ====================================================
    // GARMIN NOOSA TRIATHLON
    // ====================================================

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

      characteristics: [
        "Major mass-participation triathlon",
        "Olympic-distance racing",
        "Ocean swim",
        "Noosa Main Beach",
        "Noosa hinterland bike",
        "Garmin Hill Climb",
        "Fast flat run",
        "Large spectator atmosphere",
        "Elite and age-group racing",
      ],

      dataQuality:
        "Verified",

      notes:
        "Official Noosa information describes a 1.5 km ocean swim from Noosa Main Beach, a 40 km out-and-back bike course through the hinterland including the 2 km Garmin Hill Climb, and a fast flat 10 km road run. The confirmed 2026 race date is 1 November 2026. No 2027 race date is stored until the organizer publishes it.",

      editions: [
        {
          year:
            0,

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

          dataQuality:
            "Verified",

          verifiedFields: [
            "course distances",
            "swim environment",
            "bike profile",
            "run profile",
            "run surface",
            "course character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-11-01",

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

          dataQuality:
            "Verified",

          verifiedFields: [
            "race_date",
            "course distances",
            "swim environment",
            "bike profile",
            "run profile",
            "run surface",
            "course character",
          ],
        },
      ],

      sources: [
        {
          name:
            "Noosa Triathlon — Event Details",

          url:
            "https://noosatri.com.au/events/noosa-triathlon/",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "course distances",
            "swim environment",
            "bike profile",
            "run profile",
            "run surface",
            "course character",
          ],
        },

        {
          name:
            "Noosa Triathlon — 2026 Entry Information",

          url:
            "https://noosatri.com.au/entry-info/triathon/",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "race_date",
            "course distances",
            "race identity",
          ],
        },
      ],
    },


    // ====================================================
    // LAGUNA PHUKET TRIATHLON
    // ====================================================

    {
      slug:
        "laguna-phuket-triathlon",

      name:
        "Laguna Phuket Triathlon",

      shortName:
        "Laguna Phuket",

      location:
        "Phuket, Thailand",

      country:
        "Thailand",

      countryCode:
        "TH",

      series:
        "Independent",

      format:
        "Other",

      emoji:
        "🇹🇭",

      characteristics: [
        "Long-running Asian destination triathlon",
        "Signature non-standard distance",
        "Tropical conditions",
        "Open-water swim",
        "50 km bike",
        "12 km run",
        "Resort race setting",
        "Heat and humidity exposure",
        "Elite and age-group racing",
      ],

      dataQuality:
        "Verified",

      notes:
        "Laguna Phuket's signature individual triathlon uses a distinctive 1.8 km swim, 50 km bike and 12 km run format. The organizer confirms the 32nd edition for 15 November 2026. A 2027 date is not stored until officially published.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              1.8,

            environment:
              "Sea",
          },

          bike: {
            distanceKm:
              50,

            profile:
              "Rolling",

            technicality:
              "Moderate",
          },

          run: {
            distanceKm:
              12,

            profile:
              "Rolling",

            surface:
              "Road",
          },

          dataQuality:
            "Verified",

          verifiedFields: [
            "course distances",
            "swim environment",
            "course character",
          ],

          dataWarning:
            "Exact elevation totals are intentionally not stored because the current official race information does not publish verified cumulative elevation figures.",
        },

        {
          year:
            2026,

          date:
            "2026-11-15",

          swim: {
            distanceKm:
              1.8,

            environment:
              "Sea",
          },

          bike: {
            distanceKm:
              50,

            profile:
              "Rolling",

            technicality:
              "Moderate",
          },

          run: {
            distanceKm:
              12,

            profile:
              "Rolling",

            surface:
              "Road",
          },

          dataQuality:
            "Verified",

          verifiedFields: [
            "race_date",
            "course distances",
            "swim environment",
            "course character",
          ],

          dataWarning:
            "Exact elevation totals are intentionally not stored because the current official race information does not publish verified cumulative elevation figures.",
        },
      ],

      sources: [
        {
          name:
            "Laguna Phuket Triathlon — Individual",

          url:
            "https://www.lagunaphukettri.com/lpt-individual/",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "course distances",
            "race identity",
            "course character",
          ],
        },

        {
          name:
            "Laguna Phuket Triathlon — Course Maps",

          url:
            "https://www.lagunaphukettri.com/course-maps/",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "course distances",
            "course structure",
          ],
        },

        {
          name:
            "Laguna Phuket Triathlon — 2026 Individual",

          url:
            "https://www.lagunaphukettri.com/lpt-individual/",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            "2026-09-04",

          supportsFields: [
            "race_date",
            "course distances",
          ],
        },
      ],
    },
  ];
