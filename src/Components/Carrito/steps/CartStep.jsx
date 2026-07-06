import React, { useContext } from 'react';
/* Importamos el contexto global para acceder al estado del carrito desde cualquier componente */
import { CarritoContext } from '../../CarritoContext/CarritoContext';

// URL estática para las imágenes servidas por el servidor local
const BASE_IMAGEN_URL = "https://3dprintbackend.infinityfreeapp.com/images/";

/**
 * CartStep - Primer paso del proceso de Checkout (Pasarela de pago)
 * @param {Function} onNext - Prop que llega del componente padre para avanzar al siguiente paso
 */
const CartStep = ({ onNext }) => {
  /* Desestructuramos las funciones y el estado del CarritoContext. 
     Esto evita tener que pasar estas funciones como props a través de múltiples niveles.
  */
  const {
    carrito,
    removeProduct,
    updateQuantity,
    getTotalPrice,
    clearCart
  } = useContext(CarritoContext);

  return (
    <div className="cart-step-content">
      <div className="carrito-header">
        <h1>Tu carrito de compras</h1>
        {/* Acción de limpieza total del estado del carrito */}
        <button className='btn-limpiar' onClick={clearCart}>
          Vaciar todo
        </button>
      </div>

      <div className="carrito-layout">
        {/* COLUMNA IZQUIERDA: Renderizado dinámico de los items en el carrito.
           Utilizamos un map para transformar el array de productos en elementos JSX.
        */}
        <section className='carrito-lista'>
          {carrito.map((producto) => (
            <div key={producto.id} className="carrito-card">
              <div className="card-img">
                <img src={`${BASE_IMAGEN_URL}${producto.imagen_url}`} alt={producto.nombre} />
              </div>

              <div className="card-info">
                <h3>{producto.nombre}</h3>
                <p className='sku'>SKU: {producto.sku}</p>
                <p className='precio-unitario'>Precio: {producto.precio}€</p>
              </div>

              {/* Controles de cantidad con validaciones de Stock */}
              <div className="card-controles">
                <div className="selector-cantidad">
                  {/* Impedimos bajar de 1 unidad */}
                  <button
                    onClick={() => updateQuantity(producto.id, producto.cantidad - 1)}
                    disabled={producto.cantidad <= 1}
                  >-</button>
                  
                  <span className='cantidad-num'>{producto.cantidad}</span>
                  
                  {/* Validación técnica: El botón "+" se deshabilita si la cantidad 
                      alcanza el stock real disponible que trajimos de la base de datos.
                  */}
                  <button
                    onClick={() => updateQuantity(producto.id, producto.cantidad + 1)}
                    disabled={producto.cantidad >= producto.stock}
                  >+</button>
                </div>
                
                {/* Cálculo en tiempo real del subtotal por línea de producto */}
                <p className='subtotal-item'>
                  {(producto.precio * producto.cantidad).toFixed(2)}€
                </p>
              </div>

              {/* Eliminar un producto específico del array del contexto */}
              <button className='btn-remove' onClick={() => removeProduct(producto.id)}>x</button>
            </div>
          ))}
        </section>

        {/* COLUMNA DERECHA: Resumen de costes y cálculo de totales.
           Muestra una previsualización de la factura antes de pasar al envío/pago.
        */}
        <aside className='carrito-resumen'>
          <div className="resumen-card">
            <h3>Resumen del pedido</h3>
            <div className="resumen-detalle">
              <div className="resumen-linea">
                <span>Productos:</span>
                {/* Acumulador (reduce) para mostrar el número total de unidades físicas */}
                <span>{carrito.reduce((acc, p) => acc + p.cantidad, 0)}</span>
              </div>
              <div className="resumen-linea">
                <span>Envío:</span>
                <span className='envio-gratis'>Gratis</span>
              </div>

              <hr />
              
              <div className="resumen-total">
                <span>Total:</span>
                {/* Obtenemos el precio final formateado a dos decimales */}
                <span className='total-monto'>{getTotalPrice().toFixed(2)}€</span>
              </div>
            </div>

            {/* Disparador de la máquina de estados del Checkout. 
                Llama a la función onNext definida en el componente Padre (CheckoutPage).
            */}
            <button className='btn-checkout' onClick={onNext}>
              Finalizar compra
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartStep;