import React, { useContext, useEffect } from 'react';
import { CarritoContext } from '../../CarritoContext/CarritoContext';

/**
 * ShippingStep - Segundo paso del proceso de compra.
 * Se encarga de capturar la información logística del pedido.
 */
const ShippingStep = ({ datos, setDatos, onNext, onBack }) => {
  // Accedemos a la información del usuario logueado desde el contexto global
  const { usuario } = useContext(CarritoContext);

  /**
   * Lógica de Auto-relleno (Persistence UX):
   * Si el usuario ya tiene una dirección guardada en su perfil (BD/LocalStorage),
   * rellenamos el formulario automáticamente para agilizar el checkout.
   */
  useEffect(() => {
    // Solo rellenamos si el objeto 'usuario' existe y el formulario está vacío
    if (usuario && !datos.direccion) {
      setDatos({
        direccion: usuario.direccion || '',
        ciudad: usuario.ciudad || '',
        cp: usuario.codigo_postal || '', // Mapeamos 'codigo_postal' de la BD a 'cp' del form
        telefono: usuario.telefono || ''
      });
    }
  }, [usuario, setDatos]); // Dependencias controladas para evitar bucles de renderizado

  /**
   * Manejador de cambios genérico:
   * Actualiza el estado del componente padre ('CheckoutPage') dinámicamente
   * usando el atributo 'name' de los inputs.
   */
  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  /**
   * Validación de negocio:
   * El botón de "Continuar" solo se habilita si los campos obligatorios 
   * (Dirección, Ciudad y CP) tienen contenido.
   */
  const esValido = datos.direccion && datos.ciudad && datos.cp;

  return (
    <div className="shipping-step-container">
      <div className="carrito-header">
        <h1>2. Datos de Envío</h1>
        <p>Confirma dónde quieres recibir tu pedido</p>
      </div>

      <div className="carrito-layout">
        {/* COLUMNA IZQUIERDA: Formulario de entrada de datos */}
        <section className="carrito-lista">
          <div className="shipping-form">
            <div className="form-group">
              <label>Dirección completa</label>
              <input
                type="text"
                name="direccion"
                value={datos.direccion}
                onChange={handleChange}
                placeholder="Calle, número, piso..."
                className="form-control"
              />
            </div>

            {/* Layout en fila para Ciudad y Código Postal usando Flexbox */}
            <div className="form-row" style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  value={datos.ciudad}
                  onChange={handleChange}
                  placeholder="Valencia"
                  className="form-control"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>C. Postal</label>
                <input
                  type="text"
                  name="cp"
                  value={datos.cp}
                  onChange={handleChange}
                  placeholder="46000"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Teléfono de contacto</label>
              <input
                type="text"
                name="telefono"
                value={datos.telefono}
                onChange={handleChange}
                placeholder="600 000 000"
                className="form-control"
              />
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: Control de navegación del Wizard */}
        <aside className="carrito-resumen">
          <div className="resumen-card">
            <h3>Navegación</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
              Tus datos se guardarán para este pedido.
            </p>
            
            {/* El botón onNext dispara el paso al PaymentStep en el componente padre */}
            <button 
                className="btn-checkout" 
                onClick={onNext} 
                disabled={!esValido}
            >
              Continuar al Pago
            </button>
            
            {/* El botón onBack permite al usuario regresar a revisar su cesta */}
            <button 
                className="btn-limpiar" 
                onClick={onBack} 
                style={{ width: '100%', marginTop: '10px', background: '#eee', color: '#333' }}
            >
              Volver a la cesta
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ShippingStep;