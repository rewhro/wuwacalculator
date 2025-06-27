import React, {useEffect, useRef, useState} from 'react';
import EchoMenu from './EchoMenu.jsx';
import EditSubstatsModal from './EchoEditModal.jsx';
import echoSets, {setIconMap, skillKeywords, statKeywords} from "../constants/echoSetData.jsx";
import { getEchoSetUIOverrides } from "../data/set-ui/index.js";
import { echoes } from '../json-data-scripts/getEchoes.js';
import {attributeColors} from "../utils/attributeHelpers.js";
import {Backpack, X, Save} from "lucide-react";
import {mainEchoBuffs} from "../data/buffs/setEffect.js";
import DropdownSelect from "./DropdownSelect.jsx";
import EchoBagMenu from "./EchoBagMenu.jsx";
import {
    getEchoBag,
    subscribeEchoBag,
    addEchoToBag,
    removeEchoFromBag,
    updateEchoInBag
} from '../state/echoBagStore';
import ExpandableSection from "./Expandable";
import EchoParser from "./EchoParser.jsx";
import {applyParsedEchoesToEquipped} from "../utils/buildEchoObjectsFromParsedResults.js";
import {
    applyFixedSecondMainStat, formatDescription, formatStatKey,
    getEchoStatsFromEquippedEchoes,
    getSetCounts,
    getValidMainStats, statDisplayOrder, statIconMap
} from "../utils/echoHelper.js";
import {preloadImages} from "../pages/calculator.jsx";

