// Pn532Widget.js
import React, { useMemo } from "react";
import { usePn532Hybrid } from "../Pn532Hybrid";
import { Card, Col } from "react-bootstrap";
import { Wifi } from "react-bootstrap-icons";

export default function Pn532Widget({
  onScan,
  baseUrl = "http://localhost:5000",
  tag,
}) {
  // Asegura referencia estable a onScan
  const handleScan = useMemo(() => onScan || ((evt) => console.log("NFC:", evt)), [onScan]);

  const { uid, last, connected, error } = usePn532Hybrid(handleScan, {
    baseUrl,
    pollMs: 500,
    suppressInitial: true, // << clave para no disparar con el último UID al volver
  });

  const isPresent = last?.present === true;
  const showUid = isPresent ? (last?.uid || uid) : null;
  const readerName = last?.reader || "—";

  return (
    <Col lg={4}>
      <Card className="shadow-lg border-light mb-4 rfid-card">
        <Card.Body>
          <Card.Title className="d-flex align-items-center text-primary">
            <Wifi size={32} className="me-3" />
            Lector RFID
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Registro Automático
          </Card.Subtitle>
          <hr />

          <div style={{ fontFamily: "system-ui", padding: 12 }}>
            <p>
              Estado:{" "}
              <strong style={{ color: connected ? "#198754" : "#fd7e14" }}>
                {connected ? "Conectado" : "Reconectando…"}
              </strong>
            </p>
            <p className="mb-1">Lector: {readerName}</p>
            <p className="mb-1">
              Presencia: {isPresent ? "tarjeta detectada" : "—"}
            </p>
            <p className="mb-0">
              UID: <code>{showUid ?? "—"}</code>
            </p>
            {error && (
              <p className="mt-2" style={{ color: "crimson" }}>
                Error: {String(error)}
              </p>
            )}
          </div>

          {!tag ? (
            <div className="scan-result p-3 bg-light rounded">
              {/* Aquí puedes pintar detalles del último escaneo si quieres */}
            </div>
          ) : (
            <div className="text-center my-4">
              <p className="text-muted">La etiqueta ya ha sido registrada.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
}
