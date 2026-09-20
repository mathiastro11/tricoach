import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V6:
  RaceImportRecord[] = [

  // ======================================================
  // CHALLENGE ROTH
  // ======================================================

  {
    slug:
      "challenge-roth",

    name:
      "DATEV Challenge Roth",

    shortName:
      "Challenge Roth",

    location:
      "Roth, Germany",

    country:
      "Germany",

    countryCode:
      "DE",

    series:
      "Challenge",

    format:
      "Ironman",

    emoji:
      "🇩🇪",

    characteristics: [
      "Main-Danube Canal swim",
      "Fast long-distance course",
      "Approximately 1,500 m bike climbing",
      "Rolling bike terrain",
      "Solar Hill",
      "Huge spectator support",
      "Fast road marathon",
      "High-speed aero durability",
    ],

    dataQuality:
      "Verified",

    notes:
      "2027 race date, course distances and approximately 1,500 m bike elevation are verified from DATEV Challenge Roth.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "River",
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            1500,

          elevationDisplay:
            "~1,500 m",

          profile:
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            42.2,

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
          "bike elevation",
          "bike profile",
          "course character",
        ],
      },

      {
        year:
          2027,

        date:
          "2027-07-04",

        swim: {
          distanceKm:
            3.8,

          environment:
            "River",
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            1500,

          elevationDisplay:
            "~1,500 m",

          profile:
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            42.2,

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
          "bike elevation",
          "bike profile",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "DATEV Challenge Roth",

        url:
          "https://www.challenge-roth.com/en/course-info.html",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "course distances",
          "swim environment",
          "course character",
        ],
      },

      {
        name:
          "DATEV Challenge Roth Bike Course",

        url:
          "https://www.challenge-roth.com/en/news-area/bike-course-adjustments-focus-on-improved-safety-and-resident-access.html",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "bike elevation",
          "bike profile",
        ],
      },

      {
        name:
          "DATEV Challenge Roth",

        url:
          "https://www.challenge-roth.com/",

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
  // CHALLENGE ALMERE
  // ======================================================

  {
    slug:
      "challenge-almere",

    name:
      "Challenge Almere-Amsterdam",

    shortName:
      "Challenge Almere",

    location:
      "Almere, Netherlands",

    country:
      "Netherlands",

    countryCode:
      "NL",

    series:
      "Challenge",

    format:
      "Ironman",

    emoji:
      "🇳🇱",

    characteristics: [
      "Weerwater lake swim",
      "Course below sea level",
      "Extremely flat bike",
      "Extremely flat run",
      "Open polder roads",
      "Strong wind exposure",
      "Long aero-position demands",
      "Very fast long-distance course",
    ],

    dataQuality:
      "Verified",

    notes:
      "2026 date, distances and flat course character verified from Challenge Almere-Amsterdam and Challenge Family.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            180,

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            42.2,

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
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-09-12",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            180,

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            42.2,

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
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Challenge Almere-Amsterdam",

        url:
          "https://challenge-almere.com/races/long-distance/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "swim environment",
          "course character",
        ],
      },

      {
        name:
          "Challenge Family · Almere-Amsterdam",

        url:
          "https://www.challenge-family.com/challenge-family/races/challenge-almere-amsterdam/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "bike profile",
          "run profile",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // CHALLENGE SANREMO
  // IMPORTANT: correct bike distance = 81 km
  // ======================================================

  {
    slug:
      "challenge-sanremo",

    name:
      "Challenge Sanremo",

    shortName:
      "Challenge Sanremo",

    location:
      "Sanremo, Italy",

    country:
      "Italy",

    countryCode:
      "IT",

    series:
      "Challenge",

    format:
      "70.3",

    emoji:
      "🇮🇹",

    characteristics: [
      "Mediterranean sea swim",
      "81 km bike course",
      "Nearly 1,500 m bike climbing",
      "17 km sustained climb",
      "Passo Ghimbegna at 1,030 m",
      "Fast technical descending",
      "Flat coastal run",
      "Large bike-to-run contrast",
    ],

    dataQuality:
      "Verified",

    notes:
      "Corrected course profile for 2026. The official race information specifies an 81 km bike rather than a standard 90 km middle-distance bike.",

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
            81,

          elevationGainM:
            1500,

          elevationDisplay:
            "~1,500 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            21.1,

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
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-10-04",

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            81,

          elevationGainM:
            1500,

          elevationDisplay:
            "~1,500 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            21.1,

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
          "bike profile",
          "run profile",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Challenge Sanremo",

        url:
          "https://challenge-sanremo.com/news/2026-iscrizioni-aperte/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "bike elevation",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "Challenge Sanremo",

        url:
          "https://challenge-sanremo.com/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
        ],
      },
    ],
  },


  // ======================================================
  // CHALLENGE VIEUX BOUCAU
  // ======================================================

  {
    slug:
      "challenge-vieux-boucau",

    name:
      "Challenge Vieux Boucau",

    shortName:
      "Challenge Vieux Boucau",

    location:
      "Vieux-Boucau-les-Bains, France",

    country:
      "France",

    countryCode:
      "FR",

    series:
      "Challenge",

    format:
      "70.3",

    emoji:
      "🇫🇷",

    characteristics: [
      "Sheltered marine-lake swim",
      "Salt-water swim without waves or current",
      "Fast flat bike",
      "Landes forest roads",
      "Flat fast run",
      "Coastal wind exposure",
      "PB-friendly middle distance",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current 2026 race date, distances and fast-flat course character verified from Challenge Family and the race organizer.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.9,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            90,

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            21.1,

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
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-10-10",

        swim: {
          distanceKm:
            1.9,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            90,

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            21.1,

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
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Challenge Family · Vieux Boucau",

        url:
          "https://www.challenge-family.com/challenge-family/races/challenge-vieux-boucau/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "Challenge Vieux Boucau",

        url:
          "https://challenge-vieuxboucau.com/races/middle-distance/?lang=en",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "course character",
        ],
      },
    ],
  },
];
