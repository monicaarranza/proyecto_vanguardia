// AppNavbar.jsx
import React from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { BsBoxSeam, BsPersonCircle } from "react-icons/bs";

export default function AppNavbar({
  brandHref = "/",
  brandLeft = <> <strong>Inventario</strong>Pro </>,
  user = null,              // { name, email, avatarUrl }
  onLogout = () => {},      // callback de logout
}) {
  const title = (
    <span className="d-inline-flex align-items-center gap-2">
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user?.name || "Cuenta"}
          width={24}
          height={24}
          className="rounded-circle"
        />
      ) : (
        <BsPersonCircle size={20} />
      )}
      <span className="d-none d-sm-inline">{user?.name || "Cuenta"}</span>
    </span>
  );

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand href={brandHref} className="d-inline-flex align-items-center">
          <BsBoxSeam size={24} className="me-2" />
          {brandLeft}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav" className="justify-content-end">
          {/* Si quieres links a secciones, ponlos aquí */}
          <Nav className="me-auto">
            {/* <Nav.Link href="/dashboard">Dashboard</Nav.Link> */}
          </Nav>

          <Nav>
            <NavDropdown
              align="end"
              title={title}
              id="user-dropdown"
              menuVariant="dark"
            >
              {user?.email && (
                <NavDropdown.Header className="text-truncate" title={user.email}>
                  {user.email}
                </NavDropdown.Header>
              )}
              {/* <NavDropdown.Item href="/perfil">Perfil</NavDropdown.Item>
              <NavDropdown.Item href="/ajustes">Ajustes</NavDropdown.Item>
              <NavDropdown.Divider /> */}
              <NavDropdown.Item onClick={onLogout}>
                Cerrar sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
