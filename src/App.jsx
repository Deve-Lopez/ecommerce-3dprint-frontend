import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./Components/Navbar/Navbar"
import DetailsProduct from "./Components/DetailsProduct/DetailsProduct"
import MiCuenta from "./Components/MiCuenta/MiCuenta"
import MisPedidos from "./Components/MiCuenta/MisPedidos"
import PedidoDetalle from "./Components/MiCuenta/PedidoDetalle"
import EditarPerfil from "./Components/MiCuenta/EditarPerfil"
import Register from "./Components/Register/Register"
import Home from "./Components/Home/Home"
import Contacto from "./Components/Contacto/Contacto"
import Footer from "./Components/Footer/Footer"
import Carrito from "./Components/Carrito/Carrito"
import AdminProductos from "./Components/Admin/AdminProductos"
import AdminPedidos from "./Components/Admin/AdminPedidos"
import AdminClientes from "./Components/Admin/Adminclientes"
import AdminMensajes from "./Components/Admin/AdminMensajes"
import {CarritoProvider} from "./Components/CarritoContext/CarritoContext";

/**
 * Main Application Component
 * Orquestador central de la arquitectura Single Page Application (SPA).
 * Define el sistema de enrutamiento y la estructura de layout persistente.
 */
function App() {
  return (
    /**
     * CONTEXT PROVIDER: 
     * Envolvemos toda la aplicación para que cualquier componente, 
     * independientemente de su profundidad, pueda acceder al estado del carrito.
     */
    <CarritoProvider>
      
      {/* ROUTER: Habilita la navegación por historial del navegador sin recargar la página */}
      <Router>
        
        {/* COMPONENTES PERSISTENTES: 
            Navbar se renderiza fuera de <Routes>, por lo que es visible en todas las páginas. 
        */}
        <Navbar />

        {/* MOTOR DE ENRUTAMIENTO: 
            Evalúa la URL actual y renderiza el componente correspondiente.
        */}
        <Routes>
          
          {/* Vistas Principales y Catálogo */}
          <Route path="/" element={<Home />} />

          {/* RUTAS DINÁMICAS: 
              El segmento ':id' actúa como un parámetro que capturaremos 
              dentro del componente usando el hook useParams().
          */}
          <Route path="/producto/:id" element={<DetailsProduct />} />

          {/* Módulo de Usuario y Autenticación */}
          <Route path="/micuenta" element={<MiCuenta />} />
          <Route path="/mis-pedidos" element={<MisPedidos />} />
          <Route path="/pedido/:id" element={<PedidoDetalle />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />

          {/* Módulos Transaccionales y de Soporte */}
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/carrito" element={<Carrito/>} />

          {/* PANEL DE ADMINISTRACIÓN (BACK-OFFICE): 
              Rutas protegidas lógicamente para la gestión de la tienda.
          */}
          <Route path="/admin/productos" element={<AdminProductos/>} />
          <Route path="/admin/pedidos" element={<AdminPedidos/>} />
          <Route path="/admin/clientes" element={<AdminClientes/>} />
          <Route path="/admin/mensajes" element={<AdminMensajes/>} />

          {/* MANEJO DE ERRORES 404: 
              El path="*" captura cualquier URL que no coincida con las anteriores.
          */}
          <Route path="*" element={<h2>Página no encontrada</h2>}/>

        </Routes>

        {/* Footer persistente al final de todas las vistas */}
        <Footer />

      </Router>

    </CarritoProvider>
  )
}

export default App