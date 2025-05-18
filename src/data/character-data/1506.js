// src/character-data/1506.jsx

export default {
    id: 1506,
    name: "Pheobe",
    damageTypes: {
        // Resonance skill counts as basic atk
        "Ring of Mirrors: Refracted Holy Light DMG": "basic",
        "Chamuel's Star: Stage 1 DMG": "basic",
        "Chamuel's Star: Stage 2 DMG": "basic",
        "Chamuel's Star: Stage 3 DMG": "basic",

        // Forte Circuit - Heavy
        "Absolution Litany DMG": "heavy",
        "Heavy Attack: Starflash DMG": "heavy",

        // Forte Circuit - Skill
        "Utter Confession DMG": "skill"
    },

    states: {
        absolution: {
            name: "Absolution",
            default: false
        },
        confession: {
            name: "Confession",
            default: false
        }
    },

    extraBuffs: [
        {
            name: "Absolution: Starflash Amplification (Frazzle only)",
            key: "absolutionStarflashAmp",
            condition: ({ state, enemy }) => state.absolution && enemy?.spectroFrazzle,
            statBuffs: {},
            damageAmplify: {
                Heavy: 256 // Skill type amplification
            }
        },
        {
            name: "Absolution: Outro Skill Multiplier",
            key: "absolutionOutroMult",
            condition: ({ state }) => state.absolution,
            multiplierBonus: {
                Outro: 255
            }
        },
        {
            name: "Absolution: Resonance Liberation Multiplier",
            key: "absolutionLiberationMult",
            condition: ({ state }) => state.absolution,
            multiplierBonus: {
                ResonanceLiberation: 255
            }
        },
        {
            name: "Confession: Resonance Liberation Multiplier",
            key: "confessionLiberationMult",
            condition: ({ state }) => state.confession,
            multiplierBonus: {
                ResonanceLiberation: 255
            }
        },
        {
            name: "Inherent 2: Spectro Bonus in Absolution or Confession",
            key: "inherent2SpectroBonus",
            condition: ({ state }) => state.absolution || state.confession,
            statBuffs: {
                spectro: 12
            }
        },
        {
            name: "Sequence 1: Liberation Multiplier Absolution",
            key: "seq1AbsLib",
            condition: ({ state, sequence }) => state.absolution && sequence >= 1,
            overrideMultiplier: {
                ResonanceLiberation: 480
            }
        },
        {
            name: "Sequence 1: Liberation Multiplier Confession",
            key: "seq1ConfLib",
            condition: ({ state, sequence }) => state.confession && sequence >= 1,
            overrideMultiplier: {
                ResonanceLiberation: 90
            }
        },
        {
            name: "Sequence 2: Outro Amp vs Frazzle",
            key: "seq2OutroAmp",
            condition: ({ state, enemy, sequence }) => state.absolution && enemy?.spectroFrazzle && sequence >= 2,
            damageAmplify: {
                Outro: 120
            }
        },
        {
            name: "Sequence 3: Starflash Multiplier (Absolution)",
            key: "seq3StarAbs",
            condition: ({ state, sequence }) => state.absolution && sequence >= 3,
            multiplierBonus: {
                HeavyAttack: 91
            }
        },
        {
            name: "Sequence 3: Starflash Multiplier (Confession)",
            key: "seq3StarConf",
            condition: ({ state, sequence }) => state.confession && sequence >= 3,
            multiplierBonus: {
                HeavyAttack: 249
            }
        },
        {
            name: "Sequence 4: RES Shred",
            key: "seq4ResShred",
            enabled: false,
            condition: ({ sequence, toggles }) => sequence >= 4 && toggles?.seq4ResShred,
            statBuffs: {
                enemyResShred: 10
            }
        },
        {
            name: "Sequence 5: Spectro Bonus",
            key: "seq5Spectro",
            enabled: false,
            condition: ({ sequence, toggles }) => sequence >= 5 && toggles?.seq5Spectro,
            statBuffs: {
                spectro: 12
            }
        },
        {
            name: "Sequence 6: ATK +10% (Absolution/Confession)",
            key: "seq6Atk",
            enabled: false,
            condition: ({ sequence, toggles, state }) =>
                sequence >= 6 && toggles?.seq6Atk && (state?.confession || state?.absolution),
            statBuffs: {
                atkPercent: 10
            }
        }
    ]
};