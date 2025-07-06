import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import {mapExtraStatToCombat} from "./WeaponPane.jsx";

export default function ResetButton({ onClick }) {
    return (
        <button className="sidebar-button reset" onClick={onClick}>
            <div className="icon-slot">
                <RotateCcw size={24} className="reset-icon" />
            </div>
            <div className="label-slot">
                <span className="label-text">Reset</span>
            </div>
        </button>
    );
}

export function ResetCharacter ({
                                    handleClose,
                                    isClosing,
                                    handleReset,
                                    setHamburgerOpen
                                }) {
    const reset = () => {
        handleReset();
        handleClose();
        setHamburgerOpen(false);
    }

    return (
        <div className={`skills-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
            <div className={`skills-modal-content ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                <h2>Reset Character?</h2>
                <div className="reset-modal-actions">
                    <button className="btn-danger" onClick={reset}>Reset Character</button>
                </div>
            </div>
        </div>
    )
}