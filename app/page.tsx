"use client";

import {
  TRIATHLON_EXPERIENCE_OPTIONS,
  DISCIPLINE_LEVEL_OPTIONS,
  PERFORMANCE_TIER_OPTIONS,
  buildAthleteCapabilityProfile,
  resolveAthleteCapabilityProfile,
  toLegacyExperience,
  toLegacyDisciplineLevel,
} from "@/lib/athlete-capability";

import {
  formatDuration,
} from "@/lib/format-duration";

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase";

import {
  evaluateGoalChange,
} from "@/lib/goal-change";

import {
  buildInstantSeasonRoadmap,
} from "@/lib/instant-season-roadmap";

import {
  applyBenchmarkPrescriptionToPlan,
} from "@/lib/benchmark-plan-prescription";

import { buildReadinessTrend } from "@/lib/adaptive-coaching";

import SettingsModal from "@/components/SettingsModal";
import AthleteProfileView from "@/components/AthleteProfileView";
import BenchmarkModal from "@/components/BenchmarkModal";
import TargetRaceModal from "@/components/TargetRaceModal";
import RacePickerModal from "@/components/RacePickerModal";
import RaceGoalCard from "@/components/RaceGoalCard";
import WorkoutDetailsModal from "@/components/WorkoutDetailsModal";
import ReadinessModal from "@/components/ReadinessModal";
import SeasonRoadmapView from "@/components/SeasonRoadmap";
import RoadmapRevisions from "@/components/RoadmapRevisions";
import TrainingHistory from "@/components/TrainingHistory";
import NextWeekPreview from "@/components/NextWeekPreview";
import TodayView from "@/components/TodayView";
import CoachView from "@/components/CoachView";
import CoachPlanChangeModal from "@/components/CoachPlanChangeModal";
import WeekView from "@/components/WeekView";
import CalendarView from "@/components/CalendarView";
import AddSessionModal from "@/components/AddSessionModal";
import Toast, {
  type ToastType,
} from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import WorkoutFeedbackForm from "@/components/WorkoutFeedbackForm";
import AppFeedbackModal from "@/components/AppFeedbackModal";

import {
  recalculateTrainingPlanTotalHours,
  toISODate,
  getMonday,
  getISOWeekNumber,
  attachWeekDates,
  getTrainingPhaseUI,
  calculateReadiness,
} from "@/lib/training";
import { mergeCoachPlanChange } from "@/lib/merge-coach-plan";
import {
  repairPlanToResolvedAvailability,
  validatePlanAgainstResolvedAvailability,
} from "@/lib/training-availability";

import {
  workoutMatchesFeedback,
} from "@/lib/workout-feedback-match";
import type { TrainingAvailability } from "@/types/training";

import type {
  Goal,
  Discipline,
  Athlete,
  ChatMessage,
  TrainingPlanDay,
  TrainingPlan,
  WorkoutFeedback,
  ReadinessEntry,
  RoadmapRevision,
  SeasonRoadmap,
  TrainingArchiveWeek,
  WeeklyReview,
} from "@/types/training";


const starterWeek = [
  ["Mon", "Rest", "Recovery day", "—"],
  ["Tue", "Run", "Aerobic run + strides", "45 min"],
  ["Wed", "Swim", "Technique + aerobic swim", "45 min"],
  ["Thu", "Bike", "Endurance ride", "60 min"],
  ["Fri", "Strength", "Simple full-body strength", "35 min"],
  ["Sat", "Bike", "Long ride + short brick", "2 h"],
  ["Sun", "Run", "Easy long run", "70 min"],
];

const quickReplies = [
  "I only have 30 minutes today",
  "I slept badly last night",
  "I missed yesterday's workout",
];

function ensurePlanSessionIds(
  plan: TrainingPlan | null
): TrainingPlan | null {
  if (!plan) {
    return null;
  }

  const weekKey =
    plan.weekStart ??
    `week-${plan.weekNumber ?? "current"}`;

  let changed = false;

  const usedSessionIds =
    new Set<string>();

  function ensureUniqueSessionId(
    preferredId: string | undefined,
    fallbackId: string
  ) {
    if (
      preferredId &&
      !usedSessionIds.has(preferredId)
    ) {
      usedSessionIds.add(preferredId);
      return preferredId;
    }

    let candidate = fallbackId;
    let suffix = 2;

    while (
      usedSessionIds.has(candidate)
    ) {
      candidate =
        `${fallbackId}-${suffix}`;
      suffix += 1;
    }

    usedSessionIds.add(candidate);
    return candidate;
  }

  const days =
    plan.days.map(
      (workout, index) => {

        const dayKey =
          workout.date ??
          workout.day
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/g,
              "-"
            );

        const nextWorkout = {
          ...workout,

          sessionId:
            ensureUniqueSessionId(
              workout.sessionId,
              `${weekKey}-${dayKey}-primary-${index}`
            ),

          sessionSource:
            workout.sessionSource ??
            ("coach" as const),

          sessionRole:
            "primary" as const,

          sessionSlot:
            workout.sessionSlot ??
            ("Flexible" as const),
        };

        if (
          nextWorkout.sessionId !==
            workout.sessionId ||
          nextWorkout.sessionSource !==
            workout.sessionSource ||
          nextWorkout.sessionRole !==
            workout.sessionRole ||
          nextWorkout.sessionSlot !==
            workout.sessionSlot
        ) {
          changed = true;
        }

        return nextWorkout;
      }
    );


  const additionalSessions =
    (
      plan.additionalSessions ??
      []
    ).map(
      (workout, index) => {

        const dayKey =
          workout.date ??
          workout.day
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/g,
              "-"
            );

        /*
          Existing additional sessions were created
          manually, so missing source metadata must
          remain athlete-owned.
        */
        const nextWorkout = {
          ...workout,

          sessionId:
            ensureUniqueSessionId(
              workout.sessionId,
              `${weekKey}-${dayKey}-secondary-${index}`
            ),

          sessionSource:
            workout.sessionSource ??
            ("athlete" as const),

          sessionRole:
            "secondary" as const,

          sessionSlot:
            workout.sessionSlot ??
            ("Flexible" as const),
        };

        if (
          nextWorkout.sessionId !==
            workout.sessionId ||
          nextWorkout.sessionSource !==
            workout.sessionSource ||
          nextWorkout.sessionRole !==
            workout.sessionRole ||
          nextWorkout.sessionSlot !==
            workout.sessionSlot
        ) {
          changed = true;
        }

        return nextWorkout;
      }
    );


  if (!changed) {
    return plan;
  }


  return {
    ...plan,
    days,
    additionalSessions,
  };
}


function getRaceAtmosphereClass(
  targetRaceName?: string | null
) {

  const name =
    targetRaceName
      ?.toLowerCase() ??
    "";


  if (
    name.includes("norseman")
  ) {
    return "raceAtmosphereNorseman";
  }


  if (
    name.includes("swedeman")
  ) {
    return "raceAtmosphereSwedeman";
  }


  if (
    name.includes("copenhagen")
  ) {
    return "raceAtmosphereCopenhagen";
  }


  if (
    name.includes("roth")
  ) {
    return "raceAtmosphereRoth";
  }


  if (
    name.includes("celtman")
  ) {
    return "raceAtmosphereCeltman";
  }


  if (
    name.includes("himalayan")
  ) {
    return "raceAtmosphereHimalayan";
  }


  if (
    name.includes("chibchi") ||
    name.includes("fisha")
  ) {
    return "raceAtmosphereChibchi";
  }


  if (
    name.includes("kalmar")
  ) {
    return "raceAtmosphereKalmar";
  }


  if (
    name.includes("nice")
  ) {
    return "raceAtmosphereNice";
  }


  if (
    name.includes("the championship") ||
    name.includes("šamorín") ||
    name.includes("samorin")
  ) {
    return "raceAtmosphereChampionship";
  }


  if (
    name.includes("dallas") ||
    name.includes("little elm")
  ) {
    return "raceAtmosphereDallasLittleElm";
  }


  /*
    Venue-level atmosphere.

    Several race formats can share the same
    real-world location photography.
  */


  if (
    name.includes("cascais")
  ) {
    return "raceAtmosphereCascais";
  }


  if (
    name.includes("barcelona")
  ) {
    return "raceAtmosphereBarcelona";
  }


  if (
    name.includes("tallinn")
  ) {
    return "raceAtmosphereTallinn";
  }


  if (
    name.includes("oslo")
  ) {
    return "raceAtmosphereOslo";
  }


  if (
    name.includes("trondheim")
  ) {
    return "raceAtmosphereTrondheim";
  }


  if (
    name.includes("london")
  ) {
    return "raceAtmosphereLondon";
  }


  if (
    name.includes("singapore")
  ) {
    return "raceAtmosphereSingapore";
  }


  if (
    name.includes("chicago")
  ) {
    return "raceAtmosphereChicago";
  }


  if (
    name.includes("stockholm")
  ) {
    return "raceAtmosphereStockholm";
  }


  if (
    name.includes("zell am see") ||
    name.includes("zell")
  ) {
    return "raceAtmosphereZellAmSee";
  }


  if (
    name.includes("hamburg")
  ) {
    return "raceAtmosphereHamburg";
  }


  if (
    name.includes("vancouver")
  ) {
    return "raceAtmosphereVancouver";
  }


  if (
    name.includes("alcatraz") ||
    name.includes("san francisco")
  ) {
    return "raceAtmosphereSanFrancisco";
  }


  if (
    name.includes("mallorca") ||
    name.includes("alcudia") ||
    name.includes("alcúdia") ||
    name.includes("peguera")
  ) {
    return "raceAtmosphereMallorca";
  }


  if (
    name.includes("gold coast")
  ) {
    return "raceAtmosphereGoldCoast";
  }


  if (
    name.includes("blacklake")
  ) {
    return "raceAtmosphereBlacklake";
  }


  if (
    name.includes("sanremo")
  ) {
    return "raceAtmosphereSanremo";
  }


  if (
    name.includes("fodaxman")
  ) {
    return "raceAtmosphereFodaxman";
  }


  if (
    name.includes("greek hero") ||
    name.includes("corfu")
  ) {
    return "raceAtmosphereCorfu";
  }


  if (
    name.includes("ironman wales") ||
    name.includes("tenby")
  ) {
    return "raceAtmosphereTenby";
  }


  if (
    name.includes("oman")
  ) {
    return "raceAtmosphereOman";
  }


  if (
    (
      name.includes("alpe") &&
      name.includes("huez")
    ) ||
    name.includes("alpe d’huez") ||
    name.includes("alpe d'huez")
  ) {
    return "raceAtmosphereAlpeDHuez";
  }


  if (
    name.includes("phuket")
  ) {
    return "raceAtmospherePhuket";
  }


  if (
    name.includes("lake placid")
  ) {
    return "raceAtmosphereLakePlacid";
  }


  if (
    name.includes("lanzarote")
  ) {
    return "raceAtmosphereLanzarote";
  }


  if (
    name.includes("klagenfurt") ||
    name.includes("kärnten") ||
    name.includes("karnten")
  ) {
    return "raceAtmosphereKlagenfurt";
  }


  if (
    name.includes("cairns")
  ) {
    return "raceAtmosphereCairns";
  }


  if (
    name.includes("cozumel")
  ) {
    return "raceAtmosphereCozumel";
  }


  if (
    name.includes("oceanside")
  ) {
    return "raceAtmosphereOceanside";
  }


  if (
    name.includes("oregon")
  ) {
    return "raceAtmosphereOregon";
  }


  if (
    name.includes("wānaka") ||
    name.includes("wanaka")
  ) {
    return "raceAtmosphereWanaka";
  }


  if (
    name.includes("samarkand")
  ) {
    return "raceAtmosphereSamarkand";
  }


  if (
    name.includes("canberra")
  ) {
    return "raceAtmosphereCanberra";
  }


  if (
    name.includes("dubai")
  ) {
    return "raceAtmosphereDubai";
  }


  if (
    name.includes("ironman south africa") ||
    name.includes("gqeberha") ||
    name.includes("port elizabeth")
  ) {
    return "raceAtmosphereSouthAfrica";
  }


  if (
    name.includes("xiamen")
  ) {
    return "raceAtmosphereXiamen";
  }


  if (
    name.includes("florianópolis") ||
    name.includes("florianopolis")
  ) {
    return "raceAtmosphereFlorianopolis";
  }


  if (
    name.includes("ironman new zealand") ||
    name.includes("taupō") ||
    name.includes("taupo")
  ) {
    return "raceAtmosphereTaupo";
  }


  if (
    name.includes("ironman texas") ||
    name.includes("the woodlands")
  ) {
    return "raceAtmosphereTexas";
  }


  if (
    name.includes("noosa")
  ) {
    return "raceAtmosphereNoosa";
  }


  if (
    name.includes("montréal") ||
    name.includes("montreal") ||
    name.includes("esprit")
  ) {
    return "raceAtmosphereMontreal";
  }


  if (
    name.includes("boston")
  ) {
    return "raceAtmosphereBoston";
  }


  if (
    name.includes("poreč") ||
    name.includes("porec")
  ) {
    return "raceAtmospherePorec";
  }


  if (
    name.includes("frankfurt")
  ) {
    return "raceAtmosphereFrankfurt";
  }


  if (
    name.includes("valencia")
  ) {
    return "raceAtmosphereValencia";
  }


  if (
    name.includes("geneva") ||
    name.includes("genève")
  ) {
    return "raceAtmosphereGeneva";
  }


  if (
    name.includes("lausanne")
  ) {
    return "raceAtmosphereLausanne";
  }


  if (
    name.includes("agadir")
  ) {
    return "raceAtmosphereAgadir";
  }


  if (
    name.includes("livigno") ||
    name.includes("icon")
  ) {
    return "raceAtmosphereLivigno";
  }


  if (
    name.includes("formosa")
  ) {
    return "raceAtmosphereFormosa";
  }


  if (
    name.includes("almere")
  ) {
    return "raceAtmosphereAlmere";
  }


  if (
    name.includes("berlin")
  ) {
    return "raceAtmosphereBerlin";
  }


  if (
    name.includes("big apple") ||
    name.includes("new york")
  ) {
    return "raceAtmosphereNewYork";
  }


  if (
    name.includes("emilia-romagna") ||
    name.includes("emilia romagna") ||
    name.includes("cervia")
  ) {
    return "raceAtmosphereCervia";
  }


  if (
    name.includes("miami")
  ) {
    return "raceAtmosphereMiami";
  }


  if (
    name.includes("auckland")
  ) {
    return "raceAtmosphereAuckland";
  }


  if (
    name.includes("elsinore")
  ) {
    return "raceAtmosphereElsinore";
  }


  if (
    name.includes("helsinki")
  ) {
    return "raceAtmosphereHelsinki";
  }


  if (
    name.includes("hove") ||
    name.includes("arendal")
  ) {
    return "raceAtmosphereArendal";
  }


  if (
    name.includes("aix-en-provence") ||
    name.includes("aix en provence") ||
    name.includes("aix")
  ) {
    return "raceAtmosphereAix";
  }


  if (
    name.includes("vieux-boucau") ||
    name.includes("vieux boucau")
  ) {
    return "raceAtmosphereVieuxBoucau";
  }


  if (
    name.includes("jánošík") ||
    name.includes("janosik")
  ) {
    return "raceAtmosphereJanosik";
  }


  if (
    name.includes("lusail") ||
    name.includes("qatar t100") ||
    name.includes("qatar")
  ) {
    return "raceAtmosphereLusail";
  }


  if (
    name.includes("australian alpine ascent")
  ) {
    return "raceAtmosphereAustralianAlps";
  }


  if (
    name.includes("canadaman")
  ) {
    return "raceAtmosphereCanadaman";
  }


  if (
    name.includes("toronto")
  ) {
    return "raceAtmosphereToronto";
  }


  if (
    name.includes("yokohama")
  ) {
    return "raceAtmosphereYokohama";
  }


  if (
    name.includes("madrid")
  ) {
    return "raceAtmosphereMadrid";
  }


  if (
    name.includes("costa navarino") ||
    name.includes("navarino")
  ) {
    return "raceAtmosphereCostaNavarino";
  }


  if (
    name.includes("weymouth")
  ) {
    return "raceAtmosphereWeymouth";
  }


  if (
    name.includes("soon tryathlon") ||
    name.includes("soon triathlon") ||
    name.includes("son tryathlon")
  ) {
    return "raceAtmosphereSoon";
  }


  if (
    name.includes("haugesund")
  ) {
    return "raceAtmosphereHaugesund";
  }


  if (
    name.includes("jevnaker")
  ) {
    return "raceAtmosphereJevnaker";
  }


  if (
    name.includes("lunde")
  ) {
    return "raceAtmosphereLunde";
  }


  if (
    name.includes("brandefant") ||
    name.includes("uvdal")
  ) {
    return "raceAtmosphereUvdal";
  }


  if (
    name.includes("tønsberg") ||
    name.includes("tonsberg")
  ) {
    return "raceAtmosphereTonsberg";
  }


  if (
    name.includes("swissman")
  ) {
    return "raceAtmosphereSwissman";
  }


  if (
    name.includes("salou")
  ) {
    return "raceAtmosphereSalou";
  }


  if (
    name.includes("swansea")
  ) {
    return "raceAtmosphereSwansea";
  }


  if (
    name.includes("vitoria-gasteiz") ||
    name.includes("vitoria gasteiz") ||
    name.includes("vitoria")
  ) {
    return "raceAtmosphereVitoria";
  }


  if (
    name.includes("finnskogen")
  ) {
    return "raceAtmosphereFinnskogen";
  }


  if (
    name.includes("os triathlon") ||
    name.includes("os triatlon")
  ) {
    return "raceAtmosphereOs";
  }


  if (
    name.includes("vichy")
  ) {
    return "raceAtmosphereVichy";
  }


  return "raceAtmosphereDefault";
}



