import DropdownSelect from "../../components/DropdownSelect.jsx";
import React from "react";

export default function JinhsiUI({ characterRuntimeStates, setCharacterRuntimeStates, charId }) {
    const activeStates = characterRuntimeStates?.[charId]?.activeStates ?? {};

    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Incandescence</h4>
                <div>
                    <p>Consume up to 50 Incandescence, with each point of Incandescence granting bonus DMG Multiplier percentage to Stella Glamor</p>
                </div>
                <input
                    type="number"
                    className="character-level-input"
                    min="0"
                    max="50"
                    value={activeStates.incandescence ?? 0}
                    onChange={(e) => {
                        const val = Math.max(0, Math.min(50, Number(e.target.value) || 0));
                        setCharacterRuntimeStates(prev => ({
                            ...prev,
                            [charId]: {
                                ...(prev[charId] ?? {}),
                                activeStates: {
                                    ...(prev[charId]?.activeStates ?? {}),
                                    incandescence: val
                                }
                            }
                        }));
                    }}
                />
            </div>
        </div>
    );
}

export function jinhsiSequenceToggles({
                                        nodeKey,
                                        sequenceToggles,
                                        toggleSequence,
                                        currentSequenceLevel,
                                        setCharacterRuntimeStates,
                                        charId
                                    }) {
    const validKeys = ['1', '3', '4'];
    if (!validKeys.includes(String(nodeKey))) return null;

    const requiredLevel = Number(nodeKey);
    const isDisabled = currentSequenceLevel < requiredLevel;

    if (String(nodeKey) === '1') {
        const value = sequenceToggles['1_value'] ?? 0;

        const handleChange = (newValue) => {
            setCharacterRuntimeStates(prev => ({
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    sequenceToggles: {
                        ...(prev[charId]?.sequenceToggles ?? {}),
                        ['1_value']: newValue
                    }
                }
            }));
        };

        return (
            <DropdownSelect
                label=""
                options={[0, 1, 2, 3, 4]}
                value={value}
                onChange={handleChange}
                disabled={isDisabled}
                className="sequence-dropdown"
                width="80px"
            />
        );
    } else if (String(nodeKey) === '3') {
        const value = sequenceToggles['3_value'] ?? 0;

        const handleChange = (newValue) => {
            setCharacterRuntimeStates(prev => ({
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    sequenceToggles: {
                        ...(prev[charId]?.sequenceToggles ?? {}),
                        ['3_value']: newValue
                    }
                }
            }));
        };

        return (
            <DropdownSelect
                label=""
                options={[0, 1, 2]}
                value={value}
                onChange={handleChange}
                disabled={isDisabled}
                className="sequence-dropdown"
                width="80px"
            />
        );
    }

    // === All other sequences: checkbox ===
    return (
        <label className="modern-checkbox" style={{ opacity: isDisabled ? 0.5 : 1 }}>
            <input
                type="checkbox"
                checked={sequenceToggles[nodeKey] || false}
                onChange={() => toggleSequence(nodeKey)}
                disabled={isDisabled}
            />
            Enable
        </label>
    );
}