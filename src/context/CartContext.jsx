import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProducts } from './ProductContext';
import { supabase } from '../supabaseClient';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch orders from Supabase
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        // Realtime subscription for orders
        const subscription = supabase
            .channel('public:orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                fetchOrders();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

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
            if (!existing) return prev;
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

    const placeOrder = async (userDetails) => {
        const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

        try {
            const newOrderData = {
                user_name: userDetails.name,
                user_email: userDetails.email,
                user_room: userDetails.room || 'N/A',
                items: cartItems,
                total: totalAmount,
                pickup_code: pickupCode
            };

            const { data, error } = await supabase
                .from('orders')
                .insert([newOrderData])
                .select();

            if (error) throw error;

            // Update global inventory stock
            for (const item of cartItems) {
                await updateStock(item.id, item.quantity);
            }

            clearCart();
            return data[0]; // Supabase returns field in snake_case, but we match it here
        } catch (error) {
            alert('Error placing order: ' + error.message);
            return null;
        }
    };

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, clearCart,
            totalItems, totalAmount, orders, placeOrder, loading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
