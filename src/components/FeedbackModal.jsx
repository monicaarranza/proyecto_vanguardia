import React from "react";
import PropTypes from "prop-types";
import { Modal, Button, Spinner } from "react-bootstrap";
import { BsCheckCircle, BsExclamationTriangle, BsInfoCircle } from "react-icons/bs";

const icons = {
  success: BsCheckCircle,
  warning: BsExclamationTriangle,
  info: BsInfoCircle,
  danger: BsExclamationTriangle,
};

function FeedbackModal({
  show,
  onHide,
  title = "Detalle",
  message,
  variant = "info",
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
}) {
  const Icon = icons[variant] || BsInfoCircle;

  return (
    <Modal
      show={show}
      onHide={loading ? undefined : onHide}
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Icon className={`text-${variant}`} size={20} />
          <span>{title}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {typeof message === "string" ? (
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{message}</p>
        ) : (
          message
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={onCancel || onHide}
          disabled={loading}
        >
          {cancelLabel}
        </Button>

        {onConfirm && (
          <Button
            variant={
              variant === "success" ? "success" :
              variant === "danger"  ? "danger"  : "primary"
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Spinner animation="border" size="sm" className="me-2" />}
            {confirmLabel}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

FeedbackModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  variant: PropTypes.oneOf(["success", "warning", "info", "danger"]),
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
};

export default FeedbackModal;
