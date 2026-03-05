import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PRODUCTS as MOCK_PRODUCTS } from '../utils/mockData';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasRealProducts, setHasRealProducts] = useState(false);

    // 1. Fetch products from Supabase
    const fetchProducts = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                setProducts(data);
                setHasRealProducts(true);
                // Save to local storage to remember that we have real data
                localStorage.setItem('has_real_products', 'true');
            } else {
                // If there's no real data, check if we should show mocks
                const wasInitialized = localStorage.getItem('has_real_products') === 'true';
                if (!wasInitialized) {
                    setProducts(MOCK_PRODUCTS);
                } else {
                    setProducts([]); // Truly empty store
                }
            }
        } catch (error) {
            console.error('Error fetching products from Supabase:', error.message);
            // Fallback to mocks only on catastrophic failure during initial load
            if (isInitial && products.length === 0) setProducts(MOCK_PRODUCTS);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(true);

        // REAL-TIME: Using a more robust channel and listener
        const subscription = supabase
            .channel('realtime_products')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => {
                    console.log('Real-time product update detected');
                    fetchProducts(false); // Silent update
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const addProduct = async (newProduct) => {
        try {
            const { error } = await supabase
                .from('products')
                .insert([newProduct]);

            if (error) throw error;
            // Real-time hook will trigger fetchProducts(false)
        } catch (error) {
            console.error('Add failed:', error.message);
            alert('Error adding product: ' + error.message);
        }
    };

    const updateStock = async (productId, quantitySold) => {
        // Find product to check if it's real or mock
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Mock products have numeric IDs from 1 to 10
        const isMock = typeof productId === 'number' && productId <= 10;

        if (isMock) {
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
        const isMock = typeof id === 'number' && id <= 10;

        if (isMock) {
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
