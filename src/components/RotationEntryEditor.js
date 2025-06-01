// src/components/RotationEntryEditor.jsx
import React, { useState } from 'react';

export default function RotationEntryEditor({ entry, onChange, onClose }) {
    const [localOverrides, setLocalOverrides] = useState(() => entry.overrides ?? {
        customBuffs: {},
        combatState: {},
        sequenceToggles: {},
        inherentToggles: {}
    });

    const handleSave = () => {
        onChange(localOverrides);
        onClose();
    };

    return (
        <div className="rotation-entry-editor-overlay" onClick={onClose}>
            <div className="rotation-entry-editor-panel" onClick={(e) => e.stopPropagation()}>
                <h3>Edit: {entry.label}</h3>

                {/* EXAMPLE: Custom fields */}
                <label>ATK %</label>
                <input
                    type="number"
                    value={localOverrides.customBuffs.atkPercent ?? ''}
                    onChange={(e) =>
                        setLocalOverrides(prev => ({
                            ...prev,
                            customBuffs: {
                                ...prev.customBuffs,
                                atkPercent: parseFloat(e.target.value) || 0
                            }
                        }))
                    }
                />

                <label>Crit Rate %</label>
                <input
                    type="number"
                    value={localOverrides.combatState.critRate ?? ''}
                    onChange={(e) =>
                        setLocalOverrides(prev => ({
                            ...prev,
                            combatState: {
                                ...prev.combatState,
                                critRate: parseFloat(e.target.value) || 0
                            }
                        }))
                    }
                />

                <div className="editor-buttons">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}