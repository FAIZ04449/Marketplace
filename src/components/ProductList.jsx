import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';
import './ProductList.css';

const ProductList = ({ searchQuery }) => {
    const { products } = useProducts();
    const [filteredProducts, setFilteredProducts] = useState(products);

    useEffect(() => {
        let result = products;

        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(result);
    }, [searchQuery, products]);

    return (
        <section className="product-list-section">
            <h2 className="section-title">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Snacks & Munchies"}
            </h2>

            {filteredProducts.length > 0 ? (
                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="no-results">
                    <p>No snacks found. Try searching for something else!</p>
                </div>
            )}
        </section>
    );
};

export default ProductList;
