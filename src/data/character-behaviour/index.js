import { applyPheobeLogic, pheobeMultipliers } from './1506.js';

const overrides = {
    '1506': {
        logic: applyPheobeLogic,
        multipliers: pheobeMultipliers
    }
};

export function getCharacterOverride(charId) {
    return overrides[charId]?.logic ?? null;
}

export function getHardcodedMultipliers(charId) {
    return overrides[charId]?.multipliers ?? {};
}