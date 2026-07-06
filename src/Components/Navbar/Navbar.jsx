import { useState, useContext } from "react"
import { CarritoContext } from "../CarritoContext/CarritoContext"
import { Link, useNavigate } from "react-router-dom"
import "./Navbar.css"

/**
 * Navbar Component
 * Header principal de la aplicación.
 * Gestiona la navegación global, el branding y el resumen de estado del carrito en tiempo real.
 */
const Navbar = () => {
  const navigate = useNavigate();

  /**
   * CONSUMO DEL CONTEXTO:
   * Accedemos a las funciones calculadoras del estado global del carrito.
   * Esto garantiza que el contador y el precio se actualicen instantáneamente 
   * en todas las vistas cuando se añade un producto.
   */
  const { carrito, getTotalItems, getTotalPrice } = useContext(CarritoContext);

  /**
   * Handler de navegación del Logotipo.
   * Realiza una navegación programática. El uso de parámetros (?reset=1) es 
   * una técnica útil para forzar limpiezas de filtros en el Home.
   */
  const handleLogoClick = () => {
    navigate("/?reset=1");
  }

  return (
    <section className="header">

      {/* Branding Section: Logo interactivo */}
      <button className="logo-link" onClick={handleLogoClick}>
        <h1 className="logo">3D<span>PRINT</span></h1>
      </button>

      {/* Action Icons: Hub de utilidades del usuario */}
      <div className="icons">

        {/* Punto de acceso a cuenta / Login */}
        <Link to="/MiCuenta" className='icon-button' title="Mi Cuenta">
          <i className='fa solid fa-user'></i>
        </Link>

        {/* Módulo de búsqueda visual */}
        <button className="search-button" title="Buscar">
          <i className='fas fa-search'></i>
        </button>

        {/* CARRITO DE COMPRAS:
            Sincronización total con el estado global.
        */}
        <Link to="/carrito" className='icon-button card-value'>
          <div className="cart-icon">
            <i className='fas fa-shopping-cart'></i>
            {/* El contador se renderiza dinámicamente desde el Contexto */}
            <span className="counter">{getTotalItems()}</span>
          </div>
          <div className="cart-text">
            <span>Cesta</span>
            <span className="price-tag">
              {/* INTERNACIONALIZACIÓN (i18n):
                  Usamos Intl.NumberFormat para formatear el precio 
                  automáticamente con el símbolo € y decimales europeos.
              */}
              {new Intl.NumberFormat('es-ES', { 
                style: 'currency', 
                currency: 'EUR' 
              }).format(getTotalPrice())}
            </span>
          </div>
        </Link>

      </div>
    </section>
  )
}

export default Navbar