export default function EchoesPane({
                                       charId,
                                        setCharacterRuntimeStates,
                                        characterRuntimeStates,
                                   }) {
    const echoSlots = [0, 1, 2, 3, 4];
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState(null);
    const [substatModalSlot, setSubstatModalSlot] = useState(null);
    const menuRef = useRef(null);
    const echoData = characterRuntimeStates?.[charId]?.equippedEchoes ?? [null, null, null, null, null];
    const [popupMessage, setPopupMessage] = useState('');
    const [showEffect, setShowEffect] = useState(false);
    const showPopup = (message, duration = 3000) => {
        setPopupMessage(message);
        setTimeout(() => setPopupMessage(''), duration);
    };
    const [bagOpen, setBagOpen] = useState(false);
    const [editingEcho, setEditingEcho] = useState(null);

    const handleRemoveEcho = (slotIndex) => {
        const currentEchoes = characterRuntimeStates?.[charId]?.equippedEchoes ?? [null, null, null, null, null];
        const updated = [...currentEchoes];
        updated[slotIndex] = null;

        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                equippedEchoes: updated
            }
        }));
    };
    const [selectedSet, setSelectedSet] = useState(null);
    const [selectedCost, setSelectedCost] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [echoBag, setEchoBag] = useState(getEchoBag());

    useEffect(() => {
        const unsubscribe = subscribeEchoBag(setEchoBag);
        return unsubscribe;
    }, []);

    const handleEchoIconClick = (slotIndex) => {
        setActiveSlot(slotIndex);
        setMenuOpen(true);
    };

    const handleSubstatSave = (updatedEcho) => {
        setCharacterRuntimeStates(prev => {
            const prevEchoes = prev?.[charId]?.equippedEchoes ?? [null, null, null, null, null];

            const newEchoes = prevEchoes.map((echo, i) =>
                i === substatModalSlot ? updatedEcho : echo
            );

            return {
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    equippedEchoes: newEchoes
                }
            };
        });

        setSubstatModalSlot(null);
    };

    const activeStates = characterRuntimeStates?.[charId]?.activeStates ?? {};
    const toggleState = (key) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    [key]: !(prev[charId]?.activeStates?.[key] ?? false)
                }
            }
        }));
    };

    const handleEchoSelect = (selectedEcho) => {
        const currentEchoes = characterRuntimeStates?.[charId]?.equippedEchoes ?? [null, null, null, null, null];

        // 1. Validate cost
        const totalCost = currentEchoes.reduce((sum, echo, index) => {
            if (index === activeSlot || !echo) return sum;
            return sum + (echo.cost ?? 0);
        }, 0);

        const newCost = selectedEcho.cost ?? 0;
        if (totalCost + newCost > 12) {
            const badEchoCost = totalCost + newCost;
            showPopup("Cost (" + badEchoCost + ") > 12");
            return;
        }

        // 2. Inherit stats from old echo
        const oldEcho = currentEchoes[activeSlot];
        const oldCost = oldEcho?.cost;

        // mainStats: only inherit if cost matches
        let mainStats;
        if (oldCost === newCost && oldEcho?.mainStats) {
            mainStats = { ...oldEcho.mainStats };
        } else {
            const validMainStatKeys = Object.keys(getValidMainStats(newCost));
            const firstValid = validMainStatKeys[0];
            mainStats = applyFixedSecondMainStat({
                [firstValid]: getValidMainStats(newCost)?.[firstValid]
            }, newCost);
        }

        // subStats: always inherit
        const subStats = { ...(oldEcho?.subStats ?? {}) };

        // selectedSet: only keep it if it's in the new echo's set list
        const validSets = selectedEcho.sets ?? [];
        const inheritedSet = oldEcho?.selectedSet;
        const selectedSet = validSets.includes(inheritedSet) ? inheritedSet : validSets[0] ?? null;

        // 3. Construct new echo
        const newEcho = {
            ...selectedEcho,
            mainStats,
            subStats,
            selectedSet,
            originalSets: validSets,
            uid: crypto.randomUUID?.() ?? Date.now().toString(),
        };

        // 4. Equip it
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                equippedEchoes: currentEchoes.map((e, i) =>
                    i === activeSlot ? newEcho : e
                )
            }
        }));

        setMenuOpen(false);
    };

    useEffect(() => {
        const echoIconPaths = echoes.map(e => e.icon).filter(Boolean);
        const setIconPaths = Object.values(setIconMap).filter(Boolean);
        preloadImages([...echoIconPaths, ...setIconPaths]);
    }, []);

    const setCounts = getSetCounts(echoData);
    const hasSetEffects = Object.entries(setCounts).some(([setId, count]) => {
        const numericId = Number(setId);
        return (numericId === 19 && count >= 3) || (numericId !== 19 && count >= 2);
    });
    const echoStatTotals = getEchoStatsFromEquippedEchoes(echoData);

    const critRate = echoStatTotals.critRate ?? 0;
    const critDmg = echoStatTotals.critDmg ?? 0;
    const critValue = critRate * 2 + critDmg;
    const extendedTotals = {
        ...echoStatTotals,
        critValue
    };

    return (
        <div className="echoes-pane">
            <EchoParser
                charId={charId}
                setCharacterRuntimeStates={setCharacterRuntimeStates}
                onEchoesParsed={(parsedList) => {
                    applyParsedEchoesToEquipped(parsedList, charId, setCharacterRuntimeStates);
                }}
            />
            <div className="echoes-header">
                <button
                    className="open-bag-button"
                    onClick={() => setBagOpen(true)}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <Backpack size={26} />
                </button>
            </div>
            {echoSlots.map((slotIndex) => {
                const echo = echoData[slotIndex];
                const isMain = slotIndex === 0;
                return (
                    <React.Fragment key={slotIndex}>
                        <div key={slotIndex} className="inherent-skills-box echo">
                            <div className="echo-slot-content">
                                <div className="echo-slot-left">
                                    <div className="echo-slot-icon-wrapper">
                                        {echo ? (
                                            <>
                                                <img
                                                    src={echo.icon}
                                                    alt={echo.name}
                                                    className="header-icon"
                                                    loading="lazy"
                                                    onClick={() => handleEchoIconClick(slotIndex)}
                                                    onLoad={(e) => {
                                                        if (e.currentTarget.classList.contains('fallback-icon')) {
                                                            e.currentTarget.classList.remove('fallback-icon');
                                                        }
                                                    }}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = '/assets/echoes/default.webp';
                                                        e.currentTarget.classList.add('fallback-icon');
                                                    }}
                                                />
                                                <button
                                                    className="remove-teammate-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveEcho(slotIndex);
                                                    }}
                                                    title="Remove Echo"
                                                >
                                                    <X size={14} strokeWidth={2.5} />
                                                </button>
                                            </>
                                        ) : (
                                            <div
                                                className="echo-slot-icon empty-slot"
                                                 onClick={() => handleEchoIconClick(slotIndex)}
                                            />
                                        )}
                                    </div>
                                    <div className="echo-slot-details">
                                        {echo ? (
                                            <>
                                                <div className="echo-slot-title">{echo.name}</div>
                                                <div className="echo-slot-cost-group">
                                                    <div className="echo-slot-cost-badge">Cost {echo.cost}</div>
                                                    {echo.selectedSet && (
                                                        <img
                                                            src={setIconMap[echo.selectedSet]}
                                                            alt={`Set ${echo.selectedSet}`}
                                                            className="echo-set-icon"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    {echo && (
                                                        <button
                                                            className="save-to-bag-button inline"
                                                            onClick={() => {
                                                                const freshEcho = characterRuntimeStates?.[charId]?.equippedEchoes?.[slotIndex];
                                                                if (freshEcho) {
                                                                    addEchoToBag(freshEcho);
                                                                }
                                                            }}
                                                            title="Save Echo to Bag"
                                                        >
                                                            <Save />
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="echo-slot-title">
                                                    {isMain ? 'Main Echo Slot' : `Echo Slot ${slotIndex + 1}`}
                                                </div>
                                                <div className="echo-slot-desc">No Echo equipped</div>
                                            </>
                                        )}
                                        {isMain && echo?.rawDesc && echo?.rawParams?.[4] && (
                                            <button
                                                className="toggle-effect-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowEffect(prev => !prev);
                                                }}
                                            >
                                                {showEffect ? "Hide Effect" : "Show Effect"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="echo-details" onClick={() => echo && setSubstatModalSlot(slotIndex)}>
                                    {echo ? (
                                        <div className="echo-card">
                                            <div className="echo-card-section main">
                                                {Object.entries(echo.mainStats ?? {}).map(([key, val]) => {
                                                    const label = formatStatKey(key);
                                                    const iconUrl = statIconMap[label];

                                                    return (
                                                        <div key={key} className="stat-row">
                                                        <span className="echo-stat-label">
                                                            {iconUrl && (
                                                                <div
                                                                    className="stat-icon"
                                                                    style={{
                                                                        width: 18,
                                                                        height: 18,
                                                                        backgroundColor: '#999',
                                                                        WebkitMaskImage: `url(${iconUrl})`,
                                                                        maskImage: `url(${iconUrl})`,
                                                                        WebkitMaskRepeat: 'no-repeat',
                                                                        maskRepeat: 'no-repeat',
                                                                        WebkitMaskSize: 'contain',
                                                                        maskSize: 'contain',
                                                                        display: 'inline-block',
                                                                        marginRight: '0.25rem',
                                                                        verticalAlign: 'middle',
                                                                        paddingRight: '0.25rem',
                                                                    }}
                                                                />
                                                            )}
                                                            {label}
                                                        </span>
                                                            <span className="echo-stat-value">
                                                            {key.endsWith('Flat') ? val : `${val.toFixed(1)}%`}
                                                        </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="echo-card-section">
                                                {Object.entries(echo.subStats ?? {}).map(([key, val]) => {
                                                    const label = formatStatKey(key);
                                                    const iconUrl = statIconMap[label];

                                                    return (
                                                        <div key={key} className="stat-row">
                                                        <span className="echo-stat-label">
                                                            {iconUrl && (
                                                                <div
                                                                    className="stat-icon"
                                                                    style={{
                                                                        width: 18,
                                                                        height: 18,
                                                                        backgroundColor: '#999',
                                                                        WebkitMaskImage: `url(${iconUrl})`,
                                                                        maskImage: `url(${iconUrl})`,
                                                                        WebkitMaskRepeat: 'no-repeat',
                                                                        maskRepeat: 'no-repeat',
                                                                        WebkitMaskSize: 'contain',
                                                                        maskSize: 'contain',
                                                                        display: 'inline-block',
                                                                        marginRight: '0.25rem',
                                                                        verticalAlign: 'middle',
                                                                        paddingRight: '0.25rem',
                                                                    }}
                                                                />
                                                            )}
                                                            {label}
                                                        </span>
                                                            <span className="echo-stat-value">
                                                            {key.endsWith('Flat') ? val : `${val.toFixed(1)}%`}
                                                        </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted"></span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isMain && echo?.rawDesc && echo?.rawParams?.[4] && (
                            <div
                                className={`main-echo-description-wrapper ${showEffect ? 'expanded' : 'collapsed'}`}
                            >
                                <div className="main-echo-description" >
                                    {highlightKeywordsInText(
                                        formatDescription(echo.rawDesc, echo.rawParams[4]),
                                        [echo.name]
                                    )}
                                    {isMain && echo?.id && mainEchoBuffs?.[echo.id] && (
                                        <div className="main-echo-toggle-controls">
                                            {/* Toggleable Buffs */}
                                            {mainEchoBuffs[echo.id].toggleable && (
                                                <label className="modern-checkbox echo">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!activeStates.mainEchoToggle}
                                                        onChange={() => toggleState('mainEchoToggle')}
                                                    />
                                                    {mainEchoBuffs[echo.id].toggleable.label ?? 'Enable'}
                                                </label>
                                            )}

                                            {isMain && echo?.id && mainEchoBuffs?.[echo.id]?.stackable && (() => {
                                                const stackKey = mainEchoBuffs[echo.id]?.stackable?.key ?? 'mainEchoStack';
                                                const currentStackValue = activeStates?.[stackKey] ?? 0;

                                                const handleChange = (newValue) => {
                                                    setCharacterRuntimeStates(prev => ({
                                                        ...prev,
                                                        [charId]: {
                                                            ...(prev[charId] ?? {}),
                                                            activeStates: {
                                                                ...(prev[charId]?.activeStates ?? {}),
                                                                [stackKey]: newValue
                                                            }
                                                        }
                                                    }));
                                                };

                                                return (
                                                    <DropdownSelect
                                                        label=""
                                                        options={Array.from(
                                                            { length: (mainEchoBuffs[echo.id].stackable?.max ?? 3) + 1 },
                                                            (_, i) => (i)
                                                        )}
                                                        value={currentStackValue}
                                                        onChange={handleChange}
                                                        width="80px"
                                                    />
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}

            {hasSetEffects && (
                <div className="inherent-skills-box set">
                    <div className="echo-buffs set">
                        {Object.entries(setCounts).map(([setId, count]) => {
                            const numericId = Number(setId);
                            const setInfo = echoSets.find(set => set.id === numericId);
                            if (!setInfo || count < 2) return null;

                            const {
                                twoPiece: TwoPieceUI,
                                threePiece: ThreePieceUI,
                                fivePiece: FivePieceUI
                            } = getEchoSetUIOverrides(numericId);

                            return (
                                <div key={setId} className="echo-set-content">
                                    {count >= 2 && setInfo.twoPiece && (
                                        TwoPieceUI ? (
                                            <TwoPieceUI setInfo={setInfo} />
                                        ) : (
                                            <div className="echo-buff">
                                                <div className="echo-buff-header">
                                                    <img className="echo-buff-icon" src={setIconMap[setInfo.id]} alt={setInfo.name} loading="lazy" />
                                                    <div className="echo-buff-name">{setInfo.name} (2-piece)</div>
                                                </div>
                                                <div className="echo-buff-effect">
                                                    {highlightKeywordsInText(setInfo.twoPiece)}
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {count >= 3 && setInfo.threePiece && (
                                        ThreePieceUI ? (
                                            <ThreePieceUI
                                                setInfo={setInfo}
                                                activeStates={activeStates}
                                                toggleState={toggleState}
                                                charId={charId}
                                                setCharacterRuntimeStates={setCharacterRuntimeStates}
                                            />
                                        ) : (
                                            <div className="echo-buff">
                                                <div className="echo-buff-header">
                                                    <img className="echo-buff-icon" src={setIconMap[setInfo.id]} alt={setInfo.name} loading="lazy" />
                                                    <div className="echo-buff-name">{setInfo.name} (3-piece)</div>
                                                </div>
                                                <div className="echo-buff-effect">
                                                    {highlightKeywordsInText(setInfo.threePiece)}
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {count >= 5 && setInfo.fivePiece && (
                                        FivePieceUI ? (
                                            <FivePieceUI
                                                setInfo={setInfo}
                                                activeStates={activeStates}
                                                toggleState={toggleState}
                                                charId={charId}
                                                setCharacterRuntimeStates={setCharacterRuntimeStates}
                                            />
                                        ) : (
                                            <div className="echo-buff">
                                                <div className="echo-buff-header">
                                                    <img className="echo-buff-icon" src={setIconMap[setInfo.id]} alt={setInfo.name} loading="lazy" />
                                                    <div className="echo-buff-name">{setInfo.name} (5-piece)</div>
                                                </div>
                                                <div className="echo-buff-effect">
                                                    {highlightKeywordsInText(setInfo.fivePiece)}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <ExpandableSection title="Totals">
                {Object.keys(extendedTotals).length > 0 && (
                    <div className="stats-grid">
                        {Object.entries(extendedTotals)
                            .sort(([a], [b]) => {
                                const indexA = statDisplayOrder.indexOf(a);
                                const indexB = statDisplayOrder.indexOf(b);
                                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                            })
                            .map(([key, val]) => {
                                const label = formatStatKey(key);
                                const iconUrl = statIconMap[label];

                                return (
                                    <div key={key} className="stat-row">
                                          <span className="echo-stat-label">
                                              {iconUrl && (
                                                  <div
                                                      className="stat-icon"
                                                      style={{
                                                          width: 18,
                                                          height: 18,
                                                          backgroundColor: '#999',
                                                          WebkitMaskImage: `url(${iconUrl})`,
                                                          maskImage: `url(${iconUrl})`,
                                                          WebkitMaskRepeat: 'no-repeat',
                                                          maskRepeat: 'no-repeat',
                                                          WebkitMaskSize: 'contain',
                                                          maskSize: 'contain',
                                                          display: 'inline-block',
                                                          marginRight: '0.25rem',
                                                          verticalAlign: 'middle',
                                                          paddingRight: '0.25rem',
                                                      }}
                                                  />
                                              )}
                                              {key === 'critValue' ? (
                                                  <span className="highlight">{label}</span>
                                              ) : (
                                                  `${label}`

                                              )}
                                          </span>
                                        <div className="stat-value"></div>
                                        <div className="stat-bonus"></div>
                                        <div className="stat-total">
                                            {key === 'critValue' ? (
                                                <span className="highlight">{val.toFixed(1)}</span>
                                            ) : key.endsWith('Flat') ? (
                                                val
                                            ) : (
                                                `${val.toFixed(1)}%`
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </ExpandableSection>

            <EchoMenu
                echoes={echoes}
                handleEchoSelect={handleEchoSelect}
                menuRef={menuRef}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
            />

            {substatModalSlot !== null && echoData[substatModalSlot] && (
                <EditSubstatsModal
                    isOpen={true}
                    echo={echoData[substatModalSlot]}
                    mainStats={getValidMainStats(echoData[substatModalSlot]?.cost ?? 1)}
                    substats={echoData[substatModalSlot]?.subStats ?? {}}
                    sets={echoData[substatModalSlot]?.originalSets ?? []}
                    selectedSet={echoData[substatModalSlot]?.selectedSet ?? null}
                    slotIndex={substatModalSlot}
                    onClose={() => setSubstatModalSlot(null)}
                    onSave={(updatedEcho) => handleSubstatSave(updatedEcho)}
                    getValidMainStats={getValidMainStats}
                    applyFixedSecondMainStat={applyFixedSecondMainStat}
                />
            )}
            {bagOpen && (
                <EchoBagMenu
                    editingEcho={editingEcho}
                    setEditingEcho={setEditingEcho}
                    selectedSet={selectedSet}
                    setSelectedSet={setSelectedSet}
                    selectedCost={selectedCost}
                    setSelectedCost={setSelectedCost}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onClose={() => {
                        setEditingEcho(null);
                        setBagOpen(false);
                    }}
                    onEquip={(echo, slotIndex) => {
                        const currentEchoes = characterRuntimeStates[charId]?.equippedEchoes ?? [];
                        const currentTotalCost = currentEchoes.reduce((sum, e, i) => {
                            return i === slotIndex ? sum : sum + (e?.cost ?? 0); // exclude the slot being replaced
                        }, 0);

                        const newTotalCost = currentTotalCost + (echo.cost ?? 0);

                        if (newTotalCost > 12) {
                            showPopup("Cost (" + newTotalCost + ") > 12");
                            return;
                        }

                        const prevEchoes = characterRuntimeStates[charId]?.equippedEchoes ?? [null, null, null, null, null];
                        const updatedEchoes = [...prevEchoes];
                        updatedEchoes[slotIndex] = echo;

                        setCharacterRuntimeStates(prev => ({
                            ...prev,
                            [charId]: {
                                ...(prev[charId] ?? {}),
                                equippedEchoes: updatedEchoes
                            }
                        }));

                        //setBagOpen(false);
                    }}
                />
            )}
            {popupMessage && (
                <div className="popup-message">
                    {popupMessage}
                </div>
            )}
        </div>
    );
}

export function highlightKeywordsInText(text, extraKeywords = []) {
    if (typeof text !== 'string') return text;

    const elementKeywords = Object.keys(attributeColors);
    const staticKeywords = [...skillKeywords, ...statKeywords, ...elementKeywords];
    const allKeywords = [...staticKeywords, ...extraKeywords];

    // Escape keywords for RegExp
    const escapedKeywords = allKeywords.map(k =>
        k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    );

    const percentPattern = '\\d+(\\.\\d+)?%';
    const keywordPattern = escapedKeywords.length > 0 ? `\\b(${escapedKeywords.join('|')})\\b` : '';
    const allPattern = [percentPattern, keywordPattern].filter(Boolean).join('|');
    const regex = new RegExp(allPattern, 'gi');

    return (
        <span dangerouslySetInnerHTML={{
            __html: text.replace(regex, (match) => {
                const lower = match.toLowerCase();

                if (/^\d+(\.\d+)?%$/.test(match)) {
                    return `<strong class="highlight">${match}</strong>`;
                }

                if (skillKeywords.includes(match)) {
                    return `<strong class="highlight">${match}</strong>`;
                }

                if (statKeywords.includes(match)) {
                    return `<strong class="highlight">${match}</strong>`;
                }

                if (elementKeywords.includes(lower)) {
                    const color = attributeColors[lower];
                    return `<strong style="color: ${color}; font-weight: bold;">${match}</strong>`;
                }

                if (extraKeywords.includes(match)) {
                    return `<strong class="highlight echo-name">${match}</strong>`;
                }

                return match;
            })
        }} />
    );
}