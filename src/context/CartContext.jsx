import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProducts } from './ProductContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [orders, setOrders] = useState([]); // Transaction record

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === productId);
            if (existing.quantity === 1) {
                return prev.filter(item => item.id !== productId);
            }
            return prev.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            );
        });
    };

    const clearCart = () => setCartItems([]);

    const { updateStock } = useProducts();
    const placeOrder = (userDetails) => {
        const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
        const newOrder = {
            id: Date.now(),
            items: [...cartItems],
            total: totalAmount,
            date: new Date().toLocaleString(),
            user: userDetails,
            pickupCode
        };

        // Update global inventory stock
        cartItems.forEach(item => {
            updateStock(item.id, item.quantity);
        });

        setOrders(prev => [newOrder, ...prev]);
        clearCart();
        return newOrder;
    };

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, clearCart,
            totalItems, totalAmount, orders, placeOrder
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
