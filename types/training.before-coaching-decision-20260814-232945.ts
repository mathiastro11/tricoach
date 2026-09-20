// Shared TriCoach types

export type Goal = "Sprint" | "Olympic" | "70.3" | "Ironman";
export type Discipline = "Swimming" | "Cycling" | "Running";

export type Athlete = {
  name: string;
  goal: Goal;
  raceDate: string;
  hoursPerWeek: string;
  weakestDiscipline: Discipline;

  experience: "Beginner" | "Intermediate" | "Experienced";
  currentTrainingHours: string;

  swimLevel: "Beginner" | "Developing" | "Confident";
  bikeLevel: "Beginner" | "Developing" | "Confident";
  runLevel: "Beginner" | "Developing" | "Confident";

  availableDays: string[];
  longestSessionMinutes: string;

  poolAccess: boolean;
  indoorTrainer: boolean;
  gymAccess: boolean;

  limitations: string;
};

export type ChatMessage = {
  role: "coach" | "user";
  text: string;
};

export type TrainingPlanDay = {
  day: string;
  date?: string;
  sport: string;
  title: string;
  durationMinutes: number;
  intensity: string;
  purpose: string;
  details: string[];
};

export type TrainingPlan = {
  summary: string;
  totalHours: number;
  focus: string;
  weekNumber?: number;
  weekStart?: string;
  days: TrainingPlanDay[];
};

export type WorkoutFeedback = {
  id: string;
  day: string;
  date?: string;
  sport: string;
  title: string;

  plannedDurationMinutes: number | null;

  status: "Completed" | "Skipped" | "Modified";

  actualDurationMinutes: number | null;
  distance: number | null;
  distanceUnit: "km" | "m" | null;

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
};
