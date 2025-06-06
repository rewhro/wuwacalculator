// /data/echo-set-ui/1001.jsx
import {highlightKeywordsInText, setIconMap} from "../../constants/echoSetData.jsx";
import React from "react";

export default function five2({ setInfo, activeStates, toggleState }) {
    return (
        <div className="echo-buff">
            <div className="echo-buff-header">
                <img className="echo-buff-icon" src={setIconMap[setInfo.id]} alt={setInfo.name} />
                <div className="echo-buff-name">{setInfo.name} (5-piece)</div>
            </div>
            <div className="echo-buff-effect">
                {highlightKeywordsInText(setInfo.fivePiece)}
            </div>
            <label className="modern-checkbox">
                <input
                    type="checkbox"
                    checked={activeStates.molten5 || false}
                    onChange={() => toggleState('molten5')}
                />
                Enable
            </label>
        </div>
    );
}