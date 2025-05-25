import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '2rem' }}>
            <h1>404 - Page Not Found</h1>
            <p>Woah there buddy... looks like what you’re looking for doesn’t exist.</p>
            <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
    );
}