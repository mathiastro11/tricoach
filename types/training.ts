// Shared TriCoach types

export type Goal = "Sprint" | "Olympic" | "70.3" | "Ironman";
export type Discipline = "Swimming" | "Cycling" | "Running";

export type PerformanceBenchmarks = {
  updatedAt?: string;

  swim?: {
    updatedAt?: string;

    time200Seconds?: number | null;
    time400Seconds?: number | null;
    cssSecondsPer100m?: number | null;

    source?:
      | "200-400 test"
      | "External test"
      | "Race result"
      | null;
  };

  bike?: {
    updatedAt?: string;

    ftpWatts?: number | null;
    twentyMinutePowerWatts?: number | null;

    source?:
      | "FTP test"
      | "20-minute test"
      | "External platform"
      | "Race / training data"
      | null;
  };

  run?: {
    updatedAt?: string;

    fiveKSeconds?: number | null;
    tenKSeconds?: number | null;
    thresholdSecondsPerKm?: number | null;

    source?:
      | "5 km result"
      | "10 km result"
      | "External threshold test"
      | "Race result"
      | null;
  };
};


export type TargetRaceCourseProfile =
  | "Flat"
  | "Rolling"
  | "Hilly"
  | "Mountainous"
  | "Mixed"
  | "Unknown";


export type TargetRace = {
  /*
    Race identity.
    id may later point to a race database entry.
    Manual races can use a generated local id.
  */
  id: string;

  name: string;
  date: string;

  location?: string;

  source:
    | "database"
    | "manual";

  format:
    | "Sprint"
    | "Olympic"
    | "70.3"
    | "Ironman"
    | "Other";


  /*
    Discipline-specific course information.

    All fields are optional because a manually
    entered local event may have limited data.
  */

  swim?: {
    distanceKm?: number | null;

    environment?:
      | "Pool"
      | "Lake"
      | "Sea"
      | "Fjord"
      | "River"
      | "Open water"
      | "Unknown";

    expectedWaterTempC?:
      number | null;

    wetsuitLikely?:
      boolean | null;
  };


  bike?: {
    distanceKm?: number | null;

    elevationGainM?:
      number | null;

    /*
      Human-readable verified elevation.

      Examples:
      "3,000+ m"
      "2,377 m"
      "Approx. 1,500 m"

      The numeric field remains available
      for coaching calculations.
    */
    elevationDisplay?:
      string;

    profile?:
      TargetRaceCourseProfile;

    technicality?:
      | "Low"
      | "Moderate"
      | "High"
      | "Unknown";
  };


  run?: {
    distanceKm?: number | null;

    elevationGainM?:
      number | null;

    /*
      Human-readable verified elevation.

      Examples:
      "3,000+ m"
      "2,377 m"
      "Approx. 1,500 m"

      The numeric field remains available
      for coaching calculations.
    */
    elevationDisplay?:
      string;

    profile?:
      TargetRaceCourseProfile;

    surface?:
      | "Road"
      | "Trail"
      | "Mixed"
      | "Unknown";
  };


  /*
    High-level race characteristics can later
    become deterministic training signals.

    Examples:
    "Cold-water swim"
    "High bike elevation"
    "Technical descents"
    "Hot conditions"
    "Long-course fueling"
  */

  characteristics?: string[];

  notes?: string;

  updatedAt?: string;

  /*
    True when the athlete has manually changed
    catalog-provided race data.

    Athlete overrides should take priority
    over catalog values in coaching.
  */
  userModified?: boolean;

};


export type UnitSystem =
  | "Metric"
  | "Imperial";


export type AthleteExperience =
  | "Beginner"
  | "Intermediate"
  | "Experienced"
  | "Advanced";


export type DisciplineLevel =
  | "Beginner"
  | "Developing"
  | "Confident"
  | "Advanced"
  | "Elite";


export type PerformanceTier =
  | "Recreational"
  | "Competitive"
  | "Elite"
  | "Professional";


export type AthleteCapabilityProfile = {
  version: 1;

  experience: AthleteExperience;

  swimLevel: DisciplineLevel;
  bikeLevel: DisciplineLevel;
  runLevel: DisciplineLevel;

  performanceTier: PerformanceTier;
};


