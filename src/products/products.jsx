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
import "./products.css";
import axios from "axios";
import BannerFeedback from "../components/BannerFeedback";

function Products() {
  const [scanState, setScanState] = useState({ status: "idle", product: null });
  const [operation, setOperation] = useState("entrada");
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: "", variant: "" });
  const [scanType, setScanType] = useState();

  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);

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

  const handleCreateProduct = () => {
    const newProduct = {
      sku: sku,
      product_name: productName,
      product_category: category,
      base_uom: baseUOM,
    };

    axios
      .post("http://localhost:5000/products/create-product", newProduct)
      .then((response) => {
        setDetails("Producto creado con exito");
        setVariant("success");
        setShowDetails(true);
        handleGetProducts();
        setShowCreateProduct(false);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
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

  useEffect(() => {
    handleGetProducts();
    handleGetCategories();
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
                Productos
                <Button bg="dark" onClick={() => setShowCreateProduct(true)}>
                  Nuevo Producto
                </Button>
              </Card.Header>
              <Card.Body>
                <Table responsive hover className="inventory-table">
                  <thead className="table-dark">
                    <tr>
                      <th>SKU</th>
                      <th>Nombre del Producto</th>
                      <th>Categoría</th>
                      <th>Unidad Base</th>
                      <th>Fecha de Creacion</th>
                      <th>Ultima Actualizacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item) => (
                      <tr
                        key={item.product_id}
                        className={
                          scanState.product?.product_id === item.product_id
                            ? "highlight-row"
                            : ""
                        }
                      >
                        <td>
                          <Badge bg="secondary">{item.sku}</Badge>
                        </td>
                        <td>
                          <strong>{item.product_name}</strong>
                        </td>
                        <td>
                          {categories.find(
                            (c) =>
                              String(c.category_id) ===
                              String(item.product_category)
                          )?.category_name ?? "—"}
                        </td>
                        <td>{item.base_uom}</td>
                        <td>
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(item.updated_at).toLocaleDateString()}
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

      <Modal
        show={showCreateProduct}
        onHide={() => setShowCreateProduct(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Producto</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>SKU:</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="format_name"
                placeholder="Ej: SKU_001"
                required
                maxLength={100}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Nombre del producto:</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="format_name"
                placeholder="Ej: Xbox Series X"
                required
                maxLength={100}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Categoria:</strong>
              </Form.Label>
              <Form.Select
                name="category_id"
                required
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option value="">Seleccione categoria</option>
                {categories.map((p) => (
                  <option key={p.category_id} value={p.category_id}>
                    {p.category_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>UOM:</strong>
              </Form.Label>
              <Form.Select
                name="uom"
                required
                onChange={(e) => setBaseUOM(e.target.value)}
                value={baseUOM}
              >
                <option value="">Seleccione unidad de medida</option>
                {UOMs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button onClick={handleCreateProduct} variant="success">
                Crear Producto
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

export default Products;
