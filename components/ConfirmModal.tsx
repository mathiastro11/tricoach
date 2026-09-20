"use client";

type ConfirmModalProps = {
  open: boolean;

  eyebrow?: string;
  title: string;
  message: string;

  confirmLabel?: string;
  cancelLabel?: string;

  destructive?: boolean;

  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  eyebrow = "CONFIRM",
  title,
  message,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {

  if (!open) {
    return null;
  }

  return (
    <div
      className="confirmOverlay"
      onClick={onCancel}
    >
      <section
        className="confirmModal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="confirmTop">
          <div>
            <span className="eyebrow">
              {eyebrow}
            </span>

            <h2>
              {title}
            </h2>
          </div>

          <button
            className="confirmClose"
            onClick={onCancel}
            aria-label="Close confirmation"
          >
            ×
          </button>
        </div>

        <p>
          {message}
        </p>

        <div className="confirmActions">
          <button
            className="secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            className={
              destructive
                ? "dangerButton"
                : "primary"
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