export type Athlete = {
  name: string;

  unitSystem?: UnitSystem;

  goal: Goal;
  raceDate: string;
  hoursPerWeek: string;
  weakestDiscipline: Discipline;

  experience: AthleteExperience;

  /*
    Optional for backwards compatibility with athlete
    objects stored before Capability Profile V1.
  */
  performanceTier?: PerformanceTier;

  currentTrainingHours: string;

  swimLevel: DisciplineLevel;
  bikeLevel: DisciplineLevel;
  runLevel: DisciplineLevel;

  /*
    Legacy general availability.

    Keep for backward compatibility while
    discipline-specific weekly availability
    becomes the preferred scheduling model.
  */
  availableDays: string[];

  /*
    Normal recurring week from onboarding.

    Calendar date overrides take priority over
    this baseline.
  */
  weeklyAvailability?: WeeklyTrainingAvailability;

  longestSessionMinutes: string;

  poolAccess: boolean;
  indoorTrainer: boolean;
  gymAccess: boolean;

  limitations: string;

  benchmarks?: PerformanceBenchmarks;


  /*
    Optional real-world race goal.

    goal + raceDate remain as backward-compatible
    fallback fields and should stay synchronized
    when a target race is selected.
  */
  targetRace?: TargetRace;

};

export type ChatMessage = {
  role: "coach" | "user";
  text: string;
};

export type WorkoutStructurePhase =
  | "Warm-up"
  | "Main"
  | "Recovery"
  | "Cool-down";


/*
  Canonical executable workout structure.

  This is the source of truth for structured sessions.

  Both the human-readable workout instructions and
  workout visualizations should eventually render from
  these same blocks.

  duration values use seconds so short rests such as
  20–30 seconds can be represented accurately.

  distance values use canonical metres internally.
*/
export type WorkoutStructureBlock = {
  /*
    V2 block-level discipline.

    Optional only for backwards compatibility with
    already stored V1 plans.
  */
  sport?:
    | "Swim"
    | "Bike"
    | "Run"
    | "Strength";

  kind:
    | "segment"
    | "repeat";

  phase: WorkoutStructurePhase;

  label: string;

  /*
    For a normal segment this is 1.

    Example:
    4 × 6 min threshold = 4.
  */
  repeatCount: number;

  /*
    The work portion of the block.

    Use null when that measure does not apply.
  */
  workDurationSeconds: number | null;
  workDistanceMeters: number | null;

  workIntensity: string;
  workInstruction: string;

  /*
    Benchmark-derived target for THIS specific block.

    Added deterministically after generation.
    It is guidance only and never changes the canonical
    duration / distance structure.
  */
  performanceTarget?: string;

  /*
    Recovery belongs to the same repeated block.

    Example:
    4 × 6 min threshold with 4 min easy riding:

    repeatCount: 4
    workDurationSeconds: 360
    recoveryDurationSeconds: 240

    Recovery is performed BETWEEN repetitions,
    therefore there are repeatCount - 1 recoveries
    unless the instruction explicitly says otherwise.
  */
  recoveryDurationSeconds: number | null;
  recoveryDistanceMeters: number | null;

  recoveryIntensity: string | null;
  recoveryInstruction: string | null;
};



/*
  Canonical strength-training prescription.

  Strength needs different execution data from endurance
  sessions. Sets, reps, load guidance and rest are the source
  of truth rather than artificial time/distance blocks.
*/

export type StrengthMovementPattern =
  | "Squat"
  | "Hinge"
  | "Single-leg"
  | "Calf"
  | "Pull"
  | "Push"
  | "Trunk"
  | "Power";


export type StrengthTrainingGoal =
  | "Adaptation"
  | "MaxStrength"
  | "StrengthPower"
  | "Maintenance"
  | "Taper";


export type StrengthExerciseKey =
  | "back-squat"
  | "front-squat"
  | "goblet-squat"
  | "leg-press"
  | "hack-squat"
  | "romanian-deadlift"
  | "trap-bar-deadlift"
  | "hip-thrust"
  | "bulgarian-split-squat"
  | "reverse-lunge"
  | "step-up"
  | "single-leg-press"
  | "seated-calf-raise"
  | "standing-calf-raise"
  | "single-leg-calf-raise"
  | "pull-up"
  | "lat-pulldown"
  | "chest-supported-row"
  | "cable-row"
  | "bench-press"
  | "incline-dumbbell-press"
  | "dumbbell-press"
  | "push-up"
  | "landmine-press"
  | "pallof-press"
  | "dead-bug"
  | "side-plank"
  | "cable-anti-rotation"
  | "carry"
  | "countermovement-jump"
  | "box-jump"
  | "jump-squat"
  | "other";


