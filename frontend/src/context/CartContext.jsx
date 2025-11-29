import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Agregar al carrito con personalización
    const addToCart = (product, removedIngredients = []) => {
        const newItem = {
            ...product,
            cartId: Date.now(), // ID único para el carrito (por si pide 2 hamburguesas iguales pero una sin queso)
            removedIngredients // Array de nombres: ['Maní', 'Queso']
        };
        setCart([...cart, newItem]);
    };

    const removeFromCart = (cartId) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => setCart([]);

    const total = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.precio, 0);
    }, [cart]);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);