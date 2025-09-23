import { useMemo } from "react";
import {
  Modal,
  Spinner,
  Table,
  Badge,
  Button,
  OverlayTrigger,
  Tooltip,
  Accordion,
} from "react-bootstrap";

function Copyable({ value, children }) {
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>Copiar</Tooltip>}
      delay={{ show: 300, hide: 50 }}
    >
      <Button
        size="sm"
        variant="outline-secondary"
        className="ms-2 py-0 px-2"
        onClick={(e) => {
          e.stopPropagation();
          if (value != null) navigator.clipboard.writeText(String(value));
        }}
      >
        ⧉
      </Button>
    </OverlayTrigger>
  );
}

function Mono({ text, truncate = 0, copy = false }) {
  const shown = useMemo(() => {
    if (!text) return "—";
    const s = String(text);
    if (!truncate || s.length <= truncate) return s;
    const head = Math.ceil((truncate - 1) / 2);
    const tail = Math.floor((truncate - 1) / 2);
    return `${s.slice(0, head)}…${s.slice(-tail)}`;
  }, [text, truncate]);

  return (
    <div className="d-flex align-items-center">
      <OverlayTrigger placement="top" overlay={<Tooltip>{String(text || "—")}</Tooltip>}>
        <code className="small">{shown}</code>
      </OverlayTrigger>
      {copy && text && <Copyable value={text} />}
    </div>
  );
}

export default function TxDetailsModal({ show, onHide, data, loading }) {
  const ok = data && !data.error;

  const statusBadge = (s) => {
    if (s === 1) return <Badge bg="success" pill>Success</Badge>;
    if (s === 0) return <Badge bg="danger" pill>Failed</Badge>;
    return <Badge bg="secondary" pill>Pending</Badge>;
  };

  const Row = ({ k, children }) => (
    <tr>
      <td className="text-muted small" style={{ width: 160 }}>{k}</td>
      <td className="small">{children ?? "—"}</td>
    </tr>
  );

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <div className="w-100">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">Detalle de transacción</h5>
          </div>
          {!loading && ok && (
            <div className="text-muted small mt-1">
              {data.timestamp_iso ? `Fecha: ${data.timestamp_iso}` : "Fecha: —"}
            </div>
          )}
        </div>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && data?.error && (
          <div className="alert alert-danger py-2 px-3 small mb-0">
            <strong>Error:</strong> {data.error}
          </div>
        )}

        {!loading && ok && (
          <>
            <div className="rounded-3 border p-2 p-sm-3 mb-3">
              <Table size="sm" borderless responsive className="mb-0">
                <tbody>
                  <Row k="Hash">
                    <Mono text={data.hash} truncate={32} copy />
                  </Row>
                  <Row k="Estado">{statusBadge(data.status)}</Row>
                  <Row k="Bloque">
                    {data.blockNumber ?? "—"}
                  </Row>
                  <Row k="Fecha">{data.timestamp_iso || "—"}</Row>
                  <Row k="From">
                    <Mono text={data.from} truncate={26} copy />
                  </Row>
                  <Row k="To">
                    <Mono text={data.to} truncate={26} copy />
                  </Row>
                  <Row k="Nonce">{data.nonce ?? "—"}</Row>
                  <Row k="Gas usado">
                    {data.gasUsed ?? "—"}
                  </Row>
                  <Row k="Gas price (wei)">
                    <Mono text={data.gasPrice_wei} truncate={24} copy />
                  </Row>
                  
                </tbody>
              </Table>
            </div>

            {!Array.isArray(data.logs) && data.logs.length > 0 && (
              <>
                <div className="fw-semibold mb-2">Eventos</div>
                <Accordion alwaysOpen>
                  {data.logs.map((lg, i) => (
                    <Accordion.Item eventKey={String(i)} key={i}>
                      <Accordion.Header>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold">{lg.name || `Log ${i}`}</span>
                          <span className="text-muted small">
                            logIndex: {lg.logIndex ?? "—"}
                          </span>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <pre className="small mb-0" style={{ whiteSpace: "pre-wrap" }}>
                          {JSON.stringify(lg.args ?? lg, null, 2)}
                        </pre>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
