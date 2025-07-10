import React, {useEffect, useState} from 'react';
import { highlightKeywordsInText, setIconMap } from '../constants/echoSetData';
import {imageCache} from '../pages/calculator.jsx';
import { formatStatKey } from '../utils/echoHelper.js';
import { statIconMap } from './CharacterStats';
import { attributeColors } from '../utils/attributeHelpers';
import {formatStatValue} from "./WeaponPane.jsx";
import {getActiveStateWeapons} from "../data/buffs/weaponBuffs.js";
import weaponsRaw from '../data/weapons.json';
import {getActiveEchoes} from "../data/buffs/applyEchoLogic.js";
import {calculateRotationTotals} from "./Rotations.jsx";

export default function OverviewDetailPane({
                                               character,
                                               runtime,
                                               splashArt,
                                               keywords,
                                               weapons,
                                               characters,
                                               switchLeftPane,
                                               setCharacterRuntimeStates,
                                               setSelectedId,
                                               handleCharacterSelect,
                                               handleReset,
                                               sortedCharacterIds,
                                               allRotations
                                           }) {
    if (!character || !runtime) return null;
    const weaponMap = {};
    (weaponsRaw ?? []).forEach(w => {
        weaponMap[w.id] = w;
    });
    const buffWeapons = getActiveStateWeapons(runtime.activeStates);
    const activeEchoes = getActiveEchoes(runtime.activeStates);
    let { displayName, level } = character;
    level = runtime.CharacterLevel ?? level;
    const echoes = runtime.equippedEchoes ?? [];
    const weapon = runtime.CombatState ?? {};
    const weaponId = weapon.weaponId;
    const weaponDetail = weapons?.[weaponId] ?? null;
    const activeWeaponIconPath = weaponId
        ? `/assets/weapon-icons/${weaponId}.webp`
        : '/assets/weapon-icons/default.webp';
    const getImageSrc = (icon) => imageCache[icon]?.src || icon;
    const finalStats = runtime?.FinalStats ?? runtime.Stats ?? {};
    const statGroups = [
        [
            { label: 'ATK', key: 'atk' },
            { label: 'HP', key: 'hp' },
            { label: 'DEF', key: 'def' }
        ],
        [
            { label: 'Energy Regen', key: 'energyRegen' },
            { label: 'Crit Rate', key: 'critRate' },
            { label: 'Crit DMG', key: 'critDmg' },
            { label: 'Healing Bonus', key: 'healingBonus' }
        ],
        [
            'aero', 'glacio', 'spectro', 'fusion', 'electro', 'havoc'
        ].map(el => ({
            label: `${el.charAt(0).toUpperCase() + el.slice(1)} DMG Bonus`,
            key: `${el}DmgBonus`,
            color: attributeColors[el] ?? '#fff'
        })),
        [
            { label: 'Basic Attack DMG Bonus', key: 'basicAtk' },
            { label: 'Heavy Attack DMG Bonus', key: 'heavyAtk' },
            { label: 'Resonance Skill DMG Bonus', key: 'skillAtk' },
            { label: 'Resonance Liberation DMG Bonus', key: 'ultimateAtk' }
        ]
    ];

    const [selectedRotationIndex, setSelectedRotationIndex] = useState(0);
    const [selectedTeamRotationIndex, setSelectedTeamRotationIndex] = useState(0);
    const rotationDmg = allRotations?.personalRotations?.[selectedRotationIndex]?.total;
    const teamRotationDmg = allRotations?.teamRotations?.[selectedTeamRotationIndex]?.total;

    const teamRotation = runtime?.teamRotation ?? {};
    const activeStates = runtime?.activeStates ?? {};

    function deleteCharacter() {
        const currentId = String(character.link);

        const remainingIds = sortedCharacterIds.filter(id => id !== currentId);

        if (remainingIds.length === 0 && currentId === '1506') {
            handleReset();
            return;
        }

        let nextId;
        const currentIndex = sortedCharacterIds.findIndex(id => id === currentId);

        const filtered = sortedCharacterIds.filter(id => id !== currentId);
        nextId = sortedCharacterIds[currentIndex + 1] ?? sortedCharacterIds[currentIndex - 1] ?? filtered[0];

        const nextCharacter = characters.find(c => String(c.link) === String(nextId));
        if (nextCharacter) {
            handleCharacterSelect(nextCharacter);
            setSelectedId(String(nextId));
        }

        setCharacterRuntimeStates(prev => {
            const updated = { ...prev };
            delete updated[currentId];
            return updated;
        });
    }

    function formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 10000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 100000) return (num / 1000).toFixed(1) + 'K';
        return Math.round(num).toLocaleString();
    }

    const [contributorCycleIndex, setContributorCycleIndex] = useState(0);
    const handleCycleClick = () => {
        const contributors = allRotations.teamRotations[selectedTeamRotationIndex]?.contributors ?? {};
        const numContributors = Object.keys(contributors).length;
        setContributorCycleIndex((prev) => (prev + 1) % (numContributors + 1));
    };

    const displayValue = (key, val) => ['atk', 'hp', 'def'].includes(key) ? Math.floor(val) : `${val.toFixed(1)}%`;

    return (
        <>
            <div className="overview-panel-container inherent-skills-box" style={{margin: 'unset'}}>
                <div className="character-portrait-section">
                    <div className="character-overview-details">
                        <span className="character-name highlight details" style={{ fontSize: '1.5rem', fontWeight:'bold', margin: 'unset' }}>{displayName}</span>
                        <span className="character-level">Lv.{level ?? 1}</span>
                    </div>
                    <div
                        className="character-portrait-content"
                        onClick={() => switchLeftPane('characters')}
                    >
                        <img
                            src={splashArt || '/assets/splash/default.webp'}
                            alt={displayName}
                            className="character-splash"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/assets/splash/default.webp';
                            }}
                        />
                    </div>
                    <div className="overview-dmg">
                        {runtime?.FinalStats &&(
                            <div className="stats-grid overview" style={{marginTop: '0.5rem'}}>
                                {statGroups.flat().map((stat, i) => {
                                    const val = finalStats[stat.key];
                                    return (
                                        <div key={stat.key ?? i} className="stat-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                                            <div
                                                className="stat-label"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    ...(stat.color ? { color: stat.color } : {})
                                                }}
                                            >
                                                {statIconMap[stat.label] && (
                                                    <div
                                                        className="stat-icon"
                                                        style={{
                                                            width: 18,
                                                            height: 18,
                                                            backgroundColor: stat.color ?? '#999',
                                                            WebkitMaskImage: `url(${statIconMap[stat.label]})`,
                                                            maskImage: `url(${statIconMap[stat.label]})`,
                                                            WebkitMaskRepeat: 'no-repeat',
                                                            maskRepeat: 'no-repeat',
                                                            WebkitMaskSize: 'contain',
                                                            maskSize: 'contain'
                                                        }}
                                                    />
                                                )}
                                                {stat.label}
                                            </div>
                                            <div className="stat-total">
                                                <span>{displayValue(stat.key, val)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="rotations-overview-boxes">
                            {allRotations?.personalRotations?.length > 0 && (
                                <div className="rotation-box inherent-skills-box">
                                    <select
                                        className="box-header entry-detail-dropdown"
                                        value={selectedRotationIndex}
                                        onChange={(e) => setSelectedRotationIndex(Number(e.target.value))}
                                    >
                                        {allRotations.personalRotations.map((entry, index) => (
                                            <option key={entry.id} value={index}>
                                                {entry.id === 'live'
                                                    ? "Rotation DMG"
                                                    : entry.name ??`Saved #${index}`}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="box-stat dashed-line">
                                        <strong className="label">Normal</strong>
                                        <div className="dash-separator" />
                                        <div
                                            className="damage-tooltip-wrapper"
                                            data-tooltip={rotationDmg?.normal.toLocaleString()}
                                        >
                                            <span className="value">{formatNumber(rotationDmg?.normal)}</span>
                                        </div>
                                    </div>
                                    <div className="box-stat dashed-line">
                                        <strong className="label">CRIT</strong>
                                        <div className="dash-separator" />
                                        <div
                                            className="damage-tooltip-wrapper"
                                            data-tooltip={rotationDmg?.crit.toLocaleString()}
                                        >
                                            <span className="value">{formatNumber(rotationDmg?.crit)}</span>
                                        </div>
                                    </div>
                                    <div className="box-stat dashed-line">
                                        <strong className="label">AVG</strong>
                                        <div className="dash-separator" />
                                        <div
                                            className="damage-tooltip-wrapper"
                                            data-tooltip={rotationDmg?.avg.toLocaleString()}
                                        >
                                            <span className="value avg">{formatNumber(rotationDmg?.avg)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {allRotations?.teamRotations?.length > 0 && (
                                <div
                                    className="rotation-box inherent-skills-box"
                                    onClick={handleCycleClick}
                                >
                                    <select
                                        className="box-header entry-detail-dropdown"
                                        style={{ width: '11.2rem' }}
                                        value={selectedTeamRotationIndex}
                                        onChange={(e) => {
                                            setSelectedTeamRotationIndex(Number(e.target.value));
                                            setContributorCycleIndex(0);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {allRotations.teamRotations.map((entry, index) => (
                                            <option key={entry.id} value={index}>
                                                {entry.id === 'live Team'
                                                    ? "Team Rotation DMG"
                                                    : entry.name ?? `Saved #${index}`}
                                            </option>
                                        ))}
                                    </select>

                                    {(() => {
                                        const selected = allRotations.teamRotations[selectedTeamRotationIndex];
                                        const contributors = selected?.contributors ?? {};
                                        const contributorIds = Object.keys(contributors);
                                        const contributorId = contributorIds[contributorCycleIndex - 1];
                                        const contributorCharacter = characters.find(c => String(c.link) === String(contributors[contributorId]?.id));

                                        const displayed = contributorCycleIndex === 0
                                            ? selected.total
                                            : contributors[contributorId]?.total;

                                        const contributor = contributors?.[contributorId];
                                        const teamAvg = teamRotationDmg?.avg ?? 0;
                                        const percent = teamAvg > 0 && contributor?.total?.avg
                                            ? ((contributor.total.avg / teamAvg) * 100).toFixed(1)
                                            : null;

                                        return (
                                            <>
                                                <div className="box-stat dashed-line">
                                                    <strong className="label">Normal</strong>
                                                    <div className="dash-separator" />
                                                    <div className="damage-tooltip-wrapper" data-tooltip={displayed?.normal?.toLocaleString()}>
                                                        <span className="value">{formatNumber(displayed?.normal)}</span>
                                                    </div>
                                                </div>
                                                <div className="box-stat dashed-line">
                                                    <strong className="label">CRIT</strong>
                                                    <div className="dash-separator" />
                                                    <div className="damage-tooltip-wrapper" data-tooltip={displayed?.crit?.toLocaleString()}>
                                                        <span className="value">{formatNumber(displayed?.crit)}</span>
                                                    </div>
                                                </div>
                                                <div className="box-stat dashed-line">
                                                    <strong className="label">AVG</strong>
                                                    <div className="dash-separator" />
                                                    <div className="damage-tooltip-wrapper" data-tooltip={displayed?.avg?.toLocaleString()}>
                                                        <span className="value avg">{formatNumber(displayed?.avg)}</span>
                                                    </div>
                                                </div>
                                                <div className="overview-weapon-details highlight">
                                                    {contributorCycleIndex === 0 ? 'Total' : `${contributorCharacter.displayName ?? ''}`}
                                                    {percent ? ' · ' : ''}
                                                    {percent ? `${percent}%` : ''}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overview-gear">
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(25rem, 1fr))' }}>
                        <div
                            className="inherent-skills-box weapon-container"
                            onClick={() => switchLeftPane('weapon')}
                        >
                            <div className="gear-content">
                                <img
                                    src={activeWeaponIconPath}
                                    alt="Weapon"
                                    loading="lazy"
                                    decoding="async"
                                    className="gear-icon overview-weapon"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/assets/weapon-icons/default.webp';
                                        e.currentTarget.classList.add('fallback-icon');
                                    }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="gear-title highlight" style={{ display: 'flex', alignSelf: 'flex-start' }}>
                                        {weaponDetail.Name || 'No Weapon'}
                                    </div>
                                    <span className="gear-desc">
                                        {highlightKeywordsInText(formatWeaponEffect(weapon), keywords)}
                                    </span>
                                </div>
                            </div>
                            {weapon.weaponStat && (
                                <div className="overview-weapon-details">
                                    <span>Lv.{weapon.weaponLevel ?? 1} - R{weapon.weaponRank ?? 1}</span> |
                                    <span>{formatStatValue(weapon.weaponStat)}</span>
                                    <span>ATK: {weapon.weaponBaseAtk}</span>
                                </div>
                            )}
                        </div>
                        <div
                            className="inherent-skills-box overview-teammates-box"
                            style={{ margin: 'unset', minHeight: '7rem', display: 'grid', gridTemplateColumns: '1fr minmax(10rem, 30%)' }}
                            onClick={() => switchLeftPane('teams')}
                        >
                            <div className="overview-teammates">
                                <span className="character-level">Teammates</span>
                                <div className="icon-body">
                                    {[1, 2].map(index => {
                                        const charId = runtime.Team?.[index];
                                        const character = characters.find(c => String(c.link) === String(charId));

                                        return (
                                            <div key={charId ?? index} className="team-slot-wrapper">
                                                {character?.icon ? (
                                                    <img
                                                        src={character.icon}
                                                        alt={`Character ${index + 1}`}
                                                        className="header-icon overview"
                                                        style={{
                                                            width: '7rem',
                                                            height: '7rem',
                                                            pointerEvents: 'none'
                                                        }}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="team-icon empty-slot overview" />
                                                )}
                                                <div className="character-name highlight">
                                                    {character?.displayName ?? ''}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="overview-buffs-container">
                                <div className="overview-buffs-container-item">
                                    <span className="character-level">Weapons</span>
                                    <div>
                                        {buffWeapons.length === 0 ? (
                                            <div className="overview-buff-placeholder">hmm...</div>
                                        ) : (
                                            buffWeapons.map(({ id, value }) => {
                                                const weaponData = weaponMap[id];
                                                if (!weaponData) return null;

                                                return (
                                                    <div key={id}>
                                                        <div className="echo-buff-header overview-buffs">
                                                            <img
                                                                src={`/assets/weapon-icons/${id}.webp`}
                                                                alt={weaponData.name}
                                                                className="echo-buff-icon overview-weapon mini"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.currentTarget.src = '/assets/weapon-icons/default.webp';
                                                                    e.currentTarget.classList.add('fallback-icon');
                                                                }}
                                                            />
                                                            <div className="character-name"
                                                                 style={{
                                                                     margin: 'unset',
                                                                     maxWidth: '65%',
                                                                     fontSize: '0.85rem',
                                                                     opacity: '0.7',
                                                                     fontWeight: 'bold'
                                                                 }}>
                                                                R{value} {weaponData.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div className="overview-buffs-container-item">
                                    <span className="character-level">Set Buffs</span>
                                    <div>
                                        {activeEchoes.length === 0 ? (
                                            <div className="overview-buff-placeholder">hmm...</div>
                                        ) : (
                                            activeEchoes.map(({ id, name, icon }) => (
                                                <div key={id}>
                                                    <div className="echo-buff-header overview-buffs">
                                                        <img
                                                            src={icon}
                                                            alt={name}
                                                            className="echo-buff-icon overview-weapon mini"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.currentTarget.src = '/assets/echoes/default.webp';
                                                                e.currentTarget.classList.add('fallback-icon');
                                                            }}
                                                        />
                                                        <div className="character-name"
                                                             style={{
                                                                 margin: 'unset',
                                                                 maxWidth: '65%',
                                                                 fontSize: '0.85rem',
                                                                 opacity: '0.7',
                                                                 fontWeight: 'bold'
                                                             }}>
                                                            {name}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="echo-grid">
                        {[...Array(5)].map((_, index) => {
                            const echo = echoes[index] ?? null;

                            return (
                                <div
                                    key={index}
                                    className="echo-tile overview inherent-skills-box"
                                    style={{ margin: 'unset' }}
                                    onClick={() => switchLeftPane('echoes')}
                                >
                                    {echo ? (
                                        <>
                                            <div className="gear-header">
                                                <div className="echo-set-cost-header">
                                                    {echo?.selectedSet && (
                                                        <img
                                                            src={setIconMap[echo.selectedSet]}
                                                            alt={`Set ${echo.selectedSet}`}
                                                            className="echo-set-icon overview"
                                                        />
                                                    )}
                                                    <div className="echo-slot-cost-badge bag overview">{echo.cost}</div>
                                                </div>
                                            </div>

                                            <img
                                                src={getImageSrc(echo.icon || '/assets/echoes/default.webp')}
                                                alt={echo.name || 'Echo'}
                                                className="gear-icon"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = '/assets/echoes/default.webp';
                                                }}
                                            />
                                            <div className="gear-title highlight">{echo.name || 'Echo'}</div>

                                            <div className="echo-stats-preview" style={{ cursor: 'unset' }}>
                                                <div className="echo-bag-info-main">
                                                    {Object.entries(echo.mainStats ?? {}).map(([key, val]) => (
                                                        <div key={key} className="stat-row">
                                                            <span className="echo-stat-label">{formatStatKey(key)}</span>
                                                            <span className="echo-stat-value">
                                                            {key.endsWith('Flat') ? val : `${val?.toFixed(1)}%`}
                                                        </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {Object.entries(echo.subStats ?? {}).map(([key, val]) => (
                                                    <div key={key} className="stat-row">
                                                        <span className="echo-stat-label">{formatStatKey(key)}</span>
                                                        <span className="echo-stat-value">
                                                        {key.endsWith('Flat') ? val : `${val?.toFixed(1)}%`}
                                                    </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="empty-echo-tile">Empty</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="delete-character-wrapper" style={{ padding: '2rem', textAlign: 'center' }}>
                <button
                    className="clear-button"
                    onClick={deleteCharacter}
                >
                    Delete Character
                </button>
            </div>
        </>
    );
}

function formatWeaponEffect(weapon) {
    const rank = weapon?.weaponRank - 1;
    const paramArrays = weapon?.weaponParam;
    let template = weapon?.weaponEffect ?? '';

    if (!Array.isArray(paramArrays) || typeof template !== 'string') return template;

    template = template
        .replace(/<size=\d+>|<\/size>/g, '')
        .replace(/<color=[^>]+>|<\/color>/g, '')
        .replace(/<a\s+href=.*?>/gi, '')
        .replace(/<\/a>/gi, '')
        .replace(/\n/g, '<br>');

    const param = []

    template = template.replace(/\{Cus:[^}]*S=([^ ]+)\s+P=([^ ]+)\s+SapTag=(\d+)[^}]*\}/g, (_, singular, plural, tagIndex) => {
        const value = parseFloat(param[parseInt(tagIndex, 10)]);
        return value === 1 ? singular : plural;
    });

    template = template.replace(/\{Cus:Ipt,[^}]*Touch=([^ ]+)\s+PC=([^ ]+)\s+Gamepad=([^ }]+)[^}]*\}/g, (_, touch, pc, gamepad) => {
        const inputs = new Set([touch, pc, gamepad]);
        return Array.from(inputs).join('/');
    });

    return template.replace(/\{(\d+)\}/g, (match, groupIndex) => {
        const paramGroup = paramArrays[+groupIndex];
        const value = Array.isArray(paramGroup) ? paramGroup[rank] : undefined;
        return value !== undefined ? value : match;
    });
}