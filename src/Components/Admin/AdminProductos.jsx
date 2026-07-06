import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./AdminProductos.css";

// Definimos las rutas del servidor para la API y para la carpeta donde se guardan las fotos
const BASE_URL_SERVER = "https://3dprintbackend.infinityfreeapp.com/server";
const BASE_IMAGEN_URL = "https://3dprintbackend.infinityfreeapp.com/images/";
const AdminProductos = () => {
  // Hooks para la gestión de la URL (buscador y paginación)
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados para almacenar la lista de productos y el total para la paginación
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  
  // Estados para controlar el flujo del Modal (si editamos uno existente o creamos uno nuevo)
  const [editandoId, setEditandoId] = useState(null); 
  const [mostrarModal, setMostrarModal] = useState(false);

  // Estado para el input de búsqueda con el valor inicial de la URL si existe
  const [textoBusqueda, setTextoBusqueda] = useState(searchParams.get("search") || "");

  // Estado objeto para el formulario: inicializamos con valores por defecto
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    categoria: "",
    subcategoria: "",
    sku: "",
    descripcion: "",
    precio: "",
    stock: 0,
    color_hex: "#333333",
    disponible: 1 
  });
  
  // Estado aparte para el archivo de imagen (no puede ir como texto en el objeto anterior)
  const [archivoImagen, setArchivoImagen] = useState(null);

  // Variables calculadas a partir de la URL
  const pagina = Number(searchParams.get("page")) || 1;
  const busquedaReal = searchParams.get("search") || "";
  const limit = 10;

  // Efecto Debounce para que la búsqueda en la URL no se actualice a lo loco mientras escribimos
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams({ search: textoBusqueda, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [textoBusqueda, setSearchParams]);

  // Función principal para traer los productos filtrados y paginados desde el PHP
  const fetchProductos = async () => {
    try {
      setCargando(true);
      // Construimos la URL con los parámetros necesarios para que el backend sepa qué devolver
      const url = `${BASE_URL_SERVER}/get_product.php?page=${pagina}&limit=${limit}&q=${encodeURIComponent(busquedaReal)}&admin=true`;
      const response = await fetch(url);
      const data = await response.json();
      setProductos(data.productos || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error cargando inventario:", err);
    } finally {
      setCargando(false);
    }
  };

  // Recargamos la tabla cada vez que cambie la página o el término de búsqueda real
  useEffect(() => {
    fetchProductos();
  }, [pagina, busquedaReal]);

  // Función para enviar los datos (Crear o Editar)
  const guardarProducto = async (e) => {
    e.preventDefault();
    
    // IMPORTANTE: Al enviar archivos (imágenes), necesitamos usar FormData obligatoriamente
    const formData = new FormData();
    
    // Metemos todos los campos del producto en el FormData
    Object.keys(nuevoProducto).forEach(key => {
      formData.append(key, nuevoProducto[key]);
    });

    // Si el usuario ha seleccionado una foto nueva, la añadimos al envío
    if (archivoImagen) formData.append("imagen", archivoImagen);
    
    // Si hay un ID guardado, el servidor sabrá que tiene que hacer un UPDATE en lugar de un INSERT
    if (editandoId) formData.append("id", editandoId);

    const endpoint = editandoId ? "update_product.php" : "add_producto.php";

    try {
      const response = await fetch(`${BASE_URL_SERVER}/${endpoint}`, {
        method: "POST",
        body: formData, // Enviamos el FormData directamente
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("✅ " + data.mensaje);
        cerrarYLimpiarModal();
        fetchProductos(); // Refrescamos la tabla para ver el nuevo producto o el cambio
      } else {
        alert("❌ Error: " + data.mensaje);
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
    }
  };

  // Reseteamos todos los estados del formulario para que al abrirlo de nuevo esté vacío
  const cerrarYLimpiarModal = () => {
    setMostrarModal(false);
    setEditandoId(null);
    setNuevoProducto({
      nombre: "", categoria: "", subcategoria: "", sku: "",
      descripcion: "", precio: "", stock: 0, color_hex: "#333333", disponible: 1
    });
    setArchivoImagen(null);
  };

  // Función para borrar un producto por ID
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
    try {
      const response = await fetch(`${BASE_URL_SERVER}/delete_product.php?id=${id}`, { method: "POST" });
      const data = await response.json();
      if (data.status === "success") {
        // Actualizamos la lista localmente eliminando el producto de la vista actual
        setProductos((prev) => prev.filter((p) => p.id !== id));
        alert("✅ Producto eliminado correctamente");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Rellenamos el formulario con los datos del producto seleccionado para editar
  const prepararEdicion = (producto) => {
    setEditandoId(producto.id);
    setNuevoProducto({
      nombre: producto.nombre,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria || "",
      sku: producto.sku,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      stock: producto.stock,
      color_hex: producto.color_hex || "#333333",
      disponible: Number(producto.disponible) // Casteo a número para que el <select> funcione bien
    });
    setMostrarModal(true);
  };

  return (
    <div className="admin-clientes-container">
      <h2>Gestión de Inventario</h2>

      {/* Toolbar con buscador y botón de añadir */}
      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
          />
        </div>
        <button className="btn-add-product" onClick={() => setMostrarModal(true)}>
          + Nuevo Producto
        </button>
      </div>

      {/* Tabla de visualización de productos */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Producto</th>
              <th>SKU</th>
              <th>Stock / Estado</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className={Number(p.disponible) === 0 ? "row-hidden" : ""}>
                <td>
                  <img 
                    src={p.imagen_url ? `${BASE_IMAGEN_URL}${p.imagen_url}` : `${BASE_IMAGEN_URL}default.jpg`} 
                    className="admin-prod-img" 
                    alt={p.nombre} 
                  />
                </td>
                <td>
                  <div className="cliente-name-cell">
                    <span className="txt-main">{p.nombre}</span>
                    <span className="txt-sub">{p.categoria}</span>
                  </div>
                </td>
                <td className="txt-id">{p.sku}</td>
                <td>
                  <div className="status-cell">
                    {/* Resaltamos el stock si quedan menos de 5 unidades */}
                    <span className={`stock-badge ${Number(p.stock) < 5 ? 'low' : ''}`}>
                       {p.stock} unidades
                    </span>
                    <span className={Number(p.disponible) === 1 ? 'status-on' : 'status-off'}>
                      {Number(p.disponible) === 1 ? '● Público' : '● Oculto'}
                    </span>
                  </div>
                </td>
                <td className="txt-main">{p.precio}€</td>
                <td>
                  <div className="actions-cell">
                    <button className="btn-edit-list" onClick={() => prepararEdicion(p)}>✏️</button>
                    <button className="btn-delete-list" onClick={() => eliminarProducto(p.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal dinámico para crear o editar productos */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
                <h3>{editandoId ? "Editar Producto" : "Nuevo Producto"}</h3>
                <button className="btn-close-x" onClick={cerrarYLimpiarModal}>&times;</button>
            </div>
            
            <form onSubmit={guardarProducto} className="admin-form">
              <div className="form-section">
                <h4>Detalles Básicos</h4>
                <div className="form-row">
                    <div className="input-group">
                        <label>Nombre del Producto</label>
                        <input type="text" placeholder="Ej: Filamento PLA" required 
                        value={nuevoProducto.nombre}
                        onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>SKU / Referencia</label>
                        <input type="text" placeholder="Código único" required 
                        value={nuevoProducto.sku}
                        onChange={e => setNuevoProducto({...nuevoProducto, sku: e.target.value})} />
                    </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Categoría e Inventario</h4>
                <div className="form-row">
                    <div className="input-group">
                        <label>Categoría</label>
                        <select required value={nuevoProducto.categoria}
                        onChange={e => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}>
                            <option value="">Seleccionar...</option>
                            <option value="Filamentos">Filamentos</option>
                            <option value="Resinas">Resinas</option>
                            <option value="Impresoras">Impresoras</option>
                            <option value="Herramientas">Herramientas</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Precio (€)</label>
                        <input type="number" step="0.01" required value={nuevoProducto.precio}
                        onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>Stock Actual</label>
                        <input type="number" required value={nuevoProducto.stock}
                        onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} />
                    </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Descripción y Multimedia</h4>
                <div className="input-group full-width">
                    <label>Descripción del Producto</label>
                    <textarea rows="4" placeholder="Detalles técnicos..." 
                        value={nuevoProducto.descripcion}
                        onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}
                    ></textarea>
                </div>
                <div className="form-row" style={{marginTop: '15px'}}>
                    <div className="input-group">
                        <label>Imagen del Producto</label>
                        <input type="file" accept="image/*" onChange={e => setArchivoImagen(e.target.files[0])} />
                    </div>
                    <div className="input-group">
                      <label>Estado de Visibilidad</label>
                      <select 
                        value={nuevoProducto.disponible} 
                        onChange={e => setNuevoProducto({...nuevoProducto, disponible: parseInt(e.target.value)})}
                      >
                        <option value={1}>✅ Público (Visible en tienda)</option>
                        <option value={0}>🚫 Oculto (Solo admin)</option>
                      </select>
                    </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={cerrarYLimpiarModal}>Cancelar</button>
                <button type="submit" className="btn-save">
                  {editandoId ? "Actualizar Inventario" : "Publicar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductos;