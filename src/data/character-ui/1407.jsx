import React from "react";
import DropdownSelect from "../../components/DropdownSelect.jsx";

export default function CiacconaUI({ activeStates, toggleState }) {
    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Solo Concert</h4>
                <p>When Ciaccona or Ensemble Sylph performs Solo Concert, they give 24% Aero DMG Bonus to all nearby Resonators in the team.</p>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.concert || false}
                        onChange={() => {
                            toggleState('concert');
                        }}
                    />
                    Enable
                </label>
            </div>
        </div>
    );
}

export function ciacconaSequenceToggles({
                                         nodeKey,
                                         sequenceToggles,
                                         toggleSequence,
                                         currentSequenceLevel,
                                         setCharacterRuntimeStates,
                                         charId
                                     }) {
    const validKeys = ['1', '2'];
    if (!validKeys.includes(String(nodeKey))) return null;

    const requiredLevel = Number(nodeKey);
    const isDisabled = currentSequenceLevel < requiredLevel;


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