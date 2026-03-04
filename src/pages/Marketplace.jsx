import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import CategorySlider from '../components/CategorySlider';
import ProductList from '../components/ProductList';
import CartOverlay from '../components/CartOverlay';
import OwnerDashboard from '../components/OwnerDashboard';
import Footer from '../components/Footer';
import './Marketplace.css';

const Marketplace = () => {
    const { user } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="marketplace-layout">
            <Header
                onCartClick={() => setIsCartOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <main className="container main-content">
                <CategorySlider />
                <ProductList searchQuery={searchQuery} />
            </main>

            <Footer />

            <CartOverlay isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {isAdminOpen && <OwnerDashboard onClose={() => setIsAdminOpen(false)} />}

            {user?.isAdmin && (
                <button
                    className="admin-fab"
                    title="Owner Dashboard"
                    onClick={() => setIsAdminOpen(true)}
                >
                    👑
                </button>
            )}
        </div>
    );
};

export default Marketplace;
