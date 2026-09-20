"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  PerformanceBenchmarks,
} from "@/types/training";

import TrainingTerm from "@/components/TrainingTerm";


type BenchmarkModalProps = {
  open: boolean;

  benchmarks?:
    PerformanceBenchmarks;

  onClose: () => void;

  onSave: (
    benchmarks: PerformanceBenchmarks
  ) => void;
};


function secondsToTime(
  totalSeconds:
    number | null | undefined
) {
  if (
    !totalSeconds ||
    totalSeconds <= 0
  ) {
    return "";
  }

  const rounded =
    Math.round(
      totalSeconds
    );

  const hours =
    Math.floor(
      rounded / 3600
    );

  const remaining =
    rounded % 3600;

  const minutes =
    Math.floor(
      remaining / 60
    );

  const seconds =
    remaining % 60;


  /*
    Under one hour:
    22:15
    45:30

    One hour or longer:
    1:03:15
    1:25:00
  */

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function formatTimeInput(
  value: string
) {
  /*
    Smart duration input:

    340   -> 3:40
    2200  -> 22:00
    5920  -> 59:20
    10315 -> 1:03:15

    The user only types numbers.
  */

  const digits =
    value.replace(
      /\D/g,
      ""
    );

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return digits;
  }

  /*
    Up to four digits:
    interpret as MM:SS.
  */
  if (digits.length <= 4) {
    const seconds =
      digits.slice(-2);

    const minutes =
      digits.slice(0, -2);

    return `${Number(minutes)}:${seconds}`;
  }

  /*
    Five or more digits:
    interpret as H:MM:SS.
  */
  const seconds =
    digits.slice(-2);

  const minutes =
    digits.slice(-4, -2);

  const hours =
    digits.slice(0, -4);

  return `${Number(hours)}:${minutes}:${seconds}`;
}

function timeToSeconds(
  value: string
): number | null {

  const clean =
    value.trim();

  if (!clean) {
    return null;
  }

  const parts =
    clean
      .split(":")
      .map(Number);

  if (
    parts.some(
      (part) =>
        !Number.isFinite(part) ||
        part < 0
    )
  ) {
    return null;
  }


  if (parts.length === 2) {
    const [
      minutes,
      seconds,
    ] = parts;

    if (seconds >= 60) {
      return null;
    }

    const total =
      minutes * 60 +
      seconds;

    return total > 0
      ? total
      : null;
  }


  if (parts.length === 3) {
    const [
      hours,
      minutes,
      seconds,
    ] = parts;

    if (
      minutes >= 60 ||
      seconds >= 60
    ) {
      return null;
    }

    const total =
      hours * 3600 +
      minutes * 60 +
      seconds;

    return total > 0
      ? total
      : null;
  }


  return null;
}

function isValidTimeInput(
  value: string
) {
  const clean =
    value.trim();

  if (!clean) {
    return true;
  }

  const parts =
    clean
      .split(":")
      .map(Number);

  if (
    parts.length !== 2 &&
    parts.length !== 3
  ) {
    return false;
  }

  if (
    parts.some(
      (part) =>
        !Number.isInteger(part) ||
        part < 0
    )
  ) {
    return false;
  }


  if (parts.length === 2) {
    const [
      minutes,
      seconds,
    ] = parts;

    return (
      seconds <= 59 &&
      minutes * 60 +
        seconds >
        0
    );
  }


  const [
    hours,
    minutes,
    seconds,
  ] = parts;

  return (
    minutes <= 59 &&
    seconds <= 59 &&
    hours * 3600 +
      minutes * 60 +
      seconds >
      0
  );
}

function isPlausibleWatt(
  value: string
) {
  if (!value.trim()) {
    return true;
  }

  const watts =
    Number(value);

  return (
    Number.isFinite(watts) &&
    watts >= 30 &&
    watts <= 1000
  );
}


function positiveNumber(
  value: string
): number | null {

  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return null;
  }

  return number;
}


function calculateCss(
  time200:
    number | null,

  time400:
    number | null
) {

  if (
    time200 === null ||
    time400 === null ||
    time400 <= time200
  ) {
    return null;
  }

  const delta =
    time400 - time200;

  const css =
    delta / 2;

  if (
    css < 45 ||
    css > 240
  ) {
    return null;
  }

  return Math.round(css);
}


type BenchmarkModalContentProps = {
  benchmarks?:
    PerformanceBenchmarks;

  onClose: () => void;

  onSave:
    BenchmarkModalProps["onSave"];
};


