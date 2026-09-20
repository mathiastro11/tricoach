"use client";

import type {
  TrainingPlan,
  TrainingPlanDay,
} from "@/types/training";

type CoachPlanChangeModalProps = {
  currentPlan: TrainingPlan | null;
  proposedPlan: TrainingPlan | null;

  immediateReason?: string;

  decisionTrace?: {
    headline: string;
    signals: string[];
    decision: string;
    confidence:
      | "Low"
      | "Moderate"
      | "High";
  } | null;

  onApply: () => void;
  onKeep: () => void;
};

export default function CoachPlanChangeModal({
  currentPlan,
  proposedPlan,
  immediateReason,
  decisionTrace,
  onApply,
  onKeep,
}: CoachPlanChangeModalProps) {

  if (
    !currentPlan ||
    !proposedPlan
  ) {
    return null;
  }

  /*
    PROPOSAL DIFF

    sessionId is the source of truth for workout identity.

    Primary/secondary are storage details only. The proposal
    compares actual workouts across the whole week.

    Heuristic matching is used only for legacy sessions that
    genuinely have no sessionId.
  */
  const getActualSessions = (
    plan: TrainingPlan
  ) => [
    ...plan.days.filter(
      (session) =>
        session.sport !== "Rest" &&
        session.durationMinutes > 0
    ),

    ...(
      plan.additionalSessions ??
      []
    ).filter(
      (session) =>
        session.sport !== "Rest" &&
        session.durationMinutes > 0
    ),
  ];


  const normalizeText = (
    value: unknown
  ) =>
    String(value ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();


  const sameLegacySession = (
    current: TrainingPlanDay,
    proposed: TrainingPlanDay
  ) =>
    !current.sessionId &&
    !proposed.sessionId &&
    current.day === proposed.day &&
    normalizeText(current.sport) ===
      normalizeText(proposed.sport) &&
    normalizeText(current.title) ===
      normalizeText(proposed.title) &&
    Number(current.durationMinutes) ===
      Number(proposed.durationMinutes) &&
    normalizeText(current.intensity) ===
      normalizeText(proposed.intensity);


  const currentSessions =
    getActualSessions(currentPlan);

  const proposedSessions =
    getActualSessions(proposedPlan);


  const proposedById =
    new Map<string, TrainingPlanDay>();

  proposedSessions.forEach(
    (session) => {
      if (session.sessionId) {
        proposedById.set(
          session.sessionId,
          session
        );
      }
    }
  );


  const matchedProposedIds =
    new Set<string>();

  const matchedLegacyIndexes =
    new Set<number>();


  const changesByDay =
    new Map<string, string[]>();


  const addChange = (
    day: string,
    change: string
  ) => {
    const existing =
      changesByDay.get(day) ?? [];

    existing.push(change);

    changesByDay.set(
      day,
      existing
    );
  };


  currentSessions.forEach(
    (current) => {
      let proposed:
        | TrainingPlanDay
        | undefined;

      if (current.sessionId) {
        proposed =
          proposedById.get(
            current.sessionId
          );

        if (proposed?.sessionId) {
          matchedProposedIds.add(
            proposed.sessionId
          );
        }
      } else {
        const legacyIndex =
          proposedSessions.findIndex(
            (candidate, index) =>
              !matchedLegacyIndexes.has(index) &&
              sameLegacySession(
                current,
                candidate
              )
          );

        if (legacyIndex >= 0) {
          proposed =
            proposedSessions[
              legacyIndex
            ];

          matchedLegacyIndexes.add(
            legacyIndex
          );
        }
      }


      if (!proposed) {
        addChange(
          current.day,
          `REMOVED — ${current.title}`
        );

        return;
      }


      /*
        Placement and workout content are separate.
        A move is shown once, under the destination day.
      */
      if (
        current.day !==
        proposed.day
      ) {
        addChange(
          proposed.day,
          `MOVED — ${proposed.title} · ${current.day} → ${proposed.day}`
        );
      }


      const adjustmentDetails:
        string[] = [];


      if (
        normalizeText(current.title) !==
        normalizeText(proposed.title)
      ) {
        adjustmentDetails.push(
          `Workout: ${current.title} → ${proposed.title}`
        );
      }


      if (
        Number(
          current.durationMinutes
        ) !==
        Number(
          proposed.durationMinutes
        )
      ) {
        adjustmentDetails.push(
          `Duration: ${Number(
            current.durationMinutes
          )} → ${Number(
            proposed.durationMinutes
          )} min`
        );
      }


      if (
        normalizeText(
          current.intensity
        ) !==
        normalizeText(
          proposed.intensity
        )
      ) {
        adjustmentDetails.push(
          `Intensity: ${current.intensity} → ${proposed.intensity}`
        );
      }


      if (
        normalizeText(
          current.sport
        ) !==
        normalizeText(
          proposed.sport
        )
      ) {
        adjustmentDetails.push(
          `Sport: ${current.sport} → ${proposed.sport}`
        );
      }


      if (
        adjustmentDetails.length > 0
      ) {
        addChange(
          proposed.day,
          `ADJUSTED — ${proposed.title} · ${adjustmentDetails.join(" · ")}`
        );
      }
    }
  );


  proposedSessions.forEach(
    (proposed, index) => {

      if (proposed.sessionId) {
        if (
          matchedProposedIds.has(
            proposed.sessionId
          )
        ) {
          return;
        }
      } else if (
        matchedLegacyIndexes.has(index)
      ) {
        return;
      }

      addChange(
        proposed.day,
        `ADDED — ${proposed.title}`
      );
    }
  );


  /*
    Keep the familiar Monday-Sunday ordering, but only
    include days with real changes.
  */
  const changedDaySummaries =
    currentPlan.days
      .map((daySlot) => {
        const changes =
          changesByDay.get(
            daySlot.day
          ) ?? [];

        if (
          changes.length === 0
        ) {
          return null;
        }

        return {
          day:
            daySlot.day,

          changes,
        };
      })
      .filter(
        (
          item
        ): item is {
          day: string;
          changes: string[];
        } => Boolean(item)
      );


  const totalSessionsChanged =
    changedDaySummaries.length;

  const planMetaChanged =
    currentPlan.focus !==
      proposedPlan.focus ||
    currentPlan.summary !==
      proposedPlan.summary ||
    currentPlan.totalHours !==
      proposedPlan.totalHours;

  return (
    <div
      className="coachChangeOverlay"
      onClick={onKeep}
    >
      <section
        className="coachChangeModal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="coachChangeTop">
          <div>
            <span className="eyebrow">
              COACH PROPOSAL
            </span>

            <h2>
              Review the suggested changes.
            </h2>

            <p>
              Basse has prepared an
              adjustment, but your plan has
              not changed yet.
            </p>
          </div>

          <button
            className="coachChangeClose"
            onClick={onKeep}
            aria-label="Keep original plan"
          >
            ×
          </button>
        </div>

        <div className="coachChangeSummary">
          <div>
            <span>
              WEEKLY LOAD
            </span>

            <strong>
              {currentPlan.totalHours}h
              {" → "}
              {proposedPlan.totalHours}h
            </strong>
          </div>

          <div>
            <span>
              DAYS CHANGED
            </span>

            <strong>
              {totalSessionsChanged}
            </strong>
          </div>

          <div>
            <span>
              WEEK FOCUS
            </span>

            <strong>
              {proposedPlan.focus}
            </strong>
          </div>
        </div>

        {totalSessionsChanged > 0 ? (
          <div className="coachChangeList">
            {changedDaySummaries.map(
              ({
                day,
                changes,
              }) => (
                <div
                  className="coachChangeItem"
                  key={`day-${day}`}
                >
                  <div className="coachChangeDay">
                    <span>
                      {day}
                    </span>
                  </div>

                  <div
                    className="coachChangeAfter"
                    style={{
                      gridColumn:
                        "2 / -1",
                    }}
                  >
                    {changes.map(
                      (
                        change,
                        index
                      ) => {
                        const [
                          rawType,
                          ...rest
                        ] =
                          change.split(" — ");

                        const changeType =
                          rawType.trim();

                        const changeText =
                          rest.join(" — ").trim();

                        return (
                          <div
                            className="coachChangeLine"
                            key={`${day}-${index}`}
                          >
                            <span
                              className={[
                                "coachChangeBadge",
                                `coachChangeBadge${changeType}`,
                              ].join(" ")}
                            >
                              {changeType}
                            </span>

                            <p>
                              {changeText || change}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ) : planMetaChanged ? (
          <div className="coachChangePlanOnly">
            <span className="eyebrow">
              PLAN-LEVEL CHANGE
            </span>

            <h3>
              The weekly strategy has been
              adjusted.
            </h3>

            <p>
              {proposedPlan.summary}
            </p>
          </div>
        ) : (
          <div className="coachChangePlanOnly">
            <p>
              No meaningful workout changes
              were detected.
            </p>
          </div>
        )}

        <div className="coachDecisionTrace">
          <div className="coachDecisionTraceTop">
            <div>
              <span className="eyebrow">
                WHY THIS CHANGE
              </span>

              <h3>
                {decisionTrace?.headline ??
                  "A practical adjustment to your current plan."}
              </h3>
            </div>

            {decisionTrace && (
              <span className="coachDecisionConfidence">
                {decisionTrace.confidence} confidence
              </span>
            )}
          </div>

          {immediateReason?.trim() && (
            <div className="coachDecisionImmediate">
              <span>
                YOUR REQUEST
              </span>

              <p>
                {immediateReason}
              </p>
            </div>
          )}

          {decisionTrace?.signals?.length ? (
            <div className="coachDecisionSignalsBlock">
              <span className="coachDecisionSignalsLabel">
                KEY SIGNALS
              </span>

              <div className="coachDecisionSignals">
                {decisionTrace.signals
                  .slice(0, 3)
                  .map((signal) => (
                    <div
                      key={signal}
                      className="coachDecisionSignal"
                    >
                      <b>•</b>
                      <span>{signal}</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}

          <div className="coachDecisionOutcome">
            <span>
              DECISION
            </span>

            <strong>
              {decisionTrace?.decision ??
                proposedPlan.summary}
            </strong>
          </div>
        </div>

        <div className="coachChangeActions">
          <button
            className="secondary coachKeepOriginal"
            onClick={onKeep}
          >
            Keep original
          </button>

          <button
            className="primary coachApplyChanges"
            onClick={onApply}
          >
            Apply changes
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}
