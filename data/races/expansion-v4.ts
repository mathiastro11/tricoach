import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V4:
  RaceImportRecord[] = [

  {
    slug:
      "ironman-tallinn",

    name:
      "IRONMAN Tallinn",

    shortName:
      "IRONMAN Tallinn",

    location:
      "Tallinn, Estonia",

    country:
      "Estonia",

    countryCode:
      "EE",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇪🇪",

    characteristics: [
      "Baltic Sea swim",
      "Fast flat bike",
      "Fast flat run",
      "570 m bike climbing",
      "40 m run climbing",
      "Wind exposure",
      "PB-friendly long course",
    ],

    dataQuality:
      "Verified",

    notes:
      "TriCoach verified race profile from current IRONMAN Tallinn course information.",

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
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            570,

          elevationDisplay:
            "570 m",

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            40,

          elevationDisplay:
            "40 m",

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
          "2026-08-22",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",

          expectedWaterTempC:
            18,
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            570,

          elevationDisplay:
            "570 m",

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            40,

          elevationDisplay:
            "40 m",

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
          "IRONMAN Tallinn",

        url:
          "https://www.ironman.com/races/im-tallinn/course",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
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
  },


  {
    slug:
      "ironman-703-tallinn",

    name:
      "IRONMAN 70.3 Tallinn",

    shortName:
      "70.3 Tallinn",

    location:
      "Tallinn, Estonia",

    country:
      "Estonia",

    countryCode:
      "EE",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇪🇪",

    characteristics: [
      "Baltic Sea swim",
      "Fast flat bike",
      "Fast flat run",
      "308 m bike climbing",
      "20 m run climbing",
      "PB-friendly middle distance",
    ],

    dataQuality:
      "Verified",

    notes:
      "TriCoach verified race profile from current IRONMAN 70.3 Tallinn course information.",

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
        },

        bike: {
          distanceKm:
            90,

          elevationGainM:
            308,

          elevationDisplay:
            "308 m",

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            21.1,

          elevationGainM:
            20,

          elevationDisplay:
            "20 m",

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
          "2026-08-23",

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",

          expectedWaterTempC:
            18,
        },

        bike: {
          distanceKm:
            90,

          elevationGainM:
            308,

          elevationDisplay:
            "308 m",

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            21.1,

          elevationGainM:
            20,

          elevationDisplay:
            "20 m",

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
          "IRONMAN 70.3 Tallinn",

        url:
          "https://www.ironman.com/races/im703-tallinn/course",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
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
  },


  {
    slug:
      "ironman-copenhagen",

    name:
      "IRONMAN Copenhagen",

    shortName:
      "IRONMAN Copenhagen",

    location:
      "Copenhagen, Denmark",

    country:
      "Denmark",

    countryCode:
      "DK",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇩🇰",

    characteristics: [
      "Protected sea-lagoon swim",
      "Rolling bike",
      "Fast city marathon",
      "Approximately 1,100 m bike climbing",
      "Aero-position durability",
      "PB-friendly long course",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current course identity and profile verified from IRONMAN; bike elevation uses an official IRONMAN Copenhagen athlete guide.",

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
            19,
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            1100,

          elevationDisplay:
            "~1,100 m",

          profile:
            "Rolling",

          technicality:
            "Low",
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
          "water temperature",
          "bike elevation",
          "bike profile",
          "run profile",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-08-16",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",

          expectedWaterTempC:
            19,
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            1100,

          elevationDisplay:
            "~1,100 m",

          profile:
            "Rolling",

          technicality:
            "Low",
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
          "water temperature",
          "bike elevation",
          "bike profile",
          "run profile",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN Copenhagen",

        url:
          "https://www.ironman.com/races/im-copenhagen/course",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
        ],
      },

      {
        name:
          "IRONMAN Copenhagen Athlete Guide",

        url:
          "https://www.ironman.com/sites/default/files/2024-11/im_copenhagen_athlete_guide_english_2024.pdf",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "bike elevation",
        ],
      },
    ],
  },


  {
    slug:
      "ironman-kalmar",

    name:
      "IRONMAN Kalmar-Sweden",

    shortName:
      "IRONMAN Kalmar",

    location:
      "Kalmar, Sweden",

    country:
      "Sweden",

    countryCode:
      "SE",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇸🇪",

    characteristics: [
      "Baltic Sea swim",
      "180.2 km bike",
      "Flat bike course",
      "Flat run",
      "Öland bridge",
      "Wind exposure",
      "Approximately 484 m bike climbing",
      "Approximately 144 m run climbing",
    ],

    dataQuality:
      "Partial",

    notes:
      "Race identity, date, distances and course profile are official. Elevation values are high-confidence GPX-derived secondary data and therefore remain Partial.",

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
            19,
        },

        bike: {
          distanceKm:
            180.2,

          elevationGainM:
            484,

          elevationDisplay:
            "~484 m",

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            144,

          elevationDisplay:
            "~144 m",

          profile:
            "Flat",

          surface:
            "Road",
        },

        dataQuality:
          "Partial",

        verifiedFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
        ],

        dataWarning:
          "Bike and run elevation are GPX-derived secondary values rather than organizer-published totals.",
      },

      {
        year:
          2026,

        date:
          "2026-08-15",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",

          expectedWaterTempC:
            19,
        },

        bike: {
          distanceKm:
            180.2,

          elevationGainM:
            484,

          elevationDisplay:
            "~484 m",

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            144,

          elevationDisplay:
            "~144 m",

          profile:
            "Flat",

          surface:
            "Road",
        },

        dataQuality:
          "Partial",

        verifiedFields: [
          "race_date",
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
        ],

        dataWarning:
          "Bike and run elevation are GPX-derived secondary values rather than organizer-published totals.",
      },
    ],

    sources: [
      {
        name:
          "IRONMAN Kalmar-Sweden",

        url:
          "https://www.ironman.com/races/im-kalmar/course",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
        ],
      },

      {
        name:
          "Unbroken · IRONMAN Kalmar GPX analysis",

        url:
          "https://unbrokenclub.com/race/ironman-kalmar",

        type:
          "Trusted third party",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "bike elevation",
          "run elevation",
        ],
      },
    ],
  },
];
