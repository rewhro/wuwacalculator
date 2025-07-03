import { useState } from 'react';


export default function ResetSettingsButton() {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleReset = () => {
        localStorage.clear();
        localStorage.setItem('enemyLevel', JSON.stringify(100));
        localStorage.setItem('enemyRes', JSON.stringify(20));
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

    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowConfirm(false);
            setIsClosing(false);
        }, 300);
    };

    return (
        <>
            <button
                className="btn-primary"
                onClick={() => setShowConfirm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                Delete
            </button>

            {showConfirm && (
                <div
                    className={`skills-modal-overlay ${isClosing ? 'closing' : ''}`}
                    onClick={handleClose}
                >
                    <div
                        className={`skills-modal-content ${isClosing ? 'closing' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}
                    >
                        <h2 style={{ marginBottom: '1rem' }}>Delete Everything?</h2>
                        <p>This will completely delete all your data and set to default.</p>
                        <p><strong>This cannot be undone.</strong></p>

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-around' }}>
                            <button className="btn-primary" onClick={handleClose}>
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