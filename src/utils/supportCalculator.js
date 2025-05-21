export function calculateSupportEffect({
                                           finalStats,
                                           scaling,
                                           multiplier,
                                           type = 'healing',
                                           flat
                                       }) {
    // 1️⃣ Base stats
    const atk = finalStats.atk ?? 0;
    const hp = finalStats.hp ?? 0;
    const def = finalStats.def ?? 0;
    const energyRegen = finalStats.energyRegen ?? 0;

    // 2️⃣ Base effect value from scaling
    const baseEffect =
        (atk * (scaling.atk ?? 0)) +
        (hp * (scaling.hp ?? 0)) +
        (def * (scaling.def ?? 0)) +
        (energyRegen * (scaling.energyRegen ?? 0));

    // 3️⃣ Apply healing or shielding bonus
    const bonusKey = type === 'healing' ? 'healingBonus' : 'shieldingBonus';
    const bonusPercent = finalStats[bonusKey] ?? 0;

    return Math.floor(((baseEffect * multiplier) + flat) * (1 + bonusPercent / 100));
}