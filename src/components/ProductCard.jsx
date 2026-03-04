import React from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { cartItems, addToCart, removeFromCart } = useCart();

    const cartItem = cartItems.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const isSoldOut = product.stock <= 0;

    return (
        <div className={`product-card ${isSoldOut ? 'sold-out-card' : ''}`}>
            <div className="product-image">
                <img src={product.image} alt={product.name} />
                {isSoldOut ? (
                    <span className="sold-out-tag">SOLD OUT</span>
                ) : product.stock < 5 && (
                    <span className="stock-tag">Only {product.stock} left</span>
                )}
            </div>
            <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <div className="product-footer">
                    <span className="price">₹{product.price}</span>

                    {quantity > 0 ? (
                        <div className="quantity-controls">
                            <button
                                onClick={() => removeFromCart(product.id)}
                                className="qty-btn"
                            >-</button>
                            <span className="qty-val">{quantity}</span>
                            <button
                                onClick={() => addToCart(product)}
                                className="qty-btn"
                                disabled={quantity >= product.stock}
                            >+</button>
                        </div>
                    ) : (
                        <button
                            className="add-btn"
                            onClick={() => addToCart(product)}
                            disabled={isSoldOut}
                        >
                            {isSoldOut ? 'STAY TUNED' : 'ADD'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
