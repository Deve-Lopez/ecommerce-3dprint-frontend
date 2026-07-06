import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./AdminClientes.css";

// URL base para las peticiones a los endpoints PHP del servidor
const BASE_URL_SERVER = "https://3dprintbackend.infinityfreeapp.com/server";

const AdminClientes = () => {
  // Hooks para gestionar los parámetros de búsqueda en la URL
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados para almacenar los datos que vienen de la base de datos
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para controlar la ventana modal y el objeto que estamos editando
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  // Estado local para el input de búsqueda (para que la escritura sea fluida)
  const [textoBusqueda, setTextoBusqueda] = useState(searchParams.get("search") || "");
  
  // Recuperamos la sesión actual del localStorage para validar acciones sobre nuestra propia cuenta
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || {};
  
  // Variable que extrae el término de búsqueda real de la URL
  const busquedaReal = searchParams.get("search") || "";

  // Efecto para implementar Debounce: evita saturar el servidor con peticiones en cada pulsación de tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams({ search: textoBusqueda });
    }, 300); // Esperamos 300ms antes de actualizar la URL
    return () => clearTimeout(timer); // Limpiamos el temporizador si el componente se desmonta o el texto cambia
  }, [textoBusqueda, setSearchParams]);

  // Función asíncrona para obtener datos de usuarios y roles mediante fetch
  const fetchData = async () => {
    try {
      setCargando(true);
      // Ejecutamos ambas peticiones en paralelo para optimizar el tiempo de carga
      const [resUsers, resRoles] = await Promise.all([
        fetch(`${BASE_URL_SERVER}/get_clientes.php?q=${encodeURIComponent(busquedaReal)}`),
        fetch(`${BASE_URL_SERVER}/get_roles.php`)
      ]);
      
      const dataU = await resUsers.json();
      const dataR = await resRoles.json();
      
      // Si el backend responde correctamente, actualizamos los estados correspondientes
      if (dataU.status === "success") setUsuarios(dataU.data);
      if (dataR.status === "success") setRoles(dataR.data);
    } catch (err) {
      console.error("Error en la carga de datos:", err);
    } finally {
      setCargando(false);
    }
  };

  // Hook que dispara la carga de datos cada vez que cambia el parámetro de búsqueda en la URL
  useEffect(() => {
    fetchData();
  }, [busquedaReal]);

  // Función para preparar el estado antes de abrir el modal de edición
  const abrirEdicion = (u) => {
    // Convertimos el valor 'activo' a número para que los select lo reconozcan correctamente
    setClienteEditando({ ...u, activo: Number(u.activo) });
    setMostrarModal(true);
  };

  // Controlador del envío del formulario (envía los datos al script PHP de update)
  const guardarCambios = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Mapeamos el objeto de edición a FormData para enviarlo por POST
    Object.keys(clienteEditando).forEach(key => {
      formData.append(key, clienteEditando[key]);
    });

    try {
      const response = await fetch(`${BASE_URL_SERVER}/update_client.php`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.status === "success") {
        alert("✅ Usuario actualizado correctamente");
        setMostrarModal(false);
        fetchData(); // Refrescamos la lista para mostrar los datos actualizados
      } else {
        alert("❌ Error: " + data.mensaje);
      }
    } catch (error) {
      console.error("Error al procesar la actualización:", error);
    }
  };

  // Función para gestionar el borrado lógico o físico del cliente
  const eliminarCliente = async (id) => {
    if (!window.confirm("¿Confirmas que deseas eliminar este registro?")) return;
    
    try {
      const response = await fetch(`${BASE_URL_SERVER}/delete_client.php?id=${id}`, { method: "POST" });
      const data = await response.json();
      
      if (data.status === "success") {
        fetchData(); // Recargamos la tabla tras el borrado
        alert("✅ Usuario eliminado con éxito");
      }
    } catch (error) {
      console.error("Error al intentar borrar el registro:", error);
    }
  };

  return (
    <div className="admin-clientes-container">
      <h2>Administración de Clientes</h2>

      {/* Toolbar: Contenedor para herramientas de filtrado y estadísticas */}
      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre, email, ciudad o teléfono..." 
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
          />
        </div>
        <div className="admin-stats-badge">
            Total: <strong>{usuarios.length}</strong> Usuarios
        </div>
      </div>

      {/* Tabla principal de gestión de usuarios */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{width: '50px'}}>ID</th>
              <th>Nombre Completo</th>
              <th>Contacto</th>
              <th>Localización</th>
              <th>C.P.</th>
              <th>Rol Acceso</th>
              <th>Estado</th>
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              /* Resaltamos la fila si corresponde al usuario que tiene la sesión iniciada */
              <tr key={u.id} className={u.id === usuarioLogueado.id ? "row-self" : ""}>
                <td className="txt-id">#{u.id}</td>
                <td>
                  <div className="info-cell">
                    <span className="txt-main">
                        {u.nombre} {u.apellido} {u.id === usuarioLogueado.id && <strong className="self-tag">(Tú)</strong>}
                    </span>
                    <span className="txt-sub">Usuario registrado</span>
                  </div>
                </td>
                <td>
                  <div className="info-cell">
                    <span className="txt-main-small">{u.email}</span>
                    <span className="txt-sub">{u.telefono || 'Sin teléfono'}</span>
                  </div>
                </td>
                <td>
                  <div className="info-cell">
                    <span className="txt-main">{u.ciudad || '---'}</span>
                    <span className="txt-sub-truncate" title={u.direccion}>{u.direccion || 'No definida'}</span>
                  </div>
                </td>
                <td className="txt-bold-grey">{u.codigo_postal || '---'}</td>
                <td>
                  <span className="role-tag">
                    {/* Buscamos el nombre del rol en el array de roles según el rol_id del usuario */}
                    {roles.find(r => r.id == u.rol_id)?.nombre || 'Cliente'}
                  </span>
                </td>
                <td>
                  <span className={Number(u.activo) === 1 ? 'status-on' : 'status-off'}>
                    {Number(u.activo) === 1 ? '● Activo' : '● Bloqueado'}
                  </span>
                </td>
                <td>
                  <div className="actions-cell-end">
                    <button className="btn-edit-list" onClick={() => abrirEdicion(u)}>✏️</button>
                    {/* Restricción de seguridad: no se puede eliminar el usuario actual */}
                    {u.id !== usuarioLogueado.id && (
                      <button className="btn-delete-list" onClick={() => eliminarCliente(u.id)}>🗑️</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Renderizado condicional del modal de edición */}
      {mostrarModal && clienteEditando && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
                <h3>Ficha Técnica del Usuario {clienteEditando.id === usuarioLogueado.id && "(Mi Perfil)"}</h3>
                <button className="btn-close-x" onClick={() => setMostrarModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={guardarCambios} className="admin-form">
              <div className="form-section">
                <h4>🔑 Información de Cuenta</h4>
                <div className="form-row">
                    <div className="input-group">
                        <label>Nombre</label>
                        <input type="text" required value={clienteEditando.nombre}
                        onChange={e => setClienteEditando({...clienteEditando, nombre: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>Apellido</label>
                        <input type="text" required value={clienteEditando.apellido}
                        onChange={e => setClienteEditando({...clienteEditando, apellido: e.target.value})} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="input-group">
                        <label>Email Corporativo</label>
                        <input type="email" required value={clienteEditando.email}
                        onChange={e => setClienteEditando({...clienteEditando, email: e.target.value})} />
                    </div>
                </div>
              </div>

              {/* Ajustes de permisos y roles del sistema */}
              <div className="form-section">
                <h4>🛡️ Seguridad y Permisos</h4>
                <div className="form-row">
                    <div className="input-group">
                        <label>Asignar Rol</label>
                        <select 
                            value={clienteEditando.rol_id}
                            /* Validación en el cliente: un admin no puede quitarse permisos a sí mismo */
                            disabled={clienteEditando.id === usuarioLogueado.id}
                            className={clienteEditando.id === usuarioLogueado.id ? "input-disabled" : ""}
                            onChange={e => setClienteEditando({...clienteEditando, rol_id: e.target.value})}
                        >
                            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                        </select>
                        {clienteEditando.id === usuarioLogueado.id && 
                            <small className="msg-seguridad">* No puedes modificar tu rango jerárquico.</small>
                        }
                    </div>
                    <div className="input-group">
                      <label>Estado de Acceso</label>
                      <select 
                        value={clienteEditando.activo} 
                        /* Evita que el usuario logueado bloquee su propio acceso al sistema */
                        disabled={clienteEditando.id === usuarioLogueado.id}
                        className={clienteEditando.id === usuarioLogueado.id ? "input-disabled" : ""}
                        onChange={e => setClienteEditando({...clienteEditando, activo: parseInt(e.target.value)})}
                      >
                        <option value={1}>✅ Activo (Con acceso)</option>
                        <option value={0}>🚫 Bloqueado (Sin acceso)</option>
                      </select>
                      {clienteEditando.id === usuarioLogueado.id && 
                            <small className="msg-seguridad">* No puedes auto-bloquearte.</small>
                      }
                    </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Actualizar Ficha</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientes;