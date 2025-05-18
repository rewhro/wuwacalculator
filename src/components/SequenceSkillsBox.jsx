// src/components/SequenceSkillsBox.jsx
import React from 'react';
import { formatDescription } from '../utils/formatDescription';
import { getSequenceToggleComponent } from '../data/character-ui';

export default function SequenceSkillsBox({
                                              activeCharacter,
                                              currentSliderColor,
                                              sliderValues,
                                              characterRuntimeStates,
                                              setCharacterRuntimeStates
                                          }) {
    if (!activeCharacter || !activeCharacter.raw?.Chains || sliderValues.sequence === 0) return null;

    const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
    const ToggleComponent = getSequenceToggleComponent(charId);
    const sequenceLevel = sliderValues.sequence;
    const chains = activeCharacter.raw.Chains;

    const unlockedChains = Object.entries(chains)
        .filter(([key]) => Number(key) <= sequenceLevel)
        .sort(([a], [b]) => Number(a) - Number(b));

    const sequenceToggles = characterRuntimeStates?.[charId]?.sequenceToggles ?? {};

    const toggleSequence = (seqKey) => {
        setCharacterRuntimeStates(prev => {
            const newState = {
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    sequenceToggles: {
                        ...(prev[charId]?.sequenceToggles ?? {}),
                        [seqKey]: !(prev[charId]?.sequenceToggles?.[seqKey] ?? false)
                    }
                }
            };

            return newState;
        });
    };

    return (
        <div className="inherent-skills-box">
            <h3>Resonance Chain</h3>

            <div className="inherent-skills">
                {unlockedChains.map(([key, chain]) => (
                    <div key={key} className="inherent-skill">
                        <h4>Sequence Node {key}: {chain.Name}</h4>
                        <p dangerouslySetInnerHTML={{
                            __html: formatDescription(chain.Desc, chain.Param, currentSliderColor)
                        }} />

                        {/* 💡 Inline toggle for this specific sequence node */}
                        {ToggleComponent && (
                            <ToggleComponent
                                nodeKey={key}
                                sequenceToggles={sequenceToggles}
                                toggleSequence={toggleSequence}
                                currentSequenceLevel={sliderValues.sequence}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}