export type StrengthExercisePrescription = {
  /*
    Human-readable exercise name.

    Example:
    "Back squat"
    "Romanian deadlift"
    "Bulgarian split squat"
  */
  exerciseKey: StrengthExerciseKey;

  name: string;

  /*
    Lets TriCoach preserve movement balance even when
    individual exercises are substituted.
  */
  movementPattern: StrengthMovementPattern;

  /*
    Exact working-set prescription.
    Warm-up sets are not included here.
  */
  sets: number;

  /*
    Kept as text because useful prescriptions include:
    "4–6"
    "6 / side"
    "8–10"
    "3 explosive reps"
  */
  reps: string;

  /*
    Athlete-facing loading guidance.

    Examples:
    "RPE 7–8 · 2–3 RIR"
    "Explosive · stop before speed drops"
    "Controlled · leave 3 reps in reserve"
  */
  loadGuidance: string;

  /*
    Planned rest BETWEEN working sets.
  */
  restSeconds: number;

  /*
    One short execution cue.
    Avoid long technique essays here.
  */
  instruction: string;

  /*
    Practical substitutions that preserve the intended
    movement pattern when equipment or experience differs.
  */
  alternatives: string[];
};


export type StrengthStructure = {
  /*
    The role of this session in the current training phase.
  */
  goal: StrengthTrainingGoal;

  /*
    Short preparation instructions before working sets.
    Example:
    - 5–8 min easy movement
    - progressive warm-up sets for first main lift
  */
  warmup: string[];

  /*
    Ordered working exercises.
  */
  exercises: StrengthExercisePrescription[];
};


export type TrainingPlanDay = {
  sessionId?: string;
  day: string;
  date?: string;

  /*
    Multi-session metadata.

    Primary sessions remain in plan.days.
    Secondary sessions live in plan.additionalSessions.
  */
  sessionSource?: "coach" | "athlete";
  sessionRole?: "primary" | "secondary";
  sessionSlot?: "AM" | "PM" | "Flexible";

  /*
    Marks the athlete's actual target race when it
    falls inside the active training week.
  */
  isRaceDay?: boolean;
  targetRaceName?: string;

  /*
    Day belongs to the active calendar week,
    but the athlete's target race has already
    completed the training season.
  */
  isPostRace?: boolean;
  sport: string;
  title: string;
  durationMinutes: number;
  intensity: string;


  /*
    Benchmark-derived performance reference.

    This is deliberately separate from workoutStructure:
    the benchmark may guide execution, but must never
    rewrite the canonical workout itself.
  */
  performanceTarget?: string;
  purpose: string;

  /*
    Legacy / fallback presentation text.

    Existing saved plans continue to use this.
    New structured workouts will progressively use
    workoutStructure as their executable source of truth.
  */
  details: string[];

  /*
    Optional during migration so existing saved plans
    remain fully compatible.

    Once all generators produce this reliably, new
    coach-generated sessions will require it.
  */
  workoutStructure?: WorkoutStructureBlock[];

  /*
    Canonical execution structure for Strength workouts.

    When present on a Strength session, this is the source
    of truth for exercises, sets, reps, loading and rest.

    Optional during migration so existing saved plans remain
    fully backwards compatible.
  */
  strengthStructure?: StrengthStructure | null;

  coachAdjustment?: {
    adjustedAt: string;
    reason: string;
    previousDurationMinutes?: number;
    source: "coach";

    originalWorkout?: {
      sport: string;
      title: string;
      durationMinutes: number;
      intensity: string;
      purpose: string;
      details: string[];
      workoutStructure?: WorkoutStructureBlock[];
      strengthStructure?: StrengthStructure | null;
    };
  };
};

export type TrainingPlan = {
  summary: string;
  totalHours: number;
  focus: string;
  weekNumber?: number;
  weekStart?: string;

  // The seven primary sessions created by TriCoach.
  days: TrainingPlanDay[];

  /*
    Secondary sessions.

    These may be generated by TriCoach or added manually
    by the athlete.

    Keeping them separate preserves the stable seven-day
    primary-session architecture.
  */
  additionalSessions?: TrainingPlanDay[];
};

export type TrainingWeekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";


export type WeeklyTrainingAvailability = {
  Swim: TrainingWeekday[];
  Bike: TrainingWeekday[];
  Run: TrainingWeekday[];
  Strength: TrainingWeekday[];
};


