"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  TargetRace,
} from "@/types/training";

import QuickRaceEditModal from "@/components/QuickRaceEditModal";

import {
  catalogRaceToTargetRace,
  type RaceCatalogEntry,
} from "@/lib/race-catalog";

import {
  buildRaceSpecificityProfile,
} from "@/lib/race-specificity";


type AlpineSelectOption = {
  value: string;
  label: string;
};


function AlpineSelect({
  value,
  options,
  onChange,
  compact = false,
}: {
  value: string;
  options: AlpineSelectOption[];
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] =
    useState(false);

  const rootRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleOutsideClick(
      event: MouseEvent
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
      "mousedown",
      handleOutsideClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
  }, [open]);

  const selectedLabel =
    options.find(
      (option) =>
        option.value === value
    )?.label ??
    options[0]?.label ??
    "Select";

  return (
    <div
      ref={rootRef}
      className={[
        "raceAlpineSelect",
        compact
          ? "compact"
          : "",
        open
          ? "open"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="raceAlpineSelectTrigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
      >
        <span>
          {selectedLabel}
        </span>

        <i aria-hidden="true" />
      </button>

      {open && (
        <div
          className="raceAlpineSelectMenu"
          role="listbox"
        >
          {options.map(
            (option) => {
              const selected =
                option.value ===
                value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={
                    selected
                  }
                  className={[
                    "raceAlpineSelectOption",
                    selected
                      ? "selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    onChange(
                      option.value
                    );

                    setOpen(false);
                  }}
                >
                  <span>
                    {option.label}
                  </span>

                  {selected && (
                    <b
                      aria-hidden="true"
                    >
                      ✓
                    </b>
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}


type RaceDiscoveryResponse = {
  ok: boolean;

  races:
    RaceCatalogEntry[];

  total:
    number;

  filters: {
    series:
      string[];

    countries: {
      code: string;
      name: string;
    }[];

    formats:
      string[];
  };
};


type RacePickerModalProps = {
  open: boolean;

  currentRace?:
    TargetRace;

  unitSystem?:
    | "Metric"
    | "Imperial";

  onClose: () => void;

  onSelect: (
    race: TargetRace
  ) => void;

  onManual: () => void;

  onEditCurrent?: () => void;
};


function daysUntil(
  date: string
) {
  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const target =
    new Date(
      `${date}T12:00:00`
    );

  const difference =
    target.getTime() -
    today.getTime();

  return Math.max(
    0,
    Math.ceil(
      difference /
      86_400_000
    )
  );
}


function formatRaceDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}


function formatDistance(
  km: number,
  unitSystem:
    | "Metric"
    | "Imperial"
) {
  if (unitSystem === "Imperial") {
    const miles =
      km * 0.6213711922;

    return `${
      Number(
        (
          miles >= 10
            ? miles.toFixed(1)
            : miles.toFixed(2)
        )
      )
    } mi`;
  }

  return `${Number(
    km.toFixed(2)
  )} km`;
}


function formatElevation(
  metres: number,
  unitSystem:
    | "Metric"
    | "Imperial"
) {
  if (unitSystem === "Imperial") {
    const feet =
      Math.round(
        metres * 3.280839895
      );

    return `${feet} ft`;
  }

  return `${Math.round(
    metres
  )} m`;
}


export default function RacePickerModal({
  open,
  currentRace,
  unitSystem = "Metric",
  onClose,
  onSelect,
  onManual,
  onEditCurrent,
}: RacePickerModalProps) {

  const [query, setQuery] =
    useState("");

  const [
    results,
    setResults,
  ] = useState<
    RaceCatalogEntry[]
  >([]);

  const [
    availableCountries,
    setAvailableCountries,
  ] = useState<
    {
      code: string;
      name: string;
    }[]
  >([]);

  const [
    countryFilter,
    setCountryFilter,
  ] = useState("");

  const [
    raceSort,
    setRaceSort,
  ] = useState<
    | "Soonest"
    | "Name"
  >("Soonest");


  const [
    racesLoading,
    setRacesLoading,
  ] = useState(false);

  const [
    raceSearchError,
    setRaceSearchError,
  ] = useState("");

  const [
    raceFilter,
    setRaceFilter,
  ] = useState<
    | "All"
    | "Sprint"
    | "Olympic"
    | "Middle"
    | "Full"
  >("All");

  const [
    selected,
    setSelected,
  ] = useState<
    RaceCatalogEntry | null
  >(null);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    showCurrentRace,
    setShowCurrentRace,
  ] = useState(true);

  const [
    quickEditOpen,
    setQuickEditOpen,
  ] = useState(false);


  function handleClose() {
    /*
      Reset transient picker state when the main
      Race Picker closes.

      showCurrentRace can safely reset to true because
      that view still requires currentRace to exist.
    */
    setShowCurrentRace(true);
    setSelected(null);
    setSelectedDate("");
    setQuickEditOpen(false);

    onClose();
  }


  useEffect(() => {
    if (!open) {
      return;
    }

    const controller =
      new AbortController();

    const timeout =
      window.setTimeout(
        async () => {
          setRacesLoading(true);
          setRaceSearchError("");

          try {
            const params =
              new URLSearchParams();

            if (query.trim()) {
              params.set(
                "q",
                query.trim()
              );
            }


            if (
              raceFilter === "Sprint"
            ) {
              params.set(
                "format",
                "Sprint"
              );
            } else if (
              raceFilter === "Olympic"
            ) {
              params.set(
                "format",
                "Olympic"
              );
            } else if (
              raceFilter === "Middle"
            ) {
              params.set(
                "format",
                "70.3"
              );
            } else if (
              raceFilter === "Full"
            ) {
              params.set(
                "format",
                "Ironman"
              );
            }


            if (countryFilter) {
              params.set(
                "country",
                countryFilter
              );
            }


            const response =
              await fetch(
                `/api/races?${params.toString()}`,
                {
                  signal:
                    controller.signal,
                }
              );


            if (!response.ok) {
              throw new Error(
                "Race search failed."
              );
            }


            const data: RaceDiscoveryResponse =
              await response.json();


            setResults(
              data.races ?? []
            );

            setAvailableCountries(
              data.filters
                ?.countries ?? []
            );

          } catch (error) {
            if (
              error instanceof
                DOMException &&
              error.name ===
                "AbortError"
            ) {
              return;
            }

            console.error(
              "Could not search races:",
              error
            );

            setRaceSearchError(
              "Race search is temporarily unavailable."
            );

          } finally {
            setRacesLoading(false);
          }
        },
        250
      );


    return () => {
      window.clearTimeout(
        timeout
      );

      controller.abort();
    };
  }, [
    open,
    query,
    raceFilter,
    countryFilter,
  ]);


  const sortedResults =
    [...results].sort(
      (a, b) => {
        if (
          raceSort === "Name"
        ) {
          return a.name.localeCompare(
            b.name
          );
        }

        const aDate =
          a.editions[0]?.date ??
          "9999-12-31";

        const bDate =
          b.editions[0]?.date ??
          "9999-12-31";

        return aDate.localeCompare(
          bDate
        );
      }
    );


  const filtersActive =
    Boolean(
      query.trim() ||
      countryFilter ||
      raceFilter !== "All"
    );


  if (!open) {
    return null;
  }


  function chooseRace(
    race: RaceCatalogEntry
  ) {
    setSelected(race);

    setSelectedDate(
      race.editions[0]
        ?.date ?? ""
    );
  }


  function confirmRace() {
    if (
      !selected ||
      !selectedDate
    ) {
      return;
    }

    onSelect(
      catalogRaceToTargetRace(
        selected,
        selectedDate
      )
    );
  }


  if (
    showCurrentRace &&
    currentRace
  ) {

    const currentDays =
      daysUntil(
        currentRace.date
      );


    const currentRaceSpecificity =
      buildRaceSpecificityProfile(
        currentRace
      );

    const currentRaceDemands =
      currentRaceSpecificity
        .priorities
        .slice(0, 5);

    const currentEmoji =
      currentRace.source === "database"
        ? (
            currentRace.id.startsWith(
              "norseman-"
            )
              ? "🇳🇴"
              : "🏁"
          )
        : "🏁";

    return (
      <div
        className="alpineModalOverlay alpineRacePickerOverlay"
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 150,
          background:
            "rgba(20, 22, 18, .48)",
          display: "grid",
          placeItems: "center",
          padding: "20px",
        }}
      >
        <section
          className="alpineLegacyModal alpineRacePickerModal"
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
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "34px",
                  marginBottom: "8px",
                }}
              >
                {currentEmoji}
              </div>

              <div className="eyebrow">
                YOUR BIG GOAL
              </div>

              <h2
                style={{
                  margin:
                    ".4rem 0 .3rem",
                }}
              >
                {currentRace.name}
              </h2>

              {currentRace.location && (
                <p
                  style={{
                    margin: 0,
                    color: "#87998e",
                  }}
                >
                  {currentRace.location}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleClose}
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
            className="raceCountdownCard"
            style={{
              marginTop: "24px",
              padding:
                "22px 18px",
              borderRadius:
                "17px",
              background: "rgba(255,255,255,.015)",
              border:
                "1px solid rgba(255,255,255,.055)",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize: "2.8rem",
                lineHeight: 1,
                fontWeight: 900,
              }}
            >
              {currentDays === 0
                ? "TODAY"
                : currentDays}
            </div>

            <div
              className="eyebrow"
              style={{
                marginTop: "7px",
              }}
            >
              {currentDays === 0
                ? "RACE DAY"
                : currentDays === 1
                ? "DAY TO GO"
                : "DAYS TO GO"}
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#87998e",
                fontSize: "13px",
              }}
            >
              {formatRaceDate(
                currentRace.date
              )}
            </div>
          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "8px",
              marginTop: "12px",
            }}
          >
            {[
              {
                label: "SWIM",
                value:
                  currentRace.swim
                    ?.distanceKm
                    ? formatDistance(
                        currentRace.swim.distanceKm,
                        unitSystem
                      )
                    : "—",

                detail:
                  currentRace.swim
                    ?.environment ??
                  "",
              },

              {
                label: "BIKE",
                value:
                  currentRace.bike
                    ?.distanceKm
                    ? formatDistance(
                        currentRace.bike.distanceKm,
                        unitSystem
                      )
                    : "—",

                detail:
                  currentRace.bike
                    ?.elevationDisplay ??
                  (
                    currentRace.bike
                      ?.elevationGainM
                      ? formatElevation(
                          currentRace.bike.elevationGainM,
                          unitSystem
                        )
                      : currentRace.bike
                          ?.profile ??
                        ""
                  ),
              },

              {
                label: "RUN",
                value:
                  currentRace.run
                    ?.distanceKm
                    ? formatDistance(
                        currentRace.run.distanceKm,
                        unitSystem
                      )
                    : "—",

                detail:
                  currentRace.run
                    ?.elevationDisplay ??
                  (
                    currentRace.run
                      ?.elevationGainM
                      ? formatElevation(
                          currentRace.run.elevationGainM,
                          unitSystem
                        )
                      : currentRace.run
                          ?.profile ??
                        ""
                  ),
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding:
                    "15px 8px",
                  background: "rgba(255,255,255,.015)",
                  border:
                    "1px solid rgba(255,255,255,.055)",
                  borderRadius:
                    "14px",
                  textAlign: "center",
                }}
              >
                <div
                  className="eyebrow"
                  style={{
                    fontSize: "10px",
                  }}
                >
                  {item.label}
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  {item.value}
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: "3px",
                    color: "#87998e",
                    fontSize: "11px",
                  }}
                >
                  {item.detail}
                </span>
              </div>
            ))}
          </div>


          {currentRace.characteristics &&
            currentRace.characteristics
              .length > 0 && (
              <div
                style={{
                  marginTop: "18px",
                }}
              >
                <div
                  className="eyebrow"
                  style={{
                    marginBottom: "8px",
                  }}
                >
                  RACE CHARACTER
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {currentRace
                    .characteristics
                    .slice(0, 6)
                    .map(
                      (
                        characteristic
                      ) => (
                        <span
                          key={
                            characteristic
                          }
                          style={{
                            padding:
                              "6px 9px",
                            background:
                              "rgba(255,255,255,.018)",
                            color:
                              "#8ea097",
                            border:
                              "1px solid rgba(255,255,255,.055)",
                            borderRadius:
                              "999px",
                            fontSize:
                              "11px",
                            fontWeight: 700,
                          }}
                        >
                          {characteristic}
                        </span>
                      )
                    )}
                </div>
              </div>
            )}


          
          {currentRaceDemands.length > 0 && (
            <div
              style={{
                marginTop: "22px",
                paddingTop: "20px",
                borderTop:
                  "1px solid rgba(255,255,255,.055)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-end",
                  gap: "12px",
                  marginBottom:
                    "11px",
                }}
              >
                <div>
                  <div className="eyebrow">
                    RACE DEMANDS
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#87998e",
                      fontSize: "12px",
                      lineHeight: 1.4,
                    }}
                  >
                    What your target race
                    asks you to prepare for.
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    color: "#71847a",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  TOP{" "}
                  {currentRaceDemands.length}
                </div>
              </div>


              <div
                style={{
                  display: "grid",
                  gap: "8px",
                }}
              >
                {currentRaceDemands.map(
                  (demand) => {

                    const icon =
                      demand.discipline ===
                      "Swim"
                        ? "🌊"
                        : demand.discipline ===
                            "Bike"
                          ? "🚴"
                          : demand.discipline ===
                              "Run"
                            ? "🏃"
                            : "⚡";

                    return (
                      <div
                        key={demand.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "36px 1fr auto",
                          gap: "11px",
                          alignItems:
                            "start",
                          padding:
                            "13px 14px",
                          border:
                            "1px solid rgba(255,255,255,.055)",
                          borderRadius:
                            "14px",
                          background:
                            "#fff",
                        }}
                      >
                        <div
                          aria-hidden="true"
                          style={{
                            width: "36px",
                            height: "36px",
                            display: "grid",
                            placeItems:
                              "center",
                            borderRadius:
                              "11px",
                            background:
                              "rgba(255,255,255,.018)",
                            fontSize:
                              "18px",
                          }}
                        >
                          {icon}
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize:
                                "13px",
                              fontWeight:
                                850,
                              lineHeight:
                                1.25,
                            }}
                          >
                            {demand.title}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              color:
                                "#87998e",
                              fontSize:
                                "11.5px",
                              lineHeight:
                                1.45,
                            }}
                          >
                            {demand.reason}
                          </div>
                        </div>

                        <div
                          style={{
                            padding:
                              "4px 7px",
                            borderRadius:
                              "999px",
                            background:
                              demand.priority ===
                              "High"
                                ? "rgba(96,132,105,.12)"
                                : "rgba(255,255,255,.018)",
                            color:
                              "#8b9c92",
                            fontSize:
                              "9px",
                            fontWeight:
                              900,
                            letterSpacing:
                              ".04em",
                            textTransform:
                              "uppercase",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {demand.priority}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div
                style={{
                  marginTop: "9px",
                  color: "#71847a",
                  fontSize: "10.5px",
                  lineHeight: 1.45,
                }}
              >
                Basse uses these demands
                to shape your training
                progressively as race day
                approaches.
              </div>
            </div>
          )}

