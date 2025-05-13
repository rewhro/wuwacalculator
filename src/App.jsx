// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import Split from 'split.js';
import { fetchCharacters } from './json-data-scripts/wutheringFetch';
import characterStatesRaw from './data/characterStates.json';
import './styles';

import SkillsModal from './components/SkillsModal';
import CharacterSelector from './components/CharacterSelector';
import CharacterStats from './components/CharacterStats';
import DamageSection from './components/DamageSection';

import { attributeColors, attributeIcons, elementToAttribute } from './utils/attributeHelpers';

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
    const [characterRuntimeStates, setCharacterRuntimeStates] = useState({});

    const menuRef = useRef();
    const characterStates = Object.values(characterStatesRaw);

    // attribute icon & color
    const currentAttribute = elementToAttribute[activeCharacter?.attribute] ?? '';
    const currentSliderColor = attributeColors[currentAttribute] ?? '#888';
    const attributeIconPath = attributeIcons[currentAttribute] ?? '';

    useEffect(() => {
        fetchCharacters().then(data => {
            setCharacters(data);
            if (data.length > 0) {
                setActiveCharacter(data[0]);
                const state = characterStates.find(c => String(c.Id) === String(data[0].link));
                setCurrentCharacterState(state || null);
            }
        });
    }, []);

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

    const handleCharacterSelect = (char) => {
        if (activeCharacter) {
            const charId = activeCharacter.Id ?? activeCharacter.id ?? activeCharacter.link;
            setCharacterRuntimeStates(prev => ({
                ...prev,
                [charId]: {
                    Name: activeCharacter.displayName,
                    Id: charId,
                    Attribute: activeCharacter.attribute,
                    WeaponType: activeCharacter.weaponType ?? 0,
                    Stats: currentCharacterState?.Stats ?? {},
                    CurrentLevelMultipliers: {},
                    SkillLevels: sliderValues,
                    CurrentWeapon: null,
                    CharacterLevel: characterLevel
                }
            }));
        }

        const charId = char.Id ?? char.id ?? char.link;
        const cached = characterRuntimeStates[charId];
        setActiveCharacter(char);
        setCurrentCharacterState(
            cached
                ? { Stats: cached.Stats }
                : characterStates.find(c => String(c.Id) === String(charId)) ?? null
        );
        setCharacterLevel(cached?.CharacterLevel ?? 1);
        setSliderValues(cached
            ? { ...sliderValues, ...cached.SkillLevels }
            : {
                normalAttack: 1,
                resonanceSkill: 1,
                forteCircuit: 1,
                resonanceLiberation: 1,
                introSkill: 1,
                sequence: 0
            }
        );
        setMenuOpen(false);
    };

    return (
        <>
            {/* ✅ SkillsModal OUTSIDE layout for perfect overlay */}
            <SkillsModal
                skillsModalOpen={skillsModalOpen}
                setSkillsModalOpen={setSkillsModalOpen}
                activeCharacter={activeCharacter}
                activeSkillTab={activeSkillTab}
                setActiveSkillTab={setActiveSkillTab}
                sliderValues={sliderValues}
                currentSliderColor={currentSliderColor}
            />

            {/* Main UI stays inside layout */}
            <div className="layout">
                <div className="split">
                    <div id="left-pane" className="partition">
                        <CharacterSelector
                            characters={characters}
                            activeCharacter={activeCharacter}
                            handleCharacterSelect={handleCharacterSelect}
                            menuOpen={menuOpen}
                            setMenuOpen={setMenuOpen}
                            menuRef={menuRef}
                            attributeIconPath={attributeIconPath}
                            currentSliderColor={currentSliderColor}
                            sliderValues={sliderValues}
                            setSliderValues={setSliderValues}
                            characterLevel={characterLevel}
                            setCharacterLevel={setCharacterLevel}
                            setSkillsModalOpen={setSkillsModalOpen}
                        />
                    </div>

                    <div id="right-pane" className="partition">
                        <CharacterStats
                            activeCharacter={activeCharacter}
                            currentCharacterState={currentCharacterState}
                            characterLevel={characterLevel}
                            currentSliderColor={currentSliderColor}
                        />

                        <DamageSection
                            activeCharacter={activeCharacter}
                            currentCharacterState={currentCharacterState}
                            characterLevel={characterLevel}
                            sliderValues={sliderValues}
                            characterRuntimeStates={characterRuntimeStates}
                        />
                    </div>
                </div>

                {/* Toolbar (optional) */}
                <div className="toolbar">
                    <h2>Toolbar</h2>
                    <p>Toolbar content goes here.</p>
                </div>
            </div>
        </>
    );
}