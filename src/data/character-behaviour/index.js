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
import {applyMortefiLogic, mortefiMultipliers} from "./1204.js";
import {applyChangliLogic} from "./1205.js";
import {applyBrantLogic, brantMultipliers} from "./1206.js";
import {applyCalcharoLogic, calcharoMultipliers} from "./1301.js";
import {applyYinlinLogic, yinlinMultipliers} from "./1302.js";
import {applyYuanwuLogic, yuanwuMultipliers} from "./1303.js";
import {applyJinhsiLogic} from "./1304.js";
import {applyYaoLogic, yaoMultipliers} from "./1305.js";
import {applyZaniLogic, zaniMultipliers} from "./1507.js";
import {applyYangLogic} from "./1402.js";
//import {applyAaltoLogic, aaltoMultipliers} from "./1403.js";
import {applyJiyanLogic, jiyanMultipliers} from "./1404.js";
import {applyJianxinLogic, jianxinMultipliers} from "./1405.js";
import {applyAeroRoverMLogic, aeroRoverMMultipliers} from "./1406.js";
import {applyCiacconaLogic, ciacconaMultipliers} from "./1407.js";
import {applySpectroMLogic, spectroMMultipliers} from "./1501.js";
import {applyVerinaLogic, verinaMultipliers} from "./1503.js";


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
    },
    "1204": {
        logic: applyMortefiLogic,
        multipliers: mortefiMultipliers
    },
    "1205": {
        logic: applyChangliLogic
    },
    "1206": {
        logic: applyBrantLogic,
        multipliers: brantMultipliers
    },
    "1301": {
        logic: applyCalcharoLogic,
        multipliers: calcharoMultipliers
    },
    "1302": {
        logic: applyYinlinLogic,
        multipliers: yinlinMultipliers
    },
    "1303": {
        logic: applyYuanwuLogic,
        multipliers: yuanwuMultipliers
    },
    "1304": {
        logic: applyJinhsiLogic
    },
    "1305": {
        logic: applyYaoLogic,
        multipliers: yaoMultipliers
    },
    "1507": {
        logic: applyZaniLogic,
        multipliers: zaniMultipliers
    },
    "1402": {
        logic: applyYangLogic
    },
    "1404": {
        logic: applyJiyanLogic,
        multipliers: jiyanMultipliers
    },
    "1405": {
        logic: applyJianxinLogic,
        multipliers: jianxinMultipliers
    },
    "1406": {
        logic: applyAeroRoverMLogic,
        multipliers: aeroRoverMMultipliers
    },
    "1408": {
        logic: applyAeroRoverMLogic,
        multipliers: aeroRoverMMultipliers
    },
    "1407": {
        logic: applyCiacconaLogic,
        multipliers: ciacconaMultipliers
    },
    "1501": {
        logic: applySpectroMLogic,
        multipliers: spectroMMultipliers
    },
    "1502": {
        logic: applySpectroMLogic,
        multipliers: spectroMMultipliers
    },
    "1503": {
        logic: applyVerinaLogic,
        multipliers: verinaMultipliers
    }
};

export function getCharacterOverride(charId) {
    return overrides[String(charId)]?.logic ?? null;
}

export function getHardcodedMultipliers(charId) {
    return overrides[String(charId)]?.multipliers ?? {};
}