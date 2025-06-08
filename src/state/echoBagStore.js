// src/state/echoBagStore.js
import { isEqual } from 'lodash';

let echoBag = [];
const listeners = new Set();

// Load from localStorage initially
try {
    const stored = localStorage.getItem('echoBag');
    if (stored) echoBag = JSON.parse(stored);
} catch {}

function notify() {
    listeners.forEach(cb => cb([...echoBag]));
    try {
        localStorage.setItem('echoBag', JSON.stringify(echoBag));
    } catch (e) {
        console.warn('Failed to sync echoBag to localStorage', e);
    }
}

export function getEchoBag() {
    return [...echoBag];
}

export function setEchoBag(newBag) {
    echoBag = [...newBag];
    notify();
}

export function addEchoToBag(newEcho) {
    const exists = echoBag.some(e =>
        e.name === newEcho.name &&
        e.selectedSet === newEcho.selectedSet &&
        e.cost === newEcho.cost &&
        isEqual(e.mainStats, newEcho.mainStats) &&
        isEqual(e.subStats, newEcho.subStats)
    );

    if (!exists) {
        echoBag.push({
            ...newEcho,
            uid: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
        });
        notify();
    }
}

export function removeEchoFromBag(uid) {
    echoBag = echoBag.filter(e => e.uid !== uid);
    notify();
}

export function updateEchoInBag(updatedEcho) {
    echoBag = echoBag.filter(e => e.uid !== updatedEcho.oldUid);
    echoBag.push(updatedEcho);
    notify();
}

export function subscribeEchoBag(callback) {
    listeners.add(callback);
    callback([...echoBag]); // immediately call with current bag
    return () => listeners.delete(callback); // this is your unsubscribe function
}