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
} from "react-bootstrap";
import { BoxArrowInRight, BoxSeam } from "react-bootstrap-icons";
import "./batchTypes.css";
import axios from "axios";
import BannerFeedback from "../components/BannerFeedback";

function BatchTypes() {
  const [scanState, setScanState] = useState({ status: "idle", product: null });
  const [operation, setOperation] = useState("entrada");
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: "", variant: "" });
  const [scanType, setScanType] = useState();

  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);

  const [showCreateProduct, setShowCreateProduct] = useState(false);

  const [batchTypes, setBatchTypes] = useState([]);

  //new product data
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [multiplier, setMultiplier] = useState(1);

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

  //scanned tag data
  const [last, setLast] = useState(null);

  //feedback
  const [details, setDetails] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [success, setSuccess] = useState(false);
  const [variant, setVariant] = useState("danger");

  const handleGetCategories = () => {
    axios
      .get("http://localhost:5000/categories/get-categories")
      .then((response) => {
        setCategories(response.data.data);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
  };

  const handleBatchType = () => {
    const newTupe = {
      batch_type_name: name,
      product_id: productId,
      batch_type_multiplier: multiplier,
    };

    axios
      .post("http://localhost:5000/products/create-batch-type", newTupe)
      .then((response) => {
        setDetails(response.data.details);
        setVariant("success");
        setShowDetails(true);
        handleGetBatchTypes();
        setShowCreateProduct(false);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
      console.log(newTupe);
  };

  const handleGetProducts = () => {
    axios
      .get("http://localhost:5000/products/get-products")
      .then((response) => {
        setProducts(response.data.data);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
  };

  const handleGetBatchTypes = () => {
    axios
      .get("http://localhost:5000/products/get-batch-types")
      .then((response) => {
        setBatchTypes(response.data.data);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
  };

  useEffect(() => {
    handleGetProducts();
    handleGetBatchTypes();
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
          <Col lg={4}>
            <Card className="shadow-sm border-light action-card-manual">
              <Card.Header className="d-flex align-items-center">
                <BoxArrowInRight size={20} className="me-2 text-success" />
                Registro Manual
              </Card.Header>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="shadow-lg border-light">
              <Card.Header
                as="h5"
                className="bg-light d-flex justify-content-between align-items-center"
              >
                Tipos de Empaquetado
                <Button bg="dark" onClick={() => setShowCreateProduct(true)}>
                  Nuevo Tipo
                </Button>
              </Card.Header>
              <Card.Body>
                <Table responsive hover className="inventory-table">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Producto</th>
                      <th>Multiplicador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchTypes.map((item) => (
                      <tr
                        key={item.batch_type_id}
                        className={
                          scanState.product?.batch_type_id === item.batch_type_id
                            ? "highlight-row"
                            : ""
                        }
                      >
                        <td>
                          <Badge bg="secondary">{item.batch_type_id}</Badge>
                        </td>
                        <td>
                          <strong>{item.batch_type_name}</strong>
                        </td>
                        <td>
                          {products.find(
                            (p) =>
                              String(p.product_id) ===
                              String(item.product_id)
                          )?.product_name ?? "—"}
                        </td>
                        <td>{item.batch_type_multiplier}</td>
    
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showCreateProduct}
        onHide={() => setShowCreateProduct(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Tipo de Lote</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Nombre:</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="format_name"
                placeholder="Ej: Lote x1000"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Producto:</strong>
              </Form.Label>
              <Form.Select
                name="category_id"
                required
                onChange={(e) => setProductId(e.target.value)}
                value={productId}
              >
                <option value="">Seleccione producto</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.product_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Multiplicador:</strong>
              </Form.Label>
              <Form.Control
                type="number"
                name="format_name"
                required
                maxLength={100}
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button onClick={handleBatchType} variant="success">
                Crear Tipo
              </Button>
            </div>
          </Form>
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

export default BatchTypes;
