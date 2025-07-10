import React, {useEffect, useMemo, useReducer, useRef, useState} from 'react';
import { Pencil, Trash2, Clock3 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';
import RotationItem from "./RotationItem.jsx";
import { getSkillDamageCache } from '../utils/skillDamageCache';
import {usePersistentState} from "../hooks/usePersistentState.js";

const tabDisplayOrder = [
    'normalAttack',
    'resonanceSkill',
    'forteCircuit',
    'resonanceLiberation',
    'introSkill',
    'outroSkill',
    'echoAttacks',
    'negativeEffect'
];

const tabDisplayNames = {
    normalAttack: 'Normal Attack',
    resonanceSkill: 'Resonance Skill',
    forteCircuit: 'Forte Circuit',
    resonanceLiberation: 'Resonance Liberation',
    introSkill: 'Intro Skill',
    outroSkill: 'Outro Skill',
    echoAttacks: 'Echo Attacks',
    negativeEffect: 'Negative Effects'
};

const skillTypeIconMap = {
    basic: '/assets/stat-icons/basic.png',
    heavy: '/assets/stat-icons/heavy.png',
    skill: '/assets/stat-icons/skill.png',
    ultimate: '/assets/stat-icons/liberation.png',
    intro: '/assets/stat-icons/intro.png',
    outro: '/assets/stat-icons/outro.png',
    healing: '/assets/stat-icons/healing.png',
    shielding: '/assets/stat-icons/shield.png',
    spectroFrazzle: '/assets/stat-icons/flat-attribute/spectro.webp',
    aeroErosion: '/assets/stat-icons/flat-attribute/aero.webp',
    echoSkill: '/assets/stat-icons/echo.png'
};

const skillTypeLabelMap = {
    basic: 'Basic Attack',
    skill: 'Resonance Skill',
    heavy: 'Heavy Attack',
    ultimate: 'Resonance Liberation',
    intro: 'Intro Skill',
    outro: 'Outro Skill',
    spectroFrazzle: 'Spectro Frazzle',
    aeroErosion: 'Aero Erosion',
    echoSkill: 'Echo Skill'
};

export default function RotationsPane({
                                          currentSliderColor,
                                          activeCharacter,
                                          rotationEntries,
                                          setRotationEntries,
                                          characterRuntimeStates,
                                          setActiveCharacter,
                                          setCharacterRuntimeStates,
                                          setActiveCharacterId,
                                          setTeam,
                                          setSliderValues,
                                          setCharacterLevel,
                                          setCustomBuffs,
                                          setTraceNodeBuffs,
                                          setBaseCharacterState,
                                          setCombatState,
                                          characters,
                                          savedRotations,
                                          setSavedRotations,
                                          charId,
                                          setSavedTeamRotations,
                                          savedTeamRotations
                                      }) {
    const [viewMode, setViewMode] = useState('new');
    const [showSkillOptions, setShowSkillOptions] = useState(false);
    const [expandedTabs, setExpandedTabs] = useState(() =>
        Object.fromEntries(tabDisplayOrder.map(key => [key, true]))
    );
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 5 }
    }));
    const allSkillResults = characterRuntimeStates[charId]?.allSkillResults ?? getSkillDamageCache();
    const groupedSkillOptions = React.useMemo(() => {
        const allSkills = allSkillResults.filter(skill => skill.visible !== false);
        const groups = {};

        for (const skill of allSkills) {
            const tab = skill.tab ?? 'unknown';
            if (!groups[tab]) groups[tab] = [];
            groups[tab].push({
                name: skill.name,
                type: skill.skillType,
                tab: tab,
                visible: skill.visible,
                element: skill.element ?? null
            });
        }
        return groups;
    }, []);
    const [sortKey, setSortKey] = usePersistentState('sortKey', 'date');
    const [sortOrder, setSortOrder] = usePersistentState('sortOrder', 'desc');
    const [editingId, setEditingId] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [personalFilterCharId, setPersonalFilterCharId] = useState('');
    const [teamFilterCharId, setTeamFilterCharId] = useState('');
    useEffect(() => {
        let lastSeen = 0;
        const interval = setInterval(() => {
            const next = window.lastSkillCacheUpdate ?? 0;
            if (next > lastSeen) {
                lastSeen = next;
                forceUpdate();
            }
        }, 300);
        return () => clearInterval(interval);
    }, []);
    const toggleTab = (key) => {
        setExpandedTabs(prev => ({ ...prev, [key]: !prev[key] }));
    };
    const [editIndex, setEditIndex] = useState(null);
    const handleAddSkill = (skill) => {
        const type = Array.isArray(skill.type) ? skill.type[0] : skill.type;
        const iconPath = type && typeof type === 'string' && skillTypeIconMap[type.toLowerCase?.()]
            ? skillTypeIconMap[type.toLowerCase()]
            : null;

        const newEntryBase = {
            id: crypto.randomUUID(),
            label: skill.name,
            detail: skillTypeLabelMap[type] ?? type,
            tab: skill.tab,
            iconPath,
            visible: skill.visible,
            multiplier: 1,
            locked: false,
            snapshot: undefined,
            createdAt: Date.now(),
            element: skill.element ?? null
        };

        setRotationEntries(prev => {
            const copy = [...prev];

            if (editIndex !== null && copy[editIndex]) {
                const prevMultiplier = copy[editIndex].multiplier ?? 1;
                copy[editIndex] = {
                    ...newEntryBase,
                    multiplier: prevMultiplier
                };
            } else {
                copy.push(newEntryBase);
            }

            return copy;
        });

        setEditIndex(null);
        setShowSkillOptions(false);
    };

    useEffect(() => {
        if (!charId) return;
        const savedRotation = characterRuntimeStates?.[charId]?.rotationEntries ?? [];

        const patched = savedRotation.map(entry => ({
            ...entry,
            createdAt: entry.createdAt ?? Date.now() + Math.random()
        }));

        setRotationEntries(patched);
    }, [charId]);

    useEffect(() => {
        if (!charId) return;
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                rotationEntries: rotationEntries
            }
        }));
    }, [rotationEntries, charId]);

    const loadSavedRotation = (saved) => {
        const id = saved.characterId ?? saved.charId;
        const newCharacter = characters.find(c => String(c.Id ?? c.id ?? c.link) === String(id));
        if (!newCharacter) return;

        setActiveCharacter(newCharacter);
        setActiveCharacterId(id);

        setCharacterRuntimeStates(prev => ({
            ...prev,
            [id]: saved.fullCharacterState
        }));
        setTeam(saved.fullCharacterState.Team ?? [id, null, null]);
        setSliderValues(saved.fullCharacterState.SkillLevels ?? {});
        setCharacterLevel(saved.fullCharacterState.CharacterLevel ?? 1);
        setTraceNodeBuffs(saved.fullCharacterState.TraceNodeBuffs ?? {});
        setCustomBuffs(saved.fullCharacterState.CustomBuffs ?? {});
        setCombatState(saved.fullCharacterState.CombatState ?? {});
        setBaseCharacterState({ Stats: saved.fullCharacterState.Stats ?? {} });

        setRotationEntries(
            (saved.entries ?? saved.fullCharacterState.rotationEntries ?? []).map(e => ({
                ...e,
                createdAt: e.createdAt ?? Date.now() + Math.random()
            }))
        );

        const prevRuntime = JSON.parse(localStorage.getItem("characterRuntimeStates") || "{}");
        localStorage.setItem("characterRuntimeStates", JSON.stringify({
            ...prevRuntime,
            [id]: saved.fullCharacterState
        }));
        localStorage.setItem("activeCharacterId", JSON.stringify(id));
    };

    const normalizedEntries = rotationEntries.map((entry, idx) => ({
        ...entry,
        createdAt: entry.createdAt ?? Date.now() + idx + Math.random()
    }));

    const [isClosing, setIsClosing] = useState(false);

    const closeMenu = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowSkillOptions(false);
            setIsClosing(false);
        }, 200);
    };

    const teamRotation = characterRuntimeStates[charId]?.teamRotation ?? {};
    const activeStates = characterRuntimeStates[charId]?.activeStates ?? {};

    const toggleKeys = ["teammateRotation-1", "teammateRotation-2"];
    const hasValidTeamRotation = (
        characterRuntimeStates[charId]?.Team?.length > 1 &&
        Object.keys(teamRotation).length > 0 &&
        (activeStates[toggleKeys[0]] || activeStates[toggleKeys[1]])
    );

    function getCharacterFilterOptions(fromEntries, characters) {
        const seenIds = new Set();

        for (const entry of fromEntries) {
            const id = String(entry.characterId ?? entry.charId);
            if (id) seenIds.add(id);
        }

        return characters
            .filter(char => seenIds.has(String(char.link)))
            .map(char => ({
                id: String(char.link),
                name: char.displayName
            }));
    }

    const filterOptions = useMemo(() =>
        getCharacterFilterOptions(savedRotations, characters), [savedRotations, characters]);

    const teamFilterOptions = useMemo(() =>
        getCharacterFilterOptions(savedTeamRotations, characters), [savedTeamRotations, characters]);

    useEffect(() => {
        const isInPersonal = filterOptions.some(opt => String(opt.id) === String(charId));
        if (isInPersonal) {
            setPersonalFilterCharId(charId);
        } else {
            setPersonalFilterCharId('');
        }

        const isInTeam = teamFilterOptions.some(opt => String(opt.value) === String(charId));
        if (isInTeam) {
            setTeamFilterCharId(charId);
        } else {
            setTeamFilterCharId('');
        }
    }, [charId, filterOptions, teamFilterOptions]);

    return (
        <div className="rotation-pane">
            <div className="rotation-view-toggle">
                <button className={`view-toggle-button ${viewMode === 'new' ? 'active' : ''}`} onClick={() => setViewMode('new')}>
                    New
                </button>
                <button className={`view-toggle-button ${viewMode === 'saved' ? 'active' : ''}`} onClick={() => setViewMode('saved')}>
                    Saved
                </button>
                <button
                    className={`view-toggle-button ${viewMode === 'team' ? 'active' : ''}`}
                    onClick={() => setViewMode('team')}
                >
                    Team
                </button>
            </div>

            {viewMode === 'new' && (
                <>
                    <h2 className="panel-title">
                        Rotation
                    </h2>

                    <div className="rotation-controls">
                        <div className="rotation-buttons-left">
                            <button className="rotation-button" onClick={() => setShowSkillOptions(true)}>+ Skill</button>
                            <button className="rotation-button clear" onClick={() => setRotationEntries([])}>Clear</button>
                        </div>
                        <button
                            className="rotation-button add-button"
                            title="Save Rotation"
                            onClick={() => {
                                const characterId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
                                const characterName = activeCharacter?.displayName ?? 'Unknown';
                                const dateId = Date.now();

                                const cache = allSkillResults;
                                let total = { normal: 0, crit: 0, avg: 0 };

                                for (const entry of rotationEntries) {
                                    const multiplier = entry.multiplier ?? 1;
                                    const source = entry.locked ? entry.snapshot : cache.find(s => s.name === entry.label && s.tab === entry.tab);
                                    if (!source || source.visible === false || source.isSupportSkill) continue;

                                    total.normal += (source.normal ?? 0) * multiplier;
                                    total.crit += (source.crit ?? 0) * multiplier;
                                    total.avg += (source.avg ?? 0) * multiplier;
                                }

                                const newSaved = {
                                    id: dateId,
                                    characterId,
                                    characterName,
                                    entries: rotationEntries,
                                    total,
                                    fullCharacterState: characterRuntimeStates?.[characterId] ?? {}
                                };
                                setSavedRotations(prev => [...prev, newSaved]);
                            }}
                        >
                            ＋
                        </button>
                    </div>

                    <div className="rotation-list-container">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToFirstScrollableAncestor]}
                            onDragEnd={({ active, over }) => {
                                if (active.id !== over?.id) {
                                    const oldIndex = normalizedEntries.findIndex(e => e.createdAt.toString() === active.id);
                                    const newIndex = normalizedEntries.findIndex(e => e.createdAt.toString() === over.id);
                                    setRotationEntries((items) => arrayMove(items, oldIndex, newIndex));
                                }
                            }}
                        >
                            <SortableContext
                                items={normalizedEntries.map(e => e.createdAt.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                {normalizedEntries
                                    .filter(entry => entry.visible !== false)
                                    .map((entry, idx) => (
                                    <RotationItem
                                        key={entry.createdAt.toString()}
                                        id={entry.createdAt.toString()}
                                        index={idx}
                                        entry={entry}
                                        onEdit={(i) => {
                                            setEditIndex(i);
                                            setShowSkillOptions(true);
                                        }}
                                        onDelete={(i) => setRotationEntries(prev => prev.filter((_, j) => j !== i))}
                                        onMultiplierChange={(i, val) => {
                                            const updated = [...rotationEntries];
                                            updated[i].multiplier = val;
                                            setRotationEntries(updated);
                                        }}
                                        setRotationEntries={setRotationEntries}
                                        allSkillResults={allSkillResults}
                                        currentSliderColor={currentSliderColor}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>

                    {showSkillOptions && (
                        <div
                            className={`skill-menu-overlay ${isClosing ? 'fade-out' : ''}`}
                            onClick={closeMenu}
                        >
                            <div
                                className={`skill-menu-panel ${isClosing ? 'fade-out' : 'fade-in'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="menu-header-with-buttons">
                                    <div className="menu-header">Select a Skill</div>
                                    <button className="rotation-button clear" onClick={() => setShowSkillOptions(false)}>✕</button>
                                </div>
                                <div className="skill-menu-list">
                                    {tabDisplayOrder.map((tabKey) =>
                                            groupedSkillOptions[tabKey]?.length > 0 && (
                                                <div key={tabKey} className="skill-tab-section">
                                                    <div className="skill-tab-label collapsible-label" onClick={() => toggleTab(tabKey)}>
                                                        <span>{tabDisplayNames[tabKey]}</span>
                                                        <span className="collapse-icon">{expandedTabs[tabKey] ? '▾' : '▸'}</span>
                                                    </div>
                                                    {expandedTabs[tabKey] && groupedSkillOptions[tabKey].map((skill, index) => (
                                                        <button
                                                            key={index}
                                                            className="skill-option"
                                                            onClick={() => handleAddSkill(skill)}
                                                        >
                                                            <div className="dropdown-item-content">
                                                                <div className="dropdown-main">
                                                                    <span>{skill.name}</span>
                                                                </div>
                                                                <div className="dropdown-icons">
                                                                    {(() => {
                                                                        const type = Array.isArray(skill.type) ? skill.type[0] : skill.type;
                                                                        if (typeof type === 'string' && skillTypeIconMap[type.toLowerCase()]) {
                                                                            return (
                                                                                <img
                                                                                    src={skillTypeIconMap[type.toLowerCase()]}
                                                                                    style={{width: '1.5rem', height: '1.5rem'}}
                                                                                    alt={type}
                                                                                    className="skill-type-icon"
                                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                                />
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                    <span style={{ opacity: 0.75, fontSize: '0.8rem' }}>
                                                                        {(() => {
                                                                            const type = Array.isArray(skill.type) ? skill.type[0] : skill.type;
                                                                            return typeof type === 'string' ? (skillTypeLabelMap[type] ?? type) : 'Unknown';
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {viewMode === 'saved' && (
                <>
                    <h2 className="panel-title">Saved Rotations</h2>
                    <div className="sort-controls">
                        <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Sort by:</label>
                        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                            <option value="date">Date Added</option>
                            <option value="name">Name</option>
                            <option value="dmg">Total DMG</option>
                        </select>
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                        <select value={personalFilterCharId} onChange={(e) => setPersonalFilterCharId(e.target.value)}>
                            <option value="">Filter</option>
                            {filterOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                        </select>
                        <button
                            className="rotation-button clear"
                            onClick={() => setSavedRotations([])}
                            style={{ marginLeft: 'auto'}}
                        >Clear</button>

                    </div>
                    <div className="saved-rotation-list">
                        {savedRotations.length === 0 ? (
                            <p style={{ color: '#5c5c5c' }}>hmm...</p>
                        ) : (
                            [...savedRotations]
                                .filter(entry => !personalFilterCharId || String(entry.characterId ?? entry.charId) === personalFilterCharId)
                                .sort((a, b) => {
                                    let valA, valB;
                                    switch (sortKey) {
                                        case 'name':
                                            valA = a.characterName?.toLowerCase() ?? '';
                                            valB = b.characterName?.toLowerCase() ?? '';
                                            break;
                                        case 'dmg':
                                            valA = a.total?.avg ?? 0;
                                            valB = b.total?.avg ?? 0;
                                            break;
                                        case 'date':
                                        default:
                                            valA = a.id;
                                            valB = b.id;
                                    }
                                    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                                    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                                    return 0;
                                })
                                .map((saved) => (
                                    <div key={saved.id} className="rotation-item-wrapper">
                                        <div className="rotation-item">
                                            <div className="rotation-header">
                                                {editingId === saved.id ? (
                                                    <input
                                                        type="text"
                                                        value={editedName}
                                                        onChange={(e) => setEditedName(e.target.value)}
                                                        onBlur={() => {
                                                            setSavedRotations(prev =>
                                                                prev.map(r =>
                                                                    r.id === saved.id
                                                                        ? { ...r, characterName: editedName }
                                                                        : r
                                                                )
                                                            );
                                                            setEditingId(null);
                                                        }}
                                                        autoFocus
                                                        className="entry-name-edit"
                                                    />
                                                ) : (
                                                    <span className="highlight">{saved.characterName}</span>
                                                )}
                                                <span className="entry-type-detail">
                                                    <span className="entry-detail-text">
                                                        {new Date(saved.id).toLocaleDateString(undefined, {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="rotation-values">
                                                <span className="value-label">Normal</span>
                                                <span className="value">{Math.round(saved.total.normal).toLocaleString()}</span>
                                                <span className="value-label">Crit</span>
                                                <span className="value">{Math.round(saved.total.crit).toLocaleString()}</span>
                                                <span className="value-label">Avg</span>
                                                    <span className="value avg" style={{ fontWeight: 'bold' }}>
                                                    {Math.round(saved.total.avg).toLocaleString()}
                                                </span>

                                                <button
                                                    className="rotation-button load-button"
                                                    title="Load Rotation"
                                                    onClick={() => loadSavedRotation(saved)}
                                                    style={{ marginLeft: 'auto' }}
                                                >
                                                    Load
                                                </button>
                                                {/*
                                                <button
                                                    className="rotation-button"
                                                    title="Export Rotation"
                                                >
                                                    Export
                                                </button>
                                                */}
                                            </div>
                                        </div>

                                        <div className="rotation-actions external-actions">
                                            <button
                                                className="rotation-button"
                                                title="Edit Name"
                                                onClick={() => {
                                                    setEditingId(saved.id);
                                                    setEditedName(saved.characterName);
                                                }}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                className="rotation-button"
                                                title="Delete"
                                                onClick={() => {
                                                    setSavedRotations(prev =>
                                                        prev.filter((r) => r.id !== saved.id)
                                                    );
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </>
            )}

            {viewMode === 'team' && (
                <>
                    <h2 className="panel-title">Saved Team Rotations</h2>
                    <div className="sort-controls">
                        <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Sort by:</label>
                        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                            <option value="date">Date Added</option>
                            <option value="name">Name</option>
                            <option value="dmg">Total DMG</option>
                        </select>
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                        <select value={teamFilterCharId} onChange={(e) => setTeamFilterCharId(e.target.value)}>
                            <option value="">Filter</option>
                            {teamFilterOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="rotation-controls">
                        <div className="rotation-buttons-left">
                            <button className="rotation-button clear" onClick={() => setSavedTeamRotations([])}>Clear</button>
                        </div>
                        {!hasValidTeamRotation ? (
                            <span style={{ fontSize: '0.8rem', color: 'gray', marginLeft: 'auto', fontWeight: 'bold' }}>
                                No Team Rotation
                            </span>
                        ) : (
                            <button
                                className="rotation-button add-button"
                                disabled={!hasValidTeamRotation}
                                onClick={() => {
                                    const summary = characterRuntimeStates?.[charId]?.teamRotationSummary;
                                    if (!summary || Math.round(summary?.total?.avg ?? 0) === 0) return;

                                    const newEntry = {
                                        id: Date.now(),
                                        charId: charId,
                                        entries: rotationEntries,
                                        name: summary.name ?? characterRuntimeStates?.[charId]?.Name,
                                        total: summary.total,
                                        fullCharacterState: characterRuntimeStates?.[charId] ?? {}
                                    };
                                    setSavedTeamRotations(prev => [...prev, newEntry]);
                                }}
                            >
                                +
                            </button>
                        )}
                    </div>
                    <div className="saved-rotation-list team">
                        {(() => {
                            const summaries = [...savedTeamRotations]
                                .filter(entry => !teamFilterCharId || String(entry.charId) === teamFilterCharId)
                                .sort((a, b) => {
                                let valA, valB;

                                switch (sortKey) {
                                    case 'name':
                                        valA = a.name?.toLowerCase() ?? '';
                                        valB = b.name?.toLowerCase() ?? '';
                                        break;
                                    case 'dmg':
                                        valA = a.total?.avg ?? 0;
                                        valB = b.total?.avg ?? 0;
                                        break;
                                    case 'date':
                                    default:
                                        valA = a.id;
                                        valB = b.id;
                                }

                                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                                return 0;
                            });

                            if (summaries.length === 0) {
                                return <p style={{ color: '#5c5c5c' }}>hmm...</p>;
                            }

                            return summaries.map(({ charId, name, total, id, fullCharacterState, entries }) => (
                                <div key={id} className="rotation-item-wrapper">
                                    <div className="rotation-item">
                                        <div className="rotation-header">
                                            {editingId === id ? (
                                                <input
                                                    className="entry-name-edit"
                                                    value={editedName}
                                                    onChange={(e) => setEditedName(e.target.value)}
                                                    onBlur={() => {
                                                        setSavedTeamRotations(prev =>
                                                            prev.map(entry =>
                                                                entry.id === editingId ? { ...entry, name: editedName } : entry
                                                            )
                                                        );
                                                        setEditingId(null);
                                                    }}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="highlight">{name}</span>
                                            )}
                                            <span className="entry-type-detail">
                                                {/*<span className="entry-detail-text">{characterRuntimeStates[charId]?.Name}'s team</span>*/}
                                                <span className="entry-detail-text">
                                                        {new Date(id).toLocaleDateString(undefined, {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                            </span>
                                        </div>

                                        <div className="rotation-values">
                                            <span className="value-label">Normal</span>
                                            <span className="value">{Math.round(total.normal).toLocaleString()}</span>
                                            <span className="value-label">Crit</span>
                                            <span className="value">{Math.round(total.crit).toLocaleString()}</span>
                                            <span className="value-label">Avg</span>
                                            <span className="value avg" style={{ fontWeight: 'bold' }}>
                                                    {Math.round(total.avg).toLocaleString()}
                                                </span>
                                            <button
                                                className="rotation-button load-button"
                                                title="Load Rotation"
                                                onClick={() => loadSavedRotation({ charId, fullCharacterState, entries })}
                                                style={{ marginLeft: 'auto' }}
                                            >
                                                Load
                                            </button>
                                        </div>
                                    </div>
                                    <div className="rotation-actions external-actions">
                                        <button
                                            className="rotation-button"
                                            title="Edit Name"
                                            onClick={() => {
                                                setEditingId(id);
                                                setEditedName(name ?? '');
                                            }}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            className="rotation-button"
                                            title="Delete"
                                            onClick={() =>
                                                setSavedTeamRotations(prev =>
                                                    prev.filter(entry => entry.id !== id)
                                                )
                                            }
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </>
            )}
        </div>
    );
}