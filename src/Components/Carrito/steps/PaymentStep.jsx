import React, { useContext, useState } from 'react';
import { CarritoContext } from '../../CarritoContext/CarritoContext';

/**
 * PaymentStep - Tercer y último paso del Checkout
 * Gestiona la persistencia de los datos en la BD y la actualización del estado global.
 */
const PaymentStep = ({ datosEnvio, onBack, onSuccess }) => {
  // Extraemos datos y funciones del Contexto Global
  const { 
    carrito, 
    usuario, 
    getTotalPrice, 
    clearCart, 
    actualizarDatosUsuario 
  } = useContext(CarritoContext);

  // Estado local para gestionar el feedback de la petición asíncrona (UX)
  const [cargando, setCargando] = useState(false);

  /**
   * handleFinalizarCompra:
   * Orquesta el envío del pedido al backend PHP.
   */
  const handleFinalizarCompra = async () => {
    setCargando(true);
    
    /* Construimos el Objeto de Transferencia de Datos (DTO).
       Estructuramos la información tal como la espera el endpoint 'crear_pedido.php',
       incluyendo un mapeo del carrito para enviar solo lo necesario.
    */
    const pedidoCompleto = {
      usuario_id: usuario.id,
      total: getTotalPrice(),
      direccion: datosEnvio.direccion,
      ciudad: datosEnvio.ciudad,
      cp: datosEnvio.cp,
      telefono: datosEnvio.telefono,
      productos: carrito.map(p => ({
        id: p.id,
        cantidad: p.cantidad,
        precio: p.precio
      }))
    };

    try {
      /* Realizamos la petición mediante Fetch API con cabeceras de tipo JSON */
      const response = await fetch("http://localhost/3dprint/server/crear_pedido.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoCompleto)
      });

      const data = await response.json();

      if (data.status === "success") {
        /* FLUJO POST-PAGO EXITOSO: */

        /* 1. Persistencia UX: Actualizamos el contexto de usuario con la dirección 
           utilizada para que quede guardada "por defecto" en su perfil (LocalStorage).
        */
        actualizarDatosUsuario({
          direccion: datosEnvio.direccion,
          ciudad: datosEnvio.ciudad,
          codigo_postal: datosEnvio.cp, 
          telefono: datosEnvio.telefono
        });

        /* 2. Limpieza de estado: Una vez confirmado el pedido en el servidor, 
           vaciamos el carrito local para evitar compras duplicadas.
        */
        clearCart(); 

        /* 3. Navegación: Notificamos al componente padre el éxito para mostrar 
           el resumen final (SuccessStep).
        */
        onSuccess(data.pedido_id); 
      } else {
        alert("Error al procesar el pedido: " + data.mensaje);
      }
    } catch (error) {
      console.error("Error en la conexión:", error);
      alert("Hubo un error en la conexión con el servidor.");
    } finally {
      // Liberamos el estado de carga para habilitar los botones si algo falla
      setCargando(false);
    }
  };

  return (
    <div className="payment-step">
      <div className="carrito-header">
        <h1>3. Método de Pago</h1>
      </div>

      <div className="carrito-layout">
        <section className="carrito-lista">
          <div className="resumen-final-datos">
            <h3>Confirmación de Envío</h3>
            {/* Visualización de los datos recibidos mediante Props desde el paso 2 */}
            <div className="datos-confirmacion-card">
              <p><strong>Entregar a:</strong> {usuario.nombre}</p>
              <p><strong>Teléfono:</strong> {datosEnvio.telefono}</p>
              <p><strong>Dirección:</strong> {datosEnvio.direccion}</p>
              <p><strong>Localidad:</strong> {datosEnvio.ciudad} ({datosEnvio.cp})</p>
            </div>
            
            <hr />
            
            <h3>Método de Pago</h3>
            {/* Sección de pago simulada: en un entorno real aquí se integraría Stripe o PayPal */}
            <div className="pago-opcion-simulada">
              <input type="radio" checked readOnly /> 
              <div className="pago-texto">
                <span className="pago-titulo">Pago con Tarjeta (Simulado)</span>
                <span className="pago-subtitulo">Pago seguro mediante pasarela bancaria</span>
              </div>
            </div>
          </div>
        </section>

        {/* Resumen de costes final antes del commit a la BD */}
        <aside className="carrito-resumen">
          <div className="resumen-card">
            <h3>Resumen del Pedido</h3>
            <div className="resumen-linea">
              <span>Productos ({carrito.length}):</span>
              <span>{getTotalPrice().toFixed(2)}€</span>
            </div>
            <div className="resumen-linea">
              <span>Envío:</span>
              <span className="envio-gratis">Gratis</span>
            </div>
            <hr />
            <div className="total-monto-final">
              <span>Total:</span>
              <span>{getTotalPrice().toFixed(2)}€</span>
            </div>
            
            {/* Botón de acción principal con control de concurrencia (cargando) */}
            <button 
              className="btn-checkout" 
              onClick={handleFinalizarCompra}
              disabled={cargando}
            >
              {cargando ? "Procesando..." : "Pagar y Finalizar"}
            </button>
            
            {/* Botón de retroceso para corregir errores de dirección */}
            <button 
              className="btn-volver-atras" 
              onClick={onBack} 
              disabled={cargando}
            >
              Modificar datos de envío
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PaymentStep;