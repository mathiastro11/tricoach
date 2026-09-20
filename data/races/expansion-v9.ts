import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V9:
  RaceImportRecord[] = [

  // ======================================================
  // YOKOHAMA
  // ======================================================

  {
    slug:
      "world-triathlon-yokohama-standard",

    name:
      "World Triathlon Yokohama Age Group Standard",

    shortName:
      "Yokohama Triathlon",

    location:
      "Yokohama, Japan",

    country:
      "Japan",

    countryCode:
      "JP",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇯🇵",

    characteristics: [
      "Major international city triathlon",
      "Yamashita Park start and finish",
      "Age-group race alongside WTCS",
      "Sea swim",
      "Flat bike",
      "Flat run",
      "Large urban spectator event",
    ],

    dataQuality:
      "Verified",

    notes:
      "2026 age-group Standard race takes place on 17 May, one day after the elite WTCS event.",

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
          "2026-05-17",

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
          "Yokohama Triathlon",

        url:
          "https://yokohamatriathlon.jp/wts/overview/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "age-group race",
          "location",
        ],
      },

      {
        name:
          "World Triathlon Yokohama",

        url:
          "https://events.triathlon.org/2026-wtcs-yokohama",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "swim environment",
          "bike profile",
          "run profile",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // VANCOUVER T100
  // ======================================================

  {
    slug:
      "vancouver-t100-olympic",

    name:
      "Vancouver T100 Olympic Triathlon",

    shortName:
      "Vancouver T100 Olympic",

    location:
      "Vancouver, British Columbia, Canada",

    country:
      "Canada",

    countryCode:
      "CA",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇨🇦",

    characteristics: [
      "Pacific Ocean swim",
      "Locarno Beach",
      "UBC bike circuit",
      "Rolling bike course",
      "Packed-gravel run",
      "Cold-water wetsuit racing",
      "Ocean and mountain views",
      "Major T100 city event",
    ],

    dataQuality:
      "Verified",

    notes:
      "Olympic race is held Saturday 15 August 2026 within the Vancouver T100 weekend.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.5,

          environment:
            "Sea",

          expectedWaterTempC:
            16,

          wetsuitLikely:
            true,
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
            "Mixed",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run surface",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-08-15",

        swim: {
          distanceKm:
            1.5,

          environment:
            "Sea",

          expectedWaterTempC:
            16,

          wetsuitLikely:
            true,
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
            "Mixed",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run surface",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Vancouver T100",

        url:
          "https://t100triathlon.com/vancouver/participate/event-info/",

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
          "run surface",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // GRAN TRIATLON MADRID
  // ======================================================

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
      "The Standard/Olympic public race was part of the Saturday programme on the 20–21 June 2026 event weekend.",

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
          "run profile",
          "course character",
        ],
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
      },
    ],

    sources: [
      {
        name:
          "Gran Triatlón Madrid",

        url:
          "https://grantriatlonmadrid.com/clasificaciones/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "standard race",
          "sprint race",
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
          "2026-08-26",

        supportsFields: [
          "event scale",
          "swim environment",
          "run profile",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // MIAMI MAN
  // ======================================================

  {
    slug:
      "miami-man-international",

    name:
      "Miami Man International Triathlon",

    shortName:
      "Miami Man",

    location:
      "Miami, Florida, USA",

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

    characteristics: [
      "Large South Florida triathlon",
      "More than 2,000 participants in peak years",
      "Zoo Miami run course",
      "Warm-weather late-season racing",
      "International-distance option",
      "Beginner-friendly festival atmosphere",
    ],

    dataQuality:
      "Verified",

    notes:
      "Miami Man calls its primary race International distance rather than standard Olympic distance.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            0.97,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            33.8,

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            9.7,

          profile:
            "Flat",

          surface:
            "Road",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-11-15",

        swim: {
          distanceKm:
            0.97,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            33.8,

          profile:
            "Flat",

          technicality:
            "Low",
        },

        run: {
          distanceKm:
            9.7,

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
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Miami Man Triathlon",

        url:
          "https://miamimantri.com/index.php/general-info/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "participant scale",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // TRI-MIAMI
  // ======================================================

  {
    slug:
      "tri-miami-olympic",

    name:
      "Tri-Miami Olympic Triathlon",

    shortName:
      "Tri-Miami",

    location:
      "Miami, Florida, USA",

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

    characteristics: [
      "Miami coastal triathlon",
      "Olympic-distance option",
      "Shallow protected ocean channel swim",
      "Flat South Florida bike",
      "Flat run",
      "Warm humid racing",
      "Multiple race distances",
    ],

    dataQuality:
      "Verified",

    notes:
      "Tri-Miami Trilogy hosts multiple 2026 race dates. This profile stores the final 2026 Olympic race on 9 August.",

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

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-08-09",

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

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
          "course distances",
          "swim environment",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Tri-Miami",

        url:
          "https://tri-miami.com/index.php/race-course/",

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
    ],
  },
];
