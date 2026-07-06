import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PedidoDetalle.css';

/**
 * URL base para recursos estáticos.
 * Vincula la base de datos con la carpeta física de imágenes en el servidor.
 */
const BASE_IMAGEN_URL = "https://3dprintbackend.infinityfreeapp.com/images/";

const PedidoDetalle = () => {
    /* HOOKS DE NAVEGACIÓN Y PARÁMETROS */
    const { id } = useParams(); // Capta el ID dinámico de la URL (ej: /pedido/24)
    const navigate = useNavigate();

    /* ESTADOS DE DATOS Y UI */
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        /**
         * FETCH DEL DETALLE (JOIN de Pedidos y Productos en el Backend)
         * Recupera todas las líneas de pedido asociadas al ID actual.
         */
        const fetchDetalle = async () => {
            try {
                const response = await fetch(`https://3dprintbackend.infinityfreeapp.com/server/get_detalle_pedido.php?pedido_id=${id}`);
                
                if (!response.ok) throw new Error("Error en la respuesta del servidor");
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    setProductos(result.data);
                } else {
                    setError(result.mensaje);
                }
            } catch (err) {
                console.error("Error al cargar detalle:", err);
                setError("No se pudo conectar con el servidor.");
            } finally {
                setCargando(false);
            }
        };

        if (id) fetchDetalle();
    }, [id]);

    /**
     * LÓGICA DE CÁLCULO:
     * Recalculamos el total en el cliente como medida de verificación.
     */
    const calcularTotal = () => {
        return productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0).toFixed(2);
    };

    /* RENDERIZADO DE CARGA Y ERRORES */
    if (cargando) return <div className="detalle-container"><p className="loading-text">Cargando productos...</p></div>;
    
    if (error) return (
        <div className="detalle-container">
            <div className="error-box">
                <p>⚠️ {error}</p>
                <button className="btn-volver-atras" onClick={() => navigate('/mis-pedidos')}>Volver a Mis Pedidos</button>
            </div>
        </div>
    );

    return (
        <div className="detalle-container">
            <header className="detalle-header">
                <button className="btn-volver-atras" onClick={() => navigate('/mis-pedidos')}>
                    ← Volver a Mis Pedidos
                </button>
                <h2>Detalles del Pedido <span className="order-number">#{id}</span></h2>
            </header>

            <div className="productos-lista">
                {productos.length > 0 ? (
                    productos.map((prod, index) => (
                        <div key={index} className="producto-card">
                            <div className="img-wrapper">
                                <img 
                                    src={`${BASE_IMAGEN_URL}${prod.imagen}`} 
                                    alt={prod.nombre} 
                                    className="prod-img" 
                                    /* Gestión de errores en carga de imágenes (Fallback) */
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=3DPrint'; }}
                                />
                            </div>
                            
                            <div className="prod-info-principal">
                                <h3>{prod.nombre}</h3>
                                <div className="prod-meta-data">
                                    <p>Cantidad: <strong>{prod.cantidad}</strong> unidades</p>
                                    <p>Precio Unit.: <strong>{prod.precio.toFixed(2)}€</strong></p>
                                </div>
                            </div>

                            <div className="prod-subtotal-area">
                                <span className="label-subtotal">Subtotal</span>
                                <span className="subtotal-valor">
                                    {(prod.precio * prod.cantidad).toFixed(2)}€
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data">No hay productos registrados para este pedido.</div>
                )}
            </div>

            <footer className="detalle-footer">
                <div className="total-box">
                    <span className="total-label">TOTAL ABONADO</span>
                    <span className="total-monto">{calcularTotal()}€</span>
                </div>
            </footer>
        </div>
    );
};

export default PedidoDetalle;