function BenchmarkModalContent({
  benchmarks,
  onClose,
  onSave,
}: BenchmarkModalContentProps) {

  const [
    swim200,
    setSwim200,
  ] = useState(
    secondsToTime(
      benchmarks?.swim
        ?.time200Seconds
    )
  );

  const [
    swim400,
    setSwim400,
  ] = useState(
    secondsToTime(
      benchmarks?.swim
        ?.time400Seconds
    )
  );

  const [
    ftp,
    setFtp,
  ] = useState(
    benchmarks?.bike
      ?.ftpWatts
      ?.toString() ?? ""
  );

  const [
    twentyMinutePower,
    setTwentyMinutePower,
  ] = useState(
    benchmarks?.bike
      ?.twentyMinutePowerWatts
      ?.toString() ?? ""
  );

  const [
    fiveK,
    setFiveK,
  ] = useState(
    secondsToTime(
      benchmarks?.run
        ?.fiveKSeconds
    )
  );

  const [
    tenK,
    setTenK,
  ] = useState(
    secondsToTime(
      benchmarks?.run
        ?.tenKSeconds
    )
  );

  const [
    thresholdPace,
    setThresholdPace,
  ] = useState(
    secondsToTime(
      benchmarks?.run
        ?.thresholdSecondsPerKm
    )
  );

  const [
    validationError,
    setValidationError,
  ] = useState("");


  const calculatedCss =
    useMemo(
      () =>
        calculateCss(
          timeToSeconds(swim200),
          timeToSeconds(swim400)
        ),
      [
        swim200,
        swim400,
      ]
    );


  if (!open) {
    return null;
  }


  function save() {

    setValidationError("");

    const timeFields = [
      ["200 m swim", swim200],
      ["400 m swim", swim400],
      ["5K", fiveK],
      ["10K", tenK],
      ["Threshold pace", thresholdPace],
    ] as const;

    for (const [label, value] of timeFields) {
      if (!isValidTimeInput(value)) {
        setValidationError(
          `${label}: use a valid time such as 45:30 or 1:03:15. Minutes and seconds must be valid.`
        );
        return;
      }
    }

    if (!isPlausibleWatt(ftp)) {
      setValidationError(
        "FTP must be between 30 and 1000 W."
      );
      return;
    }

    if (!isPlausibleWatt(twentyMinutePower)) {
      setValidationError(
        "20-minute power must be between 30 and 1000 W."
      );
      return;
    }

    const swim200Seconds =
      timeToSeconds(swim200);

    const swim400Seconds =
      timeToSeconds(swim400);

    const ftpWatts =
      positiveNumber(ftp);

    const twentyMinutePowerWatts =
      positiveNumber(
        twentyMinutePower
      );

    const fiveKSeconds =
      timeToSeconds(fiveK);

    const tenKSeconds =
      timeToSeconds(tenK);

    const thresholdSecondsPerKm =
      timeToSeconds(
        thresholdPace
      );


    if (
      swim200Seconds !== null &&
      swim400Seconds !== null &&
      swim400Seconds <=
        swim200Seconds
    ) {
      setValidationError(
        "400 m swim time must be slower than the 200 m swim time."
      );
      return;
    }


    if (
      fiveKSeconds !== null &&
      tenKSeconds !== null &&
      tenKSeconds <=
        fiveKSeconds
    ) {
      setValidationError(
        "10K time must be slower than the 5K time."
      );
      return;
    }


    const now =
      new Date().toISOString();

    const previousSwim =
      benchmarks?.swim;

    const previousBike =
      benchmarks?.bike;

    const previousRun =
      benchmarks?.run;


    const swimChanged =
      swim200Seconds !==
        (previousSwim?.time200Seconds ?? null) ||
      swim400Seconds !==
        (previousSwim?.time400Seconds ?? null);


    const bikeChanged =
      ftpWatts !==
        (previousBike?.ftpWatts ?? null) ||
      twentyMinutePowerWatts !==
        (
          previousBike?.twentyMinutePowerWatts ??
          null
        );


    const runChanged =
      fiveKSeconds !==
        (previousRun?.fiveKSeconds ?? null) ||
      tenKSeconds !==
        (previousRun?.tenKSeconds ?? null) ||
      thresholdSecondsPerKm !==
        (
          previousRun?.thresholdSecondsPerKm ??
          null
        );


    onSave({
      /*
        Keep the old top-level timestamp for
        backward compatibility.

        New awareness logic uses discipline dates.
      */
      updatedAt: now,

      swim: {
        updatedAt:
          swimChanged
            ? now
            : previousSwim?.updatedAt ??
              benchmarks?.updatedAt,
        time200Seconds:
          swim200Seconds,

        time400Seconds:
          swim400Seconds,

        source:
          swim200Seconds &&
          swim400Seconds
            ? "200-400 test"
            : null,
      },

      bike: {
        updatedAt:
          bikeChanged
            ? now
            : previousBike?.updatedAt ??
              benchmarks?.updatedAt,

        ftpWatts,

        twentyMinutePowerWatts,

        source:
          ftpWatts
            ? "FTP test"
            : twentyMinutePowerWatts
            ? "20-minute test"
            : null,
      },

      run: {
        updatedAt:
          runChanged
            ? now
            : previousRun?.updatedAt ??
              benchmarks?.updatedAt,

        fiveKSeconds,
        tenKSeconds,

        thresholdSecondsPerKm,

        source:
          thresholdSecondsPerKm
            ? "External threshold test"
            : fiveKSeconds
            ? "5 km result"
            : tenKSeconds
            ? "10 km result"
            : null,
      },
    });
  }


  const sectionStyle = {
    padding: "18px",
    border:
      "1px solid rgba(255,255,255,.055)",
    borderRadius: "16px",
    background:
      "rgba(255,255,255,.014)",
  };


  const labelStyle = {
    display: "grid",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 800,
  };


  return (
    <div
      className="alpineModalOverlay alpineBenchmarkOverlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background:
          "rgba(20, 22, 18, .48)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <section
        className="alpineLegacyModal alpineBenchmarkModal"
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width: "100%",
          maxWidth: "620px",
          maxHeight:
            "calc(100vh - 40px)",
          overflowY: "auto",
          background: "rgba(29, 43, 36, .98)",
          borderRadius: "24px",
          padding: "28px",
          boxShadow:
            "0 30px 80px rgba(0,0,0,.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div>
            <div className="eyebrow">
              PERFORMANCE
            </div>

            <h2
              style={{
                marginTop: ".4rem",
                marginBottom: ".35rem",
              }}
            >
              Performance benchmarks
            </h2>

            <p
              style={{
                margin: 0,
                color: "#87998e",
                lineHeight: 1.5,
              }}
            >
              Optional data that helps
              Basse make your sessions
              more precise.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: 0,
              background:
                "transparent",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>


        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          <div
            className="benchmarkDisciplineSection"
            style={sectionStyle}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "12px",
              }}
            >
              SWIM
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
              }}
            >
              <label style={labelStyle}>
                200 m time · min:sec

                <input
                  className="field"
                  value={swim200}
                  placeholder="3:42"
                  inputMode="numeric"
                  onChange={(event) =>
                    setSwim200(
                      formatTimeInput(
                        event.target.value
                      )
                    )
                  }
                />
              </label>

              <label style={labelStyle}>
                400 m time · min:sec

                <input
                  className="field"
                  value={swim400}
                  placeholder="7:46"
                  inputMode="numeric"
                  onChange={(event) =>
                    setSwim400(
                      formatTimeInput(
                        event.target.value
                      )
                    )
                  }
                />
              </label>
            </div>

            <div
              className="benchmarkEstimate"
              style={{
                marginTop: "14px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,.018)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#7a8d82",
                  marginBottom: "3px",
                }}
              >
                <TrainingTerm term="CSS">
                  ESTIMATED CSS
                </TrainingTerm>
              </div>

              <strong>
                {calculatedCss
                  ? `${secondsToTime(
                      calculatedCss
                    )} /100 m`
                  : "Add both test times"}
              </strong>
            </div>

            <p
              style={{
                margin:
                  "12px 0 0",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#7a8d82",
              }}
            >
              Just type the numbers — for example
              340 becomes 3:40 automatically.
              Use recent maximal 200 m and
              400 m swim tests.
            </p>
          </div>


          <div
            className="benchmarkDisciplineSection"
            style={sectionStyle}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "12px",
              }}
            >
              BIKE
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
              }}
            >
              <label style={labelStyle}>
                <span
                  className="ftpTrainingTermWrap"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <TrainingTerm term="FTP">
                    FTP
                  </TrainingTerm>

                  <span>
                    · W
                  </span>
                </span>
                <input
                  className="field"
                  inputMode="numeric"
                  value={ftp}
                  placeholder="250"
                  onChange={(event) =>
                    setFtp(
                      event.target.value
                        .replace(
                          /[^0-9.]/g,
                          ""
                        )
                    )
                  }
                />
              </label>

              <label style={labelStyle}>
                20 min power · W

                <input
                  className="field"
                  inputMode="numeric"
                  value={
                    twentyMinutePower
                  }
                  placeholder="265"
                  onChange={(event) =>
                    setTwentyMinutePower(
                      event.target.value
                        .replace(
                          /[^0-9.]/g,
                          ""
                        )
                    )
                  }
                />
              </label>
            </div>

            <p
              style={{
                margin:
                  "12px 0 0",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#7a8d82",
              }}
            >
              Enter watts as a number only — for
              example 250. Add FTP if you already
              know it. A 20-minute result is kept
              separately rather than treated as
              exact FTP.
            </p>
          </div>


          <div
            className="benchmarkDisciplineSection"
            style={sectionStyle}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "12px",
              }}
            >
              RUN
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
              }}
            >
              <label style={labelStyle}>
                Recent 5K · min:sec

                <input
                  className="field"
                  value={fiveK}
                  placeholder="21:48"
                  inputMode="numeric"
                  onChange={(event) =>
                    setFiveK(
                      formatTimeInput(
                        event.target.value
                      )
                    )
                  }
                />
              </label>

              <label style={labelStyle}>
                Recent 10K · min:sec

                <input
                  className="field"
                  value={tenK}
                  placeholder="45:32"
                  inputMode="numeric"
                  onChange={(event) =>
                    setTenK(
                      formatTimeInput(
                        event.target.value
                      )
                    )
                  }
                />
              </label>

              <label
                className="thresholdPaceField"
                style={labelStyle}
              >
                <span>
                  <TrainingTerm term="Threshold pace">
                    Threshold pace
                  </TrainingTerm>
                  {" · min/km"}
                </span>

                <input
                  className="field"
                  value={
                    thresholdPace
                  }
                  placeholder="4:35"
                  inputMode="numeric"
                  onChange={(event) =>
                    setThresholdPace(
                      formatTimeInput(
                        event.target.value
                      )
                    )
                  }
                />
              </label>
            </div>

            <p
              style={{
                margin:
                  "12px 0 0",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#7a8d82",
              }}
            >
              Just type the numbers — 2200 becomes
              22:00 and 435 becomes 4:35.
              Threshold pace is optional and
              should only be added if you
              already know it.
            </p>
          </div>
        </div>


        {benchmarks?.updatedAt && (
          <p
            style={{
              margin:
                "16px 0 0",
              fontSize: "12px",
              color: "#71847a",
            }}
          >
            Last updated{" "}
            {new Date(
              benchmarks.updatedAt
            ).toLocaleDateString()}
          </p>
        )}


        {validationError && (
          <div
            className="benchmarkValidation"
            role="alert"
            style={{
              marginTop: "18px",
              padding: "12px 14px",
              border:
                "1px solid rgba(184,127,119,.15)",
              borderRadius: "12px",
              background: "rgba(111,67,60,.07)",
              color: "#b2918b",
              fontSize: "13px",
              lineHeight: 1.45,
              fontWeight: 700,
            }}
          >
            {validationError}
          </div>
        )}


        <div
          className="benchmarkActions"
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: "10px",
            marginTop: "22px",
          }}
        >
          <button
            className="secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary"
            onClick={save}
          >
            Save benchmarks
          </button>
        </div>
      </section>

      
    </div>
  );
}


export default function BenchmarkModal({
  open,
  benchmarks,
  onClose,
  onSave,
}: BenchmarkModalProps) {
  if (!open) {
    return null;
  }

  const benchmarkKey = [
    benchmarks?.updatedAt ?? "",
    benchmarks?.swim?.time200Seconds ?? "",
    benchmarks?.swim?.time400Seconds ?? "",
    benchmarks?.bike?.ftpWatts ?? "",
    benchmarks?.bike?.twentyMinutePowerWatts ?? "",
    benchmarks?.run?.fiveKSeconds ?? "",
    benchmarks?.run?.tenKSeconds ?? "",
    benchmarks?.run?.thresholdSecondsPerKm ?? "",
  ].join("|");

  return (
    <BenchmarkModalContent
      key={benchmarkKey}
      benchmarks={benchmarks}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
