import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Navbar, Table, Badge, InputGroup, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { BoxArrowInRight, BoxArrowUpRight, BoxSeam, Wifi } from 'react-bootstrap-icons';
import './App.css';


const initialInventory = [
    { id: 'SKU-001', name: 'Laptop Pro X', quantity: 25, category: 'Electrónica' },
    { id: 'SKU-002', name: 'Teclado Mecánico RGB', quantity: 40, category: 'Accesorios' },
    { id: 'SKU-003', name: 'Monitor Curvo 27"', quantity: 15, category: 'Monitores' },
    { id: 'SKU-004', name: 'Mouse Inalámbrico', quantity: 80, category: 'Accesorios' },
    { id: 'SKU-005', name: 'Webcam 4K', quantity: 30, category: 'Electrónica' },
];

function App() {
    const [inventory, setInventory] = useState(initialInventory);
    const [scanState, setScanState] = useState({ status: 'idle', product: null }); 
    const [operation, setOperation] = useState('entrada'); 
    const [showToast, setShowToast] = useState(false);
    const [toastInfo, setToastInfo] = useState({ message: '', variant: '' });

    const handleScan = () => {
        setScanState({ status: 'scanning', product: null });
        
        setTimeout(() => {
           
            const randomProduct = initialInventory[Math.floor(Math.random() * initialInventory.length)];
            setScanState({ status: 'scanned', product: randomProduct });
        }, 1500);
    };

    const handleConfirmMovement = (e) => {
        e.preventDefault();
        const quantity = parseInt(e.target.quantity.value);
        if (!quantity || quantity <= 0) return;

        const { product } = scanState;
        
        setInventory(currentInventory =>
            currentInventory.map(item => {
                if (item.id === product.id) {
                    const newQuantity = operation === 'entrada' ? item.quantity + quantity : item.quantity - quantity;
                    return { ...item, quantity: Math.max(0, newQuantity) }; // Evita cantidades negativas
                }
                return item;
            })
        );
        
        
        setToastInfo({
            message: `Movimiento confirmado: ${quantity} x ${product.name} (${operation})`,
            variant: operation === 'entrada' ? 'success' : 'warning',
        });
        setShowToast(true);

      
        setScanState({ status: 'idle', product: null });
    };

    const getStockBadge = (quantity) => {
        if (quantity > 50) return <Badge bg="success">Alto</Badge>;
        if (quantity > 10) return <Badge bg="warning">Medio</Badge>;
        return <Badge bg="danger">Bajo</Badge>;
    };

    return (
        <div className="inventory-system">
      
            <ToastContainer position="top-end" className="p-3">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={4000} autohide bg={toastInfo.variant}>
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
                       
                        <Card className="shadow-lg border-light mb-4 rfid-card">
                            <Card.Body>
                                <Card.Title className="d-flex align-items-center text-primary">
                                    <Wifi size={32} className="me-3" />
                                    Lector RFID
                                </Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">Simulador de Registro Automático</Card.Subtitle>
                                <hr />
                                
                                <Form.Group className="mb-3">
                                    <Form.Label><strong>1. Seleccione la Operación:</strong></Form.Label>
                                    <div>
                                        <Form.Check inline type="radio" id="op-entrada" label="Entrada" name="operation" value="entrada" checked={operation === 'entrada'} onChange={(e) => setOperation(e.target.value)} />
                                        <Form.Check inline type="radio" id="op-salida" label="Salida" name="operation" value="salida" checked={operation === 'salida'} onChange={(e) => setOperation(e.target.value)} />
                                    </div>
                                </Form.Group>

                                <div className="d-grid mb-3">
                                    <Button variant="primary" onClick={handleScan} disabled={scanState.status === 'scanning'}>
                                        {scanState.status === 'scanning' ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                <span className="ms-2">Escaneando...</span>
                                            </>
                                        ) : (
                                            '2. Iniciar Escaneo de Producto'
                                        )}
                                    </Button>
                                </div>

                                {scanState.status === 'scanned' && (
                                    <div className="scan-result p-3 bg-light rounded">
                                        <p className="mb-2"><strong>Producto Detectado:</strong></p>
                                        <h5 className="text-success">{scanState.product.name}</h5>
                                        <Form onSubmit={handleConfirmMovement}>
                                            <Form.Group>
                                                <Form.Label><strong>3. Ingrese la Cantidad:</strong></Form.Label>
                                                <InputGroup>
                                                     <Form.Control type="number" name="quantity" placeholder="Ej: 10" required min="1"/>
                                                     <Button type="submit" variant={operation === 'entrada' ? 'success' : 'warning'}>Confirmar</Button>
                                                </InputGroup>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                        
                        
                        <Card className="shadow-sm border-light action-card-manual">
                             <Card.Header className="d-flex align-items-center">
                                <BoxArrowInRight size={20} className="me-2 text-success" />
                                Registro Manual
                            </Card.Header>
                            
                        </Card>
                    </Col>

                    
                    <Col lg={8}>
                        <Card className="shadow-lg border-light">
                            <Card.Header as="h5" className="bg-light d-flex justify-content-between align-items-center">
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
                                        {inventory.map(item => (
                                            <tr key={item.id} className={scanState.product?.id === item.id ? 'highlight-row' : ''}>
                                                <td><Badge bg="secondary">{item.id}</Badge></td>
                                                <td><strong>{item.name}</strong></td>
                                                <td>{item.category}</td>
                                                <td className="text-center fs-5">{item.quantity}</td>
                                                <td className="text-center">{getStockBadge(item.quantity)}</td>
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