import ProductList from "../ProductList/ProductList"

/**
 * Home Component
 * Punto de entrada principal de la aplicación (View de Inicio).
 * Este componente actúa como un 'Contenedor de Vista' que organiza el flujo 
 * principal de la experiencia de compra.
 */
const Home = () => {
  return (
    <>
      {/* FRAGMENTO (<>): Usamos fragmentos para agrupar elementos sin añadir 
          nodos innecesarios al DOM (como <div> extras), manteniendo el HTML limpio.
      */}

      {/* ProductList: Inyectamos el componente que gestiona el Fetch de datos, 
          los estados de carga y el renderizado de las Cards de productos.
      */}
      <ProductList />
    </>
  )
}

export default Home;