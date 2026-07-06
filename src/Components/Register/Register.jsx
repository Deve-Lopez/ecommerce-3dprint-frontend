import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

/**
 * Register Component
 * Gestiona el alta de nuevos usuarios y la persistencia de datos en el servidor.
 * Implementa el patrón de componentes controlados para la gestión de formularios en React.
 */
const Register = () => {
    const navigate = useNavigate();
    
    /**
     * Hooks de estado: Gestión centralizada de los inputs del formulario.
     * Sincronizamos los nombres de las propiedades con las columnas esperadas en la DB (MySQL).
     */
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        contrasena_hash: '' // Campo crítico para la seguridad del usuario
    });

    /**
     * Estados de control de UI: 
     * 'enviando' previene múltiples peticiones simultáneas (Debouncing).
     * 'mensaje' almacena el feedback semántico del servidor.
     */
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    /**
     * Handler dinámico de inputs:
     * Utiliza la propiedad 'name' del elemento DOM para actualizar el estado de forma genérica.
     * Esto evita crear un manejador individual por cada input del formulario.
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    /**
     * Gestión de persistencia (Submit):
     * Orquesta la comunicación asíncrona con el endpoint de registro en PHP mediante Fetch API.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita el refresco de página nativo del navegador
        setEnviando(true);
        setMensaje({ tipo: '', texto: '' });
        
        try {
            /**
             * Petición POST: Envío del payload serializado en formato JSON.
             * Especificamos el Content-Type para que el servidor PHP sepa cómo parsear los datos.
             */
            const response = await fetch('http://localhost/3dprint/server/registro.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            /**
             * Validación de la respuesta:
             * Si el registro es exitoso, informamos al usuario y redirigimos.
             * Si hay un error (ej: email duplicado), mostramos el mensaje específico del backend.
             */
            if (response.ok && data.status === 'success') {
                setMensaje({ 
                    tipo: 'success', 
                    texto: data.mensaje || 'Registro completado. Redirigiendo...' 
                });
                
                // Delay estratégico de 2 segundos para permitir que el usuario lea el mensaje de éxito
                setTimeout(() => navigate('/micuenta'), 2000); 
            } else {
                setMensaje({ 
                    tipo: 'error', 
                    texto: data.mensaje || 'Error en el registro.' 
                });
            }
        } catch (error) {
            console.error('Critical Fetch Error:', error);
            setMensaje({ 
                tipo: 'error', 
                texto: 'Hubo un problema de conexión con el servidor.' 
            });
        } finally {
            // Restauramos el estado del botón tras finalizar la operación
            setEnviando(false);
        }
    }

    return (
        <div className="register-container">
            <h2>Crear Cuenta</h2>
            
            {/* Renderizado condicional del sistema de alertas basado en el estado 'mensaje' */}
            {mensaje.texto && (
                <div className={`message message-${mensaje.tipo}`}>
                    {mensaje.texto}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="register-form">
                
                {/* Campos del formulario con vinculación bidireccional (Value + OnChange) */}
                <div className="form-group">
                    <label htmlFor="nombre">Nombre *</label>
                    <input 
                        id="nombre"
                        type="text" 
                        name="nombre" 
                        placeholder="Tu nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input 
                        id="apellido"
                        type="text" 
                        name="apellido" 
                        placeholder="Tus apellidos" 
                        value={formData.apellido} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input 
                        id="email"
                        type="email" 
                        name="email" 
                        placeholder="ejemplo@correo.com" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contrasena_hash">Contraseña *</label>
                    <input 
                        id="contrasena_hash"
                        type="password" 
                        name="contrasena_hash" 
                        placeholder="Mínimo 6 caracteres" 
                        value={formData.contrasena_hash} 
                        onChange={handleChange} 
                        minLength="6"
                        required 
                    />
                </div>

                {/* Botón dinámico: Cambia su estado visual durante la petición al servidor */}
                <button type="submit" disabled={enviando} className="register-button">
                    {enviando ? 'Registrando...' : 'Registrarse'}
                </button>
                
                {/* Navegación interna entre módulos de autenticación */}
                <p className="login-link-text">
                    ¿Ya tienes cuenta?{' '}
                    <span onClick={() => navigate('/micuenta')} className="link-style">
                        Inicia Sesión
                    </span>
                </p>
            </form>
        </div>
    );
}

export default Register;