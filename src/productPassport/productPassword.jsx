import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  BsShieldCheck,
  BsShare,
  BsExclamationTriangle,
  BsBoxArrowDown,
  BsBoxArrowRight,
  BsQuestionCircle,
} from "react-icons/bs";
import { useParams, useSearchParams } from "react-router-dom";
import "./productPassport.css";
import {
  BsQrCodeScan,
  BsBoxSeam,
  BsClockHistory,
  BsFileEarmarkText,
} from "react-icons/bs";

const statusVariant = (s) => {
  switch ((s || "").toUpperCase()) {
    case "IN_STOCK":
      return "success";
    case "DEPLETED":
      return "secondary";
    case "RECALLED":
      return "danger";
    case "QUARANTINE":
      return "warning";
    default:
      return "secondary";
  }
};

const fmt = (d) => new Date(d).toLocaleString();

export default function ProductPassport({ timeline = [] }) {
  const API = process.env.REACT_APP_API_URL;

  const { uid } = useParams();

  const [item, setItem] = useState(null);

  const [locations, setLocations] = useState([]);

  const lineageKey = (n, i) => n.nfc_uid ?? n.item_id ?? n.href ?? i;
  const lineageHref = (n) =>
    n.href ?? (n.nfc_uid ? `/product-passport/${n.nfc_uid}` : "#");

  const formatLineageLabel = (n) => {
    const id = n.item_id ? `Lote #${n.item_id}` : n.code ?? n.label ?? "Lote";
    const st = n.status ?? undefined;
    const qtyRaw = n.item_quantity ?? n.quantity;
    const qty = qtyRaw != null ? `${qtyRaw} u` : undefined;
    const dt = n.created_at ? fmt(n.created_at) : undefined;
    return [id, dt].filter(Boolean).join(" · ");
  };

  const handleGetProductData = (uid) => {
    console.log(uid);
    axios
      .post(`${API}/products/get-product-passport`, { uid: uid })
      .then((response) => {
        const data = response.data.data;
        console.log(data);
        setItem(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getLocationName = (id) =>
  locations.find(l => String(l.location_id) === String(id))?.location_name ?? null;

  const handleGetLocations = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/locations/get-locations`)
      .then((response) => {
        console.log(response.data.data);
        setLocations(response.data.data);
      })
      .catch((error) => {
      });
  };

  useEffect(() => {
    if (!uid) return;
    handleGetProductData(uid);
    handleGetLocations();
  }, [uid]);

  return (
    <>
      <Container fluid="md" className="page-wrap py-3 px-3">
        <Card className="mb-3 card-hero">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="flex-grow-1">
                <p className="pp-banner-sub mb-2">
                  Aquí verás estado, trazabilidad, movimientos y documentos
                  verificados.
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-3 card-hero">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <Card.Title className="mb-1">
                  {item?.product_name || "Producto"}
                </Card.Title>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Badge bg={statusVariant(item?.status)}>
                    {item?.status || "—"}
                  </Badge>

                  {item?.verified ? (
                    <OverlayTrigger
                      overlay={<Tooltip>Firma verificada</Tooltip>}
                    >
                      <Badge
                        bg="primary"
                        className="d-inline-flex align-items-center gap-1 badge-pill"
                      >
                        <BsShieldCheck /> Verificado
                      </Badge>
                    </OverlayTrigger>
                  ) : null}

                  <span className="text-muted">SKU: {item?.sku || "—"}</span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Detalles */}
        <Card className="mb-3 card-soft">
          <Card.Header className="fw-semibold bg-white border-0 pb-0 pt-3 px-3">
            <span className="section-title">Detalles del producto</span>
          </Card.Header>
          <Card.Body className="pt-2">
            <dl className="row mb-0 dl-compact">
              <dt className="col-5 col-sm-4">UID</dt>
              <dd className="col-7 col-sm-8">{item?.uid ?? "—"}</dd>

              <dt className="col-5 col-sm-4">SKU</dt>
              <dd className="col-7 col-sm-8">{item?.sku ?? "—"}</dd>

              <dt className="col-5 col-sm-4">Cantidad</dt>
              <dd className="col-7 col-sm-8">{item?.quantity ?? 0}</dd>

              {item?.lot_code && (
                <>
                  <dt className="col-5 col-sm-4">Lote</dt>
                  <dd className="col-7 col-sm-8">{item.lot_code}</dd>
                </>
              )}
              {item?.expiry_date && (
                <>
                  <dt className="col-5 col-sm-4">Vence</dt>
                  <dd className="col-7 col-sm-8">{fmt(item.expiry_date)}</dd>
                </>
              )}
            </dl>
          </Card.Body>
        </Card>

        {/* Lineage */}
        {item?.lineage && item.lineage.length > 0 && (
          <Card className="mb-3 card-soft">
            <Card.Header className="fw-semibold bg-white border-0 pb-0 pt-3 px-3">
              <span className="section-title">Relación de lote</span>
            </Card.Header>

            <Card.Body className="py-2">
              {Array.isArray(item?.lineage) && item.lineage.length > 0 ? (
                <ol className="lineage-timeline list-unstyled mb-0">
                  {item.lineage.map((node, idx) => {
                    const id =
                      node.item_id != null
                        ? `#${node.item_id}`
                        : node.label ?? "Lote";
                    const uid = node.nfc_uid;
                    const ts = fmt(node.updated_at || node.created_at);
                    const href =
                      node.href ||
                      (node.nfc_uid
                        ? `/product-passport/${node.nfc_uid}`
                        : "#");

                    return (
                      <li
                        key={href || id + idx}
                        className="lineage-item d-flex"
                      >
                        <div className="lineage-track">
                          <span className="lineage-dot" />
                          {idx < item.lineage.length - 1 && (
                            <span className="lineage-line" />
                          )}
                        </div>

                        <div className="lineage-card flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center gap-2">
                            <a href={href} className="lineage-id">{uid}</a>
                            <small className="lineage-ts">{ts}</small>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="text-muted small">
                  Sin ancestros (lote raíz).
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Transparencia (on-chain) con mismo look de Historial */}
{Array.isArray(item?.movements_chain) && item.movements_chain.length > 0 && (
  <Card className="mb-3 card-soft">
    <Card.Header className="fw-semibold bg-white border-0 pb-0 pt-3 px-3">
      <span className="section-title">Historial</span>
    </Card.Header>

    <Card.Body className="mov-wrap">
      {/* Mapea { id, name } -> { [id]: name } una sola vez */}
      {(() => {
        const locationsById = Object.fromEntries(
          (locations || []).map(l => [Number(l.id), l.name])
        );

        return (item.movements_chain || [])
          .slice()
          .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
          .map((ev) => {
            const mt = String(ev.movement_type ?? "").toLowerCase();
            const isIn = mt === "1" || ["inbound", "in", "receive", "move_in", "split_in"].includes(mt);
            const isOut = mt === "2" || ["outbound", "out", "ship", "move_out", "split_out", "consume"].includes(mt);

            const Icon = isIn ? BsBoxArrowDown : isOut ? BsBoxArrowRight : BsQuestionCircle;
            const iconCls = isIn ? "mov-icon mov-in" : isOut ? "mov-icon mov-out" : "mov-icon mov-other";
            const label = isIn ? "Entrada" : isOut ? "Salida" : "Movimiento";

            const when =
              ev.at_iso ? new Date(ev.at_iso) :
              ev.ts ? new Date((Number(ev.ts) || 0) * 1000) :
              null;

            const locationName = getLocationName(ev.location_id);


            const tone = isIn ? "text-success" : isOut ? "text-danger" : "text-secondary";

            const txShort = ev.tx_hash ? `${ev.tx_hash.slice(0, 10)}…${ev.tx_hash.slice(-8)}` : null;

            return (
              <div key={ev.tx_hash || `${ev.ts}-${label}`} className="mov-card mb-2">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className={iconCls}>
                      <Icon size={16} />
                    </div>

                    <div>
                      <div className={`mov-title ${tone}`}>{label}</div>

                      <div className="mov-sub">
                        {locationName !== "—" ? <>Ubicación: {locationName}</> : null}
                        {typeof ev.quantity === "number" ? <> · Cant.: {ev.quantity}</> : null}
                        {ev.verified === true && <> · <span className="text-success">✓ Verificado</span></>}
                        {ev.verified === false && <> · <span className="text-danger">⚠ No coincide</span></>}
                      </div>

                      <div className="mov-sub">
                        {txShort ? <>tx: <code>{txShort}</code></> : null}
                        {ev.metadata_uri ? (
                          <>
                            {" "}|{" "}
                            <a href={ev.metadata_uri} target="_blank" rel="noreferrer">
                              snapshot
                            </a>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mov-time">
                    {when ? fmt(when) : "—"}
                  </div>
                </div>
              </div>
            );
          });
      })()}

      {(item.movements_chain?.length || 0) > 20 && (
        <div className="text-center pt-1">
          <Button size="sm" variant="link">Ver más</Button>
        </div>
      )}
    </Card.Body>
  </Card>
)}


        {/* Avisos */}
        <Row className="mt-2">
          <Col>
            <small className="text-muted d-block text-center">
            </small>
          </Col>
        </Row>
      </Container>
    </>
  );
}
