"use client";

import {
  useState,
} from "react";

import type {
  TrainingPlanDay,
} from "@/types/training";

type AddSessionModalProps = {
  open: boolean;

  editingSession?: TrainingPlanDay | null;

  onClose: () => void;
  onAdd: (
    workout: TrainingPlanDay
  ) => boolean | void;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SPORTS = [
  "Swim",
  "Bike",
  "Run",
  "Strength",
  "Hike",
  "Ski",
  "Other",
];

const INTENSITIES = [
  "Recovery",
  "Easy",
  "Moderate",
  "Hard",
];

const SESSION_SLOTS = [
  "AM",
  "Flexible",
  "PM",
] as const;

type SessionSlot =
  (typeof SESSION_SLOTS)[number];

type AddSessionModalContentProps = {
  editingSession: TrainingPlanDay | null;
  onClose: () => void;
  onAdd: (
    workout: TrainingPlanDay
  ) => boolean | void;
};


function AddSessionModalContent({
  editingSession,
  onClose,
  onAdd,
}: AddSessionModalContentProps) {
  const [
    day,
    setDay,
  ] = useState(
    editingSession?.day ??
      "Monday"
  );

  const [
    sport,
    setSport,
  ] = useState(
    editingSession?.sport ??
      "Run"
  );

  const [
    title,
    setTitle,
  ] = useState(
    editingSession?.title ??
      ""
  );

  const [
    duration,
    setDuration,
  ] = useState(
    editingSession
      ? String(
          editingSession.durationMinutes
        )
      : "45"
  );

  const [
    intensity,
    setIntensity,
  ] = useState(
    editingSession?.intensity ??
      "Easy"
  );

  const [
    note,
    setNote,
  ] = useState(
    editingSession?.purpose ===
      "Athlete-added training session."
      ? ""
      : editingSession?.purpose ??
        ""
  );

  const [
    sessionSlot,
    setSessionSlot,
  ] = useState<SessionSlot>(
    editingSession?.sessionSlot ??
      "Flexible"
  );

  function reset() {
    setDay("Monday");
    setSport("Run");
    setTitle("");
    setDuration("45");
    setIntensity("Easy");
    setNote("");
    setSessionSlot("Flexible");
  }

  function close() {
    reset();
    onClose();
  }

  function submit() {
    const minutes =
      Number(duration);

    if (
      !Number.isFinite(minutes) ||
      minutes <= 0
    ) {
      return;
    }

    const cleanTitle =
      title.trim() ||
      `${sport} session`;

    const saved = onAdd({
      sessionId:
        editingSession
          ?.sessionId ??
        `manual-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      day,
      sport,
      title: cleanTitle,
      durationMinutes:
        Math.round(minutes),
      intensity,

      purpose:
        note.trim() ||
        "Athlete-added training session.",

      details:
        note.trim()
          ? [note.trim()]
          : [],

      sessionSource:
        editingSession?.sessionSource ??
        "athlete",

      sessionRole:
        "secondary",

      sessionSlot,
    });

    if (saved === false) {
      return;
    }

    reset();
  }

  return (
    <div
      className="addSessionOverlay"
      onClick={close}
    >
      <section
        className="addSessionModal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="addSessionHeader">
          <div>
            <span className="eyebrow">
              {editingSession
                ? "EDIT SESSION"
                : "ADD SESSION"}
            </span>

            <h2>
              {editingSession
                ? "Update your added session."
                : "Add training outside the plan."}
            </h2>

            <p>
              Basse will keep this as its own
              workout on the selected day.
            </p>
          </div>

          <button
            className="addSessionClose"
            onClick={close}
            aria-label="Close add session"
          >
            ×
          </button>
        </div>

        <div className="addSessionForm">

          <label>
            <span>DAY</span>

            <select
              value={day}
              onChange={(event) =>
                setDay(
                  event.target.value
                )
              }
            >
              {DAYS.map((item) => (
                <option
                  value={item}
                  key={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>SPORT</span>

            <select
              value={sport}
              onChange={(event) =>
                setSport(
                  event.target.value
                )
              }
            >
              {SPORTS.map((item) => (
                <option
                  value={item}
                  key={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="addSessionWide">
            <span>SESSION NAME</span>

            <input
              value={title}
              placeholder="Easy social run"
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>DURATION</span>

            <div className="addDurationInput">
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(event) =>
                  setDuration(
                    event.target.value
                  )
                }
              />

              <strong>
                min
              </strong>
            </div>
          </label>

          <label>
            <span>INTENSITY</span>

            <select
              value={intensity}
              onChange={(event) =>
                setIntensity(
                  event.target.value
                )
              }
            >
              {INTENSITIES.map(
                (item) => (
                  <option
                    value={item}
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </label>

          <div
            className="addSessionWide addSessionSlotField"
          >
            <span className="addSessionSlotLabel">
              TIME OF DAY
            </span>

            <div
              className="addSessionSlotControl"
              role="group"
              aria-label="Time of day"
            >
              {SESSION_SLOTS.map(
                (slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={
                      sessionSlot === slot
                        ? "isActive"
                        : ""
                    }
                    aria-pressed={
                      sessionSlot === slot
                    }
                    onClick={() =>
                      setSessionSlot(slot)
                    }
                  >
                    {slot}
                  </button>
                )
              )}
            </div>

            <small className="addSessionSlotHint">
              {sessionSlot === "AM"
                ? "Planned before later sessions."
                : sessionSlot === "PM"
                  ? "Planned after earlier sessions."
                  : "No fixed order within the day."}
            </small>
          </div>

          <label className="addSessionWide">
            <span>
              NOTE · OPTIONAL
            </span>

            <textarea
              rows={3}
              value={note}
              placeholder="Trail run with friends, easy pace..."
              onChange={(event) =>
                setNote(
                  event.target.value
                )
              }
            />
          </label>
        </div>

        <div className="addSessionHint">
          <strong>
            Counts as real training
          </strong>

          <span>
            Basse includes athlete-added sessions
            when judging training load and recovery.
          </span>
        </div>

        <div className="addSessionActions">
          <button
            className="secondary"
            onClick={close}
          >
            Cancel
          </button>

          <button
            className="primary"
            disabled={
              !duration ||
              Number(duration) <= 0
            }
            onClick={submit}
          >
            {editingSession
              ? "Save changes →"
              : "Add session →"}
          </button>
        </div>
      </section>
    </div>
  );
}


export default function AddSessionModal({
  open,
  editingSession = null,
  onClose,
  onAdd,
}: AddSessionModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AddSessionModalContent
      key={
        editingSession?.sessionId ??
        "new-session"
      }
      editingSession={
        editingSession
      }
      onClose={onClose}
      onAdd={onAdd}
    />
  );
}
