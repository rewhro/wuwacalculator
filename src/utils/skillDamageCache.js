// src/state/skillDamageCache.js
let cachedSkillDamage = [];

export function setSkillDamageCache(data) {
    cachedSkillDamage = data;
}

export function getSkillDamageCache() {
    return cachedSkillDamage;
}