import { usePersistentState } from './usePersistentState';

let globalBagKey = 'echoBag';

export function useGlobalEchoBag() {
    const [echoBag, setEchoBag] = usePersistentState(globalBagKey, []);

    const addEchoToBag = (newEcho) => {
        setEchoBag(prev => {
            const alreadyExists = prev.some(
                e => e.id === newEcho.id &&
                    JSON.stringify(e.mainStats) === JSON.stringify(newEcho.mainStats) &&
                    JSON.stringify(e.subStats) === JSON.stringify(newEcho.subStats)
            );
            if (alreadyExists) return prev;

            const newEntry = { ...newEcho, uid: Date.now() + Math.random() };
            return [...prev, newEntry];
        });
    };

    const removeEchoFromBag = (uid) => {
        setEchoBag(prev => prev.filter(e => e.uid !== uid));
    };

    return {
        echoBag,
        addEchoToBag,
        removeEchoFromBag
    };
}