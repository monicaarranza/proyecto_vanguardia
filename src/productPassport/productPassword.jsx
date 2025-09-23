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
  BsBoxArrowDown,
  BsBoxArrowRight,
  BsArrowLeftRight,
  BsScissors,
  BsTruck,
  BsDownload,
  BsTrash,
  BsGear,
  BsClipboardCheck,
  BsClipboardX,
  BsArrowReturnLeft,
  BsQuestionCircle,
  BsShieldCheck,
} from "react-icons/bs";

import { useParams, useSearchParams } from "react-router-dom";
import "./productPassport.css";
import {
  BsQrCodeScan,
  BsBoxSeam,
  BsClockHistory,
  BsFileEarmarkText,
} from "react-icons/bs";
import { FaCodeBranch } from "react-icons/fa";
import { PiArrowsSplitBold, PiArrowsSplitLight } from "react-icons/pi";
import TxDetailsModal from "../components/TxDetailsModal.jsx"

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

const NUM2CANON = {
  1: "inbound",
  2: "outbound",
  3: "move_in",
  4: "move_out",
  5: "split_in",
  6: "split_out",
  7: "consume",
  8: "transfer",
  9: "receive",
  10: "ship",
  11: "return_in",
  12: "return_out",
  13: "adjust",
  14: "audit",
  15: "qc_pass",
  16: "qc_fail",
};

const normalizeType = (t) => {
  const s = String(t ?? "")
    .trim()
    .toLowerCase();
  if (!s) return "other";
  if (/^\d+$/.test(s)) return NUM2CANON[Number(s)] || "other";
  if (["in", "inbound", "receive"].includes(s)) return "inbound";
  if (["out", "outbound", "ship"].includes(s)) return "outbound";
  return s; // move_in, move_out, split_in, split_out, consume, transfer, etc.
};

export function movementTypeInfo(ev) {
  const t = normalizeType(ev?.movement_type ?? ev?.direction);

  switch (t) {
    case "inbound":
      return {
        label: "Entrada",
        Icon: BsBoxArrowDown,
        iconCls: "mov-icon mov-in",
        tone: "text-success",
      };
    case "outbound":
      return {
        label: "Salida",
        Icon: BsBoxArrowRight,
        iconCls: "mov-icon mov-out",
        tone: "text-danger",
      };
    case "move_in":
      return {
        label: "Movimiento (entrada)",
        Icon: BsArrowLeftRight,
        iconCls: "mov-icon mov-move",
        tone: "text-primary",
      };
    case "move_out":
      return {
        label: "Movimiento (salida)",
        Icon: BsArrowLeftRight,
        iconCls: "mov-icon mov-move",
        tone: "text-primary",
      };
    case "split_in":
      return {
        label: "División",
        Icon: PiArrowsSplitBold,
        iconCls: "mov-icon mov-split",
        tone: "text-info",
      };
    case "split_out":
      return {
        label: "División ",
        Icon: PiArrowsSplitBold,
        iconCls: "mov-icon mov-split",
        tone: "text-info",
      };
    case "receive":
      return {
        label: "Recepción",
        Icon: BsDownload,
        iconCls: "mov-icon mov-receive",
        tone: "text-success",
      };
    case "ship":
      return {
        label: "Envío",
        Icon: BsTruck,
        iconCls: "mov-icon mov-ship",
        tone: "text-danger",
      };
    case "transfer":
      return {
        label: "Transferencia",
        Icon: BsArrowLeftRight,
        iconCls: "mov-icon mov-transfer",
        tone: "text-primary",
      };
    case "consume":
      return {
        label: "Consumo",
        Icon: BsTrash,
        iconCls: "mov-icon mov-consume",
        tone: "text-secondary",
      };
    case "adjust":
      return {
        label: "Ajuste",
        Icon: BsGear,
        iconCls: "mov-icon mov-adjust",
        tone: "text-warning",
      };
    case "audit":
      return {
        label: "Auditoría",
        Icon: BsClipboardCheck,
        iconCls: "mov-icon mov-audit",
        tone: "text-muted",
      };
    case "return_in":
      return {
        label: "Devolución (entrada)",
        Icon: BsArrowReturnLeft,
        iconCls: "mov-icon mov-return",
        tone: "text-success",
      };
    case "return_out":
      return {
        label: "Devolución (salida)",
        Icon: BsArrowReturnLeft,
        iconCls: "mov-icon mov-return",
        tone: "text-danger",
      };
    case "qc_pass":
      return {
        label: "QC Aprobado",
        Icon: BsClipboardCheck,
        iconCls: "mov-icon mov-qc",
        tone: "text-success",
      };
    case "qc_fail":
      return {
        label: "QC Rechazado",
        Icon: BsClipboardX,
        iconCls: "mov-icon mov-qc",
        tone: "text-danger",
      };
    default:
      return {
        label: "Movimiento",
        Icon: BsQuestionCircle,
        iconCls: "mov-icon mov-other",
        tone: "text-secondary",
      };
  }
}

const fmt = (d) => new Date(d).toLocaleString();

