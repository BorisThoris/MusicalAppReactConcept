import { useCallback, useContext } from 'react';
import { recreateEvents } from '../globalHelpers/createSound';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';

export const useBeatActions = ({ beats, closeLoadPanel, saveBeatsToLocalStorage }) => {
    const { deleteAllElements, setHasChanged, setOverlapGroups, setSelectedBeat } = useContext(CollisionsContext);

    const handleSave = useCallback(
        (beatName, overlapGroups) => {
            if (!beatName.trim()) {
                alert('Beat name cannot be empty.');
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
                // eslint-disable-next-line no-alert
                const confirmation = window.confirm(
                    'A beat with this name already exists. Do you want to overwrite it?'
                );
                if (confirmation) {
                    updatedBeats[existingBeatIndex] = newBeat;
                    alert('Beat updated successfully.');
                } else {
                    return;
                }
            } else {
                updatedBeats.push(newBeat);
                alert('Beat saved successfully.');
            }
            saveBeatsToLocalStorage(updatedBeats);
            setHasChanged(false);
        },
        [beats, saveBeatsToLocalStorage, setHasChanged]
    );

    const handleDelete = useCallback(
        (name) => {
            const confirmation = window.confirm('Are you sure you want to delete this beat?');
            if (confirmation) {
                const updatedBeats = beats.filter((beat) => beat.name !== name);
                saveBeatsToLocalStorage(updatedBeats);
                setHasChanged(false);
            }
        },
        [beats, saveBeatsToLocalStorage, setHasChanged]
    );

    const handleLoad = useCallback(
        (name) => {
            const beatToLoad = beats.find((beat) => beat.name === name);
            if (beatToLoad) {
                let savedOverlapGroups = JSON.parse(JSON.stringify(beatToLoad.data));
                savedOverlapGroups = recreateEvents(savedOverlapGroups);
                deleteAllElements();
                setOverlapGroups(savedOverlapGroups);
                setSelectedBeat(beatToLoad);
                setHasChanged(false);
                closeLoadPanel();
            } else {
                alert('Beat not found.');
            }
        },
        [beats, deleteAllElements, setOverlapGroups, setSelectedBeat, setHasChanged, closeLoadPanel]
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
