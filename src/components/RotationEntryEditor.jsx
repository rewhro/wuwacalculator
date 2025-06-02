import React from 'react';
import CustomBuffsPane from '../components/CustomBuffsPane';
import EchoBuffs from '../components/EchoBuffs';
import { getCharacterUIComponent, getCustomInherentSkillsComponent, getSequenceToggleComponent } from '../data/character-ui/index.js';
import { getWeaponUIComponent } from '../data/weapon-behaviour/index.js';

export default function RotationEntryEditor({ entry, characterId, weaponId, onUpdate, onClose }) {
    const overrides = entry.overrides ?? {};

    // Always ensure internal structure exists to avoid crashes
    const safeOverrides = {
        ...overrides,
        customBuffs: overrides.customBuffs ?? {},
        echoBuffs: overrides.echoBuffs ?? [],
        weaponBuffs: overrides.weaponBuffs ?? {},
        characterStates: overrides.characterStates ?? {},
        sequenceToggles: overrides.sequenceToggles ?? {},
        inherentToggles: overrides.inherentToggles ?? {},
    };

    const updateField = (field, value) => {
        onUpdate({
            ...safeOverrides,
            [field]: value ?? safeOverrides[field],
        });
    };

    // Shared helpers for wrapping override state under fake char ID "temp"
    const tempId = 'temp';

    const getWrappedRuntime = (activeStates) => ({
        [tempId]: {
            activeStates: activeStates ?? {}
        }
    });

    const makeSetter = (field) => (newState) => {
        const newOverrides = newState?.[tempId]?.activeStates ?? {};
        updateField(field, newOverrides);
    };

    const CharBuffUI = getCharacterUIComponent(characterId);
    const InherentSkillsUI = getCustomInherentSkillsComponent(characterId);
    const SequenceTogglesUI = getSequenceToggleComponent(characterId);
    const WeaponBuffUI = getWeaponUIComponent(weaponId);

    return (
        <div className="rotation-entry-editor-modal" style={{ background: '#111', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '20px' }}>Editing: {entry.label}</h3>
                <button onClick={onClose} style={{ fontSize: '18px' }}>✕</button>
            </div>

            {/* Character Passive Buffs (e.g. Lion's Vigor, etc.) */}
            {CharBuffUI && (
                <CharBuffUI
                    characterRuntimeStates={getWrappedRuntime(safeOverrides.characterStates)}
                    setCharacterRuntimeStates={makeSetter('characterStates')}
                    charId={tempId}
                />
            )}

            {/* Inherent Skill Toggles */}
            {InherentSkillsUI && (
                <InherentSkillsUI
                    characterRuntimeStates={getWrappedRuntime(safeOverrides.inherentToggles)}
                    setCharacterRuntimeStates={makeSetter('inherentToggles')}
                    charId={tempId}
                />
            )}

            {/* Sequence Toggles */}
            {SequenceTogglesUI && (
                <SequenceTogglesUI
                    characterRuntimeStates={getWrappedRuntime(safeOverrides.sequenceToggles)}
                    setCharacterRuntimeStates={makeSetter('sequenceToggles')}
                    charId={tempId}
                />
            )}

            {/* Echo Buffs */}
            <EchoBuffs
                selectedBuffs={safeOverrides.echoBuffs}
                setSelectedBuffs={(newBuffs) => updateField('echoBuffs', newBuffs)}
            />

            {/* Weapon Buff UI */}
            {WeaponBuffUI && (
                <WeaponBuffUI
                    characterRuntimeStates={getWrappedRuntime(safeOverrides.weaponBuffs)}
                    setCharacterRuntimeStates={makeSetter('weaponBuffs')}
                    charId={tempId}
                />
            )}
        </div>
    );
}