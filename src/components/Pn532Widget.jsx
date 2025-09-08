// Pn532Widget.js
import React from "react";
import { usePn532Hybrid } from "../Pn532Hybrid";

import { Card, Col, Form, Button, Spinner, InputGroup } from "react-bootstrap";
import { BoxArrowRight, Wifi } from "react-bootstrap-icons";

export default function Pn532Widget({
  onScan,
  baseUrl = process.env.REACT_APP_API_URL,
  product,
}) {
  const { uid, last, connected, error } = usePn532Hybrid(
    onScan || ((evt) => console.log("NFC:", evt)),
    { baseUrl }
  );

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

          {product && (
            <div className="scan-result p-3 bg-light rounded">
              <strong>
                {last.reader === "in_reader" ? (
                  <span className="text-success">
                    <BoxArrowRight font size={16} className="" /> Entrada de
                    Producto
                  </span>
                ) : last.reader === "out_reader" ? (
                  <span className="text-danger">
                    <BoxArrowRight size={16} className="" /> Salida de
                    Producto
                  </span>
                ) : (
                  <span className="text-muted">
                    <BoxArrowRight size={16} className="" /> Esperando...
                  </span>
                )}
              </strong>
              <div>
                <p className="mb-2">
                  <strong>Producto:</strong>
                </p>
                <h5 className="text-success">
                  {product?.product?.product_name}
                </h5>
              </div>
              <div>
                <p className="mb-2">
                  <strong>Cantidad:</strong>
                </p>
                <h5 className="text-success">
                  {product?.tag?.product_quantity}
                </h5>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
}
