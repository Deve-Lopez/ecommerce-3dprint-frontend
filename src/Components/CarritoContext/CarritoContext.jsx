import { useState, useEffect, createContext } from "react";

/* Creamos el contexto para poder consumirlo en cualquier parte de la App con useContext() */
export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
    /**
     * INICIALIZACIÓN DEL USUARIO
     * Leemos de localStorage para que, si el usuario refresca la página (F5), 
     * no se pierda la sesión activa.
     */
    const [usuario, setUsuario] = useState(() => {
        const u = localStorage.getItem("usuario");
        return u ? JSON.parse(u) : null;
    });

    /** * CLAVE DE ALMACENAMIENTO DINÁMICA
     * Si el usuario está logueado, su carrito es único (por ID). 
     * Si no, usamos una clave genérica para invitados. 
     */
    const storageKey = usuario ? `carrito_user_${usuario.id}` : "carrito";

    /* Inicialización del carrito basada en la clave dinámica anterior */
    const [carrito, setCarrito] = useState(() => {
        const guardado = localStorage.getItem(storageKey);
        return guardado ? JSON.parse(guardado) : [];
    });

    /**
     * EFECTO: Sincronización del Usuario
     * Mantiene el localStorage actualizado cada vez que el estado 'usuario' cambia.
     */
    useEffect(() => {
        if (usuario) {
            localStorage.setItem("usuario", JSON.stringify(usuario));
        } else {
            localStorage.removeItem("usuario");
        }
    }, [usuario]);

    /**
     * EFECTO: Sincronización del Carrito
     * Guarda los productos automáticamente cuando el array de carrito o la key cambian.
     */
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(carrito));
    }, [carrito, storageKey]);

    /**
     * ACTUALIZAR DATOS EN TIEMPO REAL
     * Esta función es vital para el Checkout: permite que la dirección y teléfono 
     * escritos en el formulario de envío se guarden en el perfil global del usuario.
     */
    const actualizarDatosUsuario = (nuevosDatos) => {
        setUsuario(prev => ({
            ...prev,
            ...nuevosDatos // Fusionamos los datos antiguos con los nuevos (dirección, cp, etc.)
        }));
    };

    /**
     * MIGRACIÓN Y FUSIÓN DE CARRITOS
     * Lógica compleja: Si un invitado añade cosas y luego se loguea, movemos 
     * sus productos a su cuenta de usuario sin perder lo que ya tenía guardado.
     */
    const migrarCarritoAlLoguear = (datosUsuario) => {
        const carritoInvitado = JSON.parse(localStorage.getItem("carrito")) || [];
        const carritoExistenteUsuario = JSON.parse(localStorage.getItem(`carrito_user_${datosUsuario.id}`)) || [];

        const carritoFusionado = [...carritoExistenteUsuario];
        
        carritoInvitado.forEach(itemInv => {
            const index = carritoFusionado.findIndex(i => i.id === itemInv.id);
            if (index > -1) {
                // Si el producto ya existía en ambos carritos, sumamos cantidades respetando el stock
                const sumaTotal = carritoFusionado[index].cantidad + itemInv.cantidad;
                carritoFusionado[index].cantidad = Math.min(sumaTotal, itemInv.stock);
            } else {
                carritoFusionado.push(itemInv);
            }
        });

        setUsuario(datosUsuario);
        setCarrito(carritoFusionado);
        localStorage.removeItem("carrito"); // Limpiamos el rastro de invitado
    };

    /* Limpieza total de sesión y carrito local al salir */
    const logout = () => {
        setUsuario(null);
        setCarrito([]);
    };

    /**
     * AÑADIR PRODUCTO
     * Incluye validación de stock en tiempo real antes de permitir la inserción.
     */
    const addProduct = (producto, cantidad = 1) => {
        setCarrito((prev) => {
            const existe = prev.find((p) => p.id === producto.id);
            const cantidadActualEnCarrito = existe ? existe.cantidad : 0;
            const nuevaCantidadTotal = cantidadActualEnCarrito + cantidad;

            // Bloqueamos la acción si el usuario intenta comprar más de lo que hay en almacén
            if (nuevaCantidadTotal > producto.stock) {
                alert(`Acción denegada: El stock máximo es ${producto.stock}.`);
                return prev;
            }

            if (existe) {
                // Si existe, actualizamos la propiedad cantidad del objeto mapeando el array
                return prev.map((p) => 
                    p.id === producto.id ? { ...p, cantidad: nuevaCantidadTotal } : p
                );
            } else {
                // Si es nuevo, lo añadimos al array con el operador spread
                return [...prev, { ...producto, cantidad }];
            }
        });
    };

    /* Eliminar un producto filtrando el array por ID */
    const removeProduct = (id) => {
        setCarrito((prev) => prev.filter((p) => p.id !== id));
    };

    /**
     * ACTUALIZAR CANTIDAD
     * Permite subir/bajar unidades desde el carrito validando de nuevo contra el stock.
     */
    const updateQuantity = (id, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
        setCarrito((prev) => 
            prev.map((p) => {
                if (p.id === id) {
                    if (nuevaCantidad > p.stock) {
                        alert(`No puedes superar las ${p.stock} unidades.`);
                        return p; 
                    }
                    return { ...p, cantidad: nuevaCantidad };
                }
                return p;
            })
        );
    };

    /* Funciones de utilidad para cálculos rápidos en la UI */
    const clearCart = () => setCarrito([]);
    const getTotalItems = () => carrito.reduce((acc, p) => acc + p.cantidad, 0);
    const getTotalPrice = () => carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    return(
        /* Proveemos todos los estados y funciones a los componentes hijos */
        <CarritoContext.Provider
            value={{
                carrito,
                usuario,
                addProduct,
                removeProduct,
                updateQuantity,
                clearCart,
                getTotalItems,
                getTotalPrice,
                migrarCarritoAlLoguear,
                actualizarDatosUsuario, 
                logout
            }}
        >
            {children}
        </CarritoContext.Provider>
    );
};