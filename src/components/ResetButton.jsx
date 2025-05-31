import {useState} from "react";
import {RotateCcw} from "lucide-react";

export default function ResetButton() {
    const [resetModalOpen, setResetModalOpen] = useState(false);

    const handleReset = () => {
        const activeId = JSON.parse(localStorage.getItem('activeCharacterId') || 'null');
        if (!activeId) return;

        const runtime = JSON.parse(localStorage.getItem('characterRuntimeStates') || '{}');
        const updatedRuntime = { ...runtime };
        delete updatedRuntime[activeId]; // ❌ Remove just the active character

        localStorage.setItem('characterRuntimeStates', JSON.stringify(updatedRuntime));
        window.location.href = window.location.href; // 🔁 Refresh to reset state
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
                        <h2>Reset Character?</h2>
                        <div className="reset-modal-actions">
                            <button className="btn-danger" onClick={handleReset}>Reset Character</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}