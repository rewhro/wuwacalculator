import React, {useEffect, useRef, useState} from 'react';
import { Pencil, Trash2, Clock3 } from 'lucide-react';
import { getSkillDamageCache } from '../utils/skillDamageCache';
import {getCharacterOverride, getHardcodedMultipliers} from '../data/character-behaviour';
import { elementToAttribute, attributeColors } from '../utils/attributeHelpers';
import { usePersistentState } from '../hooks/usePersistentState';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';
import {multipliers} from "../data/character-behaviour/teamplate.js";

export default function RotationsPane({
                                          activeCharacter,
                                          characterRuntimeStates,
                                          finalStats,
                                          combatState,
                                          mergedBuffs,
                                          sliderValues,
                                          characterLevel,
                                          rotationEntries,
                                          setRotationEntries,
                                          characters,
                                          setActiveCharacter,
                                          setActiveCharacterId,
                                          setCharacterRuntimeStates,
                                          setTeam,
                                          setSliderValues,
                                          setCharacterLevel,
                                          setTraceNodeBuffs,
                                          setCustomBuffs,
                                          setCombatState,
                                          setBaseCharacterState,
                                          characterStates,
                                      }) {
    const [showSkillOptions, setShowSkillOptions] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const skillOptions = getAllSkillEntries(activeCharacter, characterRuntimeStates, finalStats, combatState, mergedBuffs, sliderValues, characterLevel);
    const [viewMode, setViewMode] = useState('new');
    const [savedRotations, setSavedRotations] = usePersistentState('globalSavedRotations', []);
    const [editingId, setEditingId] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [sortKey, setSortKey] = useState('date'); // 'date' | 'name' | 'dmg'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
    const pendingRotationEntriesRef = useRef(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        })
    );

    const skillTypeIconMap = {
        basic: '/assets/stat-icons/basic.png',
        heavy: '/assets/stat-icons/heavy.png',
        skill: '/assets/stat-icons/skill.png',
        ultimate: '/assets/stat-icons/liberation.png',
        intro: '/assets/stat-icons/intro.png',
        outro: '/assets/stat-icons/outro.png',
        healing: '/assets/stat-icons/healing.png',
        shielding: '/assets/stat-icons/shield.png'
    };

    const skillTypeLabelMap = {
        basic: 'Basic Attack',
        skill: 'Resonance Skill',
        heavy: 'Heavy Attack',
        ultimate: 'Resonance Liberation',
        intro: 'Intro Skill',
        outro: 'Outro Skill',
        aeroErosion: 'Aero Erosion',
        spectroFrazzle: 'Spectro Frazzle'
    };

    const tabDisplayOrder = [
        'normalAttack',
        'resonanceSkill',
        'forteCircuit',
        'resonanceLiberation',
        'introSkill',
        'outroSkill'
    ];

    const tabDisplayNames = {
        normalAttack: 'Normal Attack',
        resonanceSkill: 'Resonance Skill',
        forteCircuit: 'Forte Circuit',
        resonanceLiberation: 'Resonance Liberation',
        introSkill: 'Intro Skill',
        outroSkill: 'Outro Skill'
    };


    const attribute = elementToAttribute[activeCharacter?.attribute];
    const characterColor = attributeColors[attribute] ?? '#aaa';

    const handleAddSkill = (skill) => {
        const allDamage = getSkillDamageCache();
        const match = allDamage.find(
            s => s.name === skill.name && s.tab === skill.tab
        );


        const skillTypeKey = skill.type?.toLowerCase();
        const iconPath = skillTypeKey && skillTypeKey in skillTypeIconMap
            ? skillTypeIconMap[skillTypeKey]
            : null;

        const newEntry = {
            iconPath: iconPath,
            label: skill.name,
            detail: skillTypeLabelMap[skill.type?.toLowerCase()] ?? skill.type,
            tab: skill.tab, // ✅ required to look it up later
            multiplier: 1,
            createdAt: Date.now(),
            locked: false
        };

        setRotationEntries(prev => {
            const copy = [...prev];
            const entryWithId = {
                createdAt: Date.now(), // fallback if missing
                ...newEntry
            };
            if (editIndex !== null && copy[editIndex]) {
                copy[editIndex] = entryWithId;
            } else {
                copy.push(entryWithId);
            }
            return copy;
        });

        setEditIndex(null);
        setShowSkillOptions(false);
    };

    const groupedSkillOptions = skillOptions.reduce((acc, skill) => {
        const tabName = skill.tab;
        if (!acc[tabName]) acc[tabName] = [];
        acc[tabName].push(skill);
        return acc;
    }, {});

    const [expandedTabs, setExpandedTabs] = useState(() =>
        Object.fromEntries(tabDisplayOrder.map(key => [key, true]))
    );

    const toggleTab = (key) => {
        setExpandedTabs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getCharId = (char) => String(char?.Id ?? char?.id ?? char?.link ?? '');

    useEffect(() => {
        if (!activeCharacter || !pendingRotationEntriesRef.current) return;

        const pending = pendingRotationEntriesRef.current;
        if (pending) {
            setTimeout(() => {
                setRotationEntries(pending);
                pendingRotationEntriesRef.current = null;
            }, 0);
        }
    }, [activeCharacter]);


    const loadSavedRotation = (saved) => {
        const id = saved.characterId;
        const newCharacter = characters.find(c => String(c.Id ?? c.id ?? c.link) === String(id));
        if (!newCharacter) return;

        // Step 1: hydrate character state
        setActiveCharacter(newCharacter);
        setActiveCharacterId(id);
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [id]: saved.fullCharacterState
        }));
        setTeam(saved.fullCharacterState.Team ?? [id, null, null]);
        setSliderValues(saved.fullCharacterState.SkillLevels ?? {});
        setCharacterLevel(saved.fullCharacterState.CharacterLevel ?? 1);
        setTraceNodeBuffs(saved.fullCharacterState.TemporaryBuffs ?? {});
        setCustomBuffs(saved.fullCharacterState.CustomBuffs ?? {});
        setCombatState(saved.fullCharacterState.CombatState ?? {});
        setBaseCharacterState({ Stats: saved.fullCharacterState.Stats ?? {} });

        // Step 2: safely store in localStorage
        const prev = JSON.parse(localStorage.getItem("characterRuntimeStates") || "{}");
        localStorage.setItem("characterRuntimeStates", JSON.stringify({
            ...prev,
            [id]: saved.fullCharacterState
        }));
        localStorage.setItem("activeCharacterId", JSON.stringify(id));
        localStorage.setItem("team", JSON.stringify([
            id,
            saved.fullCharacterState.Team?.[1] ?? null,
            saved.fullCharacterState.Team?.[2] ?? null
        ]));

        // Step 3: defer rotation entry assignment until character state is ready
        pendingRotationEntriesRef.current = saved.entries.map(e => ({
            ...e,
            multiplier: e.multiplier ?? 1,
            locked: e.locked ?? false,
            cached: e.locked ? (e.cached ?? null) : undefined
        }));
    };

    useEffect(() => {
        if (!activeCharacter || !pendingRotationEntriesRef.current) return;

        const cache = getSkillDamageCache(); // safe here

        const updatedEntries = pendingRotationEntriesRef.current.map(e => {
            const base = {
                ...e,
                multiplier: e.multiplier ?? 1,
                locked: e.locked ?? false
            };

            if (base.locked) {
                base.cached = e.cached ?? (() => {
                    const match = cache.find(s => s.name === e.label && s.tab === e.tab);
                    return {
                        normal: (match?.normal ?? 0),
                        crit: (match?.crit ?? 0),
                        avg: (match?.avg ?? 0)
                    };
                })();
            }

            return base;
        });

        pendingRotationEntriesRef.current = null;
        setRotationEntries(updatedEntries);
    }, [activeCharacter?.Id]); // fire only once after character switches

    const exportRotation = (saved) => {
        const json = JSON.stringify(saved, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${saved.characterName.replace(/\s+/g, '_')}_rotation_${saved.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const importRotation = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data.entries || !Array.isArray(data.entries)) {
                        alert('Invalid rotation file.');
                        return;
                    }

                    // Defensive: mark cache as trusted if locked
                    data.entries = data.entries.map(e => ({
                        ...e,
                        locked: e.locked ?? false,
                        cached: e.locked ? e.cached ?? null : undefined
                    }));

                    setSavedRotations(prev => [...prev, data]);
                } catch (err) {
                    alert('Invalid JSON file.');
                    console.error('Import error:', err);
                }
            };

            reader.readAsText(file);
        };

        input.click();
    };

    return (
        <div className="rotation-pane">
            <div className="rotation-view-toggle">
                <button
                    className={`view-toggle-button ${viewMode === 'new' ? 'active' : ''}`}
                    onClick={() => setViewMode('new')}
                >
                    New
                </button>
                <button
                    className={`view-toggle-button ${viewMode === 'saved' ? 'active' : ''}`}
                    onClick={() => setViewMode('saved')}
                >
                    Saved
                </button>
            </div>

            {viewMode === 'new' && (
                <>
                    <h2 className="panel-title">Rotation</h2>

                    <div className="rotation-controls">
                        <div className="rotation-buttons-left">
                            <button className="rotation-button" onClick={() => setShowSkillOptions(prev => !prev)}>+ Skill</button>
                            {/*<button className="rotation-button">+ Condition</button>
                    <button className="rotation-button">+ Block</button>*/}
                            <button className="rotation-button clear" onClick={() => setRotationEntries([])}>Clear</button>
                        </div>

                        <button
                            className="rotation-button add-button"
                            onClick={() => {
                                if (!activeCharacter || rotationEntries.length === 0) return;

                                const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
                                const charName = activeCharacter?.displayName ?? 'Unknown';

                                const cache = getSkillDamageCache();

                                const total = rotationEntries.reduce(
                                    (acc, entry) => {
                                        const mult = entry.multiplier ?? 1;

                                        let normal = 0, crit = 0, avg = 0;

                                        if (entry.locked && entry.cached) {
                                            normal = entry.cached.normal ?? 0;
                                            crit = entry.cached.crit ?? 0;
                                            avg = entry.cached.avg ?? 0;
                                        } else {
                                            const cached = cache.find(s =>
                                                s.name === entry.label &&
                                                (s.skillMeta?.skillType === entry.detail?.toLowerCase() || s.tab === entry.tab)
                                            );
                                            normal = (cached?.normal ?? 0) * mult;
                                            crit = (cached?.crit ?? 0) * mult;
                                            avg = (cached?.avg ?? 0) * mult;
                                        }

                                        acc.normal += normal;
                                        acc.crit += crit;
                                        acc.avg += avg;
                                        return acc;
                                    },
                                    { normal: 0, crit: 0, avg: 0 }
                                );

                                const fullRuntime = JSON.parse(localStorage.getItem("characterRuntimeStates") || "{}");
                                const fullCharacterState = fullRuntime[charId] ?? {};

                                const entriesToSave = rotationEntries.map(e => {
                                    const base = {
                                        label: e.label,
                                        tab: e.tab,
                                        detail: e.detail,
                                        iconPath: e.iconPath,
                                        multiplier: e.multiplier ?? 1,
                                        locked: e.locked ?? false,
                                        createdAt: e.createdAt ?? Date.now()
                                    };

                                    if (e.locked && e.cached) {
                                        base.cached = e.cached; // ✅ save cached values if locked
                                    }

                                    return base;
                                });

                                const newSaved = {
                                    id: Date.now(),
                                    characterId: charId,
                                    characterName: charName,
                                    entries: entriesToSave,
                                    total,
                                    fullCharacterState
                                };

                                setSavedRotations(prev => [...prev, newSaved]);
                            }}
                        >
                            ＋
                        </button>
                    </div>

                    {showSkillOptions && (
                        <div className="skill-menu-overlay" onClick={() => setShowSkillOptions(false)}>
                            <div className="skill-menu-panel" onClick={(e) => e.stopPropagation()}>
                                <div className="menu-header-with-buttons">
                                    <div className="menu-header">Select a Skill</div>
                                    <button
                                        className="rotation-button clear"
                                        onClick={() => setShowSkillOptions(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="skill-menu-list">
                                    {tabDisplayOrder.map((tabKey) =>
                                            groupedSkillOptions[tabKey]?.length > 0 && (
                                                <div key={tabKey} className="skill-tab-section">
                                                    <div
                                                        className="skill-tab-label collapsible-label"
                                                        onClick={() => toggleTab(tabKey)}
                                                    >
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
                                                                    {skill.type &&
                                                                        skillTypeIconMap[skill.type.toLowerCase()] && (
                                                                            <img
                                                                                src={skillTypeIconMap[skill.type.toLowerCase()]}
                                                                                alt={skill.type}
                                                                                className="skill-type-icon"
                                                                                onError={(e) => {
                                                                                    e.target.style.display = 'none'; // Hides broken images
                                                                                }}
                                                                            />
                                                                        )}
                                                                    <span style={{ opacity: 0.75, fontSize: '13px' }}>
                                                              {skillTypeLabelMap[skill.type] ?? skill.type}
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

                    <div className="rotation-list-container">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToFirstScrollableAncestor]}
                            onDragEnd={({ active, over }) => {
                                if (active.id !== over?.id) {
                                    const oldIndex = rotationEntries.findIndex(e => e.createdAt?.toString() === active.id);
                                    const newIndex = rotationEntries.findIndex(e => e.createdAt?.toString() === over.id);
                                    setRotationEntries((items) => arrayMove(items, oldIndex, newIndex));
                                }
                            }}
                        >
                            <SortableContext
                                items={rotationEntries.map(e => e.createdAt?.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                {rotationEntries.map((entry, idx) => (
                                    <SortableRotationItem
                                        key={entry.createdAt?.toString()}
                                        id={entry.createdAt?.toString()}
                                        index={idx}
                                        entry={entry}
                                        characterColor={characterColor}
                                        onMultiplierChange={(i, value) => {
                                            const updated = [...rotationEntries];
                                            updated[i].multiplier = Math.max(1, value);
                                            setRotationEntries(updated);
                                        }}
                                        onEdit={(i) => {
                                            setEditIndex(i);
                                            setShowSkillOptions(true);
                                        }}
                                        onDelete={(i) => {
                                            setRotationEntries(prev => prev.filter((_, j) => j !== i));
                                        }}
                                        setRotationEntries={setRotationEntries}  // ✅ Add this line
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </>
            )}

            {viewMode === 'saved' && (
                <div className="saved-rotation-list">
                    <div className="saved-rotation-header">
                        <h2 className="panel-title">Saved Rotations</h2>

                        <button
                            className="rotation-button"
                            style={{ marginLeft: 'auto', marginBottom: '8px' }}
                            onClick={importRotation}
                        >
                            Import
                        </button>

                    </div>
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
                                                <span className="entry-name">{saved.characterName}</span>
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

                                            <button
                                                className="rotation-button"
                                                title="Export Rotation"
                                                onClick={() => exportRotation(saved)}
                                            >
                                                Export
                                            </button>

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
            )}


        </div>

    );

}

function SortableRotationItem({
                                  id,
                                  index,
                                  entry,
                                  onMultiplierChange,
                                  onEdit,
                                  onDelete,
                                  characterColor,
                                  setRotationEntries
                              }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const cache = getSkillDamageCache();
    const multiplier = entry.multiplier ?? 1;

    // Use cached or live damage values
    const source = entry.locked ? entry.cached : cache.find(s => s.name === entry.label && s.tab === entry.tab);

    const normal = (source?.normal ?? 0) * multiplier;
    const crit = (source?.crit ?? 0) * multiplier;
    const avg = (source?.avg ?? 0) * multiplier;

    const toggleLock = () => {
        setRotationEntries(prev => {
            const copy = [...prev];
            const item = copy[index];
            const liveMatch = cache.find(s => s.name === item.label && s.tab === item.tab);
            const locked = !item.locked;

            copy[index] = {
                ...item,
                locked,
                cached: locked
                    ? {
                        normal: (liveMatch?.normal ?? 0) * (item.multiplier ?? 1),
                        crit: (liveMatch?.crit ?? 0) * (item.multiplier ?? 1),
                        avg: (liveMatch?.avg ?? 0) * (item.multiplier ?? 1),
                        tab: item.tab,
                        label: item.label
                    }
                    : undefined
            };

            return copy;
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`rotation-item-wrapper ${entry.locked ? 'locked' : ''}`}
            onClick={toggleLock}
        >
            <div className={`rotation-item ${entry.locked ? 'locked' : ''}`}>
                <div className="rotation-header">
                    <span className="entry-name" style={{ color: characterColor }}>
                        {entry.label} {multiplier > 1 ? `(x${multiplier})` : ''}
                    </span>
                    <span className="entry-type-detail">
                        {entry.iconPath && (
                            <img
                                src={entry.iconPath}
                                alt=""
                                className="skill-type-icon"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        )}
                        <span className="entry-detail-text">{entry.detail}</span>
                    </span>
                </div>
                <div className="rotation-values">
                    <span className="value-label">Normal</span>
                    <span className="value">{Math.round(normal).toLocaleString()}</span>
                    <span className="value-label">Crit</span>
                    <span className="value">{Math.round(crit).toLocaleString()}</span>
                    <span className="value-label">Avg</span>
                    <span className="value avg">{Math.round(avg).toLocaleString()}</span>
                    <div className="rotation-multiplier-inline" onClick={(e) => e.stopPropagation()}>
                        <label style={{ fontSize: '13px' }}>×</label>
                        <input
                            type="number"
                            min="1"
                            max="99"
                            className="character-level-input"
                            value={multiplier}
                            onChange={(e) => onMultiplierChange(index, parseInt(e.target.value) || 1)}
                            style={{ width: '40px', fontSize: '13px', marginLeft: '4px', textAlign: 'right' }}
                        />
                    </div>
                </div>
            </div>
            <div className="rotation-actions external-actions" onClick={(e) => e.stopPropagation()}>
                <button className="rotation-button" title="Edit" onClick={() => onEdit(index)}><Pencil size={18} /></button>
                <button className="rotation-button" title="Delete" onClick={() => onDelete(index)}><Trash2 size={18} /></button>
            </div>
        </div>
    );
}

export function getAllSkillEntries(
    activeCharacter,
    characterRuntimeStates,
    finalStats,
    combatState,
    mergedBuffs,
    sliderValues,
    characterLevel
) {
    if (!activeCharacter?.raw?.SkillTrees) return [];

    const tabs = ['normalAttack', 'resonanceSkill', 'forteCircuit', 'resonanceLiberation', 'introSkill', 'outroSkill'];
    const entries = [];
    const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
    const element = elementToAttribute[activeCharacter?.attribute] ?? '';

    const override = getCharacterOverride(charId);
    const hardcoded = getHardcodedMultipliers(charId, activeCharacter);
    const characterState = {
        activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {},
        toggles: characterRuntimeStates?.[charId]?.sequenceToggles ?? {}
    };

    const isActiveSequence = (seqNum) => sliderValues?.sequence >= seqNum;
    const isToggleActive = (toggleId) =>
        characterState?.toggles?.[toggleId] === true || characterState?.activeStates?.[toggleId] === true;

    for (const tab of tabs) {
        const tree = Object.values(activeCharacter.raw.SkillTrees).find(tree => {
            const type = tree.Skill?.Type?.toLowerCase()?.replace(/\s/g, '');
            return type?.includes(tab.toLowerCase());
        });

        const skill = tree?.Skill;
        const treeLevels = skill?.Level
            ? Object.values(skill.Level).filter(
                level => Array.isArray(level.Param?.[0]) && level.Param[0].length > 0
            )
            : [];

        const levelMap = new Map();

        // Step 1: Add original levels
        for (const level of treeLevels) {
            levelMap.set(level.Name, {
                ...level
            });
        }

        // Step 2: Overwrite or insert hardcoded levels
        for (const hc of (hardcoded?.[tab] ?? [])) {
            levelMap.set(hc.name, {
                ...hc,
                Name: hc.name,
                Param: hc.param ?? [],
                healing: hc.healing,
                shielding: hc.shielding
            });
        }

        const combinedLevels = Array.from(levelMap.values()).filter(level => {
            const param = level.Param?.[0];
            const hasPercent =
                typeof param === 'string'
                    ? param.includes('%')
                    : Array.isArray(param) && param.some(v => typeof v === 'string' && v.includes('%'));

            const isSupportSkill = level.healing || level.shielding;

            // ✅ Always include outroSkill tab, even if it doesn't have %
            const alwaysInclude = tab === 'outroSkill';

            return hasPercent || isSupportSkill || alwaysInclude;
        });

        for (const level of combinedLevels) {
            const skillMeta = {
                name: level.Name,
                skillType: '',
                multiplier: 1,
                amplify: 0,
                tab,
                visible: true,
                tags: [
                    ...(level.healing ? ['healing'] : []),
                    ...(level.shielding ? ['shielding'] : [])
                ]
            };

            let localMergedBuffs = structuredClone(mergedBuffs);

            if (override) {
                const result = override({
                    mergedBuffs: localMergedBuffs,
                    combatState,
                    skillMeta,
                    characterState,
                    isActiveSequence,
                    isToggleActive,
                    baseCharacterState: activeCharacter,
                    sliderValues,
                    getSkillData: () => skill,
                    finalStats,
                    element,
                    characterLevel
                });

                localMergedBuffs = result.mergedBuffs;
                skillMeta.skillType = result.skillMeta?.skillType ?? skillMeta.skillType;
                if (result?.skillMeta?.visible === false) continue;
            }

            if (!skillMeta.skillType || (Array.isArray(skillMeta.skillType) && skillMeta.skillType.length === 0)) {
                const name = level.Name?.toLowerCase() ?? '';

                if (name.includes('heavy attack')) {
                    skillMeta.skillType = 'heavy';
                } else if (tab === 'resonanceSkill') {
                    skillMeta.skillType = 'skill';
                } else if (tab === 'resonanceLiberation') {
                    skillMeta.skillType = 'ultimate';
                } else if (tab === 'normalAttack') {
                    skillMeta.skillType = 'basic';
                } else if (tab === 'introSkill') {
                    skillMeta.skillType = 'intro';
                } else if (tab === 'outroSkill') {
                    skillMeta.skillType = 'outro';
                } else {
                    skillMeta.skillType = 'basic';
                }
            }

            entries.push({
                name: level.Name,
                type: Array.isArray(skillMeta.skillType)
                    ? skillMeta.skillType[0]
                    : skillMeta.skillType,
                tab,
                param: level.Param
            });
        }
    }

    return entries;
}