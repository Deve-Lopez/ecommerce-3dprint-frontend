import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Importación de los estilos globales base
import App from './App.jsx' // Componente raíz que contiene toda la lógica de rutas y estados

/**
 * Punto de entrada de la aplicación (Entry Point). */

/* Seleccionamos el elemento del DOM con id 'root' (ubicado en index.html) 
  como el contenedor principal donde se renderizará toda la SPA.
*/
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Renderizado del componente App, que actúa como el padre de toda la jerarquía */}
    <App />
  </StrictMode>,
)