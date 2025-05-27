import {formatDescription} from "../../utils/formatDescription.js";
import React from "react";
import DropdownSelect from "../../components/DropdownSelect.jsx";

export default function JianxinUI({ activeStates, toggleState }) {
    const hasToggles = false; // set to `false` if no actual toggles for this character yet

    if (!hasToggles) return null; // prevents empty box rendering

    return (
        <div className="status-toggles">
            {/* Your checkboxes and toggle logic here */}
        </div>
    );
}

export function jianxinSequenceToggles({
                                         nodeKey,
                                         sequenceToggles,
                                         toggleSequence,
                                         currentSequenceLevel,
                                         setCharacterRuntimeStates,
                                         charId
                                     }) {
    const validKeys = ['4'];
    if (!validKeys.includes(String(nodeKey))) return null;

    const requiredLevel = Number(nodeKey);
    const isDisabled = currentSequenceLevel < requiredLevel;

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