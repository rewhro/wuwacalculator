// src/utils/wutheringFetch.js
export async function fetchCharacters() {
    try {
        // ✅ Import local characters-mapped.json (via Vite)
        const data = await import('../data/characters-mapped.json');

        // ✅ Validate
        if (!Array.isArray(data.default)) {
            throw new Error("Loaded characters-mapped.json is not an array.");
        }

        // ✅ Map into App.jsx format
        const characters = data.default.map(char => ({
            displayName: char.Name ?? 'Unknown',
            icon: char.Icon ?? 'https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead256_1_UI.webp',
            link: char.Id?.toString() ?? '',
            attribute: char.Element ?? 0,
            weaponType: char.Weapon ?? 0,
            raw: char
        }));

        //console.log('successfully loaded characters-mapped.json:');
        return characters;
    } catch (error) {
        console.error('❌ Error loading characters-mapped.json:', error);
        return [];
    }
}

// src/utils/hakushinFetch.js
export async function fetchWeapons() {
    try {
        // ✅ Import local weapons.json (preloaded)
        const data = await import('../data/weapons.json');

        // ✅ Validate and return
        if (!data.default || typeof data.default !== 'object') {
            throw new Error("Loaded weapons.json is not an object.");
        }

        // Optional: You can map it into a normalized array if needed
        const weapons = Object.entries(data.default).map(([id, w]) => ({
            id,
            name: w.en ?? 'Unknown',
            icon: w.icon ?? 'https://via.placeholder.com/48?text=X',
            type: w.type ?? 0,
            rank: w.rank ?? 1,
            desc: w.desc ?? '',
            baseAtk: w.baseAtk ?? 0,
            raw: w
        }));

        return weapons;
    } catch (error) {
        console.error('❌ Error loading weapons.json:', error);
        return [];
    }
}