import { useState } from 'react';
import './Formulario.css';

function Formulario() {
  // ============================================================
  // 1. ESTADO INICIAL (Objetos de Datos)
  // Definimos las claves exactas que espera recibir el PHP.
  // ============================================================
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    telefono: '',
    asunto: '',
    mensaje: '' 
  });

  // Estados para controlar la UX (Spinner/Mensajes de error o éxito)
  const [mensajeStatus, setMensajeStatus] = useState({ tipo: '', texto: '' });
  const [enviando, setEnviando] = useState(false);

  /**
   * Actualización dinámica del estado:
   * Evitamos crear una función por cada input. Usando [e.target.name] 
   * actualizamos la propiedad correcta del objeto 'formData' dinámicamente.
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Gestión del ciclo de vida del envío:
   * 1. Bloqueamos el botón (setEnviando).
   * 2. Enviamos el JSON al endpoint de PHP mediante Fetch.
   * 3. Procesamos la respuesta y reseteamos el formulario si todo fue bien.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue (SPA Behavior)
    setEnviando(true);
    setMensajeStatus({ tipo: '', texto: '' });

    try {
      /* Petición POST asíncrona enviando el contenido en el Body como String JSON */
      const response = await fetch('https://3dprintbackend.infinityfreeapp.com/server/guardar_mensaje.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // Validación basada en la respuesta del Backend (status success/error)
      if (data.status === 'success') {
        setMensajeStatus({ 
          tipo: 'success', 
          texto: '✅ Mensaje enviado correctamente' 
        });
        
        // Limpiamos los campos para permitir un nuevo envío
        setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
      } else {
        setMensajeStatus({ 
          tipo: 'danger', 
          texto: data.mensaje || 'Error al procesar el mensaje' 
        });
      }
    } catch (error) {
      console.error('Error de red:', error);
      setMensajeStatus({ 
        tipo: 'danger', 
        texto: '❌ Error de conexión con el servidor' 
      });
    } finally {
      // Liberamos el botón para que el usuario pueda interactuar de nuevo
      setEnviando(false);
    }
  };

  // ============================================================
  // RENDERIZADO (Vista controlada)
  // ============================================================
  return (
    <div className="contacto-container">
      <form onSubmit={handleSubmit} className="form-inner">
        
        {/* Usamos Inputs Controlados: el valor siempre depende del estado (value={formData...}) */}
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Tu nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={enviando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="nombre@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={enviando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            placeholder="Ej: +34 600 000 000"
            value={formData.telefono}
            onChange={handleChange}
            disabled={enviando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="asunto">Asunto</label>
          <input
            type="text"
            id="asunto"
            name="asunto"
            placeholder="Motivo de tu consulta"
            value={formData.asunto}
            onChange={handleChange}
            required
            disabled={enviando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mensaje">¿Cómo podemos ayudarte?</label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows="5"
            placeholder="Escribe tu mensaje detallado aquí..."
            value={formData.mensaje}
            onChange={handleChange}
            required
            disabled={enviando}
          ></textarea>
        </div>

        {/* Botón con feedback visual: cambia el texto según el estado 'enviando' */}
        <button type="submit" className="boton-enviar" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar Mensaje'}
        </button>

        {/* Renderizado condicional del mensaje de respuesta */}
        {mensajeStatus.texto && (
          <div className={`mensaje-feedback ${mensajeStatus.tipo === 'success' ? 'mensaje-success' : 'mensaje-error'}`}>
            {mensajeStatus.texto}
          </div>
        )}
      </form>
    </div>
  );
}

export default Formulario;