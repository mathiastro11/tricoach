import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


const VERIFIED_AT =
  "2026-09-06";


export const RACE_EXPANSION_V25:
  RaceImportRecord[] = [

    // ====================================================
    // IRONMAN LAKE PLACID
    // ====================================================

    {
      slug:
        "ironman-lake-placid",

      name:
        "IRONMAN Lake Placid",

      shortName:
        "IRONMAN Lake Placid",

      location:
        "Lake Placid, New York, USA",

      country:
        "United States",

      countryCode:
        "US",

      series:
        "IRONMAN",

      format:
        "Ironman",

      emoji:
        "🇺🇸",

      characteristics: [
        "Iconic North American IRONMAN",
        "Mirror Lake swim",
        "Adirondack Mountains",
        "Hilly bike course",
        "Long climbs and fast descents",
        "Rolling marathon",
        "Olympic host town",
        "High spectator support",
        "Long-course fueling",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN describes Lake Placid as one of its iconic global races. The course uses a two-loop Mirror Lake swim, a hilly Adirondack bike and a rolling two-loop run. The organizer lists an average swim-water temperature around 24°C. The 2026 edition took place 19 July 2026; no 2027 date is stored until officially published.",

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
              24,
          },

          bike: {
            distanceKm:
              180,

            profile:
              "Hilly",

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
            "water temperature",
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
            "2026-07-19",

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
            "IRONMAN Lake Placid — Course",

          url:
            "https://www.ironman.com/races/im-lake-placid/course",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "course distances",
            "swim environment",
            "water temperature",
            "bike profile",
            "run profile",
            "course character",
          ],
        },

        {
          name:
            "IRONMAN Lake Placid",

          url:
            "https://www.ironman.com/races/im-lake-placid",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
            "race identity",
          ],
        },
      ],
    },


    // ====================================================
    // IRONMAN LANZAROTE
    // ====================================================

    {
      slug:
        "ironman-lanzarote",

      name:
        "Club La Santa IRONMAN Lanzarote",

      shortName:
        "IRONMAN Lanzarote",

      location:
        "Puerto del Carmen, Lanzarote, Spain",

      country:
        "Spain",

      countryCode:
        "ES",

      series:
        "IRONMAN",

      format:
        "Ironman",

      emoji:
        "🇪🇸",

      characteristics: [
        "One of Europe's iconic IRONMAN races",
        "Atlantic Ocean swim",
        "Volcanic landscape",
        "Hilly bike course",
        "Strong wind exposure",
        "Long sustained climbing",
        "Coastal marathon",
        "Heat and sun exposure",
        "Long-course fueling",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN Lanzarote is one of Europe's longest-running and most recognizable full-distance races. The official course is 3.8 km swim, 180.2 km bike and 42.2 km run. IRONMAN classifies the bike as hilly and the run as rolling, with typical water temperature around 19°C. The 2026 edition was 23 May 2026; no 2027 date is guessed.",

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

            profile:
              "Hilly",

            technicality:
              "High",
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
            "2026-05-23",

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
            "IRONMAN Lanzarote — Course",

          url:
            "https://www.ironman.com/races/im-lanzarote/course",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "course distances",
            "swim environment",
            "water temperature",
            "bike profile",
            "run profile",
            "course character",
          ],
        },

        {
          name:
            "IRONMAN Lanzarote",

          url:
            "https://www.ironman.com/races/im-lanzarote",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
            "race identity",
          ],
        },
      ],
    },


    // ====================================================
    // IRONMAN AUSTRIA
    // ====================================================

    {
      slug:
        "ironman-austria-kaernten",

      name:
        "IRONMAN Kärnten-Klagenfurt, Austria",

      shortName:
        "IRONMAN Austria",

      location:
        "Klagenfurt, Austria",

      country:
        "Austria",

      countryCode:
        "AT",

      series:
        "IRONMAN",

      format:
        "Ironman",

      emoji:
        "🇦🇹",

      characteristics: [
        "Historic European IRONMAN",
        "Lake Wörthersee swim",
        "Turquoise lake water",
        "Fast bike course",
        "Carinthian lake district",
        "Rolling run",
        "Large spectator support",
        "First-timer friendly full distance",
        "Long-course fueling",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN lists Kärnten-Klagenfurt as an athlete-favorite event with more than 25 years of history. The organizer classifies the swim as lake, bike as flat and run as rolling, with average water temperature around 21°C. The confirmed 2026 race date was 14 June 2026.",

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
              21,
          },

          bike: {
            distanceKm:
              180,

            profile:
              "Flat",

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
            "water temperature",
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
            "2026-06-14",

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
            "IRONMAN Kärnten-Klagenfurt, Austria",

          url:
            "https://www.ironman.com/races/im-austria",

          type:
            "Official",

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race identity",
            "course character",
            "swim environment",
            "water temperature",
            "bike profile",
            "run profile",
          ],
        },

        {
          name:
            "IRONMAN Austria — 2026",

          url:
            "https://www.ironman.com/races/im-austria",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
          ],
        },
      ],
    },


    // ====================================================
    // IRONMAN CAIRNS
    // ====================================================

    {
      slug:
        "ironman-cairns",

      name:
        "Cairns Airport IRONMAN Cairns",

      shortName:
        "IRONMAN Cairns",

      location:
        "Cairns, Queensland, Australia",

      country:
        "Australia",

      countryCode:
        "AU",

      series:
        "IRONMAN",

      format:
        "Ironman",

      emoji:
        "🇦🇺",

      characteristics: [
        "Asia-Pacific destination race",
        "Palm Cove ocean swim",
        "Great Barrier Reef coastline",
        "Captain Cook Highway",
        "Rolling coastal bike",
        "Tropical conditions",
        "Flat Cairns Esplanade marathon",
        "High spectator support",
        "Long-course fueling",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN Cairns is a major Asia-Pacific full-distance race. The official course is 3.8 km swim at Palm Cove, 180 km rolling coastal bike and 42.2 km flat run in Cairns. IRONMAN lists average water temperature near 23°C. An official IRONMAN expo listing confirms the 2027 event date as 13 June 2027.",

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
              23,
          },

          bike: {
            distanceKm:
              180,

            profile:
              "Rolling",

            technicality:
              "Moderate",
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
            "water temperature",
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
            "2027-06-13",

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
            "IRONMAN Cairns — Course",

          url:
            "https://www.ironman.com/races/im-cairns/course",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "course distances",
            "swim environment",
            "water temperature",
            "bike profile",
            "run profile",
            "run surface",
            "course character",
          ],
        },

        {
          name:
            "IRONMAN Cairns — 2027 Expo",

          url:
            "https://australiaexpo.ironman.com/ironman-cairns-asia-pacific-championship-expo",

          type:
            "Official",

          editionYear:
            2027,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
            "race identity",
          ],
        },
      ],
    },


    // ====================================================
    // IRONMAN COZUMEL
    // ====================================================

    {
      slug:
        "ironman-cozumel",

      name:
        "IRONMAN Cozumel",

      shortName:
        "IRONMAN Cozumel",

      location:
        "Cozumel, Quintana Roo, Mexico",

      country:
        "Mexico",

      countryCode:
        "MX",

      series:
        "IRONMAN",

      format:
        "Ironman",

      emoji:
        "🇲🇽",

      characteristics: [
        "Tropical island race",
        "Clear Caribbean swim",
        "Coral reef environment",
        "Very flat bike course",
        "Fast bike potential",
        "Strong coastal wind exposure",
        "Flat waterfront marathon",
        "Heat and humidity exposure",
        "Late-season racing",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN Cozumel is a major late-season destination race. IRONMAN classifies both bike and run as flat, with average water temperature around 26°C. The bike completes three laps around the island and the marathon runs through the waterfront and downtown. The 2026 edition is confirmed for 22 November 2026.",

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
              26,
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
            "water temperature",
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
            "2026-11-22",

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
            "IRONMAN Cozumel — Course",

          url:
            "https://www.ironman.com/races/im-cozumel/course",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "course distances",
            "swim environment",
            "water temperature",
            "bike profile",
            "run profile",
            "run surface",
            "course character",
          ],
        },

        {
          name:
            "IRONMAN Cozumel — 2026 Registration",

          url:
            "https://regmex1.ironman.com/event/2026-ironman-cozumel",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
            "race identity",
          ],
        },
      ],
    },


    // ====================================================
    // IRONMAN 70.3 OCEANSIDE
    // ====================================================

    {
      slug:
        "ironman-703-oceanside",

      name:
        "Athletic Brewing IRONMAN 70.3 Oceanside",

      shortName:
        "70.3 Oceanside",

      location:
        "Oceanside, California, USA",

      country:
        "United States",

      countryCode:
        "US",

      series:
        "IRONMAN",

      format:
        "70.3",

      emoji:
        "🇺🇸",

      characteristics: [
        "Iconic early-season 70.3",
        "Sheltered harbor swim",
        "Cold wetsuit swim",
        "Camp Pendleton bike course",
        "Rolling and hilly bike",
        "Pacific coast run",
        "Beach finish",
        "Strong professional field",
        "70.3 fueling",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN 70.3 Oceanside is one of North America's best-known middle-distance races. The swim is 1.9 km in Oceanside Harbor with typical April water around 17°C. The 90.1 km bike has an official published gain of 2,720 ft (~829 m), while the 21.1 km run has 277 ft (~84 m) of gain. The 2026 edition took place 28 March 2026.",

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
              17,

            wetsuitLikely:
              true,
          },

          bike: {
            distanceKm:
              90.1,

            elevationGainM:
              829,

            elevationDisplay:
              "~829 m",

            profile:
              "Hilly",

            technicality:
              "Moderate",
          },

          run: {
            distanceKm:
              21.1,

            elevationGainM:
              84,

            elevationDisplay:
              "~84 m",

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
            "wetsuit conditions",
            "bike elevation",
            "bike profile",
            "run elevation",
            "run profile",
            "run surface",
            "course character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-03-28",

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
            "IRONMAN 70.3 Oceanside — Course",

          url:
            "https://www.ironman.com/races/im703-oceanside",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race identity",
            "swim environment",
            "bike profile",
            "run profile",
            "course character",
          ],
        },

        {
          name:
            "IRONMAN 70.3 Oceanside — 2026 Athlete Guide",

          url:
            "https://www.ironman.com/sites/default/files/2026-03/2026%2070.3%20Oceanside%20Athlete%20Guide%20rs.pdf",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "course distances",
            "water temperature",
            "bike elevation",
            "run elevation",
            "course character",
          ],
        },

        {
          name:
            "IRONMAN 70.3 Oceanside — 2026 Spectator Guide",

          url:
            "https://www.ironman.com/sites/default/files/2026-03/2026%2070.3%20Oceanside%20Spectator%20Guide_0.pdf",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
            "water temperature",
          ],
        },
      ],
    },
  ];
