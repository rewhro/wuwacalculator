import {HelpCircle, RotateCcw, Settings} from 'lucide-react';

export default function ResetButton() {
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
        localStorage.setItem('activeCharacterId', JSON.stringify(1506)); // optional default
        window.location.href = window.location.href;
    };

    return (
        <button className="sidebar-button" onClick={handleReset}>
            <div className="icon-slot">
                <RotateCcw size={24} className="reset-icon" />
            </div>
            <div className="label-slot">
                <span className="label-text">Reset</span>
            </div>
        </button>
    );
}