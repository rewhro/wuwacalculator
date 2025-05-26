import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Calculator from './pages/calculator.jsx';
import InfoPage from './pages/infoPage';
import NotFound from './pages/NotFound'; // add this
import { Navigate } from 'react-router-dom';
import Settings from "./pages/settings.jsx";

export default function App() {
    return (
        <Routes>
            {/*<Route path="/" element={<Navigate to="/" />} />*/}
            <Route path="/" element={<Calculator />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}