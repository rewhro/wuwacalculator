// src/components/WeaponBuffs.jsx
import React from 'react';
import { attributeColors } from '../utils/attributeHelpers';
import DropdownSelect from './DropdownSelect';
import { getCurrentParamValues } from './WeaponPane';

const weaponBuffs = [
    {
        key: 'staticMist',
        name: 'Static Mist',
        icon: '/assets/weapon-icons/21030015.webp',
        param: [[10, 12.5, 15, 17.5, 20]],
        effect: (param = []) => (
            <>
                Incoming Resonator's ATK is increased by <span className="highlight">{param[0] ?? '—'}%</span> for <span className="highlight">14s</span>, stackable for up to 1 times after the wielder casts Outro Skill.
            </>
        )
    },
    {
        key: 'stellarSymphony',
        name: 'Stellar Symphony',
        icon: '/assets/weapon-icons/21050036.webp',
        param: [[14, 17.5, 21, 24.5, 28]],
        effect: (param = []) => (
            <>
                When casting Resonance Skill that heals, increase nearby party members' ATK by <span className="highlight">{param[0] ?? '—'}%</span> for <span className="highlight">30s</span>. Effects of the same name cannot be stacked.
            </>
        )
    },
    {
        key: 'luminousHymn',
        name: 'Luminous Hymn',
        icon: '/assets/weapon-icons/21050046.webp',
        param: [[30, 37.5, 45, 52.5, 60]],
        effect: (param = []) => (
            <>
                Casting Outro Skill Amplifies the <span style={{ color: attributeColors['spectro'], fontWeight: 'bold' }}>Spectro Frazzle DMG</span> on targets around the active Resonator by <span className="highlight">{param[0] ?? '—'}%</span> for <span className="highlight">30s</span>. Effects of the same name cannot be stacked.
            </>
        )
    },
    {
        key: 'bloodpactsPledge',
        name: "Bloodpact's Pledge",
        icon: '/assets/weapon-icons/21020046.webp',
        param: [[10, 14, 18, 22, 26]],
        effect: (param = []) => (
            <>
                When Rover: <span style={{ color: attributeColors['aero'], fontWeight: 'bold' }}>Aero</span> casts Resonance Skill Unbound Flow, <span style={{ color: attributeColors['aero'], fontWeight: 'bold' }}>Aero DMG</span> dealt by nearby Resonators on the field is Amplified by <span className="highlight">{param[0] ?? '—'}%</span> for <span className="highlight">30s</span>.
            </>
        )
    },
    {
        key: 'woodlandAria',
        name: 'Woodland Aria',
        icon: '/assets/weapon-icons/21030026.webp',
        param: [[10, 11.5, 13, 14.5, 16]],
        effect: (param = []) => (
            <>
                Hitting targets with <span style={{ color: attributeColors['aero'], fontWeight: 'bold' }}>Aero Erosion</span> reduces their <span style={{ color: attributeColors['aero'], fontWeight: 'bold' }}>Aero Res</span> by <span className="highlight">{param[0] ?? '—'}%</span> for <span className="highlight">20s</span>. Effects of the same name cannot be stacked.
            </>
        )
    },
    {
        key: 'wildfireMark',
        name: 'Wildfire Mark',
        icon: '/assets/weapon-icons/21010036.webp',
        param: [[24, 30, 36, 42, 48]],
        effect: (param = []) => (
            <>
                Dealing Heavy Attack DMG extends this effect by <span className="highlight">4s</span>, up to 1 times. Each successful extension gives <span className="highlight">{param[0] ?? '—'}%</span> DMG Bonus to all Resonators in the team for <span className="highlight">30s</span>. Effects of the same name cannot be stacked.
            </>
        )
    }
];

export default function WeaponBuffs({ activeStates, toggleState, setCharacterRuntimeStates, charId }) {
    const updateState = (key, value) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    [key]: value
                }
            }
        }));
    };
    return (
        <div className="echo-buffs">
            {weaponBuffs.map(({ key, name, icon, effect, param }) => {
                const rank = activeStates?.[`${key}_rank`] ?? 0;
                const paramValues = getCurrentParamValues(param, rank);

                return (
                    <div className="echo-buff" key={key}>
                        <div className="echo-buff-header">
                            <img src={icon} alt={name} className="echo-buff-icon" loading="lazy" />
                            <div className="echo-buff-name">{name}</div>
                        </div>
                        <div className="echo-buff-effect">{effect(paramValues)}</div>
                        <DropdownSelect
                            label="Rank"
                            options={[0, 1, 2, 3, 4, 5]}
                            value={rank}
                            onChange={(newValue) => updateState(`${key}_rank`, newValue)}
                            width="80px"
                        />
                    </div>
                );
            })}
        </div>
    );
}