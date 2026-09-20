"use client";

type ReadinessModalProps = {
  open: boolean;

  sleep: number;
  energy: number;
  soreness: number;
  stress: number;
  motivation: number;
  note: string;

  onSleepChange: (value: number) => void;
  onEnergyChange: (value: number) => void;
  onSorenessChange: (value: number) => void;
  onStressChange: (value: number) => void;
  onMotivationChange: (value: number) => void;
  onNoteChange: (value: string) => void;

  onSave: () => void;
  onClose: () => void;
};

export default function ReadinessModal({
  open,
  sleep,
  energy,
  soreness,
  stress,
  motivation,
  note,
  onSleepChange,
  onEnergyChange,
  onSorenessChange,
  onStressChange,
  onMotivationChange,
  onNoteChange,
  onSave,
  onClose,
}: ReadinessModalProps) {
  if (!open) return null;

  const sliders = [
    {
      label: "Sleep",
      value: sleep,
      setter: onSleepChange,
    },
    {
      label: "Energy",
      value: energy,
      setter: onEnergyChange,
    },
    {
      label: "Soreness",
      value: soreness,
      setter: onSorenessChange,
    },
    {
      label: "Stress",
      value: stress,
      setter: onStressChange,
    },
    {
      label: "Motivation",
      value: motivation,
      setter: onMotivationChange,
    },
  ];

  return (
    <div
      className="alpineModalOverlay alpineReadinessOverlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 22, 18, .52)",
        zIndex: 95,
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <section
        className="alpineLegacyModal alpineReadinessModal"
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          width: "100%",
          maxWidth: "620px",
          background: "rgba(29, 43, 36, .98)",
          borderRadius: "24px",
          padding: "28px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
          }}
        >
          <div>
            <div className="eyebrow">
              DAILY CHECK-IN
            </div>

            <h2
              style={{
                fontSize: "2.4rem",
                marginTop: ".6rem",
              }}
            >
              How are you today?
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close readiness check-in"
            style={{
              border: 0,
              background: "transparent",
              fontSize: "28px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {sliders.map((item) => (
          <div
            key={item.label}
            style={{
              marginBottom: "1.2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <strong>
                {item.label}
              </strong>

              <strong>
                {item.value}/5
              </strong>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              value={item.value}
              onChange={(e) =>
                item.setter(
                  Number(e.target.value)
                )
              }
              style={{
                width: "100%",
              }}
            />
          </div>
        ))}

        <textarea
          className="field"
          value={note}
          placeholder="Anything your coach should know today?"
          onChange={(e) =>
            onNoteChange(
              e.target.value
            )
          }
          style={{
            minHeight: "100px",
            resize: "vertical",
          }}
        />

        <button
          className="primary full"
          onClick={onSave}
        >
          Save readiness
        </button>

        <button
          className="secondary full"
          onClick={onClose}
        >
          Cancel
        </button>
      </section>
    </div>
  );
}
