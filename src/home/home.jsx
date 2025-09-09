import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import AppNavbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const modules = [
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
    {
      key: "products",
      title: "Productos",
      desc: "Crear y editar productos.",
      to: "/products",
      icon: <Boxes size={28} />,
      accent: "accent-products",
    },
    {
      key: "tags",
      title: "Etiquetas",
      desc: "Registrar y enlazar etiquetas a productos.",
      to: "/tags",
      icon: <Tags size={28} />,
      accent: "accent-tags",
    },
  ];

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const decoded = jwtDecode(accessToken);
    setUser(decoded);
  }, []);

  return (
    <div className="inventory-system">
      <AppNavbar
        brandHref="/home"
        user={{ name: user?.name, email: "", avatarUrl: null }}
        onLogout={() => {
          localStorage.removeItem("accessToken");
          navigate("/");
        }}
      />

      <div className="home-header mb-4 p-2">
        <h1 className="mb-1">Dashboard</h1>
        <h5>{user?.location}</h5>
        <p className="text-muted mb-0">Accesso rapido a modulos</p>
      </div>

      <Row xs={1} sm={2} lg={4} className="g-3 home-grid p-2">
        {modules.map((m) => (
          <Col key={m.key}>
            <Card
              as={Link}
              to={m.to}
              className={`nav-card ${m.accent} shadow-sm`}
            >
              <Card.Body>
                <div className="d-flex align-items-start justify-content-between">
                  <div className="icon-wrap">{m.icon}</div>
                  <div className="pill" />
                </div>
                <Card.Title className="mt-2 text-muted">{m.title}</Card.Title>
                <Card.Text className="text-muted small mb-3">
                  {m.desc}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
