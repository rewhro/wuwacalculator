import { applyPheobeLogic, pheobeMultipliers } from './1506.js';
import { applySanhuaLogic } from './1102.js';
import { applyBaizhiLogic, baizhiMultipliers } from './1103.js';
import {applyLingyangLogic, lingYangMultipliers} from "./1104.js";


const overrides = {
    '1506': {
        logic: applyPheobeLogic,
        multipliers: pheobeMultipliers
    },
    '1102': {
        logic: applySanhuaLogic
    },
    '1103': {
        logic: applyBaizhiLogic,
        multipliers: baizhiMultipliers
    },
    "1104": {
        logic: applyLingyangLogic,
        multipliers: lingYangMultipliers
    }
};

export function getCharacterOverride(charId) {
    return overrides[String(charId)]?.logic ?? null;
}

export function getHardcodedMultipliers(charId) {
    return overrides[String(charId)]?.multipliers ?? {};
}