<button
            type="button"
            className="secondary full"
            onClick={() =>
              setShowCurrentRace(
                false
              )
            }
            style={{
              marginTop: "22px",
            }}
          >
            Change target race
          </button>

          <button
            type="button"
            onClick={() =>
              setQuickEditOpen(true)
            }
              style={{
                display: "block",
                width: "100%",
                marginTop: "8px",
                padding: "10px",
                border: 0,
                background:
                  "transparent",
                color: "#87998e",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Edit race details
            </button>
        </section>

        <QuickRaceEditModal
          open={quickEditOpen}
          race={currentRace}
          unitSystem={
            unitSystem
          }
          onClose={() =>
            setQuickEditOpen(false)
          }
          onSave={(updatedRace) => {
            setQuickEditOpen(false);
            onSelect(updatedRace);
          }}
          onAdvancedEdit={
            onEditCurrent
              ? () => {
                  setQuickEditOpen(false);
                  onEditCurrent();
                }
              : undefined
          }
        />
      </div>
    );
  }


  return (
    <div
      className="alpineModalOverlay alpineRacePickerOverlay"
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background:
          "rgba(20, 22, 18, .48)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <section
        className="alpineLegacyModal alpineRacePickerModal"
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

        {!selected ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: "20px",
              }}
            >
              <div>
                <div className="eyebrow">
                  YOUR BIG GOAL
                </div>

                <h2
                  style={{
                    margin:
                      ".4rem 0 .35rem",
                  }}
                >
                  Find your race
                </h2>

                <p
                  style={{
                    margin: 0,
                    color:
                      "#87998e",
                    lineHeight: 1.5,
                  }}
                >
                  Choose the actual
                  event you&apos;re training
                  for. Basse can use
                  its course demands to
                  make your preparation
                  more specific.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
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
                marginTop: "22px",
              }}
            >
              <label
                style={{
                  display: "grid",
                  gap: "7px",
                  fontWeight: 800,
                  fontSize: "13px",
                }}
              >
                Search races

                <input
                  className="field"
                  value={query}
                  placeholder="Search Norseman, Norway, Ironman..."
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                />
              </label>
            </div>


            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "7px",
                marginTop: "12px",
              }}
            >
              {[
                "All",
                "Sprint",
                "Olympic",
                "Middle",
                "Full",
              ].map((filter) => {

                const active =
                  raceFilter ===
                  filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    className={[
                      "raceFilterChip",
                      active ? "active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      setRaceFilter(
                        filter as
                          | "All"
                          | "Sprint"
                          | "Olympic"
                          | "Middle"
                          | "Full"
                      )
                    }
                    style={{
                      padding:
                        "7px 10px",

                      border:
                        active
                          ? "1px solid var(--ink)"
                          : "1px solid rgba(255,255,255,.055)",

                      borderRadius:
                        "999px",

                      background:
                        active
                          ? "var(--ink)"
                          : "#fff",

                      color:
                        active
                          ? "#fff"
                          : "var(--ink)",

                      fontSize:
                        "11px",

                      fontWeight:
                        800,

                      cursor:
                        "pointer",
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>


            {availableCountries.length > 1 && (
              <div
                style={{
                  marginTop: "12px",
                }}
              >
                <AlpineSelect
                  value={countryFilter}
                  options={[
                    {
                      value: "",
                      label:
                        "All countries",
                    },
                    ...availableCountries.map(
                      (country) => ({
                        value:
                          country.code,
                        label:
                          country.name,
                      })
                    ),
                  ]}
                  onChange={
                    setCountryFilter
                  }
                />
              </div>
            )}


            <div
              style={{
                marginTop: "22px",
              }}
            >
              <div
                className="eyebrow"
                style={{
                  marginBottom:
                    "10px",
                }}
              >
                {query
                  ? "MATCHING RACES"
                  : "FEATURED"}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "9px",
                }}
              >
    
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "12px",
                marginTop: "16px",
                paddingTop: "14px",
                borderTop:
                  "1px solid rgba(255,255,255,.055)",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 850,
                  }}
                >
                  {racesLoading
                    ? "Finding races…"
                    : `${sortedResults.length} ${
                        sortedResults.length === 1
                          ? "race"
                          : "races"
                      }`}
                </div>

                {!racesLoading &&
                  filtersActive && (
                    <button
                      type="button"
                      className="raceClearFilters"
                      onClick={() => {
                        setQuery("");
                        setCountryFilter("");
                        setRaceFilter(
                          "All"
                        );
                      }}
                      style={{
                        marginTop: "3px",
                        padding: 0,
                        border: 0,
                        background:
                          "transparent",
                        color:
                          "#87998e",
                        fontSize:
                          "11px",
                        fontWeight: 750,
                        cursor:
                          "pointer",
                      }}
                    >
                      Clear filters
                    </button>
                  )}
              </div>

              <div className="raceSortControl">
                <span>
                  Sort
                </span>

                <AlpineSelect
                  compact
                  value={raceSort}
                  options={[
                    {
                      value:
                        "Soonest",
                      label:
                        "Soonest",
                    },
                    {
                      value:
                        "Name",
                      label:
                        "Name",
                    },
                  ]}
                  onChange={(
                    value
                  ) =>
                    setRaceSort(
                      value as
                        | "Soonest"
                        | "Name"
                    )
                  }
                />
              </div>
            </div>

            {racesLoading && (
                  <div
                    style={{
                      padding: "18px",
                      textAlign: "center",
                      color: "#87998e",
                      fontSize: "13px",
                    }}
                  >
                    Searching races...
                  </div>
                )}

                {raceSearchError && (
                  <div
                    role="alert"
                    style={{
                      padding: "14px",
                      border:
                        "1px solid rgba(184,127,119,.15)",
                      borderRadius: "13px",
                      background: "rgba(111,67,60,.07)",
                      color: "#b2918b",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {raceSearchError}
                  </div>
                )}
                {sortedResults.map(
                  (race) => {

                    const edition =
                      race.editions[0];

                    const bikeDetail =
                      race.bike
                        ?.elevationGainM
                        ? formatElevation(
                            race.bike
                              .elevationGainM,
                            unitSystem
                          )
                        : race.bike
                            ?.profile ??
                          "";

                    const runDetail =
                      race.run
                        ?.elevationGainM
                        ? formatElevation(
                            race.run
                              .elevationGainM,
                            unitSystem
                          )
                        : race.run
                            ?.profile ??
                          "";

                    return (
                      <button
                        key={race.id}
                        type="button"
                        className="raceResultCard"
                        onClick={() =>
                          chooseRace(
                            race
                          )
                        }
                        style={{
                          width: "100%",
                          display:
                            "block",
                          padding:
                            "15px",
                          border:
                            "1px solid rgba(255,255,255,.055)",
                          borderRadius:
                            "16px",
                          background:
                            "#fff",
                          color:
                            "var(--ink)",
                          textAlign:
                            "left",
                          cursor:
                            "pointer",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "38px 1fr auto",
                            gap: "11px",
                            alignItems:
                              "start",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "25px",
                              lineHeight: 1,
                            }}
                          >
                            {race.emoji}
                          </span>

                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                flexWrap:
                                  "wrap",
                                gap: "6px",
                              }}
                            >
                              <strong
                                style={{
                                  fontSize:
                                    "14px",
                                  lineHeight:
                                    1.25,
                                }}
                              >
                                {race.shortName}
                              </strong>

                              <span
                                style={{
                                  padding:
                                    "3px 6px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    "rgba(255,255,255,.018)",
                                  color:
                                    "#7a8d82",
                                  fontSize:
                                    "9px",
                                  fontWeight:
                                    850,
                                  letterSpacing:
                                    ".03em",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {race.format}
                              </span>
                            </div>

                            <div
                              style={{
                                marginTop:
                                  "4px",
                                color:
                                  "#87998e",
                                fontSize:
                                  "12px",
                                lineHeight:
                                  1.35,
                              }}
                            >
                              {race.location}
                            </div>
                          </div>

                          <div
                            style={{
                              textAlign:
                                "right",
                              paddingLeft:
                                "8px",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            <div
                              className="raceResultDate"
                              style={{
                                fontSize:
                                  "11px",
                                fontWeight:
                                  850,
                                color:
                                  edition
                                    ? "#b7c4bc"
                                    : "#71847a",
                              }}
                            >
                              {edition
                                ? formatRaceDate(
                                    edition.date
                                  )
                                : "DATE TBA"}
                            </div>

                            {edition && (
                              <div
                                style={{
                                  marginTop:
                                    "3px",
                                  color:
                                    "#71847a",
                                  fontSize:
                                    "9.5px",
                                  fontWeight:
                                    750,
                                }}
                              >
                                {daysUntil(
                                  edition.date
                                )}{" "}
                                days
                              </div>
                            )}
                          </div>
                        </div>


                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(3, 1fr)",
                            gap: "6px",
                            marginTop:
                              "12px",
                          }}
                        >
                          {[
                            {
                              label:
                                "SWIM",

                              value:
                                race.swim
                                  ?.distanceKm
                                  ? formatDistance(
                                      race.swim
                                        .distanceKm,
                                      unitSystem
                                    )
                                  : "—",

                              detail:
                                race.swim
                                  ?.environment ??
                                "",
                            },

                            {
                              label:
                                "BIKE",

                              value:
                                race.bike
                                  ?.distanceKm
                                  ? formatDistance(
                                      race.bike
                                        .distanceKm,
                                      unitSystem
                                    )
                                  : "—",

                              detail:
                                bikeDetail,
                            },

                            {
                              label:
                                "RUN",

                              value:
                                race.run
                                  ?.distanceKm
                                  ? formatDistance(
                                      race.run
                                        .distanceKm,
                                      unitSystem
                                    )
                                  : "—",

                              detail:
                                runDetail,
                            },
                          ].map(
                            (item) => (
                              <div
                                key={
                                  item.label
                                }
                                style={{
                                  minWidth:
                                    0,
                                  padding:
                                    "8px 7px",
                                  borderRadius:
                                    "10px",
                                  background:
                                    "rgba(255,255,255,.014)",
                                }}
                              >
                                <div
                                  style={{
                                    color:
                                      "#71847a",
                                    fontSize:
                                      "8px",
                                    fontWeight:
                                      900,
                                    letterSpacing:
                                      ".05em",
                                  }}
                                >
                                  {item.label}
                                </div>

                                <div
                                  style={{
                                    marginTop:
                                      "2px",
                                    fontSize:
                                      "11px",
                                    fontWeight:
                                      850,
                                    whiteSpace:
                                      "nowrap",
                                    overflow:
                                      "hidden",
                                    textOverflow:
                                      "ellipsis",
                                  }}
                                >
                                  {item.value}
                                </div>

                                {item.detail && (
                                  <div
                                    style={{
                                      marginTop:
                                        "2px",
                                      color:
                                        "#7a8d82",
                                      fontSize:
                                        "9px",
                                      whiteSpace:
                                        "nowrap",
                                      overflow:
                                        "hidden",
                                      textOverflow:
                                        "ellipsis",
                                    }}
                                  >
                                    {item.detail}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>


                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                            marginTop:
                              "10px",
                          }}
                        >
                          <div
                            style={{
                              color:
                                race.dataQuality ===
                                "Verified"
                                  ? "#596452"
                                  : "#71847a",
                              fontSize:
                                "9px",
                              fontWeight:
                                850,
                              letterSpacing:
                                ".03em",
                            }}
                          >
                            {race.dataQuality ===
                            "Verified"
                              ? "✓ VERIFIED COURSE"
                              : "PARTIAL COURSE DATA"}
                          </div>

                          <span
                            style={{
                              color:
                                "#71847a",
                              fontSize:
                                "18px",
                              lineHeight: 1,
                            }}
                          >
                            →
                          </span>
                        </div>
                      </button>
                    );
                  }
                )}

                {!racesLoading &&
                  !raceSearchError &&
                  results.length === 0 && (
                  <div
                    style={{
                      padding:
                        "20px",
                      textAlign:
                        "center",
                      border:
                        "1px dashed rgba(255,255,255,.05)",
                      borderRadius:
                        "15px",
                      color:
                        "#87998e",
                    }}
                  >
                    No races match this
                    search and filter yet.
                  </div>
                )}
              </div>
            </div>


            <div
              style={{
                marginTop: "22px",
                paddingTop: "18px",
                borderTop:
                  "1px solid rgba(255,255,255,.055)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Can&apos;t find your race?
              </strong>

              <p
                style={{
                  margin:
                    "4px 0 12px",
                  color:
                    "#87998e",
                  fontSize: "13px",
                  lineHeight: 1.45,
                }}
              >
                Add the event manually
                and enter the course
                information you know.
              </p>

              <button
                type="button"
                className="secondary full"
                onClick={onManual}
              >
                Add race manually
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "34px",
                    marginBottom:
                      "8px",
                  }}
                >
                  {selected.emoji}
                </div>

                <div className="eyebrow">
                  YOUR BIG GOAL
                </div>

                <h2
                  style={{
                    margin:
                      ".4rem 0 .3rem",
                  }}
                >
                  {selected.name}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color:
                      "#87998e",
                  }}
                >
                  {selected.location}
                </p>

                <div
                  className={[
                    "raceDataQualityBadge",
                    selected.dataQuality ===
                    "Verified"
                      ? "verified"
                      : "partial",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "9px",
                    padding: "5px 8px",
                    border:
                      "1px solid rgba(255,255,255,.055)",
                    borderRadius: "999px",
                    background:
                      "rgba(255,255,255,.012)",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: ".03em",
                  }}
                >
                  {selected.dataQuality ===
                  "Verified"
                    ? "✓ VERIFIED RACE DATA"
                    : "PARTIAL RACE DATA"}
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
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


            {selected.editions.length === 0 && (
              <label
                style={{
                  display: "grid",
                  gap: "6px",
                  marginTop: "20px",
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                Your race date

                <input
                  type="date"
                  className="field"
                  value={selectedDate}
                  onChange={(event) =>
                    setSelectedDate(
                      event.target.value
                    )
                  }
                />

                <span
                  style={{
                    fontSize: "11px",
                    lineHeight: 1.4,
                    color: "#71847a",
                    fontWeight: 500,
                  }}
                >
                  The course is known, but a future
                  race date is not currently stored
                  in the Basse catalog.
                </span>
              </label>
            )}


            {selected.editions.length > 1 && (
              <label
                style={{
                  display: "grid",
                  gap: "6px",
                  marginTop: "20px",
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                Race edition

                <AlpineSelect
                  value={selectedDate}
                  options={
                    selected.editions.map(
                      (edition) => ({
                        value:
                          edition.date,
                        label:
                          formatRaceDate(
                            edition.date
                          ),
                      })
                    )
                  }
                  onChange={
                    setSelectedDate
                  }
                />
              </label>
            )}


            {selectedDate && (
              <div
                className="raceCountdownCard"
                style={{
                  marginTop: "24px",
                  padding:
                    "22px 18px",
                  borderRadius:
                    "17px",
                  background: "rgba(255,255,255,.015)",
                  border:
                    "1px solid rgba(255,255,255,.055)",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "2.8rem",
                    lineHeight: 1,
                    fontWeight: 900,
                  }}
                >
                  {daysUntil(
                    selectedDate
                  )}
                </div>

                <div
                  className="eyebrow"
                  style={{
                    marginTop:
                      "7px",
                  }}
                >
                  DAYS TO GO
                </div>

                <div
                  style={{
                    marginTop:
                      "8px",
                    color:
                      "#87998e",
                    fontSize:
                      "13px",
                  }}
                >
                  {formatRaceDate(
                    selectedDate
                  )}
                </div>
              </div>
            )}


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              {[
                {
                  label: "SWIM",
                  value:
                    selected.swim
                      ?.distanceKm
                      ? formatDistance(
                          selected.swim.distanceKm,
                          unitSystem
                        )
                      : "—",
                  detail:
                    selected.swim
                      ?.environment ??
                    "",
                },

                {
                  label: "BIKE",
                  value:
                    selected.bike
                      ?.distanceKm
                      ? formatDistance(
                          selected.bike.distanceKm,
                          unitSystem
                        )
                      : "—",
                  detail:
                    selected.bike
                      ?.elevationDisplay ??
                    (
                      selected.bike
                        ?.elevationGainM
                        ? formatElevation(
                            selected.bike.elevationGainM,
                            unitSystem
                          )
                        : selected.bike
                            ?.profile ??
                          ""
                    ),
                },

                {
                  label: "RUN",
                  value:
                    selected.run
                      ?.distanceKm
                      ? formatDistance(
                          selected.run.distanceKm,
                          unitSystem
                        )
                      : "—",
                  detail:
                    selected.run
                      ?.elevationDisplay ??
                    (
                      selected.run
                        ?.elevationGainM
                        ? formatElevation(
                            selected.run.elevationGainM,
                            unitSystem
                          )
                        : selected.run
                            ?.profile ??
                          ""
                    ),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding:
                      "15px 8px",
                    background:
                      "#fff",
                    border:
                      "1px solid rgba(255,255,255,.055)",
                    borderRadius:
                      "14px",
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    className="eyebrow"
                    style={{
                      fontSize:
                        "10px",
                    }}
                  >
                    {item.label}
                  </div>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    {item.value}
                  </strong>

                  <span
                    style={{
                      display:
                        "block",
                      marginTop:
                        "3px",
                      color:
                        "#87998e",
                      fontSize:
                        "11px",
                    }}
                  >
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>


            {selected.characteristics.length > 0 && (
              <div
                style={{
                  marginTop:
                    "18px",
                }}
              >
                <div
                  className="eyebrow"
                  style={{
                    marginBottom:
                      "8px",
                  }}
                >
                  RACE CHARACTER
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {selected.characteristics
                    .slice(0, 5)
                    .map(
                      (
                        characteristic
                      ) => (
                        <span
                          key={
                            characteristic
                          }
                          style={{
                            padding:
                              "6px 9px",
                            background:
                              "rgba(255,255,255,.018)",
                            color:
                              "#8ea097",
                            border:
                              "1px solid rgba(255,255,255,.055)",
                            borderRadius:
                              "999px",
                            fontSize:
                              "11px",
                            fontWeight:
                              700,
                          }}
                        >
                          {characteristic}
                        </span>
                      )
                    )}
                </div>
              </div>
            )}


            {selected.dataWarning && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "11px 13px",
                  border:
                    "1px solid rgba(255,255,255,.055)",
                  borderRadius: "12px",
                  background:
                    "rgba(255,255,255,.018)",
                  color: "#87998e",
                  fontSize: "11px",
                  lineHeight: 1.45,
                }}
              >
                <strong
                  style={{
                    color: "#b7c6bd",
                  }}
                >
                  Data note:{" "}
                </strong>

                {selected.dataWarning}
              </div>
            )}


            <button
              type="button"
              className="primary full"
              onClick={confirmRace}
              disabled={!selectedDate}
              style={{
                marginTop: "22px",
              }}
            >
              Make this my goal
            </button>

            <button
              type="button"
              onClick={() =>
                setSelected(null)
              }
              style={{
                display: "block",
                width: "100%",
                marginTop: "10px",
                padding: "10px",
                border: 0,
                background:
                  "transparent",
                color:
                  "#87998e",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ← Choose another race
            </button>
          </>
        )}
      </section>
    </div>
  );
}
