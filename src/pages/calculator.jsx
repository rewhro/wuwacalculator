// ✅ FINAL APP WITH SYSTEM DARK MODE + USER OVERRIDE
import React, { useState, useEffect, useRef } from 'react';
import Split from 'split.js';
import { fetchCharacters } from '../json-data-scripts/wutheringFetch';
import characterStatesRaw from '../data/characterStates.json';
import '../styles';
import SkillsModal from '../components/SkillsModal';
import CharacterSelector from '../components/CharacterSelector';
import CharacterStats from '../components/CharacterStats';
import DamageSection from '../components/DamageSection';
import WeaponPane from '../components/WeaponPane';
import EnemyPane from '../components/EnemyPane';
import BuffsPane from "../components/BuffsPane.jsx";
import CustomBuffsPane from '../components/CustomBuffsPane';
import ToolbarIconButton, {ToolbarSidebarButton} from '../components/ToolbarIconButton';
import ResetButton from '../components/ResetButton.jsx';
import { getStatsForLevel } from '../utils/getStatsForLevel';
import { attributeColors, attributeIcons, elementToAttribute } from '../utils/attributeHelpers';
import { getFinalStats } from '../utils/getStatsForLevel';
import { getUnifiedStatPool } from '../utils/getUnifiedStatPool';
import { usePersistentState } from '../hooks/usePersistentState';
import useDarkMode from '../hooks/useDarkMode';
import {getBuffsLogic, getCharacterOverride} from '../data/character-behaviour';
import ChangelogModal from '../components/ChangelogModal';
import { Settings, HelpCircle, History, Moon, Sun, Info, Sparkle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWeapons } from '../json-data-scripts/fetchWeapons';
import { getWeaponOverride } from '../data/weapon-behaviour';
import { applyEchoLogic } from '../data/buffs/applyEchoLogic';
import {applyWeaponBuffLogic} from "../data/buffs/weaponBuffs.js";
import RotationsPane from "../components/RotationsPane.jsx";
import EchoesPane, {getEchoStatsFromEquippedEchoes} from '../components/EchoesPane';
import {echoes} from "../json-data-scripts/getEchoes.js";
import {applyEchoSetBuffLogic, applyMainEchoBuffLogic, applySetEffect} from "../data/buffs/setEffect.js";

