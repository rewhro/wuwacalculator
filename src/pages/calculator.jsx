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
import BuffsPane, {getResolvedTeamRotations} from "../components/BuffsPane.jsx";
import CustomBuffsPane from '../components/CustomBuffsPane';
import ToolbarIconButton, {ToolbarSidebarButton} from '../components/ToolbarIconButton';
import ResetButton, {ResetCharacter} from '../components/ResetButton.jsx';
import { attributeColors, attributeIcons, elementToAttribute } from '../utils/attributeHelpers';
import { getFinalStats } from '../utils/getStatsForLevel';
import { getUnifiedStatPool } from '../utils/getUnifiedStatPool';
import { usePersistentState } from '../hooks/usePersistentState';
import useDarkMode from '../hooks/useDarkMode';
import {getBuffsLogic, getCharacterOverride} from '../data/character-behaviour';
import ChangelogModal from '../components/ChangelogModal';
import { Settings, HelpCircle, History, Moon, Sun, Info, Sparkle, UserRound } from 'lucide-react';
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
import {getSkillDamageCache} from "../utils/skillDamageCache.js";
import CharacterOverviewPane from "../components/CharacterOverview.jsx";
import {isEqual} from "lodash";
import {calculateRotationTotals, getMainRotationTotals} from "../components/Rotations.jsx";

