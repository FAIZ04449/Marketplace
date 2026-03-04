import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as MOCK_PRODUCTS } from '../utils/mockData';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        const savedProducts = localStorage.getItem('marketplace_products');
        return savedProducts ? JSON.parse(savedProducts) : MOCK_PRODUCTS;
    });

    useEffect(() => {
        localStorage.setItem('marketplace_products', JSON.stringify(products));
    }, [products]);

    const addProduct = (newProduct) => {
        setProducts(prev => [{ ...newProduct, id: Date.now() }, ...prev]);
    };

    const updateStock = (productId, quantitySold) => {
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantitySold) } : p
        ));
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateStock, deleteProduct }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);
