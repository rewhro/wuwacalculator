// src/components/SequenceSkillsBox.jsx
import React from 'react';
import { formatDescription } from '../utils/formatDescription';

export default function SequenceSkillsBox({ activeCharacter, currentSliderColor, sliderValues }) {
    if (!activeCharacter || !activeCharacter.raw?.Chains || sliderValues.sequence === 0) return null;

    const chains = activeCharacter.raw.Chains;
    const sequenceLevel = sliderValues.sequence;

    // Get all chains from 1 to current sequence level
    const unlockedChains = Object.entries(chains)
        .filter(([key]) => Number(key) <= sequenceLevel)
        .sort(([a], [b]) => Number(a) - Number(b)); // Sort numerically

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
                    </div>
                ))}
            </div>
        </div>
    );
}