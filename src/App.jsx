// ✅ FINAL FIXED App.jsx with LEVEL SCALING + BUFFS
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
import WeaponPane from './components/WeaponPane';
import EnemyPane from './components/EnemyPane';
import CustomBuffsPane from './components/CustomBuffsPane';
import ToolbarIconButton from './components/ToolbarIconButton';

import { getStatsForLevel } from './utils/getStatsForLevel';
import { attributeColors, attributeIcons, elementToAttribute } from './utils/attributeHelpers';
import { getFinalStats } from './utils/getStatsForLevel';
import { getUnifiedStatPool } from './utils/getUnifiedStatPool';

export default function App() {
    const [leftPaneView, setLeftPaneView] = useState('characters');
    const [isCollapsedMode, setIsCollapsedMode] = useState(false);

    const defaultTemporaryBuffs = {
        atkPercent: 0,
        hpPercent: 0,
        defPercent: 0,
        healingBonus: 0,
        critRate: 0,
        critDmg: 0,
        elementalBonuses: {
            aero: 0,
            glacio: 0,
            spectro: 0,
            fusion: 0,
            electro: 0,
            havoc: 0
        },
        activeNodes: {}
    };

    const [combatState, setCombatState] = useState({
        characterLevel: 1,
        enemyLevel: 1,
        enemyRes: 0,
        enemyResShred: 0,
        enemyDefShred: 0,
        enemyDefIgnore: 0,
        elementBonus: 0,
        elementDmgAmplify: {
            aero: 0,
            glacio: 0,
            spectro: 0,
            fusion: 0,
            electro: 0,
            havoc: 0
        },
        flatDmg: 0,
        damageTypeAmplify: {
            basic: 0,
            heavy: 0,
            skill: 0,
            ultimate: 0
        },
        dmgReduction: 0,
        elementDmgReduction: 0,
        critRate: 0,
        critDmg: 0
    });

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
    const [characterRuntimeStates, setCharacterRuntimeStates] = useState({});
    const [enemyLevel, setEnemyLevel] = useState(1);
    const [enemyRes, setEnemyRes] = useState(0);

    const [traceNodeBuffs, setTraceNodeBuffs] = useState({
        atkPercent: 0,
        hpPercent: 0,
        defPercent: 0,
        healingBonus: 0,
        critRate: 0,
        critDmg: 0,
        elementalBonuses: {
            aero: 0,
            glacio: 0,
            spectro: 0,
            fusion: 0,
            electro: 0,
            havoc: 0
        },
        activeNodes: {}
    });

    const [customBuffs, setCustomBuffs] = useState({
        atkFlat: 0,
        hpFlat: 0,
        defFlat: 0,
        atkPercent: 0,
        hpPercent: 0,
        defPercent: 0,
        critRate: 0,
        critDmg: 0,
        energyRegen: 0,
        healingBonus: 0,
        basicAtk: 0,
        heavyAtk: 0,
        resonanceSkill: 0,
        resonanceLiberation: 0,
        aero: 0,
        glacio: 0,
        spectro: 0,
        fusion: 0,
        electro: 0,
        havoc: 0
    });

    const [baseCharacterState, setBaseCharacterState] = useState(null);
    const menuRef = useRef();
    const characterStates = Object.values(characterStatesRaw);

    const currentAttribute = elementToAttribute[activeCharacter?.attribute] ?? '';
    const currentSliderColor = attributeColors[currentAttribute] ?? '#888';
    const attributeIconPath = attributeIcons[currentAttribute] ?? '';

    useEffect(() => {
        fetchCharacters().then(data => {
            setCharacters(data);

            // ✅ try to restore from localStorage
            const saved = JSON.parse(localStorage.getItem('wutheringAppState') ?? 'null');
            if (saved && saved.activeCharacterId) {
                const foundChar = data.find(c =>
                    String(c.Id ?? c.id ?? c.link) === String(saved.activeCharacterId)
                );
                if (foundChar) {
                    setActiveCharacter(foundChar);
                    setCharacterRuntimeStates(saved.characterRuntimeStates ?? {});
                    setTraceNodeBuffs(saved.temporaryBuffs ?? defaultTemporaryBuffs);
                    setCharacterLevel(saved.characterLevel ?? 1);

                    const state = characterStates.find(c => String(c.Id) === String(foundChar.link));
                    setBaseCharacterState(state ?? null);
                    return;
                }
            }

            // fallback: first char
            if (data.length > 0) {
                setActiveCharacter(data[0]);
                const state = characterStates.find(c => String(c.Id) === String(data[0].link));
                setBaseCharacterState(state ?? null);
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
            const desktopThreshold = 1050;  // 👉 choose safe desktop threshold

            if (window.innerWidth >= desktopThreshold) {
                // Force disable collapsed mode if we grow big again
                setIsCollapsedMode(false);
                return;
            }

            // Otherwise only check pane sizes for collapse
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

    useEffect(() => {
        const saveState = {
            characterRuntimeStates,
            activeCharacterId: activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link,
            temporaryBuffs: traceNodeBuffs,
            characterLevel
        };
        localStorage.setItem('wutheringAppState', JSON.stringify(saveState));
    }, [characterRuntimeStates, activeCharacter, traceNodeBuffs, characterLevel]);

    useEffect(() => {
        if (!activeCharacter) return;
        const activeNodeIds = Object.entries(traceNodeBuffs.activeNodes ?? {})
            .filter(([_, active]) => active)
            .map(([nodeId]) => Number(nodeId));

        const buffTotals = {
            atkPercent: 0,
            hpPercent: 0,
            defPercent: 0,
            healingBonus: 0,
            critRate: 0,
            critDmg: 0,
            energyRegen: 0,
            basicAtk: 0,
            heavyAtk: 0,
            resonanceSkill: 0,
            resonanceLiberation: 0,
            elementalBonuses: {
                aero: 0,
                glacio: 0,
                spectro: 0,
                fusion: 0,
                electro: 0,
                havoc: 0
            },
            activeNodes: traceNodeBuffs.activeNodes
        };

        const skillMap = {
            'ATK+': 'atkPercent',
            'HP+': 'hpPercent',
            'DEF+': 'defPercent',
            'Healing Bonus+': 'healingBonus',
            'Crit. Rate+': 'critRate',
            'Crit. DMG+': 'critDmg',
            'Aero DMG Bonus+': 'aero',
            'Glacio DMG Bonus+': 'glacio',
            'Spectro DMG Bonus+': 'spectro',
            'Fusion DMG Bonus+': 'fusion',
            'Electro DMG Bonus+': 'electro',
            'Havoc DMG Bonus+': 'havoc'
        };

        Object.entries(activeCharacter.raw?.SkillTrees ?? {}).forEach(([nodeId, node]) => {
            if (activeNodeIds.includes(Number(nodeId)) && node.NodeType === 4) {
                const name = node.Skill?.Name;
                const param = node.Skill?.Param?.[0] ?? '0%';
                const value = parseFloat(param.replace('%','')) || 0;
                const key = skillMap[name];
                if (!key) return;

                if (['aero','glacio','spectro','fusion','electro','havoc'].includes(key)) {
                    buffTotals.elementalBonuses[key] += value;
                } else {
                    buffTotals[key] += value;
                }
            }
        });

        /*
        // ✅ Studio patch → merge customBuffs
        buffTotals.atkPercent += customBuffs?.atkPercent ?? 0;
        buffTotals.hpPercent += customBuffs?.hpPercent ?? 0;
        buffTotals.defPercent += customBuffs?.defPercent ?? 0;
        buffTotals.critRate += customBuffs?.critRate ?? 0;
        buffTotals.critDmg += customBuffs?.critDmg ?? 0;
        buffTotals.healingBonus += customBuffs?.healingBonus ?? 0;

         */

        ['aero','glacio','spectro','fusion','electro','havoc'].forEach(element => {
            buffTotals.elementalBonuses[element] += customBuffs?.[element] ?? 0;
        });
        setCombatState(prev => ({
            ...prev,
            elementDmgAmplify: {
                ...prev.elementDmgAmplify,
                aero: customBuffs?.aeroAmplify ?? 0,
                glacio: customBuffs?.glacioAmplify ?? 0,
                spectro: customBuffs?.spectroAmplify ?? 0,
                fusion: customBuffs?.fusionAmplify ?? 0,
                electro: customBuffs?.electroAmplify ?? 0,
                havoc: customBuffs?.havocAmplify ?? 0
            }
        }));

        setCombatState(prev => ({
            ...prev,
            damageTypeAmplify: {
                basic: customBuffs?.basicAtkAmplify ?? 0,
                heavy: customBuffs?.heavyAtkAmplify ?? 0,
                skill: customBuffs?.resonanceSkillAmplify ?? 0,
                ultimate: customBuffs?.resonanceLiberationAmplify ?? 0
            }
        }));

        setTraceNodeBuffs(buffTotals);
    }, [traceNodeBuffs.activeNodes, activeCharacter, customBuffs]);

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
                    CurrentLevelMultipliers: {},
                    SkillLevels: sliderValues,
                    CurrentWeapon: null,
                    CharacterLevel: characterLevel,
                    TemporaryBuffs: traceNodeBuffs,
                    CombatState: combatState,
                    weapon: {
                        name: "",
                        baseAtk: 0
                    }
                }
            }));
        }

        const charId = char.Id ?? char.id ?? char.link;
        const cached = characterRuntimeStates[charId];
        setActiveCharacter(char);
        setBaseCharacterState(
            cached ? { Stats: cached.Stats } : characterStates.find(c => String(c.Id) === String(charId)) ?? null
        );
        setCharacterLevel(cached?.CharacterLevel ?? 1);
        setSliderValues(cached ? { ...sliderValues, ...cached.SkillLevels } : {
            normalAttack: 1, resonanceSkill: 1, forteCircuit: 1,
            resonanceLiberation: 1, introSkill: 1, sequence: 0
        });

        setTraceNodeBuffs(cached?.TemporaryBuffs ?? {
            atkPercent: 0,
            hpPercent: 0,
            defPercent: 0,
            healingBonus: 0,
            critRate: 0,
            critDmg: 0,
            elementalBonuses: {
                aero: 0,
                glacio: 0,
                spectro: 0,
                fusion: 0,
                electro: 0,
                havoc: 0
            },
            activeNodes: {}
        });

        setCombatState(cached?.CombatState ?? {
            characterLevel: 1,
            enemyLevel: 1,
            enemyRes: 0,
            enemyResShred: 0,
            enemyDefShred: 0,
            enemyDefIgnore: 0,
            elementBonus: 0,
            elementDmgAmplify: 0,
            flatDmg: 0,
            damageTypeAmplify: {
                basic: 0,
                heavy: 0,
                skill: 0,
                ultimate: 0
            },
            dmgReduction: 0,
            elementDmgReduction: 0,
            critRate: 0,
            critDmg: 0
        });

        setMenuOpen(false);
    };


    const mergedBuffs = getUnifiedStatPool([traceNodeBuffs, customBuffs, combatState]);

    mergedBuffs.basicAtk = mergedBuffs.basicAtk ?? 0;
    mergedBuffs.skillAtk = mergedBuffs.resonanceSkill ?? 0;
    mergedBuffs.ultimateAtk = mergedBuffs.resonanceLiberation ?? 0;

    const finalStats = getFinalStats(
        activeCharacter,
        baseCharacterState,
        characterLevel,
        mergedBuffs,
        combatState
    );

    console.log("🟢 Merged Buffs:", mergedBuffs);
    console.log("🟡 Final Stats:", finalStats);

    return (<>
            <SkillsModal skillsModalOpen={skillsModalOpen} setSkillsModalOpen={setSkillsModalOpen}
                         activeCharacter={activeCharacter} activeSkillTab={activeSkillTab}
                         setActiveSkillTab={setActiveSkillTab} sliderValues={sliderValues}
                         currentSliderColor={currentSliderColor} />

            <div className="layout">
                <div className="toolbar">
                    <ToolbarIconButton iconName="character" altText="Characters" onClick={() => setLeftPaneView('characters')} />
                    <ToolbarIconButton iconName="weapon" altText="Weapon" onClick={() => setLeftPaneView('weapon')} />
                    <ToolbarIconButton iconName="enemy" altText="Enemy" onClick={() => setLeftPaneView('enemy')} />
                    <ToolbarIconButton iconName="buffs" altText="Buffs" onClick={() => setLeftPaneView('buffs')} />
                </div>
                <div className="main-content">
                    <div className={`layout ${isCollapsedMode ? 'collapsed-mode' : ''}`}>
                        <div className="split">
                            <div id="left-pane" className={`partition ${leftPaneView}-mode`}>

                                {leftPaneView === 'characters' && (
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
                                    />
                                )}
                                {leftPaneView === 'weapon' && (
                                    <WeaponPane activeCharacter={activeCharacter}
                                                combatState={combatState}
                                                setCombatState={setCombatState}
                                    />
                                )}
                                {leftPaneView === 'enemy' && (
                                    <EnemyPane
                                        enemyLevel={enemyLevel}
                                        setEnemyLevel={setEnemyLevel}
                                        enemyRes={enemyRes}
                                        setEnemyRes={setEnemyRes}
                                        combatState={combatState}
                                        setCombatState={setCombatState}
                                    />
                                )}
                                {leftPaneView === 'buffs' && (
                                    <CustomBuffsPane customBuffs={customBuffs} setCustomBuffs={setCustomBuffs} />
                                )}
                            </div>

                            <div id="right-pane" className="partition">
                                <CharacterStats activeCharacter={activeCharacter}
                                                baseCharacterState={baseCharacterState}
                                                characterLevel={characterLevel}
                                                temporaryBuffs={traceNodeBuffs}
                                                finalStats={finalStats}
                                                combatState={combatState} />

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
        </>
    );
}