import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Mantenemos tus variables: .name, .price y .id
    const addToCart = (product, removedIngredients = []) => {
        setCart(currentCart => {
            // Creamos un ID único para el carrito que incluya la personalización
            const cartId = removedIngredients.length > 0 
                ? `${product.id}-${removedIngredients.join('-')}` 
                : product.id;
            
            const existing = currentCart.find(item => item.cartId === cartId);
            
            if (existing) {
                return currentCart.map(item => 
                    item.cartId === cartId 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentCart, { 
                cartId: cartId, // Usamos este para identificar la línea en el carrito
                id: product.id,
                name: product.name || product.nombre, // Soporta ambos por si acaso
                price: parseFloat(product.price || product.precio), 
                quantity: 1,
                image: product.imageUrl || product.imagen_url,
                removedIngredients: removedIngredients 
            }];
        });
    };

    // Usamos cartId para borrar la línea específica
    const removeFromCart = (cartId) => {
        setCart(current => current.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => setCart([]);

    // ESTA ES LA CLAVE: El total ahora sí sumará correctamente usando .price
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