export default function Calculator() {
    const [characters, setCharacters] = useState([]);
    loadBase( characters );
    const navigate = useNavigate();
    const LATEST_CHANGELOG_VERSION = '2025-06-27 18:03';
    const [showChangelog, setShowChangelog] = useState(false);
    const [shouldScrollChangelog, setShouldScrollChangelog] = useState(false);
    const [characterLevel, setCharacterLevel] = useState(1);
    const { isDark, theme, setTheme, effectiveTheme } = useDarkMode();
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };
    const [leftPaneView, setLeftPaneView] = usePersistentState('leftPaneView','characters');
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
    const defaultCombatState = { enemyLevel: enemyLevel ?? 100, enemyRes: enemyRes ?? 20, critRate: 0, critDmg: 0, weaponBaseAtk: 0, spectroFrazzle: 0, aeroErosion: 0, atkPercent: 0, hpPercent: 0, defPercent: 0, energyRegen: 0 };
    const [characterState, setCharacterState] = useState({ activeStates: {} });
    const [showDropdown, setShowDropdown] = useState(false);
    const [team, setTeam] = useState([activeCharacterId ?? null, null, null]);
    const [moveToolbarToSidebar, setMoveToolbarToSidebar] = useState(false);
    const [weapons, setWeapons] = useState({});
    const charId = activeCharacterId ?? activeCharacter?.id ?? activeCharacter?.link;
    const [rotationEntries, setRotationEntries] = useState([]);
    const equippedEchoes = characterRuntimeStates?.[charId]?.equippedEchoes ?? [];
    const echoStats = getEchoStatsFromEquippedEchoes(equippedEchoes);
    const [showSubHits, setShowSubHits] = usePersistentState('showSubHits', false);
    const splitInstance = useRef(null);
    const [showCharacterOverview, setShowCharacterOverview] = usePersistentState('showCharacterOverview',false);
    const [savedRotations, setSavedRotations] = usePersistentState('globalSavedRotations', []);
    const teamRotation = getResolvedTeamRotations(characterRuntimeStates[charId], characterRuntimeStates, savedRotations);
    const [savedTeamRotations, setSavedTeamRotations] = usePersistentState('globalSavedTeamRotations', []);

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
            setShowChangelog(true);
            setShouldScrollChangelog(true);
            localStorage.setItem('seenChangelogVersion', LATEST_CHANGELOG_VERSION);
        }
    }, []);

    useEffect(() => {
        if (showChangelog && shouldScrollChangelog) {
            const timeout = setTimeout(() => setShouldScrollChangelog(false), 100);
            return () => clearTimeout(timeout);
        }
    }, [showChangelog, shouldScrollChangelog]);

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
        if (!showCharacterOverview) {
            const setupSplit = () => {
                const left = document.querySelector('#left-pane');
                const right = document.querySelector('#right-pane');

                if (left && right) {
                    document.querySelectorAll('.gutter').forEach(gutter => gutter.remove());

                    splitInstance.current = Split(['#left-pane', '#right-pane'], {
                        sizes: [50, 50],
                        gutterSize: 1
                    });
                }
            };

            requestAnimationFrame(setupSplit);
        }
    }, [showCharacterOverview]);

    useLayoutEffect(() => {
        const handleResize = () => {
            const desktopThreshold = 910;
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
    }, [showCharacterOverview]);

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
                    rotationEntries: rotationEntries,
                    FinalStats: finalStats ?? {},
                    allSkillResults: allSkillResults ?? {},
                    teamRotation: teamRotation ?? {}
                }
            }));
        }

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
    let finalStats = getFinalStats(activeCharacter, baseCharacterState, characterLevel, mergedBuffs, combatState);

    useEffect(() => {
        if (!activeCharacter) return;

        const charId = activeCharacter.Id ?? activeCharacter.id ?? activeCharacter.link;

        setCharacterRuntimeStates(prev => {
            const prevStats = prev[charId]?.FinalStats;
            const same =
                JSON.stringify(prevStats) === JSON.stringify(finalStats);

            if (same) return prev;

            return {
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
                    FinalStats: finalStats,
                    allSkillResults: allSkillResults,
                }
            };
        });
    }, [characterLevel, sliderValues, traceNodeBuffs, customBuffs, combatState, finalStats]);

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

    useLayoutEffect(() => {
        const handleResize = () => {
            setMoveToolbarToSidebar(window.innerWidth < 900);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const allSkillResults = getSkillDamageCache();

    useEffect(() => {
        if (!teamRotation) return;

        const existing = characterRuntimeStates?.[charId]?.teamRotation ?? {};
        if (!isEqual(existing, teamRotation)) {
            setCharacterRuntimeStates(prev => ({
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    teamRotation
                }
            }));
        }

    }, [characterRuntimeStates]);

    useEffect(() => {
        if (!charId) return;

        const runtime = characterRuntimeStates?.[charId];
        if (!runtime) return;

        const hasSummary = !!runtime.teamRotationSummary;

        if (!hasSummary) {
            const teamRotationSummary = {
                name: runtime.Name ?? '',
                total: { normal: 0, crit: 0, avg: 0 },
            };

            setCharacterRuntimeStates(prev => ({
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    teamRotationSummary
                }
            }));
        }
    }, [characterRuntimeStates]);

    useEffect(() => {
        const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
        const cache = characterRuntimeStates?.[charId]?.allSkillResults ?? [];

        setRotationEntries(prev => {
            const updated = prev.map(entry => {
                const skill = cache.find(s => s.name === entry.label && s.tab === entry.tab);
                const isVisible = skill?.visible !== false;
                return { ...entry, visible: isVisible };
            });

            if (charId && characterRuntimeStates?.[charId]) {
                setCharacterRuntimeStates(prevStates => ({
                    ...prevStates,
                    [charId]: {
                        ...prevStates[charId],
                        rotationEntries: updated
                    }
                }));
            }

            return updated;
        });
    }, [sliderValues, charId]);

    const keywords = getHighlightKeywords(activeCharacter);

    const rarityMap = Object.fromEntries(
        Object.entries(characterStates)
            .map(([key, val]) => [val.Id, val.Rarity])
    );

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1070);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [isOverlayClosing, setIsOverlayClosing] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1070);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setHamburgerOpen(false);
        }
    }, [isMobile, leftPaneView, showCharacterOverview]);

    useEffect(() => {
        if (hamburgerOpen) {
            setIsOverlayVisible(true);
        } else {
            setIsOverlayClosing(true);
            setTimeout(() => {
                setIsOverlayVisible(false);
                setIsOverlayClosing(false);
            }, 400);
        }
    }, [hamburgerOpen]);

    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setResetModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const layoutRef = useRef(null);
    useLayoutEffect(() => {
        if (layoutRef.current) {
            layoutRef.current.scrollTop = 0;
        }
    }, [leftPaneView]);

    const switchLeftPane = (paneName) => {
        setShowCharacterOverview(false);
        setLeftPaneView(paneName);
    };

    useEffect(() => {
        const characterIconPaths = characters.map(char =>
            char.icon || 'https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead256_1_UI.webp'
        );
        preloadImages([...characterIconPaths]);
    }, [characters]);

    const handleReset = () => {
        const activeId = activeCharacterId;
        if (!activeId) return;

        const runtime = JSON.parse(localStorage.getItem('characterRuntimeStates') || '{}');
        delete runtime[activeId];
        localStorage.setItem('characterRuntimeStates', JSON.stringify(runtime));

        setCharacterRuntimeStates(prev => {
            const updated = { ...prev };
            delete updated[activeId];
            return updated;
        });

        setSliderValues(defaultSliderValues);
        setCustomBuffs(defaultCustomBuffs);
        setTraceNodeBuffs(defaultTraceBuffs);
        setCharacterLevel(1);
        setRotationEntries([]);
        setTeam([activeId ?? null, null, null]);

        setCombatState(prev => {
            const weaponId = prev.weaponId;
            const weapon = weapons?.[weaponId];

            if (weapon) {
                const levelData = weapon.Stats?.["0"]?.["1"] ?? weapon.Stats?.["0"]?.["0"];
                const baseAtk = levelData?.[0]?.Value ?? 0;
                const stat = levelData?.[1] ?? null;
                const mappedStat = mapExtraStatToCombat(stat);

                return {
                    ...defaultCombatState,
                    enemyLevel: prev.enemyLevel,
                    enemyRes: prev.enemyRes,
                    weaponId,
                    weaponLevel: 1,
                    weaponRank: 1,
                    weaponBaseAtk: baseAtk,
                    weaponStat: stat,
                    weaponRarity: weapon.Rarity ?? 1,
                    weaponEffect: weapon.Effect ?? null,
                    weaponEffectName: weapon.EffectName ?? null,
                    weaponParam: weapon.Param ?? [],
                    ...mappedStat
                };
            }

            return {
                ...defaultCombatState,
                enemyLevel: prev.enemyLevel,
                enemyRes: prev.enemyRes
            };
        });
    };

    useEffect(() => {
        const cleanedStates = {};

        for (const [charId, state] of Object.entries(characterRuntimeStates)) {
            const { allSkillsResults, ...rest } = state;
            cleanedStates[charId] = rest;
        }

        setCharacterRuntimeStates(cleanedStates);
    }, []);

    useEffect(() => {
        const raw = JSON.parse(localStorage.getItem('characterRuntimeStates') || '{}');
        const cleaned = {};

        for (const [charId, state] of Object.entries(raw)) {
            const { allSkillsResults, ...rest } = state;
            cleaned[charId] = rest;
        }

        localStorage.setItem('characterRuntimeStates', JSON.stringify(cleaned));
    }, []);

    const allRotations = getMainRotationTotals(charId, characterRuntimeStates, savedRotations, savedTeamRotations);

    //console.log(characterRuntimeStates[charId]);

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
                keywords={keywords}
            />

            <div className="layout">
                <div className="toolbar">
                    {!moveToolbarToSidebar && (
                        <div className="toolbar-group">
                            <ToolbarIconButton
                                iconName="character"
                                altText="Characters"
                                onClick={() => switchLeftPane('characters')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="weapon"
                                altText="Weapon"
                                onClick={() => switchLeftPane('weapon')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="echoes"
                                altText="Echoes"
                                onClick={() => switchLeftPane('echoes')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="teams"
                                altText="Team"
                                onClick={() => switchLeftPane('teams')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="enemy"
                                altText="Enemy"
                                onClick={() => switchLeftPane('enemy')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="buffs"
                                altText="Buffs"
                                onClick={() => switchLeftPane('buffs')}
                                effectiveTheme={effectiveTheme}
                            />
                            <ToolbarIconButton
                                iconName="rotations"
                                altText="Rotation"
                                onClick={() => switchLeftPane('rotation')}
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

                <div className="horizontal-layout">
                    <div
                        className={`sidebar ${
                            isMobile
                                ? hamburgerOpen ? 'open' : ''
                                : hamburgerOpen ? 'expanded' : 'collapsed'
                        }`}
                    >
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
                                        onClick={() => switchLeftPane('characters')}
                                        selected={leftPaneView === 'characters'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="weapon"
                                        label="Weapon"
                                        onClick={() => switchLeftPane('weapon')}
                                        selected={leftPaneView === 'weapon'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="echoes"
                                        label="Echoes"
                                        onClick={() => switchLeftPane('echoes')}
                                        selected={leftPaneView === 'echoes'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="teams"
                                        label="Team Buffs"
                                        onClick={() => switchLeftPane('teams')}
                                        selected={leftPaneView === 'teams'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="enemy"
                                        label="Enemy"
                                        onClick={() => switchLeftPane('enemy')}
                                        selected={leftPaneView === 'enemy'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="buffs"
                                        label="Custom Bonuses"
                                        onClick={() => switchLeftPane('buffs')}
                                        selected={leftPaneView === 'buffs'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                    <ToolbarSidebarButton
                                        iconName="rotations"
                                        label="Rotation"
                                        onClick={() => switchLeftPane('rotation')}
                                        selected={leftPaneView === 'rotations'}
                                        effectiveTheme={effectiveTheme}
                                    />
                                </div>
                            )}

                            <button className="sidebar-button" onClick={() => setShowCharacterOverview(!showCharacterOverview)}>
                                <div className="icon-slot">
                                    <UserRound />
                                </div>
                                <div className="label-slot">
                                    <span className="label-text">
                                        Overview
                                    </span>
                                </div>
                            </button>

                            <button className="sidebar-button" onClick={toggleTheme}>
                                <div className="icon-slot theme-toggle-icon">
                                    <Sun className="icon-sun" size={24} />
                                    <Moon className="icon-moon" size={24} />
                                </div>
                                <div className="label-slot">
                                    <span className="label-text">
                                        {effectiveTheme === 'light' ? 'Dawn' : 'Dusk'}
                                    </span>
                                </div>
                            </button>
                        </div>
                        <div className="sidebar-footer">
                            <a
                                href="https://discord.gg/wNaauhE4uH"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sidebar-button discord"
                            >
                                <div className="icon-slot">
                                    <img src="/assets/icons/discord.svg" alt="Discord" className="discord-icon" style={{ maxWidth:'24px', maxHeight:'24px' }} />
                                </div>
                                <div className="label-slot">
                                    <span className="label-text">
                                        Discord
                                    </span>
                                </div>
                            </a>

                            <ResetButton onClick={() => setResetModalOpen(true)} />
                        </div>
                    </div>

                    {isOverlayVisible && isMobile && (
                        <div
                            className={`mobile-overlay ${hamburgerOpen ? 'visible' : ''} ${isOverlayClosing ? 'closing' : ''}`}
                            onClick={() => setHamburgerOpen(false)}
                        />
                    )}

                    <div className="main-content">
                        <div className={`layout ${isCollapsedMode ? 'collapsed-mode' : ''}`} ref={layoutRef}>
                            {showCharacterOverview ? (
                                <CharacterOverviewPane
                                    characters={characters}
                                    keywords={keywords}
                                    activeCharacterId={activeCharacterId}
                                    characterRuntimeStates={characterRuntimeStates}
                                    onClose={() => setShowCharacterOverview(false)}
                                    weapons={weapons}
                                    handleCharacterSelect={handleCharacterSelect}
                                    switchLeftPane={switchLeftPane}
                                    setLeftPaneView={setLeftPaneView}
                                    isCollapsedMode={isCollapsedMode}
                                    setCharacterRuntimeStates={setCharacterRuntimeStates}
                                    handleReset={handleReset}
                                    allRotations={allRotations}
                                />
                                ) : (
                            <div className="split">
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
                                                characterStates={characterStates}
                                                attributeMap={attributeMap}
                                                weaponMap={weaponMap}
                                                keywords={keywords}
                                                rarityMap={rarityMap}
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
                                            characterStates={characterStates}
                                            rarityMap={rarityMap}
                                            savedRotations={savedRotations}
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
                                            savedRotations={savedRotations}
                                            setSavedRotations={setSavedRotations}
                                            charId={charId}
                                            setSavedTeamRotations={setSavedTeamRotations}
                                            savedTeamRotations={savedTeamRotations}
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
                                        showSubHits={showSubHits}
                                        setShowSubHits={setShowSubHits}
                                        setCharacterRuntimeStates={setCharacterRuntimeStates}
                                        characterStates={characterStates}
                                    />
                                </div>
                            </div>
                                )}
                        </div>
                    </div>

                </div>
            </div>
            {resetModalOpen && (
                <ResetCharacter
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
                    handleClose={handleClose}
                    isClosing={isClosing}
                    setTeam={setTeam}
                    handleReset={handleReset}
                    setHamburgerOpen={setHamburgerOpen}
                />
            )}
            <ChangelogModal
                open={showChangelog}
                onClose={() => setShowChangelog(false)}
                shouldScroll={shouldScrollChangelog}
            />
        </>
    );
}

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


export const imageCache = {};
const preloadedImages = new Set();
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
        let splashPaths = [];
        if (characterStatesRaw) {
            splashPaths = Object.values(characterStatesRaw)
                .map(char => char.SplashArt)
                .filter(Boolean);
        }


        preloadImages([
            ...darkIcons,
            ...lightIcons,
            ...skillIconPaths,
            ...baseImages,
            ...attributeIconPaths,
            ...weaponIconPaths,
            ...splashPaths
        ]);
    }, []);
}

function getHighlightKeywords(character) {
    const result = [];
    const skillTrees = character?.raw?.SkillTrees;
    if (skillTrees && typeof skillTrees === 'object') {
        if (character?.displayName) {
            result.push(character.displayName);
        }

        const skillNames = [];
        const levelNames = [];

        Object.values(skillTrees).forEach(tree => {
            const skills = tree?.Skill;

            if (skills?.Name) {
                skillNames.push(skills.Name);
            }

            const levelObj = skills?.Level;
            if (levelObj && typeof levelObj === 'object') {
                Object.values(levelObj).forEach(level => {
                    if (level?.Name) {
                        levelNames.push(level.Name);
                    }
                });
            }
        });

        let combined = [...skillNames.slice(0, -8), ...levelNames];
        const cleaned = combined
            .filter(name => {
                return !(
                    name.includes("Concerto Regen") ||
                    name.includes("Cost") ||
                    name.includes("Cooldown") ||
                    name.includes("CD") ||
                    name.includes("HA") ||
                    name.includes('Skill')

                );
            })
            .map(name => {
                return name.replace(/( DMG| Damage)$/i, '');
            });

        result.push(...cleaned);
    }

    result.push('Negative Statuses', 'Negative Status');


    return result;
}