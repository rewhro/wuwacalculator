// src/data/character-ui/index.js
import PheobeUI, { CustomInherentSkills as PheobeInherents } from './1506.jsx';
import { PheobeSequenceToggles } from './1506.jsx';

export function getCharacterUIComponent(characterId) {
    switch (String(characterId)) {
        case '1506':
            return PheobeUI;
        default:
            return null;
    }
}

export function getCustomInherentSkillsComponent(characterId) {
    switch (String(characterId)) {
        case '1506':
            return PheobeInherents;
        default:
            return null;
    }
}

export function getSequenceToggleComponent(charId) {
    if (String(charId) === '1506') return PheobeSequenceToggles;
    return null;
}