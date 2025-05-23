import { applyPheobeLogic, pheobeMultipliers } from './1506.js';
import { applySanhuaLogic } from './1102.js';
import { applyBaizhiLogic, baizhiMultipliers } from './1103.js';
import {applyLingyangLogic, lingYangMultipliers} from "./1104.js";
import {applyLupaLogic} from "./1207.js";
import {applyZhezhiLogic, zhezhiMultipliers} from "./1105.js";
import {applyYouhuogic, youhuMultipliers} from "./1106.js";

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
    },
    "1207": {
        logic: applyLupaLogic
    },
    "1105": {
        logic: applyZhezhiLogic,
        multipliers: zhezhiMultipliers
    },
    "1106": {
        logic: applyYouhuogic,
        multipliers: youhuMultipliers
    }
};

export function getCharacterOverride(charId) {
    return overrides[String(charId)]?.logic ?? null;
}

export function getHardcodedMultipliers(charId) {
    return overrides[String(charId)]?.multipliers ?? {};
}