export default function Calculator() {
    const navigate = useNavigate();
    const LATEST_CHANGELOG_VERSION = '2025-06-06 19:34';
    const [showChangelog, setShowChangelog] = useState(false);
    const [characterLevel, setCharacterLevel] = usePersistentState('characterLevel', 1); // <- ✅ default is 1
    const { isDark, theme, setTheme, effectiveTheme } = useDarkMode();
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };
    const [leftPaneView, setLeftPaneView] = useState('characters');
    const [isCollapsedMode, setIsCollapsedMode] = useState(false);
    const [activeCharacterId, setActiveCharacterId] = usePersistentState('activeCharacterId', null);
    const [characterRuntimeStates, setCharacterRuntimeStates] = usePersistentState('characterRuntimeStates', {});
    const [enemyLevel, setEnemyLevel] = usePersistentState('enemyLevel', 100);
    const [enemyRes, setEnemyRes] = usePersistentState('enemyRes', 20);
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
    const menuRef = useRef(null);
    const triggerRef = useRef(null);
    const currentAttribute = elementToAttribute[activeCharacter?.attribute] ?? '';
    const currentSliderColor = attributeColors[currentAttribute] ?? '#888';
    const attributeIconPath = attributeIcons[currentAttribute] ?? '';
    const defaultSliderValues = { normalAttack: 1, resonanceSkill: 1, forteCircuit: 1, resonanceLiberation: 1, introSkill: 1, sequence: 0 };
    const defaultTraceBuffs = { atkPercent: 0, hpPercent: 0, defPercent: 0, healingBonus: 0, critRate: 0, critDmg: 0, elementalBonuses: { aero: 0, glacio: 0, spectro: 0, fusion: 0, electro: 0, havoc: 0 }, activeNodes: {} };
    const defaultCustomBuffs = { atkFlat: 0, hpFlat: 0, defFlat: 0, atkPercent: 0, hpPercent: 0, defPercent: 0, critRate: 0, critDmg: 0, energyRegen: 0, healingBonus: 0, basicAtk: 0, heavyAtk: 0, resonanceSkill: 0, resonanceLiberation: 0, aero: 0, glacio: 0, spectro: 0, fusion: 0, electro: 0, havoc: 0 };
    const defaultCombatState = { characterLevel: 1, enemyLevel: 90, enemyRes: 10, enemyResShred: 0, enemyDefShred: 0, enemyDefIgnore: 0, elementBonus: 0, elementDmgAmplify: { aero: 0, glacio: 0, spectro: 0, fusion: 0, electro: 0, havoc: 0 }, flatDmg: 0, damageTypeAmplify: { basic: 0, heavy: 0, skill: 0, ultimate: 0 }, dmgReduction: 0, elementDmgReduction: 0, critRate: 0, critDmg: 0, weaponBaseAtk: 0, spectroFrazzle: 0, aeroErosion: 0 };
    const [characterState, setCharacterState] = useState({ activeStates: {} });
    const [showDropdown, setShowDropdown] = useState(false);
    const [echoStates, setEchoStates] = usePersistentState('echoStates', {});
    const [team, setTeam] = usePersistentState('team', [activeCharacterId ?? null, null, null]);
    const [teamCache, setTeamCache] = usePersistentState('teamCache', {});
    const [moveToolbarToSidebar, setMoveToolbarToSidebar] = useState(false);

    useEffect(() => {
        fetchCharacters().then(data => {

            const sorted = [...data].sort((a, b) =>
                a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' })
            );

            setCharacters(sorted);

            if (activeCharacterId) {
                const foundChar = data.find(c => String(c.Id ?? c.id ?? c.link) === String(activeCharacterId));
                if (foundChar) {
                    setActiveCharacter({
                        ...foundChar,
                        weaponType: foundChar.weaponType ?? foundChar.Weapon ?? foundChar.raw?.Weapon ?? 0,
                    });

                    const state = characterStates.find(c => String(c.Id) === String(foundChar.link));
                    setBaseCharacterState(state ?? null);

                    const profile = characterRuntimeStates[activeCharacterId] ?? {};
                    setCharacterLevel(profile.CharacterLevel ?? 1);
                    setSliderValues(profile.SkillLevels ?? defaultSliderValues);
                    setTraceNodeBuffs(profile.TemporaryBuffs ?? defaultTraceBuffs);
                    setCustomBuffs(profile.CustomBuffs ?? defaultCustomBuffs);
                    setCombatState(prev => ({
                        ...defaultCombatState,
                        ...(profile.CombatState ?? {}),
                        enemyLevel: prev.enemyLevel,
                        enemyRes: prev.enemyRes
                    }));

                    return;
                }
            } else {
                const defaultCharacterId = 1506;
                const foundChar = data.find(c => String(c.Id ?? c.id ?? c.link) === String(defaultCharacterId));
                if (foundChar) {
                    setActiveCharacter({
                        ...foundChar,
                        weaponType: foundChar.weaponType ?? foundChar.Weapon ?? foundChar.raw?.Weapon ?? 0,
                    });

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

    const [weapons, setWeapons] = useState({});

    useEffect(() => {
        fetchWeapons().then(data => {
            setWeapons(data);
        });
    }, []);

    useEffect(() => {
        setCombatState(prev => ({
            ...prev,
            enemyLevel,
            enemyRes
        }));
    }, [enemyLevel, enemyRes]);


    useEffect(() => {
        const seenVersion = localStorage.getItem('seenChangelogVersion');
        if (seenVersion !== LATEST_CHANGELOG_VERSION) {
            setShowChangelog(true); // show modal
            localStorage.setItem('seenChangelogVersion', LATEST_CHANGELOG_VERSION); // mark as seen
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target)
            ) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    useEffect(() => {
        Split(['#left-pane', '#right-pane'], { sizes: [50, 50], gutterSize: 1 });
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const desktopThreshold = 1010;
            if (window.innerWidth >= desktopThreshold) {
                setIsCollapsedMode(false);
                return;
            }
            const leftPane = document.querySelector('#left-pane');
            const rightPane = document.querySelector('#right-pane');
            const sidebar = document.querySelector('.sidebar');
            if (leftPane && rightPane) {
                const leftWidth = leftPane.offsetWidth;
                const rightWidth = rightPane.offsetWidth;
                const totalPaneWidth = 1010; //leftWidth + rightWidth + sidebar;
                setIsCollapsedMode(window.innerWidth < totalPaneWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setMoveToolbarToSidebar(window.innerWidth < 900);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // check on mount

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [rotationEntriesRaw, setRotationEntriesRaw] = usePersistentState('rotationEntriesStore', {});
    const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
    const [rotationEntries, setRotationEntries] = useState([]);
    const equippedEchoes = characterRuntimeStates?.[charId]?.equippedEchoes ?? [];
    const echoStats = getEchoStatsFromEquippedEchoes(equippedEchoes);

    // Load rotationEntries from persistent state on character switch
    useEffect(() => {
        if (!charId) return;
        const saved = Array.isArray(rotationEntriesRaw?.[charId]) ? rotationEntriesRaw[charId] : [];
        setRotationEntries(saved);
    }, [charId]);

    // Save rotationEntries to persistent state on change
    useEffect(() => {
        if (!charId) return;
        setRotationEntriesRaw(prev => ({
            ...prev,
            [charId]: rotationEntries
        }));
    }, [rotationEntries, charId]);

    // Sync to characterRuntimeStates when rotationEntries change
    useEffect(() => {
        if (!charId) return;
        const existing = characterRuntimeStates?.[charId]?.rotationEntries ?? [];
        const isEqual = JSON.stringify(existing) === JSON.stringify(rotationEntries);
        if (!isEqual) {
            setCharacterRuntimeStates(prev => ({
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    rotationEntries
                }
            }));
        }
    }, [rotationEntries, charId]);

    const handleCharacterSelect = (char) => {
        // ✅ Save full runtime state for current character
        if (activeCharacter) {
            const currentCharId = charId;
            setTeamCache(prev => ({
                ...prev,
                [currentCharId]: team
            }));

            setCharacterRuntimeStates(prev => ({
                ...prev,
                [currentCharId]: {
                    ...(prev[currentCharId] ?? {}),
                    Name: activeCharacter.displayName,
                    Id: currentCharId,
                    Attribute: activeCharacter.attribute,
                    WeaponType: activeCharacter.weaponType ?? activeCharacter.Weapon ?? activeCharacter.raw?.Weapon ?? 0,
                    Stats: baseCharacterState?.Stats ?? {},
                    CharacterLevel: characterLevel,
                    SkillLevels: sliderValues,
                    TemporaryBuffs: traceNodeBuffs,
                    CustomBuffs: customBuffs,
                    CombatState: combatState,
                    CharacterState: characterState,
                    Team: team
                }
            }));
        }

        // ✅ Load new character state
        const newMainId = char.Id ?? char.id ?? char.link;
        const cached = characterRuntimeStates[newMainId];
        const restoredTeam = cached?.Team ?? [newMainId, null, null];
        setTeam(restoredTeam);

        const rawEntries = rotationEntriesRaw?.[newMainId] ?? [];
        const normalizedEntries = rawEntries.map(entry => ({
            ...entry,
            multiplier: typeof entry.multiplier === 'number' ? entry.multiplier : 1
        }));
        setRotationEntries(normalizedEntries);

        setActiveCharacter(char);
        setActiveCharacterId(newMainId);
        setBaseCharacterState(
            cached ? { Stats: cached.Stats } : characterStates.find(c => String(c.Id) === String(newMainId)) ?? null
        );
        setCharacterLevel(cached?.CharacterLevel ?? 1);
        setSliderValues(cached?.SkillLevels ?? defaultSliderValues);
        setTraceNodeBuffs(cached?.TemporaryBuffs ?? defaultTraceBuffs);
        setCustomBuffs(cached?.CustomBuffs ?? defaultCustomBuffs);
        setCombatState(prev => ({
            ...defaultCombatState,
            ...(cached?.CombatState ?? {}),
            enemyLevel: prev.enemyLevel,
            enemyRes: prev.enemyRes
        }));
        setCharacterState(cached?.CharacterState ?? {});
        setMenuOpen(false);
    };

    useEffect(() => {
        if (team[0] && team[0] !== activeCharacterId) {
            localStorage.setItem('activeCharacterId', JSON.stringify(team[0]));
            setActiveCharacterId(team[0]);
        }
    }, [team[0]]);


    useEffect(() => {
        if (activeCharacterId) {
            setTeam(prev => {
                if (!prev || prev.length < 3) {
                    const updated = [activeCharacterId, null, null];
                    return updated;
                }

                if (prev[0] !== activeCharacterId) {
                    const updated = [...prev];
                    updated[0] = activeCharacterId;
                    return updated;
                }

                return prev;
            });
        }
    }, [activeCharacterId]);

    const overrideLogic = getCharacterOverride(
        activeCharacter?.id ?? activeCharacter?.Id ?? activeCharacter?.link
    );

    let mergedBuffs = getUnifiedStatPool(
        [traceNodeBuffs, combatState, customBuffs, echoStats],
        overrideLogic
    );

    team.forEach((id, index) => {
        if (!id || index === 0) return;

        const buffsLogic = getBuffsLogic(id);
        if (!buffsLogic) return;

        const characterState = {
            activeStates: characterRuntimeStates?.[id]?.activeStates ?? {}
        };

        const result = buffsLogic({
            mergedBuffs,
            characterState,
            activeCharacter, combatState
        });

        if (result?.mergedBuffs) {
            mergedBuffs = result.mergedBuffs;
        }
    });

    const weaponOverride = getWeaponOverride(combatState?.weaponId);
    if (weaponOverride?.applyWeaponLogic) {
        const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;

        const currentParamValues = combatState.weaponParam?.map(
            p => p?.[Math.min(Math.max((combatState.weaponRank ?? 1) - 1, 0), 4)]
        ) ?? [];

        const characterState = {
            activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {},
            toggles: characterRuntimeStates?.[charId]?.sequenceToggles ?? {},
        };
        const isToggleActive = (toggleId) =>
            characterState?.toggles?.[toggleId] === true;

        const result = weaponOverride.applyWeaponLogic({
            mergedBuffs,
            combatState,
            currentParamValues,
            characterState,
            isToggleActive,
            skillMeta: {},
            baseCharacterState,
            activeCharacter
        });

        if (result?.mergedBuffs) {
            mergedBuffs = result.mergedBuffs;
        }
    }

    mergedBuffs = applyEchoLogic({
        mergedBuffs,
        characterState: {
            activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {}
        },
        baseCharacterState,
        activeCharacter
    });

    mergedBuffs = applyWeaponBuffLogic({
        mergedBuffs,
        characterState: {
            activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {}
        },
        activeCharacter
    });

    mergedBuffs = applyEchoLogic({
        mergedBuffs,
        characterState: {
            activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {}
        },
        activeCharacter
    })

    mergedBuffs = applyEchoSetBuffLogic({
        mergedBuffs,

        activeCharacter,
        equippedEchoes
    })

    mergedBuffs = applySetEffect({
        characterState: {
            activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {}
        },
        activeCharacter,
        mergedBuffs,
        combatState
    })

    mergedBuffs = applyMainEchoBuffLogic({
        equippedEchoes,
        mergedBuffs,
        characterState: {
            activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {}
        },
        activeCharacter,
        combatState,
        charId
    })

    // ✅ Extract activeStates + sequenceToggles from characterRuntimeStates
    if (overrideLogic && typeof overrideLogic === 'function') {
        const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;

        const characterState = {
            activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {},
            toggles: characterRuntimeStates?.[charId]?.sequenceToggles ?? {},
        };

        const sequenceLevel = sliderValues?.sequence ?? 0;

        const isActiveSequence = (seqNum) => sequenceLevel >= seqNum;
        const isToggleActive = (toggleId) =>
            characterState?.toggles?.[toggleId] === true;

        const result = overrideLogic({
            mergedBuffs,
            combatState,
            characterState,
            isActiveSequence,
            isToggleActive,
            skillMeta: {},
            baseCharacterState,
            sliderValues,
            characterLevel
        });

        if (result?.mergedBuffs) {
            mergedBuffs = result.mergedBuffs;
        }
    }


    mergedBuffs.basicAtk = mergedBuffs.basicAtk ?? 0;
    mergedBuffs.skillAtk = mergedBuffs.resonanceSkill ?? 0;
    mergedBuffs.ultimateAtk = mergedBuffs.resonanceLiberation ?? 0;
    //mergedBuffs.coordAtk = mergedBuffs.coordinated ?? 0;

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
                CombatState: combatState,
                CharacterState: characterState
            }
        }));
    }, [characterLevel, sliderValues, traceNodeBuffs, customBuffs, combatState]);

    let finalStats = getFinalStats(activeCharacter, baseCharacterState, characterLevel, mergedBuffs, combatState);

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
                    {!moveToolbarToSidebar && (
                        <div className="toolbar-group">
                            <ToolbarIconButton
                                iconName="character"
                                altText="Characters"
                                onClick={() => setLeftPaneView('characters')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="weapon"
                                altText="Weapon"
                                onClick={() => setLeftPaneView('weapon')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="echoes"
                                altText="Echoes"
                                onClick={() => setLeftPaneView('echoes')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="teams"
                                altText="Team"
                                onClick={() => setLeftPaneView('teams')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="enemy"
                                altText="Enemy"
                                onClick={() => setLeftPaneView('enemy')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="buffs"
                                altText="Buffs"
                                onClick={() => setLeftPaneView('buffs')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="rotations"
                                altText="Rotation"
                                onClick={() => setLeftPaneView('rotation')}
                                effectiveTheme={effectiveTheme}
                            />
                        </div>
                    )}
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
                            <button
                                className={`sidebar-button ${showDropdown ? 'active' : ''}`}
                                onClick={() => setShowDropdown(prev => !prev)}
                            >
                                <div className="icon-slot">
                                    <Sparkle size={24} />
                                </div>
                                <div className="label-slot">
                                    <span className="label-text">Home</span>
                                </div>
                            </button>

                            <div className={`sidebar-dropdown ${showDropdown ? 'open' : ''}`}>
                                <button className="sidebar-sub-button" onClick={() => navigate('/settings')}>
                                    <div className="icon-slot">
                                        <Settings size={24} className="settings-icon" stroke="currentColor" />
                                    </div>
                                    <div className="label-slot">
                                        <span className="label-text">Settings</span>
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
                                <button className="sidebar-sub-button" onClick={() => setShowChangelog(true)}>
                                    <div className="icon-slot">
                                        <History size={24} stroke="currentColor" />
                                    </div>
                                    <div className="label-slot">
                                        <span className="label-text">Changelog</span>
                                    </div>
                                </button>
                            </div>

                            {moveToolbarToSidebar && (
                                <div className="sidebar-toolbar">
                                    <ToolbarSidebarButton
                                        iconName="character"
                                        label="Characters"
                                        onClick={() => setLeftPaneView('characters')}
                                        selected={leftPaneView === 'characters'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="weapon"
                                        label="Weapon"
                                        onClick={() => setLeftPaneView('weapon')}
                                        selected={leftPaneView === 'weapon'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="echoes"
                                        label="Echoes"
                                        onClick={() => setLeftPaneView('echoes')}
                                        selected={leftPaneView === 'echoes'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="teams"
                                        label="Team Buffs"
                                        onClick={() => setLeftPaneView('teams')}
                                        selected={leftPaneView === 'teams'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="enemy"
                                        label="Enemy"
                                        onClick={() => setLeftPaneView('enemy')}
                                        selected={leftPaneView === 'enemy'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="buffs"
                                        label="Custom Bonuses"
                                        onClick={() => setLeftPaneView('buffs')}
                                        selected={leftPaneView === 'buffs'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="rotations"
                                        label="Rotation"
                                        onClick={() => setLeftPaneView('rotation')}
                                        selected={leftPaneView === 'rotations'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                </div>
                            )}

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
                        {/* Footer */}
                        <div className="sidebar-footer">
                            <ResetButton/>
                        </div>
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
                                                characterRuntimeStates={characterRuntimeStates}
                                                setCharacterRuntimeStates={setCharacterRuntimeStates}
                                                effectiveTheme={effectiveTheme}
                                                triggerRef={triggerRef}
                                            />
                                        ) : (
                                            <div className="loading">Loading characters...</div>
                                        )
                                    )}
                                    {leftPaneView === 'weapon' && (
                                        <WeaponPane
                                            activeCharacter={activeCharacter}
                                            combatState={combatState}
                                            setCombatState={setCombatState}
                                            weapons={weapons}
                                            characterRuntimeStates={characterRuntimeStates}
                                            setCharacterRuntimeStates={setCharacterRuntimeStates}
                                        />
                                    )}
                                    {leftPaneView === 'enemy' && (
                                        <EnemyPane enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel} enemyRes={enemyRes} setEnemyRes={setEnemyRes} combatState={combatState} setCombatState={setCombatState} />
                                    )}
                                    {leftPaneView === 'buffs' && (
                                        <CustomBuffsPane customBuffs={customBuffs} setCustomBuffs={setCustomBuffs} />
                                    )}
                                    {leftPaneView === 'teams' && (
                                        <BuffsPane
                                            characters={characters}
                                            team={team}
                                            setTeam={setTeam}
                                            setActiveCharacterId={setActiveCharacterId}
                                            combatState={combatState}
                                            setCombatState={setCombatState}
                                            characterRuntimeStates={characterRuntimeStates}
                                            activeCharacter={activeCharacter}
                                            setCharacterRuntimeStates={setCharacterRuntimeStates}
                                        />
                                    )}
                                    {leftPaneView === 'rotation' && (
                                        <RotationsPane
                                            activeCharacter={activeCharacter}
                                            characterRuntimeStates={characterRuntimeStates}
                                            characters={characters}
                                            setActiveCharacter={setActiveCharacter}
                                            setActiveCharacterId={setActiveCharacterId}
                                            setCharacterRuntimeStates={setCharacterRuntimeStates}
                                            setTeam={setTeam}
                                            setSliderValues={setSliderValues}
                                            setCharacterLevel={setCharacterLevel}
                                            setTraceNodeBuffs={setTraceNodeBuffs}
                                            setCustomBuffs={setCustomBuffs}
                                            setCombatState={setCombatState}
                                            setBaseCharacterState={setBaseCharacterState}
                                            characterStates={characterStates}
                                            finalStats={finalStats}
                                            combatState={combatState}
                                            mergedBuffs={mergedBuffs}
                                            sliderValues={sliderValues}
                                            characterLevel={characterLevel}
                                            rotationEntries={rotationEntries}
                                            setRotationEntries={setRotationEntries}
                                            currentSliderColor={currentSliderColor}
                                        />
                                    )}
                                    {leftPaneView === 'echoes' && (
                                        <EchoesPane
                                            echoId={echoes}
                                            charId={charId}
                                            characterState={characterState}
                                            setCharacterState={setCharacterState}
                                            characterRuntimeStates={characterRuntimeStates}
                                            setCharacterRuntimeStates={setCharacterRuntimeStates}
                                        />
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
                                        rotationEntries={rotationEntries}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <ChangelogModal open={showChangelog} onClose={() => setShowChangelog(false)} />
        </>
    );
}
