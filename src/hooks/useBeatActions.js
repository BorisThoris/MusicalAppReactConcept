import { useCallback, useContext } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { findOverlaps } from '../providers/CollisionsProvider/overlapHelpers';
import { useNotification } from '../providers/NotificationProvider/NotificationProvider';

export const useBeatActions = ({ beats, closeLoadPanel, saveBeatsToLocalStorage }) => {
    const { setHasChanged, setOverlapGroups, setSelectedBeat } = useContext(CollisionsContext);
    const { confirm, showError, showSuccess } = useNotification();

    const handleSave = useCallback(
        async (beatName, overlapGroups) => {
            if (!beatName.trim()) {
                showError('Beat name cannot be empty.');
                return;
            }

            const newBeat = {
                data: overlapGroups,
                date: new Date().toLocaleString(),
                name: beatName.trim()
            };

            const existingBeatIndex = beats.findIndex((beat) => beat.name === newBeat.name);
            const updatedBeats = [...beats];

            if (existingBeatIndex !== -1) {
                const confirmation = await confirm(
                    'A beat with this name already exists. Do you want to overwrite it?'
                );
                if (confirmation) {
                    updatedBeats[existingBeatIndex] = newBeat;
                    showSuccess('Beat updated successfully.');
                } else {
                    return;
                }
            } else {
                updatedBeats.push(newBeat);
                showSuccess('Beat saved successfully.');
            }
            saveBeatsToLocalStorage(updatedBeats);
            setHasChanged(false);
        },
        [beats, saveBeatsToLocalStorage, setHasChanged, showError, showSuccess, confirm]
    );

    const handleDelete = useCallback(
        async (name) => {
            const confirmation = await confirm('Are you sure you want to delete this beat?');
            if (confirmation) {
                const updatedBeats = beats.filter((beat) => beat.name !== name);
                saveBeatsToLocalStorage(updatedBeats);
                setHasChanged(false);
            }
        },
        [beats, saveBeatsToLocalStorage, setHasChanged, confirm]
    );

    const handleLoad = useCallback(
        (name) => {
            const beatToLoad = beats.find((beat) => beat.name === name);

            if (beatToLoad) {
                const savedOverlapGroups = beatToLoad.data;
                const newOverlapGroups = findOverlaps(savedOverlapGroups);

                setOverlapGroups(newOverlapGroups);
                setSelectedBeat(beatToLoad);
                setHasChanged(false);
                closeLoadPanel();
            } else {
                showError('Beat not found.');
            }
        },
        [beats, setOverlapGroups, setSelectedBeat, setHasChanged, closeLoadPanel, showError]
    );

    const handleDuplicate = useCallback(
        (name) => {
            const beatToDuplicate = beats.find((beat) => beat.name === name);
            if (beatToDuplicate) {
                const newBeat = { ...beatToDuplicate, name: `${beatToDuplicate.name}_copy` };
                saveBeatsToLocalStorage([...beats, newBeat]);
                setHasChanged(false);
            }
        },
        [beats, saveBeatsToLocalStorage, setHasChanged]
    );

    return { handleDelete, handleDuplicate, handleLoad, handleSave };
};
