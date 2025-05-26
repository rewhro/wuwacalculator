import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Sun, Moon, Sparkle, Info, Settings, History} from "lucide-react";
import useDarkMode from "../hooks/useDarkMode";

export default function Setting() {
    const navigate = useNavigate();
    const { theme, setTheme, effectiveTheme } = useDarkMode();
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [importPreview, setImportPreview] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importSuccess, setImportSuccess] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    useEffect(() => {
        if (importSuccess) {
            const timeout = setTimeout(() => setImportSuccess(''), 5000);
            return () => clearTimeout(timeout);
        }
    }, [importSuccess]);

    const downloadCharacterState = () => {
        const runtime = JSON.parse(localStorage.getItem("characterRuntimeStates") || "{}");
        const id = JSON.parse(localStorage.getItem("activeCharacterId") || "null");

        if (!runtime[id]) {
            alert("No cached character data found.");
            return;
        }

        const blob = new Blob([JSON.stringify({ [id]: runtime[id] }, null, 2)], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${runtime[id].Name ?? "character"}-cache.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importCharacterState = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                const charId = Object.keys(parsed)[0];
                const data = parsed[charId];

                if (!charId || !data?.Id) throw new Error("Invalid format.");

                setImportPreview(data);            // ✅ Save preview
                setShowImportModal(true);          // ✅ Open modal
            } catch (err) {
                alert("Failed to import: " + err.message);
            }
        };
        reader.readAsText(file);
    };


    return (
        <div className="layout">
            <div className="toolbar">
                <div className="toolbar-group">
                    <h4>Wuthering Waves Damage Calculator (& Optimizer soon... maybe)</h4>
                    <button
                        className={`hamburger-button ${hamburgerOpen ? 'open' : ''}`}
                        onClick={() => setHamburgerOpen(prev => !prev)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            <div className="horizontal-layout">
                {/* Sidebar */}
                <div className={`sidebar ${hamburgerOpen ? 'expanded' : 'collapsed'}`}>
                    <div className="sidebar-content">
                        <button
                            className={`sidebar-button ${showDropdown ? 'active' : ''}`}
                            onClick={() => setShowDropdown(prev => !prev)}
                        >
                            <div className="icon-slot">
                                <Settings size={24} className="settings-icon" stroke="currentColor" />
                            </div>
                            <div className="label-slot">
                                <span className="label-text">Settings</span>
                            </div>
                        </button>
                        <div className={`sidebar-dropdown ${showDropdown ? 'open' : ''}`}>
                            <button className="sidebar-sub-button" onClick={() => navigate('/')}>
                                <div className="icon-slot">
                                    <Sparkle size={24} />
                                </div>
                                <div className="label-slot">
                                    <span className="label-text">Home</span>
                                </div>
                            </button>
                            {/*

                                <button className="sidebar-sub-button">
                                    <div className="icon-slot">
                                        <HelpCircle size={24} className="help-icon" stroke="currentColor" />
                                    </div>
                                    <div className="label-slot">
                                        <span className="label-text">Help</span>
                                    </div>
                                </button>
                                */}
                            <button className="sidebar-sub-button" onClick={() => navigate('/info')}>
                                <div className="icon-slot">
                                    <Info size={24} />
                                </div>
                                <div className="label-slot">
                                    <span className="label-text">Info</span>
                                </div>
                            </button>
                        </div>
                        <button className="sidebar-button" onClick={toggleTheme}>
                            <div className="icon-slot">
                                <div className="icon-slot theme-toggle-icon">
                                    <Sun className="icon-sun" size={24} />
                                    <Moon className="icon-moon" size={24} />
                                </div>
                            </div>
                            <div className="label-slot">
                                    <span className="label-text">
                                        {effectiveTheme === 'light' ? 'Dawn' : 'Dusk'}
                                    </span>
                            </div>
                        </button>
                    </div>
                    <div className="sidebar-footer"></div>
                </div>

                {/* Main Content */}
                <div className="main-content settings-page" style={{ padding: '2rem' }}>
                    <div className="settings-header">
                        <h1>Settings</h1>
                    </div>

                    <div className="settings-body">
                        <h2>Import/Export Data</h2>
                        <p style={{ marginBottom: '1rem' }}>
                            Export or import character build data to or from local storage.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button className="btn-primary" onClick={downloadCharacterState}>
                                Export Character Data
                            </button>

                            <label htmlFor="import-character" className="btn-primary" style={{ cursor: 'pointer' }}>
                                Import Character Data
                            </label>
                            <input
                                type="file"
                                id="import-character"
                                accept="application/json"
                                style={{ display: 'none' }}
                                onChange={importCharacterState}
                            />
                        </div>
                        {importSuccess && (
                            <p style={{ color: 'limegreen', fontWeight: 'bold', marginTop: '1rem' }}>
                                {importSuccess}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {showImportModal && (
                <div className="skills-modal-overlay" onClick={() => setShowImportModal(false)}>
                    <div className="skills-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Import Preview</h2>
                        <p>You’re about to import the following character:</p>
                        <ul>
                            <li><strong>Name:</strong> {importPreview?.Name ?? 'Unknown'}</li>
                            <li><strong>Level:</strong> {importPreview?.CharacterLevel}</li>
                            {/*
                            <li>
                                <strong>Skill Levels:</strong>{' '}
                                {Object.entries(importPreview?.SkillLevels ?? {}).map(
                                    ([k, v]) => `${k}: ${v}`
                                ).join(', ')}
                            </li>
                            */}
                        </ul>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn-primary" onClick={() => setShowImportModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    const charId = importPreview?.Id ?? importPreview?.id ?? importPreview?.link;
                                    const prev = JSON.parse(localStorage.getItem("characterRuntimeStates") || "{}");

                                    localStorage.setItem("characterRuntimeStates", JSON.stringify({
                                        ...prev,
                                        [charId]: importPreview
                                    }));

                                    localStorage.setItem("activeCharacterId", JSON.stringify(charId));
                                    setShowImportModal(false);
                                    window.location.href = "/";
                                    //setImportSuccess(`Imported: ${importPreview?.Name} successfully.`);
                                    // ❌ Remove the reload line below if not desired:
                                }}
                            >
                                Confirm Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
