import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Navbar } from "react-bootstrap";
import {
  Boxes,
  Tags,
  Layers,
  ClipboardData,
  ArrowRightShort,
  BoxSeam,
} from "react-bootstrap-icons";
import "./home.css";

export default function Home() {
  const modules = [
    {
      key: "products",
      title: "Productos",
      desc: "Crear y editar productos.",
      to: "/products",
      icon: <Boxes size={28} />,
      accent: "accent-products",
    },
    {
      key: "batch-types",
      title: "Tipos de Empaquetado",
      desc: "Definir formatos de empaquetado de productos.",
      to: "/batch-types",
      icon: <Layers size={28} />,
      accent: "accent-batches",
    },
    {
      key: "tags",
      title: "Etiquetas",
      desc: "Registrar y enlazar etiquetas a productos.",
      to: "/tags",
      icon: <Tags size={28} />,
      accent: "accent-tags",
    },
    {
      key: "inventory",
      title: "Inventario",
      desc: "Movimientos, salidas/entradas, niveles de inventario.",
      to: "/inventory",
      icon: <ClipboardData size={28} />,
      accent: "accent-inventory",
    },
    {
      key: "items",
      title: "Items",
      desc: "Items del inventario.",
      to: "/items",
      icon: <BoxSeam size={28} />,
      accent: "accent-items",
    },
  ];

  return (
    <div className="inventory-system">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand href="#home">
            <BoxSeam size={24} className="me-2" />
            <strong>Inventario</strong>Pro
          </Navbar.Brand>
        </Container>
      </Navbar>
      <div className="home-header mb-4 p-2">
        <h1 className="mb-1">Dashboard</h1>
        <p className="text-muted mb-0">Accesso rapido a modulos</p>
      </div>

      <Row xs={1} sm={2} lg={4} className="g-3 home-grid p-2">
        {modules.map((m) => (
          <Col key={m.key}>
            <Card className={`nav-card ${m.accent} shadow-sm`}>
              <Card.Body>
                <div className="d-flex align-items-start justify-content-between">
                  <div className="icon-wrap">{m.icon}</div>
                  <div className="pill" />
                </div>
                <Card.Title className="mt-2 text-white">{m.title}</Card.Title>
                <Card.Text className="text-white small mb-3">
                  {m.desc}
                </Card.Text>
                <div className="d-flex justify-content-end">
                  <Button
                    as={Link}
                    to={m.to}
                    variant="primary"
                    size="sm"
                    className="go-btn"
                  >
                    Abrir <ArrowRightShort size={18} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
