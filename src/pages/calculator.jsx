import React, { useState, useEffect, useRef } from 'react';
import Split from 'split.js';
import { fetchCharacters } from '../json-data-scripts/wutheringFetch';
import characterStatesRaw from '../data/characterStates.json';
import '../styles';
import SkillsModal from '../components/SkillsModal';
import CharacterSelector, {traceIcons} from '../components/CharacterSelector';
import CharacterStats from '../components/CharacterStats';
import DamageSection from '../components/DamageSection';
import WeaponPane, {mapExtraStatToCombat} from '../components/WeaponPane';
import EnemyPane from '../components/EnemyPane';
import BuffsPane from "../components/BuffsPane.jsx";
import CustomBuffsPane from '../components/CustomBuffsPane';
import ToolbarIconButton, {ToolbarSidebarButton} from '../components/ToolbarIconButton';
import ResetButton from '../components/ResetButton.jsx';
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
import EchoesPane from '../components/EchoesPane';
import {echoes} from "../json-data-scripts/getEchoes.js";
import {applyEchoSetBuffLogic, applyMainEchoBuffLogic, applySetEffect} from "../data/buffs/setEffect.js";
import {getEchoStatsFromEquippedEchoes, statIconMap} from "../utils/echoHelper.js";
import { useLayoutEffect } from 'react';