export default function Home() {
  const [screen, setScreen] =
    useState<
      | "home"
      | "onboarding"
      | "dashboard"
      | "athleteProfile"
    >("home");

  const [step, setStep] = useState(0);

  const resumePlanAfterEmailConfirmationRef =
    useRef(false);

  const [athlete, setAthlete] = useState<Athlete>({
    name: "",

    unitSystem: "Metric",

    goal: "70.3",
    raceDate: "",
    hoursPerWeek: "8",
    weakestDiscipline: "Swimming",

    experience: "Beginner",
    performanceTier: "Recreational",
    currentTrainingHours: "5",

    swimLevel: "Beginner",
    bikeLevel: "Developing",
    runLevel: "Developing",

    availableDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],

    longestSessionMinutes: "150",

    poolAccess: true,
    indoorTrainer: false,
    gymAccess: false,

    limitations: "",
  });


  const [message, setMessage] = useState("");
  const [isCoachThinking, setIsCoachThinking] = useState(false);

  /*
    More than one Calendar availability adaptation may be
    in flight when the athlete makes quick consecutive edits.

    Keep Coach loading true until the final active request
    finishes instead of letting an older request clear the
    shared loading state while a newer one is still running.
  */
  const activeCoachRequestCountRef =
    useRef(0);

  const [
    pendingCoachPlanChange,
    setPendingCoachPlanChange,
  ] = useState<TrainingPlan | null>(
    null
  );

  const [
    pendingCoachPlanReason,
    setPendingCoachPlanReason,
  ] = useState("");

  const [
    pendingCoachDecisionTrace,
    setPendingCoachDecisionTrace,
  ] = useState<{
    headline: string;
    signals: string[];
    decision: string;
    confidence:
      | "Low"
      | "Moderate"
      | "High";
  } | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  const [
    firstPlanIntroOpen,
    setFirstPlanIntroOpen,
  ] = useState(false);
  const [
    trainingPlan,
    setTrainingPlanRaw,
  ] = useState<TrainingPlan | null>(null);


  function setTrainingPlan(
    update:
      | TrainingPlan
      | null
      | ((
          current:
            TrainingPlan | null
        ) =>
          TrainingPlan | null)
  ) {
    setTrainingPlanRaw(
      (current) => {
        const nextPlan =
          typeof update === "function"
            ? update(current)
            : update;

        return ensurePlanSessionIds(
          nextPlan
        );
      }
    );
  }


  const [hasRestoredData, setHasRestoredData] = useState(false);


  /*
    Serialize every training_state cloud write.

    Without this, rapid React state changes can launch
    overlapping Supabase UPSERT requests and an older request
    may theoretically finish after a newer one.

    The queue is also drained before destructive reset/logout
    operations so an old in-flight save cannot race them.
  */
  const trainingStateWriteQueueRef =
    useRef<Promise<void>>(
      Promise.resolve()
    );


  /*
    Serialize profile cloud writes for the same reason as
    training_state writes.

    Rapid athlete changes must reach Supabase in the same
    order they were produced, and destructive reset must be
    able to wait for any earlier profile save.
  */
  const profileWriteQueueRef =
    useRef<Promise<void>>(
      Promise.resolve()
    );


  const [workoutHistory, setWorkoutHistory] = useState<WorkoutFeedback[]>([]);
  const [planHistory, setPlanHistory] = useState<TrainingPlan[]>([]);
  const [trainingArchive, setTrainingArchive] =
    useState<TrainingArchiveWeek[]>([]);

  const [seasonRoadmap, setSeasonRoadmap] =
    useState<SeasonRoadmap | null>(null);

  const raceChangeAbortRef =
    useRef<AbortController | null>(
      null
    );


  const [roadmapRevisions, setRoadmapRevisions] =
    useState<RoadmapRevision[]>([]);


  const [isRoadmapLoading, setIsRoadmapLoading] =
    useState(false);

  const [weeklyReview, setWeeklyReview] =
    useState<WeeklyReview | null>(null);

  const [readinessHistory, setReadinessHistory] =
    useState<ReadinessEntry[]>([]);

  const [
    trainingAvailability,
    setTrainingAvailability,
  ] = useState<TrainingAvailability[]>([]);


  /*
    Calendar availability saves may overlap.

    Track active async adaptations per calendar date so the
    Calendar can communicate progress without disabling newer
    saves. A counter prevents an older request from clearing
    the busy state while a newer request for the same date is
    still running.
  */
  const [
    calendarAdaptingDates,
    setCalendarAdaptingDates,
  ] = useState<string[]>([]);

  const calendarAdaptationCountRef =
    useRef<Map<string, number>>(
      new Map()
    );


  function beginCalendarAdaptation(
    date: string
  ) {
    const nextCount =
      (
        calendarAdaptationCountRef.current.get(
          date
        ) ??
        0
      ) + 1;

    calendarAdaptationCountRef.current.set(
      date,
      nextCount
    );

    setCalendarAdaptingDates(
      Array.from(
        calendarAdaptationCountRef.current.keys()
      )
    );
  }


  function endCalendarAdaptation(
    date: string
  ) {
    const currentCount =
      calendarAdaptationCountRef.current.get(
        date
      ) ??
      0;

    if (currentCount <= 1) {
      calendarAdaptationCountRef.current.delete(
        date
      );
    } else {
      calendarAdaptationCountRef.current.set(
        date,
        currentCount - 1
      );
    }

    setCalendarAdaptingDates(
      Array.from(
        calendarAdaptationCountRef.current.keys()
      )
    );
  }


  /*
    ======================================================
    AUTHORITATIVE LATEST STATE
    ======================================================

    Async functions capture the React render that started
    them. After an await, those closure values do NOT
    automatically become the newest app state.

    These refs are updated on every render and therefore
    provide an authoritative latest-state check before an
    asynchronous response is allowed to mutate training.
  */
  const latestTrainingPlanRef =
    useRef<TrainingPlan | null>(
      trainingPlan
    );

  const latestWorkoutHistoryRef =
    useRef<WorkoutFeedback[]>(
      workoutHistory
    );

  const latestTrainingAvailabilityRef =
    useRef<TrainingAvailability[]>(
      trainingAvailability
    );

  const latestAthleteRef =
    useRef<Athlete>(
      athlete
    );

  const latestPlanHistoryRef =
    useRef<TrainingPlan[]>(
      planHistory
    );

  const latestTrainingArchiveRef =
    useRef<TrainingArchiveWeek[]>(
      trainingArchive
    );

  const latestSeasonRoadmapRef =
    useRef<SeasonRoadmap | null>(
      seasonRoadmap
    );

  const latestReadinessHistoryRef =
    useRef<ReadinessEntry[]>(
      readinessHistory
    );


  latestTrainingPlanRef.current =
    trainingPlan;

  latestWorkoutHistoryRef.current =
    workoutHistory;

  latestTrainingAvailabilityRef.current =
    trainingAvailability;

  latestAthleteRef.current =
    athlete;

  latestPlanHistoryRef.current =
    planHistory;

  latestTrainingArchiveRef.current =
    trainingArchive;

  latestSeasonRoadmapRef.current =
    seasonRoadmap;

  latestReadinessHistoryRef.current =
    readinessHistory;


  /*
    ======================================================
    PENDING COACH PROPOSAL CONTEXT GUARD
    ======================================================

    A Coach proposal is only valid for the exact training
    context it was created against.

    While no proposal is pending these refs follow the
    latest authoritative state.

    Once a proposal exists, the baseline freezes. Any
    subsequent change to the active plan, logged training,
    Calendar availability or Athlete Profile makes that
    proposal stale and it must be discarded.
  */
  const pendingCoachPlanBaselineRef =
    useRef<TrainingPlan | null>(
      trainingPlan
    );

  const pendingCoachHistoryBaselineRef =
    useRef<WorkoutFeedback[]>(
      workoutHistory
    );

  const pendingCoachAvailabilityBaselineRef =
    useRef<TrainingAvailability[]>(
      trainingAvailability
    );

  const pendingCoachAthleteBaselineRef =
    useRef<Athlete>(
      athlete
    );


  const [readinessOpen, setReadinessOpen] =
    useState(false);

  const [readinessSleep, setReadinessSleep] =
    useState(3);

  const [readinessEnergy, setReadinessEnergy] =
    useState(3);

  const [readinessSoreness, setReadinessSoreness] =
    useState(2);

  const [readinessStress, setReadinessStress] =
    useState(2);

  const [readinessMotivation, setReadinessMotivation] =
    useState(3);

  const [readinessNote, setReadinessNote] =
    useState("");
  const [isNextWeekLoading, setIsNextWeekLoading] = useState(false);

  const [
    nextWeekPreview,
    setNextWeekPreview,
  ] =
    useState<TrainingPlan | null>(
      null
    );

  const [
    isNextWeekPreviewLoading,
    setIsNextWeekPreviewLoading,
  ] =
    useState(false);

  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [dbReady, setDbReady] = useState(false);

  const [
    onboardingAccountEmail,
    setOnboardingAccountEmail,
  ] = useState("");

  const [
    onboardingAccountPassword,
    setOnboardingAccountPassword,
  ] = useState("");

  const [
    onboardingAccountMessage,
    setOnboardingAccountMessage,
  ] = useState("");

  const [
    isOnboardingAccountLoading,
    setIsOnboardingAccountLoading,
  ] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [
    deleteAccountOpen,
    setDeleteAccountOpen,
  ] = useState(false);

  const [
    isDeletingAccount,
    setIsDeletingAccount,
  ] = useState(false);

  const [
    deleteAccountError,
    setDeleteAccountError,
  ] = useState("");

  const [
    appFeedbackOpen,
    setAppFeedbackOpen,
  ] = useState(false);

  const [
    benchmarkModalOpen,
    setBenchmarkModalOpen,
  ] = useState(false);

  const [
    targetRaceModalOpen,
    setTargetRaceModalOpen,
  ] = useState(false);

  const [
    manualRaceModalOpen,
    setManualRaceModalOpen,
  ] = useState(false);

  const [toast, setToast] =
    useState<{
      message: string;
      type: ToastType;
      persistent?: boolean;
    } | null>(null);

  const [confirmState, setConfirmState] =
    useState<{
      title: string;
      message: string;
      confirmLabel: string;
      destructive: boolean;
      action: () => void;
    } | null>(null);

  function showToast(
    message: string,
    type: ToastType = "info",
    persistent = false
  ) {
    setToast({
      message,
      type,
      persistent,
    });
  }

  function requestConfirmation({
    title,
    message,
    confirmLabel = "Continue",
    destructive = false,
    action,
  }: {
    title: string;
    message: string;
    confirmLabel?: string;
    destructive?: boolean;
    action: () => void;
  }) {
    setConfirmState({
      title,
      message,
      confirmLabel,
      destructive,
      action,
    });
  }

  const [dashboardView, setDashboardView] =
    useState<
      "today" |
      "week" |
      "calendar" |
      "coach" |
      "progress" |
      "plan"
    >("today");
  const [isResetting, setIsResetting] = useState(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackStatus, setFeedbackStatus] =
    useState<"Completed" | "Skipped" | "Modified">("Completed");
  const [feedbackRpe, setFeedbackRpe] = useState(5);
  const [feedbackFeeling, setFeedbackFeeling] =
    useState<"Great" | "Normal" | "Heavy">("Normal");
  const [feedbackComment, setFeedbackComment] = useState("");

  const [selectedWorkout, setSelectedWorkout] =
    useState<TrainingPlanDay | null>(null);

  const [
    selectedWorkoutPreviewOnly,
    setSelectedWorkoutPreviewOnly,
  ] = useState(false);

  const [
    addSessionOpen,
    setAddSessionOpen,
  ] = useState(false);

  const [
    editingManualSession,
    setEditingManualSession,
  ] = useState<TrainingPlanDay | null>(
    null
  );

  const [feedbackWorkout, setFeedbackWorkout] =
    useState<TrainingPlanDay | null>(null);

  const [actualDurationMinutes, setActualDurationMinutes] =
    useState("");

  const [actualDistance, setActualDistance] =
    useState("");

  const [
    brickBikeDurationMinutes,
    setBrickBikeDurationMinutes,
  ] = useState("");

  const [
    brickBikeDistance,
    setBrickBikeDistance,
  ] = useState("");

  const [
    brickRunDurationMinutes,
    setBrickRunDurationMinutes,
  ] = useState("");

  const [
    brickRunDistance,
    setBrickRunDistance,
  ] = useState("");


  function openNewWorkoutFeedback(
    workout: TrainingPlanDay | null
  ) {
    /*
      Every NEW workout log must begin from deterministic
      state.

      TodayView may theoretically call this with null, so
      preserve the existing nullable behavior rather than
      narrowing the callback contract.
    */
    setFeedbackWorkout(
      workout
    );

    setFeedbackStatus(
      "Completed"
    );

    setFeedbackRpe(
      5
    );

    setFeedbackFeeling(
      "Normal"
    );

    setFeedbackComment(
      ""
    );

    setActualDurationMinutes(
      workout
        ? String(
            workout.durationMinutes
          )
        : ""
    );

    setActualDistance(
      ""
    );

    setBrickBikeDurationMinutes(
      ""
    );

    setBrickBikeDistance(
      ""
    );

    setBrickRunDurationMinutes(
      ""
    );

    setBrickRunDistance(
      ""
    );

    setFeedbackOpen(
      true
    );
  }


  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "coach",
      text:
        "Tell me what real life threw at you today. I’ll adapt the training without losing sight of the goal.",
    },
  ]);

  useEffect(() => {

    /*
      Keep React auth state synchronized with the
      actual Supabase browser session.

      This is intentionally independent from
      restoreTriCoach(), because some restore/reset
      paths return early before profile restoration.
    */

    let mounted =
      true;


    async function syncAuthUser() {

      const {
        data: {
          user,
        },
        error,
      } =
        await supabase.auth.getUser();


      if (!mounted) {
        return;
      }


      if (error) {
        console.warn(
          "Could not synchronize Supabase auth user:",
          error
        );
      }


      setUserId(
        user?.id ??
        null
      );


      setUserEmail(
        user?.email ??
        ""
      );
    }


    void syncAuthUser();


    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {

          if (!mounted) {
            return;
          }


          setUserId(
            session?.user.id ??
            null
          );


          setUserEmail(
            session?.user.email ??
            ""
          );
        }
      );


    return () => {
      mounted =
        false;

      subscription.unsubscribe();
    };

  }, [supabase]);


  useEffect(() => {

    /*
      No pending proposal:
      continuously move the baseline forward with the
      authoritative app state.
    */
    if (!pendingCoachPlanChange) {
      pendingCoachPlanBaselineRef.current =
        trainingPlan;

      pendingCoachHistoryBaselineRef.current =
        workoutHistory;

      pendingCoachAvailabilityBaselineRef.current =
        trainingAvailability;

      pendingCoachAthleteBaselineRef.current =
        athlete;

      return;
    }


    /*
      Pending proposal:
      the baseline is frozen.

      If any authoritative training input changes after the
      proposal was produced, the proposal no longer belongs
      to the current state and must not remain actionable.
    */
    const contextChanged =
      pendingCoachPlanBaselineRef.current !==
        trainingPlan ||
      pendingCoachHistoryBaselineRef.current !==
        workoutHistory ||
      pendingCoachAvailabilityBaselineRef.current !==
        trainingAvailability ||
      pendingCoachAthleteBaselineRef.current !==
        athlete;


    if (!contextChanged) {
      return;
    }


    setPendingCoachPlanChange(
      null
    );

    setPendingCoachPlanReason(
      ""
    );

    setPendingCoachDecisionTrace(
      null
    );

  }, [
    pendingCoachPlanChange,
    trainingPlan,
    workoutHistory,
    trainingAvailability,
    athlete,
  ]);


  useEffect(() => {
    async function restoreTriCoach() {

      /*
        FULL RESET GUARD

        resetTriCoach sets this before reload so the normal
        Supabase/localStorage restore cannot immediately
        reconstruct the previous dashboard.
      */
      const forceFreshOnboarding =
        sessionStorage.getItem(
          "tricoach-force-fresh-onboarding"
        );


      if (
        forceFreshOnboarding ===
          "1"
      ) {

        sessionStorage.removeItem(
          "tricoach-force-fresh-onboarding"
        );


        localStorage.clear();


        setTrainingPlan(
          null
        );

        setWorkoutHistory(
          []
        );

        setPlanHistory(
          []
        );

        setTrainingArchive(
          []
        );

        setSeasonRoadmap(
          null
        );

        setRoadmapRevisions(
          []
        );

        setReadinessHistory(
          []
        );

        setWeeklyReview(
          null
        );


        setAthlete(
          (current) => ({
            ...current,

            name:
              "",

            goal:
              "70.3",

            raceDate:
              "",

            targetRace:
              undefined,

            benchmarks:
              undefined,

            hoursPerWeek:
              "8",

            weakestDiscipline:
              "Swimming",

            experience:
              "Beginner",

            performanceTier:
              "Recreational",

            currentTrainingHours:
              "5",

            swimLevel:
              "Beginner",

            bikeLevel:
              "Developing",

            runLevel:
              "Developing",

            availableDays: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],

            longestSessionMinutes:
              "150",

            poolAccess:
              true,

            indoorTrainer:
              false,

            gymAccess:
              false,

            limitations:
              "",
          })
        );


        setStep(
          0
        );

        setScreen(
          "onboarding"
        );

        setHasRestoredData(
          true
        );

        return;
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Could not verify Supabase user:", userError);
        }

        if (user) {
          setUserId(user.id);
          setUserEmail(user.email ?? "");


          /*
            A newly confirmed onboarding account returns
            here with its completed athlete setup still
            stored in this browser.

            Restore THAT snapshot before the normal
            database restore path can replace it with
            incomplete/default profile values.
          */
          const completingOnboarding =
            new URLSearchParams(
              window.location.search
            ).get(
              "completeOnboarding"
            ) === "1";


          if (
            completingOnboarding
          ) {

            const pendingRaw =
              localStorage.getItem(
                "tricoach-pending-onboarding"
              );


            if (pendingRaw) {

              try {

                const pending =
                  JSON.parse(
                    pendingRaw
                  );


                if (
                  pending?.athlete
                ) {
                  setAthlete(
                    pending.athlete as Athlete
                  );
                }


                if (
                  Array.isArray(
                    pending?.trainingAvailability
                  )
                ) {
                  setTrainingAvailability(
                    pending.trainingAvailability
                  );
                }


                /*
                  Remove the URL flag immediately so a
                  refresh cannot accidentally regenerate
                  the first plan.
                */
                window.history.replaceState(
                  {},
                  "",
                  "/"
                );


                setDbReady(
                  true
                );

                setHasRestoredData(
                  true
                );

                resumePlanAfterEmailConfirmationRef.current =
                  true;

                return;

              } catch (error) {

                console.error(
                  "Could not restore pending onboarding after email confirmation:",
                  error
                );

              }

            }

          }


          const { data: profileData, error: profileError } =
            await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", user.id)
              .limit(1)
              .maybeSingle();

          if (profileError) {
            console.warn(
              "Could not load profile:",
              {
                message: profileError.message,
                code: profileError.code,
                details: profileError.details,
                hint: profileError.hint,
              }
            );
          }

          const { data: trainingData, error: trainingError } =
            await supabase
              .from("training_state")
              .select("*")
              .eq("user_id", user.id)
              .limit(1)
              .maybeSingle();

          if (trainingError) {
            console.warn(
              "Could not load training state:",
              {
                message: trainingError.message,
                code: trainingError.code,
                details: trainingError.details,
                hint: trainingError.hint,
              }
            );
          }

          if (profileData) {
            const savedBenchmarksRaw =
              localStorage.getItem(
                "tricoach-performance-benchmarks"
              );

            const savedTargetRaceRaw =
              localStorage.getItem(
                "tricoach-target-race"
              );

            let savedBenchmarks:
              Athlete["benchmarks"] =
                undefined;

            let savedTargetRace:
              Athlete["targetRace"] =
                undefined;


            const cloudTargetRace:
              Athlete["targetRace"] =
                profileData.target_race &&
                typeof profileData.target_race ===
                  "object"
                  ? profileData.target_race as
                      Athlete["targetRace"]
                  : undefined;


            if (savedBenchmarksRaw) {
              try {
                savedBenchmarks =
                  JSON.parse(
                    savedBenchmarksRaw
                  );
              } catch (error) {
                console.error(
                  "Could not restore performance benchmarks:",
                  error
                );
              }
            }

            if (savedTargetRaceRaw) {
              try {
                savedTargetRace =
                  JSON.parse(
                    savedTargetRaceRaw
                  );
              } catch (error) {
                console.error(
                  "Could not restore target race:",
                  error
                );
              }
            }


            let savedWeeklyAvailability:
              Athlete["weeklyAvailability"] =
                undefined;

            const savedAthleteRaw =
              localStorage.getItem(
                "tricoach-athlete"
              );

            if (savedAthleteRaw) {
              try {
                savedWeeklyAvailability =
                  JSON.parse(
                    savedAthleteRaw
                  )?.weeklyAvailability;
              } catch (error) {
                console.error(
                  "Could not restore weekly availability:",
                  error
                );
              }
            }


            const restoredCapability =
              resolveAthleteCapabilityProfile(
                profileData.capability_profile,
                {
                  experience:
                    profileData.experience,

                  swimLevel:
                    profileData.swim_level,

                  bikeLevel:
                    profileData.bike_level,

                  runLevel:
                    profileData.run_level,
                }
              );


            setAthlete({
              name: profileData.name ?? "",
              goal: profileData.goal ?? "70.3",
              raceDate: profileData.race_date ?? "",
              hoursPerWeek:
                profileData.hours_per_week?.toString() ?? "8",
              weakestDiscipline:
                profileData.weakest_discipline ?? "Swimming",

              experience:
                restoredCapability.experience,

              performanceTier:
                restoredCapability.performanceTier,

              currentTrainingHours:
                profileData.current_training_hours?.toString() ?? "5",

              swimLevel:
                restoredCapability.swimLevel,

              bikeLevel:
                restoredCapability.bikeLevel,

              runLevel:
                restoredCapability.runLevel,

              availableDays:
                profileData.available_days ?? [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],

              weeklyAvailability:
                savedWeeklyAvailability,

              unitSystem: (() => {
                try {
                  const saved =
                    localStorage.getItem(
                      "tricoach-athlete"
                    );

                  const value =
                    saved
                      ? JSON.parse(
                          saved
                        )?.unitSystem
                      : null;

                  return value ===
                    "Imperial"
                    ? "Imperial"
                    : "Metric";
                } catch {
                  return "Metric";
                }
              })(),

              longestSessionMinutes:
                profileData.longest_session_minutes?.toString() ?? "150",

              poolAccess:
                profileData.pool_access ?? true,

              indoorTrainer:
                profileData.indoor_trainer ?? false,

              gymAccess:
                profileData.gym_access ?? false,

              limitations:
                profileData.limitations ?? "",

              benchmarks:
                savedBenchmarks,

              targetRace:
                cloudTargetRace ??
                savedTargetRace,

            });
          }

          /*
            CROSS-DEVICE WEEK SYNC

            A device may already have advanced to a newer
            training week before that plan reaches Supabase.

            Compare the local active plan with the cloud plan
            and always restore the newest weekStart.
          */
          const cloudActivePlan:
            TrainingPlan | null =
              trainingData?.active_plan
                ? attachWeekDates(
                    trainingData.active_plan
                  )
                : null;


          let localActivePlan:
            TrainingPlan | null =
              null;


          const savedActivePlan =
            localStorage.getItem(
              "tricoach-plan"
            );


          /*
            Local timestamp for the complete training-state
            bundle.

            This lets Basse resolve same-week conflicts
            between localStorage and Supabase without
            guessing which copy is newer.
          */
          const localTrainingStateUpdatedAtRaw =
            localStorage.getItem(
              "tricoach-training-state-updated-at"
            );


          const localTrainingStateUpdatedAt =
            localTrainingStateUpdatedAtRaw
              ? new Date(
                  localTrainingStateUpdatedAtRaw
                ).getTime()
              : 0;


          const cloudTrainingStateUpdatedAt =
            trainingData?.updated_at
              ? new Date(
                  trainingData.updated_at
                ).getTime()
              : 0;


          if (savedActivePlan) {
            try {
              localActivePlan =
                attachWeekDates(
                  JSON.parse(
                    savedActivePlan
                  )
                );
            } catch (error) {
              console.error(
                "Could not restore local active plan:",
                error
              );
            }
          }


          /*
            CROSS-DEVICE STATE BUNDLE

            Active plan, workout feedback, review and archive
            belong to the same week context.

            If the local active plan wins because it belongs
            to a newer calendar week, restore the rest of the
            local week-state with it instead of combining the
            new plan with older cloud feedback.
          */
          let localWorkoutHistory:
            WorkoutFeedback[] = [];

          const savedWorkoutHistoryRaw =
            localStorage.getItem(
              "tricoach-workout-history"
            );

          if (savedWorkoutHistoryRaw) {
            try {
              const parsed =
                JSON.parse(
                  savedWorkoutHistoryRaw
                );

              localWorkoutHistory =
                Array.isArray(parsed)
                  ? parsed
                  : [];
            } catch (error) {
              console.error(
                "Could not restore local workout history:",
                error
              );
            }
          }


          let localPlanHistory:
            TrainingPlan[] = [];

          const savedPlanHistoryRaw =
            localStorage.getItem(
              "tricoach-plan-history"
            );

          if (savedPlanHistoryRaw) {
            try {
              const parsed =
                JSON.parse(
                  savedPlanHistoryRaw
                );

              localPlanHistory =
                Array.isArray(parsed)
                  ? parsed
                  : [];
            } catch (error) {
              console.error(
                "Could not restore local plan history:",
                error
              );
            }
          }


          let localTrainingArchive:
            TrainingArchiveWeek[] = [];

          const savedTrainingArchiveRaw =
            localStorage.getItem(
              "tricoach-training-archive"
            );

          if (savedTrainingArchiveRaw) {
            try {
              const parsed =
                JSON.parse(
                  savedTrainingArchiveRaw
                );

              localTrainingArchive =
                Array.isArray(parsed)
                  ? parsed
                  : [];
            } catch (error) {
              console.error(
                "Could not restore local training archive:",
                error
              );
            }
          }


          let localWeeklyReview:
            WeeklyReview | null =
              null;

          const savedWeeklyReviewRaw =
            localStorage.getItem(
              "tricoach-weekly-review"
            );

          if (savedWeeklyReviewRaw) {
            try {
              localWeeklyReview =
                JSON.parse(
                  savedWeeklyReviewRaw
                );
            } catch (error) {
              console.error(
                "Could not restore local weekly review:",
                error
              );
            }
          }


          function planWeekTime(
            plan:
              TrainingPlan | null
          ) {

            if (!plan?.weekStart) {
              return 0;
            }


            const time =
              new Date(
                `${plan.weekStart}T12:00:00`
              ).getTime();


            return Number.isFinite(
              time
            )
              ? time
              : 0;
          }


          const localWeekTime =
            planWeekTime(
              localActivePlan
            );


          const cloudWeekTime =
            planWeekTime(
              cloudActivePlan
            );


          /*
            AUTHORITATIVE STATE SOURCE

            Priority:
            1. Newer calendar week always wins.
            2. If both belong to the same calendar week,
               use the most recently persisted state bundle.
            3. If timestamps are unavailable/equal, keep
               cloud as the conservative fallback.
          */
          const localPlanIsNewer =
            !!localActivePlan &&
            (
              !cloudActivePlan ||
              localWeekTime >
                cloudWeekTime ||
              (
                localWeekTime ===
                  cloudWeekTime &&
                localTrainingStateUpdatedAt >
                  cloudTrainingStateUpdatedAt
              )
            );


          let restoredActivePlan =
            localPlanIsNewer
              ? localActivePlan
              : cloudActivePlan;


          /*
            Select one authoritative week-state bundle.

            Never mix:
            - a newer local plan
            - with older cloud feedback/review/archive.
          */
          const authoritativeWorkoutHistory:
            WorkoutFeedback[] =
              localPlanIsNewer
                ? localWorkoutHistory
                : Array.isArray(
                    trainingData?.workout_history
                  )
                  ? trainingData.workout_history
                  : [];


          const authoritativeWeeklyReview:
            WeeklyReview | null =
              localPlanIsNewer
                ? localWeeklyReview
                : trainingData
                    ?.weekly_review ??
                  null;


          const authoritativePlanHistory:
            TrainingPlan[] =
              localPlanIsNewer
                ? localPlanHistory
                : Array.isArray(
                    trainingData?.plan_history
                  )
                  ? [
                      ...trainingData.plan_history,
                    ]
                  : [];


          const authoritativeTrainingArchive:
            TrainingArchiveWeek[] =
              localPlanIsNewer
                ? localTrainingArchive
                : Array.isArray(
                    trainingData?.training_archive
                  )
                  ? [
                      ...trainingData.training_archive,
                    ]
                  : [];


          /*
            WEEK ROLLOVER ON RESTORE

            Next Week is persisted locally as a provisional
            calendar week.

            If the stored active plan belongs to an older
            week and the provisional plan now matches the
            current calendar week exactly, promote that
            provisional plan instead of leaving this device
            stuck on last week.

            Never rewrite an old plan onto new dates.
          */
          const currentWeekStart =
            toISODate(
              getMonday()
            );


          const savedNextWeekPreviewRaw =
            localStorage.getItem(
              "tricoach-next-week-preview"
            );


          let restoredNextWeekPreview:
            TrainingPlan | null =
              null;


          if (
            savedNextWeekPreviewRaw
          ) {
            try {
              restoredNextWeekPreview =
                attachWeekDates(
                  JSON.parse(
                    savedNextWeekPreviewRaw
                  )
                );
            } catch (error) {
              console.error(
                "Could not restore next-week preview:",
                error
              );
            }
          }


          const activeWeekTime =
            planWeekTime(
              restoredActivePlan
            );


          const currentWeekTime =
            new Date(
              `${currentWeekStart}T12:00:00`
            ).getTime();


          const shouldPromotePreview =
            !!restoredNextWeekPreview &&
            restoredNextWeekPreview.weekStart ===
              currentWeekStart &&
            activeWeekTime <
              currentWeekTime;


          /*
            Restore promotion must behave like a real week
            rollover, not merely swap the active plan.

            Capture the outgoing week's persisted state
            before promoting the provisional current week.
          */
          const outgoingRestorePlan =
            shouldPromotePreview
              ? restoredActivePlan
              : null;

          const outgoingRestoreFeedback:
            WorkoutFeedback[] =
              authoritativeWorkoutHistory;


          const outgoingRestoreReview:
            WeeklyReview | null =
              authoritativeWeeklyReview;


          let restoredPlanHistory:
            TrainingPlan[] = [
              ...authoritativePlanHistory,
            ];


          let restoredTrainingArchive:
            TrainingArchiveWeek[] = [
              ...authoritativeTrainingArchive,
            ];


          if (
            shouldPromotePreview
          ) {

            if (
              outgoingRestorePlan
            ) {

              const alreadyStored =
                restoredPlanHistory.some(
                  (plan) =>
                    (
                      plan.weekStart &&
                      outgoingRestorePlan.weekStart &&
                      plan.weekStart ===
                        outgoingRestorePlan.weekStart
                    ) ||
                    (
                      !plan.weekStart &&
                      !outgoingRestorePlan.weekStart &&
                      plan.weekNumber ===
                        outgoingRestorePlan.weekNumber
                    )
                );


              if (!alreadyStored) {
                restoredPlanHistory = [
                  ...restoredPlanHistory,
                  outgoingRestorePlan,
                ];
              }


              const alreadyArchived =
                restoredTrainingArchive.some(
                  (entry) =>
                    (
                      entry.plan.weekStart &&
                      outgoingRestorePlan.weekStart &&
                      entry.plan.weekStart ===
                        outgoingRestorePlan.weekStart
                    ) ||
                    (
                      !entry.plan.weekStart &&
                      !outgoingRestorePlan.weekStart &&
                      entry.plan.weekNumber ===
                        outgoingRestorePlan.weekNumber
                    )
                );


              if (!alreadyArchived) {
                restoredTrainingArchive = [
                  ...restoredTrainingArchive,
                  {
                    plan:
                      outgoingRestorePlan,

                    feedback:
                      outgoingRestoreFeedback,

                    review:
                      outgoingRestoreReview,

                    archivedAt:
                      new Date().toISOString(),
                  },
                ];
              }
            }


            restoredActivePlan =
              restoredNextWeekPreview;

            restoredNextWeekPreview =
              null;

            localStorage.removeItem(
              "tricoach-next-week-preview"
            );
          }


          if (restoredActivePlan) {
            setTrainingPlan(
              restoredActivePlan
            );

            setScreen(
              "dashboard"
            );
          }


          /*
            A promoted preview is the start of a new active
            week. Feedback and Weekly Review from the
            outgoing week now live in the archive only.
          */
          setWorkoutHistory(
            shouldPromotePreview
              ? []
              : outgoingRestoreFeedback
          );

          setPlanHistory(
            restoredPlanHistory
          );

          setTrainingArchive(
            restoredTrainingArchive
          );


          if (trainingData?.season_roadmap) {
            setSeasonRoadmap(
              trainingData.season_roadmap
            );
          }

          if (trainingData?.roadmap_revisions) {
            setRoadmapRevisions(
              trainingData.roadmap_revisions
            );
          }

          if (trainingData?.readiness_history) {
            setReadinessHistory(
              trainingData.readiness_history
            );
          }

          setWeeklyReview(
            shouldPromotePreview
              ? null
              : outgoingRestoreReview
          );

          /*
            CALENDAR / NEXT WEEK LOCAL HYDRATION FOR AUTH USER

            These states are currently persisted locally and
            are not yet columns in training_state.
          */
          if (
            restoredNextWeekPreview
          ) {
            setNextWeekPreview(
              restoredNextWeekPreview
            );
          } else {
            setNextWeekPreview(
              null
            );
          }

          const savedTrainingAvailability =
            localStorage.getItem(
              "tricoach-training-availability"
            );

          if (savedTrainingAvailability) {
            try {
              const restoredAvailability =
                JSON.parse(
                  savedTrainingAvailability
                );

              setTrainingAvailability(
                Array.isArray(restoredAvailability)
                  ? restoredAvailability
                  : []
              );
            } catch (error) {
              console.error(
                "Could not restore training availability:",
                error
              );
              setTrainingAvailability([]);
            }
          }

          setDbReady(true);
        } else {
          // Local fallback for current development mode.
          const savedAthlete =
            localStorage.getItem("tricoach-athlete");
          const savedPlan =
            localStorage.getItem("tricoach-plan");
          const savedHistory =
            localStorage.getItem("tricoach-workout-history");
          const savedPlanHistory =
            localStorage.getItem("tricoach-plan-history");
          const savedTrainingArchive =
            localStorage.getItem("tricoach-training-archive");

          const savedNextWeekPreview =
            localStorage.getItem(
              "tricoach-next-week-preview"
            );
          const savedSeasonRoadmap =
            localStorage.getItem("tricoach-season-roadmap");
          const savedRoadmapRevisions =
            localStorage.getItem("tricoach-roadmap-revisions");
          const savedReadinessHistory =
            localStorage.getItem("tricoach-readiness-history");
          const savedTrainingAvailability =
            localStorage.getItem(
              "tricoach-training-availability"
            );
          const savedWeeklyReview =
            localStorage.getItem("tricoach-weekly-review");

          if (savedAthlete) {
            const restoredAthlete =
              JSON.parse(savedAthlete);

            const savedBenchmarksRaw =
              localStorage.getItem(
                "tricoach-performance-benchmarks"
              );

            const savedTargetRaceRaw =
              localStorage.getItem(
                "tricoach-target-race"
              );

            if (savedBenchmarksRaw) {
              try {
                restoredAthlete.benchmarks =
                  JSON.parse(
                    savedBenchmarksRaw
                  );
              } catch (error) {
                console.error(
                  "Could not restore performance benchmarks:",
                  error
                );
              }
            }

            if (savedTargetRaceRaw) {
              try {
                restoredAthlete.targetRace =
                  JSON.parse(
                    savedTargetRaceRaw
                  );

                restoredAthlete.raceDate =
                  restoredAthlete
                    .targetRace
                    ?.date ??
                  restoredAthlete
                    .raceDate;
              } catch (error) {
                console.error(
                  "Could not restore target race:",
                  error
                );
              }
            }


            setAthlete(
              restoredAthlete
            );
          }

          let restoredLocalPlan:
            TrainingPlan | null =
              null;


          if (savedPlan) {
            try {
              restoredLocalPlan =
                attachWeekDates(
                  JSON.parse(
                    savedPlan
                  )
                );
            } catch (error) {
              console.error(
                "Could not restore local active plan:",
                error
              );
            }
          }


          let restoredLocalPreview:
            TrainingPlan | null =
              null;


          if (
            savedNextWeekPreview
          ) {
            try {
              restoredLocalPreview =
                attachWeekDates(
                  JSON.parse(
                    savedNextWeekPreview
                  )
                );
            } catch (error) {
              console.error(
                "Could not restore next-week preview:",
                error
              );
            }
          }


          const currentLocalWeekStart =
            toISODate(
              getMonday()
            );


          const currentLocalWeekTime =
            new Date(
              `${currentLocalWeekStart}T12:00:00`
            ).getTime();


          const restoredLocalPlanTime =
            restoredLocalPlan?.weekStart
              ? new Date(
                  `${restoredLocalPlan.weekStart}T12:00:00`
                ).getTime()
              : 0;


          const shouldPromoteLocalPreview =
            !!restoredLocalPreview &&
            restoredLocalPreview.weekStart ===
              currentLocalWeekStart &&
            restoredLocalPlanTime <
              currentLocalWeekTime;


          /*
            Local fallback follows the exact same rollover
            semantics as authenticated restore.
          */
          const outgoingLocalPlan =
            shouldPromoteLocalPreview
              ? restoredLocalPlan
              : null;


          let restoredLocalHistory:
            WorkoutFeedback[] = [];

          if (savedHistory) {
            try {
              const parsed =
                JSON.parse(
                  savedHistory
                );

              restoredLocalHistory =
                Array.isArray(parsed)
                  ? parsed
                  : [];
            } catch (error) {
              console.error(
                "Could not restore workout history:",
                error
              );
            }
          }


          let restoredLocalPlanHistory:
            TrainingPlan[] = [];

          if (savedPlanHistory) {
            try {
              const parsed =
                JSON.parse(
                  savedPlanHistory
                );

              restoredLocalPlanHistory =
                Array.isArray(parsed)
                  ? parsed
                  : [];
            } catch (error) {
              console.error(
                "Could not restore plan history:",
                error
              );
            }
          }


          let restoredLocalArchive:
            TrainingArchiveWeek[] = [];

          if (savedTrainingArchive) {
            try {
              const parsed =
                JSON.parse(
                  savedTrainingArchive
                );

              restoredLocalArchive =
                Array.isArray(parsed)
                  ? parsed
                  : [];
            } catch (error) {
              console.error(
                "Could not restore training archive:",
                error
              );
            }
          }


          let restoredLocalWeeklyReview:
            WeeklyReview | null =
              null;

          if (savedWeeklyReview) {
            try {
              restoredLocalWeeklyReview =
                JSON.parse(
                  savedWeeklyReview
                );
            } catch (error) {
              console.error(
                "Could not restore weekly review:",
                error
              );
            }
          }


          if (
            shouldPromoteLocalPreview
          ) {

            if (
              outgoingLocalPlan
            ) {

              const alreadyStored =
                restoredLocalPlanHistory.some(
                  (plan) =>
                    (
                      plan.weekStart &&
                      outgoingLocalPlan.weekStart &&
                      plan.weekStart ===
                        outgoingLocalPlan.weekStart
                    ) ||
                    (
                      !plan.weekStart &&
                      !outgoingLocalPlan.weekStart &&
                      plan.weekNumber ===
                        outgoingLocalPlan.weekNumber
                    )
                );


              if (!alreadyStored) {
                restoredLocalPlanHistory = [
                  ...restoredLocalPlanHistory,
                  outgoingLocalPlan,
                ];
              }


              const alreadyArchived =
                restoredLocalArchive.some(
                  (entry) =>
                    (
                      entry.plan.weekStart &&
                      outgoingLocalPlan.weekStart &&
                      entry.plan.weekStart ===
                        outgoingLocalPlan.weekStart
                    ) ||
                    (
                      !entry.plan.weekStart &&
                      !outgoingLocalPlan.weekStart &&
                      entry.plan.weekNumber ===
                        outgoingLocalPlan.weekNumber
                    )
                );


              if (!alreadyArchived) {
                restoredLocalArchive = [
                  ...restoredLocalArchive,
                  {
                    plan:
                      outgoingLocalPlan,

                    feedback:
                      restoredLocalHistory,

                    review:
                      restoredLocalWeeklyReview,

                    archivedAt:
                      new Date().toISOString(),
                  },
                ];
              }
            }


            restoredLocalPlan =
              restoredLocalPreview;

            restoredLocalPreview =
              null;

            localStorage.removeItem(
              "tricoach-next-week-preview"
            );
          }


          if (
            restoredLocalPlan
          ) {
            setTrainingPlan(
              restoredLocalPlan
            );

            setScreen(
              "dashboard"
            );
          }


          setWorkoutHistory(
            shouldPromoteLocalPreview
              ? []
              : restoredLocalHistory
          );

          setPlanHistory(
            restoredLocalPlanHistory
          );

          setTrainingArchive(
            restoredLocalArchive
          );


          setWeeklyReview(
            shouldPromoteLocalPreview
              ? null
              : restoredLocalWeeklyReview
          );


          if (
            restoredLocalPreview
          ) {
            setNextWeekPreview(
              restoredLocalPreview
            );
          } else {
            setNextWeekPreview(
              null
            );
          }

          if (savedSeasonRoadmap) {
            setSeasonRoadmap(
              JSON.parse(savedSeasonRoadmap)
            );
          }

          if (savedReadinessHistory) {
            setReadinessHistory(
              JSON.parse(savedReadinessHistory)
            );
          }

          if (savedTrainingAvailability) {
            try {
              const restoredAvailability =
                JSON.parse(
                  savedTrainingAvailability
                );

              setTrainingAvailability(
                Array.isArray(
                  restoredAvailability
                )
                  ? restoredAvailability
                  : []
              );
            } catch (error) {
              console.error(
                "Could not restore training availability:",
                error
              );

              setTrainingAvailability(
                []
              );
            }
          }

          if (savedRoadmapRevisions) {
            setRoadmapRevisions(
              JSON.parse(savedRoadmapRevisions)
            );
          }

        }
      } catch (error) {
        console.error("Could not restore Basse data:", error);
      } finally {
        setHasRestoredData(true);
      }
    }

    restoreTriCoach();
  }, [supabase]);

  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-athlete",
      JSON.stringify(athlete)
    );

    if (athlete.benchmarks) {
      localStorage.setItem(
        "tricoach-performance-benchmarks",
        JSON.stringify(
          athlete.benchmarks
        )
      );
    } else {
      localStorage.removeItem(
        "tricoach-performance-benchmarks"
      );
    }

    if (athlete.targetRace) {
      localStorage.setItem(
        "tricoach-target-race",
        JSON.stringify(
          athlete.targetRace
        )
      );
    } else {
      localStorage.removeItem(
        "tricoach-target-race"
      );
    }

    if (userId && dbReady) {

      const profileSnapshot = {
        user_id: userId,
        name: athlete.name,
        goal: athlete.goal,
        race_date: athlete.raceDate || null,
        target_race: athlete.targetRace ?? null,
        hours_per_week: Number(athlete.hoursPerWeek),
        weakest_discipline: athlete.weakestDiscipline,

        experience:
          toLegacyExperience(
            athlete.experience
          ),

        capability_profile:
          buildAthleteCapabilityProfile(
            athlete
          ),

        current_training_hours:
          Number(athlete.currentTrainingHours),

        swim_level:
          toLegacyDisciplineLevel(
            athlete.swimLevel
          ),

        bike_level:
          toLegacyDisciplineLevel(
            athlete.bikeLevel
          ),

        run_level:
          toLegacyDisciplineLevel(
            athlete.runLevel
          ),

        available_days: athlete.availableDays,

        longest_session_minutes:
          Number(athlete.longestSessionMinutes),

        pool_access: athlete.poolAccess,
        indoor_trainer: athlete.indoorTrainer,
        gym_access: athlete.gymAccess,

        limitations: athlete.limitations,

        updated_at: new Date().toISOString(),
      };


      profileWriteQueueRef.current =
        profileWriteQueueRef.current
          .then(
            async () => {
              const { error } =
                await supabase
                  .from(
                    "profiles"
                  )
                  .upsert(
                    profileSnapshot,
                    {
                      onConflict:
                        "user_id",
                    }
                  );


              if (error) {
                console.error(
                  "Could not save profile:",
                  error
                );
              }
            }
          )
          .catch(
            (error) => {
              console.error(
                "Profile write queue failed:",
                error
              );
            }
          );
    }
  }, [
    athlete,
    hasRestoredData,
    userId,
    dbReady,
    supabase,
  ]);

  useEffect(() => {
    if (!hasRestoredData) return;

    if (trainingPlan) {
      localStorage.setItem(
        "tricoach-plan",
        JSON.stringify(trainingPlan)
      );
    } else {
      localStorage.removeItem(
        "tricoach-plan"
      );
    }


    /*
      Timestamp the complete local training-state bundle.

      The dependencies of this persistence effect represent
      the authoritative training state that is also saved to
      Supabase below.
    */
    localStorage.setItem(
      "tricoach-training-state-updated-at",
      new Date().toISOString()
    );


    if (userId && dbReady) {

      /*
        Capture this render's complete authoritative bundle.

        Each queued job owns one immutable snapshot.
      */
      const trainingStateSnapshot = {
        user_id: userId,
        active_plan: trainingPlan,
        workout_history: workoutHistory,
        plan_history: planHistory,
        training_archive: trainingArchive,
        season_roadmap: seasonRoadmap,
        roadmap_revisions: roadmapRevisions,
        readiness_history: readinessHistory,
        weekly_review: weeklyReview,
        updated_at: new Date().toISOString(),
      };


      trainingStateWriteQueueRef.current =
        trainingStateWriteQueueRef.current
          .then(
            async () => {
              const { error } =
                await supabase
                  .from(
                    "training_state"
                  )
                  .upsert(
                    trainingStateSnapshot,
                    {
                      onConflict:
                        "user_id",
                    }
                  );


              if (error) {
                console.error(
                  "Could not save training state:",
                  error
                );
              }
            }
          )
          .catch(
            (error) => {
              /*
                Keep the queue alive even if an unexpected
                client/runtime error occurs.
              */
              console.error(
                "Training state write queue failed:",
                error
              );
            }
          );
    }
  }, [
    trainingPlan,
    workoutHistory,
    planHistory,
    trainingArchive,
    seasonRoadmap,
    roadmapRevisions,
    readinessHistory,
    weeklyReview,
    hasRestoredData,
    userId,
    dbReady,
    supabase,
  ]);

  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-workout-history",
      JSON.stringify(workoutHistory)
    );
  }, [workoutHistory, hasRestoredData]);

  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-plan-history",
      JSON.stringify(planHistory)
    );
  }, [planHistory, hasRestoredData]);

  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-training-archive",
      JSON.stringify(trainingArchive)
    );
  }, [trainingArchive, hasRestoredData]);


  useEffect(() => {
    if (!hasRestoredData) {
      return;
    }


    if (
      nextWeekPreview
    ) {
      localStorage.setItem(
        "tricoach-next-week-preview",
        JSON.stringify(
          nextWeekPreview
        )
      );
    } else {
      localStorage.removeItem(
        "tricoach-next-week-preview"
      );
    }

  }, [
    nextWeekPreview,
    hasRestoredData,
  ]);

  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-readiness-history",
      JSON.stringify(readinessHistory)
    );
  }, [readinessHistory, hasRestoredData]);

  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-training-availability",
      JSON.stringify(
        trainingAvailability
      )
    );
  }, [
    trainingAvailability,
    hasRestoredData,
  ]);

  useEffect(() => {
    if (!hasRestoredData) return;

    if (seasonRoadmap) {
      localStorage.setItem(
        "tricoach-season-roadmap",
        JSON.stringify(seasonRoadmap)
      );
    } else {
      localStorage.removeItem(
        "tricoach-season-roadmap"
      );
    }
  }, [seasonRoadmap, hasRestoredData]);

  useEffect(() => {
    if (!hasRestoredData) return;

    localStorage.setItem(
      "tricoach-roadmap-revisions",
      JSON.stringify(roadmapRevisions)
    );
  }, [roadmapRevisions, hasRestoredData]);

  useEffect(() => {
    if (!hasRestoredData) return;

    /*
      Weekly Review belongs to one specific week/context.

      Persist the review when it exists, but remove the
      local key immediately when React state is cleared.

      Otherwise an old review can be resurrected during a
      later local or same-week authoritative restore.
    */
    if (weeklyReview) {
      localStorage.setItem(
        "tricoach-weekly-review",
        JSON.stringify(weeklyReview)
      );
    } else {
      localStorage.removeItem(
        "tricoach-weekly-review"
      );
    }
  }, [weeklyReview, hasRestoredData]);

  const todayIso =
    toISODate(new Date());

  const todayReadiness =
    readinessHistory
      .slice()
      .reverse()
      .find(
        (entry) =>
          entry.date === todayIso
      ) ?? null;

  const readinessTrend =
    buildReadinessTrend(
      readinessHistory
    );

  const trainingPhase =
    getTrainingPhaseUI(athlete.raceDate);

  const today = useMemo(() => {
    const day = new Date().getDay();
    const map = [6, 0, 1, 2, 3, 4, 5];
    const index = map[day];

    if (trainingPlan?.days?.length === 7) {
      const workout = trainingPlan.days[index];

      return [
        workout.day.slice(0, 3),
        workout.sport,
        workout.title,
        workout.durationMinutes === 0
          ? "—"
          : formatDuration(
              workout.durationMinutes
            ),
        workout.purpose,
      ];
    }

    return [
      ...starterWeek[index],
      "The goal is to build fitness without compromising the rest of your week.",
    ];
  }, [trainingPlan]);

  async function sendMessage(
    text?: string,
    availabilityOverride?: TrainingAvailability[],
    autoApplyPlanChange = false,
    rollbackAvailability?: TrainingAvailability[]
  ) {
    const content = (text ?? message).trim();

    /*
      Normal Coach conversations remain single-flight.

      Calendar availability auto-adaptation is different:
      a newer hard constraint must never be dropped merely
      because an older Calendar adaptation is still running.
    */
    if (
      !content ||
      (
        isCoachThinking &&
        !autoApplyPlanChange
      )
    ) {
      return;
    }

    /*
      Freeze the authoritative context this Coach request
      is actually based on.

      A response may arrive after the live app state has
      changed. Any proposal returned by this request must
      remain tied to this exact snapshot.
    */
    const requestPlan =
      trainingPlan;

    const requestHistory =
      workoutHistory;

    const requestAvailability =
      availabilityOverride ??
      trainingAvailability;

    const requestAthlete =
      athlete;


    /*
      A conflicting Calendar save is transactional.

      Availability may be shown optimistically while Basse
      adapts the current week, but if that adaptation fails
      we restore the exact authoritative Calendar state that
      existed before this request.

      A superseded request may NEVER roll back a newer save.
    */
    const rollbackCalendarAvailability =
      () => {

        if (
          !autoApplyPlanChange ||
          rollbackAvailability ===
            undefined ||
          latestTrainingAvailabilityRef.current !==
            requestAvailability
        ) {
          return false;
        }

        latestTrainingAvailabilityRef.current =
          rollbackAvailability;

        setTrainingAvailability(
          rollbackAvailability
        );

        return true;
      };


    const oldChat = chat;

    setChat((current) => [
      ...current,
      {
        role: "user",
        text: content,
      },
    ]);

    setMessage("");

    activeCoachRequestCountRef.current +=
      1;

    setIsCoachThinking(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: content,
          athlete:
            requestAthlete,
          trainingPlan:
            requestPlan,
          workoutHistory:
            requestHistory,
          trainingArchive,
          readinessHistory,
          todayReadiness,
          trainingAvailability:
            requestAvailability,

          todayContext: {
            dayKey: today[0],
            date: toISODate(
              new Date()
            ),
          },

          history: oldChat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Coach request failed");
      }

      /*
        Calendar auto-apply replies are only committed to
        Coach history after their frozen Calendar context
        has been proven current.

        This prevents an older superseded Calendar request
        from leaving a misleading Coach reply behind.
      */
      if (!autoApplyPlanChange) {
        setChat((current) => [
          ...current,
          {
            role: "coach",
            text: data.reply,
          },
        ]);
      }

      if (data.updatedPlan) {

        if (
          autoApplyPlanChange &&
          requestPlan
        ) {
          /*
            Calendar auto-apply belongs to the exact
            availability snapshot that launched it.

            A newer Calendar save supersedes this request,
            just like a newer plan/history/profile state does.
            Superseded Calendar requests are discarded silently
            because the newer request is already responsible
            for adapting the week.
          */
          const calendarAvailabilityWasSuperseded =
            latestTrainingAvailabilityRef.current !==
              requestAvailability;

          const autoApplyContextIsStale =
            latestTrainingPlanRef.current !==
              requestPlan ||
            latestWorkoutHistoryRef.current !==
              requestHistory ||
            latestAthleteRef.current !==
              requestAthlete ||
            calendarAvailabilityWasSuperseded;


          if (
            autoApplyContextIsStale
          ) {
            /*
              A newer Calendar save owns the latest state and
              already has its own adaptation request.
            */
            if (
              calendarAvailabilityWasSuperseded
            ) {
              return;
            }


            /*
              Another authoritative training change may have
              made the new Calendar constraint valid already.

              Keep the availability in that case. Otherwise
              preserve transactional integrity by rolling the
              unresolved Calendar save back.
            */
            const latestPlan =
              latestTrainingPlanRef.current;

            const latestPlanAlreadyValid =
              Boolean(
                latestPlan &&
                validatePlanAgainstResolvedAvailability({
                  plan:
                    latestPlan,

                  athlete:
                    latestAthleteRef.current,

                  availability:
                    requestAvailability,
                }).valid
              );


            if (
              latestPlanAlreadyValid
            ) {
              showToast(
                "Training availability updated.",
                "success"
              );

              return;
            }


            const rolledBack =
              rollbackCalendarAvailability();

            if (rolledBack) {
              showToast(
                "Your training changed while Basse was adapting the week, so that Calendar change was not saved.",
                "info"
              );
            }

            return;
          }


          const appliedPlan =
            mergeCoachPlanChange({
              currentPlan:
                requestPlan,

              proposedPlan:
                data.updatedPlan,

              reason:
                content,

              feedback:
                requestHistory,
            });

          const availabilityCheck =
            validatePlanAgainstResolvedAvailability({
              plan:
                appliedPlan,

              athlete:
                requestAthlete,

              availability:
                requestAvailability,
            });

          if (
            availabilityCheck.valid
          ) {
            setTrainingPlan(
              appliedPlan
            );

            setChat((current) => [
              ...current,
              {
                role: "coach",
                text: data.reply,
              },
            ]);

            setPendingCoachPlanChange(
              null
            );

            setPendingCoachPlanReason(
              ""
            );

            setPendingCoachDecisionTrace(
              null
            );

            showToast(
              "Your week was updated around the new availability.",
              "success"
            );
          } else {
            console.error(
              "Calendar replan still conflicts with availability:",
              availabilityCheck.violations
            );

            const rolledBack =
              rollbackCalendarAvailability();

            if (rolledBack) {
              showToast(
                "Basse could not safely adapt the week, so that Calendar change was not saved.",
                "error"
              );
            }
          }

          return;
        }

        /*
          This pending proposal belongs to the exact state
          that produced the request.

          Do not let a late response inherit newer plan,
          history, availability or athlete state.
        */
        pendingCoachPlanBaselineRef.current =
          requestPlan;

        pendingCoachHistoryBaselineRef.current =
          requestHistory;

        pendingCoachAvailabilityBaselineRef.current =
          requestAvailability;

        pendingCoachAthleteBaselineRef.current =
          requestAthlete;

        setPendingCoachPlanChange(
          data.updatedPlan
        );

        setPendingCoachPlanReason(
          content
        );

        setPendingCoachDecisionTrace(
          data.decisionTrace ?? null
        );
      }


      /*
        Calendar auto-apply requested a real plan mutation.

        A successful HTTP response without updatedPlan does
        not satisfy that transaction: keeping the new hard
        constraint would leave the visible active week invalid.
      */
      if (
        autoApplyPlanChange &&
        requestPlan &&
        !data.updatedPlan
      ) {
        const rolledBack =
          rollbackCalendarAvailability();

        if (rolledBack) {
          showToast(
            "Basse could not adapt the week, so that Calendar change was not saved.",
            "error"
          );
        }

        return;
      }

    } catch (error) {
      console.error(error);

      if (autoApplyPlanChange) {
        const rolledBack =
          rollbackCalendarAvailability();

        if (rolledBack) {
          showToast(
            "Basse could not adapt the week, so that Calendar change was not saved.",
            "error"
          );
        }

        return;
      }

      setChat((current) => [
        ...current,
        {
          role: "coach",
          text:
            "I couldn't reach the coaching service. Try sending that again in a moment.",
        },
      ]);
    } finally {
      activeCoachRequestCountRef.current =
        Math.max(
          0,
          activeCoachRequestCountRef.current -
            1
        );

      if (
        activeCoachRequestCountRef.current ===
        0
      ) {
        setIsCoachThinking(false);
      }
    }
  }

  function saveWorkoutFeedback() {
    /*
      Feedback must always belong to the exact workout
      the athlete chose to log.

      Never guess a workout from the current day.
      Multiple sessions can exist on the same date.
    */
    const workout =
      feedbackWorkout;

    if (!workout) {
      showToast(
        "Basse could not identify the selected workout. Please open the session and log it again.",
        "error"
      );

      setFeedbackOpen(false);

      return;
    }

    const isSkipped =
      feedbackStatus === "Skipped";


    /*
      workout has already passed the null guard above.

      Keep a non-null structure snapshot so nested helper
      functions do not lose TypeScript narrowing.
    */
    const feedbackWorkoutStructure =
      workout.workoutStructure ?? [];


    const workoutStructureSports =
      new Set(
        feedbackWorkoutStructure
          .map(
            (block) =>
              block.sport
          )
          .filter(Boolean)
      );


    const workoutText =
      [
        workout.title,
        workout.purpose,
        ...(workout.details ?? []),
      ]
        .join(" ")
        .toLowerCase();


    const isBikeRunBrick =
      (
        workoutStructureSports.has(
          "Bike"
        ) &&
        workoutStructureSports.has(
          "Run"
        )
      ) ||
      (
        workout.sport === "Bike" &&
        /\bbrick\b/.test(
          workoutText
        )
      );


    const parsedBrickBikeDuration =
      brickBikeDurationMinutes.trim() === ""
        ? null
        : Number(
            brickBikeDurationMinutes
          );

    const parsedBrickBikeDistance =
      brickBikeDistance.trim() === ""
        ? null
        : Number(
            brickBikeDistance
          );

    const parsedBrickRunDuration =
      brickRunDurationMinutes.trim() === ""
        ? null
        : Number(
            brickRunDurationMinutes
          );

    const parsedBrickRunDistance =
      brickRunDistance.trim() === ""
        ? null
        : Number(
            brickRunDistance
          );


    if (
      !isSkipped &&
      isBikeRunBrick &&
      (
        parsedBrickBikeDuration === null ||
        parsedBrickRunDuration === null
      )
    ) {
      showToast(
        "Enter both Bike and Run duration for the brick workout.",
        "error"
      );

      return;
    }


    const brickNumericValues =
      [
        parsedBrickBikeDuration,
        parsedBrickBikeDistance,
        parsedBrickRunDuration,
        parsedBrickRunDistance,
      ];


    if (
      isBikeRunBrick &&
      brickNumericValues.some(
        (value) =>
          value !== null &&
          (
            !Number.isFinite(value) ||
            value < 0
          )
      )
    ) {
      showToast(
        "Enter valid Bike and Run values.",
        "error"
      );

      return;
    }


    const parsedDuration =
      actualDurationMinutes.trim() === ""
        ? null
        : Number(actualDurationMinutes);

    const parsedDistance =
      actualDistance.trim() === ""
        ? null
        : Number(actualDistance);


    if (
      parsedDuration !== null &&
      (
        !Number.isFinite(parsedDuration) ||
        parsedDuration < 0
      )
    ) {
      showToast(
        "Enter a valid workout duration.",
        "error"
      );

      return;
    }


    if (
      parsedDistance !== null &&
      (
        !Number.isFinite(parsedDistance) ||
        parsedDistance < 0
      )
    ) {
      showToast(
        "Enter a valid workout distance.",
        "error"
      );

      return;
    }

    /*
      UI may use Imperial, but workout history stays
      canonical for analytics and backwards compatibility:

      Run/Bike -> kilometres
      Swim     -> metres
    */
    const canonicalDistance =
      parsedDistance === null ||
      !Number.isFinite(parsedDistance)
        ? parsedDistance
        : athlete.unitSystem ===
            "Imperial"
          ? workout.sport ===
              "Swim"
            ? parsedDistance *
              0.9144
            : workout.sport ===
                  "Run" ||
                workout.sport ===
                  "Bike"
              ? parsedDistance *
                1.609344
              : parsedDistance
          : parsedDistance;


    function canonicalBrickDistance(
      value: number | null
    ) {
      if (
        value === null ||
        !Number.isFinite(value)
      ) {
        return value;
      }

      return athlete.unitSystem ===
        "Imperial"
        ? value * 1.609344
        : value;
    }


    function plannedMinutesForBrickSport(
      sport:
        | "Bike"
        | "Run"
    ): number | null {

      const blocks =
        feedbackWorkoutStructure.filter(
          (block) =>
            block.sport === sport
        );


      if (blocks.length === 0) {
        return null;
      }


      let totalSeconds = 0;


      for (const block of blocks) {

        const repeatCount =
          Math.max(
            1,
            Math.round(
              block.repeatCount
            )
          );


        /*
          Only calculate a time split when every block
          for this discipline has explicit time data.

          Never estimate time from distance.
        */
        if (
          typeof block.workDurationSeconds !==
            "number" ||
          block.workDurationSeconds < 0
        ) {
          return null;
        }


        totalSeconds +=
          block.workDurationSeconds *
          repeatCount;


        /*
          Recovery belongs between repetitions:
          repeatCount - 1 recoveries.
        */
        if (
          repeatCount > 1 &&
          typeof block.recoveryDurationSeconds ===
            "number" &&
          block.recoveryDurationSeconds > 0
        ) {
          totalSeconds +=
            block.recoveryDurationSeconds *
            (
              repeatCount - 1
            );
        }
      }


      return Number(
        (
          totalSeconds / 60
        ).toFixed(2)
      );
    }


    const plannedBrickBikeMinutes =
      plannedMinutesForBrickSport(
        "Bike"
      );

    const plannedBrickRunMinutes =
      plannedMinutesForBrickSport(
        "Run"
      );


    /*
      Keep the discipline identity of a brick even when the
      athlete skips it.

      A skipped Bike -> Run brick must count as a skipped
      planned session for BOTH Bike and Run consistency.

      Actual execution stays null so skipped training never
      contributes false time or distance to Progress.
    */
    const brickDisciplineSplits =
      isBikeRunBrick
        ? [
            {
              sport:
                "Bike" as const,

              plannedDurationMinutes:
                plannedBrickBikeMinutes,

              actualDurationMinutes:
                isSkipped
                  ? null
                  : parsedBrickBikeDuration,

              distance:
                isSkipped
                  ? null
                  : canonicalBrickDistance(
                      parsedBrickBikeDistance
                    ),

              distanceUnit:
                "km" as const,
            },

            {
              sport:
                "Run" as const,

              plannedDurationMinutes:
                plannedBrickRunMinutes,

              actualDurationMinutes:
                isSkipped
                  ? null
                  : parsedBrickRunDuration,

              distance:
                isSkipped
                  ? null
                  : canonicalBrickDistance(
                      parsedBrickRunDistance
                    ),

              distanceUnit:
                "km" as const,
            },
          ]
        : undefined;


    const brickActualDuration =
      !isSkipped &&
      isBikeRunBrick
        ? (
            (
              parsedBrickBikeDuration ??
              0
            ) +
            (
              parsedBrickRunDuration ??
              0
            )
          )
        : null;


    const usesDistance =
      workout.sport === "Run" ||
      workout.sport === "Bike" ||
      workout.sport === "Swim";

    const distanceUnit =
      workout.sport === "Swim"
        ? "m"
        : workout.sport === "Run" ||
          workout.sport === "Bike"
        ? "km"
        : null;

    const existingFeedback =
      workoutHistory
        .slice()
        .reverse()
        .find(
          (entry) =>
            workoutMatchesFeedback(
              workout,
              entry
            )
        );


    const feedback: WorkoutFeedback = {
      id:
        existingFeedback?.id ??
        `${Date.now()}`,

      sessionId:
        workout.sessionId ??
        existingFeedback?.sessionId,

      day: workout.day,
      date:
        workout.date ??
        existingFeedback?.date,

      sport: workout.sport,
      title: workout.title,

      plannedDurationMinutes:
        workout.durationMinutes ??
        existingFeedback
          ?.plannedDurationMinutes ??
        null,

      status: feedbackStatus,

      actualDurationMinutes:
        isSkipped
          ? null
          : isBikeRunBrick
            ? brickActualDuration
            : parsedDuration ??
              workout.durationMinutes ??
              null,

      distance:
        isSkipped ||
        isBikeRunBrick ||
        !usesDistance
          ? null
          : canonicalDistance,

      distanceUnit:
        isBikeRunBrick
          ? null
          : distanceUnit,

      disciplineSplits:
        brickDisciplineSplits,

      rpe:
        isSkipped
          ? null
          : feedbackRpe,

      feeling:
        isSkipped
          ? null
          : feedbackFeeling,

      comment:
        feedbackComment.trim(),

      completedAt:
        existingFeedback?.completedAt ??
        new Date().toISOString(),
    };


    setWorkoutHistory(
      (current) => {

        const matchingIndexes =
          current
            .map(
              (
                entry,
                index
              ) =>
                workoutMatchesFeedback(
                  workout,
                  entry
                )
                  ? index
                  : -1
            )
            .filter(
              (index) =>
                index >= 0
            );


        if (
          matchingIndexes.length ===
          0
        ) {
          return [
            ...current,
            feedback,
          ];
        }


        /*
          Same planned workout must have exactly one
          current-week feedback record.

          Keep the newest replacement and remove any
          historical duplicates that may already exist.
        */
        const firstMatch =
          matchingIndexes[0];


        return current
          .filter(
            (
              _entry,
              index
            ) =>
              !matchingIndexes.includes(
                index
              ) ||
              index === firstMatch
          )
          .map(
            (
              entry,
              index
            ) =>
              index === firstMatch
                ? feedback
                : entry
          );
      }
    );

    setFeedbackOpen(false);
    setFeedbackWorkout(null);

    setFeedbackStatus("Completed");
    setFeedbackRpe(5);
    setFeedbackFeeling("Normal");
    setFeedbackComment("");

    setActualDurationMinutes("");
    setActualDistance("");

    showToast(
      feedbackStatus === "Skipped"
        ? `${feedback.day} workout marked as skipped.`
        : `${feedback.title} logged successfully.`,
      "success"
    );
  }


  /*
    ========================================================
    WEEK LIFECYCLE SAFETY
    ========================================================
  */

  const nextWeekPreviewRequestIdRef =
    useRef(0);

  const nextWeekPreviewAutoRetryRef =
    useRef(0);

  const weekRolloverRunningRef =
    useRef(false);

  const nextWeekConfirmedRunningRef =
    useRef(false);

  /*
    Prevent a failed automatic rollover from launching again
    immediately in the same mounted app. Reloading intentionally
    permits one fresh attempt.
  */
  const weekRolloverAttemptedStartRef =
    useRef<string | null>(
      null
    );


  async function generateNextWeekPreview(
    force = false,
    availabilityOverride?: TrainingAvailability[]
  ) {

    /*
      Normal preview generation remains single-flight.

      An explicit Calendar availability change is allowed to
      supersede an older preview request immediately. The
      monotonically increasing request id below ensures only
      the newest response may publish state.
    */
    const canSupersedeLoadingPreview =
      force &&
      availabilityOverride !==
        undefined;


    /*
      Automatic rollover exclusively owns a stale active week.
      Never spend a second request building a provisional week
      from a plan that first needs to be advanced.
    */
    const previewActiveStart =
      trainingPlan?.weekStart
        ? new Date(
            `${trainingPlan.weekStart}T12:00:00`
          )
        : null;

    const previewCurrentMonday =
      getMonday();

    previewCurrentMonday.setHours(
      12,
      0,
      0,
      0
    );

    const rolloverPending =
      previewActiveStart !== null &&
      previewCurrentMonday.getTime() >
        previewActiveStart.getTime();

    if (
      rolloverPending
    ) {
      return;
    }


    if (
      !trainingPlan ||
      (
        isNextWeekPreviewLoading &&
        !canSupersedeLoadingPreview
      )
    ) {
      return;
    }

    /*
      Persisted provisional plans are stable.
      Normal mount/re-render activity must not silently
      regenerate them. Explicit meaningful changes can.
    */
    if (
      nextWeekPreview &&
      !force
    ) {
      return;
    }


    /*
      Freeze the exact context this preview is generated from.

      React closure values do not become newer after await.
      The response may only be published if these inputs are
      still authoritative when it returns.

      Availability override is special: a Calendar interaction
      may intentionally pass the NEW availability before React
      has committed that state. That intentional override must
      not invalidate itself.
    */
    const requestPlan =
      trainingPlan;

    const requestHistory =
      workoutHistory;

    const requestPlanHistory =
      planHistory;

    const requestTrainingArchive =
      trainingArchive;

    const requestSeasonRoadmap =
      seasonRoadmap;

    const requestReadinessHistory =
      readinessHistory;

    const requestAthlete =
      athlete;

    const requestAvailability =
      availabilityOverride ??
      trainingAvailability;

    /*
      Every preview request gets an increasing id.

      Only the newest request is allowed to update state.
    */
    const previewRequestId =
      ++nextWeekPreviewRequestIdRef.current;


    /*
      Freeze a semantic signature at launch time.

      Persistence and state normalization may create equivalent
      object copies while the request is running. Those copies
      must not discard a valid response, while genuine content
      changes must still invalidate it.
    */
    const previewRequestContextSignature =
      JSON.stringify([
        requestPlan,
        requestHistory,
        requestPlanHistory,
        requestTrainingArchive,
        requestSeasonRoadmap,
        requestReadinessHistory,
        requestAthlete,
        requestAvailability,
      ]);


    setIsNextWeekPreviewLoading(
      true
    );


    try {

      const response =
        await fetch(
          "/api/next-week",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                athlete:
                  requestAthlete,

                currentPlan:
                  requestPlan,

                /*
                  Existing provisional plan for the SAME
                  upcoming calendar week.

                  The API uses this to preserve calendar
                  structure unless new training data gives
                  a real reason to change it.
                */
                previousPreview:
                  nextWeekPreview,

                workoutHistory:
                  requestHistory,

                planHistory:
                  requestPlanHistory,

                trainingArchive:
                  requestTrainingArchive,

                seasonRoadmap:
                  requestSeasonRoadmap,

                readinessHistory:
                  requestReadinessHistory,

                trainingAvailability:
                  requestAvailability,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        const previewRequestError =
          new Error(
            data.error ||
            "Could not build next-week preview"
          ) as Error & {
            status: number;
          };

        previewRequestError.status =
          response.status;

        throw previewRequestError;
      }


      const previousStart =
        requestPlan.weekStart
          ? new Date(
              `${requestPlan.weekStart}T12:00:00`
            )
          : getMonday();


      const nextStart =
        new Date(
          previousStart
        );


      nextStart.setDate(
        previousStart.getDate() +
        7
      );


      const preview =
        attachWeekDates({
          ...data.nextPlan,

          weekNumber:
            getISOWeekNumber(
              nextStart
            ),

          weekStart:
            toISODate(
              nextStart
            ),
        });


      /*
        NEXT WEEK AVAILABILITY REPAIR WALL

        Calendar rules are deterministic.

        The AI is allowed to design the week, but if it
        returns a session that still violates availability,
        repair the smallest possible conflict locally before
        the preview becomes visible.
      */
      const availabilitySafePreview =
        repairPlanToResolvedAvailability({
          plan:
            preview,

          athlete:
            requestAthlete,

          availability:
            requestAvailability,
        });


      const previewAvailabilityCheck =
        validatePlanAgainstResolvedAvailability({
          plan:
            availabilitySafePreview,

          athlete:
            requestAthlete,

          availability:
            requestAvailability,
        });


      if (
        !previewAvailabilityCheck.valid
      ) {
        console.error(
          "Availability repair could not produce a valid Next Week:",
          previewAvailabilityCheck.violations
        );

        throw new Error(
          "Basse could not safely adapt the generated week to Calendar availability."
        );
      }


      /*
        Request id protects against a newer preview request.

        The response must also still belong to the exact
        authoritative training context that generated it.

        Calendar saves update latestTrainingAvailabilityRef
        synchronously before launching an explicit rebuild,
        so availability can be checked for EVERY request,
        including explicit Calendar overrides.
      */
      const previewLatestContextSignature =
        JSON.stringify([
          latestTrainingPlanRef.current,
          latestWorkoutHistoryRef.current,
          latestPlanHistoryRef.current,
          latestTrainingArchiveRef.current,
          latestSeasonRoadmapRef.current,
          latestReadinessHistoryRef.current,
          latestAthleteRef.current,
          latestTrainingAvailabilityRef.current,
        ]);


      const previewContextIsStale =
        previewLatestContextSignature !==
        previewRequestContextSignature;


      if (
        previewRequestId !==
          nextWeekPreviewRequestIdRef.current ||
        previewContextIsStale
      ) {
        return;
      }


      setNextWeekPreview(
        availabilitySafePreview
      );

      nextWeekPreviewAutoRetryRef.current =
        0;

      if (force) {
        showToast(
          "Next Week was updated around your availability.",
          "success"
        );
      }


    } catch (error) {

      console.error(
        "Next-week preview error:",
        error
      );


      const responseStatus =
        error &&
        typeof error ===
          "object" &&
        "status" in error &&
        typeof error.status ===
          "number"
          ? error.status
          : null;

      const isTransientNextWeekPreviewFailure =
        responseStatus === null ||
        responseStatus === 408 ||
        responseStatus === 409 ||
        responseStatus === 429 ||
        (
          responseStatus !== null &&
          responseStatus >= 500
        );


      if (
        force &&
        previewRequestId ===
          nextWeekPreviewRequestIdRef.current &&
        latestTrainingAvailabilityRef.current ===
          requestAvailability
      ) {
        showToast(
          "Basse could not update Next Week around that availability.",
          "error"
        );
      } else if (
        !force &&
        isTransientNextWeekPreviewFailure &&
        nextWeekPreviewAutoRetryRef.current <
        1
      ) {
        /*
          Mobile/network restore can occasionally hit the
          preview endpoint before the restored app state has
          fully settled.

          Retry once automatically. Never loop forever.
        */
        nextWeekPreviewAutoRetryRef.current +=
          1;

        window.setTimeout(
          () => {
            void generateNextWeekPreview();
          },
          1500
        );
      } else {
        showToast(
          "Basse could not build Next Week. It will try again after your next training update.",
          "error"
        );
      }

    } finally {

      if (
        previewRequestId ===
        nextWeekPreviewRequestIdRef.current
      ) {
        setIsNextWeekPreviewLoading(
          false
        );
      }

    }

  }


  async function generateNextWeekConfirmed() {
    if (
      !trainingPlan ||
      nextWeekConfirmedRunningRef.current
    ) {
      return;
    }


    nextWeekConfirmedRunningRef.current =
      true;


    /*
      Freeze the exact authoritative context that is being
      reviewed and promoted.

      If any of this training context changes while the
      request is running, the response belongs to an older
      version of the active week and must not advance it.
    */
    const requestPlan =
      trainingPlan;

    const requestHistory =
      workoutHistory;

    const requestAvailability =
      trainingAvailability;

    const requestAthlete =
      athlete;


    /*
      Capture content, not JavaScript object identity.

      Equivalent restored state is safe to accept. Any genuine
      plan, feedback, Calendar or athlete change still produces
      a different signature and invalidates the response.
    */
    const confirmedRequestContextSignature =
      JSON.stringify([
        requestPlan,
        requestHistory,
        requestAvailability,
        requestAthlete,
      ]);


    setIsNextWeekLoading(true);

    try {
      const response = await fetch(
        "/api/next-week",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            athlete:
              requestAthlete,
            currentPlan:
              requestPlan,
            workoutHistory:
              requestHistory,
            planHistory,
            trainingArchive,
            seasonRoadmap,
            readinessHistory,
            trainingAvailability:
              requestAvailability,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not generate next week"
        );
      }

      /*
        The response is only valid for the exact active-week
        context sent to /api/next-week.

        Logging a workout, editing the plan, changing Calendar
        availability or changing Athlete Profile while this
        request runs must invalidate the response before ANY
        archive or promotion state is mutated.
      */
      const confirmedLatestContextSignature =
        JSON.stringify([
          latestTrainingPlanRef.current,
          latestWorkoutHistoryRef.current,
          latestTrainingAvailabilityRef.current,
          latestAthleteRef.current,
        ]);


      const confirmedRolloverIsStale =
        confirmedLatestContextSignature !==
        confirmedRequestContextSignature;


      if (
        confirmedRolloverIsStale
      ) {
        return;
      }


      setPlanHistory(
        (current) => {

          const alreadyStored =
            current.some(
              (plan) =>
                (
                  plan.weekStart &&
                  requestPlan.weekStart &&
                  plan.weekStart ===
                    requestPlan.weekStart
                ) ||
                (
                  !plan.weekStart &&
                  !requestPlan.weekStart &&
                  plan.weekNumber ===
                    requestPlan.weekNumber
                )
            );


          if (
            alreadyStored
          ) {
            return current;
          }


          return [
            ...current,
            requestPlan,
          ];
        }
      );

      setTrainingArchive(
        (current) => {

          const alreadyArchived =
            current.some(
              (entry) =>
                (
                  entry.plan.weekStart &&
                  requestPlan.weekStart &&
                  entry.plan.weekStart ===
                    requestPlan.weekStart
                ) ||
                (
                  !entry.plan.weekStart &&
                  !requestPlan.weekStart &&
                  entry.plan.weekNumber ===
                    requestPlan.weekNumber
                )
            );


          if (
            alreadyArchived
          ) {
            return current;
          }


          return [
            ...current,
            {
              plan:
                requestPlan,

              feedback:
                requestHistory,

              review:
                data.review,

              archivedAt:
                new Date().toISOString(),
            },
          ];
        }
      );

      setWeeklyReview(data.review);

      const previousStart = requestPlan.weekStart
        ? new Date(`${requestPlan.weekStart}T12:00:00`)
        : getMonday();

      const nextStart = new Date(previousStart);
      nextStart.setDate(previousStart.getDate() + 7);

      setTrainingPlan(
        attachWeekDates({
          ...data.nextPlan,
          weekNumber: getISOWeekNumber(nextStart),
          weekStart: toISODate(nextStart),
        })
      );

      // Start a clean feedback log for the new week.
      setWorkoutHistory([]);

      /*
        The provisional week has now become the active week.
        A fresh preview for the following week will be built
        automatically.
      */
      setNextWeekPreview(
        null
      );

      showToast(
        `Week ${getISOWeekNumber(nextStart)} is ready. Basse reviewed your actual training before building it.`,
        "success"
      );

    } catch (error) {
      console.error(
        "Next week generation error:",
        error
      );

      showToast(
        "Basse could not generate the next week. Please try again.",
        "error"
      );
    } finally {
      nextWeekConfirmedRunningRef.current =
        false;

      setIsNextWeekLoading(false);
    }
  }

  const generateNextWeekPreviewEffect =
    useEffectEvent(() => {
      void generateNextWeekPreview();
    });


  /*
    ========================================================
    AUTOMATIC NEXT-WEEK PREVIEW
    ========================================================

    There is always one planning week visible ahead.

    Relevant athlete/training changes automatically trigger
    a quiet rebuild.

    There is intentionally NO manual refresh button.
  */
  useEffect(() => {

    if (
      !hasRestoredData ||
      !trainingPlan
    ) {
      return;
    }


    /*
      Debounce because logging one workout may update several
      related state values almost simultaneously.
    */
    const timeout =
      window.setTimeout(
        () => {
          generateNextWeekPreviewEffect();
        },
        700
      );


    return () => {
      window.clearTimeout(
        timeout
      );
    };

  }, [
    hasRestoredData,

    trainingPlan,

    workoutHistory,

    readinessHistory,

    /*
      Benchmark or athlete-profile changes can alter
      prescription for next week.
    */
    athlete.benchmarks,

    athlete.raceDate,

    athlete.targetRace,

    athlete.hoursPerWeek,

    athlete.availableDays,

    athlete.limitations,

    seasonRoadmap,
  ]);


  /*
    ========================================================
    AUTOMATIC CALENDAR ROLLOVER
    ========================================================

    Current Week remains Current Week until the calendar
    actually reaches the next Monday.

    At that point Basse:
    1. reviews the completed week,
    2. archives it,
    3. generates/activates the new week,
    4. starts building a preview of the following week.

    No user action is required.
  */
  const checkWeekRolloverEffect =
    useEffectEvent(async () => {

      if (
        weekRolloverRunningRef.current ||
        isNextWeekLoading
      ) {
        return;
      }


      const activeStart =
        new Date(
          `${trainingPlan!.weekStart}T12:00:00`
        );


      const currentMonday =
        getMonday();


      currentMonday.setHours(
        12,
        0,
        0,
        0
      );


      /*
        Same Monday = still the active week.

        Only advance once the calendar Monday is later than
        the active plan's Monday.
      */
      if (
        currentMonday.getTime() <=
        activeStart.getTime()
      ) {
        return;
      }


      const weekGap =
        Math.round(
          (
            currentMonday.getTime() -
            activeStart.getTime()
          ) /
          (
            7 *
            24 *
            60 *
            60 *
            1000
          )
        );


      const rolloverAttemptKey =
        trainingPlan!.weekStart ??
        `week-${trainingPlan!.weekNumber}`;

      if (
        weekRolloverAttemptedStartRef.current ===
          rolloverAttemptKey
      ) {
        return;
      }


      weekRolloverAttemptedStartRef.current =
        rolloverAttemptKey;

      weekRolloverRunningRef.current =
        true;


      try {

        /*
          NORMAL ROLLOVER

          Exactly one calendar week behind means the normal
          weekly review + next-week generation flow is still
          correct.
        */
        if (weekGap === 1) {
          await generateNextWeekConfirmed();

          return;
        }


        /*
          MISSED-WEEKS RECOVERY

          If Basse has not been opened for two or more
          calendar weeks, never manufacture intermediate
          training weeks.

          Archive only the last real active week and build
          a fresh plan directly for the current calendar
          week from today's date.
        */
        /*
          Freeze the exact outgoing week and athlete context.

          Recovery is destructive: it archives the outgoing
          week, replaces the active week and clears current
          feedback. A late response must therefore never run
          against newer training state.
        */
        const recoveryRequestPlan =
          trainingPlan!;

        const recoveryRequestHistory =
          workoutHistory;

        const recoveryRequestAvailability =
          trainingAvailability;

        const recoveryRequestAthlete =
          athlete;


        setIsNextWeekLoading(
          true
        );


        const response =
          await fetch(
            "/api/plan",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  athlete:
                    recoveryRequestAthlete,

                  trainingAvailability:
                    recoveryRequestAvailability,

                  todayIso:
                    toISODate(
                      new Date()
                    ),
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          throw new Error(
            data.error ||
            "Could not rebuild current week"
          );
        }


        /*
          Do not archive, replace or clear anything if the
          authoritative training context changed while the
          recovery request was running.
        */
        const recoveryIsStale =
          latestTrainingPlanRef.current !==
            recoveryRequestPlan ||
          latestWorkoutHistoryRef.current !==
            recoveryRequestHistory ||
          latestTrainingAvailabilityRef.current !==
            recoveryRequestAvailability ||
          latestAthleteRef.current !==
            recoveryRequestAthlete;


        if (
          recoveryIsStale
        ) {
          return;
        }


        /*
          Archive the final genuinely active week exactly
          once.

          We deliberately do NOT create archive entries for
          calendar weeks where the app had no active plan.
        */
        setPlanHistory(
          (current) => {

            const alreadyStored =
              current.some(
                (plan) =>
                  (
                    plan.weekStart &&
                    recoveryRequestPlan.weekStart &&
                    plan.weekStart ===
                      recoveryRequestPlan.weekStart
                  ) ||
                  (
                    !plan.weekStart &&
                    !recoveryRequestPlan.weekStart &&
                    plan.weekNumber ===
                      recoveryRequestPlan.weekNumber
                  )
              );


            if (alreadyStored) {
              return current;
            }


            return [
              ...current,
              recoveryRequestPlan,
            ];
          }
        );


        setTrainingArchive(
          (current) => {

            const alreadyArchived =
              current.some(
                (entry) =>
                  (
                    entry.plan.weekStart &&
                    recoveryRequestPlan.weekStart &&
                    entry.plan.weekStart ===
                      recoveryRequestPlan.weekStart
                  ) ||
                  (
                    !entry.plan.weekStart &&
                    !recoveryRequestPlan.weekStart &&
                    entry.plan.weekNumber ===
                      recoveryRequestPlan.weekNumber
                  )
              );


            if (alreadyArchived) {
              return current;
            }


            return [
              ...current,
              {
                plan:
                  recoveryRequestPlan,

                feedback:
                  recoveryRequestHistory,

                review:
                  weeklyReview,

                archivedAt:
                  new Date()
                    .toISOString(),
              },
            ];
          }
        );


        /*
          /api/plan may be used mid-week, so today's date is
          authoritative.

          The generated prescription receives the exact
          calendar identity of the current Monday.
        */
        const currentWeekPlan =
          attachWeekDates({
            ...data.plan,

            weekStart:
              toISODate(
                currentMonday
              ),

            weekNumber:
              getISOWeekNumber(
                currentMonday
              ),
          });


        /*
          Calendar availability remains a hard wall even
          during missed-week recovery.
        */
        const availabilitySafePlan =
          repairPlanToResolvedAvailability({
            plan:
              currentWeekPlan,

            athlete:
              recoveryRequestAthlete,

            availability:
              recoveryRequestAvailability,
          });


        const availabilityCheck =
          validatePlanAgainstResolvedAvailability({
            plan:
              availabilitySafePlan,

            athlete:
              recoveryRequestAthlete,

            availability:
              recoveryRequestAvailability,
          });


        if (
          !availabilityCheck.valid
        ) {
          throw new Error(
            "Recovered current week conflicts with Calendar availability."
          );
        }


        /*
          Any provisional Next Week belonged to the old
          calendar context and is stale now.

          Also invalidate an in-flight preview request so it
          cannot write old data back after recovery.
        */
        nextWeekPreviewRequestIdRef.current +=
          1;

        nextWeekPreviewAutoRetryRef.current =
          0;

        setNextWeekPreview(
          null
        );

        setIsNextWeekPreviewLoading(
          false
        );


        setTrainingPlan(
          availabilitySafePlan
        );


        /*
          The new current week begins clean.

          Historical workout feedback and review are already
          preserved inside the archived outgoing week.
        */
        setWorkoutHistory(
          []
        );

        setWeeklyReview(
          null
        );


        showToast(
          `Welcome back. Basse skipped ${weekGap - 1} inactive ${
            weekGap - 1 === 1
              ? "week"
              : "weeks"
          } and rebuilt your plan for the current week.`,
          "success"
        );

      } catch (error) {

        console.error(
          "Week rollover recovery failed:",
          error
        );

        showToast(
          "Basse could not safely rebuild the current week yet.",
          "error"
        );

      } finally {

        setIsNextWeekLoading(
          false
        );

        weekRolloverRunningRef.current =
          false;

      }

    });


  useEffect(() => {

    if (
      !hasRestoredData ||
      !trainingPlan?.weekStart
    ) {
      return;
    }


    /*
      Run the initial rollover check on the next task.

      This preserves the immediate-on-restore behavior
      without synchronously updating React state from
      inside the effect body.
    */
    const initialCheck =
      window.setTimeout(
        () => {
          void checkWeekRolloverEffect();
        },
        0
      );


    /*
      Also check while the app stays open overnight.
      One minute is plenty; this is calendar logic,
      not real-time workout logic.
    */
    const interval =
      window.setInterval(
        () => {
          void checkWeekRolloverEffect();
        },
        60 * 1000
      );


    return () => {
      window.clearTimeout(
        initialCheck
      );

      window.clearInterval(
        interval
      );
    };

  }, [
    hasRestoredData,
    trainingPlan?.weekStart,
    isNextWeekLoading,
  ]);


  function saveReadiness() {
    const result =
      calculateReadiness(
        readinessSleep,
        readinessEnergy,
        readinessSoreness,
        readinessStress,
        readinessMotivation
      );

    const entry: ReadinessEntry = {
      id: `${Date.now()}`,
      date: toISODate(new Date()),
      sleep: readinessSleep,
      energy: readinessEnergy,
      soreness: readinessSoreness,
      stress: readinessStress,
      motivation: readinessMotivation,
      score: result.score,
      status: result.status,
      note: readinessNote.trim(),
      createdAt: new Date().toISOString(),
    };

    setReadinessHistory((current) => [
      ...current.filter(
        (item) =>
          item.date !== entry.date
      ),
      entry,
    ]);

    setReadinessOpen(false);
    setReadinessNote("");

    showToast(
      `Readiness saved: ${result.status} · ${result.score}/100`,
      "success"
    );
  }

  async function generateSeasonRoadmap(
    athleteOverride?: Athlete,
    signal?: AbortSignal
  ): Promise<SeasonRoadmap | null> {

    const roadmapAthlete =
      athleteOverride ??
      athlete;


    if (
      !roadmapAthlete.raceDate
    ) {
      showToast(
        "Set a race date before building your season roadmap.",
        "info"
      );

      return null;
    }


    setIsRoadmapLoading(
      true
    );


    try {

      const response =
        await fetch(
          "/api/roadmap",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                athlete:
                  roadmapAthlete,

                trainingArchive,
              }),

            signal,
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.error ||
          "Could not generate roadmap"
        );
      }


      if (!data.roadmap) {
        throw new Error(
          "Roadmap response contained no roadmap"
        );
      }


      /*
        IMPORTANT:
        The response must belong to the currently
        selected race.

        This is an extra guard in addition to
        AbortController.
      */
      const currentStoredRaceRaw =
        localStorage.getItem(
          "tricoach-target-race"
        );


      if (
        athleteOverride &&
        currentStoredRaceRaw
      ) {
        try {
          const currentStoredRace =
            JSON.parse(
              currentStoredRaceRaw
            );

          if (
            currentStoredRace.id !==
              athleteOverride
                .targetRace?.id ||
            currentStoredRace.date !==
              athleteOverride
                .targetRace?.date
          ) {
            return null;
          }

        } catch {
          // Ignore malformed local fallback.
        }
      }


      setSeasonRoadmap(
        data.roadmap
      );


      localStorage.setItem(
        "tricoach-season-roadmap",
        JSON.stringify(
          data.roadmap
        )
      );


      return data.roadmap;


    } catch (error) {

      if (
        error instanceof DOMException &&
        error.name ===
          "AbortError"
      ) {
        return null;
      }


      console.error(
        "Roadmap generation error:",
        error
      );


      showToast(
        "Basse could not create the season roadmap. Please try again.",
        "error"
      );


      return null;


    } finally {

      if (
        !signal ||
        !signal.aborted
      ) {
        setIsRoadmapLoading(
          false
        );
      }
    }
  }

  async function generatePlan() {
    setIsPlanLoading(true);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          athlete,
          trainingAvailability,

          /*
            The first generated week may begin mid-week.
            The API uses this to build only the remaining
            useful part of the current week.
          */
          todayIso:
            toISODate(
              new Date()
            ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Plan generation failed");
      }

      /*
        ==================================================
        FIRST PARTIAL WEEK SAFETY LAYER
        ==================================================

        Even though /api/plan is told what today is,
        never allow an AI-generated workout to survive
        on a date that has already passed.

        Keep Monday-Sunday structure intact because the
        rest of Basse expects seven calendar days.
      */
      const datedPlan =
        attachWeekDates(
          data.plan
        );


      const now =
        new Date();


      const today =
        toISODate(
          now
        );


      /*
        If the athlete creates the FIRST plan at or
        after 18:00 local time, do not suddenly assign
        a meaningful workout for the same evening.

        The structured plan starts tomorrow instead.
      */
      const startTomorrow =
        now.getHours() >= 18;


      const tomorrowDate =
        new Date(
          now
        );


      tomorrowDate.setDate(
        tomorrowDate.getDate() +
        1
      );


      const firstTrainingDate =
        startTomorrow
          ? toISODate(
              tomorrowDate
            )
          : today;


      const firstWeekDays =
        datedPlan.days.map(
          (day) => {

            if (
              !day.date ||
              day.date >=
                firstTrainingDate
            ) {
              return day;
            }


            /*
              Today is slightly different from a normal
              historical day if the athlete generated
              the plan late in the evening.
            */
            const isLateStartDay =
              startTomorrow &&
              day.date ===
                today;


            return {
              ...day,

              sport:
                "Rest",

              title:
                isLateStartDay
                  ? "Plan starts tomorrow"
                  : "Past day",

              durationMinutes:
                0,

              intensity:
                "No session",

              purpose:
                isLateStartDay
                  ? "Your plan was created late in the day, so structured training starts tomorrow."
                  : "This day had already passed when your training plan was created.",

              details:
                isLateStartDay
                  ? [
                      "No structured workout tonight.",
                      "Recovery, an easy walk or light mobility is optional.",
                      "Start the training plan fresh tomorrow.",
                    ]
                  : [
                      "No workout scheduled.",
                      "Basse does not ask you to make up training from before your plan started.",
                    ],

              workoutStructure: [],
            };
          }
        );


      /*
        Secondary sessions must obey the exact same
        first-training-date rule as primary sessions.

        Otherwise a late-evening plan can correctly show
        "Plan starts tomorrow" for the primary slot while
        still leaking an AI-generated secondary workout
        into Today.
      */
      const firstWeekAdditionalSessions =
        (
          datedPlan.additionalSessions ??
          []
        ).filter(
          (session) =>
            !session.date ||
            session.date >=
              firstTrainingDate
        );


      const firstWeekHours =
        (
          firstWeekDays.reduce(
            (
              total,
              day
            ) =>
              total +
              (
                Number(
                  day.durationMinutes
                ) || 0
              ),
            0
          ) +
          firstWeekAdditionalSessions.reduce(
            (
              total,
              day
            ) =>
              total +
              (
                Number(
                  day.durationMinutes
                ) || 0
              ),
            0
          )
        ) / 60;


      const firstWeekPlan = {
        ...datedPlan,

        days:
          firstWeekDays,

        additionalSessions:
          firstWeekAdditionalSessions,

        totalHours:
          Number(
            firstWeekHours.toFixed(
              2
            )
          ),
      };


      setTrainingPlan(
        firstWeekPlan
      );

      setDashboardView("today");
      setScreen("dashboard");

      const hasSeenFirstPlanIntro =
        localStorage.getItem(
          "tricoach-first-plan-intro-v1"
        ) === "seen";

      if (!hasSeenFirstPlanIntro) {
        setFirstPlanIntroOpen(true);
      }
    } catch (error) {
      console.error("Plan generation error:", error);
      showToast(
        "Basse could not build your week. Please try again.",
        "error"
      );
    } finally {
      setIsPlanLoading(false);
    }
  }

  async function logOut() {
    try {

      /*
        Finish the authenticated user's queued cloud state
        before revoking the session.
      */
      await Promise.all([
        trainingStateWriteQueueRef.current,
        profileWriteQueueRef.current,
      ]);


      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      localStorage.removeItem("tricoach-athlete");
      localStorage.removeItem(
        "tricoach-performance-benchmarks"
      );
      localStorage.removeItem(
        "tricoach-target-race"
      );
      localStorage.removeItem("tricoach-plan");
      localStorage.removeItem(
        "tricoach-training-state-updated-at"
      );
      localStorage.removeItem("tricoach-workout-history");
      localStorage.removeItem("tricoach-plan-history");
      localStorage.removeItem(
        "tricoach-next-week-preview"
      );
      localStorage.removeItem("tricoach-weekly-review");
      localStorage.removeItem(
        "tricoach-training-availability"
      );

      /*
        After logout, return to the public landing page.

        replace() prevents the browser Back button from
        returning to the previously authenticated view.
      */
      window.location.replace("/");
    } catch (error) {
      console.error("Could not log out:", error);
      showToast(
        "Could not log out. Please try again.",
        "error"
      );
    }
  }

  function openDeleteAccount() {

    setDeleteAccountError("");
    setSettingsOpen(false);
    setDeleteAccountOpen(true);
  }


  async function deleteAccountConfirmed() {

    if (
      isDeletingAccount
    ) {
      return;
    }


    setIsDeletingAccount(true);
    setDeleteAccountError("");

    /*
      Disable normal persistence before draining writes.
      No stale profile or training-state save may race the
      irreversible auth-user deletion.
    */
    setHasRestoredData(false);


    try {

      await Promise.all([
        trainingStateWriteQueueRef.current,
        profileWriteQueueRef.current,
      ]);


      const response =
        await fetch(
          "/api/account",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                confirmation:
                  "DELETE",
              }),
          }
        );


      const data =
        await response
          .json()
          .catch(
            () => ({})
          );


      if (
        !response.ok ||
        data.deleted !== true
      ) {
        throw new Error(
          typeof data.error ===
            "string"
            ? data.error
            : "Basse could not delete your account. Please try again."
        );
      }


      /*
        The server has already deleted the authoritative
        account. Local sign-out is best-effort cleanup of
        this browser's now-invalid session.
      */
      const {
        error:
          localSignOutError,
      } =
        await supabase.auth
          .signOut({
            scope:
              "local",
          });


      if (
        localSignOutError
      ) {
        console.warn(
          "Basse deleted the account but local session cleanup reported an error."
        );
      }


      localStorage.clear();
      sessionStorage.clear();


      /*
        replace() prevents browser Back from returning to
        the deleted account's authenticated dashboard.
      */
      window.location.replace(
        "/account-deletion?deleted=1"
      );

    } catch (error) {

      /*
        The account still exists when the endpoint fails,
        so normal persistence must resume.
      */
      setHasRestoredData(true);

      setDeleteAccountError(
        error instanceof Error
          ? error.message
          : "Basse could not delete your account. Please try again."
      );

    } finally {
      setIsDeletingAccount(false);
    }
  }


  /*
    ==========================================================
    ONBOARDING PERFORMANCE BENCHMARKS
    ==========================================================

    Optional.

    During onboarding we only save the values into the
    athlete profile. There is no existing training plan
    to adapt yet.
  */
  function saveOnboardingPerformanceBenchmarks(
    benchmarks: NonNullable<
      Athlete["benchmarks"]
    >
  ) {

    localStorage.setItem(
      "tricoach-performance-benchmarks",
      JSON.stringify(
        benchmarks
      )
    );


    setAthlete(
      (current) => ({
        ...current,
        benchmarks,
      })
    );


    setBenchmarkModalOpen(
      false
    );


    showToast(
      "Performance benchmarks saved.",
      "success"
    );
  }


  function openPerformanceBenchmarks() {
    setSettingsOpen(false);
    setBenchmarkModalOpen(true);
  }


  async function savePerformanceBenchmarks(
    benchmarks: NonNullable<
      Athlete["benchmarks"]
    >
  ) {

    const updatedAthlete:
      Athlete = {
        ...athlete,
        benchmarks,
      };


    localStorage.setItem(
      "tricoach-performance-benchmarks",
      JSON.stringify(
        benchmarks
      )
    );


    setAthlete(
      updatedAthlete
    );


    setBenchmarkModalOpen(
      false
    );


    /*
      ======================================================
      APPLY BENCHMARKS TO ACTIVE WEEK
      ======================================================

      Use the same deterministic benchmark prescription engine
      as Initial Plan, Next Week and Coach.

      workoutStructure remains the executable source of truth.
      Benchmark references are attached to the appropriate
      canonical blocks rather than independently rewriting
      workout prose on the client.
    */

    if (trainingPlan) {

      const updatedWeek =
        applyBenchmarkPrescriptionToPlan(
          trainingPlan,
          updatedAthlete
        );


      setTrainingPlan(
        updatedWeek
      );
    }


    /*
      ======================================================
      SEASON CAN STILL BE REBUILT STRATEGICALLY
      ======================================================
    */

    if (
      updatedAthlete.raceDate
    ) {

      setIsRoadmapLoading(
        true
      );


      try {

        const response =
          await fetch(
            "/api/roadmap",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  athlete:
                    updatedAthlete,

                  trainingArchive,
                }),
            }
          );


        const data =
          await response.json();


        if (
          response.ok &&
          data.roadmap
        ) {
          setSeasonRoadmap(
            data.roadmap
          );
        }

      } catch (error) {

        console.warn(
          "Benchmark roadmap refresh failed:",
          error
        );

      } finally {

        setIsRoadmapLoading(
          false
        );
      }
    }


    showToast(
      trainingPlan
        ? "Benchmarks saved. Future Week sessions now use your updated performance targets."
        : "Performance benchmarks saved.",
      "success"
    );
  }



  function openAppFeedback() {
    setSettingsOpen(false);
    setAppFeedbackOpen(true);
  }


  async function submitAppFeedback({
    category,
    message,
    contactAllowed,
  }: {
    category:
      | "Bug"
      | "Idea"
      | "Design"
      | "Other";

    message:
      string;

    contactAllowed:
      boolean;
  }) {

    const {
      data: {
        user: feedbackUser,
      },
      error: feedbackUserError,
    } =
      await supabase.auth.getUser();


    if (
      feedbackUserError ||
      !feedbackUser
    ) {
      throw (
        feedbackUserError ??
        new Error(
          "You must be signed in to send feedback."
        )
      );
    }


    const feedbackUserId =
      feedbackUser.id;


    if (
      userId !==
      feedbackUserId
    ) {
      setUserId(
        feedbackUserId
      );
    }


    if (
      feedbackUser.email &&
      userEmail !==
        feedbackUser.email
    ) {
      setUserEmail(
        feedbackUser.email
      );
    }


    const pageContext =
      screen === "dashboard"
        ? dashboardView
        : screen;


    const metadata = {
      screen,
      dashboardView:
        screen === "dashboard"
          ? dashboardView
          : null,

      weekStart:
        trainingPlan?.weekStart ??
        null,

      weekNumber:
        trainingPlan?.weekNumber ??
        null,

      targetRaceId:
        athlete.targetRace?.id ??
        null,

      targetRaceName:
        athlete.targetRace?.name ??
        null,

      goal:
        athlete.goal,

      unitSystem:
        athlete.unitSystem ??
        "Metric",

      viewport:
        typeof window !== "undefined"
          ? {
              width:
                window.innerWidth,
              height:
                window.innerHeight,
            }
          : null,
    };


    const {
      error,
    } =
      await supabase
        .from(
          "app_feedback"
        )
        .insert({
          user_id:
            feedbackUserId,

          category,

          message:
            message.trim(),

          contact_email:
            contactAllowed &&
            userEmail
              ? userEmail
              : null,

          page_context:
            pageContext,

          metadata,
        });


    if (error) {
      throw error;
    }


    setAppFeedbackOpen(
      false
    );


    showToast(
      "Thanks — your feedback was sent.",
      "success"
    );
  }


  function openTargetRace() {
    setSettingsOpen(false);
    setTargetRaceModalOpen(true);
  }


  function openManualTargetRace() {
    setTargetRaceModalOpen(false);
    setManualRaceModalOpen(true);
  }


  async function reviewCurrentWeekAfterRaceChange({
    previousRace,
    race,
    updatedAthlete,
    goalChange,
  }: {
    previousRace:
      Athlete["targetRace"];

    race:
      NonNullable<
        Athlete["targetRace"]
      >;

    updatedAthlete:
      Athlete;

    goalChange:
      ReturnType<
        typeof evaluateGoalChange
      >;
  }) {

    if (!trainingPlan) {
      return;
    }


    /*
      Freeze the exact training context this race review
      is generated from.

      The response may arrive after the athlete logs,
      edits or otherwise changes training.
    */
    const requestPlan =
      trainingPlan;

    const requestHistory =
      workoutHistory;

    const requestAvailability =
      trainingAvailability;

    const requestAthlete =
      updatedAthlete;


    /*
      --------------------------------------------------
      RACE PROXIMITY
      --------------------------------------------------

      A target race <= 4 weeks away always requires
      a review of the remaining current week.

      At that point the athlete is effectively in
      Peak / Taper territory and an old generic week
      may no longer make sense.
    */

    const today =
      new Date();

    const todayDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        12
      );

    const targetDate =
      new Date(
        `${race.date}T12:00:00`
      );


    const daysToRace =
      Number.isNaN(
        targetDate.getTime()
      )
        ? null
        : Math.max(
            0,
            Math.ceil(
              (
                targetDate.getTime() -
                todayDate.getTime()
              ) /
                86_400_000
            )
          );


    const closeToRace =
      daysToRace !== null &&
      daysToRace <= 28;


    const normalGoalReview =
      goalChange.action ===
        "ADAPT_CURRENT_AND_FUTURE" ||
      goalChange.action ===
        "REBUILD_ROADMAP";


    if (
      !closeToRace &&
      !normalGoalReview
    ) {
      return;
    }


    /*
      Completed / past / manual sessions remain
      protected.

      For close races we force review even if the
      general Goal Change Engine classified the
      race switch as relatively similar.
    */

    const completedFeedback =
      requestHistory.filter(
        (entry) =>
          entry.status ===
            "Completed" ||
          entry.status ===
            "Modified"
      );


    const protectedSessionIds =
      completedFeedback
        .map(
          (entry) =>
            entry.sessionId
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        );


    const protectedDates =
      completedFeedback
        .map(
          (entry) =>
            entry.date
        )
        .filter(
          (
            date
          ): date is string =>
            Boolean(date)
        );


    const todayIso =
      toISODate(
        today
      );


    for (
      const day
      of requestPlan.days
    ) {
      if (
        day.date &&
        day.date < todayIso
      ) {
        protectedDates.push(
          day.date
        );

        if (
          day.sessionId
        ) {
          protectedSessionIds.push(
            day.sessionId
          );
        }
      }
    }


    const currentWeekAnalysis = {
      shouldReview:
        true,

      reason:
        closeToRace
          ? `The new target race is only ${daysToRace} days away, so the remaining current-week sessions should be aligned with race readiness and taper needs.`
          : "The target race changed enough that the remaining planned sessions may benefit from race-specific adjustment.",

      protectedSessionIds:
        Array.from(
          new Set(
            protectedSessionIds
          )
        ),

      protectedDates:
        Array.from(
          new Set(
            protectedDates
          )
        ),

      preservedManualSessions:
        (
          requestPlan.additionalSessions ??
          []
        ).filter(
          (session) =>
            session.sessionSource !== "coach"
        ).length,
    };


    try {

      const response =
        await fetch(
          "/api/goal-change-week",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                athlete:
                  updatedAthlete,

                previousRace:
                  previousRace ??
                  null,

                nextRace:
                  race,

                currentPlan:
                  requestPlan,

                currentWeekAnalysis,

                coachingSignals: {
                  readinessHistory,
                  weeklyReview,

                  raceProximity: {
                    daysToRace,
                    closeToRace,
                  },
                },

                trainingAvailability,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.error ||
          "Could not review current week"
        );
      }


      /*
        Ignore the result if the athlete selected
        another race while this request was running.
      */
      const currentRaceRaw =
        localStorage.getItem(
          "tricoach-target-race"
        );


      if (currentRaceRaw) {
        const currentRace =
          JSON.parse(
            currentRaceRaw
          );

        if (
          currentRace.id !==
            race.id ||
          currentRace.date !==
            race.date
        ) {
          return;
        }
      }


      /*
        Race identity alone is not enough.

        The selected race may still be the same while the
        athlete logs a workout, changes Calendar availability,
        edits the plan or updates Athlete Profile during this
        request. In that case the AI response belongs to an
        obsolete training context and must not be applied.
      */
      const raceReviewIsStale =
        latestTrainingPlanRef.current !==
          requestPlan ||
        latestWorkoutHistoryRef.current !==
          requestHistory ||
        latestTrainingAvailabilityRef.current !==
          requestAvailability ||
        latestAthleteRef.current !==
          requestAthlete;


      if (
        raceReviewIsStale
      ) {
        return;
      }


      if (
        !data.changed ||
        !data.plan
      ) {
        return;
      }


      /*
        --------------------------------------------------
        CLOSE RACE: APPLY AUTOMATICALLY
        --------------------------------------------------

        Within four weeks the week should actually
        reflect the new race immediately.

        mergeCoachPlanChange keeps our normal plan
        merge semantics and adjustment metadata.
      */

      if (closeToRace) {

        const appliedPlan =
          mergeCoachPlanChange({
            currentPlan:
              requestPlan,

            proposedPlan:
              data.plan,

            reason:
              data.reason ||
              `Current week adapted because ${race.name} is only ${daysToRace} days away.`,

            feedback:
              requestHistory,
          });


        setTrainingPlan(
          appliedPlan
        );


        showToast(
          `This week was updated for ${race.name}. ${daysToRace} days to race — completed and manual sessions were preserved.`,
          "success"
        );


        return;
      }


      /*
        --------------------------------------------------
        MORE THAN FOUR WEEKS:
        KEEP EXISTING REVIEW FLOW
        --------------------------------------------------
      */

      pendingCoachPlanBaselineRef.current =
        requestPlan;

      pendingCoachHistoryBaselineRef.current =
        requestHistory;

      pendingCoachAvailabilityBaselineRef.current =
        requestAvailability;

      pendingCoachAthleteBaselineRef.current =
        requestAthlete;


      setPendingCoachPlanChange(
        data.plan
      );


      setPendingCoachPlanReason(
        data.reason ||
        `Target race changed to ${race.name}.`
      );


      setPendingCoachDecisionTrace({
        headline:
          "Your new goal may affect this week",

        signals:
          goalChange.factors
            .slice(0, 4)
            .map(
              (factor) =>
                `${factor.label}: ${factor.detail}`
            ),

        decision:
          "Review upcoming sessions while preserving completed and manually added training.",

        confidence:
          goalChange.score >= 40
            ? "High"
            : "Moderate",
      });


    } catch (error) {

      console.error(
        "Current-week goal review error:",
        error
      );


      /*
        Race and season updates are still valid
        even if current-week refinement fails.
      */
      if (closeToRace) {
        showToast(
          "Your race and season were updated, but Basse could not adapt this week's remaining sessions.",
          "info"
        );
      }
    }
  }

  function saveTargetRace(
    race: NonNullable<
      Athlete["targetRace"]
    >
  ) {

    const previousRace =
      athlete.targetRace;


    const goalChange =
      evaluateGoalChange(
        previousRace,
        race
      );


    let syncedGoal:
      Athlete["goal"] =
        athlete.goal;


    if (
      race.format ===
        "Sprint"
    ) {
      syncedGoal = "Sprint";

    } else if (
      race.format ===
        "Olympic"
    ) {
      syncedGoal = "Olympic";

    } else if (
      race.format ===
        "70.3"
    ) {
      syncedGoal = "70.3";

    } else if (
      race.format ===
        "Ironman"
    ) {
      syncedGoal = "Ironman";
    }


    const updatedAthlete:
      Athlete = {
        ...athlete,

        targetRace:
          race,

        raceDate:
          race.date,

        goal:
          syncedGoal,
      };


    /*
      ==================================================
      IMMEDIATE PART
      ==================================================

      No network request is allowed before this.
    */

    localStorage.setItem(
      "tricoach-target-race",
      JSON.stringify(
        race
      )
    );


    localStorage.setItem(
      "tricoach-athlete",
      JSON.stringify(
        updatedAthlete
      )
    );


    setAthlete(
      updatedAthlete
    );


    /*
      Target-race changes materially change upcoming
      training context.

      Never keep showing a Next Week preview generated
      for the previous target.
    */
    nextWeekPreviewRequestIdRef.current +=
      1;

    nextWeekPreviewAutoRetryRef.current =
      0;

    setNextWeekPreview(
      null
    );

    setIsNextWeekPreviewLoading(
      false
    );


    /*
      CURRENT-WEEK RACE ADAPTATION OWNERSHIP

      Do not mutate the active training week locally here.

      reviewCurrentWeekAfterRaceChange() is the single
      current-week race-goal adaptation path. Its server route
      owns canonical workout validation, authoritative dates,
      Calendar availability and legacy-safe preservation.

      Keeping one plan writer prevents race-specific session
      builders from drifting away from the canonical workout
      contract.
    */


    /*
      The old weekly review belongs to the old
      race context.
    */
    setWeeklyReview(
      null
    );


    /*
      INSTANT SEASON

      Race date, season length and phase structure
      update immediately without waiting for AI.
    */
    const instantRoadmap =
      buildInstantSeasonRoadmap(
        updatedAthlete
      );


    const previousRoadmap =
      seasonRoadmap;


    setSeasonRoadmap(
      instantRoadmap
    );


    localStorage.setItem(
      "tricoach-season-roadmap",
      JSON.stringify(
        instantRoadmap
      )
    );


    if (
      previousRoadmap
    ) {
      setRoadmapRevisions(
        (current) => [
          ...current,

          {
            id:
              `goal-change-${Date.now()}`,

            createdAt:
              new Date()
                .toISOString(),

            reason:
              `Target race changed from ${
                previousRace
                  ?.name ??
                "previous goal"
              } to ${race.name}.`,

            summary:
              `Season immediately recalculated for ${race.name} on ${race.date}.`,

            previousRoadmap,

            updatedRoadmap:
              instantRoadmap,
          },
        ]
      );
    }


    setTargetRaceModalOpen(
      false
    );

    setManualRaceModalOpen(
      false
    );


    showToast(
      `Goal changed to ${race.name}. Refining your season…`,
      "info"
    );


    /*
      Season is now already updated instantly.

      AI roadmap generation is deliberately NOT
      triggered automatically on target change.

      The existing "Update season" button can still
      call /api/roadmap for deeper AI refinement.
    */


    /*
      ==================================================
      AUTOMATIC AI SEASON REFINEMENT
      ==================================================

      The deterministic roadmap is already visible,
      so this network request never blocks the UI.

      If another race is selected while this request
      is running, AbortController prevents stale data
      from replacing the newer season.
    */

    raceChangeAbortRef
      .current
      ?.abort();


    const controller =
      new AbortController();


    raceChangeAbortRef.current =
      controller;


    setIsRoadmapLoading(
      true
    );


    void generateSeasonRoadmap(
      updatedAthlete,
      controller.signal
    )
      .then(
        (
          refinedRoadmap
        ) => {

          if (
            controller.signal.aborted ||
            !refinedRoadmap
          ) {
            return;
          }


          /*
            The instant roadmap has already been saved
            as the first revision.

            AI refinement now becomes the active roadmap.
          */
          setSeasonRoadmap(
            refinedRoadmap
          );


          localStorage.setItem(
            "tricoach-season-roadmap",
            JSON.stringify(
              refinedRoadmap
            )
          );


          showToast(
            `Season refined for ${race.name}.`,
            "success"
          );
        }
      )
      .catch(
        (error) => {

          if (
            controller.signal
              .aborted
          ) {
            return;
          }


          console.error(
            "Automatic season refinement error:",
            error
          );


          /*
            Important:
            the instant roadmap remains valid and visible.
          */
          showToast(
            "Your season is ready, but the detailed refinement could not be completed.",
            "info"
          );
        }
      );


    /*
      ==================================================
      CURRENT WEEK
      ==================================================

      Single authoritative race-goal adaptation path.

      The race/season update above stays immediate and never
      waits for AI. Current-week training refinement runs
      asynchronously through /api/goal-change-week, which owns
      canonical workout safety and Calendar availability.

      For close races (<= 28 days), the review function
      automatically applies a safe returned plan.
      For more distant races, it keeps the existing review /
      proposal behavior when a current-week change is warranted.
    */
    const raceDate =
      new Date(
        `${race.date}T12:00:00`
      );

    const now =
      new Date();

    now.setHours(
      12,
      0,
      0,
      0
    );

    const daysToRace =
      Math.ceil(
        (
          raceDate.getTime() -
          now.getTime()
        ) /
          86_400_000
      );


    if (
      !Number.isNaN(
        daysToRace
      ) &&
      daysToRace >= 0
    ) {
      void reviewCurrentWeekAfterRaceChange({
        previousRace,
        race,
        updatedAthlete,
        goalChange,
      });
    }
  }

  function removeTargetRace() {
    localStorage.removeItem(
      "tricoach-target-race"
    );

    setAthlete((current) => {
      const nextAthlete = {
        ...current,
      };

      delete nextAthlete.targetRace;

      return nextAthlete;
    });

    setTargetRaceModalOpen(false);
    setManualRaceModalOpen(false);

    showToast(
      "Target race removed.",
      "info"
    );
  }


  function editAthleteProfile() {
    setSettingsOpen(false);
    setScreen("athleteProfile");
  }


  async function saveAthleteProfile(
    nextAthlete: Athlete
  ) {

    /*
      Athlete Profile contains both cosmetic/profile-only
      values and training inputs.

      Only rebuild training when a value that can genuinely
      affect prescription has changed.
    */
    function trainingSnapshot(
      value: Athlete
    ) {
      return {
        goal:
          value.goal,

        hoursPerWeek:
          value.hoursPerWeek,

        currentTrainingHours:
          value.currentTrainingHours,

        weakestDiscipline:
          value.weakestDiscipline,

        experience:
          value.experience,

        performanceTier:
          value.performanceTier,

        swimLevel:
          value.swimLevel,

        bikeLevel:
          value.bikeLevel,

        runLevel:
          value.runLevel,

        availableDays:
          value.availableDays,

        weeklyAvailability:
          value.weeklyAvailability,

        longestSessionMinutes:
          value.longestSessionMinutes,

        poolAccess:
          value.poolAccess,

        indoorTrainer:
          value.indoorTrainer,

        gymAccess:
          value.gymAccess,

        limitations:
          value.limitations,
      };
    }


    const trainingChanged =
      JSON.stringify(
        trainingSnapshot(
          athlete
        )
      ) !==
      JSON.stringify(
        trainingSnapshot(
          nextAthlete
        )
      );


    /*
      Save the profile immediately.

      The replan request below receives nextAthlete directly,
      so it never depends on React state having finished its
      asynchronous update first.
    */
    setAthlete(
      nextAthlete
    );


    setScreen(
      "dashboard"
    );

    setSettingsOpen(
      true
    );


    if (
      !trainingChanged ||
      !trainingPlan
    ) {
      showToast(
        "Athlete profile updated.",
        "success"
      );

      return;
    }


    /*
      Training-profile changes also change the season load
      envelope.

      Next Week uses the roadmap targetHours as strategic
      context, so keeping a roadmap created from the old
      profile can make the newly saved athlete settings appear
      to have no effect.

      Rebuild the deterministic season immediately from the
      newly saved athlete before regenerating Week / Next Week.
    */
    if (
      nextAthlete.raceDate
    ) {
      const refreshedRoadmap =
        buildInstantSeasonRoadmap(
          nextAthlete
        );

      setSeasonRoadmap(
        refreshedRoadmap
      );

      localStorage.setItem(
        "tricoach-season-roadmap",
        JSON.stringify(
          refreshedRoadmap
        )
      );
    }


    setIsPlanLoading(
      true
    );


    /*
      Any existing Next Week was calculated from the old
      athlete profile and is therefore stale.

      Also invalidate any preview request that was already
      running with the previous athlete profile.

      Without this, an older request can finish after Save
      and write the stale preview back into state. The normal
      automatic Next Week effect will then rebuild from the
      newly saved athlete + current-week plan.
    */
    nextWeekPreviewRequestIdRef.current +=
      1;

    nextWeekPreviewAutoRetryRef.current =
      0;

    setNextWeekPreview(
      null
    );

    setIsNextWeekPreviewLoading(
      false
    );


    /*
      Freeze the authoritative context this /api/plan
      request is based on.

      nextAthlete is intentionally the NEW profile.
      Plan/history/availability are the exact training state
      that existed when Save triggered the regeneration.
    */
    const requestPlan =
      trainingPlan;

    const requestHistory =
      workoutHistory;

    const requestAvailability =
      trainingAvailability;

    const requestAthlete =
      nextAthlete;


    try {

      const response =
        await fetch(
          "/api/plan",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                athlete:
                  nextAthlete,

                trainingAvailability:
                  requestAvailability,

                todayIso:
                  toISODate(
                    new Date()
                  ),
              }),
          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          data.error ||
          "Profile replan failed"
        );
      }


      /*
        Never let a late profile-regeneration response
        overwrite training that changed while Basse was
        building the new week.

        This protects:
        - newly logged sessions
        - manual plan edits
        - Calendar changes
        - a newer Athlete Profile save
        - any other active-plan mutation
      */
      const profileReplanIsStale =
        latestTrainingPlanRef.current !==
          requestPlan ||
        latestWorkoutHistoryRef.current !==
          requestHistory ||
        latestTrainingAvailabilityRef.current !==
          requestAvailability ||
        latestAthleteRef.current !==
          requestAthlete;


      if (
        profileReplanIsStale
      ) {
        showToast(
          "Your training changed while Basse was rebuilding the week, so the outdated replan was not applied.",
          "info"
        );

        return;
      }


      /*
        Keep this as the SAME active calendar week.

        /api/plan provides the new prescription, while the
        existing active week owns the calendar identity.
      */
      const activeWeekStart =
        requestPlan.weekStart ??
        toISODate(
          getMonday()
        );


      const activeWeekDate =
        new Date(
          `${activeWeekStart}T12:00:00`
        );


      const generatedPlan =
        attachWeekDates({
          ...data.plan,

          weekStart:
            activeWeekStart,

          weekNumber:
            getISOWeekNumber(
              activeWeekDate
            ),
        });


      const todayIso =
        toISODate(
          new Date()
        );


      function isLogged(
        workout: TrainingPlanDay
      ) {
        return requestHistory.some(
          (entry) =>
            workoutMatchesFeedback(
              workout,
              entry
            )
        );
      }


      /*
        Profile changes should reshape what is still ahead,
        but must never rewrite training that already happened.

        Preserve:
        - past calendar days
        - workouts already logged today
      */
      const mergedDays =
        generatedPlan.days.map(
          (generatedDay) => {

            const existingDay =
              requestPlan.days.find(
                (day) =>
                  day.date ===
                    generatedDay.date
              );


            if (
              !existingDay
            ) {
              return generatedDay;
            }


            const isPast =
              !!existingDay.date &&
              existingDay.date <
                todayIso;


            if (
              isPast ||
              isLogged(
                existingDay
              )
            ) {
              return existingDay;
            }


            return generatedDay;
          }
        );


      const existingAdditional =
        requestPlan
          .additionalSessions ??
        [];


      const generatedAdditional =
        generatedPlan
          .additionalSessions ??
        [];


      const preservedAdditional =
        existingAdditional.filter(
          (session) => {

            const isPast =
              !!session.date &&
              session.date <
                todayIso;


            return (
              isPast ||
              isLogged(
                session
              )
            );
          }
        );


      const futureAdditional =
        generatedAdditional.filter(
          (session) => {

            return !preservedAdditional.some(
              (existing) =>
                existing.date ===
                  session.date &&
                existing.sessionSlot ===
                  session.sessionSlot
            );
          }
        );


      const mergedAdditional = [
        ...preservedAdditional,
        ...futureAdditional,
      ];


      const recalculatedHours =
        (
          mergedDays.reduce(
            (
              total,
              day
            ) =>
              total +
              (
                Number(
                  day.durationMinutes
                ) || 0
              ),
            0
          ) +
          mergedAdditional.reduce(
            (
              total,
              day
            ) =>
              total +
              (
                Number(
                  day.durationMinutes
                ) || 0
              ),
            0
          )
        ) / 60;


      const mergedPlan:
        TrainingPlan = {
          ...generatedPlan,

          days:
            mergedDays,

          additionalSessions:
            mergedAdditional,

          totalHours:
            Number(
              recalculatedHours.toFixed(
                2
              )
            ),
        };


      /*
        Calendar availability remains a hard constraint even
        when the athlete profile itself triggered the replan.
      */
      const availabilitySafePlan =
        repairPlanToResolvedAvailability({
          plan:
            mergedPlan,

          athlete:
            nextAthlete,

          availability:
            requestAvailability,
        });


      const availabilityCheck =
        validatePlanAgainstResolvedAvailability({
          plan:
            availabilitySafePlan,

          athlete:
            nextAthlete,

          availability:
            requestAvailability,
        });


      if (
        !availabilityCheck.valid
      ) {
        console.error(
          "Athlete profile replan conflicts with availability:",
          availabilityCheck.violations
        );

        throw new Error(
          "Profile replan could not satisfy Calendar availability."
        );
      }


      setTrainingPlan(
        availabilitySafePlan
      );


      /*
        trainingPlan changes trigger the existing automatic
        Next Week effect, which now rebuilds the provisional
        week using the new athlete profile.
      */
      nextWeekPreviewAutoRetryRef.current =
        0;


      showToast(
        "Athlete profile updated. Week and Next Week are adapting to your new training profile.",
        "success"
      );


    } catch (error) {

      console.error(
        "Athlete profile replan error:",
        error
      );


      /*
        The athlete profile itself is still valid and remains
        saved. Keep the existing active week rather than
        replacing it with an unsafe or incomplete plan.
      */
      showToast(
        "Athlete profile was saved, but Basse could not rebuild the training week yet.",
        "error"
      );


    } finally {

      setIsPlanLoading(
        false
      );

    }
  }


  function cancelAthleteProfile() {
    setScreen(
      "dashboard"
    );

    setSettingsOpen(
      true
    );
  }

  function resetTrainingPlan() {
    setSettingsOpen(false);

    requestConfirmation({
      title: "Reset your training plan?",
      message:
        "Your account and athlete profile will stay intact. Your active training plan, workout feedback and weekly review will be cleared so you can build a fresh plan.",
      confirmLabel: "Reset training plan",
      destructive: true,
      action: () => {
        resetTrainingPlanConfirmed();
      },
    });
  }

  async function resetTrainingPlanConfirmed() {
    setIsResetting(true);


    /*
      Stop persistence from scheduling new writes while the
      reset is establishing a clean cloud/local baseline.
    */
    setHasRestoredData(
      false
    );


    try {

      /*
        Any save started before the reset must finish BEFORE
        cloud deletion, otherwise it could recreate old state.
      */
      await trainingStateWriteQueueRef.current;


      if (userId) {

        /*
          Reset only the active planning context.

          Preserve:
          - trainingArchive
          - seasonRoadmap
          - roadmapRevisions
          - readinessHistory

          Those are athlete history/context, not the active
          training plan being reset.

          Use UPSERT rather than DELETE because this app
          already relies on UPSERT permissions and DELETE
          may be blocked by Supabase RLS.
        */
        const { error } =
          await supabase
            .from(
              "training_state"
            )
            .upsert(
              {
                user_id:
                  userId,

                active_plan:
                  null,

                workout_history:
                  [],

                plan_history:
                  [],

                training_archive:
                  trainingArchive,

                season_roadmap:
                  seasonRoadmap,

                roadmap_revisions:
                  roadmapRevisions,

                readiness_history:
                  readinessHistory,

                weekly_review:
                  null,

                updated_at:
                  new Date()
                    .toISOString(),
              },
              {
                onConflict:
                  "user_id",
              }
            );

        if (error) {
          throw error;
        }
      }

      localStorage.removeItem("tricoach-plan");
      localStorage.removeItem(
        "tricoach-training-state-updated-at"
      );
      localStorage.removeItem("tricoach-workout-history");
      localStorage.removeItem("tricoach-plan-history");
      localStorage.removeItem("tricoach-weekly-review");

      setTrainingPlan(null);
      setWorkoutHistory([]);
      setPlanHistory([]);
      setNextWeekPreview(null);
      setWeeklyReview(null);

      setConfirmState(null);

      showToast(
        "Training plan reset. Your athlete profile is still saved.",
        "success"
      );

      setStep(0);
      setScreen("onboarding");


      /*
        Re-enable persistence for the clean onboarding state
        and for the new plan that will be created next.
      */
      setHasRestoredData(
        true
      );

    } catch (error) {

      /*
        A failed reset must not leave normal persistence
        permanently disabled.
      */
      setHasRestoredData(
        true
      );
      console.error(
        "Could not reset training plan:",
        error
      );

      showToast(
        "Could not reset the training plan. Please try again.",
        "error"
      );
    } finally {
      setIsResetting(false);
    }
  }

  function getWeeklyAvailabilityDays(
    sport:
      | "Swim"
      | "Bike"
      | "Run"
      | "Strength"
  ) {
    return (
      athlete.weeklyAvailability?.[
        sport
      ] ??
      athlete.availableDays
    );
  }


  function toggleWeeklyAvailableDay(
    sport:
      | "Swim"
      | "Bike"
      | "Run"
      | "Strength",
    day: string
  ) {
    setAthlete((current) => {

      const fallbackDays =
        current.availableDays as NonNullable<
          Athlete["weeklyAvailability"]
        >["Swim"];


      const currentWeekly =
        current.weeklyAvailability ?? {
          Swim:
            [...fallbackDays],

          Bike:
            [...fallbackDays],

          Run:
            [...fallbackDays],

          Strength:
            [...fallbackDays],
        };


      const currentDays =
        currentWeekly[
          sport
        ];


      const nextDays =
        currentDays.includes(
          day as typeof currentDays[number]
        )
          ? currentDays.filter(
              (item) =>
                item !== day
            )
          : [
              ...currentDays,
              day as typeof currentDays[number],
            ];


      const nextWeekly = {
        ...currentWeekly,

        [sport]:
          nextDays,
      };


      /*
        Keep legacy availableDays as a permissive union.

        New planning should use weeklyAvailability,
        but old code must not become more restrictive
        while we complete the migration.
      */
      const legacyDays =
        Array.from(
          new Set([
            ...nextWeekly.Swim,
            ...nextWeekly.Bike,
            ...nextWeekly.Run,
            ...nextWeekly.Strength,
          ])
        );


      return {
        ...current,

        weeklyAvailability:
          nextWeekly,

        availableDays:
          legacyDays,
      };
    });
  }

  /*
    ==========================================================
    ONBOARDING TARGET RACE
    ==========================================================

    During onboarding we only want to populate the athlete
    profile.

    Do NOT run the existing active-plan goal-change machinery
    here because the first training plan has not been created.
  */
  function selectOnboardingTargetRace(
    race: NonNullable<
      Athlete["targetRace"]
    >
  ) {

    let syncedGoal:
      Athlete["goal"] =
        athlete.goal;


    if (race.format === "Sprint") {
      syncedGoal = "Sprint";

    } else if (
      race.format === "Olympic"
    ) {
      syncedGoal = "Olympic";

    } else if (
      race.format === "70.3"
    ) {
      syncedGoal = "70.3";

    } else if (
      race.format === "Ironman"
    ) {
      syncedGoal = "Ironman";
    }


    const nextAthlete:
      Athlete = {
        ...athlete,

        targetRace:
          race,

        raceDate:
          race.date,

        goal:
          syncedGoal,
      };


    setAthlete(
      nextAthlete
    );


    localStorage.setItem(
      "tricoach-target-race",
      JSON.stringify(
        race
      )
    );


    setTargetRaceModalOpen(
      false
    );

    setManualRaceModalOpen(
      false
    );


    showToast(
      `${race.name} selected as your target race.`,
      "success"
    );
  }


  /*
    ==========================================================
    DEVELOPER RESET
    ==========================================================

    Completely resets the current Basse training state
    so onboarding can be tested from scratch.
  */
  function resetTriCoach() {

    requestConfirmation({
      title:
        "Reset Basse?",

      message:
        "Your login will remain, but your athlete profile, target race, training plan, season and training history will be reset.",

      confirmLabel:
        "Reset everything",

      destructive:
        true,

      action: () => {
        void resetTriCoachConfirmed();
      },
    });
  }


  async function resetTriCoachConfirmed() {

    /*
      Stop persistence effects immediately.

      This is important: otherwise React can write the
      OLD state back while reset is happening.
    */
    setHasRestoredData(
      false
    );

    setSettingsOpen(
      false
    );


    /*
      This survives the hard reload once.

      restoreTriCoach() consumes it below and sends the
      athlete directly into fresh onboarding.
    */
    sessionStorage.setItem(
      "tricoach-force-fresh-onboarding",
      "1"
    );


    /*
      A persistence effect that started BEFORE
      hasRestoredData was disabled may still be in flight.

      Drain that queue before clearing/resetting cloud state.
      After this point no normal training-state effect can
      schedule another write during this reset.
    */
    await Promise.all([
      trainingStateWriteQueueRef.current,
      profileWriteQueueRef.current,
    ]);


    /*
      Clear browser state FIRST.

      Cloud cleanup is allowed to fail without preventing
      the local reset.
    */
    localStorage.clear();


    if (userId) {

      /*
        Use UPSERT instead of DELETE.

        Basse already has working UPSERT permissions
        for these tables, while DELETE may be blocked by
        Supabase RLS.
      */

      const {
        error:
          trainingStateError,
      } =
        await supabase
          .from(
            "training_state"
          )
          .upsert(
            {
              user_id:
                userId,

              active_plan:
                null,

              workout_history:
                [],

              plan_history:
                [],

              training_archive:
                [],

              season_roadmap:
                null,

              roadmap_revisions:
                [],

              readiness_history:
                [],

              weekly_review:
                null,

              updated_at:
                new Date()
                  .toISOString(),
            },
            {
              onConflict:
                "user_id",
            }
          );


      if (
        trainingStateError
      ) {
        console.error(
          "Reset training_state failed:",
          trainingStateError
        );
      }


      const {
        error:
          profileError,
      } =
        await supabase
          .from(
            "profiles"
          )
          .upsert(
            {
              user_id:
                userId,

              name:
                "",

              goal:
                "70.3",

              race_date:
                null,

              target_race:
                null,

              hours_per_week:
                8,

              weakest_discipline:
                "Swimming",

              experience:
                "Beginner",

              capability_profile:
                {},

              current_training_hours:
                5,

              swim_level:
                "Beginner",

              bike_level:
                "Developing",

              run_level:
                "Developing",

              available_days: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],

              longest_session_minutes:
                150,

              pool_access:
                true,

              indoor_trainer:
                false,

              gym_access:
                false,

              limitations:
                "",
            },
            {
              onConflict:
                "user_id",
            }
          );


      if (
        profileError
      ) {
        console.error(
          "Reset profiles failed:",
          profileError
        );
      }
    }


    /*
      Hard reload after cloud + local reset.

      The sessionStorage flag will prevent the normal
      restore path from pulling the old athlete back.
    */
    window.location.replace(
      "/"
    );
  }




  async function createOnboardingAccountAndPlan() {

    /*
      Existing authenticated athletes do not need to
      create another account.
    */
    if (userId) {
      await generatePlan();
      return;
    }


    const email =
      onboardingAccountEmail
        .trim()
        .toLowerCase();

    const password =
      onboardingAccountPassword;


    setOnboardingAccountMessage("");


    if (!email) {
      setOnboardingAccountMessage(
        "Enter your email address."
      );

      return;
    }


    if (password.length < 8) {
      setOnboardingAccountMessage(
        "Use at least 8 characters for your password."
      );

      return;
    }


    setIsOnboardingAccountLoading(true);


    try {

      /*
        Email confirmation reloads the application.

        Keep the exact completed onboarding state so
        the confirmed account can continue with the
        same athlete data instead of starting over.
      */
      localStorage.setItem(
        "tricoach-pending-onboarding",
        JSON.stringify({
          athlete,
          trainingAvailability,
        })
      );


      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email,
          password,
          options: {

            /*
              Supabase confirms the email first, then
              returns the browser here with a PKCE
              authentication code.
            */
            emailRedirectTo:
              `${window.location.origin}/auth/complete?flow=onboarding`,

            data: {
              name:
                athlete.name.trim(),
            },
          },
        });


      if (error) {
        throw error;
      }


      if (!data.user) {
        throw new Error(
          "Basse could not create your account."
        );
      }


      /*
        Supabase projects can require email
        confirmation before a session is created.

        In that case we deliberately stop here.
        The athlete profile and onboarding answers
        remain locally available while the account
        is confirmed.
      */
      if (!data.session) {

        setOnboardingAccountMessage(
          "Account created. Check your email to confirm it — Basse will continue automatically."
        );

        return;
      }


      setUserId(
        data.user.id
      );

      setUserEmail(
        data.user.email ??
        email
      );

      setDbReady(
        true
      );


      await generatePlan();

    } catch (error) {

      console.error(
        "Could not create onboarding account:",
        error
      );


      setOnboardingAccountMessage(
        error instanceof Error
          ? error.message
          : "Basse could not create your account. Please try again."
      );

    } finally {

      setIsOnboardingAccountLoading(
        false
      );

    }
  }



  const generatePlanAfterEmailConfirmation =
    useEffectEvent(async () => {
      await generatePlan();
    });


  useEffect(() => {

    if (
      !resumePlanAfterEmailConfirmationRef.current ||
      !userId ||
      !dbReady ||
      !hasRestoredData
    ) {
      return;
    }


    /*
      React Strict Mode can run effects twice in
      development. sessionStorage makes first-plan
      generation single-shot for this browser return.
    */
    const triggerKey =
      "tricoach-confirmed-onboarding-plan-started";


    if (
      sessionStorage.getItem(
        triggerKey
      ) === "1"
    ) {
      return;
    }


    sessionStorage.setItem(
      triggerKey,
      "1"
    );


    resumePlanAfterEmailConfirmationRef.current =
      false;


    void (async () => {

      try {

        await generatePlanAfterEmailConfirmation();


        localStorage.removeItem(
          "tricoach-pending-onboarding"
        );

      } finally {

        sessionStorage.removeItem(
          triggerKey
        );

      }

    })();

  }, [
    userId,
    dbReady,
    hasRestoredData,
  ]);



  const onboarding = [
    {
      eyebrow: "Athlete profile",

      title: "What should I call you?",

      content: (
        <input
          className="field"
          value={athlete.name}
          placeholder="Your name"
          onChange={(e) =>
            setAthlete({
              ...athlete,
              name: e.target.value,
            })
          }
        />
      ),
    },

    {
      eyebrow:
        "Preferences",

      title:
        "Which units do you prefer?",

      content: (
        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "8px",
            }}
          >
            <div>
              <strong>
                Units
              </strong>

              <p
                style={{
                  margin:
                    "3px 0 0",
                  color:
                    "#777b72",
                  fontSize:
                    "12.5px",
                }}
              >
                Choose how distance and pace are shown.
              </p>
            </div>

            <div className="choiceGrid">
              {(
                [
                  "Metric",
                  "Imperial",
                ] as const
              ).map(
                (unitSystem) => (
                  <button
                    key={
                      unitSystem
                    }
                    type="button"
                    className={
                      (
                        athlete.unitSystem ??
                        "Metric"
                      ) ===
                      unitSystem
                        ? "choice selected"
                        : "choice"
                    }
                    onClick={() =>
                      setAthlete({
                        ...athlete,
                        unitSystem,
                      })
                    }
                  >
                    <strong>
                      {
                        unitSystem
                      }
                    </strong>

                    <span>
                      {unitSystem ===
                      "Metric"
                        ? "km · m · min/km"
                        : "mi · yd · min/mi"}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      ),
    },


    {
      eyebrow: "Your goal",

      title: "What are you training for?",

      content: (
        <div className="choiceGrid">
          {(["Sprint", "Olympic", "70.3", "Ironman"] as Goal[]).map(
            (goal) => (
              <button
                key={goal}
                className={
                  athlete.goal === goal
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  setAthlete({
                    ...athlete,
                    goal,
                  })
                }
              >
                <strong>{goal}</strong>
              </button>
            )
          )}
        </div>
      ),
    },

    {
      eyebrow:
        "Target race",

      title:
        "Which race are you training for?",

      content: (
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >

          {athlete.targetRace ? (
            <div
              className="onboardingSelectedRaceCard"
              style={{
                padding: "18px",
                border:
                  "1px solid rgba(255,255,255,.065)",
                borderRadius: "16px",
                background:
                  "rgba(10,24,17,.26)",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "16px",
                  alignItems:
                    "flex-start",
                }}
              >

                <div>

                  <span
                    style={{
                      display:
                        "block",
                      marginBottom:
                        "5px",
                      fontSize:
                        "11px",
                      fontWeight:
                        800,
                      letterSpacing:
                        ".08em",
                      color:
                        "#777b72",
                    }}
                  >
                    SELECTED RACE
                  </span>


                  <strong
                    style={{
                      display:
                        "block",
                      fontSize:
                        "18px",
                    }}
                  >
                    {
                      athlete
                        .targetRace
                        .name
                    }
                  </strong>


                  <span
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      color:
                        "#6f7268",
                      fontSize:
                        "13px",
                    }}
                  >
                    {
                      athlete
                        .targetRace
                        .location ??
                      "Location not specified"
                    }
                    {" · "}
                    {
                      athlete
                        .targetRace
                        .format
                    }
                  </span>


                  <span
                    style={{
                      display:
                        "block",
                      marginTop:
                        "3px",
                      color:
                        "#6f7268",
                      fontSize:
                        "13px",
                    }}
                  >
                    {new Date(
                      `${
                        athlete
                          .targetRace
                          .date
                      }T12:00:00`
                    ).toLocaleDateString(
                      "en-GB",
                      {
                        day:
                          "numeric",
                        month:
                          "long",
                        year:
                          "numeric",
                      }
                    )}
                  </span>

                </div>


                <span
                  style={{
                    fontSize:
                      "24px",
                  }}
                >
                  🏁
                </span>

              </div>


              <button
                type="button"
                className="secondary full"
                style={{
                  marginTop:
                    "14px",
                }}
                onClick={() =>
                  setTargetRaceModalOpen(
                    true
                  )
                }
              >
                Change race
              </button>

            </div>

          ) : (

            <button
              type="button"
              className="primary full"
              onClick={() =>
                setTargetRaceModalOpen(
                  true
                )
              }
            >
              Browse race catalog →
            </button>

          )}


          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#92958e",
              fontSize: "12px",
            }}
          >
            <span
              style={{
                height: "1px",
                background:
                  "#dedfd8",
                flex: 1,
              }}
            />

            or enter a date manually

            <span
              style={{
                height: "1px",
                background:
                  "#dedfd8",
                flex: 1,
              }}
            />
          </div>


          <input
            className="field"
            type="date"
            value={
              athlete.raceDate
            }
            disabled={
              Boolean(
                athlete.targetRace
              )
            }
            onChange={(event) => {

              /*
                A catalog race owns its official race date.

                Once a specific race is selected, keep the
                date locked to that race so the catalog
                identity cannot accidentally be removed.

                Manual date entry remains available when
                no specific race has been selected.
              */
              if (
                athlete.targetRace
              ) {
                return;
              }


              setAthlete({
                ...athlete,

                raceDate:
                  event.target.value,
              });
            }}
          />


          <p
            style={{
              margin: 0,
              color: "#777b72",
              fontSize: "12.5px",
              lineHeight: 1.5,
            }}
          >
            Choosing a specific race lets Basse use
            course type, distance and race-specific
            demands when building your plan. If your
            event is not in the catalog, a race date
            alone still works.
          </p>

        </div>
      ),
    },


    {
      eyebrow:
        "Performance benchmarks · Optional",

      title:
        "Want to make your training targets more precise?",

      content: (
        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >

          <p
            style={{
              margin: 0,
              color:
                "#6f7268",
              lineHeight:
                1.6,
            }}
          >
            If you know values such as bike FTP,
            swim CSS or recent running performance,
            Basse can use them to make selected
            sessions more precise.
          </p>


          <div
            className="onboardingOptionalCard"
            style={{
              padding:
                "16px",
              border:
                "1px solid rgba(255,255,255,.055)",
              borderRadius:
                "14px",
              background:
                "rgba(10,24,17,.20)",
            }}
          >

            <strong
              style={{
                display:
                  "block",
                marginBottom:
                  "5px",
              }}
            >
              Completely optional
            </strong>

            <span
              style={{
                color:
                  "#777b72",
                fontSize:
                  "13px",
                lineHeight:
                  1.5,
              }}
            >
              You can skip this step. Basse will
              use RPE and effort descriptions whenever
              a benchmark is unavailable.
            </span>

          </div>


          {athlete.benchmarks ? (
            <div
              style={{
                display:
                  "grid",
                gap:
                  "10px",
              }}
            >

              <div
                className="onboardingBenchmarksAdded"
                style={{
                  padding:
                    "15px",
                  borderRadius:
                    "13px",
                  background:
                    "rgba(102,148,111,.10)",
                }}
              >
                <strong>
                  ✓ Benchmarks added
                </strong>

                <div
                  style={{
                    marginTop:
                      "4px",
                    color:
                      "#697064",
                    fontSize:
                      "12.5px",
                  }}
                >
                  Basse will use the values where
                  they genuinely improve prescription.
                </div>
              </div>


              <button
                type="button"
                className="secondary full"
                onClick={() =>
                  setBenchmarkModalOpen(
                    true
                  )
                }
              >
                Review benchmarks
              </button>

            </div>

          ) : (

            <button
              type="button"
              className="secondary full"
              onClick={() =>
                setBenchmarkModalOpen(
                  true
                )
              }
            >
              Add performance benchmarks
            </button>

          )}


          <span
            style={{
              textAlign:
                "center",
              color:
                "#92958e",
              fontSize:
                "12px",
            }}
          >
            Or just press Continue to skip
          </span>

        </div>
      ),
    },


    {
      eyebrow: "Real life first",

      title: "How much can you realistically train?",

      content: (
        <div className="sliderWrap">
          <div className="bigNumber">
            {athlete.hoursPerWeek} h
          </div>

          <input
            type="range"
            min="4"
            max="24"
            value={athlete.hoursPerWeek}
            onChange={(e) =>
              setAthlete({
                ...athlete,
                hoursPerWeek: e.target.value,
              })
            }
          />

          <p>
            per week — on a normal week, not your perfect week.
          </p>
        </div>
      ),
    },

    {
      eyebrow: "Priority",

      title: "Which discipline needs the most work?",

      content: (
        <div className="choiceGrid three">
          {(["Swimming", "Cycling", "Running"] as Discipline[]).map(
            (discipline) => (
              <button
                key={discipline}
                className={
                  athlete.weakestDiscipline === discipline
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  setAthlete({
                    ...athlete,
                    weakestDiscipline: discipline,
                  })
                }
              >
                <strong>{discipline}</strong>
              </button>
            )
          )}
        </div>
      ),
    },

    {
      eyebrow: "Experience",
      title: "How experienced are you with triathlon?",
      content: (
        <div className="choiceGrid three">
          {TRIATHLON_EXPERIENCE_OPTIONS.map(
            (value) => (
              <button
                key={value}
                className={
                  athlete.experience === value
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  setAthlete({
                    ...athlete,
                    experience: value,
                  })
                }
              >
                <strong>{value}</strong>
              </button>
            )
          )}
        </div>
      ),
    },

    {
      eyebrow: "Performance",

      title: "What competitive context best describes you?",

      content: (
        <div>
          <div className="choiceGrid three">
            {PERFORMANCE_TIER_OPTIONS.map(
              (value) => (
                <button
                  key={value}
                  className={
                    (
                      athlete.performanceTier ??
                      "Recreational"
                    ) === value
                      ? "choice selected"
                      : "choice"
                  }
                  onClick={() =>
                    setAthlete({
                      ...athlete,

                      performanceTier:
                        value,
                    })
                  }
                >
                  <strong>
                    {value}
                  </strong>
                </button>
              )
            )}
          </div>

          <p>
            This describes your competitive context.
            It does not automatically increase training load.
          </p>
        </div>
      ),
    },

    {
      eyebrow: "Current training",
      title: "How much are you training right now?",
      content: (
        <div className="sliderWrap">
          <div className="bigNumber">
            {athlete.currentTrainingHours} h
          </div>

          <input
            type="range"
            min="0"
            max="24"
            value={athlete.currentTrainingHours}
            onChange={(e) =>
              setAthlete({
                ...athlete,
                currentTrainingHours: e.target.value,
              })
            }
          />

          <p>Average training hours in a normal current week.</p>
        </div>
      ),
    },

    {
      eyebrow: "Discipline level",
      title: "How would you rate your current level?",
      content: (
        <div>
          {[
            ["Swimming", "swimLevel"],
            ["Cycling", "bikeLevel"],
            ["Running", "runLevel"],
          ].map(([label, key]) => (
            <div key={key} style={{ marginBottom: "1.4rem" }}>
              <div
                style={{
                  fontWeight: 900,
                  marginBottom: ".6rem",
                }}
              >
                {label}
              </div>

              <div className="choiceGrid three">
                {DISCIPLINE_LEVEL_OPTIONS.map(
                  (value) => (
                    <button
                      key={value}
                      className={
                        athlete[key as "swimLevel" | "bikeLevel" | "runLevel"] === value
                          ? "choice selected"
                          : "choice"
                      }
                      onClick={() =>
                        setAthlete({
                          ...athlete,
                          [key]: value,
                        })
                      }
                    >
                      <strong>{value}</strong>
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },

    {
      eyebrow: "Schedule",
      title: "When can you usually train each discipline?",
      content: (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          {(
            [
              ["Swim", "SWIM"],
              ["Bike", "BIKE"],
              ["Run", "RUN"],
              ["Strength", "STRENGTH"],
            ] as const
          ).map(
            ([
              sport,
              label,
            ]) => (
              <div
                key={sport}
                style={{
                  display: "grid",
                  gap: "8px",
                  padding: "10px",
                  border:
                    "1px solid rgba(255,255,255,0.07)",
                  borderRadius:
                    "12px",
                  background:
                    "rgba(255,255,255,0.018)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: "12px",
                  }}
                >
                  <strong
                    style={{
                      fontSize:
                        "0.78rem",
                      letterSpacing:
                        "0.08em",
                    }}
                  >
                    {label}
                  </strong>

                  <span
                    style={{
                      opacity: 0.55,
                      fontSize:
                        "0.72rem",
                    }}
                  >
                    {
                      getWeeklyAvailabilityDays(
                        sport
                      ).length
                    }{" "}
                    days
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(7, minmax(0, 1fr))",
                    gap: "4px",
                  }}
                >
                  {[
                    ["Monday", "MO"],
                    ["Tuesday", "TU"],
                    ["Wednesday", "WE"],
                    ["Thursday", "TH"],
                    ["Friday", "FR"],
                    ["Saturday", "SA"],
                    ["Sunday", "SU"],
                  ].map(
                    ([day, short]) => {
                      const isAvailable =
                        getWeeklyAvailabilityDays(
                          sport
                        ).includes(
                          day as never
                        );

                      return (
                        <button
                          key={`${sport}-${day}`}
                          type="button"
                          aria-pressed={
                            isAvailable
                          }
                          title={
                            isAvailable
                              ? `${day}: available`
                              : `${day}: unavailable`
                          }
                          style={{
                            height: "38px",
                            minWidth: 0,
                            padding: 0,
                            borderRadius:
                              "7px",
                            border:
                              isAvailable
                                ? "1px solid rgba(74, 222, 128, 0.38)"
                                : "1px solid rgba(248, 113, 113, 0.30)",
                            background:
                              isAvailable
                                ? "rgba(34, 197, 94, 0.13)"
                                : "rgba(239, 68, 68, 0.09)",
                            color:
                              isAvailable
                                ? "rgb(22, 60, 35)"
                                : "rgb(88, 28, 28)",
                            cursor:
                              "pointer",
                            fontSize:
                              "0.74rem",
                            fontWeight:
                              800,
                            letterSpacing:
                              "0.045em",
                            transition:
                              "transform 120ms ease, background 120ms ease, border-color 120ms ease",
                          }}
                          onClick={() =>
                            toggleWeeklyAvailableDay(
                              sport,
                              day
                            )
                          }
                        >
                          {short}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )
          )}

          <p
            style={{
              margin: 0,
              opacity: 0.58,
              fontSize: "0.78rem",
              lineHeight: 1.5,
            }}
          >
            This is your normal weekly schedule.
            You can override individual dates later
            in Calendar.
          </p>
        </div>
      ),
    },

    {
      eyebrow: "Long sessions",
      title: "What is the longest session you can usually fit in?",
      content: (
        <div className="sliderWrap">
          <div className="bigNumber">
            {formatDuration(
              athlete.longestSessionMinutes
            )}
          </div>

          <input
            type="range"
            min="45"
            max="480"
            step="15"
            value={athlete.longestSessionMinutes}
            onChange={(e) =>
              setAthlete({
                ...athlete,
                longestSessionMinutes: e.target.value,
              })
            }
          />
        </div>
      ),
    },

    {
      eyebrow: "Equipment",
      title: "What do you have access to?",
      content: (
        <div className="choiceGrid three">
          {[
            ["Pool", "poolAccess"],
            ["Indoor trainer", "indoorTrainer"],
            ["Gym", "gymAccess"],
          ].map(([label, key]) => (
            <button
              key={key}
              className={
                athlete[key as "poolAccess" | "indoorTrainer" | "gymAccess"]
                  ? "choice selected"
                  : "choice"
              }
              onClick={() =>
                setAthlete({
                  ...athlete,
                  [key]:
                    !athlete[
                      key as "poolAccess" | "indoorTrainer" | "gymAccess"
                    ],
                })
              }
            >
              <strong>{label}</strong>
            </button>
          ))}
        </div>
      ),
    },

    {
      eyebrow: "Limitations",
      title: "Anything your coach should know?",
      content: (
        <textarea
          className="field"
          style={{
            minHeight: "140px",
            resize: "vertical",
          }}
          value={athlete.limitations}
          placeholder="Example: knee issues, cannot train mornings, nervous in open water..."
          onChange={(e) =>
            setAthlete({
              ...athlete,
              limitations: e.target.value,
            })
          }
        />
      ),
    },

    {
      eyebrow: "Your account",

      title:
        userId
          ? "Ready to build your plan?"
          : "Save your coaching setup.",

      content: (
        <div className="onboardingAccount">

          {userId ? (

            <div className="onboardingAccountConnected">

              <span>
                ACCOUNT CONNECTED
              </span>

              <strong>
                {userEmail || "You're signed in"}
              </strong>

              <p>
                Your athlete profile is ready.
                Basse can now build your first week.
              </p>

            </div>

          ) : (

            <>

              <p className="onboardingAccountIntro">
                One last step. Create your account
                before Basse builds your first
                training week.
              </p>


              <label className="onboardingAccountField">

                <span>
                  EMAIL
                </span>

                <input
                  className="field"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={
                    onboardingAccountEmail
                  }
                  onChange={(e) => {
                    setOnboardingAccountEmail(
                      e.target.value
                    );

                    setOnboardingAccountMessage(
                      ""
                    );
                  }}
                />

              </label>


              <label className="onboardingAccountField">

                <span>
                  PASSWORD
                </span>

                <input
                  className="field"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={
                    onboardingAccountPassword
                  }
                  onChange={(e) => {
                    setOnboardingAccountPassword(
                      e.target.value
                    );

                    setOnboardingAccountMessage(
                      ""
                    );
                  }}
                />

              </label>


              <p className="onboardingAccountNote">
                Your account connects your athlete
                profile and training plan to you.
              </p>


              {onboardingAccountMessage && (
                <div
                  className="onboardingAccountMessage"
                  role="status"
                >
                  {onboardingAccountMessage}
                </div>
              )}

            </>

          )}

        </div>
      ),
    },
  ];

  if (screen === "home") {
    return (
      <main className="landing landingV2">

        <nav className="landingV2Nav">
          <div className="landingV2Brand">
            <span>BASSE</span>
          </div>

          <div className="landingV2NavActions">

            <a
              href="/login"
              className="landingV2Login"
            >
              Log in
            </a>

            <button
              type="button"
              className="landingV2NavCta"
              onClick={() =>
                setScreen("onboarding")
              }
            >
              Get started
            </button>

          </div>
        </nav>


        <section className="landingV2Hero">

          <div className="landingV2HeroCopy">

            <span className="landingV2Eyebrow">
              PERSONAL TRIATHLON COACHING
            </span>

            <h1>
              Train with a coach
              <br />
              that <em>adapts to you.</em>
            </h1>

            <p>
              A personal plan, daily guidance and
              adjustments when life changes.
            </p>

            <div className="landingV2HeroActions">

              <button
                type="button"
                className="landingV2Primary"
                onClick={() =>
                  setScreen("onboarding")
                }
              >
                Build my plan
                <span>→</span>
              </button>

              <button
                type="button"
                className="landingV2TextAction"
                onClick={() =>
                  document
                    .getElementById(
                      "landing-story"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                See how it works
                <span>↓</span>
              </button>

            </div>

            <span className="landingV2ForEveryone">
              Built for every level.
            </span>

          </div>


          <div
            className="landingV2ProductScene"
            aria-hidden="true"
          >

            <div className="landingV2Signal landingV2SignalToday">
              <span>TODAY</span>
              <strong>
                Your training.
                <br />
                Right now.
              </strong>
            </div>

            <div className="landingV2Signal landingV2SignalCoach">
              <span>COACH</span>
              <strong>
                Guidance when
                <br />
                things change.
              </strong>
            </div>


            <div className="landingV2Phone landingPhoneApp">

              <div className="landingPhoneStatusBar">
                <span>9:41</span>

                <div>
                  <i />
                  <i />
                  <i />
                </div>
              </div>


              <div className="landingPhoneAppTop">

                <strong>
                  BASSE
                </strong>

                <span>
                  TODAY
                </span>

              </div>


              <div className="landingPhoneRaceStrip">

                <div>
                  <small>
                    TARGET RACE
                  </small>

                  <strong>
                    Norseman
                  </strong>
                </div>

                <span>
                  84 days
                </span>

              </div>


              <div className="landingPhoneAppSignals">

                <div>
                  <small>
                    READINESS
                  </small>

                  <strong>
                    Good
                  </strong>
                </div>


                <div>
                  <small>
                    WEEK
                  </small>

                  <strong>
                    Build
                  </strong>
                </div>

              </div>


              <div className="landingPhoneAppWorkout">

                <div className="landingPhoneAppWorkoutTop">

                  <span>
                    SWIM
                  </span>

                  <small>
                    SESSION 1
                  </small>

                </div>


                <h3>
                  Aerobic swim
                </h3>


                <div className="landingPhoneAppWorkoutMeta">

                  <span>
                    1 h
                  </span>

                  <span>
                    RPE 3–4
                  </span>

                </div>


                <div className="landingPhoneMiniMap">

                  <div className="landingPhoneMiniMapHead">
                    <span>
                      SESSION MAP
                    </span>

                    <small>
                      At a glance
                    </small>
                  </div>


                  <div className="landingPhoneMiniMapGraphic">

                    <i className="warmup" />

                    <div className="drills">
                      <b />
                      <b />
                      <b />
                      <b />
                      <b />
                      <b />
                    </div>

                    <div className="main">
                      <b />
                      <b />
                      <b />
                      <b />
                      <b />
                      <b />
                      <b />
                      <b />
                    </div>

                    <i className="cooldown" />

                  </div>


                  <div className="landingPhoneMiniMapLabels">

                    <span>
                      Warm-up
                    </span>

                    <span>
                      Main set
                    </span>

                    <span>
                      Cool-down
                    </span>

                  </div>

                </div>


                <div className="landingPhoneViewSession">
                  View session
                  <span>→</span>
                </div>

              </div>


              <div className="landingPhoneCoachStrip">

                <div>
                  <span>
                    COACH
                  </span>

                  <strong>
                    Stay aerobic today.
                  </strong>
                </div>

                <p>
                  Smooth technique.
                  Save the harder work for later.
                </p>

              </div>


              <div className="landingPhoneUpNext">

                <div>
                  <span>
                    UP NEXT
                  </span>

                  <strong>
                    Bike endurance
                  </strong>
                </div>

                <small>
                  TOMORROW
                </small>

              </div>


              <div className="landingV2PhoneNav">
                <strong>Today</strong>
                <span>Week</span>
                <span>Coach</span>
                <span>Progress</span>
              </div>

            </div>

          </div>

        </section>



        <section
          className="landingV2Story"
          id="landing-story"
        >

          <span className="landingV2StoryKicker">
            THE DIFFERENCE
          </span>

          <h2>
            Plans are static.
            <br />
            <em>Life isn&apos;t.</em>
          </h2>

          <p>
            Basse follows what actually happens
            — and helps decide what comes next.
          </p>


          <div className="landingV2Loop">

            <div>
              <span>01</span>
              <strong>TRAIN</strong>
            </div>

            <i />

            <div>
              <span>02</span>
              <strong>LOG</strong>
            </div>

            <i />

            <div>
              <span>03</span>
              <strong>ADAPT</strong>
            </div>

          </div>

        </section>



        <section className="landingV2Reveal">

          <div className="landingV2RevealCopy">

            <span>
              MORE THAN A TRAINING PLAN
            </span>

            <h2>
              Your season.
              <br />
              One clear direction.
            </h2>

          </div>


          <div className="landingV2GhostInterface">

            <div className="landingV2GhostTop">
              <span>SEASON</span>
              <small>RACE DAY</small>
            </div>

            <div className="landingV2GhostRoad">

              <div>
                <i className="active" />
                <span>Foundation</span>
              </div>

              <div>
                <i className="active" />
                <span>Build</span>
              </div>

              <div>
                <i />
                <span>Peak</span>
              </div>

              <div>
                <i />
                <span>Race</span>
              </div>

            </div>

            <div className="landingV2GhostLine">
              <i />
            </div>

          </div>

        </section>



        <section className="landingV2Principles">

          <div>
            <span>PERSONAL</span>
            <p>
              Training built around
              your life.
            </p>
          </div>

          <div>
            <span>ADAPTIVE</span>
            <p>
              The plan can change
              when reality does.
            </p>
          </div>

          <div>
            <span>EVIDENCE-INFORMED</span>
            <p>
              Clear decisions without
              unnecessary complexity.
            </p>
          </div>

        </section>



        <section className="landingV2Final">

          <span>
            YOUR NEXT SESSION STARTS HERE
          </span>

          <h2>
            Start simple.
            <br />
            <em>Build something big.</em>
          </h2>

          <button
            type="button"
            className="landingV2Primary"
            onClick={() =>
              setScreen("onboarding")
            }
          >
            Start with Basse
            <span>→</span>
          </button>

        </section>

      </main>
    );
  }


  if (screen === "athleteProfile") {

    const raceAtmosphereClass =
      getRaceAtmosphereClass(athlete.targetRace?.name);


    return (
      <main
        className={[
          "athleteProfilePage",
          raceAtmosphereClass,
        ].join(" ")}
      >
        <AthleteProfileView
          athlete={athlete}
          onSave={
            saveAthleteProfile
          }
          onCancel={
            cancelAthleteProfile
          }
        />
      </main>
    );
  }



  if (screen === "onboarding") {
    const item = onboarding[step];

    return (
      <main
        className={[
          "onboarding",
          getRaceAtmosphereClass(athlete.targetRace?.name),
        ].join(" ")}
      >
        <div className="topline">
          <button
            className="back"
            onClick={() => {
              if (step === 0) {
                setScreen("home");
              } else {
                setStep(step - 1);
              }
            }}
          >
            ← Back
          </button>

          <div className="progress">
            <div
              style={{
                width: `${
                  ((step + 1) / onboarding.length) * 100
                }%`,
              }}
            />
          </div>

          <span>
            {step + 1}/{onboarding.length}
          </span>
        </div>

        <section className="questionCard">
          <div className="eyebrow">
            {item.eyebrow}
          </div>

          <h1>{item.title}</h1>

          {item.content}

          <button
            className="primary full"
            disabled={
              isPlanLoading ||
              isOnboardingAccountLoading ||
              (
                step === 0 &&
                !athlete.name.trim()
              ) ||
              (
                step ===
                  onboarding.length - 1 &&
                !userId &&
                (
                  !onboardingAccountEmail.trim() ||
                  onboardingAccountPassword.length < 8
                )
              )
            }
            onClick={async () => {

              if (
                step <
                onboarding.length - 1
              ) {
                setStep(
                  step + 1
                );

                return;
              }


              if (userId) {
                await generatePlan();
                return;
              }


              await createOnboardingAccountAndPlan();

            }}
          >
            {isPlanLoading
              ? "Building your week..."
              : isOnboardingAccountLoading
              ? "Creating your account..."
              : step === onboarding.length - 1
              ? userId
                ? "Create my first week →"
                : "Create account & build my plan →"
              : "Continue →"}
          </button>
        </section>



        {/* ================================================
            ONBOARDING RACE PICKER MODALS
            ================================================ */}

        <RacePickerModal
          open={
            targetRaceModalOpen
          }

          unitSystem={
            athlete.unitSystem ??
            "Metric"
          }

          onClose={() =>
            setTargetRaceModalOpen(
              false
            )
          }

          onSelect={
            selectOnboardingTargetRace
          }

          onManual={
            openManualTargetRace
          }
        />


        <TargetRaceModal
          open={
            manualRaceModalOpen
          }

          targetRace={
            athlete.targetRace
          }

          unitSystem={
            athlete.unitSystem ??
            "Metric"
          }

          onClose={() =>
            setManualRaceModalOpen(
              false
            )
          }

          onSave={
            selectOnboardingTargetRace
          }
        />



        {/* ================================================
            ONBOARDING BENCHMARK MODAL
            ================================================ */}

        <BenchmarkModal
          open={
            benchmarkModalOpen
          }

          benchmarks={
            athlete.benchmarks
          }

          onClose={() =>
            setBenchmarkModalOpen(
              false
            )
          }

          onSave={
            saveOnboardingPerformanceBenchmarks
          }
        />
      </main>
    );
  }

  return (
    <main
      className={
        (
          dashboardView === "today" ||
          dashboardView === "week" ||
          dashboardView === "coach" ||
          dashboardView === "progress" ||
          dashboardView === "plan" ||
          dashboardView === "calendar"
        )
          ? [
              "dashboard",
              dashboardView === "today"
                ? "todayAlpineShell"
                : dashboardView === "coach"
                  ? "weekAlpineShell coachAlpineShell"
                  : dashboardView === "progress"
                    ? "weekAlpineShell progressAlpineShell"
                    : dashboardView === "plan"
                      ? "weekAlpineShell seasonAlpineShell"
                      : dashboardView === "calendar"
                        ? "weekAlpineShell calendarAlpineShell"
                        : "weekAlpineShell",
              getRaceAtmosphereClass(athlete.targetRace?.name),
            ].join(" ")
          : "dashboard"
      }
    >

      {(isPlanLoading ||
        isNextWeekLoading ||
        isNextWeekPreviewLoading) && (
        <div
          className="coachWorkStatus"
          role="status"
          aria-live="polite"
          aria-label={
            isPlanLoading &&
            (
              isNextWeekLoading ||
              isNextWeekPreviewLoading
            )
              ? "Basse is adapting your training"
              : isPlanLoading
                ? "Basse is updating this week"
                : isNextWeekLoading
                  ? "Basse is reviewing last week and preparing this week"
                  : "Basse is building next week"
          }
        >
          <div className="coachWorkStatusTop">
            <span className="coachWorkStatusPulse" />

            <div>
              <span className="coachWorkStatusEyebrow">
                COACH WORKING
              </span>

              <strong>
                {isPlanLoading &&
                (
                  isNextWeekLoading ||
                  isNextWeekPreviewLoading
                )
                  ? "Adapting your training…"
                  : isPlanLoading
                    ? "Updating this week…"
                    : isNextWeekLoading
                      ? "Reviewing last week and preparing this week…"
                      : "Building next week…"}
              </strong>
            </div>
          </div>

          <div
            className="coachWorkStatusTrack"
            aria-hidden="true"
          >
            <div className="coachWorkStatusBar" />
          </div>

          <p>
            {isPlanLoading &&
            (
              isNextWeekLoading ||
              isNextWeekPreviewLoading
            )
              ? "Your current plan and upcoming week are being recalculated."
              : isPlanLoading
                ? "Keeping completed training intact while updating what is still ahead."
                : isNextWeekLoading
                  ? "Completed training is being reviewed before the new active week is published."
                  : "Reviewing your latest training context and preparing the upcoming week."}
          </p>
        </div>
      )}

      {firstPlanIntroOpen && (
        <div
          className="firstPlanIntroOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="firstPlanIntroTitle"
        >
          <section className="firstPlanIntro">

            <div className="firstPlanIntroTop">
              <div>
                <span className="eyebrow">
                  YOUR PLAN IS READY
                </span>

                <h2 id="firstPlanIntroTitle">
                  Train. Log. Adapt.
                </h2>

                <p>
                  Basse works around one simple
                  training loop.
                </p>
              </div>

              <button
                className="firstPlanIntroClose"
                aria-label="Close introduction"
                onClick={() => {
                  localStorage.setItem(
                    "tricoach-first-plan-intro-v1",
                    "seen"
                  );

                  setFirstPlanIntroOpen(false);
                }}
              >
                ×
              </button>
            </div>


            <div className="firstPlanSteps">

              <div className="firstPlanStep">
                <span>01</span>

                <div>
                  <strong>TRAIN</strong>

                  <h3>
                    Follow today&apos;s session.
                  </h3>

                  <p>
                    Start with Today. Your current
                    workout and recovery context live
                    there.
                  </p>
                </div>
              </div>


              <div className="firstPlanStep">
                <span>02</span>

                <div>
                  <strong>LOG</strong>

                  <h3>
                    Tell Basse what happened.
                  </h3>

                  <p>
                    Log completed, modified or skipped
                    sessions so your training history
                    reflects reality.
                  </p>
                </div>
              </div>


              <div className="firstPlanStep">
                <span>03</span>

                <div>
                  <strong>ADAPT</strong>

                  <h3>
                    Let the plan move with you.
                  </h3>

                  <p>
                    Short on time, tired, or changing
                    your schedule? Ask Coach before
                    forcing the original plan.
                  </p>
                </div>
              </div>

            </div>


            <div className="firstPlanIntroFooter">
              <div>
                <strong>
                  You don&apos;t need to manage everything.
                </strong>

                <span>
                  Train, give feedback, and use Coach
                  when something changes.
                </span>
              </div>

              <button
                className="primary"
                onClick={() => {
                  localStorage.setItem(
                    "tricoach-first-plan-intro-v1",
                    "seen"
                  );

                  setFirstPlanIntroOpen(false);
                  setDashboardView("today");
                }}
              >
                Show today&apos;s training →
              </button>
            </div>

          </section>
        </div>
      )}

      {screen === "dashboard" && (
        <button
          className="dashboardSettingsButton"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          style={{
            position: "fixed",
            top: "22px",
            right: "22px",
            zIndex: 40,
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border:
              "1px solid rgba(255,255,255,.075)",
            background:
              "rgba(16,31,23,.58)",
            cursor: "pointer",
            fontSize: "20px",
            boxShadow: "0 8px 24px rgba(0,0,0,.08)",
          }}
        >
          ⚙
        </button>
      )}
      <aside className="sidebar">
        <div className="brand">
          <span>▲</span> BASSE
        </div>

        <div className="sideNav">
          <button
            className={
              dashboardView === "today"
                ? "active"
                : ""
            }
            onClick={() =>
              setDashboardView("today")
            }
          >
            Today
          </button>

          <button
            className={
              dashboardView === "week"
                ? "active"
                : ""
            }
            onClick={() =>
              setDashboardView("week")
            }
          >
            Week
          </button>

          <button
            className={
              dashboardView === "calendar"
                ? "active"
                : ""
            }
            onClick={() =>
              setDashboardView("calendar")
            }
          >
            Calendar
          </button>

          <button
            className={
              dashboardView === "coach"
                ? "active"
                : ""
            }
            onClick={() =>
              setDashboardView("coach")
            }
          >
            Coach
          </button>

          <button
            className={
              dashboardView === "progress"
                ? "active"
                : ""
            }
            onClick={() =>
              setDashboardView("progress")
            }
          >
            Progress
          </button>

          <button
            className={
              dashboardView === "plan"
                ? "active"
                : ""
            }
            onClick={() =>
              setDashboardView("plan")
            }
          >
            Season
          </button>
        </div>

        <div className="athleteMini">
          <div className="avatar">
            {(athlete.name || "A")
              .slice(0, 1)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {athlete.name || "Athlete"}
            </strong>

            <span>
              {athlete.goal} ·{" "}
              {athlete.hoursPerWeek}h/week
            </span>
          </div>
        </div>
      </aside>

      <section className="mainPanel">

        {dashboardView === "today" &&
          athlete.targetRace && (
            <RaceGoalCard
              race={athlete.targetRace}
              unitSystem={
                athlete.unitSystem ??
                "Metric"
              }
              onViewRace={() =>
                setTargetRaceModalOpen(
                  true
                )
              }
            />
          )}

        {dashboardView === "today" && (
          <TodayView
            athlete={athlete}
            today={today}
            todayReadiness={todayReadiness}
            readinessTrend={readinessTrend}
            trainingPhase={trainingPhase}
            trainingPlan={trainingPlan}
            history={workoutHistory}
            onReadinessOpen={() =>
              setReadinessOpen(true)
            }
            onAdaptToday={() => {
              setDashboardView("coach");

              sendMessage(
                "I need to change today's workout"
              );
            }}
            onViewWorkout={(workout) => {
              setSelectedWorkoutPreviewOnly(
                false
              );

              setSelectedWorkout(
                workout
              );
            }}
            onLogWorkout={(workout) => {
              openNewWorkoutFeedback(
                workout
              );
            }}
          />
        )}

        {dashboardView === "week" && (
          <>
          <WeekView
            plan={trainingPlan}

            targetRaceName={
              athlete.targetRace
                ?.name
            }

            raceDate={
              athlete.raceDate
            }

            onChooseNextGoal={() => {
              /*
                Start by selecting the next target.

                The existing saveTargetRace flow will
                rebuild Season + active training context.
              */
              setTargetRaceModalOpen(
                true
              );
            }}
            history={workoutHistory}
            review={weeklyReview}
            onSelectWorkout={(workout) => {
              setSelectedWorkoutPreviewOnly(
                false
              );

              setSelectedWorkout(
                workout
              );
            }}
                        onAddSession={() =>
                setAddSessionOpen(true)
              }

/>


          <NextWeekPreview
            plan={
              nextWeekPreview
            }
            loading={
              isNextWeekPreviewLoading
            }
            onSelectWorkout={(workout) => {
              setSelectedWorkoutPreviewOnly(
                true
              );

              setSelectedWorkout(
                workout
              );
            }}
          />
        
          </>
        )}

        {dashboardView === "calendar" && (
          <CalendarView
            athlete={athlete}
            trainingPlan={
              trainingPlan
            }
            nextWeekPreview={
              nextWeekPreview
            }
            workoutHistory={
              workoutHistory
            }
            trainingArchive={
              trainingArchive
            }
            availability={
              trainingAvailability
            }
            adaptingAvailabilityDates={
              calendarAdaptingDates
            }
            targetRace={
              athlete.targetRace
            }
            raceDate={
              athlete.raceDate
            }
            onSelectWorkout={(
              workout,
              previewOnly
            ) => {
              setSelectedWorkoutPreviewOnly(
                previewOnly
              );

              setSelectedWorkout(
                workout
              );
            }}
            onSaveAvailability={(
              entry,
              date
            ) => {
              /*
                Always build from the authoritative Calendar
                state, not this render's potentially older
                closure.

                This matters when the athlete makes multiple
                quick Calendar changes before React has
                committed the previous save.
              */
              const previousAvailability =
                latestTrainingAvailabilityRef.current;

              const updatedAvailability =
                [
                  ...previousAvailability.filter(
                    (item) =>
                      item.date !==
                      date
                  ),

                  ...(entry
                    ? [entry]
                    : []),
                ].sort(
                  (a, b) =>
                    a.date.localeCompare(
                      b.date
                    )
                );

              /*
                Calendar Save is authoritative immediately.

                React state commits asynchronously, but any
                request launched below must already see this
                exact availability as the latest accepted
                Calendar state.
              */
              latestTrainingAvailabilityRef.current =
                updatedAvailability;

              setTrainingAvailability(
                updatedAvailability
              );


              /*
                CURRENT WEEK

                Availability is a hard constraint.

                If this date is already part of the active
                training plan, immediately verify the entire
                week against the final resolved availability.
              */
              if (trainingPlan) {

                const currentWeekCheck =
                  validatePlanAgainstResolvedAvailability({
                    plan:
                      trainingPlan,

                    athlete,

                    availability:
                      updatedAvailability,
                  });


                const editedDateConflicts =
                  currentWeekCheck
                    .violations
                    .some(
                      (violation) =>
                        violation.date ===
                        date
                    );


                if (
                  editedDateConflicts
                ) {
                  /*
                    Athlete-added sessions are authoritative,
                    but Calendar availability is still a hard
                    constraint.

                    Tell Coach exactly which athlete-owned
                    sessions on the edited date may need to be
                    moved. Stable sessionId keeps this targeting
                    narrow even on multi-session days.
                  */
                  const conflictingAthleteSessions =
                    (
                      trainingPlan.additionalSessions ??
                      []
                    ).filter(
                      (session) =>
                        session.date ===
                          date &&
                        session.sessionSource ===
                          "athlete" &&
                        session.durationMinutes >
                          0
                    );

                  const athleteSessionInstruction =
                    conflictingAthleteSessions.length >
                      0
                      ? ` If necessary, move or reschedule only these conflicting athlete-added sessions while preserving their workout content: ${
                          conflictingAthleteSessions
                            .map(
                              (session) =>
                                `${session.title} [sessionId=${session.sessionId ?? "legacy"}]`
                            )
                            .join("; ")
                        }.`
                      : "";


                  const availabilityDescription =
                    !entry
                      ? "My normal weekly availability now applies again."
                      : entry.status ===
                          "Unavailable"
                        ? "I cannot train at all on this date."
                        : `My availability on this date is limited${
                            entry.allowedSports?.length
                              ? ` to ${entry.allowedSports.join(", ")}`
                              : ""
                          }${
                            entry.maxDurationMinutes
                              ? ` with a maximum of ${entry.maxDurationMinutes} total minutes`
                              : ""
                          }.`;


                  showToast(
                    "Adapting workouts around your new availability…",
                    "info",
                    true
                  );


                  beginCalendarAdaptation(
                    date
                  );

                  void sendMessage(
                    `My availability changed for ${date}. ${availabilityDescription} This is a hard calendar constraint. Adapt the current week immediately so the plan respects it. Preserve completed training and athlete-added sessions where possible.${athleteSessionInstruction} Move or reschedule an athlete-added session only when it directly conflicts with this Calendar change and moving it is the smallest sensible solution. Keep the workout itself unchanged; only its calendar placement may change. Make the smallest sensible changes and do not change unrelated sessions unless necessary.`,
                    updatedAvailability,
                    true,
                    previousAvailability
                  ).finally(
                    () => {
                      endCalendarAdaptation(
                        date
                      );
                    }
                  );

                  return;
                }
              }


              /*
                NEXT-WEEK PREVIEW

                Never leave a known-invalid provisional plan
                visible after the athlete changes availability.
                It will be rebuilt using the new constraints.
              */
              if (
                nextWeekPreview
              ) {
                const previewCheck =
                  validatePlanAgainstResolvedAvailability({
                    plan:
                      nextWeekPreview,

                    athlete,

                    availability:
                      updatedAvailability,
                  });

                const previewDateConflicts =
                  previewCheck
                    .violations
                    .some(
                      (violation) =>
                        violation.date ===
                        date
                    );

                if (
                  previewDateConflicts
                ) {
                  /*
                    Make the visible preview valid immediately.

                    The slower AI rebuild still runs afterwards
                    and may improve distribution, but the athlete
                    should never stare at a known-invalid session
                    while waiting.
                  */
                  const immediatelySafePreview =
                    repairPlanToResolvedAvailability({
                      plan:
                        nextWeekPreview,

                      athlete,

                      availability:
                        updatedAvailability,
                    });

                  setNextWeekPreview(
                    immediatelySafePreview
                  );


                  showToast(
                    "Adapting Next Week around your new availability…",
                    "info",
                    true
                  );


                  beginCalendarAdaptation(
                    date
                  );

                  void generateNextWeekPreview(
                    true,
                    updatedAvailability
                  ).finally(
                    () => {
                      endCalendarAdaptation(
                        date
                      );
                    }
                  );

                  return;
                }
              }


              showToast(
                entry
                  ? "Training availability updated."
                  : "Calendar override removed.",
                entry
                  ? "success"
                  : "info"
              );
            }}
          />
        )}


        {dashboardView === "coach" && (
          <CoachView
            chat={chat}
            message={message}
            quickReplies={quickReplies}
            isCoachThinking={
              isCoachThinking
            }
            today={today}
            trainingPlan={
              trainingPlan
            }
            todayReadiness={
              todayReadiness
            }
            weeklyReview={
              weeklyReview
            }
            onMessageChange={
              setMessage
            }
            onSendMessage={
              sendMessage
            }
          />
        )}

        {dashboardView === "progress" && (
          <>
            <header className="dashHeader">
              <div>
                <span className="eyebrow">
                  PROGRESS
                </span>

                <h1>
                  Completed training.
                </h1>
              </div>
            </header>

            <TrainingHistory
              archive={trainingArchive}
              currentFeedback={workoutHistory}
            />
          </>
        )}

        {dashboardView === "plan" && (
          <>
            <header className="dashHeader">
              <div>
                <span className="eyebrow">
                  SEASON
                </span>

                <h1>
                  See the road to race day.
                </h1>
              </div>
            </header>

            <SeasonRoadmapView
              roadmap={seasonRoadmap}
              trainingPlan={trainingPlan}
              loading={isRoadmapLoading}
              onGenerate={() => {
                void generateSeasonRoadmap();
              }}
            />

            <RoadmapRevisions
              revisions={
                roadmapRevisions
              }
            />
          </>
        )}

      </section>
      <AddSessionModal
        open={addSessionOpen}
        editingSession={
          editingManualSession
        }
        onClose={() => {
          setAddSessionOpen(false);
          setEditingManualSession(
            null
          );
        }}
        onAdd={(workout) => {
          const wasEditing =
            !!editingManualSession;

          if (!trainingPlan) {
            return false;
          }

          const todayIso =
            new Date()
              .toLocaleDateString("en-CA");

          /*
            Manual-session mutations must protect history
            independently of the UI.

            Logged and past sessions are historical records
            and must not be edited through this handler.
          */
          if (editingManualSession) {
            const editingIsLogged =
              workoutHistory.some(
                (item) =>
                  workoutMatchesFeedback(
                    editingManualSession,
                    item
                  )
              );

            const editingIsPast =
              Boolean(
                editingManualSession.date &&
                editingManualSession.date <
                  todayIso
              );

            if (
              editingIsLogged ||
              editingIsPast
            ) {
              showToast(
                editingIsLogged
                  ? "Logged sessions cannot be edited."
                  : "Past sessions cannot be edited.",
                "error"
              );

              return false;
            }
          }

          const targetPrimary =
            trainingPlan.days.find(
              (item) =>
                item.day === workout.day
            );

          if (
            targetPrimary?.date &&
            targetPrimary.date < todayIso
          ) {
            showToast(
              "Sessions cannot be added or moved into the past.",
              "error"
            );

            return false;
          }

          const targetHasRealPrimary =
            !!targetPrimary &&
            targetPrimary.sport !== "Rest" &&
            targetPrimary.durationMinutes > 0;

          const otherSessionsOnTargetDay =
            (
              trainingPlan.additionalSessions ??
              []
            ).filter((item) => {
              const isEditedSession = (() => {
                if (!editingManualSession) {
                  return false;
                }

                if (
                  editingManualSession.sessionId &&
                  item.sessionId
                ) {
                  return (
                    editingManualSession.sessionId ===
                    item.sessionId
                  );
                }

                if (
                  editingManualSession.sessionId ||
                  item.sessionId
                ) {
                  return false;
                }

                return (
                  item.day ===
                    editingManualSession.day &&
                  item.sport ===
                    editingManualSession.sport &&
                  item.title ===
                    editingManualSession.title
                );
              })();

              return (
                item.day === workout.day &&
                !isEditedSession
              );
            }).length;

          const sessionsOnTargetDay =
            (targetHasRealPrimary ? 1 : 0) +
            otherSessionsOnTargetDay;

          if (sessionsOnTargetDay >= 3) {
            showToast(
              `${workout.day} already has three planned sessions.`,
              "error"
            );

            return false;
          }

          const matchingPrimary =
            trainingPlan.days.find(
              (item) =>
                item.day ===
                workout.day
            );


          const nextWorkout:
            TrainingPlanDay = {
              ...workout,

              sessionId:
                editingManualSession
                  ?.sessionId ??
                workout.sessionId,

              date:
                matchingPrimary
                  ?.date,
            };


          const nextAdditionalSessions =
            editingManualSession
              ? (
                  trainingPlan.additionalSessions ??
                  []
                ).map((item) => {
                  if (
                    editingManualSession.sessionId &&
                    item.sessionId
                  ) {
                    return item.sessionId ===
                      editingManualSession.sessionId
                      ? nextWorkout
                      : item;
                  }

                  if (
                    editingManualSession.sessionId ||
                    item.sessionId
                  ) {
                    return item;
                  }

                  return (
                    item.day ===
                      editingManualSession.day &&
                    item.sport ===
                      editingManualSession.sport &&
                    item.title ===
                      editingManualSession.title
                  )
                    ? nextWorkout
                    : item;
                })
              : [
                  ...(
                    trainingPlan.additionalSessions ??
                    []
                  ),
                  nextWorkout,
                ];


          const candidatePlanBase = {
            ...trainingPlan,

            additionalSessions:
              nextAdditionalSessions,
          };

          const candidatePlan = {
            ...candidatePlanBase,

            totalHours:
              recalculateTrainingPlanTotalHours(
                candidatePlanBase
              ),
          };


          const availabilityCheck =
            validatePlanAgainstResolvedAvailability({
              plan:
                candidatePlan,

              athlete,

              availability:
                trainingAvailability,
            });


          if (
            !availabilityCheck.valid
          ) {
            showToast(
              availabilityCheck
                .violations[0]
                ?.message ??
                "That session conflicts with your Calendar availability.",
              "error"
            );

            return false;
          }


          setTrainingPlan(
            candidatePlan
          );

          setAddSessionOpen(false);
          setEditingManualSession(
            null
          );

          showToast(
            wasEditing
              ? `${workout.title} updated.`
              : `${workout.title} added to ${workout.day}.`,
            "success"
          );
          return true;

        }}
      />

      <CoachPlanChangeModal
        currentPlan={trainingPlan}
        proposedPlan={
          trainingPlan &&
          pendingCoachPlanChange
            ? mergeCoachPlanChange({
                currentPlan:
                  trainingPlan,

                proposedPlan:
                  pendingCoachPlanChange,

                reason:
                  pendingCoachPlanReason,

                feedback:
                  workoutHistory,
              })
            : null
        }
        immediateReason={
          pendingCoachPlanReason
        }
        decisionTrace={
          pendingCoachDecisionTrace
        }
        onKeep={() => {
          setPendingCoachPlanChange(
            null
          );

          setPendingCoachPlanReason(
            ""
          );

          setPendingCoachDecisionTrace(
            null
          );

          showToast(
            "Original training plan kept.",
            "info"
          );
        }}
        onApply={() => {
          if (
            !trainingPlan ||
            !pendingCoachPlanChange
          ) {
            return;
          }


          /*
            The stale-proposal effect normally clears an
            outdated proposal after authoritative state
            changes.

            Apply verifies the frozen baseline again
            synchronously so a click cannot land inside the
            render/effect gap.
          */
          const proposalIsStale =
            pendingCoachPlanBaselineRef.current !==
              trainingPlan ||
            pendingCoachHistoryBaselineRef.current !==
              workoutHistory ||
            pendingCoachAvailabilityBaselineRef.current !==
              trainingAvailability ||
            pendingCoachAthleteBaselineRef.current !==
              athlete;


          if (
            proposalIsStale
          ) {
            setPendingCoachPlanChange(
              null
            );

            setPendingCoachPlanReason(
              ""
            );

            setPendingCoachDecisionTrace(
              null
            );

            showToast(
              "Your training context changed, so this Coach proposal was discarded. Ask Basse again for an updated recommendation.",
              "info"
            );

            return;
          }


          const appliedPlan =
            mergeCoachPlanChange({
              currentPlan:
                trainingPlan,

              proposedPlan:
                pendingCoachPlanChange,

              reason:
                pendingCoachPlanReason,

              feedback:
                workoutHistory,
            });


          const availabilityCheck =
            validatePlanAgainstResolvedAvailability({
              plan:
                appliedPlan,

              athlete,

              availability:
                trainingAvailability,
            });


          if (
            !availabilityCheck.valid
          ) {
            console.error(
              "Coach proposal conflicts with availability:",
              availabilityCheck.violations
            );

            showToast(
              "These Coach changes conflict with your Calendar availability.",
              "error"
            );

            return;
          }


          setTrainingPlan(
            appliedPlan
          );

          setPendingCoachPlanChange(
            null
          );

          setPendingCoachPlanReason(
            ""
          );

          setPendingCoachDecisionTrace(
            null
          );

          showToast(
            "Coach changes applied to your training plan.",
            "success"
          );
        }}
      />

      <WorkoutFeedbackForm
        open={feedbackOpen}
        workout={feedbackWorkout}
        unitSystem={
          athlete.unitSystem ??
          "Metric"
        }
        status={feedbackStatus}
        rpe={feedbackRpe}
        feeling={feedbackFeeling}
        comment={feedbackComment}
        actualDurationMinutes={
          actualDurationMinutes
        }
        actualDistance={
          actualDistance
        }

        brickBikeDurationMinutes={
          brickBikeDurationMinutes
        }
        brickBikeDistance={
          brickBikeDistance
        }
        brickRunDurationMinutes={
          brickRunDurationMinutes
        }
        brickRunDistance={
          brickRunDistance
        }

        onStatusChange={
          setFeedbackStatus
        }
        onRpeChange={
          setFeedbackRpe
        }
        onFeelingChange={
          setFeedbackFeeling
        }
        onCommentChange={
          setFeedbackComment
        }
        onDurationChange={
          setActualDurationMinutes
        }
        onDistanceChange={
          setActualDistance
        }

        onBrickBikeDurationChange={
          setBrickBikeDurationMinutes
        }
        onBrickBikeDistanceChange={
          setBrickBikeDistance
        }
        onBrickRunDurationChange={
          setBrickRunDurationMinutes
        }
        onBrickRunDistanceChange={
          setBrickRunDistance
        }

        onSave={
          saveWorkoutFeedback
        }
        onCancel={() => {
          setFeedbackOpen(false);

          setFeedbackWorkout(null);

          setFeedbackStatus(
            "Completed"
          );

          setFeedbackRpe(5);

          setFeedbackFeeling(
            "Normal"
          );

          setFeedbackComment("");

          setActualDurationMinutes("");
          setActualDistance("");

          setBrickBikeDurationMinutes("");
          setBrickBikeDistance("");
          setBrickRunDurationMinutes("");
          setBrickRunDistance("");
        }}
      />

      <ReadinessModal
        open={readinessOpen}
        sleep={readinessSleep}
        energy={readinessEnergy}
        soreness={readinessSoreness}
        stress={readinessStress}
        motivation={readinessMotivation}
        note={readinessNote}
        onSleepChange={setReadinessSleep}
        onEnergyChange={setReadinessEnergy}
        onSorenessChange={setReadinessSoreness}
        onStressChange={setReadinessStress}
        onMotivationChange={setReadinessMotivation}
        onNoteChange={setReadinessNote}
        onSave={saveReadiness}
        onClose={() => setReadinessOpen(false)}
      />

      <WorkoutDetailsModal
        workout={selectedWorkout}
        targetRace={
          athlete.targetRace
        }
        unitSystem={
          athlete.unitSystem
        }
        week={
          selectedWorkoutPreviewOnly
            ? nextWeekPreview?.days ?? []
            : trainingPlan?.days ?? []
        }
        additionalSessions={
          selectedWorkoutPreviewOnly
            ? nextWeekPreview?.additionalSessions ?? []
            : trainingPlan?.additionalSessions ?? []
        }
        previewOnly={
          selectedWorkoutPreviewOnly
        }
        isManualSession={
          !!selectedWorkout &&
          selectedWorkout.sessionSource ===
            "athlete"
        }
        feedback={
          selectedWorkout
            ? [
                ...trainingArchive.flatMap(
                  (week) =>
                    week.feedback ?? []
                ),
                ...workoutHistory,
              ]
                .slice()
                .reverse()
                .find(
                  (item) =>
                    workoutMatchesFeedback(
                      selectedWorkout,
                      item
                    )
                ) ?? null
            : null
        }
        isLogged={
          selectedWorkout
            ? [
                ...trainingArchive.flatMap(
                  (week) =>
                    week.feedback ?? []
                ),
                ...workoutHistory,
              ].some(
                (item) =>
                  workoutMatchesFeedback(
                    selectedWorkout,
                    item
                  )
              )
            : false
        }
        canEditLog={
          selectedWorkout
            ? workoutHistory.some(
                (item) =>
                  workoutMatchesFeedback(
                    selectedWorkout,
                    item
                  )
              )
            : false
        }
        onClose={() => {
          setSelectedWorkout(
            null
          );

          setSelectedWorkoutPreviewOnly(
            false
          );
        }}
        onEditLog={(workout, feedback) => {
          setFeedbackWorkout(
            workout
          );

          setFeedbackStatus(
            feedback.status
          );

          setFeedbackRpe(
            feedback.rpe ?? 5
          );

          setFeedbackFeeling(
            feedback.feeling ??
              "Normal"
          );

          setFeedbackComment(
            feedback.comment ?? ""
          );


          const duration =
            feedback.actualDurationMinutes ??
            workout.durationMinutes;

          setActualDurationMinutes(
            String(duration)
          );


          const bikeSplit =
            feedback.disciplineSplits
              ?.find(
                (split) =>
                  split.sport ===
                  "Bike"
              );

          const runSplit =
            feedback.disciplineSplits
              ?.find(
                (split) =>
                  split.sport ===
                  "Run"
              );


          setBrickBikeDurationMinutes(
            bikeSplit
              ?.actualDurationMinutes !==
              null &&
            bikeSplit
              ?.actualDurationMinutes !==
              undefined
              ? String(
                  bikeSplit
                    .actualDurationMinutes
                )
              : ""
          );

          setBrickRunDurationMinutes(
            runSplit
              ?.actualDurationMinutes !==
              null &&
            runSplit
              ?.actualDurationMinutes !==
              undefined
              ? String(
                  runSplit
                    .actualDurationMinutes
                )
              : ""
          );


          function displayBrickDistance(
            value:
              | number
              | null
              | undefined
          ) {
            if (
              value === null ||
              value === undefined
            ) {
              return "";
            }

            const displayValue =
              athlete.unitSystem ===
                "Imperial"
                ? value /
                  1.609344
                : value;

            return String(
              Number(
                displayValue.toFixed(2)
              )
            );
          }


          setBrickBikeDistance(
            displayBrickDistance(
              bikeSplit?.distance
            )
          );

          setBrickRunDistance(
            displayBrickDistance(
              runSplit?.distance
            )
          );


          const storedDistance =
            feedback.distance;

          if (
            storedDistance === null ||
            storedDistance === undefined
          ) {
            setActualDistance("");
          } else if (
            athlete.unitSystem ===
              "Imperial"
          ) {
            if (
              workout.sport ===
              "Swim"
            ) {
              setActualDistance(
                String(
                  Number(
                    (
                      storedDistance /
                      0.9144
                    ).toFixed(0)
                  )
                )
              );
            } else if (
              workout.sport ===
                "Run" ||
              workout.sport ===
                "Bike"
            ) {
              setActualDistance(
                String(
                  Number(
                    (
                      storedDistance /
                      1.609344
                    ).toFixed(2)
                  )
                )
              );
            } else {
              setActualDistance(
                String(
                  storedDistance
                )
              );
            }
          } else {
            setActualDistance(
              String(
                Number(
                  storedDistance.toFixed(
                    workout.sport ===
                      "Swim"
                      ? 0
                      : 2
                  )
                )
              )
            );
          }


          setFeedbackOpen(true);

          setSelectedWorkout(null);
        }}
        onLogWorkout={(workout) => {
          openNewWorkoutFeedback(
            workout
          );

          setSelectedWorkout(
            null
          );
        }}
        onAdaptWorkout={(workout) => {
          const todayIso =
            new Date()
              .toLocaleDateString(
                "en-CA"
              );

          const isLogged =
            workoutHistory.some(
              (item) =>
                workoutMatchesFeedback(
                  workout,
                  item
                )
            );

          const isPast =
            Boolean(
              workout.date &&
              workout.date <
                todayIso
            );


          if (
            isLogged ||
            isPast
          ) {
            showToast(
              isLogged
                ? "Logged sessions cannot be adapted."
                : "Past sessions cannot be adapted.",
              "error"
            );

            return;
          }


          setSelectedWorkout(null);
          setDashboardView("coach");

          sendMessage(
            `I want to adapt my ${workout.day} workout: ${workout.title}.`
          );
        }}
        onEditManualWorkout={(workout) => {
          setSelectedWorkout(null);
          setEditingManualSession(
            workout
          );
          setAddSessionOpen(true);
        }}

        onRemoveManualWorkout={(workout) => {
          const todayIso =
            new Date()
              .toLocaleDateString("en-CA");

          const isLogged =
            workoutHistory.some(
              (item) =>
                workoutMatchesFeedback(
                  workout,
                  item
                )
            );

          const isPast =
            Boolean(
              workout.date &&
              workout.date < todayIso
            );

          if (
            isLogged ||
            isPast
          ) {
            showToast(
              isLogged
                ? "Logged sessions cannot be removed."
                : "Past sessions cannot be removed.",
              "error"
            );

            return;
          }

          setTrainingPlan(
            (current) => {
              if (!current) {
                return current;
              }

              const nextAdditionalSessions =
                (
                  current.additionalSessions ??
                  []
                ).filter(
                  (item) => {
                      if (
                        workout.sessionId &&
                        item.sessionId
                      ) {
                        return (
                          item.sessionId !==
                          workout.sessionId
                        );
                      }

                      if (
                        workout.sessionId ||
                        item.sessionId
                      ) {
                        return true;
                      }

                      return !(
                        item.day ===
                          workout.day &&
                        item.title ===
                          workout.title
                      );
                    }
                  );

              const nextPlan = {
                ...current,

                additionalSessions:
                  nextAdditionalSessions,
              };

              return {
                ...nextPlan,

                totalHours:
                  recalculateTrainingPlanTotalHours(
                    nextPlan
                  ),
              };
            }
          );

          showToast(
            `${workout.title} removed from ${workout.day}.`,
            "info"
          );
        }}

        onRemoveWorkout={(workout) => {
          const todayIso =
            new Date()
              .toLocaleDateString(
                "en-CA"
              );

          const isLogged =
            workoutHistory.some(
              (item) =>
                workoutMatchesFeedback(
                  workout,
                  item
                )
            );

          const isPast =
            Boolean(
              workout.date &&
              workout.date <
                todayIso
            );


          if (
            isLogged ||
            isPast
          ) {
            showToast(
              isLogged
                ? "Logged sessions cannot be removed."
                : "Past sessions cannot be removed.",
              "error"
            );

            return;
          }


          setSelectedWorkout(null);

          setDashboardView("coach");

          sendMessage(
            `I want to remove my ${workout.day} workout: ${workout.title} (${workout.durationMinutes} min, ${workout.intensity}). Please propose the smallest sensible change to this week's plan. If the session can simply be removed, leave it out. If removing it creates a meaningful training or recovery problem, suggest whether it should be replaced or moved. Do not change unrelated sessions unless necessary.`
          );
        }}
        onMoveWorkout={(
          workout,
          targetDay
        ) => {
          if (!trainingPlan) {
            return {
              success: false,
              message:
                "No active training plan.",
            };
          }

          if (
            workout.sport === "Rest" ||
            workout.durationMinutes === 0
          ) {
            return {
              success: false,
              message:
                "Recovery days cannot be moved.",
            };
          }

          if (
            targetDay === workout.day
          ) {
            return {
              success: false,
              message:
                `${workout.title} is already on ${targetDay}.`,
            };
          }

          /*
            Mutation-level protection.

            The UI already hides Move for resolved sessions,
            but the plan mutation itself must enforce the same
            invariant. Past and logged sessions are historical
            records and must never be relocated.
          */
          const todayIso =
            new Date()
              .toLocaleDateString("en-CA");

          const sourceIsPast =
            Boolean(
              workout.date &&
              workout.date < todayIso
            );

          const sourceIsLogged =
            workoutHistory.some(
              (item) =>
                workoutMatchesFeedback(
                  workout,
                  item
                )
            );

          if (
            sourceIsPast ||
            sourceIsLogged
          ) {
            return {
              success: false,
              message:
                sourceIsLogged
                  ? "Logged sessions cannot be moved."
                  : "Past sessions cannot be moved.",
            };
          }

          const additionalSessions =
            trainingPlan.additionalSessions ??
            [];

          const sameSession = (
            item: typeof workout
          ) => {
            if (
              item.sessionId &&
              workout.sessionId
            ) {
              return (
                item.sessionId ===
                workout.sessionId
              );
            }

            if (
              item.sessionId ||
              workout.sessionId
            ) {
              return false;
            }

            return (
              item.day === workout.day &&
              item.sport === workout.sport &&
              item.title === workout.title
            );
          };

          const sourcePrimaryIndex =
            trainingPlan.days.findIndex(
              sameSession
            );

          const sourceAdditionalIndex =
            additionalSessions.findIndex(
              sameSession
            );

          if (
            sourcePrimaryIndex < 0 &&
            sourceAdditionalIndex < 0
          ) {
            return {
              success: false,
              message:
                "Could not find the selected session.",
            };
          }

          const targetIndex =
            trainingPlan.days.findIndex(
              (item) =>
                item.day === targetDay
            );

          if (targetIndex < 0) {
            return {
              success: false,
              message:
                "Could not find the selected day.",
            };
          }

          const targetPrimary =
            trainingPlan.days[
              targetIndex
            ];

          if (
            targetPrimary.date &&
            targetPrimary.date < todayIso
          ) {
            return {
              success: false,
              message:
                "Sessions cannot be moved into the past.",
            };
          }

          /*
            Count real workouts on the destination day.

            Rest is only an empty primary storage slot and
            does not count as an actual workout.
          */
          const targetAdditional =
            additionalSessions.filter(
              (item, index) =>
                item.day === targetDay &&
                index !==
                  sourceAdditionalIndex
            );

          const targetHasRealPrimary =
            targetPrimary.sport !==
            "Rest";

          const targetSessionCount =
            (
              targetHasRealPrimary
                ? 1
                : 0
            ) +
            targetAdditional.length;

          if (
            targetSessionCount >= 3
          ) {
            return {
              success: false,
              message:
                `${targetDay} already has three planned sessions.`,
            };
          }

          const nextDays =
            trainingPlan.days.map(
              (item) => ({
                ...item,
                details:
                  item.details
                    ? [...item.details]
                    : [],
              })
            );

          let nextAdditional =
            additionalSessions.filter(
              (_, index) =>
                index !==
                sourceAdditionalIndex
            );

          const targetDate =
            targetPrimary.date;

          /*
            If the moved workout currently occupies a
            primary slot, only that workout leaves.

            Any other workout on the source day remains
            completely untouched.
          */
          if (
            sourcePrimaryIndex >= 0
          ) {
            const source =
              nextDays[
                sourcePrimaryIndex
              ];

            nextDays[
              sourcePrimaryIndex
            ] = {
              sessionId:
                `${
                  trainingPlan.weekStart ??
                  `week-${
                    trainingPlan.weekNumber ??
                    "current"
                  }`
                }-${
                  source.day
                    .toLowerCase()
                    .replace(
                      /[^a-z0-9]+/g,
                      "-"
                    )
                }-rest-${Date.now()}`,

              day:
                source.day,

              date:
                source.date,

              sport:
                "Rest",

              title:
                "Recovery day",

              durationMinutes:
                0,

              intensity:
                "Recovery",

              purpose:
                "Absorb training and stay ready for the next key session.",

              details: [
                "Keep the day easy.",
                "Optional gentle mobility or walking.",
              ],

              sessionSource:
                "coach",

              sessionRole:
                "primary",

              sessionSlot:
                "Flexible",
            };
          }

          /*
            The destination decides only where the workout
            is stored internally.

            To the user it is always just a workout.
          */
          if (
            targetPrimary.sport ===
            "Rest"
          ) {
            nextDays[
              targetIndex
            ] = {
              ...workout,

              day:
                targetDay,

              date:
                targetDate,

              sessionRole:
                "primary",

              sessionSource:
                workout.sessionSource ??
                "coach",
            };
          } else {
            nextAdditional = [
              ...nextAdditional,
              {
                ...workout,

                day:
                  targetDay,

                date:
                  targetDate,

                sessionRole:
                  "secondary" as const,

                sessionSource:
                  workout.sessionSource ??
                  ("coach" as const),
              },
            ];
          }

          const candidatePlanBase = {
            ...trainingPlan,

            days:
              nextDays,

            additionalSessions:
              nextAdditional,
          };

          const candidatePlan = {
            ...candidatePlanBase,

            totalHours:
              recalculateTrainingPlanTotalHours(
                candidatePlanBase
              ),
          };


          const availabilityCheck =
            validatePlanAgainstResolvedAvailability({
              plan:
                candidatePlan,

              athlete,

              availability:
                trainingAvailability,
            });


          if (
            !availabilityCheck.valid
          ) {
            return {
              success: false,

              message:
                availabilityCheck
                  .violations[0]
                  ?.message ??
                `${targetDay} conflicts with your Calendar availability.`,
            };
          }


          setTrainingPlan(
            candidatePlan
          );

          setSelectedWorkout(null);

          return {
            success: true,
            message:
              `${workout.title} moved to ${targetDay}.`,
          };
        }}
        onRestoreOriginal={(workout) => {
          const todayIso =
            new Date()
              .toLocaleDateString(
                "en-CA"
              );

          const isLogged =
            workoutHistory.some(
              (item) =>
                workoutMatchesFeedback(
                  workout,
                  item
                )
            );

          const isPast =
            Boolean(
              workout.date &&
              workout.date <
                todayIso
            );


          /*
            Restore is a real plan mutation.

            UI visibility is not a sufficient safety wall:
            historical and logged sessions must also be
            protected inside the mutation handler itself.
          */
          if (
            isLogged ||
            isPast
          ) {
            showToast(
              isLogged
                ? "Logged sessions cannot be restored."
                : "Past sessions cannot be restored.",
              "error"
            );

            return;
          }


          const original =
            workout.coachAdjustment
              ?.originalWorkout;


          if (!original) {
            showToast(
              "Original workout is not available.",
              "error"
            );

            return;
          }


          const restoredWorkout:
            TrainingPlanDay = {
              ...workout,
              ...original,

              /*
                Identity and placement belong to the
                current session, not the archived original.
              */
              sessionId:
                workout.sessionId,

              day:
                workout.day,

              date:
                workout.date,

              sessionSource:
                workout.sessionSource,

              sessionRole:
                workout.sessionRole,

              sessionSlot:
                workout.sessionSlot,

              coachAdjustment:
                undefined,
            };


          function sameSession(
            candidate:
              TrainingPlanDay
          ) {
            if (
              workout.sessionId &&
              candidate.sessionId
            ) {
              return (
                workout.sessionId ===
                candidate.sessionId
              );
            }


            if (
              workout.sessionId ||
              candidate.sessionId
            ) {
              return false;
            }


            return (
              candidate.day ===
                workout.day &&
              candidate.sport ===
                workout.sport &&
              candidate.title ===
                workout.title
            );
          }


          setTrainingPlan(
            (current) => {

              if (!current) {
                return current;
              }


              const isSecondary =
                workout.sessionRole ===
                  "secondary" ||
                (
                  current.additionalSessions ??
                  []
                ).some(
                  sameSession
                );


              if (isSecondary) {
                const nextPlan = {
                  ...current,

                  additionalSessions:
                    (
                      current.additionalSessions ??
                      []
                    ).map(
                      (item) =>
                        sameSession(
                          item
                        )
                          ? restoredWorkout
                          : item
                    ),
                };


                return {
                  ...nextPlan,

                  totalHours:
                    recalculateTrainingPlanTotalHours(
                      nextPlan
                    ),
                };
              }


              const nextPlan = {
                ...current,

                days:
                  current.days.map(
                    (day) =>
                      sameSession(
                        day
                      )
                        ? restoredWorkout
                        : day
                  ),
              };


              return {
                ...nextPlan,

                totalHours:
                  recalculateTrainingPlanTotalHours(
                    nextPlan
                  ),
              };
            }
          );


          setSelectedWorkout(
            (current) => {

              if (
                !current ||
                !sameSession(
                  current
                )
              ) {
                return current;
              }


              return restoredWorkout;
            }
          );


          showToast(
            "Original workout restored.",
            "success"
          );
        }}
/>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          persistent={toast.persistent}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      <ConfirmModal
        open={Boolean(confirmState)}
        title={
          confirmState?.title ?? ""
        }
        message={
          confirmState?.message ?? ""
        }
        confirmLabel={
          confirmState?.confirmLabel
        }
        destructive={
          confirmState?.destructive
        }
        onCancel={() =>
          setConfirmState(null)
        }
        onConfirm={() => {
          const action =
            confirmState?.action;

          if (!action) {
            return;
          }

          setConfirmState(null);
          action();
        }}
      />

      <DeleteAccountModal
        open={deleteAccountOpen}
        loading={isDeletingAccount}
        error={deleteAccountError}
        onCancel={() => {
          if (
            !isDeletingAccount
          ) {
            setDeleteAccountOpen(false);
            setDeleteAccountError("");
            setSettingsOpen(true);
          }
        }}
        onConfirm={() => {
          void deleteAccountConfirmed();
        }}
      />

      <SettingsModal
        open={settingsOpen}
        userEmail={userEmail}
        isResetting={isResetting}
        isDeletingAccount={
          isDeletingAccount
        }

        unitSystem={
          athlete.unitSystem ??
          "Metric"
        }

        onUnitSystemChange={(
          unitSystem
        ) =>
          setAthlete(
            (
              current
            ) => ({
              ...current,
              unitSystem,
            })
          )
        }
        onClose={() => setSettingsOpen(false)}
        onEditProfile={editAthleteProfile}
        onPerformanceBenchmarks={
          openPerformanceBenchmarks
        }
        onTargetRace={
          openTargetRace
        }
        onFeedback={
          openAppFeedback
        }
        onResetPlan={resetTrainingPlan}
        onLogout={logOut}
        onDeleteAccount={
          openDeleteAccount
        }


        onResetTriCoach={
          resetTriCoach
        }
/>

      <AppFeedbackModal
        open={
          appFeedbackOpen
        }
        userEmail={
          userEmail
        }
        onClose={() =>
          setAppFeedbackOpen(
            false
          )
        }
        onSubmit={
          submitAppFeedback
        }
      />

      <BenchmarkModal
        open={benchmarkModalOpen}
        benchmarks={athlete.benchmarks}
        onClose={() =>
          setBenchmarkModalOpen(false)
        }
        onSave={
          savePerformanceBenchmarks
        }
      />

      <RacePickerModal
        open={targetRaceModalOpen}
        currentRace={athlete.targetRace}
        unitSystem={
          athlete.unitSystem ??
          "Metric"
        }
        onClose={() =>
          setTargetRaceModalOpen(false)
        }
        onSelect={saveTargetRace}
        onManual={
          openManualTargetRace
        }
        onEditCurrent={
          athlete.targetRace
            ? openManualTargetRace
            : undefined
        }
      />

      <TargetRaceModal
        open={manualRaceModalOpen}
        targetRace={athlete.targetRace}
        unitSystem={
          athlete.unitSystem ??
          "Metric"
        }
        onClose={() =>
          setManualRaceModalOpen(false)
        }
        onSave={saveTargetRace}
        onRemove={
          athlete.targetRace
            ? removeTargetRace
            : undefined
        }
      />

    </main>
  );
}
