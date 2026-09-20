import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V5:
  RaceImportRecord[] = [

  // ======================================================
  // IRONMAN WALES
  // ======================================================

  {
    slug:
      "ironman-wales",

    name:
      "IRONMAN Wales",

    shortName:
      "IRONMAN Wales",

    location:
      "Tenby, Wales",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🏴",

    characteristics: [
      "Celtic Sea swim",
      "Extremely hilly bike",
      "2,450 m bike climbing",
      "500 m run climbing",
      "Repeated steep climbs",
      "Technical descending",
      "Hilly four-loop marathon",
      "Coastal wind exposure",
      "One of the hardest IRONMAN bike courses",
    ],

    dataQuality:
      "Verified",

    notes:
      "Course elevation verified from official IRONMAN Wales course maps. This is a materially harder long-course profile than a typical rolling IRONMAN.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            2450,

          elevationDisplay:
            "2,450 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            500,

          elevationDisplay:
            "500 m",

          profile:
            "Hilly",

          surface:
            "Road",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-09-13",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            2450,

          elevationDisplay:
            "2,450 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            500,

          elevationDisplay:
            "500 m",

          profile:
            "Hilly",

          surface:
            "Road",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
          "course distances",
          "swim environment",
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN Wales",

        url:
          "https://www.ironman.com/races/im-wales",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race identity",
          "race_date",
          "course distances",
        ],
      },

      {
        name:
          "IRONMAN Wales Bike Course Map",

        url:
          "https://www.ironman.com/sites/default/files/2025-03/IMWA%20Bike%202025.pdf",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "bike distance",
          "bike elevation",
          "bike profile",
          "course character",
        ],
      },

      {
        name:
          "IRONMAN Wales Run Course",

        url:
          "https://www.ironman.com/sites/default/files/2025-08/IM%20WALES%20SPECTATOR%20GUIDE%202025.pdf",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "run distance",
          "run elevation",
          "run profile",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN ITALY EMILIA-ROMAGNA
  // ======================================================

  {
    slug:
      "ironman-italy-emilia-romagna",

    name:
      "IRONMAN Italy Emilia-Romagna",

    shortName:
      "IRONMAN Italy",

    location:
      "Cervia, Italy",

    country:
      "Italy",

    countryCode:
      "IT",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇮🇹",

    characteristics: [
      "Adriatic Sea swim",
      "Fast bike course",
      "Approximately 400 m bike climbing",
      "Approximately 50 m run climbing",
      "Very flat marathon",
      "Aero-position durability",
      "PB-friendly long course",
      "Warm conditions possible",
    ],

    dataQuality:
      "Verified",

    notes:
      "Elevation values use official IRONMAN course-map totals. The course is substantially flatter than most European full-distance races.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            400,

          elevationDisplay:
            "~400 m",

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            50,

          elevationDisplay:
            "~50 m",

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
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-09-19",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            400,

          elevationDisplay:
            "~400 m",

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            50,

          elevationDisplay:
            "~50 m",

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
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN Italy Emilia-Romagna Athlete Guide",

        url:
          "https://www.ironman.com/sites/default/files/2024-11/im_italy_emilia_romagna_athlete_guide_english_2024.pdf",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "course distances",
          "bike elevation",
          "bike profile",
        ],
      },

      {
        name:
          "IRONMAN Italy Emilia-Romagna Course Briefing",

        url:
          "https://www.ironman.com/sites/default/files/2025-09/2ENG-IM-%20ATHLETE%20BRIEFING_CERVIA_25.pdf",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "run distance",
          "run elevation",
          "run profile",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN PORTUGAL-CASCAIS
  // ======================================================

  {
    slug:
      "ironman-portugal-cascais",

    name:
      "IRONMAN Portugal-Cascais",

    shortName:
      "IRONMAN Cascais",

    location:
      "Cascais, Portugal",

    country:
      "Portugal",

    countryCode:
      "PT",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇵🇹",

    characteristics: [
      "Protected Cascais Bay swim",
      "18°C typical water",
      "1,529 m bike climbing",
      "216 m run climbing",
      "Rolling bike",
      "Sintra climbing",
      "Estoril Formula 1 circuit",
      "Coastal wind exposure",
      "Rolling coastal marathon",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current course distances, elevation totals and environmental profile verified directly from the current IRONMAN course page.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",

          expectedWaterTempC:
            18,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            1529,

          elevationDisplay:
            "1,529 m",

          profile:
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            216,

          elevationDisplay:
            "216 m",

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
          "water temperature",
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-10-17",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",

          expectedWaterTempC:
            18,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            1529,

          elevationDisplay:
            "1,529 m",

          profile:
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            216,

          elevationDisplay:
            "216 m",

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
          "water temperature",
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN Portugal-Cascais Course",

        url:
          "https://www.ironman.com/races/im-cascais/course",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
        ],
      },

      {
        name:
          "IRONMAN Portugal-Cascais 2026 Registration",

        url:
          "https://regprt.ironman.com/event/2026-ironman-portugal-cascais",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 PORTUGAL-CASCAIS
  // ======================================================

  {
    slug:
      "ironman-703-cascais",

    name:
      "IRONMAN 70.3 Portugal-Cascais",

    shortName:
      "70.3 Cascais",

    location:
      "Cascais, Portugal",

    country:
      "Portugal",

    countryCode:
      "PT",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇵🇹",

    characteristics: [
      "Protected Cascais Bay swim",
      "18°C typical water",
      "771 m bike climbing",
      "127 m run climbing",
      "Early hilly bike section",
      "Sintra climb",
      "Fast second half of bike",
      "Rolling coastal run",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current course distances and elevation totals verified directly from the current IRONMAN 70.3 Cascais course page.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",

          expectedWaterTempC:
            18,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            90,

          elevationGainM:
            771,

          elevationDisplay:
            "771 m",

          profile:
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            21.1,

          elevationGainM:
            127,

          elevationDisplay:
            "127 m",

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
          "water temperature",
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-10-17",

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",

          expectedWaterTempC:
            18,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            90,

          elevationGainM:
            771,

          elevationDisplay:
            "771 m",

          profile:
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            21.1,

          elevationGainM:
            127,

          elevationDisplay:
            "127 m",

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
          "water temperature",
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN 70.3 Portugal-Cascais Course",

        url:
          "https://www.ironman.com/races/im703-cascais/course",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike elevation",
          "run elevation",
          "bike profile",
          "run profile",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Portugal-Cascais 2026 Registration",

        url:
          "https://regprt.ironman.com/event/2026-ironman-703-portugal-cascais",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
        ],
      },
    ],
  },
];
