import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Sun, Moon, History, Sparkle } from "lucide-react";
import useDarkMode from "../hooks/useDarkMode";
import ResetButton from "../components/ResetButton";

export default function NotFound() {
    const navigate = useNavigate();
    const { theme, setTheme, effectiveTheme } = useDarkMode();
    const [hamburgerOpen, setHamburgerOpen] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
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
                <div className={`sidebar ${hamburgerOpen ? 'expanded' : 'collapsed'}`}>
                    <div className="sidebar-content">
                        <button className="sidebar-button" onClick={() => navigate('/')}>
                            <div className="icon-slot">
                                <Sparkle size={24} />
                            </div>
                            <div className="label-slot">
                                <span className="label-text">Home</span>
                            </div>
                        </button>
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
                    <div className="sidebar-footer">
                    </div>
                </div>

                <div style={{ padding: '2rem' }}>
                    <h1>404 - Page Not Found</h1>
                    <p>Woah there buddy... you got too much DIP on your chip</p>
                </div>
            </div>
        </div>
    );
}