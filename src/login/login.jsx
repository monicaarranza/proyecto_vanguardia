// Login.jsx
import React, { useState, useMemo } from "react";
import {
  Form,
  Button,
  Card,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  Eye,
  EyeSlash,
  BoxArrowInRight,
  ShieldLock,
} from "react-bootstrap-icons";
import "./login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login({
  onSubmit,
  title = "Iniciar Sesion",
  subtitle = "Accede a tu cuenta",
  disabled = false,
}) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);

  const API = process.env.REACT_APP_API_URL;

  console.log(API);


  const navigate = useNavigate();

  const canSubmit = useMemo(() => {
    return (
      user.trim().length > 3 && password.length >= 4 && !loading && !disabled
    );
  }, [user, password, loading, disabled]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    axios
      .post(`${API}/users/login`, { username: user, password: password })
      .then((response) => {
        localStorage.setItem('accessToken', response.data.data);
        navigate('/home');
      })
      .catch((error) => {
        setError(error.response.data.details);    
      })
      .then(() => {
        setLoading(false);
      });

  };

  return (
    <div className="login-wrap d-flex align-items-center justify-content-center py-5">
      <Card className="login-card shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center gap-2 mb-2">
            <h4 className="mb-0">{title}</h4>
          </div>
          <p className="text-muted small mb-4">{subtitle}</p>

          {error && (
            <Alert variant="danger" className="py-2 small">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="User">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="user"
                placeholder="Usuario"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
                autoComplete="username"
                disabled={loading || disabled}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Contrasena</Form.Label>
              <InputGroup>
                <Form.Control
                  type={show ? "text" : "password"}
                  placeholder="Contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  autoComplete="current-password"
                  disabled={loading || disabled}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShow((v) => !v)}
                  disabled={loading || disabled}
                >
                  {show ? <EyeSlash /> : <Eye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              type="submit"
              variant="primary"
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesion</span>
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
