import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarritoContext } from '../CarritoContext/CarritoContext';
import './EditarPerfil.css';

const BASE_URL_SERVER = "http://localhost/3dprint/server";

const EditarPerfil = () => {
    /**
     * CONSUMO DEL CONTEXTO:
     * Extraemos el usuario actual y la función que actualiza el estado global.
     */
    const { usuario, actualizarDatosUsuario } = useContext(CarritoContext);
    const navigate = useNavigate();

    /* Estado local del formulario inicializado con los datos actuales del contexto */
    const [formData, setFormData] = useState({
        id: usuario?.id || '',
        nombre: usuario?.nombre || '',
        apellido: usuario?.apellido || '',
        telefono: usuario?.telefono || '',
        /* Doble validación por si en la BD viene con tilde o sin ella */
        direccion: usuario?.direccion || usuario?.dirección || '', 
        ciudad: usuario?.ciudad || '',
        codigo_postal: usuario?.codigo_postal || ''
    });

    const [cargando, setCargando] = useState(false);

    /* Seguridad: Si no hay usuario logueado, redirigimos fuera de esta vista */
    useEffect(() => {
        if (!usuario) navigate('/mi-cuenta');
    }, [usuario, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /**
     * GESTIÓN DEL ENVÍO:
     * 1. Usamos FormData para empaquetar los datos (muy útil si luego quisieras añadir fotos).
     * 2. Enviamos al PHP mediante fetch (POST).
     * 3. Sincronizamos el Front-End tras el éxito del Back-End.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);

        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));

        try {
            const response = await fetch(`${BASE_URL_SERVER}/update_perfil.php`, {
                method: "POST",
                body: dataToSend,
            });

            const result = await response.json();

            if (result.status === "success") {
                /** * ACTUALIZACIÓN DEL ESTADO GLOBAL:
                 * Si el servidor confirma el guardado, actualizamos el Contexto.
                 * Esto hace que toda la aplicación (Navbar, MiCuenta, etc.) refleje los cambios.
                 */
                actualizarDatosUsuario(formData); 
                
                alert("✅ Perfil actualizado correctamente");
                navigate('/micuenta');
            } else {
                alert("❌ " + result.mensaje);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Hubo un error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="editar-perfil-container">
            <div className="editar-perfil-card">
                <button className="btn-back" onClick={() => navigate('/mi-cuenta')}>← Volver</button>
                <h2>Editar mi información</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="edit-grid">
                        {/* Campos divididos por el Grid que definiste en el CSS */}
                        <div className="input-box">
                            <label>Nombre</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className="input-box">
                            <label>Apellido</label>
                            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
                        </div>
                        <div className="input-box full">
                            <label>Teléfono</label>
                            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
                        </div>
                        <div className="input-box full">
                            <label>Dirección de envío</label>
                            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
                        </div>
                        <div className="input-box">
                            <label>Ciudad</label>
                            <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                        </div>
                        <div className="input-box">
                            <label>Código Postal</label>
                            <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" className="btn-save-perfil" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Confirmar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditarPerfil;