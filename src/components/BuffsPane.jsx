// src/components/BuffsPane.jsx
import React, { useEffect, useRef, useState } from 'react';
import CharacterMenu from './CharacterMenu';
import ExpandableSection from "./Expandable.jsx";
import EchoBuffs from "./EchoBuffs.jsx";

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
                                    />
                                ) : (
                                    <div className="team-icon empty-slot" />
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


            {characterMenuOpen && (
                <CharacterMenu
                    characters={characters.filter(
                        (char) =>
                            !team.includes(char.link) ||
                            char.link === team[activeCharacterSlot] // allow re-selecting current
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