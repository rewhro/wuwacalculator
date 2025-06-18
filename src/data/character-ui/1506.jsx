// src/data/character-ui/1506.jsx
import {formatDescription} from "../../utils/formatDescription.js";
import React from "react";

export default function PheobeUI({ activeStates, toggleState }) {
    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <h4 className={'highlight'} style={{ fontSize: '18px', fontWeight: 'bold' }}>Absolution</h4>
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
                <h4 className={'highlight'} style={{ fontSize: '18px', fontWeight: 'bold' }}>Confession</h4>
                <p>Grant Silent Prayer - reducing the Spectro RES of nearby targets by 10% and granting 100% Spectro Frazzle DMG Amplification.</p>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.confession || false}
                        onChange={() => {
                            toggleState('confession');
                            if (activeStates.absolution) toggleState('absolution');
                        }}
                    />
                    Confession?
                </label>
            </div>

            <div className="status-toggle-box">
                <h4 className={'highlight'} style={{ fontSize: '18px', fontWeight: 'bold' }}>Outro Skill: Attentive Heart</h4>
                <p>Confession Enhancement: Grant Silent Prayer to the Resonator on the field, reducing the Spectro RES of nearby targets by 10% and granting 100% Spectro Frazzle DMG Amplification. When Spectro Frazzle inflicts DMG, extend Spectro Frazzle's damage interval by 50%. This effect lasts 30s or until Phoebe switches to Absolution status.</p>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.attentive || false}
                        onChange={() => {
                            toggleState('attentive');
                        }}
                    />
                    Enable
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

export function buffUI({ activeStates, toggleState, charId, setCharacterRuntimeStates, attributeColors }) {
    const updateState = (key, value) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    [key]: value
                }
            }
        }));
    };

    return (
        <div className="echo-buffs">
            <div className="echo-buff">
                <div className="echo-buff-header">
                    <div className="echo-buff-name">Outro Skill: Attentive Heart</div>
                </div>
                <div className="echo-buff-effect">
                    <span className="highlight">Confession</span> Enhancement: Grant Silent Prayer to the Resonator on the field, reducing the <span style={{ color: attributeColors['spectro'], fontWeight: 'bold' }}>Spectro RES</span> of nearby targets by <span className="highlight">10%</span> and granting <span className="highlight">100%</span> <span style={{ color: attributeColors['spectro'], fontWeight: 'bold' }}>Spectro Frazzle DMG</span> Amplification. This effect lasts 30s or until Phoebe switches to Absolution status.
                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.attentive || false}
                        onChange={() => toggleState('attentive')}
                    />
                    Enable
                </label>
            </div>

            <div className="echo-buff">
                <div className="echo-buff-header">
                    <div className="echo-buff-name">S2: A Boat Adrift in Tears</div>
                </div>
                <div className="echo-buff-effect">
                    Casting <span className="highlight">Resonance Liberation</span> Living Canvas increases ATK of Resonators on the team <span className="highlight">20%</span> for <span className="highlight">30s</span>.

                    When in <span className="highlight">Confession</span>, <span className="highlight">Silent Prayer</span> grants <span className="highlight">120%</span> more DMG Amplification for <span style={{ color: attributeColors['spectro'], fontWeight: 'bold' }}>Spectro Frazzle</span>.
                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.boatAdrift || false}
                        onChange={() => toggleState('boatAdrift')}
                        disabled={!activeStates.attentive}
                    />
                    Enable
                </label>
            </div>
        </div>
    );
}