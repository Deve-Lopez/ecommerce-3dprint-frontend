import Formulario from "./Formulario"
import './Contacto.css'

/**
 * Componente de Página de Contacto.
 * Implementa un diseño de "Split Screen" (Pantalla dividida) muy común en Landing Pages modernas.
 */
const Contacto = () => {
    return (
        /* Uso de la etiqueta semántica <main> para indicar el contenido principal de la ruta.
           La clase 'contact-page' asegura que el fondo y la altura ocupen todo el viewport.
        */
        <main className="contact-page">
            <div className='contact-wrapper'>
                
                {/* * SECCIÓN DE CONTENIDO (1/3): 
                  * Contiene la jerarquía textual (H1), el copy descriptivo y el formulario.
                  */}
                <section className='contact-info-section'>
                    <h1 className='contact-title'>Contacta con nosotros</h1>
                    <p className='contact-description'>
                        ¿Tienes dudas sobre un producto, el estado de tu envío o necesitas soporte técnico?
                        Escríbenos y nuestro equipo te atenderá lo antes posible.
                    </p>
                    
                    {/* Abstracción de lógica: El estado del formulario y el envío de datos (Fetch) 
                        se gestionan dentro del componente <Formulario /> para mayor modularidad.
                    */}
                    <Formulario />

                    <div className="other-contacts">
                        <div className="contact-item">
                            <span className="label">Nuestra Ubicación</span>
                            {/* Uso de target='_blank' y rel="noreferrer" por seguridad al abrir links externos */}
                            <a 
                                href="https://maps.google.com" 
                                target='_blank' 
                                rel="noreferrer" 
                                className='contact-link'
                            >
                                Carrer Font Baixa, 2, Alfafar, Valencia
                            </a>
                        </div>

                        <div className="contact-item">
                            <span className="label">Atención Telefónica</span>
                            {/* El protocolo tel: permite que en móviles se abra el marcador directamente */}
                            <a href='tel:680559528' className="contact-link">
                                (+34) 680559528
                            </a>
                        </div>
                    </div>
                </section>

                {/* * SECCIÓN VISUAL (2/3): 
                  * Definida como <aside> ya que el contenido es complementario/estético.
                  * Carga la imagen desde el servidor local de recursos.
                  */}
                <aside className='contact-visual-section'>
                    <img 
                        src="http://localhost/3dprint/images/contacto.jpg" 
                        alt="3D Printing Workshop"
                        className='contact-image' 
                    />
                </aside>
            </div>
        </main>
    )
}

export default Contacto