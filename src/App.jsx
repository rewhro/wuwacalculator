// ✅ FINAL APP WITH SYSTEM DARK MODE + USER OVERRIDE
import React, { useState, useEffect, useRef } from 'react';
import Split from 'split.js';
import { fetchCharacters } from './json-data-scripts/wutheringFetch';
import characterStatesRaw from './data/characterStates.json';
import './styles';
import SkillsModal from './components/SkillsModal';
import CharacterSelector from './components/CharacterSelector';
import CharacterStats from './components/CharacterStats';
import DamageSection from './components/DamageSection';
import WeaponPane from './components/WeaponPane';
import EnemyPane from './components/EnemyPane';
import CustomBuffsPane from './components/CustomBuffsPane';
import ToolbarIconButton from './components/ToolbarIconButton';
import ResetButton from './components/ResetButton';
import { getStatsForLevel } from './utils/getStatsForLevel';
import { attributeColors, attributeIcons, elementToAttribute } from './utils/attributeHelpers';
import { getFinalStats } from './utils/getStatsForLevel';
import { getUnifiedStatPool } from './utils/getUnifiedStatPool';
import { usePersistentState } from './hooks/usePersistentState';
import { Settings, HelpCircle } from 'lucide-react';
import useDarkMode from './hooks/useDarkMode';

