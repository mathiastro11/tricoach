"use client";

import {
  useState,
} from "react";

import {
  ACCOUNT_DELETION_CONFIRMATION,
} from "@/lib/account-deletion";


type DeleteAccountModalProps = {
  open: boolean;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};


export default function DeleteAccountModal({
  open,
  loading,
  error,
  onCancel,
  onConfirm,
}: DeleteAccountModalProps) {

  const [
    confirmation,
    setConfirmation,
  ] = useState("");


  if (!open) {
    return null;
  }


  const confirmed =
    confirmation ===
    ACCOUNT_DELETION_CONFIRMATION;


  function handleCancel() {

    if (loading) {
      return;
    }


    setConfirmation("");
    onCancel();
  }


  return (
    <div
      className="confirmOverlay"
      onClick={handleCancel}
    >

      <section
        className="confirmModal deleteAccountModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="confirmTop">

          <div>
            <span className="eyebrow">
              ACCOUNT
            </span>

            <h2 id="delete-account-title">
              Delete your account?
            </h2>
          </div>


          <button
            type="button"
            className="confirmClose"
            aria-label="Close account deletion"
            disabled={loading}
            onClick={handleCancel}
          >
            ×
          </button>

        </div>


        <p>
          This permanently deletes your Basse account,
          athlete profile, training plans, training history,
          readiness data and feedback. This cannot be undone.
        </p>


        <label
          className="deleteAccountConfirmation"
          htmlFor="delete-account-confirmation"
        >
          <span>
            Type{" "}
            <strong>
              {ACCOUNT_DELETION_CONFIRMATION}
            </strong>{" "}
            to confirm
          </span>

          <input
            id="delete-account-confirmation"
            type="text"
            value={confirmation}
            autoFocus
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            disabled={loading}
            onChange={(event) =>
              setConfirmation(
                event.target.value
                  .toUpperCase()
              )
            }
          />
        </label>


        {error && (
          <div
            className="deleteAccountError"
            role="alert"
          >
            {error}
          </div>
        )}


        <div className="confirmActions">

          <button
            type="button"
            className="secondary"
            disabled={loading}
            onClick={handleCancel}
          >
            Keep account
          </button>

          <button
            type="button"
            className="dangerButton"
            disabled={
              !confirmed ||
              loading
            }
            onClick={onConfirm}
          >
            {loading
              ? "Deleting..."
              : "Delete account"}
          </button>

        </div>

      </section>

    </div>
  );
}
