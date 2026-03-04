import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email) {
            setError('Please fill in all fields');
            return;
        }
        if (!email.endsWith('@kiit.ac.in')) {
            setError('Please use a valid KIIT email (rollnumber@kiit.ac.in)');
            return;
        }
        login(name, email);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">
                    <h1>14-24 <span>Store</span></h1>
                    <p>Hostel Delivery Reimagined</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>KIIT Email ID</label>
                        <input
                            type="email"
                            placeholder="rollnumber@kiit.ac.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button">Get Started</button>
                </form>
                <p className="login-footer">Created by Mobashshar Faiz ©</p>
            </div>
        </div>
    );
};

export default LoginPage;
