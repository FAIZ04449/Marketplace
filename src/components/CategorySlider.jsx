import React from 'react';
import { CATEGORIES } from '../utils/mockData';
import './CategorySlider.css';

const CategorySlider = () => {
    return (
        <div className="category-slider">
            {CATEGORIES.map(cat => (
                <div key={cat.id} className="category-item">
                    <div className="category-icon">{cat.icon}</div>
                    <span className="category-name">{cat.name}</span>
                </div>
            ))}
        </div>
    );
};

export default CategorySlider;
