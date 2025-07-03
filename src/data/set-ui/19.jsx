import {highlightKeywordsInText, setIconMap} from "../../constants/echoSetData.jsx";
import React from "react";
import {attributeColors} from "../../utils/attributeHelpers.js";
import DropdownSelect from "../../components/DropdownSelect.jsx";

export default function three19 ({ setInfo, activeStates, charId, setCharacterRuntimeStates }) {
    const dreamOfTheLostValue = activeStates?.dreamOfTheLost3pc ?? 0;

    const handleChange = (newValue) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    dreamOfTheLost3pc: newValue
                }
            }
        }));
    };

    return (
        <div className="echo-buff">
            <div className="echo-buff-header">
                <img className="echo-buff-icon" src={setIconMap[setInfo.id]} alt={setInfo.name} />
                <div className="echo-buff-name">{setInfo.name} (3-piece)</div>
            </div>
            <div className="echo-buff-effect">
                {highlightKeywordsInText(setInfo.threePiece)}
            </div>
            <DropdownSelect
                label=""
                options={[0, 1, 2, 3, 4]}
                value={dreamOfTheLostValue}
                onChange={handleChange}
                width="80px"
            />
        </div>
    );
}