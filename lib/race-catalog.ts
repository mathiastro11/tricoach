import type {
  TargetRace,
} from "@/types/training";


export type RaceDataQuality =
  | "Verified"
  | "Partial";


export type RaceSeries =
  | "XTRI"
  | "IRONMAN"
  | "Challenge"
  | "Independent";


export type RaceCatalogEntry = {
  id: string;

  name: string;
  shortName: string;

  location: string;
  country: string;
  countryCode: string;

  format:
    TargetRace["format"];

  series:
    RaceSeries;

  editions: {
    date: string;
  }[];

  swim: TargetRace["swim"];
  bike: TargetRace["bike"];
  run: TargetRace["run"];

  characteristics: string[];

  emoji: string;

  dataQuality:
    RaceDataQuality;

  /*
    Fields that have been checked against
    official / authoritative race information.
  */
  verifiedFields?: string[];

  /*
    Shown when some course information is
    intentionally missing or only partially known.
  */
  dataWarning?: string;

  /*
    Short provenance note.

    Later this should become structured
    source metadata in the database.
  */
  dataNote?: string;
};


export const RACE_CATALOG:
  RaceCatalogEntry[] = [

  // ======================================================
  // NORSEMAN
  // ======================================================

  {
    id: "norseman",

    name:
      "Norseman Xtreme Triathlon",

    shortName:
      "Norseman",

    location:
      "Eidfjord → Gausta, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    format:
      "Ironman",

    series:
      "XTRI",

    editions: [
      {
        date:
          "2027-08-07",
      },
    ],

    swim: {
      distanceKm:
        3.8,

      environment:
        "Fjord",

      wetsuitLikely:
        true,
    },

    bike: {
      distanceKm:
        180,

      /*
        Norseman itself describes
        the bike as more than
        3,000 m of climbing.

        We use 3000 as the numeric
        lower-bound signal and
        preserve the '+' in display.
      */
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

      /*
        Official XTRI data lists
        approximately 1,800 m for
        the run course.

        Norseman describes the final
        ~17 km as the major climb
        from Rjukan toward Gausta.
      */
      elevationGainM:
        1800,

      elevationDisplay:
        "~1,800 m",

      profile:
        "Mountainous",

      surface:
        "Mixed",
    },

    characteristics: [
      "Cold-water fjord swim",
      "3,000+ m bike climbing",
      "5,000+ m total elevation",
      "Long sustained climbing",
      "Technical descending",
      "Final mountain run",
      "Support-team logistics",
      "Long-course fueling",
      "Extreme weather exposure",
    ],

    emoji:
      "🇳🇴",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "format",
      "course distances",
      "course character",
    ],

    dataNote:
      "Verified from Norseman and XTRI published race information. Norseman states 3,000+ m bike climbing and 5,000+ m total elevation.",
  },


  // ======================================================
  // CHALLENGE ROTH
  // ======================================================

  {
    id: "challenge-roth",

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

    format:
      "Ironman",

    series:
      "Challenge",

    editions: [
      {
        date:
          "2027-07-04",
      },
    ],

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

      elevationGainM:
        null,

      profile:
        "Rolling",

      surface:
        "Road",
    },

    characteristics: [
      "Fast long-course racing",
      "Rolling bike course",
      "Solar Hill",
      "Canal swim",
      "High spectator density",
      "Long-course fueling",
    ],

    emoji:
      "🇩🇪",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "format",
      "course distances",
      "course character",
    ],

    dataNote:
      "2027 date and course distances verified from Challenge Roth. Published bike-course information states around 1,500 m elevation gain.",
  },


  // ======================================================
  // CELTMAN
  // ======================================================

  {
    id: "celtman",

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

    format:
      "Ironman",

    series:
      "XTRI",

    editions: [
      {
        date:
          "2027-06-12",
      },
    ],

    swim: {
      distanceKm:
        3.4,

      environment:
        "Sea",
    },

    bike: {
      distanceKm:
        200,

      elevationGainM:
        2200,

      elevationDisplay:
        "2,200 m",

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
        "1,600 m",

      profile:
        "Mountainous",

      surface:
        "Trail",
    },

    characteristics: [
      "Cold Atlantic swim",
      "Long 200 km bike",
      "Highland weather",
      "Mountain trail run",
      "Two Munros",
      "Technical terrain",
      "Extreme-course durability",
    ],

    emoji:
      "🏴󠁧󠁢󠁳󠁣󠁴󠁿",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "format",
      "course distances",
      "course character",
    ],

    dataNote:
      "Course data from CELTMAN / XTRI information; 2027 date from XTRI calendar.",
  },


  // ======================================================
  // SWEDEMAN
  // ======================================================

  {
    id: "swedeman",

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

    format:
      "Ironman",

    series:
      "XTRI",

    editions: [
      {
        date:
          "2027-07-03",
      },
    ],

    swim: {
      distanceKm:
        3.8,

      environment:
        "Lake",

      expectedWaterTempC:
        13,

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
        "High",
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

    characteristics: [
      "Cold-water swim",
      "205 km bike",
      "Repeated climbing",
      "Åreskutan mountain run",
      "99% trail run",
      "Extreme-course durability",
      "Variable Nordic weather",
    ],

    emoji:
      "🇸🇪",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "format",
      "course distances",
      "course character",
    ],

    dataNote:
      "2027 date, distances and elevation values verified from XTRI World Tour.",
  },


  // ======================================================
  // HIMALAYAN XTRI
  // ======================================================

  {
    id: "himalayan-xtri",

    name:
      "Himalayan XTRI",

    shortName:
      "Himalayan",

    location:
      "Nepal",

    country:
      "Nepal",

    countryCode:
      "NP",

    format:
      "Ironman",

    series:
      "XTRI",

    editions: [
      {
        date:
          "2027-05-08",
      },
    ],

    swim: {
      distanceKm:
        3.8,

      environment:
        "Lake",
    },

    bike: {
      distanceKm:
        176,

      elevationGainM:
        3600,

      elevationDisplay:
        "3,600 m",

      profile:
        "Mountainous",

      technicality:
        "High",
    },

    run: {
      distanceKm:
        42.4,

      elevationGainM:
        3000,

      elevationDisplay:
        "3,000 m",

      profile:
        "Mountainous",

      surface:
        "Trail",
    },

    characteristics: [
      "Altitude exposure",
      "Night swim",
      "3,600 m bike climbing",
      "3,000 m run climbing",
      "High-altitude run",
      "Remote terrain",
      "Extreme-course durability",
    ],

    emoji:
      "🇳🇵",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "format",
      "course distances",
      "course character",
    ],

    dataNote:
      "2027 date from XTRI calendar; race distances and discipline elevation from XTRI published course profile.",
  },


  // ======================================================
  // CHIBCHI FISHA
  // ======================================================

  {
    id: "chibchi-fisha",

    name:
      "Chibchi Fisha Xtreme Colombia",

    shortName:
      "Chibchi Fisha",

    location:
      "Lake Tota / Colombian Andes",

    country:
      "Colombia",

    countryCode:
      "CO",

    format:
      "Ironman",

    series:
      "XTRI",

    editions: [
      {
        date:
          "2027-01-30",
      },
    ],

    swim: {
      distanceKm:
        3.0,

      environment:
        "Lake",
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

    characteristics: [
      "High-altitude swim",
      "Cold water",
      "Andean altitude",
      "3,200 m bike climbing",
      "2,000 m run climbing",
      "Mountain terrain",
      "Altitude adaptation",
    ],

    emoji:
      "🇨🇴",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "format",
      "course distances",
      "course character",
    ],

    dataNote:
      "2027 date, distances and elevation values verified from XTRI World Tour.",
  },


  // ======================================================
  // IRONMAN COPENHAGEN
  // ======================================================

  {
    id:
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

    format:
      "Ironman",

    series:
      "IRONMAN",

    /*
      No future edition is inserted until
      the organizer publishes one.

      The picker can still use the verified
      course profile and let the athlete
      provide their specific race date.
    */
    editions: [],

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
        null,

      profile:
        "Rolling",

      technicality:
        "Low",
    },

    run: {
      distanceKm:
        42.2,

      elevationGainM:
        null,

      profile:
        "Rolling",

      surface:
        "Road",
    },

    characteristics: [
      "Calm lagoon swim",
      "Rolling bike course",
      "Fast city racing",
      "Urban marathon",
      "Long-course fueling",
      "Aero-position durability",
    ],

    emoji:
      "🇩🇰",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "course distances",
      "swim environment",
      "bike profile",
      "run profile",
    ],

    dataWarning:
      "Exact elevation gain is not stored because the official course page does not currently publish a verified total.",

    dataNote:
      "Course profile based on official IRONMAN Copenhagen information.",
  },


  // ======================================================
  // IRONMAN KALMAR
  // ======================================================

  {
    id:
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

    format:
      "Ironman",

    series:
      "IRONMAN",

    editions: [],

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
        null,

      profile:
        "Flat",

      technicality:
        "Low",
    },

    run: {
      distanceKm:
        42.2,

      elevationGainM:
        null,

      profile:
        "Flat",

      surface:
        "Road",
    },

    characteristics: [
      "Baltic Sea swim",
      "Flat bike course",
      "Öland bridge",
      "Wind exposure",
      "Flat run",
      "Long-course fueling",
      "Fast-course pacing",
    ],

    emoji:
      "🇸🇪",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "course distances",
      "swim environment",
      "bike profile",
      "run profile",
    ],

    dataWarning:
      "Exact elevation gain is intentionally left blank until a verified organizer figure is available.",

    dataNote:
      "Course profile based on official IRONMAN Kalmar information.",
  },


  // ======================================================
  // IRONMAN 70.3 NICE
  // ======================================================

  {
    id:
      "ironman-703-nice",

    name:
      "IRONMAN 70.3 Nice",

    shortName:
      "70.3 Nice",

    location:
      "Nice, France",

    country:
      "France",

    countryCode:
      "FR",

    format:
      "70.3",

    series:
      "IRONMAN",

    editions: [],

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
        null,

      profile:
        "Hilly",

      technicality:
        "High",
    },

    run: {
      distanceKm:
        21.1,

      elevationGainM:
        null,

      profile:
        "Flat",

      surface:
        "Road",
    },

    characteristics: [
      "Mediterranean swim",
      "Hilly bike course",
      "Col de Vence",
      "Long climbing",
      "Technical descending",
      "Flat coastal run",
      "Heat exposure",
      "70.3 fueling",
    ],

    emoji:
      "🇫🇷",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "course distances",
      "swim environment",
      "bike profile",
      "run profile",
      "major bike climb",
    ],

    dataWarning:
      "Exact total elevation is not stored until a verified organizer total is available.",

    dataNote:
      "Course profile based on official IRONMAN 70.3 Nice course information.",
  },


  // ======================================================
  // THE CHAMPIONSHIP
  // ======================================================



  // ======================================================
  // IRONMAN 70.3 DALLAS — LITTLE ELM
  // ======================================================

  {
    id:
      "ironman-703-dallas-little-elm",

    name:
      "IRONMAN 70.3 Dallas–Little Elm",

    shortName:
      "70.3 Dallas–Little Elm",

    location:
      "Little Elm, Texas, USA",

    country:
      "United States",

    countryCode:
      "US",

    format:
      "70.3",

    series:
      "IRONMAN",

    editions: [
      {
        date:
          "2027-03-14",
      },
    ],

    swim: {
      distanceKm:
        1.9,

      environment:
        "Lake",

      expectedWaterTempC:
        16,

      wetsuitLikely:
        true,
    },

    bike: {
      distanceKm:
        90.1,

      /*
        Official course information:
        approximately 1,400 feet.
        Converted to ~427 metres.
      */
      elevationGainM:
        427,

      elevationDisplay:
        "~427 m",

      profile:
        "Rolling",

      technicality:
        "Low",
    },

    run: {
      distanceKm:
        21.1,

      elevationGainM:
        null,

      profile:
        "Flat",

      surface:
        "Trail",
    },

    characteristics: [
      "Lake swim",
      "Likely wetsuit conditions",
      "Gently rolling bike",
      "Fast bike course",
      "Flat run",
      "Hard-packed gravel run",
      "70.3 fueling",
    ],

    emoji:
      "🇺🇸",

    dataQuality:
      "Verified",

    verifiedFields: [
      "race identity",
      "format",
      "course distances",
      "course character",
    ],

    dataNote:
      "2027 date from IRONMAN. Current published course information lists ~1,400 ft bike elevation and a flat hard-packed gravel run.",
  },
];


export function searchRaceCatalog(
  query: string
) {
  const normalized =
    query
      .trim()
      .toLowerCase();

  if (!normalized) {
    return RACE_CATALOG;
  }

  return RACE_CATALOG.filter(
    (race) => {

      const searchable = [
        race.name,
        race.shortName,
        race.location,
        race.country,
        race.format,
        ...race.characteristics,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(
        normalized
      );
    }
  );
}


export function catalogRaceToTargetRace(
  race: RaceCatalogEntry,
  date: string
): TargetRace {

  return {
    id:
      `${race.id}-${date}`,

    name:
      race.name,

    date,

    location:
      race.location,

    source:
      "database",

    format:
      race.format,

    swim:
      race.swim
        ? { ...race.swim }
        : undefined,

    bike:
      race.bike
        ? { ...race.bike }
        : undefined,

    run:
      race.run
        ? { ...race.run }
        : undefined,

    characteristics:
      [...race.characteristics],

    notes:
      race.dataNote,

    updatedAt:
      new Date()
        .toISOString(),
  };
}
