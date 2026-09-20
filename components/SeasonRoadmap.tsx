"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  SeasonRoadmap as SeasonRoadmapType,
  TrainingPlan,
} from "@/types/training";

type SeasonRoadmapProps = {
  roadmap: SeasonRoadmapType | null;
  trainingPlan: TrainingPlan | null;
  loading: boolean;
  onGenerate: () => void;
};

const PHASES = [
  "Base",
  "Build",
  "Peak",
  "Taper",
] as const;

export default function SeasonRoadmap({
  roadmap,
  trainingPlan,
  loading,
  onGenerate,
}: SeasonRoadmapProps) {

  const [
    expandedWeek,
    setExpandedWeek,
  ] = useState<number | null>(
    null
  );

  const now = new Date();

  const currentWeekIndex =
    useMemo(() => {
      if (
        !roadmap?.weeks?.length
      ) {
        return null;
      }

      const today =
        new Date();

      let bestIndex:
        | number
        | null = null;

      roadmap.weeks.forEach(
        (week, index) => {
          const start =
            new Date(
              `${week.startDate}T12:00:00`
            );

          const next =
            roadmap.weeks[
              index + 1
            ];

          const end =
            next?.startDate
              ? new Date(
                  `${next.startDate}T12:00:00`
                )
              : new Date(
                  start.getTime() +
                    7 *
                      86400000
                );

          if (
            today >= start &&
            today < end
          ) {
            bestIndex =
              index;
          }
        }
      );

      if (
        bestIndex !== null
      ) {
        return bestIndex;
      }

      const nextFuture =
        roadmap.weeks.findIndex(
          (week) =>
            new Date(
              `${week.startDate}T12:00:00`
            ) > today
        );

      return nextFuture >= 0
        ? nextFuture
        : roadmap.weeks.length - 1;
    }, [roadmap]);

  if (!roadmap) {
    return (
      <section className="racePlanEmpty">
        <div>
          <span className="eyebrow">
            SEASON
          </span>

          <h2>
            Build your season to race day.
          </h2>

          <p>
            Basse connects your weekly training
            into a clear progression through Base,
            Build, Peak and Taper.
          </p>
        </div>

        <button
          className="primary"
          disabled={loading}
          onClick={onGenerate}
        >
          {loading
            ? "Building roadmap..."
            : "Build my season →"}
        </button>
      </section>
    );
  }

  const raceDate =
    new Date(
      `${roadmap.raceDate}T12:00:00`
    );

  const daysToRace =
    Math.max(
      0,
      Math.ceil(
        (
          raceDate.getTime() -
          now.getTime()
        ) / 86400000
      )
    );

  const currentWeek =
    currentWeekIndex !== null
      ? roadmap.weeks[
          currentWeekIndex
        ]
      : null;

  const nextWeek =
    currentWeekIndex !== null
      ? roadmap.weeks[
          currentWeekIndex + 1
        ] ?? null
      : null;


  const currentPlannedHours =
    trainingPlan &&
    typeof trainingPlan.totalHours === "number"
      ? trainingPlan.totalHours
      : null;

  const currentPlanDiffersFromRoadmap =
    currentWeek &&
    currentPlannedHours !== null &&
    Math.abs(
      currentPlannedHours -
      currentWeek.targetHours
    ) >= 0.5;

  const completedWeeks =
    currentWeekIndex !== null
      ? currentWeekIndex
      : 0;

  const seasonProgress =
    roadmap.totalWeeks > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (
                completedWeeks /
                roadmap.totalWeeks
              ) * 100
            )
          )
        )
      : 0;

  const phaseCounts =
    PHASES.reduce(
      (acc, phase) => {
        acc[phase] =
          roadmap.weeks.filter(
            (week) =>
              week.phase === phase
          ).length;

        return acc;
      },
      {} as Record<
        (typeof PHASES)[number],
        number
      >
    );

  return (
    <section className="racePlanShell">

      {loading && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 1000,

            width: "min(340px, calc(100vw - 32px))",

            padding: "14px 16px",

            borderRadius: "14px",

            background:
              "var(--ink, #20231d)",

            color:
              "var(--paper, #ffffff)",

            boxShadow:
              "0 12px 36px rgba(0, 0, 0, 0.16)",

            fontSize: "14px",
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                background: "currentColor",
                opacity: 0.8,
                flexShrink: 0,
              }}
            />

            <div>
              <strong>
                Refining your season…
              </strong>

              <div
                style={{
                  marginTop: "2px",
                  opacity: 0.72,
                  fontSize: "13px",
                }}
              >
                Your race and season structure are already updated.
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="racePlanHero">
        <div className="racePlanHeroMain">
          <div className="racePlanTopline">
            <span className="eyebrow">
              SEASON OVERVIEW
            </span>

            <button
              className="racePlanRebuild"
              disabled={loading}
              onClick={onGenerate}
            >
              {loading
                ? "Updating..."
                : "Update season"}
            </button>
          </div>

          <h2>
            {roadmap.raceGoal}
          </h2>

          <p>
            {roadmap.summary}
          </p>

          <div className="raceCountdownLarge">
            <strong>
              {daysToRace}
            </strong>

            <span>
              DAYS TO RACE
            </span>
          </div>

          <div className="raceProgressTrack">
            <div
              style={{
                width:
                  `${seasonProgress}%`,
              }}
            />
          </div>

          <div className="raceProgressMeta">
            <span>
              Season progress
            </span>

            <strong>
              {seasonProgress}%
            </strong>
          </div>
        </div>

        <div className="racePlanHeroSide">
          <div>
            <span>
              RACE DAY
            </span>

            <strong>
              {raceDate.toLocaleDateString(
                "en-GB",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </strong>
          </div>

          <div>
            <span>
              SEASON LENGTH
            </span>

            <strong>
              {roadmap.totalWeeks}
              {" "}weeks
            </strong>
          </div>

          <div>
            <span>
              PHASE
            </span>

            <strong>
              {currentWeek?.phase ??
                "—"}
            </strong>
          </div>

          <div>
            <span>
              FOCUS
            </span>

            <strong>
              {currentWeek?.focus ??
                "—"}
            </strong>
          </div>
        </div>
      </section>

      <section className="racePhaseSection">
        <div className="sectionTitle">
          <div>
            <span className="eyebrow">
              THE SEASON
            </span>

            <h2>
              Your progression to race day
            </h2>
          </div>

          <span>
            You are here
          </span>
        </div>

        <div className="racePhaseBar">
          {PHASES.map(
            (phase) => {
              const active =
                currentWeek?.phase ===
                phase;

              const completed =
                currentWeekIndex !==
                  null &&
                roadmap.weeks
                  .slice(
                    0,
                    currentWeekIndex
                  )
                  .some(
                    (week) =>
                      week.phase ===
                      phase
                  );

              return (
                <div
                  key={phase}
                  className={[
                    "racePhase",
                    active
                      ? "active"
                      : "",
                    completed
                      ? "completed"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="phaseDot">
                    {active
                      ? "●"
                      : completed
                      ? "✓"
                      : ""}
                  </div>

                  <strong>
                    {phase}
                  </strong>

                  <span>
                    {phaseCounts[
                      phase
                    ] ?? 0}
                    {" "}weeks
                  </span>
                </div>
              );
            }
          )}
        </div>
      </section>

      {currentWeek && (
        <section className="youAreHereCard">
          <div className="youAreHereMarker">
            <span>
              YOU ARE HERE
            </span>
          </div>

          <div className="youAreHereContent">
            <div>
              <span className="eyebrow">
                WEEK{" "}
                {currentWeek.weekIndex}
              </span>

              <h2>
                {currentWeek.focus}
              </h2>

              <p>
                You are currently in the{" "}
                <strong>
                  {currentWeek.phase}
                </strong>
                {" "}phase. This week&apos;s priority is{" "}
                <strong>
                  {
                    currentWeek.priorityDiscipline
                  }
                </strong>
                .
              </p>
            </div>

            <div className="currentWeekMetrics">
              <div className="currentWeekRoadmapMetric">
                <span>
                  ROADMAP TARGET
                </span>

                <strong>
                  {
                    currentWeek.targetHours
                  }
                  h
                </strong>
              </div>

              {currentPlanDiffersFromRoadmap && (
                <div className="currentWeekPlannedMetric">
                  <span>
                    PLANNED THIS WEEK
                  </span>

                  <strong>
                    {currentPlannedHours}
                    h
                  </strong>
                </div>
              )}

              <div>
                <span>
                  PRIORITY
                </span>

                <strong>
                  {
                    currentWeek.priorityDiscipline
                  }
                </strong>
              </div>

              <div>
                <span>
                  PHASE
                </span>

                <strong>
                  {
                    currentWeek.phase
                  }
                </strong>
              </div>
            </div>
          </div>

          {currentWeek.keyObjectives
            ?.length > 0 && (
            <div className="currentObjectives">
              {currentWeek
                .keyObjectives
                .map(
                  (
                    objective,
                    index
                  ) => (
                    <div
                      key={
                        objective
                      }
                    >
                      <span>
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <strong>
                        {objective}
                      </strong>
                    </div>
                  )
                )}
            </div>
          )}
        </section>
      )}

      {nextWeek && (
        <section className="raceNextMilestone">
          <div>
            <span className="eyebrow">
              NEXT WEEK
            </span>

            <h3>
              {nextWeek.focus}
            </h3>

            <p>
              Week{" "}
              {nextWeek.weekIndex}
              {" · "}
              {nextWeek.phase}
              {" · "}
              {nextWeek.targetHours}
              h
              {" · "}
              priority{" "}
              {
                nextWeek.priorityDiscipline
              }
            </p>
          </div>

          <div className="nextMilestoneArrow">
            →
          </div>
        </section>
      )}

      <section className="seasonTimelineSection">
        <div className="sectionTitle">
          <div>
            <span className="eyebrow">
              FULL SEASON
            </span>

            <h2>
              See how the plan develops
            </h2>
          </div>

          <span>
            Select a week for details
          </span>
        </div>

        <div className="seasonTimeline">
          {roadmap.weeks.map(
            (
              week,
              index
            ) => {
              const active =
                index ===
                currentWeekIndex;

              const past =
                currentWeekIndex !==
                  null &&
                index <
                  currentWeekIndex;

              const expanded =
                expandedWeek ===
                  week.weekIndex;

              const previousWeek =
                index > 0
                  ? roadmap.weeks[
                      index - 1
                    ]
                  : null;

              const volumeChange =
                previousWeek
                  ? week.targetHours -
                    previousWeek.targetHours
                  : 0;

              const volumeDirection =
                volumeChange > 0.35
                  ? "up"
                  : volumeChange < -0.35
                    ? "down"
                    : "steady";

              return (
                <button
                  key={
                    week.weekIndex
                  }
                  className={[
                    "timelineWeek",
                    active
                      ? "active"
                      : "",
                    past
                      ? "past"
                      : "",
                    expanded
                      ? "expanded"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    setExpandedWeek(
                      expanded
                        ? null
                        : week.weekIndex
                    )
                  }
                >
                  <div className="timelineWeekHead">
                    <div>
                      <span>
                        WEEK{" "}
                        {
                          week.weekIndex
                        }
                      </span>

                      <strong>
                        {
                          week.focus
                        }
                      </strong>
                    </div>

                    <span className="timelinePhase">
                      {week.phase}
                    </span>
                  </div>

                  <div className="timelineWeekMeta">
                    <span>
                      {new Date(
                        `${week.startDate}T12:00:00`
                      ).toLocaleDateString(
                        "en-GB",
                        {
                          day:
                            "numeric",
                          month:
                            "short",
                        }
                      )}
                    </span>

                    <span className="timelineVolumeMeta">
                      {
                        week.targetHours
                      }
                      h

                      {previousWeek && (
                        <small
                          className={`timelineVolumeDirection ${volumeDirection}`}
                          aria-label={
                            volumeDirection === "up"
                              ? "Training volume increases"
                              : volumeDirection === "down"
                                ? "Training volume decreases"
                                : "Training volume stays similar"
                          }
                        >
                          {volumeDirection === "up"
                            ? "↑"
                            : volumeDirection === "down"
                              ? "↓"
                              : "→"}
                        </small>
                      )}
                    </span>

                    <span>
                      {
                        week.priorityDiscipline
                      }
                    </span>
                  </div>

                  {active && (
                    <div className="timelineYouAreHere">
                      YOU ARE HERE
                    </div>
                  )}

                  {expanded && (
                    <div className="timelineDetails">
                      {week
                        .keyObjectives
                        ?.length >
                        0 ? (
                        week.keyObjectives.map(
                          (
                            objective,
                            objectiveIndex
                          ) => (
                            <div
                              key={
                                objective
                              }
                            >
                              <span>
                                {String(
                                  objectiveIndex +
                                    1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <p>
                                {
                                  objective
                                }
                              </p>
                            </div>
                          )
                        )
                      ) : (
                        <p>
                          Stay aligned with
                          the week&apos;s main
                          focus.
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            }
          )}
        </div>
      </section>

      <section className="raceDayFinish">
        <div className="raceFlag">
          ▲
        </div>

        <div>
          <span className="eyebrow">
            RACE DAY
          </span>

          <h2>
            {roadmap.raceGoal}
          </h2>

          <p>
            The goal is to arrive prepared,
            recovered and ready to perform —
            not simply to complete the biggest
            training week possible.
          </p>
        </div>

        <strong>
          {raceDate.toLocaleDateString(
            "en-GB",
            {
              day: "numeric",
              month: "short",
            }
          )}
        </strong>
      </section>
    </section>
  );
}
