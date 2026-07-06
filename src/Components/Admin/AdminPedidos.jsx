import { useEffect, useState } from "react";
import "./AdminPedidos.css";

// Definimos la ruta base para conectar con el backend de XAMPP
const BASE_URL_SERVER = "http://localhost/3dprint/server";

const AdminPedidos = () => {
  // Estados para manejar los datos de los pedidos, posibles errores y el estado de carga
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Función asíncrona para obtener el historial completo de ventas desde la base de datos
  const fetchPedidos = async () => {
    try {
      const response = await fetch(`${BASE_URL_SERVER}/get_pedidos.php`);
      const result = await response.json();
      
      if (result.status === "success") {
        setPedidos(result.data); // Cargamos los pedidos en el estado si la respuesta es correcta
      } else {
        throw new Error(result.mensaje);
      }
    } catch (err) {
      setError("No se pudieron cargar los pedidos.");
    } finally {
      // Quitamos el spinner o mensaje de carga independientemente de si hubo error o no
      setCargando(false);
    }
  };

  // useEffect para ejecutar la carga de datos una sola vez al montar el componente
  useEffect(() => {
    fetchPedidos();
  }, []);

  // Función para cambiar el estado de un pedido (Pendiente, Enviado, etc.)
  const actualizarEstado = async (id, nuevoEstado) => {
    // Usamos FormData para empaquetar los datos y enviarlos por POST al PHP
    const formData = new FormData();
    formData.append("id", id);
    formData.append("estado", nuevoEstado);

    try {
      const response = await fetch(`${BASE_URL_SERVER}/update_order_status.php`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (data.status === "success") {
        /* Actualización optimista: mapeamos el array actual y solo cambiamos 
           el estado del pedido que coincide con el ID. Así evitamos recargar toda la página.
        */
        setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
      } else {
        alert("Error: " + data.mensaje);
      }
    } catch (err) {
      alert("Error de conexión al servidor.");
    }
  };

  // Renderizado condicional: si todavía está cargando o hay un error, mostramos un mensaje simple
  if (cargando) return <div className="admin-status">Cargando ventas...</div>;
  if (error) return <div className="admin-status error">{error}</div>;

  return (
    <div className="admin-clientes-container">
      <h2>Historial de Ventas</h2>
      
      {/* Contenedor responsive para que la tabla no se rompa en pantallas pequeñas */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente y Entrega</th>
              <th>Productos</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td className="txt-id">#{pedido.id}</td>
                {/* Formateamos la fecha que viene del servidor a un formato local legible */}
                <td>{new Date(pedido.fecha).toLocaleDateString()}</td>
                <td>
                  <div className="cliente-name-cell">
                    <span className="txt-main">{pedido.destinatario}</span>
                    <span className="txt-sub">{pedido.direccion}</span>
                    <span className="txt-sub">{pedido.cp}, {pedido.ciudad}</span>
                    <span className="txt-sub">{pedido.telefono}</span>
                  </div>
                </td>
                <td>
                  {/* Recorremos la lista de productos que vienen anidados en cada pedido */}
                  <div className="productos-resumen">
                    {pedido.productos.map((prod, i) => (
                      <div key={i} className="prod-linea">
                        {prod.cantidad}x {prod.nombre}
                      </div>
                    ))}
                  </div>
                </td>
                <td>
                  {/* Selector de estado: cambia de color dinámicamente mediante la clase CSS según su valor */}
                  <select 
                    className={`select-estado ${pedido.estado.toLowerCase()}`}
                    value={pedido.estado}
                    onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                  >
                    <option value="Pendiente">⏳ Pendiente</option>
                    <option value="Enviado">🚚 Enviado</option>
                    <option value="Completado">✅ Completado</option>
                    <option value="Cancelado">❌ Cancelado</option>
                  </select>
                </td>
                <td className="txt-main" style={{fontSize: '1.1rem'}}>
                  {pedido.total_pedido}€
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPedidos;