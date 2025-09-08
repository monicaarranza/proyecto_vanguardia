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
import "./users.css";
import axios from "axios";
import BannerFeedback from "../components/BannerFeedback";

function Users() {
  const [scanState, setScanState] = useState({ status: "idle", product: null });
  const [operation, setOperation] = useState("entrada");
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: "", variant: "" });
  const [scanType, setScanType] = useState();

  const [locations, setLocations] = useState([]);

  const [users, setUsers] = useState([]);

  const [showCreateProduct, setShowCreateProduct] = useState(false);

  //new product data
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [retypedPassword, setRetypedPassword] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState(1);

  const roles = ["ADMIN", "OPERATOR"];

  //scanned tag data
  const [last, setLast] = useState(null);

  //feedback
  const [details, setDetails] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [success, setSuccess] = useState(false);
  const [variant, setVariant] = useState("danger");

  const handleGetLocations = () => {
    axios
      .get("${process.env.REACT_APP_API_URL}/locations/get-locations")
      .then((response) => {
        console.log(response.data.data);
        setLocations(response.data.data);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
  };

  const handleGetUsers = () => {
    axios
      .get("${process.env.REACT_APP_API_URL}/users/get-users")
      .then((response) => {
        console.log(response.data.data);
        setUsers(response.data.data);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
  };

  const handleCreateUser= () => {
    const newUser = {
      first_name: name,
      lastname: lastname,
      username: username,
      password: password,
      retyped_password: retypedPassword,
      user_role: role,
      location_id: location,
    };

    axios
      .post("${process.env.REACT_APP_API_URL}/users/create-user", { newUser: newUser })
      .then((response) => {
        setDetails(response.data.details);
        setVariant("success");
        setShowDetails(true);
        handleGetUsers();
        setShowCreateProduct(false);
      })
      .catch((error) => {
        setDetails(error.response.data.details);
        setVariant("danger");
        setShowDetails(true);
      });
  };

  useEffect(() => {
    handleGetUsers();
    handleGetLocations();
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
                Usuarios
                <Button bg="dark" onClick={() => setShowCreateProduct(true)}>
                  Nuevo Usuario
                </Button>
              </Card.Header>
              <Card.Body>
                <Table responsive hover className="inventory-table">
                  <thead className="table-dark">
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Ubicacion</th>
                      <th>Fecha de Creacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr
                        key={item.user_id}
                        className={
                          scanState.user?.user_id === item.user_id
                            ? "highlight-row"
                            : ""
                        }
                      >
                        <td>
                          <medium>{item.name}</medium>
                        </td>
                        <td>
                          <medium>{item.lastname}</medium>
                        </td>
                        <td>
                          <medium>{item.username}</medium>
                        </td>
                        <td>
                          <medium>{item.user_role}</medium>
                        </td>
                        <td>
                          {locations.find(
                            (l) =>
                              String(l.location_id) ===
                              String(item.location_id)
                          )?.location_name ?? "—"}
                        </td>
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

      <Modal
        show={showCreateProduct}
        onHide={() => setShowCreateProduct(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Usuario</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Nombre:</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Nombre"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Apellido:</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                placeholder="Apellido"
                required
                maxLength={100}
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Usuario:</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Usuario"
                required
                maxLength={100}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Contrasena:</strong>
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Contrasena"
                required
                maxLength={100}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Confirmar Contrasena:</strong>
              </Form.Label>
              <Form.Control
                type="password"
                name="retyped_password"
                placeholder="Confirmar Contrasena"
                required
                maxLength={100}
                value={retypedPassword}
                onChange={(e) => setRetypedPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Rol:</strong>
              </Form.Label>
              <Form.Select
                name="role"
                required
                onChange={(e) => setRole(e.target.value)}
                value={role}
              >
                <option value="">Seleccione rol</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Ubicacion:</strong>
              </Form.Label>
              <Form.Select
                name="location"
                required
                onChange={(e) => setLocation(e.target.value)}
                value={location}
              >
                <option value="">Seleccione ubicacion</option>
                {locations.map((p) => (
                  <option key={p.location_id} value={p.location_id}>
                    {p.location_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button onClick={handleCreateUser} variant="success">
                Crear Usuario
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

export default Users;
