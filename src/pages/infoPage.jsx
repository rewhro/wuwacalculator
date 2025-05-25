import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, History, Sparkle } from "lucide-react";
import useDarkMode from "../hooks/useDarkMode";
import ResetButton from "../components/ResetButton";

export default function InfoPage() {
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
                        <ResetButton />
                    </div>
                </div>

                <div className="main-content" style={{ padding: '2rem' }}>
                    <div className="info-section">
                        <h1>Hi!</h1>
                        <p>First off, i made this solely because i was bored and wanted to try out programming with javascript.
                            I was initially working with spreadsheets but later found out how easy it was to like make something
                            so i was like "why not?" and yeah.
                            It's still a work in progress, i will stay avoiding grass for as long as i can to push out more stuff
                            to make it functional.
                        </p>
                    </div>

                    <div className="info-section">
                        <h3>...SO</h3>
                        <p>Most assets and character data are sourced from <a href="https://ww.hakush.in/" target="_blank" rel="noopener noreferrer">Hakush</a> and the internet.</p>
                        <p>The formulas for calculating damage were gotten from <a href="https://wutheringwaves.fandom.com/wiki/Damage" target="_blank" rel="noopener noreferrer">Wuthering Waves Wiki</a>.</p>
                    </div>

                    <div className="info-section">
                        <h3>How to contact MOI?</h3>
                        <p>Might create a discord server down the line... for now <a href="mailto:your.rewhro@icloud.com">email me</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
