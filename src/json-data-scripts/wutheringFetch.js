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
            attribute: char.Element ?? 0,  // pass Element number for mapping
            raw: char                      // full object for skill modal
        }));

        //console.log('successfully loaded characters-mapped.json:');
        return characters;
    } catch (error) {
        console.error('❌ Error loading characters-mapped.json:', error);
        return [];
    }
}