export type TrainingAvailabilityStatus =
  | "Available"
  | "Limited"
  | "Unavailable";


export type AvailabilitySport =
  | "Swim"
  | "Bike"
  | "Run"
  | "Strength";


/*
  A date-specific real-world training constraint.

  These are HARD constraints, not preferences.

  Examples:
  - unavailable all day
  - cannot run on this date
  - swim only
  - maximum 60 minutes total training
*/
export type TrainingAvailability = {
  date: string;

  status: TrainingAvailabilityStatus;

  /*
    Relevant when status === "Limited".

    Missing / empty means no discipline restriction.
    Duration may still be restricted.
  */
  allowedSports?: AvailabilitySport[];

  /*
    Maximum TOTAL planned training across every
    session on this date.
  */
  maxDurationMinutes?: number;

  /*
    Athlete context only.

    The note must never weaken the hard structured
    restrictions above.
  */
  note?: string;
};


export type WorkoutFeedbackDisciplineSplit = {
  sport:
    | "Swim"
    | "Bike"
    | "Run";

  plannedDurationMinutes?:
    number | null;

  actualDurationMinutes:
    number | null;

  distance:
    number | null;

  distanceUnit:
    | "km"
    | "m"
    | null;
};


export type WorkoutFeedback = {
  id: string;
  sessionId?: string;
  day: string;
  date?: string;
  sport: string;
  title: string;

  plannedDurationMinutes: number | null;

  status: "Completed" | "Skipped" | "Modified";

  actualDurationMinutes: number | null;
  distance: number | null;
  distanceUnit: "km" | "m" | null;

  /*
    Optional discipline-level execution data.

    Used for connected multi-discipline workouts such as
    Bike -> Run bricks.

    The workout itself remains ONE planned session, while
    actual Bike / Run time and distance can still be stored
    separately for accurate history and Progress analytics.

    Older feedback records remain fully compatible because
    this field is optional.
  */
  disciplineSplits?:
    WorkoutFeedbackDisciplineSplit[];

  rpe: number | null;
  feeling: "Great" | "Normal" | "Heavy" | null;

  comment: string;
  completedAt: string;
};

export type RoadmapWeek = {
  weekIndex: number;
  startDate: string;
  phase: "Base" | "Build" | "Peak" | "Taper";
  focus: string;
  targetHours: number;
  priorityDiscipline: string;
  keyObjectives: string[];
};

export type ReadinessEntry = {
  id: string;
  date: string;
  sleep: number;
  energy: number;
  soreness: number;
  stress: number;
  motivation: number;
  score: number;
  status: "Ready" | "Caution" | "Recover";
  note: string;
  createdAt: string;
};

export type RoadmapRevision = {
  id: string;
  createdAt: string;
  reason: string;
  summary: string;
  previousRoadmap: SeasonRoadmap;
  updatedRoadmap: SeasonRoadmap;
};

export type SeasonRoadmap = {
  createdAt: string;
  raceDate: string;
  raceGoal: string;
  totalWeeks: number;
  summary: string;
  weeks: RoadmapWeek[];
};

export type TrainingArchiveWeek = {
  plan: TrainingPlan;
  feedback: WorkoutFeedback[];
  review: WeeklyReview | null;
  archivedAt: string;
};

export type CoachingDecision = {
  fatigueRisk:
    | "Low"
    | "Moderate"
    | "High";

  consistency:
    | "Low"
    | "Moderate"
    | "High";

  loadDecision:
    | "Increase slightly"
    | "Maintain"
    | "Reduce";

  completionRate: number | null;
  averageRpe: number | null;
  heavySessions: number;

  recentPoorReadiness: number;
  recentRecoverDays: number;

  recommendedHoursMin: number;
  recommendedHoursMax: number;

  reasons: string[];
};

export type DecisionTrace = {
  headline: string;

  signals: string[];

  decision: string;

  confidence:
    | "Low"
    | "Moderate"
    | "High";
};


export type WeeklyReview = {
  headline: string;
  summary: string;
  completedSessions: number;
  skippedSessions: number;
  averageRpe: number | null;
  loadDecision:
    | "Increase slightly"
    | "Maintain"
    | "Reduce";
  positives: string[];
  concerns: string[];
  nextWeekFocus: string;

  coachingDecision:
    | CoachingDecision
    | null;

  decisionTrace?: DecisionTrace | null;
};
