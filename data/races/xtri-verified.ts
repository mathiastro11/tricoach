import type {
  XtriRaceSnapshot,
} from "@/lib/race-providers/xtri";


/*
  TriCoach XTRI verified snapshot.

  IMPORTANT:
  - Only store facts supported by the source.
  - Unknown environment/profile/technicality is omitted.
  - No future date is invented.
  - verifiedAt = date TriCoach checked the source.
*/

export const XTRI_VERIFIED_RACES:
  XtriRaceSnapshot[] = [

  {
    slug: "swissman",

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

    status:
      "Official",

    swim: {
      distanceKm: 3.8,
    },

    bike: {
      distanceKm: 181,
      elevationGainM: 3146,
      elevationDisplay:
        "3,146 m",
      profile:
        "Mountainous",
    },

    run: {
      distanceKm: 42,
      elevationGainM: 1980,
      elevationDisplay:
        "1,980 m",
      profile:
        "Mountainous",
    },

    characteristics: [
      "Three mountain passes",
      "Mountain finish",
      "Support-team logistics",
      "Extreme elevation",
      "Long-course fueling",
    ],

    emoji:
      "🇨🇭",

    sourceUrl:
      "https://www.xtriworldtour.com/swissman",

    verifiedAt:
      "2026-08-17",
  },


  {
    slug:
      "canadaman",

    name:
      "CANADAMAN Xtreme Triathlon",

    shortName:
      "CANADAMAN",

    location:
      "Quebec, Canada",

    country:
      "Canada",

    countryCode:
      "CA",

    /*
      XTRI currently states that
      CANADAMAN returns in 2027,
      without publishing an exact
      date on the World Tour page.
    */

    year:
      2027,

    status:
      "Official",

    swim: {
      distanceKm: 4,
    },

    bike: {
      distanceKm: 180,
      elevationGainM: 2500,
      elevationDisplay:
        "2,500 m",
      profile:
        "Mountainous",
    },

    run: {
      distanceKm: 42,
      elevationGainM: 1200,
      elevationDisplay:
        "1,200 m",
      profile:
        "Mountainous",
    },

    characteristics: [
      "Remote terrain",
      "Limited assistance",
      "Support-team logistics",
      "Mountainous bike",
      "Mountain run",
      "Extreme-course durability",
    ],

    emoji:
      "🇨🇦",

    sourceUrl:
      "https://www.xtriworldtour.com/canadaman",

    verifiedAt:
      "2026-08-17",
  },


  {
    slug:
      "icon-xtri",

    name:
      "ICON Livigno Xtreme Triathlon",

    shortName:
      "ICON",

    location:
      "Livigno, Italy",

    country:
      "Italy",

    countryCode:
      "IT",

    date:
      "2026-09-04",

    year:
      2026,

    status:
      "Official",

    swim: {
      distanceKm: 3.8,
    },

    bike: {
      distanceKm: 195,
      elevationGainM: 5000,
      elevationDisplay:
        "5,000 m",
      profile:
        "Mountainous",
    },

    run: {
      distanceKm: 42.2,
      elevationGainM: 1500,
      elevationDisplay:
        "1,500 m",
      profile:
        "Mountainous",
    },

    characteristics: [
      "High-altitude racing",
      "Extreme bike climbing",
      "Mountain passes",
      "Finish at 3,000 m",
      "Support-team logistics",
      "Altitude adaptation",
    ],

    emoji:
      "🇮🇹",

    sourceUrl:
      "https://www.xtriworldtour.com/icon",

    verifiedAt:
      "2026-08-17",
  },


  {
    slug:
      "formosa-xtri",

    name:
      "FORMOSA Xtreme Triathlon",

    shortName:
      "FORMOSA",

    location:
      "Taiwan",

    country:
      "Taiwan",

    countryCode:
      "TW",

    date:
      "2026-11-13",

    year:
      2026,

    status:
      "Official",

    swim: {
      distanceKm: 3.8,
      environment:
        "River",
    },

    bike: {
      distanceKm: 180,
      elevationGainM: 4696,
      elevationDisplay:
        "4,696 m",
      profile:
        "Mountainous",
    },

    run: {
      distanceKm: 43.4,
      elevationGainM: 2144,
      elevationDisplay:
        "2,144 m",
      profile:
        "Mountainous",
      surface:
        "Trail",
    },

    characteristics: [
      "Cold river swim",
      "Extreme bike climbing",
      "High altitude",
      "Mountain trail run",
      "Altitude adaptation",
      "Extreme-course durability",
    ],

    emoji:
      "🇹🇼",

    sourceUrl:
      "https://www.xtriworldtour.com/formosa",

    verifiedAt:
      "2026-08-17",
  },


  {
    slug:
      "fodaxman",

    name:
      "FODAXMAN Xtreme Triathlon",

    shortName:
      "FODAXMAN",

    location:
      "Santa Catarina, Brazil",

    country:
      "Brazil",

    countryCode:
      "BR",

    date:
      "2026-12-12",

    year:
      2026,

    status:
      "Official",

    swim: {
      distanceKm: 3.8,
    },

    bike: {
      distanceKm: 180,
      elevationGainM: 3600,
      elevationDisplay:
        "3,600 m",
      profile:
        "Mountainous",
    },

    run: {
      distanceKm: 42,
      elevationGainM: 1200,
      elevationDisplay:
        "1,200 m",
      profile:
        "Mountainous",
    },

    characteristics: [
      "Night swim",
      "Extreme climbing",
      "Serra do Rio do Rastro",
      "Mountain finish",
      "Long-course fueling",
      "Extreme-course durability",
    ],

    emoji:
      "🇧🇷",

    sourceUrl:
      "https://www.xtriworldtour.com/fodaxman",

    verifiedAt:
      "2026-08-17",
  },


  {
    slug:
      "janosik-xtri",

    name:
      "Jánošík Xtreme Triathlon",

    shortName:
      "Jánošík",

    location:
      "Slovakia",

    country:
      "Slovakia",

    countryCode:
      "SK",

    date:
      "2026-09-05",

    year:
      2026,

    status:
      "Official",

    swim: {
      distanceKm: 3.8,
    },

    bike: {
      distanceKm: 185,
      elevationGainM: 2600,
      elevationDisplay:
        "2,600 m",
      profile:
        "Mountainous",
    },

    run: {
      distanceKm: 42,
      elevationGainM: 3200,
      elevationDisplay:
        "3,200 m",
      profile:
        "Mountainous",
      surface:
        "Trail",
    },

    characteristics: [
      "Midnight swim",
      "Eight major bike climbs",
      "12–17% gradients",
      "Extreme mountain run",
      "Very high run elevation",
      "Support-team logistics",
      "Extreme-course durability",
    ],

    emoji:
      "🇸🇰",

    sourceUrl:
      "https://www.xtriworldtour.com/janosik",

    verifiedAt:
      "2026-08-17",
  },


  {
    slug:
      "blacklake-xtri",

    name:
      "Blacklake Xtreme Triathlon",

    shortName:
      "Blacklake",

    location:
      "Montenegro",

    country:
      "Montenegro",

    countryCode:
      "ME",

    date:
      "2026-09-12",

    year:
      2026,

    status:
      "Official",

    swim: {
      distanceKm: 3.8,
    },

    bike: {
      distanceKm: 180,
      elevationGainM: 2439,
      elevationDisplay:
        "2,439 m",
      profile:
        "Mountainous",
    },

    run: {
      distanceKm: 42.2,
      elevationGainM: 862,
      elevationDisplay:
        "862 m",
      profile:
        "Mountainous",
      surface:
        "Trail",
    },

    characteristics: [
      "Mountain lake setting",
      "Mountainous bike",
      "Trail run",
      "Remote terrain",
      "Support-team logistics",
      "Extreme-course durability",
    ],

    emoji:
      "🇲🇪",

    sourceUrl:
      "https://www.xtriworldtour.com/blacklake",

    verifiedAt:
      "2026-08-17",
  },


  {
    slug:
      "greek-hero-xtri",

    name:
      "Greek Hero Xtreme Triathlon",

    shortName:
      "Greek Hero",

    location:
      "Corfu, Greece",

    country:
      "Greece",

    countryCode:
      "GR",

    date:
      "2026-10-10",

    year:
      2026,

    status:
      "Official",

    swim: {
      /*
        XTRI's structured course line says 3.8 km.
        The descriptive text below says 4 km.

        TriCoach stores 3.8 km and preserves
        the source rather than inventing a value.
      */
      distanceKm: 3.8,

      environment:
        "Sea",

      expectedWaterTempC:
        15,
    },

    bike: {
      distanceKm: 175,
      elevationGainM: 3340,
      elevationDisplay:
        "3,340 m",
      profile:
        "Mountainous",
    },

    run: {
      distanceKm: 40,
      elevationGainM: 1900,
      elevationDisplay:
        "1,900 m",
      profile:
        "Mountainous",
      surface:
        "Trail",
    },

    characteristics: [
      "Ionian Sea swim",
      "Highly variable weather",
      "Mountainous island bike",
      "Technical terrain",
      "Mountain-top finish",
      "Heat and cold variability",
      "Extreme-course durability",
    ],

    emoji:
      "🇬🇷",

    sourceUrl:
      "https://www.xtriworldtour.com/greek-hero",

    verifiedAt:
      "2026-08-17",
  },


  {
    slug:
      "australian-alpine-ascent",

    name:
      "Australian Alpine Ascent XTRI",

    shortName:
      "Australian Alpine Ascent",

    location:
      "Snowy Mountains, Australia",

    country:
      "Australia",

    countryCode:
      "AU",

    /*
      XTRI currently lists:
      TBC 2027.

      Therefore no exact race date
      is stored.
    */

    year:
      2027,

    status:
      "Official",

    swim: {
      distanceKm: 3.8,
      expectedWaterTempC: 13.5,
      wetsuitLikely: true,
    },

    bike: {
      distanceKm: 187,
      elevationGainM: 3851,
      elevationDisplay:
        "3,851 m",
      profile:
        "Mountainous",
    },

    run: {
      distanceKm: 44,
      elevationGainM: 818,
      elevationDisplay:
        "818 m",
      profile:
        "Mountainous",
    },

    characteristics: [
      "Cold-water swim",
      "Australian Alps",
      "Major bike climbing",
      "Rugged terrain",
      "Mountain run",
      "Extreme-course durability",
    ],

    emoji:
      "🇦🇺",

    sourceUrl:
      "https://www.xtriworldtour.com/aaa",

    verifiedAt:
      "2026-08-17",
  },
];
