import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CarritoContext } from "../CarritoContext/CarritoContext";
import "./DetailsProduct.css";

/* Ruta absoluta para las imágenes servidas por el backend PHP */
const BASE_IMAGEN_URL = "http://localhost/3dprint/images/";

const DetailsProduct = () => {
    /* Extraemos el ID de la URL (ej: /producto/5) para la consulta a la BD */
    const { id } = useParams(); 
    const { addProduct, carrito } = useContext(CarritoContext);
    
    /* Estados locales para la gestión de la vista y la interacción del usuario */
    const [producto, setProducto] = useState(null);
    const [error, setError] = useState(null);
    const [cantidad, setCantidad] = useState(1);

    /**
     * LÓGICA DE STOCK REAL (CRÍTICA):
     * Para evitar que el usuario añada más productos de los que existen físicamente,
     * calculamos el stock disponible restando lo que el usuario ya tiene en su cesta.
     */
    const productoEnCarrito = carrito?.find(p => Number(p.id) === Number(producto?.id));
    const cantidadEnCarrito = productoEnCarrito ? productoEnCarrito.cantidad : 0;
    const stockRealDisponible = producto ? Number(producto.stock) - cantidadEnCarrito : 0;

    /**
     * Sincronización de cantidad:
     * Si el stock real baja (porque se actualizó el carrito), ajustamos la cantidad
     * seleccionada para que nunca supere el límite disponible.
     */
    useEffect(() => {
        if (cantidad > stockRealDisponible && stockRealDisponible > 0) {
            setCantidad(stockRealDisponible);
        }
    }, [stockRealDisponible, cantidad]);

    /**
     * FETCH DE DATOS:
     * Se dispara cada vez que cambia el ID en la URL. 
     * Conecta con el endpoint PHP para traer la información actualizada del producto.
     */
    useEffect(() => {
        const fetchProducto = async () => {
            setError(null);
            try {
                const url = `http://localhost/3dprint/server/get_product_by_id.php?id=${id}`; 
                const response = await fetch(url);
                if (!response.ok) throw new Error("Error en la carga.");
                
                const data = await response.json();
                if (data.error || !data.id) throw new Error("Producto no encontrado.");

                setProducto(data);
                setCantidad(1); // Reset de cantidad al cambiar de producto
            } catch (err) {
                setError(err.message);
                setProducto(null);
            }
        };
        fetchProducto();
    }, [id]);

    /* Manejadores de eventos para el selector de cantidad */
    const handleIncrement = () => {
        if (producto && cantidad < stockRealDisponible) {
            setCantidad(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (cantidad > 1) setCantidad(prev => prev - 1);
    };
    
    /* Envío de datos al Contexto Global */
    const handleAddToCart = () => {
        if (cantidad > 0 && producto && stockRealDisponible >= cantidad) {
            addProduct(producto, cantidad);
            setCantidad(1); // Feedback visual: vuelve a 1 tras añadir
        }
    };

    /* Renderizados de estado de carga y error */
    if (error) return <div className="error-container"><h2>Error: {error}</h2></div>;
    if (!producto) return <div className="loading-state"><p>Cargando información...</p></div>;

    /* Lógica booleana para feedback de stock en la UI */
    const isOutOfStockTotal = Number(producto.stock) === 0;
    const isLowStock = stockRealDisponible > 0 && stockRealDisponible < 10;

    return (
        <div className="product-details">
            <img 
                src={`${BASE_IMAGEN_URL}${producto.imagen_url}`} 
                alt={producto.nombre} 
                className="image-principal"
            />
            
            <div className="product-infos">
                <h1 className="product-title">{producto.nombre}</h1>
                <p className="product-id">SKU: {producto.sku}</p>
                <p className="price">{producto.precio}€</p>
                
                {/* Visualización dinámica de estados de stock */}
                <div className="stock-alert-details">
                    {isOutOfStockTotal ? (
                        <p className="status-no-stock">Agotado en tienda</p>
                    ) : stockRealDisponible <= 0 ? (
                        <p className="status-no-stock">⚠️ Límite alcanzado (Ya tienes {cantidadEnCarrito} en el carrito)</p>
                    ) : (
                        <p className={isLowStock ? "status-low-stock" : "status-in-stock"}>
                            {isLowStock ? `¡Solo quedan ${stockRealDisponible} unidades!` : "En Stock"}
                        </p>
                    )}
                </div>
                
                <p className="descripcion">{producto.descripcion}</p>

                {/* Renderizado condicional del panel de compra */}
                {stockRealDisponible > 0 && !isOutOfStockTotal ? (
                    <div className="quantity-and-add">
                        <div className="quantity-selector-details">
                            <button 
                                className="btn-quantity-details" 
                                onClick={handleDecrement} 
                                disabled={cantidad <= 1}
                            >
                                −
                            </button>
                            <span className="quantity-display-details">{cantidad}</span>
                            <button 
                                className="btn-quantity-details" 
                                onClick={handleIncrement} 
                                disabled={cantidad >= stockRealDisponible}
                            >
                                +
                            </button>
                        </div>
                        <button onClick={handleAddToCart} className="add-to-cart-details">
                            Añadir ({cantidad}) al carrito
                        </button>
                    </div>
                ) : (
                    /* Estado deshabilitado si no hay stock disponible */
                    <div className="out-of-stock-actions">
                        <button className="add-to-cart-details disabled" disabled>
                            No disponible
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsProduct;