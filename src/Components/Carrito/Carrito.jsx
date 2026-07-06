import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom';
import { CarritoContext } from '../CarritoContext/CarritoContext'
import CartStep from './steps/CartStep'; 
import ShippingStep from './steps/ShippingStep';
import PaymentStep from './steps/PaymentStep';
import "./Carrito.css"

const Carrito = () => {
  // Extraemos el carrito y el usuario logueado para validar permisos de compra
  const { carrito, usuario } = useContext(CarritoContext);
  
  /**
   * ESTADOS DE CONTROL DE FLUJO
   * paso 1: Revisión de la cesta (CartStep)
   * paso 2: Formulario de dirección (ShippingStep)
   * paso 3: Pasarela de pago y envío a BD (PaymentStep)
   * paso 4: Confirmación final (Success)
   */
  const [paso, setPaso] = useState(1);
  
  // Guardamos el ID que nos devuelva MySQL para mostrarlo al final
  const [pedidoFinalizadoId, setPedidoFinalizadoId] = useState(null);

  // Estado persistente para los datos de envío mientras el usuario navega por los pasos
  const [datosEnvio, setDatosEnvio] = useState({
    direccion: '',
    ciudad: '',
    cp: '',
    telefono: ''
  });

  /**
   * Lógica de navegación:
   * Antes de pasar al paso 2, verificamos que el usuario esté autenticado.
   * Si no hay usuario, React bloquea el avance y lanza un aviso.
   */
  const siguientePaso = () => {
    if (paso === 1 && !usuario) {
      alert("Debes iniciar sesión para finalizar la compra.");
      return; 
    }
    setPaso(paso + 1);
  };

  const anteriorPaso = () => setPaso(paso - 1);

  // Función callback que ejecutará PaymentStep cuando el PHP responda con éxito
  const handleCompraExitosa = (id) => {
    setPedidoFinalizadoId(id);
    setPaso(4); 
  };

  /**
   * RENDERIZADO CONDICIONAL DE "CARRITO VACÍO"
   * Si no hay productos, no mostramos el wizard, a menos que estemos en el paso 4 
   * (porque ahí el carrito ya se habrá vaciado tras la compra).
   */
  if (carrito.length === 0 && paso !== 4) {
    return (
      <div className="carrito-vacio">
        <div className="vacio-content">
          <span className="vacio-icon">🛒</span>
          <h2>Tu carrito está vacío</h2>
          <p>Parece que aún no has añadido nada a tu selección</p>
          <Link to="/" className="btn-tienda">Volver a la tienda</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="carrito-page">

      {/* AQUÍ SE APLICA EL RENDERIZADO POR CORTOCIRCUITO (&&)
          Dependiendo del valor de 'paso', React monta un componente u otro.
      */}
      
      {/* PASO 1: Listado y subtotales */}
      {paso === 1 && (
        <CartStep onNext={siguientePaso} />
      )}

      {/* PASO 2: Captura de datos (pasamos estado y setter como props) */}
      {paso === 2 && (
        <ShippingStep 
          datos={datosEnvio} 
          setDatos={setDatosEnvio} 
          onNext={siguientePaso} 
          onBack={anteriorPaso} 
        />
      )}

      {/* PASO 3: Ejecución de la lógica de negocio y contacto con API */}
      {paso === 3 && (
        <PaymentStep 
          datosEnvio={datosEnvio} 
          onBack={anteriorPaso} 
          onSuccess={handleCompraExitosa}
        />
      )}

      {/* PASO 4: Feedback visual de éxito */}
      {paso === 4 && (
        <div className="checkout-success">
          <div className="success-card">
            <div className="success-icon-circle">✅</div>
            <h1>¡Pedido confirmado!</h1>
            <p>Gracias por tu compra. Tu número de pedido es <strong>#{pedidoFinalizadoId}</strong>.</p>
            <p>Hemos enviado los detalles a tu correo electrónico.</p>
            <Link to="/" className="btn-tienda">Volver a la tienda</Link>
          </div>
        </div>
      )}

    </div>
  )
}

export default Carrito