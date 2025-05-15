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

    const [temporaryBuffs, setTemporaryBuffs] = useState({
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
        basic: 0,
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
                    setTemporaryBuffs(saved.temporaryBuffs ?? defaultTemporaryBuffs);
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
            temporaryBuffs,
            characterLevel
        };
        localStorage.setItem('wutheringAppState', JSON.stringify(saveState));
    }, [characterRuntimeStates, activeCharacter, temporaryBuffs, characterLevel]);

    useEffect(() => {
        if (!activeCharacter) return;
        const activeNodeIds = Object.entries(temporaryBuffs.activeNodes ?? {})
            .filter(([_, active]) => active)
            .map(([nodeId]) => Number(nodeId));

        const buffTotals = {
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
            activeNodes: temporaryBuffs.activeNodes
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

        setTemporaryBuffs(buffTotals);
    }, [temporaryBuffs.activeNodes, activeCharacter]);

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
                    TemporaryBuffs: temporaryBuffs
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

        setTemporaryBuffs(cached?.TemporaryBuffs ?? {
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
        setMenuOpen(false);
    };

    const levelStats = getStatsForLevel(activeCharacter?.raw?.Stats, characterLevel) ?? {};
    const finalStats = { ...levelStats };

    finalStats.atk = (levelStats["Atk"] ?? 0) * (1 + (temporaryBuffs.atkPercent ?? 0) / 100);
    finalStats.hp = (levelStats["Life"] ?? 0) * (1 + (temporaryBuffs.hpPercent ?? 0) / 100);
    finalStats.def = (levelStats["Def"] ?? 0) * (1 + (temporaryBuffs.defPercent ?? 0) / 100);
    finalStats.critRate = (baseCharacterState?.Stats?.critRate ?? 0) + (temporaryBuffs.critRate ?? 0);
    finalStats.critDmg = (baseCharacterState?.Stats?.critDmg ?? 0) + (temporaryBuffs.critDmg ?? 0);
    finalStats.healingBonus = (baseCharacterState?.Stats?.healingBonus ?? 0) + (temporaryBuffs.healingBonus ?? 0);
    ['aero','glacio','spectro','fusion','electro','havoc'].forEach(element => {
        const key = `${element}DmgBonus`;
        finalStats[key] = (baseCharacterState?.Stats?.[key] ?? 0) + (temporaryBuffs.elementalBonuses[element] ?? 0);
    });

    return (<>
            <SkillsModal skillsModalOpen={skillsModalOpen} setSkillsModalOpen={setSkillsModalOpen}
                         activeCharacter={activeCharacter} activeSkillTab={activeSkillTab}
                         setActiveSkillTab={setActiveSkillTab} sliderValues={sliderValues}
                         currentSliderColor={currentSliderColor} />
            <div id="app-zoom">
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
                                            temporaryBuffs={temporaryBuffs}
                                            setTemporaryBuffs={setTemporaryBuffs}
                                        />
                                    )}
                                    {leftPaneView === 'weapon' && (
                                        <WeaponPane activeCharacter={activeCharacter} />
                                    )}
                                    {leftPaneView === 'enemy' && (
                                        <EnemyPane
                                            enemyLevel={enemyLevel}
                                            setEnemyLevel={setEnemyLevel}
                                            enemyRes={enemyRes}
                                            setEnemyRes={setEnemyRes}
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
                                                    temporaryBuffs={temporaryBuffs}
                                                    finalStats={finalStats} />

                                    <DamageSection activeCharacter={activeCharacter} finalStats={finalStats}
                                                   characterLevel={characterLevel}
                                                   sliderValues={sliderValues}
                                                   characterRuntimeStates={characterRuntimeStates} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}