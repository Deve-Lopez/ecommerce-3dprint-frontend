import { useEffect, useState, useContext } from "react";
import { CarritoContext } from "../CarritoContext/CarritoContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import "./ProductList.css";

/**
 * ProductList Component
 * Gestiona el catálogo dinámico, filtrado, búsqueda y paginación sincronizada con la URL.
 */
const ProductList = () => {
  // Hooks de React Router para manipulación de la barra de direcciones (Query Strings)
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Estados locales para la gestión de datos y UI
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({ categorias: [] });
  const [pagina, setPagina] = useState(1);
  const [orden, setOrden] = useState("Relevante");
  const [busqueda, setBusqueda] = useState("");
  const [total, setTotal] = useState(0);
  const limit = 15; // Cantidad de productos por página

  // Consumo del Contexto Global del Carrito
  const { addProduct, carrito } = useContext(CarritoContext);

  /**
   * EFECTO 1: Sincronización de la URL -> Estado de React
   * Lee la URL al cargar o cambiar y actualiza los estados locales.
   * Esto permite la navegación por historial (atrás/adelante).
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setPagina(Number(params.get("page")) || 1);
    setOrden(params.get("orden") || "Relevante");
    setBusqueda(params.get("search") || "");
    const cats = params.get("categorias");
    setFiltros({ categorias: cats ? cats.split(",") : [] });
  }, [location.search]);

  /**
   * EFECTO 2: Fetch de Datos al Servidor (PHP/MySQL)
   * Se dispara cada vez que cambian los parámetros de búsqueda o filtrado.
   */
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // Construcción dinámica de la Query String para el backend
        const catsQuery = filtros.categorias.length 
          ? `&categorias=${encodeURIComponent(filtros.categorias.join(","))}` 
          : "";
        const searchQuery = busqueda ? `&q=${encodeURIComponent(busqueda)}` : "";
        const url = `http://localhost/3dprint/server/get_product.php?page=${pagina}&limit=${limit}${catsQuery}&orden=${orden}${searchQuery}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Fallo en el servidor");
        const data = await response.json();

        setProductos(data.productos || []);
        setTotal(data.total || 0); // Guardamos el total para calcular la paginación
      } catch (err) {
        setError("Error al cargar productos.");
      }
    };
    fetchProductos();
  }, [pagina, filtros, orden, busqueda]);

  /**
   * Handler del Buscador: Actualiza la URL en tiempo real (Sincronía bidireccional)
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    const p = new URLSearchParams(searchParams);
    if (value) p.set("search", value); else p.delete("search");
    p.set("page", "1"); // Al buscar, volvemos siempre a la página 1
    setSearchParams(p);
  };

  /**
   * Lógica de Filtrado: Añade o quita categorías del array y actualiza la URL
   */
  const toggleFiltros = (valor) => {
    const p = new URLSearchParams(searchParams);
    let nuevas = filtros.categorias.includes(valor)
      ? filtros.categorias.filter(c => c !== valor)
      : [...filtros.categorias, valor];
    if (nuevas.length) p.set("categorias", nuevas.join(",")); else p.delete("categorias");
    p.set("page", "1");
    setSearchParams(p);
  };

  // Cálculo matemático del total de páginas para la UI de navegación
  const totalPaginas = Math.ceil(total / limit);

  return (
    <div className="shop-layout">
      {/* BARRA LATERAL: Selección de categorías */}
      <aside className="sidebar">
        <h2 className="sidebar__title">Explorar</h2>
        <div className="filter-group">
          <h3 className="filter-group__title">Categorías</h3>
          {["Filamentos", "Resinas", "Impresoras", "Escaner 3d", "Repuestos", "Herramientas"].map((cat) => (
            <label key={cat} className="filter-option">
              <input
                type="checkbox"
                checked={filtros.categorias.includes(cat)}
                onChange={() => toggleFiltros(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL: Buscador, Grid y Paginación */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-flex-container">
            <h2 className="content-header__title">Catálogo</h2>
            
            {/* Buscador estilizado con icono */}
            <div className="search-wrapper">
              <span className="search-icon-inside">🔍</span>
              <input
                type="text"
                className="search-input-field"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Selector de ordenación */}
          <div className="sort-bar">
            <label>Ordenar por:</label>
            <select value={orden} onChange={(e) => {
              const p = new URLSearchParams(searchParams);
              p.set("orden", e.target.value);
              setSearchParams(p);
            }}>
              <option value="Relevante">Relevante</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </header>

        {/* Renderizado dinámico de la cuadrícula de productos */}
        <section className="product-grid">
          {error ? <div className="error-message">{error}</div> :
           productos.length === 0 ? <div className="no-products">No hay resultados.</div> :
           productos.map(p => (
             <ProductCard 
                key={p.id} 
                producto={p} 
                onImageClick={(id) => navigate(`/producto/${id}`)}
                onAddToCart={addProduct}
                carritoActual={carrito}
             />
           ))}
        </section>

        {/* Controles de Paginación */}
        <nav className="pagination">
          <button disabled={pagina === 1} onClick={() => {
            const p = new URLSearchParams(searchParams);
            p.set("page", pagina - 1);
            setSearchParams(p);
          }}>Anterior</button>
          
          <span>{pagina} de {totalPaginas}</span>
          
          <button disabled={pagina >= totalPaginas} onClick={() => {
            const p = new URLSearchParams(searchParams);
            p.set("page", pagina + 1);
            setSearchParams(p);
          }}>Siguiente</button>
        </nav>
      </main>
    </div>
  );
};

export default ProductList;