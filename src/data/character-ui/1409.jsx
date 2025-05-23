import {formatDescription} from "../../utils/formatDescription.js";
import React from "react";
import DropdownSelect from "../../components/DropdownSelect.jsx";

export default function CartethyiaUI({ activeStates, toggleState }) {
    const manifestActive = activeStates.manifestActive;
    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                {/* Manifest Toggle */}
                <div className="status-toggle-box-inner">
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Manifest</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>When in Manifest, Fleurdelys gains 60% Aero DMG Bonus.</li>
                    </ul>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={manifestActive || false}
                            onChange={() => toggleState('manifestActive')}
                        />
                        Enable
                    </label>
                </div>

                {/* Mandate of Divinity Toggle (disabled if Manifest is off) */}
                <div className="status-toggle-box-inner">
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Mandate of Divinity</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>When Fleurdelys has Mandate of Divinity in Manifest Aero Erosion's DMG is Amplified by 50%</li>
                    </ul>
                    <label className="modern-checkbox" style={{ opacity: manifestActive ? 1 : 0.4 }}>
                        <input
                            type="checkbox"
                            checked={activeStates.divinity || false}
                            onChange={() => {
                                if (manifestActive) toggleState('divinity');
                            }}
                            disabled={!manifestActive}
                        />
                        Enable
                    </label>
                </div>
            </div>
        </div>
    );
}


// If you have sequence toggles:
export function cartethyiaSequenceToggles({
                                        nodeKey,
                                        sequenceToggles,
                                        toggleSequence,
                                        currentSequenceLevel,
                                        setCharacterRuntimeStates,
                                        charId
                                    }) {
    const validKeys = ['1', '4'];
    if (!validKeys.includes(String(nodeKey))) return null;

    const requiredLevel = Number(nodeKey);
    const isDisabled = currentSequenceLevel < requiredLevel;

    // === Sequence 6: dropdown input ===
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
                options={[0, 30, 60, 90, 120]}
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