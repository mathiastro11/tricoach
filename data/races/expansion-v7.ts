import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V7:
  RaceImportRecord[] = [

  // ======================================================
  // NORSEMAN
  // ======================================================

  {
    slug:
      "norseman",

    name:
      "Norseman Xtreme Triathlon",

    shortName:
      "Norseman",

    location:
      "Eidfjord to Gaustatoppen, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "XTRI",

    format:
      "Ironman",

    emoji:
      "🇳🇴",

    characteristics: [
      "Hardangerfjord cold-water swim",
      "Point-to-point mountain course",
      "More than 3,000 m bike climbing",
      "Hardangervidda exposure",
      "Zombie Hill",
      "Mountain summit finish",
      "Approximately 1,800 m final ascent",
      "More than 5,000 m total race elevation gain",
      "Support crew required",
      "Extreme weather exposure",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current Norseman race profile verified from Norseman's own race information. Bike climbing is officially stated as more than 3,000 m rather than stored with false precision.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "Fjord",

          expectedWaterTempC:
            12,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            3000,

          elevationDisplay:
            "3,000+ m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            1800,

          elevationDisplay:
            "~1,800 m",

          profile:
            "Mountainous",

          surface:
            "Mixed",
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
          "course character",
        ],
      },

      {
        year:
          2027,

        date:
          "2027-08-07",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Fjord",

          expectedWaterTempC:
            12,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            180,

          elevationGainM:
            3000,

          elevationDisplay:
            "3,000+ m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            42.2,

          elevationGainM:
            1800,

          elevationDisplay:
            "~1,800 m",

          profile:
            "Mountainous",

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
          "Norseman Xtreme Triathlon",

        url:
          "https://www.nxtri.com/this-is-norsman",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "course distances",
          "swim environment",
          "bike elevation",
          "course character",
        ],
      },

      {
        name:
          "Norseman FAQ",

        url:
          "https://www.nxtri.com/faq",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
        ],
      },

      {
        name:
          "Norseman / Maurten race facts",

        url:
          "https://www.nxtri.com/press-releases/norsemanxmaurten",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "water temperature",
          "run elevation",
          "total elevation",
        ],
      },
    ],
  },


  // ======================================================
  // SWEDEMAN
  // ======================================================

  {
    slug:
      "swedeman",

    name:
      "Swedeman Xtreme Triathlon",

    shortName:
      "Swedeman",

    location:
      "Åre, Sweden",

    country:
      "Sweden",

    countryCode:
      "SE",

    series:
      "XTRI",

    format:
      "Ironman",

    emoji:
      "🇸🇪",

    characteristics: [
      "Cold mountain-lake swim",
      "Waterfall swim exit",
      "Approximately 13–15°C water",
      "205 km wilderness bike",
      "2,377 m bike climbing",
      "43 km mountain trail run",
      "1,700 m run climbing",
      "Åreskutan mountain finish",
      "Remote technical trails",
      "Wildlife and weather exposure",
    ],

    dataQuality:
      "Verified",

    notes:
      "2027 date and detailed race profile verified through current XTRI World Tour and Swedeman race information.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "Lake",

          expectedWaterTempC:
            14,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            205,

          elevationGainM:
            2377,

          elevationDisplay:
            "2,377 m",

          profile:
            "Mountainous",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            43,

          elevationGainM:
            1700,

          elevationDisplay:
            "1,700 m",

          profile:
            "Mountainous",

          surface:
            "Trail",
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
          "run surface",
        ],
      },

      {
        year:
          2027,

        date:
          "2027-07-10",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Lake",

          expectedWaterTempC:
            14,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            205,

          elevationGainM:
            2377,

          elevationDisplay:
            "2,377 m",

          profile:
            "Mountainous",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            43,

          elevationGainM:
            1700,

          elevationDisplay:
            "1,700 m",

          profile:
            "Mountainous",

          surface:
            "Trail",
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
          "run surface",
        ],
      },
    ],

    sources: [
      {
        name:
          "XTRI World Tour · Swedeman",

        url:
          "https://www.xtriworldtour.com/swedeman",

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
          "run surface",
        ],
      },

      {
        name:
          "Swedeman Xtreme Triathlon",

        url:
          "https://www.swextri.com/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
          "run surface",
        ],
      },
    ],
  },


  // ======================================================
  // CELTMAN
  // ======================================================

  {
    slug:
      "celtman",

    name:
      "CELTMAN! Extreme Scottish Triathlon",

    shortName:
      "CELTMAN!",

    location:
      "Torridon, Scotland",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "XTRI",

    format:
      "Ironman",

    emoji:
      "🏴",

    characteristics: [
      "Cold Atlantic-water swim",
      "3.4 km shortened extreme swim",
      "200 km Highland bike",
      "2,200 m bike climbing",
      "Single-track Highland roads",
      "42 km mountain run",
      "1,600 m run climbing",
      "Two Munro summits",
      "Technical mountain terrain",
      "Severe wind and weather exposure",
    ],

    dataQuality:
      "Verified",

    notes:
      "CELTMAN course distances and elevations verified directly from the organizer. 2027 date is from the XTRI World Tour calendar.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.4,

          environment:
            "Sea",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            200,

          elevationGainM:
            2200,

          elevationDisplay:
            "~2,200 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            42,

          elevationGainM:
            1600,

          elevationDisplay:
            "~1,600 m",

          profile:
            "Mountainous",

          surface:
            "Trail",
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
          "run surface",
          "course character",
        ],
      },

      {
        year:
          2027,

        date:
          "2027-06-12",

        swim: {
          distanceKm:
            3.4,

          environment:
            "Sea",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            200,

          elevationGainM:
            2200,

          elevationDisplay:
            "~2,200 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            42,

          elevationGainM:
            1600,

          elevationDisplay:
            "~1,600 m",

          profile:
            "Mountainous",

          surface:
            "Trail",
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
          "run surface",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "CELTMAN!",

        url:
          "https://cxtri.com/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
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
        name:
          "XTRI World Tour",

        url:
          "https://www.xtriworldtour.com/events/",

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
  // HIMALAYAN XTRI
  // Correct current organiser course
  // ======================================================

  {
    slug:
      "himalayan-xtri",

    name:
      "HimalayanXtri",

    shortName:
      "HimalayanXtri",

    location:
      "Pokhara, Nepal",

    country:
      "Nepal",

    countryCode:
      "NP",

    series:
      "XTRI",

    format:
      "Ironman",

    emoji:
      "🇳🇵",

    characteristics: [
      "World's highest extreme triathlon",
      "Night swim in Lake Phewa",
      "Approximately 20°C swim",
      "3.5 km current swim course",
      "165 km road bike",
      "3,800 m bike climbing",
      "43 km fully off-road run",
      "4,000 m highest point",
      "Thin-air mountain running",
      "Approximately 6,500 m overall elevation gain",
    ],

    dataQuality:
      "Verified",

    notes:
      "IMPORTANT V7 correction: current 2027 organizer course is 3.5 km swim, 165 km bike and 43 km run. Older XTRI directory data lists a previous 3.8/176/42.4 profile and is intentionally superseded.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.5,

          environment:
            "Lake",

          expectedWaterTempC:
            20,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            165,

          elevationGainM:
            3800,

          elevationDisplay:
            "3,800 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            43,

          profile:
            "Mountainous",

          surface:
            "Trail",
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
          "run surface",
          "highest point",
          "overall elevation",
        ],

        dataWarning:
          "Organizer states approximately 6,500 m overall race elevation gain but does not separately publish a current run-elevation total, so run elevation is intentionally left blank.",
      },

      {
        year:
          2027,

        date:
          "2027-05-08",

        swim: {
          distanceKm:
            3.5,

          environment:
            "Lake",

          expectedWaterTempC:
            20,

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            165,

          elevationGainM:
            3800,

          elevationDisplay:
            "3,800 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            43,

          profile:
            "Mountainous",

          surface:
            "Trail",
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
          "run surface",
          "highest point",
          "overall elevation",
        ],

        dataWarning:
          "Organizer states approximately 6,500 m overall race elevation gain but does not separately publish a current run-elevation total, so run elevation is intentionally left blank.",
      },
    ],

    sources: [
      {
        name:
          "HimalayanXtri",

        url:
          "https://himalxtri.com/",

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
          "bike profile",
          "run profile",
          "run surface",
          "highest point",
          "overall elevation",
        ],
      },
    ],
  },


  // ======================================================
  // CHIBCHI FISHA
  // ======================================================

  {
    slug:
      "chibchi-fisha",

    name:
      "Chibchi Fisha Xtreme Colombia",

    shortName:
      "Chibchi Fisha",

    location:
      "Lake Tota, Boyacá, Colombia",

    country:
      "Colombia",

    countryCode:
      "CO",

    series:
      "XTRI",

    format:
      "Ironman",

    emoji:
      "🇨🇴",

    characteristics: [
      "High-altitude Lake Tota swim",
      "Cold-water 3 km swim",
      "185 km Andes bike",
      "3,200 m bike climbing",
      "43 km high-altitude run",
      "2,000 m run climbing",
      "Páramo terrain",
      "Thin-air racing",
      "Remote trails",
      "Extreme weather exposure",
    ],

    dataQuality:
      "Verified",

    notes:
      "Inaugural 2027 course and elevation totals verified from both XTRI World Tour and the Colombian race organizer.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3,

          environment:
            "Lake",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            185,

          elevationGainM:
            3200,

          elevationDisplay:
            "3,200 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            43,

          elevationGainM:
            2000,

          elevationDisplay:
            "2,000 m",

          profile:
            "Mountainous",

          surface:
            "Trail",
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
          "run surface",
          "course character",
        ],
      },

      {
        year:
          2027,

        date:
          "2027-01-30",

        swim: {
          distanceKm:
            3,

          environment:
            "Lake",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            185,

          elevationGainM:
            3200,

          elevationDisplay:
            "3,200 m",

          profile:
            "Mountainous",

          technicality:
            "High",
        },

        run: {
          distanceKm:
            43,

          elevationGainM:
            2000,

          elevationDisplay:
            "2,000 m",

          profile:
            "Mountainous",

          surface:
            "Trail",
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
          "run surface",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "XTRI World Tour · Chibchi Fisha",

        url:
          "https://www.xtriworldtour.com/chibchi",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "bike elevation",
          "run elevation",
        ],
      },

      {
        name:
          "Chibchi Fisha Xtreme Colombia",

        url:
          "https://www.xtricolombia.com/courses",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "course distances",
          "swim environment",
          "bike elevation",
          "run elevation",
          "course character",
        ],
      },
    ],
  },
];
