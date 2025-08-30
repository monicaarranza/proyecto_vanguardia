import React from "react";
import { BsCheckCircle, BsXCircle } from "react-icons/bs";

/**
 * Props:
 * - show: boolean
 * - message: string | node
 * - variant: 'success' | 'danger' | 'warning' | 'info' (default: 'success')
 * - onAccept: function  (click en Aceptar)
 * - acceptLabel: string (default: 'Aceptar')
 * - onClose: function   (opcional: muestra una X para cerrar)
 * - fixed: boolean      (default: true -> banner fijo arriba)
 */
export default function BannerFeedback({
  show,
  message,
  variant = "success",
  onAccept,
  acceptLabel = "Aceptar",
  onClose,
  fixed = true,
}) {
  if (!show) return null;

  const isError = variant === "danger";
  const Icon = isError ? BsXCircle : BsCheckCircle;

  return (
    <div
      className={fixed ? "position-fixed top-0 start-50 translate-middle-x p-3 w-100" : ""}
      style={{ zIndex: 1080, maxWidth: 720 }}
    >
      <div
        className={`alert alert-${variant} d-flex align-items-center shadow-sm mb-0`}
        role="alert"
      >
        <Icon size={20} className="me-2 flex-shrink-0" />
        <div className="flex-grow-1" style={{ whiteSpace: "pre-wrap" }}>
          {message}
        </div>

        {onAccept && (
          <button
            className="btn btn-light btn-sm ms-3"
            onClick={onAccept}
          >
            {acceptLabel}
          </button>
        )}

        {onClose && (
          <button
            type="button"
            className="btn-close ms-2"
            aria-label="Cerrar"
            onClick={onClose}
          />
        )}
      </div>
    </div>
  );
}
