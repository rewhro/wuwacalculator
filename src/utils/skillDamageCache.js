import {isEqual} from "lodash";

let cachedSkillDamage = [];

export function setSkillDamageCache(data, charId, characterRuntimeStates, setCharacterRuntimeStates) {
    if (charId && characterRuntimeStates?.[charId]) {
        const prevResults = characterRuntimeStates[charId]?.allSkillResults;
        if (!isEqual(prevResults, data)) {
            setCharacterRuntimeStates(prevStates => ({
                ...prevStates,
                [charId]: {
                    ...prevStates[charId],
                    allSkillResults: data
                }
            }));
        }
    }

    cachedSkillDamage = data;
}

export function getSkillDamageCache() {
    return cachedSkillDamage;
}