import { applyPheobeLogic, pheobeMultipliers } from './1506.js';
import { applySanhuaLogic } from './1102.js';
import { applyBaizhiLogic, baizhiMultipliers } from './1103.js';
import {applyLingyangLogic, lingYangMultipliers} from "./1104.js";
import {applyLupaLogic} from "./1207.js";
import {applyZhezhiLogic, zhezhiMultipliers} from "./1105.js";
import {applyYouhuLogic, youhuMultipliers} from "./1106.js";
import {applyCarlottaLogic, carlottaMultipliers} from "./1107.js";
import {applyCartethyiaLogic, cartethyiaMultipliers} from "./1409.js";
import {applyChixiaLogic, chixiaMultipliers} from "./1202.js";
import {applyEncoreLogic, encoreMultipliers} from "./1203.js";



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
        logic: applyYouhuLogic,
        multipliers: youhuMultipliers
    },
    "1107": {
        logic: applyCarlottaLogic,
        multipliers: carlottaMultipliers
    },
    "1409": {
        logic: applyCartethyiaLogic,
        multipliers: cartethyiaMultipliers
    },
    "1202": {
        logic: applyChixiaLogic,
        multipliers: chixiaMultipliers
    },
    "1203": {
        logic: applyEncoreLogic,
        multipliers: encoreMultipliers
    }
};

export function getCharacterOverride(charId) {
    return overrides[String(charId)]?.logic ?? null;
}

export function getHardcodedMultipliers(charId) {
    return overrides[String(charId)]?.multipliers ?? {};
}