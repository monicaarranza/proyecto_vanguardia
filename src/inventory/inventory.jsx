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
  InputGroup,
  Spinner,
  Toast,
  ToastContainer,
  Modal,
} from "react-bootstrap";
import {
  BoxArrowInRight,
  BoxArrowUpRight,
  BoxSeam,
  Wifi,
} from "react-bootstrap-icons";
import "./inventory.css";
import Pn532Widget from "../components/Pn532Widget";
import axios from "axios";
import FeedbackModal from "../components/FeedbackModal";
import BannerFeedback from "../components/BannerFeedback";
import { usePn532Hybrid } from "../Pn532Hybrid";

import { jwtDecode } from "jwt-decode";

const initialInventory = [
  {
    id: "SKU-001",
    name: "Laptop Pro X",
    quantity: 25,
    category: "Electrónica",
  },
  {
    id: "SKU-002",
    name: "Teclado Mecánico RGB",
    quantity: 40,
    category: "Accesorios",
  },
  {
    id: "SKU-003",
    name: 'Monitor Curvo 27"',
    quantity: 15,
    category: "Monitores",
  },
  {
    id: "SKU-004",
    name: "Mouse Inalámbrico",
    quantity: 80,
    category: "Accesorios",
  },
  { id: "SKU-005", name: "Webcam 4K", quantity: 30, category: "Electrónica" },
];

function App() {
  const [inventory, setInventory] = useState(initialInventory);
  const [scanState, setScanState] = useState({ status: "idle", product: null });
  const [operation, setOperation] = useState("entrada");
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: "", variant: "" });
  const [scanType, setScanType] = useState();

  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);

  const [showCreateProduct, setShowCreateProduct] = useState(false);

  //new product lot data
  const [formatName, setFormatName] = useState("");
  const [multiplier, setMultiplier] = useState(1);
  const [product, setProduct] = useState("");

  //scanned tag data
  const [last, setLast] = useState(null);

  //feedback
  const [details, setDetails] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [success, setSuccess] = useState(false);
  const [variant, setVariant] = useState("danger");

  //item
  const [item, setItem] = useState(null);

  //user
  const [user, setUser] = useState(null);

  const handleGetCategories = () => {
    axios
      .get("http://localhost:5000/products/get-products")
      .then((response) => {
        console.log(response.data.data);
        setProducts(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleTagScan = (tag) => {
    console.log(tag);
    switch (tag.reader) {
      case "in_reader":
        handleProductMovement(tag.uid, "inbound");
        break;
      case "out_reader":
        handleProductMovement(tag.uid, "outbound");
        break;
    }
  };

  const handleProductMovement = (uid, movementType) => {
    axios
      .post("http://localhost:5000/products/create-item", {
        uid: uid,
        movementType: movementType,
        locationId: user.location_id,
        userId: user.user_id
      })
      .then((response) => {
        const item = response.data.data;

        setItem(item);

        if (item) {
          setToastInfo({
            message: `Movimiento confirmado: ${item.tag.product_quantity} x ${
              item.product.product_name
            } ${item.movementType === "inbound" ? "(entrada)" : "(salida)"}`,
            variant: item.movementType === "inbound" ? "success" : "warning",
          });
          setShowToast(true);
        } else {
          setToastInfo({
            message: `Esta etiqueta no está registrada o no tiene un producto asignado.`,
            variant: "danger",
          });
          setShowToast(true);
        }
      })
      .catch((error) => {
        setToastInfo({
          message: error.response.data.details,
          variant: "danger",
        });
        setShowToast(true);
      });
  };

  const getStockBadge = (quantity) => {
    if (quantity > 50) return <Badge bg="success">Alto</Badge>;
    if (quantity > 10) return <Badge bg="warning">Medio</Badge>;
    return <Badge bg="danger">Bajo</Badge>;
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const decoded = jwtDecode(accessToken);

    setUser(decoded);

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
          <Pn532Widget product={item} onScan={handleTagScan} />

          <Col lg={8}>
            <Card className="shadow-lg border-light">
              <Card.Header
                as="h5"
                className="bg-light d-flex justify-content-between align-items-center"
              >
                Estado Actual del Inventario
                <Badge bg="dark">Total Items: {inventory.length}</Badge>
              </Card.Header>
              <Card.Body>
                <Table responsive hover className="inventory-table">
                  <thead className="table-dark">
                    <tr>
                      <th>SKU</th>
                      <th>Nombre del Producto</th>
                      <th>Categoría</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr
                        key={item.id}
                        className={
                          scanState.product?.id === item.id
                            ? "highlight-row"
                            : ""
                        }
                      >
                        <td>
                          <Badge bg="secondary">{item.id}</Badge>
                        </td>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>{item.category}</td>
                        <td className="text-center fs-5">{item.quantity}</td>
                        <td className="text-center">
                          {getStockBadge(item.quantity)}
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
    </div>
  );
}

export default App;
