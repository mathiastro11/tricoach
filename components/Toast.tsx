"use client";

import {
  useEffect,
} from "react";

export type ToastType =
  | "success"
  | "info"
  | "error";

type ToastProps = {
  message: string;
  type: ToastType;
  onClose: () => void;
  persistent?: boolean;
};

export default function Toast({
  message,
  type,
  onClose,
  persistent = false,
}: ToastProps) {

  useEffect(() => {
    if (persistent) {
      return;
    }

    const timeout =
      window.setTimeout(
        onClose,
        type === "error"
          ? 5000
          : 3500
      );

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [
    message,
    type,
    onClose,
    persistent,
  ]);

  return (
    <div
      className={`tricoachToast ${type} ${persistent ? "persistent" : ""}`}
      role={
        type === "error"
          ? "alert"
          : "status"
      }
    >
      <div
        className="toastIcon"
      >
        {persistent
          ? ""
          : type === "success"
          ? "✓"
          : type === "error"
          ? "!"
          : "i"}
      </div>

      <div className="toastBody">
        <strong>
          {persistent
            ? "Updating your plan"
            : type === "success"
            ? "Done"
            : type === "error"
            ? "Something went wrong"
            : "Basse"}
        </strong>

        <span>
          {message}
        </span>
      </div>

      {!persistent && (
        <button
          className="toastClose"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
}
