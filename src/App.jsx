import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Calculator from './pages/calculator.jsx';
import InfoPage from './pages/InfoPage';
import NotFound from './pages/NotFound'; // add this
import { Navigate } from 'react-router-dom';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/calculator" />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}