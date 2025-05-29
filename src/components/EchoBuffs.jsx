// src/components/EchoBuffs.jsx
import React from 'react';
import { attributeColors } from '../utils/attributeHelpers';

const echoBuffs = [
    {
        key: 'rejuvenatingGlow',
        name: 'Rejuvenating Glow',
        effect: (
            <>
                Increases the ATK of all party members by <span className="highlight">15%</span> for <span className="highlight">30s</span> upon healing allies.
            </>
        )
    },
    {
        key: 'moonlitClouds',
        name: 'Moonlit Clouds',
        effect: (
            <>
                Upon using Outro Skill, increases the ATK of the next Resonator by <span className="highlight">22.5%</span> for <span className="highlight">15s</span>.
            </>
        )
    },
    {
        key: 'midnightVeil',
        name: 'Midnight Veil',
        effect: <>
                    When Outro Skill is triggered, deal additional <span className="highlight">480%</span> Havoc DMG to surrounding enemies, considered Outro Skill DMG, and grant the incoming Resonator <span className="highlight">15%</span> <span style={{ color: attributeColors['havoc'], fontWeight: 'bold' }}>Havoc DMG Bonus</span> for <span className="highlight">15s</span>.
                </>
    },
    {
        key: 'empyreanAnthem',
        name: 'Empyrean Anthem',
        effect: <>Upon a critical hit of Coordinated Attack, increase the active Resonator's ATK by <span className="highlight">20%</span> for <span className="highlight">4s</span>.</>
    },
    {
        key: 'gustsOfWelkin',
        name: 'Gusts of Welkin',
        effect: <>Inflicting Aero Erosion increases <span style={{ color: attributeColors['aero'], fontWeight: 'bold' }}>Aero DMG</span> for all Resonators in the team by <span className="highlight">15%</span>.</>
    },
    {
        key: 'clawprint',
        name: 'Flaming Clawprint',
        effect: <>Casting Resonance Liberation increases <span style={{ color: attributeColors['fusion'], fontWeight: 'bold' }}>Fusion DMG</span> of Resonators in the team by <span className="highlight">15s</span>.</>
    },
    {
        key: 'bellBorne',
        name: 'Bell-Borne Geochelone',
        effect: <>Grants <span className="highlight">50.00%</span> DMG Reduction and <span className="highlight">10.0%</span> DMG Boost to team. Disappears after 3 hits.</>
    },
    {
        key: 'impermanenceHeron',
        name: 'Impermanence Heron',
        effect: (
            <>
                If the current character uses their Outro Skill within the next <span className="highlight">15s</span>, the next character’s damage dealt will be boosted by <span className="highlight">12%</span>.
            </>
        )
    },
    {
        key: 'fallacy',
        name: 'Fallacy of No Return',
        effect: <>Increases ATK of all team characters by <span className="highlight">10%</span>, lasting <span className="highlight">20s</span>.</>
    }
];

export default function EchoBuffs({ activeStates, toggleState }) {
    return (
        <div className="echo-buffs">
            {echoBuffs.map(({ key, name, effect, element }) => (
                <div className="echo-buff" key={key}>
                    <div
                        className="echo-buff-name"
                        style={element ? { color: attributeColors[element] ?? '#ccc' } : {}}
                    >
                        {name}
                    </div>
                    <div className="echo-buff-effect">{effect}</div>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates?.[key] || false}
                            onChange={() => toggleState(key)}
                        />
                        Enable
                    </label>
                </div>
            ))}
        </div>
    );
}