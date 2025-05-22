import PheobeUI, { CustomInherentSkills as PheobeInherents } from './1506.jsx';
import { PheobeSequenceToggles } from './1506.jsx';
import SanhuaUI, { CustomInherentSkills as SanhuaInherents, SanhuaSequenceToggles } from './1102.jsx';
import { CustomInherentSkills as BaizhiInherents, BaizhiSequenceToggles } from './1103.jsx';
import LingYangUI, { CustomInherentSkills as LingyangInherents, LingyangSequenceToggles } from './1104.jsx';
import LupaUI, { CustomInherentSkills as LupaInherents, LupaSequenceToggles } from "./1207.jsx";

export function getCharacterUIComponent(characterId) {
    switch (String(characterId)) {
        case '1506': return PheobeUI;
        case '1104': return LingYangUI;
        case '1207': return LupaUI
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
        default: return null;
    }
}