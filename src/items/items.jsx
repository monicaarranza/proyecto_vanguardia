import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Navbar,
  Table,
  Badge,
  Toast,
  ToastContainer,
  Modal,
  Tabs,
} from "react-bootstrap";
import { BoxArrowInRight, BoxSeam } from "react-bootstrap-icons";
import "./items.css";
import axios from "axios";
import BannerFeedback from "../components/BannerFeedback";
import { jwtDecode } from "jwt-decode";
import WriterWidget from "../components/WriterWidget";
import { Tab } from "bootstrap";

function Items() {
  const API = process.env.REACT_APP_API_URL;

  const [scanState, setScanState] = useState({ status: "idle", product: null });
  const [operation, setOperation] = useState("entrada");
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: "", variant: "" });
  const [scanType, setScanType] = useState();

  const [categories, setCategories] = useState([]);

  const [items, setItems] = useState([]);

  const [showCreateProduct, setShowCreateProduct] = useState(false);

  //new product data
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [baseUOM, setBaseUOM] = useState(1);

  const UOMs = [
    "UN",
    "KG",
    "G",
    "LT",
    "ML",
    "MTS",
    "CM",
    "BOX",
    "PACK",
    "PALLET",
  ];

  const [user, setUser] = useState(null);

  //scanned tag data
  const [tag, setTag] = useState(null);
  const [last, setLast] = useState(null);

  //feedback
  const [details, setDetails] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [success, setSuccess] = useState(false);
  const [variant, setVariant] = useState("danger");

  const [selectedItem, setSelectedItem] = useState(null);

  const handleGetItems = (locationId) => {
    axios
      .post(`${API}/products/get-items`, {
        locationId: locationId,
      })
      .then((response) => {
        console.log(response.data.data);
        setItems(response.data.data);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
  };

  const handleTagScan = (tag) => {
    setLast(tag.uid);
    setUid(tag.uid);

    axios
      .post(`${API}/tags/get-tag`, { uid: tag.uid })
      .then((response) => {
        console.log(response.data.data);
        if (response.data.data) {
          setTag(null);
          setToastInfo({
            message:
              "La etiqueta escaneada ya esta siendo utilizada por otro articulo.",
            variant: "danger",
          });
          setShowToast(true);
        } else {
          setTag(response.data.data);
        }
      })
      .catch((error) => {
        if (error.response) {
          setToastInfo({
            message: error.response.data.details,
            variant: "danger",
          });
        } else {
          setToastInfo({
            message: "Error de red o del servidor",
            variant: "danger",
          });
        }
        setShowDetails(true);
      });
  };

  // Para los datos básicos del producto
  const [status, setStatus] = useState("ACTIVO"); // si no lo tienes, puedes manejarlo así
  const [quantity, setQuantity] = useState(0);
  const [createdAt, setCreatedAt] = useState(Date.now()); // o cuando realmente se cree el producto

  // new batch
  const [uid, setUid] = useState(null);
  const [divideQty, setDivideQty] = useState(0);

  // Handler para dividir
  const handleDivideItem = () => {
    if (!uid || !divideQty) {
      setToastInfo({
        message: `Escanee la etiqueta que va a asiganar al nuevo lote y cantidad para dividir.`,
        variant: "danger",
      });
      setShowToast(true);

      setShowToast(true);
      return;
    }

    console.log(tag);

    if (tag) {
      setToastInfo({
        message: `La etiqueta escaneada ya esta siendo utilizada por otro articulo.`,
        variant: "danger",
      });

      setShowToast(true);
      return;
    }

    const newBatch = {
      product_id: selectedItem.product_id,
      nfc_uid: uid,
      location_id: user.location_id,
      item_quantity: divideQty,
      root_id: selectedItem.parent_id
        ? selectedItem.parent_id
        : selectedItem.item_id,
      parent_id: selectedItem.item_id,
    };

    console.log(newBatch);
    // lógica para dividir aquí
    axios
      .post(`${API}/products/divide-batch`, {
        itemData: newBatch,
      })
      .then((response) => {
        handleGetItems(user.location_id);
        handleCloseNewBatch();
        setToastInfo({
          message: response.data.details,
          variant: "success",
        });

        setShowToast(true);
      })
      .catch((error) => {
        setToastInfo({
          message: error.response.data.data,
          variant: "danger",
        });

        setShowToast(true);
      });
  };

  const handleCloseNewBatch = () => {
    setSelectedItem(null);
    setUid("");
    setDivideQty(0);
    setShowCreateProduct(false);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const decoded = jwtDecode(accessToken);

    console.log(decoded);

    setUser(decoded);

    handleGetItems(decoded.location_id);
  }, []);

  return (
    <div className="inventory-system">
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={4000}
          autohide
          bg={toastInfo.variant}
        >
          <Toast.Header>
            <strong className="me-auto">Sistema de Inventario</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastInfo.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand href="#home">
            <BoxSeam size={24} className="me-2" />
            <strong>Inventario</strong>Pro
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container fluid>
        <Row>
          <Card className="shadow-lg border-light m-2">
            <Card.Header as="h5" className="bg-light">
              {user?.location}
            </Card.Header>
          </Card>
        </Row>
        <Row>
          <WriterWidget tag={tag} onScan={handleTagScan} />

          <Col lg={8}>
            <Card className="shadow-lg border-light">
              <Card.Header
                as="h5"
                className="bg-light d-flex justify-content-between align-items-center"
              >
                Articulos del Almacen
              </Card.Header>
              <Card.Body>
                <Table responsive hover className="inventory-table">
                  <thead className="table-dark">
                    <tr>
                      <th>UID</th>
                      <th>SKU</th>
                      <th>Nombre del Producto</th>
                      <th>Unidad Base</th>
                      <th>Status</th>
                      <th>Cantidad</th>
                      <th>Fecha de Creacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.product_id}
                        className={
                          scanState.item?.item_id === item.item_id
                            ? "highlight-row"
                            : ""
                        }
                        onClick={() => {
                          setShowCreateProduct(true);
                          setSelectedItem(item);
                        }}
                      >
                        <td>
                          <Badge bg="primary">{item.nfc_uid}</Badge>
                        </td>
                        <td>
                          <Badge bg="secondary">{item.sku}</Badge>
                        </td>

                        <td>
                          <strong>{item.product_name}</strong>
                        </td>
                        <td>{item.base_uom}</td>
                        <td>{item.status}</td>
                        <td>{item.quantity}</td>
                        <td>
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showCreateProduct} onHide={handleCloseNewBatch} centered>
        <Modal.Header closeButton>
          <Modal.Title>Lote</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            defaultActiveKey="detalles"
            id="product-modal-tabs"
            className="mb-3"
          >
            {/* TAB 1: Detalles (solo lectura / resumen) */}
            <Tab eventKey="detalles" title="Detalles del Lote">
              <dl className="row">
                <dt className="col-sm-4">SKU</dt>
                <dd className="col-sm-8">{selectedItem?.sku ?? "-"}</dd>

                <dt className="col-sm-4">UID</dt>
                <dd className="col-sm-8">{selectedItem?.nfc_uid ?? "-"}</dd>

                <dt className="col-sm-4">Nombre del Producto</dt>
                <dd className="col-sm-8">
                  {selectedItem?.product_name ?? "-"}
                </dd>

                <dt className="col-sm-4">Unidad Base</dt>
                <dd className="col-sm-8">{selectedItem?.base_uom ?? "-"}</dd>

                <dt className="col-sm-4">Status</dt>
                <dd className="col-sm-8">{selectedItem?.status}</dd>

                <dt className="col-sm-4">Cantidad</dt>
                <dd className="col-sm-8">{selectedItem?.quantity}</dd>

                <dt className="col-sm-4">Fecha de Creación</dt>
                <dd className="col-sm-8">
                  {selectedItem?.created_at
                    ? new Date(selectedItem.created_at).toLocaleString()
                    : "-"}
                </dd>
              </dl>
            </Tab>

            {selectedItem?.quantity > 1 &&
              selectedItem?.status === "IN_STOCK" && (
                <Tab eventKey="dividir" title="Dividir Lote">
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleDivideItem?.();
                    }}
                  >
                    <dl className="row">
                      <h5 className="mb-3">Lote a Dividir</h5>
                      <dt className="col-sm-4">SKU</dt>
                      <dd className="col-sm-8">{selectedItem?.sku ?? "-"}</dd>

                      <dt className="col-sm-4">UID</dt>
                      <dd className="col-sm-8">
                        {selectedItem?.nfc_uid ?? "-"}
                      </dd>

                      <dt className="col-sm-4">Producto</dt>
                      <dd className="col-sm-8">
                        {selectedItem?.product_name ?? "-"}
                      </dd>
                      <dt className="col-sm-4">Cantidad Disponible</dt>
                      <dd className="col-sm-8">
                        {selectedItem?.quantity ?? "-"} -{" "}
                        {selectedItem?.base_uom}
                      </dd>
                    </dl>
                    <Form.Group className="mb-3">
                      <h5 className="mb-3">Nuevo Lote</h5>
                      <Form.Label>
                        <strong>UID:</strong>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="UID de etiqueta"
                        value={uid}
                        onChange={(e) => setUid(e.target.value)}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Cantidad:</strong>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        max={selectedItem?.quantity - 1}
                        step={1}
                        placeholder="Cantidad a dividir"
                        value={divideQty}
                        onChange={(e) => setDivideQty(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end mt-3">
                      <Button type="submit" variant="primary">
                        Dividir
                      </Button>
                    </div>
                  </Form>
                </Tab>
              )}
          </Tabs>
        </Modal.Body>
      </Modal>

      <BannerFeedback
        show={showDetails}
        message={details}
        variant={variant}
        onAccept={() => setShowDetails(false)}
        onClose={() => setShowDetails(false)} // opcional
      />
    </div>
  );
}

export default Items;
