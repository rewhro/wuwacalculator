export async function uploadToDrive(accessToken, fileContent) {
    const metadata = {
        name: `wuwacalculator-sync-${new Date().toISOString()}.json`,
        mimeType: 'application/json',
        parents: ['appDataFolder']
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
            method: 'POST',
            headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
            body: form
        }
    );

    const result = await uploadRes.json();
    //console.log("Backup uploaded:", result);

    await pruneOldBackups(accessToken);
}

async function pruneOldBackups(accessToken) {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='wuwacalculator-sync.json' and 'appDataFolder' in parents&spaces=appDataFolder&fields=files(id,createdTime)&orderBy=createdTime desc`,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );

    const data = await res.json();
    const files = data.files || [];

    if (files.length > 10) {
        const toDelete = files.slice(10);
        for (const file of toDelete) {
            await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            //console.log("Deleted old backup:", file.id);
        }
    }
}

async function getLatestBackupFile(accessToken) {
    const query = encodeURIComponent("name contains 'wuwacalculator-sync-' and 'appDataFolder' in parents");
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=appDataFolder&fields=files(id,createdTime)&orderBy=createdTime desc`,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );

    const data = await res.json();
    return data.files?.[0];
}

async function downloadFileById(fileId, accessToken) {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    if (!res.ok) {
        throw new Error("Failed to download file: " + res.statusText);
    }

    return await res.json();
}

export async function restoreFromDrive(accessToken) {
    try {
        const latest = await getLatestBackupFile(accessToken);
        if (!latest) {
            alert("No backup file found in Drive.");
            return;
        }

        const data = await downloadFileById(latest.id, accessToken);
        for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, value);
        }

        //alert("Restore complete! Reloading...");
        window.location.href = "/";
    } catch (err) {
        console.error("Restore failed", err);
        alert("Restore failed.");
    }
}

const syncKeys = [
    'activeCharacterId',
    'characterRuntimeStates',
    'echoBag',
    'enemyLevel',
    'enemyRes',
    'globalSavedRotations',
    'seenChangelogVersion',
    'showSubHits',
    'user-dark-variant',
    'user-has-selected-theme',
    'user-theme'
]

export function getSyncData() {
    const data = {};
    for (const key of syncKeys) {
        const value = localStorage.getItem(key);
        if (value !== null) data[key] = value;
    }
    return JSON.stringify(data);
}