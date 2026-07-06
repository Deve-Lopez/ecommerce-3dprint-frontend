import { useState, useContext } from 'react';
import { CarritoContext } from "../CarritoContext/CarritoContext"; 
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { Navigate } from 'react-router-dom';

const LoginForm = () => {
    /* Estados locales para capturar las credenciales de forma controlada */
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [mensaje, setMensaje] = useState('');

    /* Hook para redireccionar al usuario tras el éxito (ej: al Home o Checkout) */
    const navigate = useNavigate();
    
    /** * CONSUMO DEL CONTEXTO:
     * Extraemos la función de migración. Esto es vital para que un usuario 
     * no pierda sus productos seleccionados al pasar de 'invitado' a 'registrado'.
     */
    const { migrarCarritoAlLoguear } = useContext(CarritoContext);

    /**
     * GESTIÓN DEL LOGIN (Lógica asíncrona):
     * Envía las credenciales al backend PHP y gestiona la respuesta.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('Iniciando sesión...');

        try {
            /* Petición POST al endpoint de autenticación */
            const response = await fetch('https://3dprintbackend.infinityfreeapp.com/server/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contrasena }),
            });

            const data = await response.json();

            /* Lógica de éxito: El servidor devuelve status 'success' y los datos del usuario */
            if (response.ok && data.status === 'success') {
                
                // 1. PERSISTENCIA: Guardamos el perfil en localStorage para que la sesión 
                // sobreviva a refrescos de pantalla (F5).
                localStorage.setItem("usuario", JSON.stringify(data.usuario));
                
                // 2. SINCRONIZACIÓN DE ESTADO GLOBAL: 
                // Ejecutamos la migración del carrito y actualizamos el estado del usuario en el Contexto.
                migrarCarritoAlLoguear(data.usuario);
                
                setMensaje(`✅ Bienvenido, ${data.usuario.nombre}`);
                
                /* Aquí podrías añadir un navigate("/") para llevar al usuario a la tienda */

            } else {
                /* Feedback de error: usuario no encontrado o contraseña incorrecta */
                setMensaje(`❌ ${data.mensaje || 'Credenciales incorrectas'}`);
            }
        } catch (error) {
            console.error("Error en login:", error);
            setMensaje('❌ Error de conexión con el servidor');
        }
    };

    return (
        <div className="login-container">
            {/* El evento onSubmit en el form es mejor que el onClick en el botón 
                porque permite enviar el formulario pulsando 'Enter' */}
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Iniciar Sesión</h2>

                {/* Renderizado condicional de mensajes de estado/error */}
                {mensaje && <p className="status-message">{mensaje}</p>}

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Contraseña</label>
                    <input
                        type="password"
                        placeholder="Tu contraseña"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="login-button">Ingresar</button>
            </form>
        </div>
    );
};

export default LoginForm;