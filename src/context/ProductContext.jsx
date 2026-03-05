import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PRODUCTS as MOCK_PRODUCTS } from '../utils/mockData';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch products from Supabase
    const fetchProducts = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase fetch error:', error);
                throw error;
            }

            if (data && data.length > 0) {
                setProducts(data);
                // Permanent suppression of mocks once data is found
                localStorage.setItem('hide_mocks', 'true');
            } else {
                // Check if we should still show mocks
                const hideMocks = localStorage.getItem('hide_mocks') === 'true';
                if (!hideMocks) {
                    setProducts(MOCK_PRODUCTS);
                } else {
                    setProducts([]); // Truly empty store
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error.message);
            // Fallback to mocks ONLY if we have absolutely nothing and haven't hidden them
            if (products.length === 0 && localStorage.getItem('hide_mocks') !== 'true') {
                setProducts(MOCK_PRODUCTS);
            }
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(true);

        console.log('🔌 Initializing Product Realtime...');

        const channel = supabase
            .channel('products-db-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload) => {
                    console.log('🔔 Product Change Detected:', payload.eventType);
                    fetchProducts(false);
                }
            )
            .subscribe((status) => {
                console.log('📡 Product Subscription Status:', status);
            });

        return () => {
            console.log('🔌 Cleaning up Product Realtime...');
            supabase.removeChannel(channel);
        };
    }, []);

    const addProduct = async (newProduct) => {
        try {
            const { error } = await supabase
                .from('products')
                .insert([newProduct]);

            if (error) throw error;
            // Immediate local update for better UX before realtime kicks in
            localStorage.setItem('hide_mocks', 'true');
        } catch (error) {
            console.error('Add product failed:', error.message);
            alert('Add failed: ' + error.message);
        }
    };

    const updateStock = async (productId, quantitySold) => {
        // Find product to check if it's real or mock
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // REAL product detection: check if it came from Supabase (has created_at)
        const isReal = !!product.created_at;

        if (!isReal) {
            // Update local mock state
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantitySold) } : p
            ));
        } else {
            try {
                const newStock = Math.max(0, product.stock - quantitySold);
                const { error } = await supabase
                    .from('products')
                    .update({ stock: newStock })
                    .eq('id', productId);
                if (error) throw error;
            } catch (error) {
                console.error('Stock update failed:', error.message);
            }
        }
    };

    const deleteProduct = async (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const isReal = !!product.created_at;

        if (!isReal) {
            setProducts(prev => prev.filter(p => p.id !== id));
            return;
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Delete failed:', error.message);
            alert('Delete failed: ' + error.message);
        }
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateStock, deleteProduct, loading }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);
