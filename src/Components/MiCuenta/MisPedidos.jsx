import React, { useEffect, useState, useContext } from 'react';
import { CarritoContext } from '../CarritoContext/CarritoContext';
import { Link, useNavigate } from 'react-router-dom';
import './MisPedidos.css';

/**
 * MisPedidos Component
 * Renderiza el historial de compras del usuario autenticado.
 * Implementa seguridad a nivel de cliente y manejo de estados asíncronos.
 */
const MisPedidos = () => {
    // 1. CONSUMO DEL CONTEXTO: 
    // Identificamos al usuario para filtrar sus pedidos en el servidor.
    const { usuario } = useContext(CarritoContext);
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    /**
     * EFECTO DE CARGA:
     * Se activa al montar el componente o si el usuario cambia.
     */
    useEffect(() => {
        // SEGURIDAD: Si un usuario intenta entrar por URL sin estar logueado, 
        // lo redirigimos automáticamente a la pantalla de acceso.
        if (!usuario) {
            navigate('/micuenta');
            return;
        }

        const fetchPedidos = async () => {
            try {
                // FETCH DINÁMICO: Enviamos el usuario.id como Query Parameter.
                const response = await fetch(`http://localhost/3dprint/server/get_pedidos_usuario.php?usuario_id=${usuario.id}`);
                const result = await response.json();

                if (result.status === "success") {
                    setPedidos(result.data); // Seteamos el array de pedidos recibido de MySQL
                } else {
                    console.error("Error al obtener pedidos:", result.mensaje);
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            } finally {
                setCargando(false); // Detenemos el spinner/mensaje de carga
            }
        };

        fetchPedidos();
    }, [usuario, navigate]);

    // UI de estado de carga (UX esencial para evitar pantallas en blanco)
    if (cargando) {
        return <div className="mis-pedidos-container"><p>Cargando tu historial...</p></div>;
    }

    return (
        <div className="mis-pedidos-container">
            <div className="pedidos-header">
                <button className="btn-volver" onClick={() => navigate('/micuenta')}>
                    ← Volver a Mi Perfil
                </button>
                <h2>Mis Pedidos</h2>
                <p>Consulta el estado y detalle de tus compras.</p>
            </div>

            {/* RENDERIZADO CONDICIONAL: 
                Si el array está vacío, mostramos un Call-to-Action (CTA) hacia la tienda.
            */}
            {pedidos.length === 0 ? (
                <div className="no-pedidos-box">
                    <p>Todavía no has realizado ninguna compra en 3DPrint.</p>
                    <Link to="/" className="btn-tienda">Ir a la tienda</Link>
                </div>
            ) : (
                <div className="tabla-pedidos-container">
                    <table className="tabla-pedidos">
                        <thead>
                            <tr>
                                <th>Nº Pedido</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id}>
                                    <td className="pedido-id">#{pedido.id}</td>
                                    {/* Formateo de fecha de MySQL a formato local español */}
                                    <td>{new Date(pedido.fecha).toLocaleDateString()}</td>
                                    {/* Formateo de moneda con dos decimales */}
                                    <td className="pedido-total">{pedido.total.toFixed(2)}€</td>
                                    <td>
                                        {/* Badge dinámico: el CSS aplicará colores según el string (completado, pendiente...) */}
                                        <span className={`estado-badge ${pedido.estado.toLowerCase()}`}>
                                            {pedido.estado}
                                        </span>
                                    </td>
                                    <td>
                                        {/* Navegación a la vista de detalle individual */}
                                        <Link to={`/pedido/${pedido.id}`} className="btn-detalle">
                                            Ver Detalles
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MisPedidos;