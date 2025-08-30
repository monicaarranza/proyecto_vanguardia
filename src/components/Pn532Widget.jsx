// Pn532Widget.js
import React from "react";
import { usePn532Hybrid } from "../Pn532Hybrid";

import { Card, Col, Form, Button, Spinner, InputGroup } from "react-bootstrap";
import { BoxArrowRight, Wifi } from "react-bootstrap-icons";

export default function Pn532Widget({
  onScan,
  baseUrl = "http://localhost:5000",
  product,
}) {
  const { uid, last, connected, error } = usePn532Hybrid(
    onScan || ((evt) => console.log("NFC:", evt)),
    { baseUrl }
  );

  //console.log(product);

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
            <p>Estado: {connected ? "Conectado" : "Reconectando..."}</p>
            {error && (
              <p style={{ color: "crimson" }}>Error: {String(error)}</p>
            )}
            <p>UID: {product?.tag?.uid || "—"}</p>
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
                  <strong>Tipo de Lote:</strong>
                </p>
                <h5 className="text-success">
                  {product?.batchType?.batch_type_name}
                </h5>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
}