export default function Calculator() {
    loadBase();
    const navigate = useNavigate();
    const LATEST_CHANGELOG_VERSION = '2025-06-19 12:46';
    const [showChangelog, setShowChangelog] = useState(false);
    const [characterLevel, setCharacterLevel] = useState(1);
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
    const defaultCombatState = { enemyLevel: 90, enemyRes: 10, critRate: 0, critDmg: 0, weaponBaseAtk: 0, spectroFrazzle: 0, aeroErosion: 0, atkPercent: 0, hpPercent: 0, defPercent: 0, energyRegen: 0 };
    const [characterState, setCharacterState] = useState({ activeStates: {} });
    const [showDropdown, setShowDropdown] = useState(false);
    const [team, setTeam] = useState([activeCharacterId ?? null, null, null]);
    const [moveToolbarToSidebar, setMoveToolbarToSidebar] = useState(false);
    const [weapons, setWeapons] = useState({});
    const charId = activeCharacterId ?? activeCharacter?.id ?? activeCharacter?.link;
    const [rotationEntries, setRotationEntries] = useState([]);
    const equippedEchoes = characterRuntimeStates?.[charId]?.equippedEchoes ?? [];
    const echoStats = getEchoStatsFromEquippedEchoes(equippedEchoes);

    useEffect(() => {
        Promise.all([fetchCharacters(), fetchWeapons()]).then(([charData, weaponData]) => {
            setWeapons(weaponData);

            const sorted = [...charData].sort((a, b) =>
                a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' })
            );
            setCharacters(sorted);

            const resolvedCharId = activeCharacterId ?? 1506;
            const foundChar = sorted.find(c => String(c.Id ?? c.id ?? c.link) === String(resolvedCharId));
            if (!foundChar) return;

            const weaponType = foundChar.weaponType ?? foundChar.Weapon ?? foundChar.raw?.Weapon ?? 0;

            setActiveCharacter({ ...foundChar, weaponType });
            if (!activeCharacterId) setActiveCharacterId(resolvedCharId);

            const profile = characterRuntimeStates[resolvedCharId] ?? {};
            const state = characterStates.find(c => String(c.Id) === String(foundChar.link));
            if (profile.Team && !profile.Team[0]) {
                profile.Team[0] = resolvedCharId;
            }
            setTeam(profile.Team ?? [resolvedCharId, null, null]);
            setBaseCharacterState(state ?? null);
            setCharacterLevel(profile.CharacterLevel ?? 1);
            setSliderValues(profile.SkillLevels ?? defaultSliderValues);
            setTraceNodeBuffs(profile.TraceNodeBuffs ?? profile.TemporaryBuffs ?? defaultTraceBuffs);
            profile.TraceNodeBuffs = profile.TraceNodeBuffs ?? profile.TemporaryBuffs ?? defaultTraceBuffs;
            delete profile.TemporaryBuffs;
            delete profile.CharacterState;
            setCustomBuffs(profile.CustomBuffs ?? defaultCustomBuffs);

            // ✅ Set default weapon only after weapons are loaded
            const defaultWeapon = Object.values(weaponData)
                .filter(w => w.Type === weaponType)
                .sort((a, b) => (b.Rarity ?? 0) - (a.Rarity ?? 0))[0];

            if (defaultWeapon) {
                const hasWeapon = profile.CombatState?.weaponId != null;
                const levelData = defaultWeapon.Stats?.["0"]?.["1"] ?? defaultWeapon.Stats?.["0"]?.["0"];
                const baseAtk = levelData?.[0]?.Value ?? 0;
                const stat = levelData?.[1] ?? null;
                const mappedStat = mapExtraStatToCombat(stat);
                const extraCombatKeys = [
                    'weaponId', 'weaponLevel', 'weaponBaseAtk', 'weaponStat',
                    'weaponRarity', 'weaponEffect', 'weaponEffectName', 'weaponParam', 'weaponRank',
                    'atkPercent', 'defPercent', 'hpPercent', 'energyRegen'
                ];
                const cleaned = [
                    ...Object.keys(defaultCombatState),
                    ...extraCombatKeys
                ];
                profile.CombatState = Object.fromEntries(
                    Object.entries(profile.CombatState ?? {}).filter(([key]) => cleaned.includes(key))
                );
                setCombatState(prev => ({
                    ...defaultCombatState,
                    ...(profile.CombatState ?? {}),
                    enemyLevel: prev.enemyLevel,
                    enemyRes: prev.enemyRes,
                    ...(hasWeapon ? {} : {
                        weaponId: defaultWeapon.Id,
                        weaponLevel: 1,
                        weaponBaseAtk: baseAtk,
                        weaponStat: stat,
                        weaponRarity: defaultWeapon.Rarity ?? 1,
                        weaponEffect: defaultWeapon.Effect ?? null,
                        weaponEffectName: defaultWeapon.EffectName ?? null,
                        weaponParam: defaultWeapon.Param ?? [],
                        weaponRank: 1,
                        atkPercent: 0,
                        defPercent: 0,
                        hpPercent: 0,
                        critRate: 0,
                        critDmg: 0,
                        energyRegen: 0,
                        ...mappedStat
                    })
                }));
            }
            const rawEntries = profile.rotationEntries ?? [];
            const normalizedEntries = rawEntries.map(entry => ({
                ...entry,
                createdAt: entry.createdAt ?? Date.now() + Math.random()
            }));
            setRotationEntries(normalizedEntries);
        });
    }, []);

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

    useLayoutEffect(() => {
        const handleResize = () => {
            const desktopThreshold = 1060;
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
                const sidebarWidth = sidebar.offsetWidth;
                const totalPaneWidth = leftWidth + rightWidth + sidebarWidth;
                setIsCollapsedMode(window.innerWidth < totalPaneWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        // ✅ Save the current active character's state BEFORE switching
        if (activeCharacter && charId) {
            const currentCharId = charId;
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
                    TraceNodeBuffs: traceNodeBuffs,
                    CustomBuffs: customBuffs,
                    CombatState: combatState,
                    Team: team,
                    rotationEntries: rotationEntries
                }
            }));
        }

        // ✅ Start switching to the new character
        const newMainId = char.Id ?? char.id ?? char.link;
        const cached = characterRuntimeStates[newMainId] ?? {};

        if (!cached.Team || !cached.Team[0]) {
            cached.Team = [newMainId, null, null];
        }

        setTeam(cached.Team);
        setRotationEntries((cached.rotationEntries ?? []).map(entry => ({
            ...entry,
            multiplier: typeof entry.multiplier === 'number' ? entry.multiplier : 1,
            createdAt: entry.createdAt ?? Date.now() + Math.random()
        })));

        setActiveCharacter(char);
        setActiveCharacterId(newMainId);
        setBaseCharacterState(
            cached?.Stats ? { Stats: cached.Stats } : characterStates.find(c => String(c.Id) === String(newMainId)) ?? null
        );
        setCharacterLevel(cached?.CharacterLevel ?? 1);
        setSliderValues(cached?.SkillLevels ?? defaultSliderValues);
        setTraceNodeBuffs(cached?.TraceNodeBuffs ?? cached?.TemporaryBuffs ?? defaultTraceBuffs);
        setCustomBuffs(cached?.CustomBuffs ?? defaultCustomBuffs);

        const cachedCombatState = {
            ...defaultCombatState,
            ...(cached?.CombatState ?? {}),
            enemyLevel: combatState.enemyLevel,
            enemyRes: combatState.enemyRes
        };

        const alreadyHasWeapon = cachedCombatState?.weaponId != null;

        if (!alreadyHasWeapon) {
            const weaponType = char.weaponType ?? char.Weapon ?? char.raw?.Weapon ?? 0;
            const defaultWeapon = Object.values(weapons)
                .filter(w => w.Type === weaponType)
                .sort((a, b) => (b.Rarity ?? 0) - (a.Rarity ?? 0))[0];

            if (defaultWeapon) {
                const levelData = defaultWeapon.Stats?.["0"]?.["1"] ?? defaultWeapon.Stats?.["0"]?.["0"];
                const baseAtk = levelData?.[0]?.Value ?? 0;
                const stat = levelData?.[1] ?? null;
                const mappedStat = mapExtraStatToCombat(stat);

                Object.assign(cachedCombatState, {
                    weaponId: defaultWeapon.Id,
                    weaponLevel: 1,
                    weaponBaseAtk: baseAtk,
                    weaponStat: stat,
                    weaponRarity: defaultWeapon.Rarity ?? 1,
                    weaponEffect: defaultWeapon.Effect ?? null,
                    weaponEffectName: defaultWeapon.EffectName ?? null,
                    weaponParam: defaultWeapon.Param ?? [],
                    weaponRank: 1,
                    atkPercent: 0,
                    defPercent: 0,
                    hpPercent: 0,
                    critRate: 0,
                    critDmg: 0,
                    energyRegen: 0,
                    ...mappedStat
                });
            }
        }

        setCombatState(cachedCombatState);
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
            activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {}
        };

        const result = buffsLogic({
            mergedBuffs,
            characterState,
            activeCharacter,
            combatState
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
                TraceNodeBuffs: traceNodeBuffs,
                CustomBuffs: customBuffs,
                CombatState: combatState,
            }
        }));
    }, [characterLevel, sliderValues, traceNodeBuffs, customBuffs, combatState]);

    let finalStats = getFinalStats(activeCharacter, baseCharacterState, characterLevel, mergedBuffs, combatState);
