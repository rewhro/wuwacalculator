import React from 'react';
import RotationItem from './RotationItem';
import Rotations from './Rotations';

export default function AdvancedRotation({
                                             team = [],
                                             characterRuntimeStates,
                                             activeCharacter,
                                             rotationEntries,
                                             currentSliderColor
                                         }) {
    const mainId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
    const teammates = team.filter(id => id && id !== mainId);

    const getCharName = (id) => characterRuntimeStates?.[id]?.Name ?? 'Unnamed';
    const getRotationEntries = (id) => characterRuntimeStates?.[id]?.rotationEntries ?? [];

    const totalAllEntries = [
        ...rotationEntries,
        ...teammates.flatMap(id => getRotationEntries(id) ?? [])
    ];

    const renderMiniRotation = (entries) =>
        entries.length === 0 ? (
            <p className="entry-name" style={{ opacity: 0.6 }}>No entries</p>
        ) : (
            entries.map((entry, idx) => (
                <RotationItem
                    key={entry.createdAt ?? idx}
                    index={idx}
                    id={entry.createdAt?.toString() ?? idx.toString()}
                    entry={entry}
                    disabled // <- disables interactivity
                    compact // <- make RotationItem.jsx support compact mode
                    currentSliderColor={currentSliderColor}
                />
            ))
        );

    return (
        <div className="advanced-grid">
            {/* Left: Teammate 1 and 2 */}
            <div className="teammate-column">
                {teammates.map(id => (
                    <div key={id} className="teammate-box rotation-pane">
                        <h4 className="panel-title">{getCharName(id)}</h4>
                        <div className="rotation-list-container">
                            {renderMiniRotation(getRotationEntries(id))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Character */}
            <div className="main-character-box rotation-pane">
                <h2 className="panel-title">{activeCharacter?.displayName}</h2>
                <div className="rotation-list-container">
                    {renderMiniRotation(rotationEntries)}
                </div>
            </div>

            {/* Total Summary */}
            <div className="total-damage-summary">
                <Rotations rotationEntries={totalAllEntries} />
            </div>
        </div>
    );
}