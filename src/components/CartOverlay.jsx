import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartOverlay.css';

const CartOverlay = ({ isOpen, onClose }) => {
    const { cartItems, removeFromCart, addToCart, totalAmount, placeOrder } = useCart();
    const { user } = useAuth();
    const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Address, 3: Success
    const [address, setAddress] = useState({ room: '', phone: '' });

    const [lastOrder, setLastOrder] = useState(null);

    if (!isOpen) return null;

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!address.room || !address.phone) return alert('Please fill all details');

        const order = await placeOrder({ ...user, ...address });
        if (order) {
            setLastOrder(order);
            setCheckoutStep(3);
        }
    };

    const closeCart = () => {
        onClose();
        setTimeout(() => {
            setCheckoutStep(1);
            setLastOrder(null);
        }, 300);
    };

    return (
        <div className={`cart-overlay-wrapper ${isOpen ? 'open' : ''}`}>
            <div className="cart-backdrop" onClick={closeCart}></div>
            <div className="cart-content">
                <div className="cart-header">
                    <h2>{checkoutStep === 3 ? 'Order Confirmed!' : 'My Cart'}</h2>
                    <button className="close-btn" onClick={closeCart}>✕</button>
                </div>

                {checkoutStep === 1 && (
                    <div className="cart-body">
                        {cartItems.length === 0 ? (
                            <div className="empty-cart">
                                <p>Your cart is empty!</p>
                                <button className="start-shopping" onClick={closeCart}>Start Shopping</button>
                            </div>
                        ) : (
                            <>
                                <div className="cart-items-list">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                <p>₹{item.price}</p>
                                            </div>
                                            <div className="quantity-controls small">
                                                <button onClick={() => removeFromCart(item.id)} className="qty-btn">-</button>
                                                <span className="qty-val">{item.quantity}</span>
                                                <button onClick={() => addToCart(item)} className="qty-btn">+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-footer">
                                    <div className="bill-details">
                                        <div className="bill-row">
                                            <span>Item Total</span>
                                            <span>₹{totalAmount}</span>
                                        </div>
                                        <div className="bill-row">
                                            <span>Pickup Fee</span>
                                            <span className="free">FREE</span>
                                        </div>
                                        <div className="bill-row total">
                                            <span>Total to Pay</span>
                                            <span>₹{totalAmount}</span>
                                        </div>
                                    </div>
                                    <button className="checkout-btn" onClick={() => setCheckoutStep(2)}>
                                        Confirm for Pickup
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {checkoutStep === 2 && (
                    <form className="checkout-form" onSubmit={handleCheckout}>
                        <h3>Pickup Details</h3>
                        <p className="pickup-info">📍 You will need to collect your snacks from <strong>Room 7A- 289</strong></p>
                        <div className="form-group">
                            <label>Your Room Number</label>
                            <input
                                type="text"
                                placeholder="e.g. 505-A"
                                required
                                value={address.room}
                                onChange={(e) => setAddress({ ...address, room: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="10 digit mobile number"
                                required
                                value={address.phone}
                                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                            />
                        </div>
                        <div className="payment-notice">
                            <p>💰 Pay at Pickup (Cash/UPI)</p>
                        </div>
                        <button type="submit" className="place-order-btn">
                            Generate Pickup Code
                        </button>
                        <button type="button" className="back-btn" onClick={() => setCheckoutStep(1)}>
                            Back to Cart
                        </button>
                    </form>
                )}

                {checkoutStep === 3 && (
                    <div className="order-success">
                        <div className="success-icon">🎫</div>
                        <h3>Your Pickup Code</h3>
                        <div className="pickup-code-display">
                            {lastOrder?.pickup_code}
                        </div>
                        <p>Go to <strong>Room 7A- 289</strong> and show this code to collect your snacks.</p>
                        <p className="sub">Please pay your bill at the room.</p>
                        <button className="done-btn" onClick={closeCart}>Got it!</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartOverlay;
