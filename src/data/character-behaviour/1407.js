export function applyCiacconaLogic({
                               mergedBuffs,
                               combatState,
                               skillMeta,
                               characterState,
                               isActiveSequence = () => false,
                               isToggleActive = () => false,
    characterLevel = 1
                           }) {
    skillMeta = {
        name: skillMeta?.name ?? '',
        skillType: skillMeta?.skillType ?? 'basic',
        multiplier: skillMeta?.multiplier ?? 1,
        amplify: skillMeta?.amplify ?? 0,
        ...skillMeta
    };

    const isToggleActiveLocal = (key) => characterState?.activeStates?.[key] === true;
    const name = skillMeta.name?.toLowerCase();
    const tab = skillMeta.tab ?? '';

    if (name.includes('aimed shot') || name.includes('quadruple downbeat')) {
        skillMeta.skillType = 'heavy';
    }

    if (characterState?.activeStates?.concert && !mergedBuffs.__concert) {
        mergedBuffs.aero = (mergedBuffs.aero ?? 0) + 24;
        mergedBuffs.__concert = true;
    }

    if (name.includes('interlude tune')) {
        skillMeta.visible = characterLevel >= 50;
        skillMeta.multiplier = 1;
    }

    if (characterLevel >= 70 && name.includes('quadruple downbeat')) {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 30;
    }

    if (isToggleActive(1) && isActiveSequence(1) && !mergedBuffs.__ciacconaS1) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 35;
        mergedBuffs.__ciacconaS1 = true;
    }

    if (isToggleActive(2) && isActiveSequence(2) && !mergedBuffs.__ciacconaS2) {
        mergedBuffs.aero = (mergedBuffs.aero ?? 0) + 40;
        mergedBuffs.__ciacconaS2 = true;
    }

    if ((tab === 'forteCircuit' || tab === 'resonanceLiberation') && isActiveSequence(4)) {
        skillMeta.skillDefIgnore = (skillMeta.skillDefIgnore ?? 0) + 45;
    }

    if (isActiveSequence(5) && !mergedBuffs.__ciacconaS5) {
        mergedBuffs.resonanceLiberation = (mergedBuffs.resonanceLiberation ?? 0) + 40;
        mergedBuffs.__ciacconaS5 = true;
    }

    if (name.includes('unending cadence')) {
        skillMeta.multiplier = 220/100;
        skillMeta.skillType = 'ultimate';
        skillMeta.visible = isActiveSequence(6);
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const ciacconaMultipliers = {
    resonanceLiberation: [
        {
            name: "Interlude Tune: Shield",
            scaling: { hp: 1 },
            shielding: true
        },
        {
            name: "Unending Cadence: Skill DMG",
            scaling: { atk: 1 }
        }
    ]
};

export function ciacconaBuffsLogic({
                                    mergedBuffs, characterState, activeCharacter
                               }) {
    const state = characterState?.activeStates ?? {};

    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    // 1️⃣ Windcalling Tune
    if (state.windcalling) {
        mergedBuffs.damageTypeAmplify.aeroErosion = (mergedBuffs.damageTypeAmplify.aeroErosion ?? 0) + 100;
    }

    // 2️⃣ Solo Concert
    if (state.concert) {
        mergedBuffs.aero = (mergedBuffs.aero ?? 0) + 25;
    }

    // 3️⃣ Song of the Four Seasons
    if (state.s2) {
        mergedBuffs.aero = (mergedBuffs.aero ?? 0) + 40;
    }

    return { mergedBuffs };
}