import type {
  RaceImportRecord,
  RaceImportSource,
} from "@/lib/race-ingestion";

import type {
  RaceDataQuality,
} from "@/lib/race-catalog";


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

  date:
    string;

  dataQuality:
    RaceDataQuality;

  characteristics:
    string[];

  notes:
    string;

  profile?: Course;

  profileDataQuality?:
    RaceDataQuality;

  profileVerifiedFields?:
    string[];

  profileWarning?:
    string;

  sources:
    RaceImportSource[];
};


const VERIFIED_AT =
  "2026-09-01";


const RACES:
  Seed[] = [

  // ======================================================
  // IRONMAN COPENHAGEN
  // ======================================================

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

    date:
      "2027-08-22",

    dataQuality:
      "Verified",

    characteristics: [
      "Protected Amager lagoon swim",
      "Rolling North Zealand bike",
      "Fast Copenhagen city marathon",
      "Coastal wind exposure",
      "Aero-position durability",
      "Major spectator support",
      "Long-course fueling",
    ],

    notes:
      "2027 race date verified through VisitCopenhagen. Current reusable course profile remains separate so TriCoach does not assume the final 2027 course is unchanged.",

    sources: [
      {
        name:
          "VisitCopenhagen",

        url:
          "https://www.visitdenmark.com/denmark/plan-your-trip/ironman-copenhagen-gdk1089058",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
          "location",
        ],
      },

      {
        name:
          "IRONMAN Copenhagen",

        url:
          "https://www.ironman.com/races/im-copenhagen/course",

        type:
          "Official",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN KALMAR
  // ======================================================

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

    date:
      "2027-08-21",

    dataQuality:
      "Partial",

    characteristics: [
      "Baltic Sea swim",
      "Flat bike course",
      "Öland bridge",
      "Wind exposure",
      "Flat run",
      "Fast long-course racing",
      "Large spectator support",
    ],

    notes:
      "2027 date and core course identity are verified. Existing elevation values remain Partial because they are GPX-derived secondary data rather than organizer-published totals.",

    sources: [
      {
        name:
          "Destination Kalmar",

        url:
          "https://www.mynewsdesk.com/se/destinationkalmar/pressreleases/ironman-kalmar-2027-aer-utsaalt-3461843",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "race identity",
        ],
      },

      {
        name:
          "IRONMAN Kalmar-Sweden",

        url:
          "https://www.ironman.com/races/im-kalmar/course",

        type:
          "Official",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
          "water temperature",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN FRANKFURT
  // ======================================================

  {
    slug:
      "ironman-frankfurt",

    name:
      "Mainova IRONMAN Frankfurt European Championship",

    shortName:
      "IRONMAN Frankfurt",

    location:
      "Frankfurt, Germany",

    country:
      "Germany",

    countryCode:
      "DE",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇩🇪",

    date:
      "2027-06-27",

    dataQuality:
      "Verified",

    characteristics: [
      "Langener Waldsee lake swim",
      "Rolling two-loop bike",
      "Flat city marathon",
      "Summer heat exposure",
      "High spectator density",
      "European Championship",
      "Long-course fueling",
    ],

    notes:
      "2027 date verified from a Frankfurt event venue listing. Current course profile verified from IRONMAN.",

    profile: {
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
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "bike profile",
      "run profile",
      "run surface",
      "course character",
    ],

    sources: [
      {
        name:
          "Neue Stadthalle Langen",

        url:
          "https://www.neue-stadthalle-langen.de/event/mainova-ironman-european-championship-2027/",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
        ],
      },

      {
        name:
          "IRONMAN Frankfurt",

        url:
          "https://www.ironman.com/races/im-frankfurt/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN HAMBURG
  // ======================================================

  {
    slug:
      "ironman-hamburg",

    name:
      "IRONMAN Hamburg European Championship",

    shortName:
      "IRONMAN Hamburg",

    location:
      "Hamburg, Germany",

    country:
      "Germany",

    countryCode:
      "DE",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇩🇪",

    date:
      "2027-06-06",

    dataQuality:
      "Verified",

    characteristics: [
      "Alster lake swim",
      "Flat city bike",
      "Flat city run",
      "Fast long-course racing",
      "Wind exposure",
      "Urban spectator course",
      "European Championship",
    ],

    notes:
      "2027 date is supported by multiple current event listings. Current course character is verified from IRONMAN.",

    profile: {
      swim: {
        distanceKm:
          3.8,

        environment:
          "Lake",

        expectedWaterTempC:
          18,
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
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "run profile",
      "run surface",
      "course character",
    ],

    sources: [
      {
        name:
          "Runner's World Germany",

        url:
          "https://www.runnersworld.de/laufkalender/ironman-hamburg/",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "race identity",
        ],
      },

      {
        name:
          "IRONMAN Hamburg",

        url:
          "https://www.ironman.com/races/im-hamburg/course",

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
    ],
  },


  // ======================================================
  // IRONMAN 70.3 ELSINORE
  // ======================================================

  {
    slug:
      "ironman-703-elsinore",

    name:
      "IRONMAN 70.3 Elsinore",

    shortName:
      "70.3 Elsinore",

    location:
      "Helsingør, Denmark",

    country:
      "Denmark",

    countryCode:
      "DK",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇩🇰",

    date:
      "2027-06-27",

    dataQuality:
      "Verified",

    characteristics: [
      "Kronborg Castle race setting",
      "Cold coastal swim",
      "Rolling Zealand bike",
      "Approximately 450 m bike climbing",
      "Flat run",
      "Coastal wind exposure",
      "Fast Scandinavian 70.3",
    ],

    notes:
      "Bike elevation uses the published IRONMAN athlete guide total. 2027 date is independently corroborated.",

    profile: {
      swim: {
        distanceKm:
          1.9,

        environment:
          "Sea",

        wetsuitLikely:
          true,
      },

      bike: {
        distanceKm:
          90,

        elevationGainM:
          450,

        elevationDisplay:
          "~450 m",

        profile:
          "Rolling",

        technicality:
          "Moderate",
      },

      run: {
        distanceKm:
          21.1,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "bike elevation",
      "bike profile",
      "run profile",
      "run surface",
      "course character",
    ],

    sources: [
      {
        name:
          "TriSonen",

        url:
          "https://www.trisonen.no/terminliste",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Elsinore",

        url:
          "https://www.ironman.com/races/im703-elsinore/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "course character",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Elsinore Athlete Guide",

        url:
          "https://www.ironman.com/sites/default/files/2025-06/2025%20IM70.3%20Elsinore%20Athlete%20Guide-update%2009.06.pdf",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "bike elevation",
          "bike course",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 SWANSEA
  // ======================================================

  {
    slug:
      "ironman-703-swansea",

    name:
      "IRONMAN 70.3 Swansea",

    shortName:
      "70.3 Swansea",

    location:
      "Swansea, Wales",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇬🇧",

    date:
      "2027-07-11",

    dataQuality:
      "Partial",

    characteristics: [
      "Prince of Wales Dock swim",
      "Gower Peninsula bike",
      "Hilly coastal cycling",
      "Exposed coastal conditions",
      "Waterfront half marathon",
      "Welsh weather variability",
      "Scenic rural roads",
    ],

    notes:
      "2027 race date and 1.9/90/21.1 distances are verified. Exact elevation remains intentionally omitted because current secondary route analyses disagree.",

    sources: [
      {
        name:
          "Visit Swansea Bay",

        url:
          "https://www.visitswanseabay.com/summer-sport/ironman/",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 MALLORCA
  // ======================================================

  {
    slug:
      "ironman-703-mallorca",

    name:
      "Zafiro IRONMAN 70.3 Alcudia-Mallorca",

    shortName:
      "70.3 Mallorca",

    location:
      "Alcúdia, Mallorca, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇪🇸",

    date:
      "2027-05-08",

    dataQuality:
      "Verified",

    characteristics: [
      "Mediterranean sea swim",
      "Serra de Tramuntana bike",
      "800 m bike climbing",
      "Coll de Femenia",
      "Mountain climbing and descending",
      "Flat coastal run",
      "Large international field",
    ],

    notes:
      "2027 date is published by IRONMAN. Current course page states 800 m of positive bike elevation gain.",

    profile: {
      swim: {
        distanceKm:
          1.9,

        environment:
          "Sea",
      },

      bike: {
        distanceKm:
          90,

        elevationGainM:
          800,

        elevationDisplay:
          "800 m",

        profile:
          "Hilly",

        technicality:
          "Moderate",
      },

      run: {
        distanceKm:
          21.1,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "bike elevation",
      "bike profile",
      "run profile",
      "run surface",
      "course character",
    ],

    sources: [
      {
        name:
          "World Triathlon Corporation / IRONMAN announcement",

        url:
          "https://ebs.publicnow.com/view/C625A10B18347A797499D6057EEBB7EDD6CF68EF",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Alcúdia-Mallorca",

        url:
          "https://www.ironman.com/races/im703-mallorca/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "bike elevation",
          "bike profile",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 ZELL AM SEE
  // ======================================================

  {
    slug:
      "ironman-703-zell-am-see",

    name:
      "IRONMAN 70.3 Zell am See-Kaprun",

    shortName:
      "70.3 Zell am See",

    location:
      "Zell am See, Austria",

    country:
      "Austria",

    countryCode:
      "AT",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇦🇹",

    date:
      "2027-08-29",

    dataQuality:
      "Verified",

    characteristics: [
      "Alpine lake swim",
      "870 m bike climbing",
      "Filzen Saddle",
      "Long alpine climb",
      "Fast mountain descent",
      "Flat lakeside run",
      "Mountain weather variability",
    ],

    notes:
      "2027 date, course distances and 870 m bike elevation are published by the Zell am See-Kaprun destination authority.",

    profile: {
      swim: {
        distanceKm:
          1.9,

        environment:
          "Lake",
      },

      bike: {
        distanceKm:
          90,

        elevationGainM:
          870,

        elevationDisplay:
          "870 m",

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
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "bike elevation",
      "bike profile",
      "bike technicality",
      "run profile",
      "run surface",
      "course character",
    ],

    sources: [
      {
        name:
          "Zell am See-Kaprun",

        url:
          "https://www.zellamsee-kaprun.com/en/events/ironman",

        type:
          "Trusted third party",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
          "bike elevation",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // SWISSMAN
  // ======================================================

  {
    slug:
      "swissman",

    name:
      "SWISSMAN Xtreme Triathlon",

    shortName:
      "SWISSMAN",

    location:
      "Switzerland",

    country:
      "Switzerland",

    countryCode:
      "CH",

    series:
      "XTRI",

    format:
      "Ironman",

    emoji:
      "🇨🇭",

    date:
      "2027-06-26",

    dataQuality:
      "Verified",

    characteristics: [
      "Three Alpine passes",
      "Extreme bike elevation",
      "Mountain marathon",
      "Mountain finish",
      "Support-team logistics",
      "Long-course fueling",
      "Extreme weather exposure",
    ],

    notes:
      "2027 date verified directly from SWISSMAN. Existing reusable extreme-course profile is preserved separately.",

    sources: [
      {
        name:
          "SWISSMAN",

        url:
          "https://suixtri.com/",

        type:
          "Organizer",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "race identity",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // OSLO TRIATLON
  // ======================================================

  {
    slug:
      "oslo-triatlon",

    name:
      "Oslo Triatlon",

    shortName:
      "Oslo Triatlon",

    location:
      "Sognsvann, Oslo, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇳🇴",

    date:
      "2027-08-14",

    dataQuality:
      "Verified",

    characteristics: [
      "Sognsvann lake swim",
      "Maridalen bike course",
      "Two-lap Olympic bike",
      "Sognsvann run",
      "Norway's historic city triathlon",
      "Large recreational field",
    ],

    notes:
      "2027 date verified directly from Oslo Triatlon. Olympic distances remain 1.5 km swim, 40 km bike and 10 km run.",

    profile: {
      swim: {
        distanceKm:
          1.5,

        environment:
          "Lake",
      },

      bike: {
        distanceKm:
          40,
      },

      run: {
        distanceKm:
          10,

        surface:
          "Mixed",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "run surface",
      "course character",
    ],

    sources: [
      {
        name:
          "Oslo Triatlon",

        url:
          "https://oslotri.com/",

        type:
          "Organizer",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },

      {
        name:
          "Oslo Triatlon Olympic",

        url:
          "https://oslotri.com/olympisk/",

        type:
          "Organizer",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "bike course",
          "run course",
        ],
      },
    ],
  },


  // ======================================================
  // SUPERTRI TORONTO OLYMPIC
  // ======================================================

  {
    slug:
      "supertri-toronto-olympic",

    name:
      "Supertri Toronto Olympic",

    shortName:
      "Toronto Triathlon",

    location:
      "Toronto, Ontario, Canada",

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

    date:
      "2027-07-25",

    dataQuality:
      "Verified",

    characteristics: [
      "Lake Ontario swim",
      "Ontario Place start",
      "Closed expressway bike",
      "Downtown Toronto racing",
      "Olympic-distance city event",
      "Large age-group field",
      "World Championship qualification",
    ],

    notes:
      "2027 Olympic date and 1.5/40/10 distances verified directly from Supertri Toronto.",

    sources: [
      {
        name:
          "Supertri Toronto Olympic",

        url:
          "https://supertri.com/toronto-triathlon/olympic/",

        type:
          "Organizer",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
          "swim environment",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // VANCOUVER T100 OLYMPIC
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

    date:
      "2027-08-14",

    dataQuality:
      "Verified",

    characteristics: [
      "Pacific Ocean swim",
      "Locarno Beach",
      "UBC bike circuit",
      "Rolling bike course",
      "Packed-gravel run",
      "Cold-water wetsuit racing",
      "Ocean and mountain views",
    ],

    notes:
      "2027 Olympic race date and 1.5/40/10 distances verified directly from Vancouver T100.",

    sources: [
      {
        name:
          "Vancouver T100",

        url:
          "https://t100triathlon.com/vancouver/participate/",

        type:
          "Organizer",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
          "race format",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 VITORIA-GASTEIZ
  // ======================================================

  {
    slug:
      "ironman-703-vitoria-gasteiz",

    name:
      "IRONMAN 70.3 Vitoria-Gasteiz",

    shortName:
      "70.3 Vitoria-Gasteiz",

    location:
      "Vitoria-Gasteiz, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇪🇸",

    date:
      "2027-07-11",

    dataQuality:
      "Verified",

    characteristics: [
      "Ullíbarri-Gamboa lake swim",
      "Rolling Basque bike",
      "Approximately 500 m bike climbing",
      "Flat city run",
      "Approximately 240 m run elevation",
      "Fast course",
      "Strong spectator support",
    ],

    notes:
      "Current IRONMAN course page publishes approximately 500 m bike elevation and 240 m run elevation. 2027 date is independently corroborated.",

    profile: {
      swim: {
        distanceKm:
          1.9,

        environment:
          "Lake",

        expectedWaterTempC:
          21,
      },

      bike: {
        distanceKm:
          90,

        elevationGainM:
          500,

        elevationDisplay:
          "~500 m",

        profile:
          "Rolling",

        technicality:
          "Moderate",
      },

      run: {
        distanceKm:
          21.1,

        elevationGainM:
          240,

        elevationDisplay:
          "~240 m",

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "water temperature",
      "bike elevation",
      "bike profile",
      "run elevation",
      "run profile",
      "run surface",
      "course character",
    ],

    sources: [
      {
        name:
          "France Bike Rentals IRONMAN calendar",

        url:
          "https://www.francebikerentals.com/ironman/",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Vitoria-Gasteiz",

        url:
          "https://www.ironman.com/races/im703-vitoria/course",

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
          "bike elevation",
          "bike profile",
          "run elevation",
          "run profile",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 VALENCIA
  // ======================================================

  {
    slug:
      "ironman-703-valencia",

    name:
      "IRONMAN 70.3 Valencia",

    shortName:
      "70.3 Valencia",

    location:
      "Valencia, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇪🇸",

    date:
      "2027-04-18",

    dataQuality:
      "Verified",

    characteristics: [
      "Mediterranean sea swim",
      "Malvarrosa Beach",
      "Rolling Sierra Calderona bike",
      "Fast city sections",
      "Flat Turia Gardens run",
      "Early-season European racing",
    ],

    notes:
      "2027 race date is published in an IRONMAN registration announcement. Current course profile is verified directly from IRONMAN.",

    profile: {
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
          "Rolling",

        technicality:
          "Moderate",
      },

      run: {
        distanceKm:
          21.1,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "bike profile",
      "run profile",
      "run surface",
      "course character",
    ],

    sources: [
      {
        name:
          "World Triathlon Corporation / IRONMAN announcement",

        url:
          "https://ebs.publicnow.com/view/C625A10B18347A797499D6057EEBB7EDD6CF68EF",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Valencia",

        url:
          "https://www.ironman.com/races/im703-valencia/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
          "course character",
        ],
      },
    ],
  },
];


export const RACE_EXPANSION_V12:
  RaceImportRecord[] =
    RACES.map(
      (race) => {

        const editions:
          RaceImportRecord["editions"] =
          [];


        if (race.profile) {

          editions.push({
            year:
              0,

            ...race.profile,

            dataQuality:
              race.profileDataQuality ??
              race.dataQuality,

            verifiedFields:
              race.profileVerifiedFields ??
              [],
            
            dataWarning:
              race.profileWarning,
          });
        }


        editions.push({
          year:
            2027,

          date:
            race.date,

          dataQuality:
            "Verified",

          verifiedFields: [
            "race_date",
          ],
        });


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
            race.dataQuality,

          notes:
            race.notes,

          editions,

          sources:
            race.sources,
        };
      }
    );
