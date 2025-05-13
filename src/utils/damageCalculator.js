export function calculateDamage({ atk, hp, def, energyRegen }, multiplier, scaling) {
    const baseStat = (
        (atk * (scaling.atk ?? 0)) +
        (hp * (scaling.hp ?? 0)) +
        (def * (scaling.def ?? 0)) +
        (energyRegen * (scaling.energyRegen ?? 0))
    );

    const normal = Math.floor(baseStat * multiplier);
    const crit = Math.floor(normal * 2);
    const avg = Math.floor(normal * 1.25);

    return { normal, crit, avg };
}