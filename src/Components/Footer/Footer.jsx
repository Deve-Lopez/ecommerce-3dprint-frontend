import { MdEmail } from 'react-icons/md';
import { FaPhoneSquareAlt } from 'react-icons/fa';
import { FaLocationArrow } from 'react-icons/fa';
import { Link } from "react-router-dom";
import "./Footer.css";

/**
 * Footer Component
 * Pie de página global con información de contacto, branding y navegación rápida.
 * Organizado mediante una estructura de tres columnas para un balance visual óptimo.
 */
const Footer = () => {
    return (
        <footer>
            <div className='footer-container'>
                
                {/* SECCIÓN 1: CANALES DE ATENCIÓN (Información de contacto)
                  * Implementación de protocolos estándar (mailto, tel) para mejorar la UX.
                  * Uso de React Icons para una comunicación visual intuitiva.
                  */}
                <div className='columna-uno'>
                    {/* Apertura del cliente de correo predeterminado del usuario */}
                    <a href="mailto:info@3dprint.com">
                        <MdEmail className='icono' />
                        info@3dprint.com
                    </a>
                    
                    {/* Protocolo de llamada directa (especialmente útil en dispositivos móviles) */}
                    <a href="tel:680559528">
                        <FaPhoneSquareAlt className='icono' />
                        680559528
                    </a>

                    {/* Enlace a Google Maps con medidas de seguridad rel="noreferrer" */}
                    <a href="https://www.google.com/maps?q=Carrer+Font+Baixa+2,+Alfafar,+Valencia"
                        target='_blank'
                        rel="noreferrer"
                        className='a-location'>
                        <FaLocationArrow className='icono' />
                        <span>
                            Carrer Font Baixa, 2, <br />
                            Alfafar, 46910 Valencia
                        </span>
                    </a>
                </div>

                {/* SECCIÓN 2: BRANDING Y STORYTELLING (Identidad de marca)
                  * Aquí reforzamos la identidad visual y el propósito del proyecto.
                  * Uso de <Link> de react-router-dom para navegación interna sin recarga de página.
                  */}
                <div className='columna-dos'>
                    <Link to="/" className="logo-link">
                        <h1 className="logo">3D<span>PRINT</span></h1>
                    </Link>
                    <p className='texto'>
                        3DPrint nació de mi pasión por la tecnología 3D.
                        Lo que comenzó como mi proyecto de fin de curso de Desarrollo de Aplicaciones Web (DAW)
                        se convirtió en una tienda de productos relacionados con la impresión 3D,
                        que ahora comparto con clientes de todo el mundo.
                    </p>
                </div>

                {/* SECCIÓN 3: ACCESOS DIRECTOS (Conversión)
                  * CTA (Call to Action) secundario que facilita al usuario encontrar soporte.
                  */}
                <div className="columna-tres">
                    <Link to="/contacto" className="contacto-boton">
                        Contacto
                    </Link>
                </div>
               
            </div>
        </footer>
    );
};

export default Footer;