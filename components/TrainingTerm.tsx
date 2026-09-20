"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


type TrainingTermName =
  | "RPE"
  | "FTP"
  | "CSS"
  | "Threshold pace";


type TrainingTermProps = {
  term: TrainingTermName;
  children: React.ReactNode;
};


const TRAINING_TERM_INFO: Record<
  TrainingTermName,
  {
    title: string;
    description: string;
    footer?: string;
  }
> = {
  RPE: {
    title:
      "RPE · Rate of Perceived Exertion",

    description:
      "How hard the effort feels on a 1–10 scale, based on your whole body rather than one metric.",

    footer:
      "1–3 Easy · 4–5 Moderate · 6–7 Hard · 8–9 Very hard · 10 Max",
  },

  FTP: {
    title:
      "FTP · Functional Threshold Power",

    description:
      "A practical cycling benchmark representing the highest power you can sustain for a prolonged hard effort. Basse can use it to personalise bike power targets.",

    footer:
      "Power targets are guidance. RPE and execution quality still matter.",
  },

  CSS: {
    title:
      "CSS · Critical Swim Speed",

    description:
      "A practical estimate of your sustainable threshold swimming pace, usually expressed as time per 100 m.",

    footer:
      "Basse can use CSS to scale aerobic, tempo and threshold swim targets.",
  },

  "Threshold pace": {
    title:
      "Threshold pace",

    description:
      "A running pace around the intensity you can sustain during a prolonged controlled hard effort. It helps Basse scale quality running sessions.",

    footer:
      "It is a reference, not a pace you should force regardless of terrain, fatigue or conditions.",
  },
};


function getRpeContext(
  children: React.ReactNode
) {
  const text =
    String(children ?? "");

  const matches =
    [
      ...text.matchAll(
        /\b([1-9]|10)\b/g
      ),
    ].map(
      (match) =>
        Number(match[1])
    );

  if (matches.length === 0) {
    return null;
  }

  const low =
    Math.min(...matches);

  const high =
    Math.max(...matches);


  if (high <= 3) {
    return "Easy — relaxed and sustainable with plenty left in reserve.";
  }

  if (high <= 5) {
    return "Moderate — controlled work that should still feel sustainable.";
  }

  if (low <= 7) {
    return "Hard — clearly demanding, but still controlled and repeatable.";
  }

  if (high <= 9) {
    return "Very hard — strong focused effort with limited reserve.";
  }

  return "Maximal — an all-out effort that should only be used deliberately.";
}


export default function TrainingTerm({
  term,
  children,
}: TrainingTermProps) {

  const [open, setOpen] =
    useState(false);

  const rootRef =
    useRef<HTMLSpanElement | null>(
      null
    );


  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent
    ) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [open]);


  const info =
    TRAINING_TERM_INFO[
      term
    ];


  const context =
    term === "RPE"
      ? getRpeContext(
          children
        )
      : null;


  return (
    <span
      ref={rootRef}
      className="trainingTerm"
    >
      <button
        type="button"
        className="trainingTermTrigger"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(
            (current) =>
              !current
          );
        }}
      >
        {children}
        <span
          className="trainingTermHint"
          aria-hidden="true"
        >
          i
        </span>
      </button>


      {open && (
        <span
          className="trainingTermPopover"
          role="tooltip"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <strong>
            {info.title}
          </strong>

          <span>
            {info.description}
          </span>

          {context && (
            <span className="trainingTermCurrent">
              {context}
            </span>
          )}

          {info.footer && (
            <span className="trainingTermScale">
              {info.footer}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
