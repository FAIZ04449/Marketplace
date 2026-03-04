import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PRODUCTS as MOCK_PRODUCTS } from '../utils/mockData';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch products from Supabase
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // If DB is empty, use mock products for the first time
            if (data.length === 0) {
                setProducts(MOCK_PRODUCTS);
            } else {
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error.message);
            setProducts(MOCK_PRODUCTS); // Fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();

        // Optional: Realtime subscription to product updates
        const subscription = supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                fetchProducts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const addProduct = async (newProduct) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([newProduct])
                .select();

            if (error) throw error;
            // State will be updated by subscription
        } catch (error) {
            alert('Error adding product: ' + error.message);
        }
    };

    const updateStock = async (productId, quantitySold) => {
        try {
            // Get current stock first
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const newStock = Math.max(0, product.stock - quantitySold);

            const { error } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', productId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating stock:', error.message);
        }
    };

    const deleteProduct = async (id) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            alert('Error deleting product: ' + error.message);
        }
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateStock, deleteProduct, loading }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);
