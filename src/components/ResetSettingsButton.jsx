import { useState } from 'react';


export default function ResetSettingsButton() {
    const [showConfirm, setShowConfirm] = useState(false);

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
        window.location.href = '/';
    };

    return (
        <>
            <button
                className="btn-primary"
                onClick={() => setShowConfirm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                {/*<RotateCcw size={20} />*/}
                Delete
            </button>

            {showConfirm && (
                <div className="skills-modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div
                        className="skills-modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}
                    >
                        <h2 style={{ marginBottom: '1rem' }}>Delete Everything?</h2>
                        <p>This will completely delete all your data and set to default.</p>
                        <p><strong>This cannot be undone.</strong></p>

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-around' }}>
                            <button className="btn-primary" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={handleReset}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}