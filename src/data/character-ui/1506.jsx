// src/data/character-ui/1506.jsx
import {formatDescription} from "../../utils/formatDescription.js";

export default function PheobeUI({ activeStates, toggleState }) {
    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Absolution</h4>
                <div>
                    <p>Increase DMG Multiplier by 255% for Dawn of Enlightenment.</p>
                    <p>Increase DMG Multiplier by 255% for Attentive Heart.</p>
                    <p>When the targets hit have Spectro Frazzle, the skill Heavy Attack: Starflash gains 256% DMG Amplification.</p>

                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.absolution || false}
                        onChange={() => {
                            toggleState('absolution');
                            if (activeStates.confession) toggleState('confession'); // turn off other
                        }}
                    />
                    Absolution?
                </label>
            </div>
            <div className="status-toggle-box">
                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Confession</h4>
                <p>Grant Silent Prayer - reducing the Spectro RES of nearby targets by 10% and granting 100% Spectro Frazzle DMG Amplification.</p>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.confession || false}
                        onChange={() => {
                            toggleState('confession');
                            if (activeStates.absolution) toggleState('absolution'); // turn off other
                        }}
                    />
                    Confession?
                </label>
            </div>
        </div>
    );
}

export function PheobeSequenceToggles({ nodeKey, sequenceToggles, toggleSequence, currentSequenceLevel }) {
    if (!['4', '5', '6'].includes(String(nodeKey))) return null;

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