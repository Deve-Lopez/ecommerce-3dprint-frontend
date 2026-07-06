import { useState, useEffect } from "react";
import "./ProductCard.css";

// Configuración de assets estáticos vinculada al backend PHP
const BASE_IMAGEN_URL = "http://localhost/3dprint/images/";

const ProductCard = ({ producto, onImageClick, onAddToCart, carritoActual }) => {

    /**
     * 1. LÓGICA DE STOCK DINÁMICO:
     * Calculamos cuánto stock queda "en la estantería" restando lo que ya está en el carrito.
     * Usamos Number() para asegurar que las operaciones matemáticas no fallen por tipos de datos.
     */
    const itemEnCarrito = carritoActual?.find(p => Number(p.id) === Number(producto.id));
    const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
    const stockRealDisponible = Number(producto.stock) - cantidadEnCarrito;

    // Estado local para la pre-selección de unidades antes de añadir
    const [cantidad, setCantidad] = useState(1);

    /**
     * 2. SINCRONIZACIÓN DE ESTADOS (useEffect):
     * Mantiene la UI coherente. Si el usuario añade el último producto desde otra parte,
     * este componente reacciona y bloquea los controles.
     */
    useEffect(() => {
        if (stockRealDisponible <= 0) {
            setCantidad(0);
        } else if (cantidad > stockRealDisponible) {
            setCantidad(stockRealDisponible);
        } else if (cantidad === 0 && stockRealDisponible > 0) {
            setCantidad(1); 
        }
    }, [stockRealDisponible, cantidad]);

    // Flag de disponibilidad absoluta (Si el stock en DB es 0)
    const isAvailableInStore = Number(producto.stock) > 0;

    /**
     * 3. HANDLERS: Respetan el límite del stock real disponible.
     */
    const handleIncrement = () => {
        if (cantidad < stockRealDisponible) {
            setCantidad(prev => prev + 1);
        }
    };
    
    const handleDecrement = () => setCantidad(prev => (prev > 0 ? prev - 1 : 0));

    const handleAddToCart = () => {
        if (cantidad > 0 && cantidad <= stockRealDisponible) {
            onAddToCart(producto, cantidad);
        }
    }

    return (
        <article className={`product-card ${!isAvailableInStore ? "out-of-stock" : ""}`}>

            {/* Visualización de Imagen con Fallback de Click */}
            <div className="product-card__image-wrapper">
                <img
                    src={`${BASE_IMAGEN_URL}${producto.imagen_url}`}
                    alt={producto.nombre}
                    className="product-card__image"
                    onClick={() => onImageClick(producto.id)}
                    title="Ver detalles del producto"
                />

                {/* Feedback Visual: Agotado o Sin Stock disponible por límite de carrito */}
                {(!isAvailableInStore || stockRealDisponible <= 0) && (
                    <div className="sold-out-overlay">
                        {isAvailableInStore ? "LÍMITE ALCANZADO" : "AGOTADO"}
                    </div>
                )}
            </div>

            <div className="product-card__info">
                <h3 className="product-card__title">{producto.nombre}</h3>
                <p className="product-card__price">{producto.precio}€</p>

                {/* 4. RENDERIZADO CONDICIONAL DE CONTROLES */}
                {stockRealDisponible > 0 ? (
                    <>
                        <div className="quantity-selector">
                            <span className="quantity-selector__label">Cantidad:</span>
                            <div className="quantity-selector__controls">
                                <button
                                    onClick={handleDecrement}
                                    className="btn-quantity"
                                    disabled={cantidad <= 1}
                                >-</button>
                                <span className="quantity-display">{cantidad}</span>
                                <button
                                    onClick={handleIncrement}
                                    className="btn-quantity"
                                    disabled={cantidad >= stockRealDisponible}
                                >+</button>
                            </div>
                        </div>

                        {/* FOMO (Fear Of Missing Out): Alerta de stock bajo para incentivar venta */}
                        <div className="stock-alert">
                            {stockRealDisponible === 1 ? (
                                <p className="low-stock">¡ÚLTIMA UNIDAD!</p>
                            ) : stockRealDisponible < 5 ? (
                                <p className="low-stock">Solo quedan {stockRealDisponible}</p>
                            ) : null}
                        </div>

                        <button onClick={handleAddToCart} className="add-to-cart-details">
                            Añadir al carrito
                        </button>
                    </>
                ) : (
                    <div className="stock-limit-msg">
                        <button className="add-to-cart-details disabled" disabled>
                            {isAvailableInStore ? "Máximo en cesta" : "No disponible"}
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
};

export default ProductCard;