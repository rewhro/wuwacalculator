// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import Split from 'split.js';
import { fetchCharacters } from './utils/wutheringFetch';
import characterStatesRaw from './data/characterStates.json';
import './App.css';
import React from 'react';

// Constants
const attributeColors = {
    glacio: 'rgb(62,189,227)',
    spectro: 'rgb(202,179,63)',
    havoc: 'rgb(172,9,96)',
    electro: 'rgb(167,13,209)',
    aero: 'rgb(15,205,160)',
    fusion: 'rgb(197,52,79)'
};

const attributeIcons = {
    glacio: '/assets/attributes/glacio.png',
    spectro: '/assets/attributes/spectro.png',
    havoc: '/assets/attributes/havoc.png',
    electro: '/assets/attributes/electro.png',
    aero: '/assets/attributes/aero.png',
    fusion: '/assets/attributes/fusion.png'
};

const elementToAttribute = {
    1: 'glacio',
    2: 'fusion',
    3: 'electro',
    4: 'aero',
    5: 'spectro',
    6: 'havoc'
};

const skillTabs = ['normalAttack', 'resonanceSkill', 'forteCircuit', 'resonanceLiberation', 'introSkill'];

export default function App() {
    const [sliderValues, setSliderValues] = useState({
        normalAttack: 1,
        resonanceSkill: 1,
        forteCircuit: 1,
        resonanceLiberation: 1,
        introSkill: 1,
        sequence: 0
    });
    const [characterLevel, setCharacterLevel] = useState(1);
    const [menuOpen, setMenuOpen] = useState(false);
    const [skillsModalOpen, setSkillsModalOpen] = useState(false);
    const [activeSkillTab, setActiveSkillTab] = useState('normalAttack');
    const [characters, setCharacters] = useState([]);
    const [activeCharacter, setActiveCharacter] = useState(null);
    const [currentCharacterState, setCurrentCharacterState] = useState(null);

    const menuRef = useRef();
    const characterStates = Object.values(characterStatesRaw);

    // Current attribute colors
    const currentAttribute = elementToAttribute[activeCharacter?.attribute] ?? '';
    const currentSliderColor = attributeColors[currentAttribute] ?? '#888';
    const attributeIconPath = attributeIcons[currentAttribute] ?? '';

    // Load characters + link states
    useEffect(() => {
        fetchCharacters().then(data => {
            setCharacters(data);
            if (data.length > 0) {
                setActiveCharacter(data[0]);
                console.log("Initial character:", data[0]);

                const state = characterStates.find(c => String(c.Id) === String(data[0].link));
                console.log("Initial matching state:", state);

                setCurrentCharacterState(state || null);
            }
        });
    }, []);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    useEffect(() => {
        Split(['#left-pane', '#right-pane'], { sizes: [25, 75], minSize: [250, 400], gutterSize: 1 });
    }, []);

    // Utilities
    const getSkillData = (tab) => {
        if (!activeCharacter?.raw?.SkillTrees) return null;
        const tree = Object.values(activeCharacter.raw.SkillTrees).find(tree =>
            tree.Skill?.Type?.toLowerCase().replace(/\s/g, '') === tab.toLowerCase()
        );
        return tree?.Skill ?? null;
    };

    const formatDescription = (desc, param = []) => {
        if (!desc) return '';
        desc = desc.replace(/<size=\d+>|<\/size>/g, '')
            .replace(/<color=[^>]+>|<\/color>/g, '')
            .replace(/\n/g, '<br>');
        const attributeWords = ['Glacio DMG', 'Fusion DMG', 'Electro DMG', 'Aero DMG', 'Spectro DMG', 'Havoc DMG'];
        attributeWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            desc = desc.replace(regex, `<span style="color: ${currentSliderColor}; font-weight: bold;">${word}</span>`);
        });
        desc = desc.replace(/{(\d+)}/g, (_, index) => param[index] ?? `{${index}}`);
        return desc;
    };

    // Handlers
    const handleCharacterSelect = (char) => {
        console.log("Selected char:", char);

        setActiveCharacter(char);
        const state = characterStates.find(c => String(c.Id) === String(char.Id ?? char.link));
        console.log("Matching state found:", state);

        setCurrentCharacterState(state || null);
        setMenuOpen(false);
    };

    const statsConfig = [
        { key: 'atk',   label: 'Attack' },
        { key: 'hp',    label: 'HP' },
        { key: 'def',   label: 'Defense' },
        { key: 'critRate',               label: 'Crit Rate',           isPct: true },
        { key: 'critDmg',                label: 'Crit DMG',            isPct: true },
        { key: 'energyRegen',            label: 'Energy Regen',        isPct: true },
        { key: 'basicAttackBonus',       label: 'Basic Attack DMG Bonus',     isPct: true },
        { key: 'heavyAttackBonus',       label: 'Heavy Attack DMG Bonus',     isPct: true },
        { key: 'resonanceSkillBonus',    label: 'Resonance Skill DMG Bonus',  isPct: true },
        { key: 'resonanceLiberationBonus', label: 'Resonance Liberation DMG Bonus', isPct: true },
        { key: 'glacioDmgBonus',      label: 'Glacio DMG Bonus',      isPct: true },
        { key: 'fusionDmgBonus',      label: 'Fusion DMG Bonus',      isPct: true },
        { key: 'electroDmgBonus',     label: 'Electro DMG Bonus',     isPct: true },
        { key: 'aeroDmgBonus',        label: 'Aero DMG Bonus',        isPct: true },
        { key: 'spectroDmgBonus',     label: 'Spectro DMG Bonus',     isPct: true },
        { key: 'havocDmgBonus',       label: 'Havoc DMG Bonus',       isPct: true },
        { key: 'healingBonus',        label: 'Healing Bonus',         isPct: true },
    ];

    return (
        <div className="layout">
            {/* Modal */}
            {skillsModalOpen && (
                <div className="skills-modal-overlay" onClick={() => setSkillsModalOpen(false)}>
                    <div className="skills-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="skills-modal-tabs">
                            {skillTabs.map(tab => (
                                <button key={tab} className={`skills-tab ${activeSkillTab === tab ? 'active' : ''}`} onClick={() => setActiveSkillTab(tab)}>
                                    {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </button>
                            ))}
                        </div>
                        <div className="skills-modal-content-area">
                            {activeCharacter && (() => {
                                const skill = getSkillData(activeSkillTab);
                                if (!skill) return <p>No data available.</p>;
                                const sliderValue = sliderValues[activeSkillTab];
                                return (
                                    <>
                                        <h3>{skill.Name ?? activeSkillTab}</h3>
                                        <p dangerouslySetInnerHTML={{ __html: formatDescription(skill.Desc, skill.Param) }} />
                                        {skill.Level && (
                                            <div className="multipliers-section">
                                                {Object.entries(skill.Level).map(([key, levelData]) => (
                                                    <div key={key} className="multiplier-row">
                                                        <span className="multiplier-label">{levelData.Name}</span>
                                                        <span className="multiplier-value">{levelData.Param?.[0]?.[sliderValues[activeSkillTab] - 1] ?? 'N/A'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                        <button onClick={() => setSkillsModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* Main UI */}
            <div className="split">
                {/* Left Pane */}
                <div id="left-pane" className="partition partition-relative">
                    <div className="header-with-icon">
                        {activeCharacter && (
                            <img src={activeCharacter.icon} alt={activeCharacter.displayName}
                                 className="header-icon" onClick={() => setMenuOpen(!menuOpen)} />
                        )}
                        <div className="character-info-header">
                            <h2>{activeCharacter?.displayName ?? "Character Info"}</h2>
                            {attributeIconPath && <img src={attributeIconPath} alt={currentAttribute} className="attribute-icon" />}
                        </div>
                    </div>

                    {/* Level & Sequence */}
                    <div className="character-settings">
                        <div className="slider-group">
                            <div className="slider-label-with-input">
                                <label>Level</label>
                                <input type="number" className="character-level-input" value={characterLevel}
                                       min="1" max="90" onChange={(e) => setCharacterLevel(Math.min(Math.max(+e.target.value, 1), 90))} />
                            </div>
                            <div className="slider-controls">
                                <input type="range" min="1" max="90" value={characterLevel}
                                       onChange={(e) => setCharacterLevel(Number(e.target.value))}
                                       style={{ '--slider-color': currentSliderColor }} />
                                <span>{characterLevel}</span>
                            </div>
                        </div>

                        <div className="slider-group">
                            <label>Sequence</label>
                            <div className="slider-controls">
                                <input type="range" min="0" max="6" value={sliderValues.sequence}
                                       onChange={(e) => setSliderValues(prev => ({ ...prev, sequence: Number(e.target.value) }))}
                                       style={{ '--slider-color': currentSliderColor }} />
                                <span>{sliderValues.sequence}</span>
                            </div>
                        </div>
                    </div>

                    {/* Character Selection */}
                    <div ref={menuRef} className={`icon-menu-vertical ${menuOpen ? 'show' : ''}`}>
                        {characters.length > 0 ? (
                            characters.map((char, i) => (
                                <div key={i} className="dropdown-item" onClick={() => handleCharacterSelect(char)}>
                                    <img src={char.icon} alt={char.displayName} className="icon-menu-img" />
                                    <span className="dropdown-label">{char.displayName}</span>
                                </div>
                            ))
                        ) : <p>Loading characters...</p>}
                    </div>

                    {/* Skills Settings */}
                    <div className="skills-settings clickable" onClick={() => setSkillsModalOpen(true)}>
                        <div onClick={(e) => e.stopPropagation()}>
                            {skillTabs.map(tab => (
                                <div className="slider-group" key={tab}>
                                    <label>{tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                    <div className="slider-controls">
                                        <input type="range" min="1" max="10" name={tab} value={sliderValues[tab]}
                                               onChange={(e) => setSliderValues(prev => ({ ...prev, [tab]: Number(e.target.value) }))}
                                               style={{ '--slider-color': currentSliderColor }} />
                                        <span>{sliderValues[tab]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inherent Skills */}
                    {activeCharacter && (
                        <div className="inherent-skills">
                            <h3>Inherent Skills</h3>
                            {Object.values(activeCharacter.raw?.SkillTrees ?? {})
                                .filter(node => node.Skill?.Type === "Inherent Skill")
                                .map((node, index) => (
                                    <div key={index} className="inherent-skill">
                                        <h4>{node.Skill.Name}</h4>
                                        <p dangerouslySetInnerHTML={{ __html: formatDescription(node.Skill.Desc, node.Skill.Param) }} />
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Right Pane */}
                <div id="right-pane" className="partition">
                    <h2>Character Stats</h2>
                    {console.log("Rendering stats for:", currentCharacterState?.Stats)}

                    <div className="stats-grid">
                        {statsConfig.map(({ key, label, isPct }) => {
                            const raw = currentCharacterState?.Stats?.[key] ?? 0;
                            const display = isPct
                                ? `${raw.toFixed(1)}%`        // % values are already in whole numbers
                                : raw.toLocaleString();        // normal stats formatted nicely

                            return (
                                <div key={key} className="stat-row">
                                    <div className="stat-label">{label}</div>
                                    <div className="stat-value">{display}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Damage Section */}
                    <h2 style={{ marginTop: '20px', textAlign: 'right' }}>Damage</h2>
                    <div className="damage-section">
                        {skillTabs.map((tab) => {
                            const skill = getSkillData(tab);
                            const levels = skill?.Level ? Object.values(skill.Level).filter(
                                level => Array.isArray(level.Param?.[0]) &&
                                    level.Param[0].some(val => typeof val === 'string' && val.includes('%'))
                            ) : [];
                            return (
                                <div key={tab} className="box-wrapper">
                                    <div className="damage-box">
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textTransform: 'capitalize' }}>
                                            {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </h3>

                                        {levels.length > 0 ? (
                                            <div className="damage-grid">
                                                <div></div>  {/* empty top-left corner */}
                                                <div>Normal</div>
                                                <div>CRIT</div>
                                                <div>AVG</div>

                                                {levels.map((level, index) => (
                                                    <React.Fragment key={index}>
                                                        <div>{level.Name}</div>
                                                        <div>12,345</div>   {/* Normal placeholder */}
                                                        <div>25,678</div>   {/* Crit placeholder */}
                                                        <div>16,789</div>   {/* Avg placeholder */}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>No multipliers.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <h2>Toolbar</h2>
                <p>Toolbar content goes here.</p>
            </div>
        </div>
    );
}