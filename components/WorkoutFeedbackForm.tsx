"use client";

import TrainingTerm from "@/components/TrainingTerm";

import {
  formatDuration,
} from "@/lib/format-duration";

import type {
  TrainingPlanDay,
} from "@/types/training";

type FeedbackStatus =
  | "Completed"
  | "Skipped"
  | "Modified";

type FeedbackFeeling =
  | "Great"
  | "Normal"
  | "Heavy";

type WorkoutFeedbackFormProps = {
  open: boolean;
  workout: TrainingPlanDay | null;

  unitSystem:
    | "Metric"
    | "Imperial";

  status: FeedbackStatus;
  rpe: number;
  feeling: FeedbackFeeling;
  comment: string;

  actualDurationMinutes: string;
  actualDistance: string;

  brickBikeDurationMinutes: string;
  brickBikeDistance: string;
  brickRunDurationMinutes: string;
  brickRunDistance: string;

  onStatusChange: (
    value: FeedbackStatus
  ) => void;

  onRpeChange: (
    value: number
  ) => void;

  onFeelingChange: (
    value: FeedbackFeeling
  ) => void;

  onCommentChange: (
    value: string
  ) => void;

  onDurationChange: (
    value: string
  ) => void;

  onDistanceChange: (
    value: string
  ) => void;

  onBrickBikeDurationChange: (
    value: string
  ) => void;

  onBrickBikeDistanceChange: (
    value: string
  ) => void;

  onBrickRunDurationChange: (
    value: string
  ) => void;

  onBrickRunDistanceChange: (
    value: string
  ) => void;

  onSave: () => void;
  onCancel: () => void;
};