export default function ProductPassport({ timeline = [] }) {
  const API = process.env.REACT_APP_API_URL;

  const { uid } = useParams();

  const [item, setItem] = useState(null);

  const [locations, setLocations] = useState([]);

  const [txDetails, setTxDetails] = useState(null);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

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

  const handleGetTransaction = (hash) => {
    console.log(hash);
    axios
      .post(`${API}/products/get-transaction`, { hash: hash })
      .then((response) => {
        setTxDetails(response.data.data);
        setTxModalOpen(true);
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getLocationName = (id) =>
    locations.find((l) => String(l.location_id) === String(id))
      ?.location_name ?? null;

  const handleGetLocations = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/locations/get-locations`)
      .then((response) => {
        console.log(response.data.data);
        setLocations(response.data.data);
      })
      .catch((error) => {});
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
                            <a href={href} className="lineage-id">
                              {uid}
                            </a>
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

        {Array.isArray(item?.movements_chain) &&
          item.movements_chain.length > 0 && (
            <Card className="mb-3 card-soft">
              <Card.Header className="fw-semibold bg-white border-0 pb-0 pt-3 px-3">
                <span className="section-title">Historial</span>
              </Card.Header>

              <Card.Body className="mov-wrap">
                {(() => {
                  // Helpers
                  const shortUid = (u) =>
                    u ? `${String(u).slice(0, 6)}…${String(u).slice(-4)}` : "—";

                  // Mapear lineage por UID para mostrar info en split (item_id, etc.)
                  const lineageIndex = Object.fromEntries(
                    (item.lineage || []).map((n, i) => [
                      String(n.nfc_uid || "").toUpperCase(),
                      { ...n, _pos: i },
                    ])
                  );

                  // 1) Base: orden cronológico por ts
                  const base = (item.movements_chain || [])
                    .slice()
                    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

                  // 2) Inyectar marcadores de división cuando cambia el source_uid
                  const withSplits = [];
                  let prevUid = base.length ? base[0].source_uid || null : null;

                  for (let i = 0; i < base.length; i++) {
                    const ev = base[i];

                    const uid = ev.source_uid || null;

                    if (i > 0 && uid && prevUid && uid !== prevUid) {
                      const from = lineageIndex[prevUid] || {};
                      const to = lineageIndex[uid] || {};
                      withSplits.push({
                        kind: "split",
                        at_ts: ev.ts, // usamos el ts del primer evento del nuevo UID
                        from_uid: prevUid,
                        to_uid: uid,
                        from_item_id: from.item_id,
                        to_item_id: to.item_id,
                      });
                    }

                    withSplits.push(ev);
                    if (uid) prevUid = uid;
                  }

                  return withSplits.map((ev, idx) => {
                    if (ev.kind === "split") {
                      const when = ev.at_ts
                        ? new Date(Number(ev.at_ts) * 1000)
                        : null;
                      return (
                        <div
                          key={`split-${idx}`}
                          className="mov-card split-card my-3"
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                              <div className="mov-icon mov-split">
                                <PiArrowsSplitBold size={16} />
                              </div>
                              <div>
                                <div className="mov-title text-primary">
                                  División de lote
                                </div>
                                <div className="mov-sub">
                                  {ev.from_item_id
                                    ? `#${ev.from_item_id}`
                                    : shortUid(ev.from_uid)}{" "}
                                  <span className="mx-1">→</span>{" "}
                                  {ev.to_item_id
                                    ? `#${ev.to_item_id}`
                                    : shortUid(ev.to_uid)}
                                </div>
                              </div>
                            </div>
                            <div className="mov-time">
                              {when ? fmt(when) : "—"}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const when = ev.at_iso
                      ? new Date(ev.at_iso)
                      : ev.ts
                      ? new Date((Number(ev.ts) || 0) * 1000)
                      : null;

                    // Si usas getLocationName, mantenlo. Si no, puedes mapear directo:
                    const locationName = getLocationName
                      ? getLocationName(ev.location_id)
                      : "—";

                    const txShort = ev.tx_hash
                      ? `${ev.tx_hash.slice(0, 10)}…${ev.tx_hash.slice(-8)}`
                      : null;

                    const { label, Icon, iconCls, tone } = movementTypeInfo(ev);

                    return (
                      <div
                        key={ev.tx_hash || `${ev.ts}-${idx}`}
                        className="mov-card mb-2"
                        onClick={() => handleGetTransaction(ev?.tx_hash)}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <div className={iconCls}>
                              <Icon size={16} />
                            </div>

                            <div>
                              <div className={`mov-title ${tone}`}>{label}</div>

                              <div className="mov-sub">
                                {locationName && locationName !== "—" ? (
                                  <>Ubicación: {locationName}</>
                                ) : null}
                                {typeof ev.quantity === "number" ? (
                                  <> · Cant.: {ev.quantity}</>
                                ) : null}
                                {ev.verified === true && (
                                  <>
                                    {" "}
                                    ·{" "}
                                    <span className="text-success">
                                      ✓ Verificado
                                    </span>
                                  </>
                                )}
                                {ev.verified === false && (
                                  <>
                                    {" "}
                                    ·{" "}
                                    <span className="text-danger">
                                      ⚠ No coincide
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="mov-sub">
                                {/* Muestra de qué UID proviene este evento si quieres transparencia */}
                                {ev.source_uid ? (
                                  <>
                                    UID: <code>{shortUid(ev.source_uid)}</code>{" "}
                                    ·{" "}
                                  </>
                                ) : null}
                                {txShort ? (
                                  <>
                                    tx: <code>{txShort}</code>
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
                    <Button size="sm" variant="link">
                      Ver más
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

        {/* Avisos */}
        <Row className="mt-2">
          <Col>
            <small className="text-muted d-block text-center"></small>
          </Col>
        </Row>
        <TxDetailsModal
          show={txModalOpen}
          onHide={() => setTxModalOpen(false)}
          data={txDetails}
          loading={txLoading}
        />
      </Container>
    </>
  );
}
