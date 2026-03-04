import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ onCartClick, searchQuery, setSearchQuery }) => {
    const { user, logout } = useAuth();

    return (
        <header className="main-header">
            <div className="container header-inner">
                <div className="location-section">
                    <div className="brand">
                        <h1>14-24 <span>Store</span></h1>
                    </div>
                    <div className="location-picker">
                        <span className="location-label">Hostel Room</span>
                        <span className="location-value">{user?.name}'s Room ▼</span>
                    </div>
                </div>

                <div className="search-section">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search for 'Chips', 'Maggi' or 'Drink'"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <nav className="header-nav">
                    <button className="nav-item" onClick={onCartClick}>
                        <span className="nav-icon">🛒</span>
                        <span className="nav-text">Cart</span>
                    </button>
                    <button className="nav-item profile" onClick={logout}>
                        <span className="nav-icon">👤</span>
                        <span className="nav-text">Logout</span>
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
