import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminMensajes.css';

// URL del servidor donde tenemos los scripts PHP para la base de datos
const BASE_URL_SERVER = "https://3dprintbackend.infinityfreeapp.com/server";

const AdminMensajes = () => {
    const navigate = useNavigate();
    // Definimos los estados para la lista de mensajes, el buscador y el control de carga
    const [mensajes, setMensajes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);

    // Estado para controlar qué mensaje se muestra en la ventana modal al hacer clic en el ojo
    const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);

    // useEffect para disparar la carga de mensajes nada más entrar en el componente
    useEffect(() => {
        obtenerMensajes();
    }, []);

    // Función asíncrona que hace el fetch al endpoint PHP para traer los datos
    const obtenerMensajes = async () => {
        try {
            const response = await fetch(`${BASE_URL_SERVER}/get_mensajes.php`);
            const data = await response.json();
            setMensajes(data); // Guardamos el array de mensajes en el estado
        } catch (err) {
            console.error("Error al conectar con la API:", err);
        } finally {
            setCargando(false); // Quitamos el aviso de "cargando" pase lo que pase
        }
    };

    // Función para borrar mensajes enviando el ID mediante FormData por POST
    const eliminarMensaje = async (id) => {
        // Pedimos confirmación al usuario para evitar borrados accidentales
        if (!window.confirm("¿Estás seguro de que deseas eliminar este mensaje de forma permanente?")) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('id', id);

            const response = await fetch(`${BASE_URL_SERVER}/delete_mensaje.php`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === "success") {
                // Actualización optimista: filtramos el array local para que el cambio sea instantáneo en pantalla
                setMensajes(prev => prev.filter(m => m.id !== id));

                // Si justo tenemos abierto el modal del mensaje que acabamos de borrar, lo cerramos
                if (mensajeSeleccionado?.id === id) {
                    setMensajeSeleccionado(null);
                }

                alert("✅ Mensaje eliminado correctamente.");
            } else {
                alert("❌ Error: " + result.mensaje);
            }
        } catch (error) {
            console.error("Error en la petición de borrado:", error);
            alert("❌ Hubo un fallo al conectar con el servidor.");
        }
    };

    // Lógica de filtrado en tiempo real: comparamos el texto del buscador con nombre, asunto o email
    const mensajesFiltrados = mensajes.filter(m =>
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="admin-clientes-container">
            <button
                className="btn-back"
                onClick={() => navigate("/micuenta")}
            >
                ← Volver
            </button>
            <h2>📬 Bandeja de Consultas</h2>

            {/* Barra superior: Input de búsqueda y contador dinámico de resultados */}
            <div className="admin-toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar por remitente, asunto o email..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <div className="admin-stats-badge">
                    {mensajesFiltrados.length} mensajes en total
                </div>
            </div>

            {/* Estructura de tabla para mostrar los mensajes de forma organizada */}
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Remitente</th>
                            <th>Asunto</th>
                            <th>Vista Previa</th>
                            <th className="actions-cell-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Cargando mensajes...</td></tr>
                        ) : mensajesFiltrados.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>No hay mensajes que coincidan con la búsqueda.</td></tr>
                        ) : (
                            mensajesFiltrados.map((msg) => (
                                <tr key={msg.id}>
                                    <td>
                                        <div className="info-cell">
                                            {/* Formateamos la fecha de MySQL a formato legible en español */}
                                            <span className="txt-main-small">
                                                {new Date(msg.fecha_envio).toLocaleDateString()}
                                            </span>
                                            <span className="txt-sub">
                                                {new Date(msg.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="info-cell">
                                            <span className="txt-main">{msg.nombre}</span>
                                            <span className="txt-sub">{msg.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="role-tag">{msg.asunto}</span>
                                    </td>
                                    <td>
                                        <p className="txt-sub-truncate">{msg.mensaje}</p>
                                    </td>
                                    <td className="actions-cell-end">
                                        <button
                                            className="btn-edit-list"
                                            title="Ver detalle"
                                            onClick={() => setMensajeSeleccionado(msg)}
                                        >
                                            👁️
                                        </button>
                                        <button
                                            className="btn-delete-list"
                                            title="Eliminar mensaje"
                                            onClick={() => eliminarMensaje(msg.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal: Solo se renderiza si hay un mensaje seleccionado en el estado */}
            {mensajeSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Consulta: {mensajeSeleccionado.asunto}</h3>
                            <button className="btn-close-x" onClick={() => setMensajeSeleccionado(null)}>&times;</button>
                        </div>

                        <div className="form-section">
                            <h4>Datos de Contacto</h4>
                            <div className="form-row">
                                <div className="info-cell">
                                    <span className="txt-sub">Remitente</span>
                                    <span className="txt-main">{mensajeSeleccionado.nombre}</span>
                                </div>
                                <div className="info-cell">
                                    <span className="txt-sub">Teléfono</span>
                                    <span className="txt-main">{mensajeSeleccionado.telefono || 'No proporcionado'}</span>
                                </div>
                            </div>
                            <div className="form-row" style={{ marginTop: '10px' }}>
                                <div className="info-cell">
                                    <span className="txt-sub">Email</span>
                                    <span className="txt-main">{mensajeSeleccionado.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h4>Mensaje</h4>
                            {/* Mostramos el cuerpo del mensaje respetando los saltos de línea originales */}
                            <div style={{
                                padding: '15px',
                                background: '#fff',
                                border: '1px solid #D7CCC8',
                                borderRadius: '8px',
                                lineHeight: '1.6',
                                color: '#4A332D',
                                whiteSpace: 'pre-line',
                                minHeight: '100px'
                            }}>
                                {mensajeSeleccionado.mensaje}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setMensajeSeleccionado(null)}>
                                Cerrar
                            </button>
                            {/* Enlace de tipo mailto para abrir el gestor de correo con el asunto ya puesto */}
                            <a
                                href={`mailto:${mensajeSeleccionado.email}?subject=RE: ${mensajeSeleccionado.asunto}`}
                                className="btn-save"
                                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                📧 Responder por Email
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMensajes;