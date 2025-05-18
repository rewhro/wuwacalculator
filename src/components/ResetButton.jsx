import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function ResetButton() {
    const [resetModalOpen, setResetModalOpen] = useState(false);

    const handleReset = () => {
        localStorage.clear();
        localStorage.setItem('enemyLevel', JSON.stringify(1));
        localStorage.setItem('enemyRes', JSON.stringify(0));
        localStorage.setItem('characterRuntimeStates', JSON.stringify({}));
        localStorage.setItem('sliderValues', JSON.stringify({
            normalAttack: 1,
            resonanceSkill: 1,
            forteCircuit: 1,
            resonanceLiberation: 1,
            introSkill: 1,
            sequence: 0
        }));
        localStorage.setItem('activeCharacterId', JSON.stringify(1506));
        window.location.href = window.location.href;
    };

    return (
        <>
            <button className="sidebar-button" onClick={() => setResetModalOpen(true)}>
                <div className="icon-slot">
                    <RotateCcw size={24} className="reset-icon" />
                </div>
                <div className="label-slot">
                    <span className="label-text">Reset</span>
                </div>
            </button>

            {resetModalOpen && (
                <div className="skills-modal-overlay" onClick={() => setResetModalOpen(false)}>
                    <div className="skills-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>...you sure?</h3>
                        <p>
                            this will clear all data and reset everything to it's default state.
                        </p>
                        <p>EVERYTHING</p>
                        <div className="reset-modal-actions">
                            <button className="btn-danger" onClick={handleReset}>clear it all...</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}