export default function WorkoutFeedbackForm({
  open,
  workout,
  unitSystem,
  status,
  rpe,
  feeling,
  comment,
  actualDurationMinutes,
  actualDistance,
  brickBikeDurationMinutes,
  brickBikeDistance,
  brickRunDurationMinutes,
  brickRunDistance,
  onStatusChange,
  onRpeChange,
  onFeelingChange,
  onCommentChange,
  onDurationChange,
  onDistanceChange,
  onBrickBikeDurationChange,
  onBrickBikeDistanceChange,
  onBrickRunDurationChange,
  onBrickRunDistanceChange,
  onSave,
  onCancel,
}: WorkoutFeedbackFormProps) {
  if (!open) {
    return null;
  }


  const structureSports =
    new Set(
      (
        workout?.workoutStructure ??
        []
      )
        .map(
          (block) =>
            block.sport
        )
        .filter(Boolean)
    );


  const workoutText =
    workout
      ? [
          workout.title,
          workout.purpose,
          ...(workout.details ?? []),
        ]
          .join(" ")
          .toLowerCase()
      : "";


  const isBikeRunBrick =
    !!workout &&
    (
      (
        structureSports.has("Bike") &&
        structureSports.has("Run")
      ) ||
      (
        workout.sport === "Bike" &&
        /\bbrick\b/.test(
          workoutText
        )
      )
    );


  const enduranceDistanceLabel =
    unitSystem === "Imperial"
      ? "DISTANCE (MI)"
      : "DISTANCE (KM)";


  return (
    <div
      className="alpineModalOverlay alpineFeedbackOverlay"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        display: "grid",
        placeItems: "center",
        padding: "20px",
        background: "rgba(20, 22, 18, .55)",
        backdropFilter: "blur(4px)",
        overflowY: "auto",
      }}
    >
      <section
        className="questionCard alpineLegacyModal alpineFeedbackModal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "92vh",
          overflowY: "auto",
          margin: 0,
          padding: "28px",
          background: "rgba(255,255,255,.012)",
          boxShadow: "0 30px 90px rgba(0,0,0,.22)",
        }}
      >
      <div className="eyebrow">
        LOG WORKOUT
      </div>

      <h1
        style={{
          fontSize: "2.4rem",
        }}
      >
        How did it go?
      </h1>

      {workout && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            borderRadius: "12px",
            background: "rgba(255,255,255,.018)",
          }}
        >
          <strong>
            {workout.day} ·{" "}
            {workout.sport}
          </strong>

          <div
            style={{
              marginTop: ".35rem",
              color: "#87998e",
            }}
          >
            {workout.title} ·{" "}
            {formatDuration(
              workout.durationMinutes
            )} planned
          </div>
        </div>
      )}

      <div className="choiceGrid three">
        {(
          [
            "Completed",
            "Modified",
            "Skipped",
          ] as const
        ).map((value) => (
          <button
            key={value}
            className={[
              "choice",
              "feedbackStatusChoice",
              `feedbackStatus${value}`,
              status === value
                ? "selected"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() =>
              onStatusChange(value)
            }
          >
            <strong>
              {value}
            </strong>
          </button>
        ))}
      </div>

      {status !== "Skipped" && (
        <>
          {isBikeRunBrick ? (
            <div
              style={{
                marginTop: "1.5rem",
                display: "grid",
                gap: "12px",
              }}
            >
              <div className="eyebrow">
                BRICK EXECUTION
              </div>

              <div
                style={{
                  padding: "1rem",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,.018)",
                  border:
                    "1px solid rgba(255,255,255,.045)",
                }}
              >
                <strong>
                  Bike
                </strong>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "10px",
                    marginTop: ".75rem",
                  }}
                >
                  <div>
                    <div
                      className="eyebrow"
                      style={{
                        marginBottom:
                          ".5rem",
                      }}
                    >
                      TIME (MIN)
                    </div>

                    <input
                      className="field"
                      type="number"
                      min="0"
                      step="1"
                      value={
                        brickBikeDurationMinutes
                      }
                      placeholder="e.g. 90"
                      onChange={(e) =>
                        onBrickBikeDurationChange(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <div
                      className="eyebrow"
                      style={{
                        marginBottom:
                          ".5rem",
                      }}
                    >
                      {enduranceDistanceLabel}
                    </div>

                    <input
                      className="field"
                      type="number"
                      min="0"
                      step="0.1"
                      value={
                        brickBikeDistance
                      }
                      placeholder={
                        unitSystem ===
                        "Imperial"
                          ? "e.g. 30"
                          : "e.g. 48"
                      }
                      onChange={(e) =>
                        onBrickBikeDistanceChange(
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "1rem",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,.018)",
                  border:
                    "1px solid rgba(255,255,255,.045)",
                }}
              >
                <strong>
                  Run
                </strong>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "10px",
                    marginTop: ".75rem",
                  }}
                >
                  <div>
                    <div
                      className="eyebrow"
                      style={{
                        marginBottom:
                          ".5rem",
                      }}
                    >
                      TIME (MIN)
                    </div>

                    <input
                      className="field"
                      type="number"
                      min="0"
                      step="1"
                      value={
                        brickRunDurationMinutes
                      }
                      placeholder="e.g. 30"
                      onChange={(e) =>
                        onBrickRunDurationChange(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <div
                      className="eyebrow"
                      style={{
                        marginBottom:
                          ".5rem",
                      }}
                    >
                      {enduranceDistanceLabel}
                    </div>

                    <input
                      className="field"
                      type="number"
                      min="0"
                      step="0.1"
                      value={
                        brickRunDistance
                      }
                      placeholder={
                        unitSystem ===
                        "Imperial"
                          ? "e.g. 4"
                          : "e.g. 6.5"
                      }
                      onChange={(e) =>
                        onBrickRunDistanceChange(
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  workout?.sport === "Strength"
                    ? "1fr"
                    : "1fr 1fr",
                gap: "10px",
                marginTop: "1.5rem",
              }}
            >
              <div>
                <div
                  className="eyebrow"
                  style={{
                    marginBottom: ".5rem",
                  }}
                >
                  ACTUAL DURATION
                </div>

                <input
                  className="field"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    actualDurationMinutes
                  }
                  placeholder="Minutes"
                  onChange={(e) =>
                    onDurationChange(
                      e.target.value
                    )
                  }
                />
              </div>

              {workout &&
                [
                  "Run",
                  "Bike",
                  "Swim",
                ].includes(
                  workout.sport
                ) && (
                  <div>
                    <div
                      className="eyebrow"
                      style={{
                        marginBottom:
                          ".5rem",
                      }}
                    >
                      {workout.sport ===
                      "Swim"
                        ? unitSystem ===
                            "Imperial"
                          ? "DISTANCE (YARDS)"
                          : "DISTANCE (METERS)"
                        : enduranceDistanceLabel}
                    </div>

                    <input
                      className="field"
                      type="number"
                      min="0"
                      step={
                        workout.sport ===
                        "Swim"
                          ? "25"
                          : "0.1"
                      }
                      value={
                        actualDistance
                      }
                      placeholder={
                        workout.sport ===
                        "Swim"
                          ? unitSystem ===
                              "Imperial"
                            ? "e.g. 2000"
                            : "e.g. 1800"
                          : unitSystem ===
                              "Imperial"
                            ? "e.g. 5.7"
                            : "e.g. 9.2"
                      }
                      onChange={(e) =>
                        onDistanceChange(
                          e.target.value
                        )
                      }
                    />
                  </div>
                )}
            </div>
          )}

          <div className="feedbackRpeBlock">

            <div className="feedbackRpeTop">

              <div>
                <div className="eyebrow">
                  EFFORT
                </div>

                <strong className="feedbackRpeValue">
                  <TrainingTerm term="RPE">
                    {`RPE ${rpe}`}
                  </TrainingTerm>
                  <span>/10</span>
                </strong>
              </div>

              <span className="feedbackRpeMeaning">
                {rpe <= 3
                  ? "Easy"
                  : rpe <= 5
                    ? "Moderate"
                    : rpe <= 7
                      ? "Hard"
                      : "Very hard"}
              </span>

            </div>

            <input
              className="feedbackRpeSlider"
              type="range"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) =>
                onRpeChange(
                  Number(
                    e.target.value
                  )
                )
              }
            />

            <div className="feedbackRpeScale">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Hard</span>
              <span>Very hard</span>
            </div>

          </div>

          <div
            className="choiceGrid three"
            style={{
              marginTop: "1.5rem",
            }}
          >
            {(
              [
                "Great",
                "Normal",
                "Heavy",
              ] as const
            ).map((value) => (
              <button
                key={value}
                className={[
                  "choice",
                  "feedbackFeelingChoice",
                  `feedbackFeeling${value}`,
                  feeling === value
                    ? "selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  onFeelingChange(value)
                }
              >
                <strong>
                  {value}
                </strong>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="feedbackNoteBlock">

        <div className="feedbackNoteHeader">

          <div className="eyebrow">
            OPTIONAL NOTE
          </div>

          <span>
            For your coach
          </span>

        </div>

        <textarea
          className="field feedbackNoteField"
          value={comment}
          placeholder="Anything worth noting?"
          onChange={(e) =>
            onCommentChange(
              e.target.value
            )
          }
        />

      </div>

      <div className="feedbackActions">

        <button
          className="primary feedbackSaveAction"
          onClick={onSave}
        >
          Save workout
        </button>

        <button
          className="secondary feedbackCancelAction"
          onClick={onCancel}
        >
          Cancel
        </button>

      </div>
      </section>
    </div>
  );
}
