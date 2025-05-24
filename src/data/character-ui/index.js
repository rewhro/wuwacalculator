import PheobeUI, { CustomInherentSkills as PheobeInherents, PheobeSequenceToggles } from './1506.jsx';
import { CustomInherentSkills as SanhuaInherents, SanhuaSequenceToggles } from './1102.jsx';
import { CustomInherentSkills as BaizhiInherents, BaizhiSequenceToggles } from './1103.jsx';
import LingYangUI, { CustomInherentSkills as LingyangInherents, LingyangSequenceToggles } from './1104.jsx';
import LupaUI, { CustomInherentSkills as LupaInherents, LupaSequenceToggles } from "./1207.jsx";
import ZhezhiUI, {CustomInherentSkills as ZhezhiInherents, ZhezhiSequenceToggles} from './1105.jsx';
import YouhuUI, {CustomInherentSkills as YouhuInherents, youhuSequenceToggles} from "./1106.jsx";
import CarlottaUI, {CarolottaSequenceToggles} from "./1107.jsx";
import CartethyiaUI, { cartethyiaSequenceToggles} from "./1409.jsx";
import {CustomInherentSkills as ChixiaInherents, chixiaSequenceToggles} from "./1202.jsx";
import {CustomInherentSkills as EncoreInherents, encoreSequenceToggles} from "./1203.jsx";
import {CustomInherentSkills as MortefiInherents, mortefiSequenceToggles} from "./1204.jsx";
import {CustomInherentSkills as ChangliInherents, changliSequenceToggles} from "./1205.jsx";
import BrantUI, {CustomInherentSkills as BrantInherents, brantSequenceToggles} from "./1206.jsx";


export function getCharacterUIComponent(characterId) {
    switch (String(characterId)) {
        case '1506': return PheobeUI;
        case '1104': return LingYangUI;
        case '1207': return LupaUI
        case '1105': return ZhezhiUI;
        case '1106': return YouhuUI;
        case '1107': return CarlottaUI;
        case '1409': return CartethyiaUI;
        case '1206': return BrantUI;
        default: return null;
    }
}

export function getCustomInherentSkillsComponent(characterId) {
    switch (String(characterId)) {
        case '1506': return PheobeInherents;
        case '1102': return SanhuaInherents;
        case '1103': return BaizhiInherents;
        case '1104': return LingyangInherents;
        case '1207': return LupaInherents;
        case '1105': return ZhezhiInherents;
        case '1106': return YouhuInherents;
        case '1202': return ChixiaInherents;
        case '1203': return EncoreInherents;
        case '1204': return MortefiInherents;
        case '1205': return ChangliInherents;
        case '1206': return BrantInherents;
        default: return null;
    }
}

export function getSequenceToggleComponent(characterId) {
    switch (String(characterId)) {
        case '1506': return PheobeSequenceToggles;
        case '1102': return SanhuaSequenceToggles;
        case '1103': return BaizhiSequenceToggles;
        case '1104': return LingyangSequenceToggles;
        case '1207': return LupaSequenceToggles;
        case '1105': return ZhezhiSequenceToggles;
        case '1106': return youhuSequenceToggles;
        case '1107': return CarolottaSequenceToggles;
        case '1409': return cartethyiaSequenceToggles;
        case '1202': return chixiaSequenceToggles;
        case '1203': return encoreSequenceToggles;
        case '1204': return mortefiSequenceToggles;
        case '1205': return changliSequenceToggles;
        case '1206': return brantSequenceToggles;
        default: return null;
    }
}