import React, {useEffect} from 'react';
import { getSkillDamageCache } from '../utils/skillDamageCache';


function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 10000000) return (num / 1000000).toFixed(1) + 'M';
    return Math.round(num).toLocaleString();
}

export default function Rotations({ rotationEntries, characterRuntimeStates, charId }) {
    if (!rotationEntries || rotationEntries.length === 0) return null;

    const skillCache = characterRuntimeStates[charId]?.allSkillResults ?? getSkillDamageCache();
    const { total, supportTotals, breakdownMap } = calculateRotationTotals(skillCache, rotationEntries);

    return (
        <>
            <h3 className="damage-box-title">Rotation</h3>
            <div className="damage-grid">
                <div></div>
                <div>Normal</div>
                <div>CRIT</div>
                <div>AVG</div>

                <div>Total DMG</div>
                <div>{formatNumber(Math.round(total.normal))}</div>
                <div>{formatNumber(Math.round(total.crit))}</div>
                <div>{formatNumber(Math.round(total.avg))}</div>

                {Object.entries(breakdownMap).map(([type, dmg]) => {
                    const percent = total.avg > 0 ? (dmg.avg / total.avg) * 100 : 0;
                    return (
                        <React.Fragment key={type}>
                            <div style={{ color: '#999' }}>
                                ({percent.toFixed(1)}%) {type}
                            </div>
                            <div style={{ color: '#999' }}>{formatNumber(Math.round(dmg.normal))}</div>
                            <div style={{ color: '#999' }}>{formatNumber(Math.round(dmg.crit))}</div>
                            <div style={{ color: '#999' }}>{formatNumber(Math.round(dmg.avg))}</div>
                        </React.Fragment>
                    );
                })}

                {supportTotals.healing > 0 && (
                    <>
                        <div style={{ color: 'limegreen', fontWeight: 'bold' }}>Total Healing</div>
                        <div></div>
                        <div></div>
                        <div style={{ color: 'limegreen', fontWeight: 'bold' }}>
                            {formatNumber(Math.round(supportTotals.healing))}
                        </div>
                    </>
                )}

                {supportTotals.shielding > 0 && (
                    <>
                        <div style={{ color: '#838383', fontWeight: 'bold' }}>Total Shield</div>
                        <div></div>
                        <div></div>
                        <div style={{ color: '#838383', fontWeight: 'bold' }}>
                            {Math.round(supportTotals.shielding).toLocaleString()}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export function TeamRotation({ mainCharId, characterRuntimeStates, characterStates, setCharacterRuntimeStates }) {
    if (!mainCharId || !characterRuntimeStates?.[mainCharId]) return null;

    const runtime = characterRuntimeStates[mainCharId];
    const team = runtime.Team ?? [];
    if (team.length < 1) return null;

    const teamTotal = { normal: 0, crit: 0, avg: 0 };
    const characterContributions = [];

    const mainState = characterRuntimeStates[mainCharId];

    if (Array.isArray(mainState?.rotationEntries) && Array.isArray(mainState?.allSkillResults)) {
        const result = calculateRotationTotals(mainState.allSkillResults, mainState.rotationEntries);
        const { normal, crit, avg } = result.total ?? {};

        const isZero = [normal, crit, avg].every(val => Math.round(val) === 0);

        if (!isZero) {
            characterContributions.push({ id: mainCharId, total: result.total });
            teamTotal.normal += normal;
            teamTotal.crit += crit;
            teamTotal.avg += avg;
        }
    }

    const teamRotation = mainState?.teamRotation ?? {};
    team.slice(1, 3).forEach((teammateId, i) => {
        const toggleKey = `teammateRotation-${i + 1}`;
        const isEnabled = characterRuntimeStates?.[mainCharId]?.activeStates?.[toggleKey];
        if (!isEnabled) return;

        const selected = teamRotation[teammateId];
        if (!selected?.total) return;

        const { normal, crit, avg } = selected.total;
        const isZero = [normal, crit, avg].every(val => Math.round(val) === 0);
        if (isZero) return;

        characterContributions.push({ id: teammateId, total: selected.total });
        teamTotal.normal += normal;
        teamTotal.crit += crit;
        teamTotal.avg += avg;
    });

    if (teamTotal.avg === 0) return null;

    useEffect(() => {
        if (!mainCharId || teamTotal.avg === 0) return;

        setCharacterRuntimeStates(prev => {
            const prevTotal = prev[mainCharId]?.teamRotationSummary?.total ?? {};
            const isSame =
                Math.round(prevTotal.avg) === Math.round(teamTotal.avg) &&
                Math.round(prevTotal.crit) === Math.round(teamTotal.crit) &&
                Math.round(prevTotal.normal) === Math.round(teamTotal.normal);

            if (isSame) return prev;

            return {
                ...prev,
                [mainCharId]: {
                    ...(prev[mainCharId] ?? {}),
                    teamRotationSummary: {
                        name: runtime.Name ?? '',
                        total: teamTotal
                    }
                }
            };
        });
    }, [characterRuntimeStates]);

    return (
        <>
            <h3 className="damage-box-title">Team Rotation</h3>
            <div className="damage-grid">
                <div></div>
                <div>Normal</div>
                <div>CRIT</div>
                <div>AVG</div>

                <div>Total Team DMG</div>
                <div>{formatNumber(Math.round(teamTotal.normal))}</div>
                <div>{formatNumber(Math.round(teamTotal.crit))}</div>
                <div>{formatNumber(Math.round(teamTotal.avg))}</div>

                {characterContributions.map(({ id, total }) => {
                    const char = characterStates.find(c => String(c.Id) === String(id));
                    const percent = total.avg / teamTotal.avg * 100;

                    return (
                        <React.Fragment key={id}>
                            <div style={{ color: '#999' }}>
                                ({percent.toFixed(1)}%) {char?.Name ?? 'Unknown'}
                            </div>
                            <div style={{ color: '#999' }}>{formatNumber(Math.round(total.normal))}</div>
                            <div style={{ color: '#999' }}>{formatNumber(Math.round(total.crit))}</div>
                            <div style={{ color: '#999' }}>{formatNumber(Math.round(total.avg))}</div>
                        </React.Fragment>
                    );
                })}
            </div>
        </>
    );
}

function getSkillType(entry) {
    const detail = entry.detail?.toLowerCase?.() ?? '';

    if (detail.includes('basic')) return 'Basic Attack';
    if (detail.includes('heavy')) return 'Heavy Attack';
    if (detail === 'resonance skill') return 'Resonance Skill';
    if (detail.includes('liberation')) return 'Resonance Liberation';
    if (detail.includes('intro')) return 'Intro Skill';
    if (detail.includes('outro')) return 'Outro Skill';
    if (detail.includes('frazzle')) return 'Spectro Frazzle';
    if (detail.includes('erosion')) return 'Aero Erosion';
    if (detail.includes('echo')) return 'Echo Skill';
    return 'Other';
}

export function calculateRotationTotals(skillCache, rotationEntries) {
    const total = { normal: 0, crit: 0, avg: 0 };
    const supportTotals = { healing: 0, shielding: 0 };
    const breakdownMap = {};

    for (const entry of rotationEntries) {
        const multiplier = entry.multiplier ?? 1;

        const source = entry.locked ? entry.snapshot : skillCache?.find(
            s => s.name === entry.label && s.tab === entry.tab
        );

        if (!source || source.visible === false) continue;

        const isSupport = source.isSupportSkill;
        const avg = (source.avg ?? 0) * multiplier;
        const normal = (source.normal ?? 0) * multiplier;
        const crit = (source.crit ?? 0) * multiplier;

        if (isSupport) {
            if (source.supportColor === 'limegreen') {
                supportTotals.healing += avg;
            } else {
                supportTotals.shielding += avg;
            }
            continue;
        }

        total.normal += normal;
        total.crit += crit;
        total.avg += avg;

        const type = getSkillType(entry);
        if (!breakdownMap[type]) {
            breakdownMap[type] = { normal: 0, crit: 0, avg: 0 };
        }

        breakdownMap[type].normal += normal;
        breakdownMap[type].crit += crit;
        breakdownMap[type].avg += avg;
    }

    return { total, supportTotals, breakdownMap };
}