export default function App() {
    const [characterLevel, setCharacterLevel] = usePersistentState('characterLevel', 1); // <- ✅ default is 1
    const { isDark } = useDarkMode();
    const [leftPaneView, setLeftPaneView] = useState('characters');
    const [isCollapsedMode, setIsCollapsedMode] = useState(false);

    const [activeCharacterId, setActiveCharacterId] = usePersistentState('activeCharacterId', null);
    const [characterRuntimeStates, setCharacterRuntimeStates] = usePersistentState('characterRuntimeStates', {});
    const [enemyLevel, setEnemyLevel] = usePersistentState('enemyLevel', 1);
    const [enemyRes, setEnemyRes] = usePersistentState('enemyRes', 0);

    const [customBuffs, setCustomBuffs] = useState({});
    const [traceNodeBuffs, setTraceNodeBuffs] = useState({});
    const [combatState, setCombatState] = useState({});
    const [sliderValues, setSliderValues] = useState({});

    const [menuOpen, setMenuOpen] = useState(false);
    const [skillsModalOpen, setSkillsModalOpen] = useState(false);
    const [activeSkillTab, setActiveSkillTab] = useState('normalAttack');
    const [characters, setCharacters] = useState([]);
    const [activeCharacter, setActiveCharacter] = useState(null);
    const [baseCharacterState, setBaseCharacterState] = useState(null);
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const characterStates = Object.values(characterStatesRaw);
    const menuRef = useRef();

    const currentAttribute = elementToAttribute[activeCharacter?.attribute] ?? '';
    const currentSliderColor = attributeColors[currentAttribute] ?? '#888';
    const attributeIconPath = attributeIcons[currentAttribute] ?? '';

    const defaultSliderValues = { normalAttack: 1, resonanceSkill: 1, forteCircuit: 1, resonanceLiberation: 1, introSkill: 1, sequence: 0 };
    const defaultTraceBuffs = { atkPercent: 0, hpPercent: 0, defPercent: 0, healingBonus: 0, critRate: 0, critDmg: 0, elementalBonuses: { aero: 0, glacio: 0, spectro: 0, fusion: 0, electro: 0, havoc: 0 }, activeNodes: {} };
    const defaultCustomBuffs = { atkFlat: 0, hpFlat: 0, defFlat: 0, atkPercent: 0, hpPercent: 0, defPercent: 0, critRate: 0, critDmg: 0, energyRegen: 0, healingBonus: 0, basicAtk: 0, heavyAtk: 0, resonanceSkill: 0, resonanceLiberation: 0, aero: 0, glacio: 0, spectro: 0, fusion: 0, electro: 0, havoc: 0 };
    const defaultCombatState = { characterLevel: 1, enemyLevel: 1, enemyRes: 0, enemyResShred: 0, enemyDefShred: 0, enemyDefIgnore: 0, elementBonus: 0, elementDmgAmplify: { aero: 0, glacio: 0, spectro: 0, fusion: 0, electro: 0, havoc: 0 }, flatDmg: 0, damageTypeAmplify: { basic: 0, heavy: 0, skill: 0, ultimate: 0 }, dmgReduction: 0, elementDmgReduction: 0, critRate: 0, critDmg: 0, weaponBaseAtk: 0 };

    useEffect(() => {
        fetchCharacters().then(data => {
            setCharacters(data);
            if (activeCharacterId) {
                const foundChar = data.find(c => String(c.Id ?? c.id ?? c.link) === String(activeCharacterId));
                if (foundChar) {
                    setActiveCharacter(foundChar);
                    const state = characterStates.find(c => String(c.Id) === String(foundChar.link));
                    setBaseCharacterState(state ?? null);

                    const profile = characterRuntimeStates[activeCharacterId] ?? {};
                    setCharacterLevel(profile.CharacterLevel ?? 1);
                    setSliderValues(profile.SkillLevels ?? defaultSliderValues);
                    setTraceNodeBuffs(profile.TemporaryBuffs ?? defaultTraceBuffs);
                    setCustomBuffs(profile.CustomBuffs ?? defaultCustomBuffs);
                    setCombatState(profile.CombatState ?? defaultCombatState);
                    return;
                }
            } else {
                const defaultCharacterId = 1506;
                const foundChar = data.find(c => String(c.Id ?? c.id ?? c.link) === String(defaultCharacterId));
                if (foundChar) {
                    setActiveCharacter(foundChar);
                    setActiveCharacterId(defaultCharacterId);
                    const state = characterStates.find(c => String(c.Id) === String(defaultCharacterId));
                    setBaseCharacterState(state ?? null);

                    const profile = characterRuntimeStates[defaultCharacterId] ?? {};
                    setCharacterLevel(profile.CharacterLevel ?? 1);
                    setSliderValues(profile.SkillLevels ?? defaultSliderValues);
                    setTraceNodeBuffs(profile.TemporaryBuffs ?? defaultTraceBuffs);
                    setCustomBuffs(profile.CustomBuffs ?? defaultCustomBuffs);
                    setCombatState(profile.CombatState ?? defaultCombatState);
                    return;
                }
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
        Split(['#left-pane', '#right-pane'], { sizes: [50, 50], gutterSize: 1 });
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const desktopThreshold = 1050;
            if (window.innerWidth >= desktopThreshold) {
                setIsCollapsedMode(false);
                return;
            }
            const leftPane = document.querySelector('#left-pane');
            const rightPane = document.querySelector('#right-pane');
            if (leftPane && rightPane) {
                const leftWidth = leftPane.offsetWidth;
                const rightWidth = rightPane.offsetWidth;
                const totalPaneWidth = leftWidth + rightWidth;
                setIsCollapsedMode(window.innerWidth < totalPaneWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
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
                    Stats: baseCharacterState?.Stats ?? {},
                    CharacterLevel: characterLevel,
                    SkillLevels: sliderValues,
                    TemporaryBuffs: traceNodeBuffs,
                    CustomBuffs: customBuffs,
                    CombatState: combatState
                }
            }));
        }

        const charId = char.Id ?? char.id ?? char.link;
        const cached = characterRuntimeStates[charId];
        setActiveCharacter(char);
        setActiveCharacterId(charId);
        setBaseCharacterState(cached ? { Stats: cached.Stats } : characterStates.find(c => String(c.Id) === String(charId)) ?? null);
        setCharacterLevel(cached?.CharacterLevel ?? 1);
        setSliderValues(cached?.SkillLevels ?? defaultSliderValues);
        setTraceNodeBuffs(cached?.TemporaryBuffs ?? defaultTraceBuffs);
        setCustomBuffs(cached?.CustomBuffs ?? defaultCustomBuffs);
        setCombatState(cached?.CombatState ?? defaultCombatState);
        setMenuOpen(false);
    };

    const mergedBuffs = getUnifiedStatPool([traceNodeBuffs, customBuffs, combatState]);
    mergedBuffs.basicAtk = mergedBuffs.basicAtk ?? 0;
    mergedBuffs.skillAtk = mergedBuffs.resonanceSkill ?? 0;
    mergedBuffs.ultimateAtk = mergedBuffs.resonanceLiberation ?? 0;

    const finalStats = getFinalStats(activeCharacter, baseCharacterState, characterLevel, mergedBuffs, combatState);

    useEffect(() => {
        if (!activeCharacter) return;

        const charId = activeCharacter.Id ?? activeCharacter.id ?? activeCharacter.link;
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                Name: activeCharacter.displayName,
                Id: charId,
                Attribute: activeCharacter.attribute,
                WeaponType: activeCharacter.weaponType ?? 0,
                Stats: baseCharacterState?.Stats ?? {},
                CharacterLevel: characterLevel,
                SkillLevels: sliderValues,
                TemporaryBuffs: traceNodeBuffs,
                CustomBuffs: customBuffs,
                CombatState: combatState
            }
        }));
    }, [characterLevel, sliderValues, traceNodeBuffs, customBuffs, combatState]);

    return (
        <>
            <SkillsModal
                skillsModalOpen={skillsModalOpen}
                setSkillsModalOpen={setSkillsModalOpen}
                activeCharacter={activeCharacter}
                activeSkillTab={activeSkillTab}
                setActiveSkillTab={setActiveSkillTab}
                sliderValues={sliderValues}
                currentSliderColor={currentSliderColor}
            />

            {/* Root layout */}
            <div className="layout">

                {/* Toolbar at top */}
                <div className="toolbar">
                    <div className="toolbar-group">
                        <ToolbarIconButton iconName="character" altText="Characters" onClick={() => setLeftPaneView('characters')} isDark={isDark} />
                        <ToolbarIconButton iconName="weapon" altText="Weapon" onClick={() => setLeftPaneView('weapon')} isDark={isDark} />
                        <ToolbarIconButton iconName="enemy" altText="Enemy" onClick={() => setLeftPaneView('enemy')} isDark={isDark} />
                        <ToolbarIconButton iconName="buffs" altText="Buffs" onClick={() => setLeftPaneView('buffs')} isDark={isDark} />
                    </div>
                    <button
                        className={`hamburger-button ${hamburgerOpen ? 'open' : ''}`}
                        onClick={() => setHamburgerOpen(prev => !prev)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                {/* Horizontal layout: sidebar + main content */}
                <div className="horizontal-layout">

                    {/* Sidebar */}
                    <div className={`sidebar ${hamburgerOpen ? 'expanded' : 'collapsed'}`}>
                        <div className="sidebar-content">
                            <button className="sidebar-button">
                                <div className="icon-slot">
                                    <Settings size={24} className="settings-icon" stroke="currentColor" />
                                </div>
                                <div className="label-slot">
                                    <span className="label-text">Settings</span>
                                </div>
                            </button>

                            <button className="sidebar-button">
                                <div className="icon-slot">
                                    <HelpCircle size={24} className="help-icon" stroke="currentColor" />
                                </div>
                                <div className="label-slot">
                                    <span className="label-text">Help</span>
                                </div>
                            </button>

                            <ResetButton />
                        </div>

                        {/* Footer */}
                        <div className="sidebar-footer"></div>
                    </div>

                    {/* Main Content */}
                    <div className="main-content">
                        <div className={`layout ${isCollapsedMode ? 'collapsed-mode' : ''}`}>
                            <div className="split">
                                {/* Left Pane */}
                                <div id="left-pane" className={`partition ${leftPaneView}-mode`}>
                                    {leftPaneView === 'characters' && (
                                        characters?.length > 0 ? (
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
                                            temporaryBuffs={traceNodeBuffs}
                                            setTemporaryBuffs={setTraceNodeBuffs}
                                            isDark={isDark}
                                        />
                                        ) : (
                                            <div className="loading">Loading characters...</div>
                                        )
                                    )}
                                    {leftPaneView === 'weapon' && (
                                        <WeaponPane activeCharacter={activeCharacter} combatState={combatState} setCombatState={setCombatState} />
                                    )}
                                    {leftPaneView === 'enemy' && (
                                        <EnemyPane enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel} enemyRes={enemyRes} setEnemyRes={setEnemyRes} combatState={combatState} setCombatState={setCombatState} />
                                    )}
                                    {leftPaneView === 'buffs' && (
                                        <CustomBuffsPane customBuffs={customBuffs} setCustomBuffs={setCustomBuffs} />
                                    )}
                                </div>

                                {/* Right Pane */}
                                <div id="right-pane" className="partition">
                                    <CharacterStats
                                        activeCharacter={activeCharacter}
                                        baseCharacterState={baseCharacterState}
                                        characterLevel={characterLevel}
                                        temporaryBuffs={traceNodeBuffs}
                                        finalStats={finalStats}
                                        combatState={combatState}
                                        mergedBuffs={mergedBuffs}
                                    />
                                    <DamageSection
                                        activeCharacter={activeCharacter}
                                        finalStats={finalStats}
                                        characterLevel={characterLevel}
                                        sliderValues={sliderValues}
                                        characterRuntimeStates={characterRuntimeStates}
                                        combatState={combatState}
                                        mergedBuffs={mergedBuffs}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
