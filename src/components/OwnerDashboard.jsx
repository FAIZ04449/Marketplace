import React, { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../utils/mockData';
import './OwnerDashboard.css';

const OwnerDashboard = ({ onClose }) => {
    const { orders, refreshOrders } = useCart();
    const { products, addProduct, deleteProduct } = useProducts();
    const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'inventory'

    // Add Product Form State
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Chips', stock: '' });
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProduct = (e) => {
        e.preventDefault();
        if (!image) return alert('Please capture a product image!');

        addProduct({
            ...newProduct,
            price: Number(newProduct.price),
            stock: Number(newProduct.stock),
            image: image
        });

        // Reset Form
        setNewProduct({ name: '', price: '', category: 'Chips', stock: '' });
        setImage(null);
    };

    const totalSales = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
    const totalUnits = orders.reduce((acc, order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        return acc + items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }, 0);

    return (
        <div className="admin-overlay">
            <div className="admin-content">
                <div className="admin-header">
                    <h2>👑 Owner Dashboard</h2>
                    <div className="admin-tabs">
                        <button
                            className={activeTab === 'stats' ? 'active' : ''}
                            onClick={() => setActiveTab('stats')}
                        >Analytics</button>
                        <button
                            className={activeTab === 'inventory' ? 'active' : ''}
                            onClick={() => setActiveTab('inventory')}
                        >Inventory</button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="refresh-btn"
                            onClick={() => {
                                console.log('Manual refresh triggered');
                                refreshOrders();
                            }}
                            style={{ padding: '8px', borderRadius: '50%', background: 'var(--bg-light)', border: 'none', cursor: 'pointer' }}
                            title="Refresh Data"
                        >🔄</button>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                {activeTab === 'stats' ? (
                    <div className="stats-tab-content">
                        <div className="admin-stats">
                            <div className="stat-card">
                                <span className="stat-label">Total Revenue</span>
                                <span className="stat-value">₹{totalSales.toFixed(2)}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Units Sold</span>
                                <span className="stat-value">{totalUnits}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Orders</span>
                                <span className="stat-value">{orders.length}</span>
                            </div>
                        </div>

                        <div className="admin-transactions">
                            <h3>Recent Transactions</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>User</th>
                                            <th>Total</th>
                                            <th>Items</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                                    <p>No transactions found in database.</p>
                                                    <p style={{ fontSize: '0.8rem' }}>Check if RLS and Realtime are enabled.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map(order => (
                                                <tr key={order.id}>
                                                    <td className="code-cell">{order.pickup_code || 'N/A'}</td>
                                                    <td>
                                                        <strong>{order.user_name || 'Anonymous'}</strong>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{order.user_room}</div>
                                                    </td>
                                                    <td>₹{Number(order.total || 0).toFixed(2)}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>
                                                        {Array.isArray(order.items)
                                                            ? order.items.map(i => `${i.name} (${i.quantity})`).join(', ')
                                                            : 'Error loading items'
                                                        }
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem' }}>
                                                        {order.created_at ? new Date(order.created_at).toLocaleString() : 'Just now'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="inventory-section">
                        <div className="inventory-grid">
                            <div className="add-product-form">
                                <h3>Add New Snack</h3>
                                <form onSubmit={handleSubmitProduct}>
                                    <div className="camera-box" onClick={() => fileInputRef.current.click()}>
                                        {image ? (
                                            <img src={image} alt="Preview" className="camera-preview" />
                                        ) : (
                                            <div className="camera-placeholder">
                                                <span className="cam-icon">📷</span>
                                                <p>Click to Snap Photo</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            ref={fileInputRef}
                                            onChange={handleCapture}
                                            hidden
                                        />
                                    </div>

                                    <div className="form-row">
                                        <input
                                            type="text"
                                            placeholder="Product Name"
                                            required
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price (₹)"
                                            required
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <select
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        >
                                            {CATEGORIES.filter(c => c.name !== 'All').map(c => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Stock Units"
                                            required
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit" className="add-item-btn">Add to Marketplace</button>
                                </form>
                            </div>

                            <div className="current-inventory">
                                <h3>Current Stock</h3>
                                <div className="inventory-list">
                                    {products.map(p => (
                                        <div key={p.id} className="inventory-item">
                                            <img src={p.image} alt="" />
                                            <div className="inv-info">
                                                <strong>{p.name}</strong>
                                                <span>₹{p.price} | Stock: {p.stock}</span>
                                            </div>
                                            <button
                                                className="delete-item"
                                                onClick={() => deleteProduct(p.id)}
                                            >🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
