// src/components/Toolbar.jsx
import React from 'react';

export default function Toolbar({ setLeftPaneMode }) {
    return (
        <div className="toolbar">
            <button onClick={() => setLeftPaneMode('characters')}>Characters</button>
            <button onClick={() => setLeftPaneMode('skills')}>Skills</button>
            <button onClick={() => setLeftPaneMode('damage')}>Damage</button>
            <button onClick={() => setLeftPaneMode('settings')}>Settings</button>
        </div>
    );
}