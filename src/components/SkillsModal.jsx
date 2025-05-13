// src/components/SkillsModal.jsx
import React from 'react';
import { formatDescription } from '../utils/formatDescription';
import skillTabs from '../constants/skillTabs';


export default function SkillsModal({ skillsModalOpen, setSkillsModalOpen, activeCharacter, activeSkillTab, setActiveSkillTab, sliderValues, currentSliderColor }) {
    if (!skillsModalOpen) return null;

    const getSkillData = (tab) => {
        if (!activeCharacter?.raw?.SkillTrees) return null;
        const tree = Object.values(activeCharacter.raw.SkillTrees).find(tree =>
            tree.Skill?.Type?.toLowerCase().replace(/\s/g, '') === tab.toLowerCase()
        );
        return tree?.Skill ?? null;
    };

    return (
        <div className="skills-modal-overlay" onClick={() => setSkillsModalOpen(false)}>
            <div className="skills-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="skills-modal-tabs">
                    {skillTabs.map(tab => (
                        <button key={tab} className={`skills-tab ${activeSkillTab === tab ? 'active' : ''}`} onClick={() => setActiveSkillTab(tab)}>
                            {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </button>
                    ))}
                </div>

                <div className="skills-modal-content-area">
                    {activeCharacter && (() => {
                        const skill = getSkillData(activeSkillTab);
                        if (!skill) return <p>No data available.</p>;
                        const sliderValue = sliderValues[activeSkillTab];
                        return (
                            <>
                                <h3>{skill.Name ?? activeSkillTab}</h3>
                                <p dangerouslySetInnerHTML={{ __html: formatDescription(skill.Desc, skill.Param, currentSliderColor) }} />
                                {skill.Level && (
                                    <div className="multipliers-section">
                                        {Object.entries(skill.Level).map(([key, levelData]) => (
                                            <div key={key} className="multiplier-row">
                                                <span className="multiplier-label">{levelData.Name}</span>
                                                <span className="multiplier-value">{levelData.Param?.[0]?.[sliderValue - 1] ?? 'N/A'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>

                <button onClick={() => setSkillsModalOpen(false)}>Close</button>
            </div>
        </div>
    );
}