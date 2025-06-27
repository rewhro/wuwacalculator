import React, {useEffect, useRef, useState} from 'react';
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
                                          characters
                                      }) {
    const [viewMode, setViewMode] = useState('new');
    const [showSkillOptions, setShowSkillOptions] = useState(false);
    const [expandedTabs, setExpandedTabs] = useState(() =>
        Object.fromEntries(tabDisplayOrder.map(key => [key, true]))
    );
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 5 }
    }));
    const [savedRotations, setSavedRotations] = usePersistentState('globalSavedRotations', []);
    const groupedSkillOptions = React.useMemo(() => {
        const allSkills = getSkillDamageCache().filter(skill => skill.visible !== false);
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
    const [sortKey, setSortKey] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [editingId, setEditingId] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [, forceUpdate] = useState(0);
    useEffect(() => {
        let lastSeen = 0;
        const interval = setInterval(() => {
            const next = window.lastSkillCacheUpdate ?? 0;
            if (next > lastSeen) {
                lastSeen = next;
                forceUpdate(Date.now());
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
    const charId = activeCharacter?.Id?.toString();

    useEffect(() => {
        if (!charId) return;
        const savedRotation = characterRuntimeStates?.[charId]?.rotationEntries ?? [];

        const patched = savedRotation.map(entry => ({
            ...entry,
            createdAt: entry.createdAt ?? Date.now() + Math.random()
        }));

        setRotationEntries(patched);
    }, [charId]);

    // Save rotation to character runtime state on change
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
        const id = saved.characterId;
        const newCharacter = characters.find(c => String(c.Id ?? c.id ?? c.link) === String(id));
        if (!newCharacter) return;

        // Set character
        setActiveCharacter(newCharacter);
        setActiveCharacterId(id);

        // Set state in React
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
            (saved.entries ?? []).map(e => ({
                ...e,
                createdAt: e.createdAt ?? Date.now() + Math.random()
            }))
        );

        // Store persistently
        const prevRuntime = JSON.parse(localStorage.getItem("characterRuntimeStates") || "{}");
        localStorage.setItem("characterRuntimeStates", JSON.stringify({
            ...prevRuntime,
            [id]: saved.fullCharacterState
        }));
        localStorage.setItem("activeCharacterId", JSON.stringify(id));
        localStorage.setItem("team", JSON.stringify([
            id,
            saved.fullCharacterState.Team?.[1] ?? null,
            saved.fullCharacterState.Team?.[2] ?? null
        ]));
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

    return (
        <div className="rotation-pane">
            <div className="rotation-view-toggle">
                <button className={`view-toggle-button ${viewMode === 'new' ? 'active' : ''}`} onClick={() => setViewMode('new')}>
                    New
                </button>
                <button className={`view-toggle-button ${viewMode === 'saved' ? 'active' : ''}`} onClick={() => setViewMode('saved')}>
                    Saved
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
                                const dateId = Date.now(); // Use timestamp as unique ID

                                // Compute totals using skill damage cache (as in your Rotations component)
                                const cache = getSkillDamageCache();
                                let total = { normal: 0, crit: 0, avg: 0 };

                                for (const entry of rotationEntries) {
                                    const multiplier = entry.multiplier ?? 1;
                                    const source = entry.locked ? entry.snapshot : cache.find(s => s.name === entry.label && s.tab === entry.tab);
                                    if (!source || source.visible === false || source.isSupportSkill) continue;

                                    total.normal += (source.normal ?? 0) * multiplier;
                                    total.crit += (source.crit ?? 0) * multiplier;
                                    total.avg += (source.avg ?? 0) * multiplier;
                                }

                                // Save full rotation snapshot
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
                                                                                    alt={type}
                                                                                    className="skill-type-icon"
                                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                                />
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                    <span style={{ opacity: 0.75, fontSize: '13px' }}>
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
                    </div>
                    <div className="saved-rotation-list">
                        {/*
                    <div className="saved-rotation-header">
                        <button
                            className="rotation-button"
                            style={{ marginLeft: 'auto', marginBottom: '8px' }}
                        >
                            Import
                        </button>
                    </div>
                                            */}
                        {savedRotations.length === 0 ? (
                            <p style={{ color: '#5c5c5c' }}>hmm...</p>
                        ) : (
                            [...savedRotations]
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
        </div>
    );
}