import { applyPheobeLogic, pheobeMultipliers } from './1506.js';
import { applySanhuaLogic } from './1102.js';

const overrides = {
    '1506': {
        logic: applyPheobeLogic,
        multipliers: pheobeMultipliers
    },
    '1102': {
        logic: applySanhuaLogic
    }
};

export function getCharacterOverride(charId) {
    return overrides[String(charId)]?.logic ?? null;
}

export function getHardcodedMultipliers(charId) {
    return overrides[String(charId)]?.multipliers ?? {};
}