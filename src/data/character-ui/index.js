import PheobeUI, { CustomInherentSkills as PheobeInherents } from './1506.jsx';
import { PheobeSequenceToggles } from './1506.jsx';
import SanhuaUI, { CustomInherentSkills as SanhuaInherents, SanhuaSequenceToggles } from './1102.jsx';

export function getCharacterUIComponent(characterId) {
    switch (String(characterId)) {
        case '1506': return PheobeUI;
        default: return null;
    }
}

export function getCustomInherentSkillsComponent(characterId) {
    switch (String(characterId)) {
        case '1506': return PheobeInherents;
        case '1102': return SanhuaInherents;
        default: return null;
    }
}

export function getSequenceToggleComponent(characterId) {
    switch (String(characterId)) {
        case '1506': return PheobeSequenceToggles;
        case '1102': return SanhuaSequenceToggles;
        default: return null;
    }
}