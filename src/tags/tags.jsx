import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useMemo, useState } from "react";
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
import { BoxSeam } from "react-bootstrap-icons";
import "./tags.css";
import axios from "axios";
import BannerFeedback from "../components/BannerFeedback";
import WriterWidget from "../components/WriterWidget";

function Tags() {
  const [scanState, setScanState] = useState({ status: "idle", product: null });
  const [operation, setOperation] = useState("entrada");
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: "", variant: "" });
  const [scanType, setScanType] = useState();

  const [products, setProducts] = useState([]);
  const [batchTypes, setBatchTypes] = useState([]);

  const [categories, setCategories] = useState([]);

  const [tags, setTags] = useState([]);

  const [showCreateTag, setShowCreateTag] = useState(false);

  //new tag data
  const [uid, setUid] = useState("");
  const [batchTypeId, setBatchTypeId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  //scanned tag data
  const [last, setLast] = useState(null);

  //feedback
  const [details, setDetails] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [variant, setVariant] = useState("danger");

  const [tag, setTag] = useState(null);

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

  const handleCreateTag = () => {
    const newTag = {
      uid: uid,
      product_id: productId,
      product_quantity: quantity,
    };

    console.log(newTag);

    axios
      .post("http://localhost:5000/tags/create-tag", newTag)
      .then((response) => {
        setDetails(response.data.details);
        setVariant("success");
        setShowDetails(true);
        handleGetTags();
        setShowCreateTag(false);
      })
      .catch((error) => {
        console.error(error);
        if (error.response) {
          setDetails(error.response.data.details);
        } else {
          setDetails("Error de red o del servidor");
        }
        setVariant("danger");
        setShowDetails(true);
      });
  };

  const handleBatchTypes = () => {
    axios
      .get("http://localhost:5000/products/get-batch-types")
      .then((response) => {
        setBatchTypes(response.data.data);
        console.log(response.data.data);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
  };

  const handleGetTags = () => {
    axios
      .get("http://localhost:5000/tags/get-tags")
      .then((response) => {
        setTags(response.data.data);
        console.log(response.data.data);
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
      .post("http://localhost:5000/tags/get-tag", { uid: tag.uid })
      .then((response) => {
        if (!response.data.data) {
          setShowCreateTag(true);
          setTag(null);
        } else {
          setShowCreateTag(false);
          setTag(response.data.data);
        }
      })
      .catch((error) => {
        if (error.response) {
          setDetails(error.response.data.details);
        } else {
          setDetails("Error de red o del servidor");
        }
        setVariant("danger");
        setShowDetails(true);
      });
  };

  const handleSelectBatchType = (e) => {
    setBatchTypeId(e.target.value);
    const selectedBatchType = batchTypes.find(
      (b) => String(b.batch_type_id) === e.target.value
    );
    if (selectedBatchType) {
      setProductId(selectedBatchType.product_id);
    } else {
      setProductId("");
    }
  };

  const filteredBatchTypes = useMemo(() => {
    if (!productId) return [];
    return batchTypes.filter((b) => String(b.product_id) === String(productId));
  }, [batchTypes, productId]);

  useEffect(() => {
    if (
      !filteredBatchTypes.some(
        (b) => String(b.batch_type_id) === String(batchTypeId)
      )
    ) {
      setBatchTypeId("");
    }
  }, [filteredBatchTypes, batchTypeId]);

  useEffect(() => {
    handleGetTags();
    handleBatchTypes();
    handleGetProducts();
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
          <WriterWidget tag={tag} onScan={handleTagScan} />

          <Col lg={8}>
            <Card className="shadow-lg border-light">
              <Card.Header
                as="h5"
                className="bg-light d-flex justify-content-between align-items-center"
              >
                Etiquetas
                <Button bg="dark" onClick={() => setShowCreateTag(true)}>
                  Nueva Etiqueta
                </Button>
              </Card.Header>
              <Card.Body>
                <Table responsive hover className="inventory-table">
                  <thead className="table-dark">
                    <tr>
                      <th>UID</th>
                      <th>Producto</th>
                      <th>Cantidad</th>

                      <th>Fecha de Creacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tags.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No hay etiquetas registradas.
                        </td>
                      </tr>
                    ) : (
                      tags.map((item) => (
                        <tr
                          key={item.uid}
                          className={
                            scanState.tag?.uid === item.uid
                              ? "highlight-row"
                              : ""
                          }
                        >
                          <td>
                            <Badge bg="secondary">{item.uid}</Badge>
                          </td>

                          <td>
                            {products.find(
                              (p) =>
                                String(p.product_id) === String(item.product_id)
                            )?.product_name ?? "—"}
                          </td>
                          <td>
                            {item.product_quantity}
                          </td>
                          <td>
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showCreateTag}
        onHide={() => setShowCreateTag(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nueva Etiqueta</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>UID:</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="format_name"
                placeholder=""
                required
                maxLength={100}
                onChange={(e) => setUid(e.target.value)}
                value={uid}
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
                <strong>Cantidad:</strong>
              </Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                placeholder=""
                required
                minLength={1}
                onChange={(e) => setQuantity(e.target.value)}
                value={quantity}
              />
            </Form.Group>

            {productId && (
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Tipo de Lote:</strong>
                </Form.Label>
                <Form.Select
                  name="category_id"
                  required
                  onChange={handleSelectBatchType}
                  value={batchTypeId}
                >
                  <option value="">Seleccione tipo de lote</option>
                  {filteredBatchTypes.map((b) => (
                    <option key={b.batch_tpe_id} value={b.batch_type_id}>
                      {b.batch_type_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <div className="d-flex justify-content-end mt-3">
              <Button onClick={handleCreateTag} variant="success">
                Crear Etiqueta
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

export default Tags;
