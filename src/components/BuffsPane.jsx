// src/components/BuffsPane.jsx
import React, { useEffect, useRef, useState } from 'react';
import CharacterMenu from './CharacterMenu';
import ExpandableSection from "./Expandable.jsx";
import EchoBuffs, {echoBuffList} from "./EchoBuffs.jsx";
import WeaponBuffs, {weaponBuffList} from "./WeaponBuffs.jsx";
import {loadCharacterBuffUI} from "../data/character-ui/index.js";
import { attributeColors } from '../utils/attributeHelpers';
import { X } from 'lucide-react';
import {preloadImages} from "../pages/calculator.jsx";
import {runInContext as echoBuffs, runInContext as weaponBuffs} from "lodash";

export default function BuffsPane({
                                      characters,
                                      activeCharacterId,
                                      setActiveCharacterId,
                                      team,
                                      setTeam,
    characterRuntimeStates,
    setCharacterRuntimeStates,
    activeCharacter
                                  }) {
    loadBase();
    const menuRef = useRef(null);
    const [characterMenuOpen, setCharacterMenuOpen] = useState(false);
    const [activeCharacterSlot, setActiveCharacterSlot] = useState(null);
    const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
    const activeStates = characterRuntimeStates?.[charId]?.activeStates ?? {};
    const toggleState = (stateKey) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    [stateKey]: !(prev[charId]?.activeStates?.[stateKey] ?? false)
                }
            }
        }));
    };


    const handleCharacterSelect = (char) => {
        if (activeCharacterSlot === 0) return; // Prevent overwriting main character

        const newTeam = [...team];
        newTeam[activeCharacterSlot] = char.link;
        setTeam(newTeam);

        // ✅ Save per-main-character team
        const mainCharId = team[0];
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [mainCharId]: {
                ...(prev[mainCharId] ?? {}),
                Team: newTeam
            }
        }));

        setCharacterMenuOpen(false);
    };

    const getCharacterIcon = (charId) => {
        const character = characters.find(c => String(c.link) === String(charId));
        return character?.icon ?? null;
    };

    const getCharacterName = (charId) => {
        const character = characters.find(c => String(c.link) === String(charId));
        return character?.displayName ?? '';
    };

    const [characterBuffUIs, setCharacterBuffUIs] = useState({});

    useEffect(() => {
        const loadAllBuffUIs = async () => {
            const results = {};
            const teammateIds = team.slice(1).filter(Boolean);

            for (const id of teammateIds) {
                try {
                    const mod = await loadCharacterBuffUI(id);
                    if (mod) {
                        results[id] = mod;
                    }
                } catch (err) {
                    console.warn(`No buffUI for character ${id}`, err);
                }
            }

            setCharacterBuffUIs(results);
        };

        loadAllBuffUIs();
    }, [team]);

    return (
        <div className="team-pane">
            <h3 className="panel-title menu-header">Team Setup</h3>
            <div className="icon-body">
                {team.map((charId, index) => {
                    const isActive = charId === activeCharacterId;
                    const isDisabled = index === 0;
                    const character = characters.find(c => String(c.link) === String(charId));
                    const isEmpty = !character;

                    return (
                        <div key={index} className="team-slot-wrapper">
                            <div
                                className={`team-slot ${isActive ? 'active' : ''} ${isDisabled ? 'locked' : ''}`}
                                onClick={() => {
                                    if (isDisabled && !isEmpty) return;
                                    setActiveCharacterSlot(index);
                                    setCharacterMenuOpen(true);
                                }}
                                style={isDisabled && !isEmpty ? { cursor: 'default' } : {}}
                            >
                                {character?.icon ? (
                                    <img
                                        src={character.icon}
                                        alt={`Character ${index + 1}`}
                                        className="header-icon"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="team-icon empty-slot" />
                                )}

                                {/* ✅ "X" button for teammates only */}
                                {!isDisabled && character && (
                                    <button
                                        className="remove-teammate-button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent opening the menu
                                            const newTeam = [...team];
                                            newTeam[index] = null;
                                            setTeam(newTeam);

                                            // ✅ Save per-main-character team
                                            const mainCharId = team[0];
                                            setCharacterRuntimeStates(prev => ({
                                                ...prev,
                                                [mainCharId]: {
                                                    ...(prev[mainCharId] ?? {}),
                                                    Team: newTeam
                                                }
                                            }));
                                        }}
                                    >
                                        <X size={14} strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>
                            <div className="character-name">{character?.displayName ?? ''}</div>
                        </div>
                    );
                })}
            </div>

            <ExpandableSection title="Echo Buffs">
                <EchoBuffs activeStates={activeStates} toggleState={toggleState} />
            </ExpandableSection>

            <ExpandableSection title="Weapon Buffs">
                <WeaponBuffs
                    activeStates={activeStates}
                    toggleState={toggleState}
                    charId={charId}
                    setCharacterRuntimeStates={setCharacterRuntimeStates}
                />
            </ExpandableSection>

            {team.slice(1).map((id, idx) => {
                if (!id || !characterBuffUIs[id]) return null;

                const TeammateBuffUI = characterBuffUIs[id];
                const states = characterRuntimeStates?.[id]?.activeStates ?? {};
                const toggle = (key) => {
                    setCharacterRuntimeStates(prev => ({
                        ...prev,
                        [id]: {
                            ...(prev[id] ?? {}),
                            activeStates: {
                                ...(prev[id]?.activeStates ?? {}),
                                [key]: !(prev[id]?.activeStates?.[key] ?? false)
                            }
                        }
                    }));
                };

                return (
                    <ExpandableSection key={id} title={`${getCharacterName(id)} Buffs`}>
                        <TeammateBuffUI
                            activeStates={states}
                            toggleState={toggle}
                            charId={id}
                            setCharacterRuntimeStates={setCharacterRuntimeStates}
                            attributeColors={attributeColors}
                        />
                    </ExpandableSection>
                );
            })}

            {characterMenuOpen && (
                <CharacterMenu
                    characters={characters.filter(
                        (char) =>
                            !team.includes(char.link) ||
                            char.link === team[activeCharacterSlot]
                    )}
                    handleCharacterSelect={handleCharacterSelect}
                    menuRef={menuRef}
                    menuOpen={characterMenuOpen}
                    setMenuOpen={setCharacterMenuOpen}
                />
            )}
        </div>
    );
}

function loadBase() {
    useEffect(() => {
        const echoBuffIcons = echoBuffList.map(buff => buff.icon);
        const weaponBuffIcons = weaponBuffList.map(buff => buff.icon);
        preloadImages([...echoBuffIcons, ...weaponBuffIcons]);
    }, []);
}