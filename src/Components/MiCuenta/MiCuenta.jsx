import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../LoginForm/LoginForm';
import { CarritoContext } from '../CarritoContext/CarritoContext';
import './MiCuenta.css';

/**
 * MiCuenta Component
 * Actúa como un hub logístico:
 * 1. Guest View: Formulario de acceso.
 * 2. Admin View: Dashboard de gestión (CMS).
 * 3. Client View: Datos personales y gestión de pedidos.
 */
const MiCuenta = () => {
    // Consumimos el estado global. React re-renderizará este componente 
    // automáticamente cuando 'usuario' cambie (al loguear o desloguear).
    const { usuario, logout } = useContext(CarritoContext);
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/');
    }

    // ============================================================
    // CASO 1: ESTADO INVITADO (GUEST)
    // Si no hay sesión activa, inyectamos el componente de Login.
    // ============================================================
    if (!usuario) {
        return (
            <div className='micuenta-container'>
                <LoginForm />

                <div className="registro-footer">
                    <p>¿Aún no tienes cuenta?</p>
                    <Link to="/registro" className="register-link-wrapper">
                        <button className='button-registro'>
                            Crear nueva cuenta
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    // ============================================================
    // CASO 2: PERFIL ADMINISTRADOR (rol_id === 1)
    // Vista restringida con accesos directos a la gestión del backend.
    // ============================================================
    if (usuario.rol_id === 1) {
        return (
            <div className='micuenta-container'>
                <div className='admin-theme'>
                    <h2>Panel de Administrador CMS</h2>
                    <p>Bienvenido, Administrador: <strong>{usuario.nombre}</strong></p>
                    <div className="menu-admin">
                        <Link to='/admin/productos'>📦 Gestionar Productos</Link>
                        <Link to='/admin/pedidos'>📊 Pedidos</Link>
                        <Link to='/admin/clientes'>👤 Clientes</Link>
                        <Link to='/admin/mensajes'>📬 Mensajes Contacto</Link>
                    </div>
                    <button className='button-logout' onClick={logout}>Cerrar Sesión</button>
                </div>
            </div>
        )
    }

    // ============================================================
    // CASO 3: PERFIL CLIENTE (ESTÁNDAR)
    // Visualización de datos de perfil y navegación de usuario final.
    // ============================================================
    return (
        <div className='micuenta-container'>
            <div className="perfil-card">
                <h2>Mi Perfil</h2>
                <div className="user-info">
                    {/* Los operadores || aseguran que la UI no se rompa si faltan datos */}
                    <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
                    <p><strong>Email:</strong> {usuario.email}</p>
                    <p><strong>Dirección:</strong> {usuario.direccion || 'No definida'}</p>
                    <p><strong>Ciudad:</strong> {usuario.ciudad || 'No definida'}</p>
                    <p><strong>Código Postal:</strong> {usuario.codigo_postal || 'No definido'}</p>
                    <p><strong>Teléfono:</strong> {usuario.telefono || 'No definido'}</p>
                </div>

                <div className="menu-opciones">
                    <Link to="/mis-pedidos" className="menu-item">📦 Mis Pedidos</Link>
                    <Link to="/editar-perfil" className="menu-item">⚙️ Editar Perfil</Link>
                </div>

                <button className='button-home' onClick={handleNavigate}>
                    Volver a la Tienda
                </button>

                <button className='button-logout' onClick={logout}>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default MiCuenta;