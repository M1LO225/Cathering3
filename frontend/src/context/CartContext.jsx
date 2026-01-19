import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Inicializamos desde localStorage para no perder el carrito al recargar
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Guardar en localStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(currentCart => {
            const existing = currentCart.find(item => item.id === product.id);
            if (existing) {
                return currentCart.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentCart, { 
                id: product.id,
                name: product.name,
                price: parseFloat(product.price), // Asegurar número
                quantity: 1,
                image: product.imageUrl 
            }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(current => current.filter(item => item.id !== productId));
    };

    const clearCart = () => setCart([]);

    // Calculamos el total asegurando que price sea número
    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        return sum + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);