/*
    console.log(team);
    team.forEach((id) => {
        if (!id) return;
        console.log(id, characterRuntimeStates[id].rotationEntries);
    });
    */

    useEffect(() => {
        const cleaned = {};
        for (const [id, data] of Object.entries(characterRuntimeStates)) {
            if ('CharacterState' in data) {
                const { CharacterState, ...rest } = data;
                cleaned[id] = rest;
            } else {
                cleaned[id] = data;
            }
        }
        setCharacterRuntimeStates(cleaned);
    }, []);

    useEffect(() => {
        localStorage.removeItem('characterLevel');
        localStorage.removeItem('rotationEntriesStore');
        localStorage.removeItem('teamCache');
        localStorage.removeItem('team');
        localStorage.removeItem('sliderValues');
        setCharacterRuntimeStates(prev => {
            const updated = {};

            for (const [charId, runtime] of Object.entries(prev)) {
                const { TemporaryBuffs, ...rest } = runtime;
                updated[charId] = rest;
            }

            return updated;
        });
        const raw = JSON.parse(localStorage.getItem('characterRuntimeStates') || '{}');
        const cleaned = {};

        for (const [charId, runtime] of Object.entries(raw)) {
            const { TemporaryBuffs, ...rest } = runtime;
            cleaned[charId] = rest;
        }
        localStorage.setItem('characterRuntimeStates', JSON.stringify(cleaned));
    }, []);


    /*
    useEffect(() => {
        Object.entries(characterRuntimeStates).forEach(([charId, state]) => {
            const entries = state.rotationEntries;
            if (Array.isArray(entries) && entries.length > 0) {
                console.log(`Character ID: ${charId}`);
                console.log("Rotation Entries:", entries);
            }
        });
    },[]);
*/
    useLayoutEffect(() => {
        const handleResize = () => {
            setMoveToolbarToSidebar(window.innerWidth < 900);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                            <ResetButton
                                activeId={charId}
                                setCharacterRuntimeStates={setCharacterRuntimeStates}
                                setSliderValues={setSliderValues}
                                setCustomBuffs={setCustomBuffs}
                                setTraceNodeBuffs={setTraceNodeBuffs}
                                setCombatState={setCombatState}
                                setCharacterLevel={setCharacterLevel}
                                setRotationEntries={setRotationEntries}
                                defaultSliderValues={defaultSliderValues}
                                defaultCustomBuffs={defaultCustomBuffs}
                                defaultTraceBuffs={defaultTraceBuffs}
                                defaultCombatState={defaultCombatState}
                                characterStates={characterStates}
                                characterRuntimeStates={characterRuntimeStates}
                                weapons={weapons}
                                combatState={combatState}
                            />
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
                                                traceNodeBuffs={traceNodeBuffs}
                                                setTraceNodeBuffs={setTraceNodeBuffs}
                                                characterRuntimeStates={characterRuntimeStates}
                                                setCharacterRuntimeStates={setCharacterRuntimeStates}
                                                effectiveTheme={effectiveTheme}
                                                triggerRef={triggerRef}
                                                attributeMap={attributeMap}
                                                weaponMap={weaponMap}
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
                                            setLeftPaneView={setLeftPaneView}
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
                                        traceNodeBuffs={traceNodeBuffs}
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
                                        currentSliderColor={currentSliderColor}
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

// Include helpers if needed:
export const attributeMap = {
    glacio: 1,
    fusion: 2,
    electro: 3,
    aero: 4,
    spectro: 5,
    havoc: 6,
};

export const weaponMap = {
    broadblade: 1,
    sword: 2,
    pistols: 3,
    gauntlets: 4,
    rectifier: 5,
};

const toolbarIconNames = [
    'character',
    'rotations',
    'buffs',
    'echoes',
    'enemy',
    'weapon',
    'teams',
    // etc.
];


const darkIcons = toolbarIconNames.map(name => `/assets/icons/dark/${name}.png`);
const lightIcons = toolbarIconNames.map(name => `/assets/icons/light/${name}.png`);

const skillIconPaths = traceIcons.flatMap(name => [
    `/assets/skill-icons/light/${name}.webp?v=light`,
    `/assets/skill-icons/dark/${name}.webp?v=dark`
]);

const baseImages = [
    '/assets/sample-import-image.png',
    '/assets/weapon-icons/default.webp',
    '/assets/echoes/default.webp'
];

const attributeIconPaths = Object.keys(attributeMap).flatMap(attr => [
    `/assets/attributes/attributes alt/${attr}.webp`,
    `/assets/attributes/${attr}.png`
]);

const weaponIconPaths = Object.keys(weaponMap).map(weapon =>
    `/assets/weapons/${weapon}.webp`
);


// Global cache
export const imageCache = {}; // { [src]: HTMLImageElement }
const preloadedImages = new Set();

/**
 * Preload a list of image URLs and store them in imageCache.
 * @param {string[]} srcList
 */
export const preloadImages = (srcList = []) => {
    srcList.forEach(src => {
        if (preloadedImages.has(src)) return;

        const img = new Image();
        img.onload = () => {
            imageCache[src] = img;
        };
        img.onerror = () => {
            console.warn(`Failed to preload image: ${src}`);
        };
        img.src = src;
        preloadedImages.add(src);
    });
};

export function loadBase() {
    useEffect(() => {
        preloadImages([...darkIcons, ...lightIcons, ...skillIconPaths, ...baseImages, ...attributeIconPaths, ...weaponIconPaths]);
    }, []);
}