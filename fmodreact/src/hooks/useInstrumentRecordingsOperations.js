import { useCallback, useContext } from 'react';
import {
    createEventInstance,
    getEventPath,
} from '../fmodLogic/eventInstanceHelpers';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';

const useInstrumentRecordingsOperations = () => {
    const { overlapGroups, setRecordings } = useContext(
        InstrumentRecordingsContext
    );

    const resetRecordingsForInstrument = useCallback(
        (instrumentName) => {
            setRecordings((prev) => ({
                ...prev,
                [instrumentName]: [],
            }));
        },
        [setRecordings]
    );

    const updateRecordingStartTime = useCallback(
        (params) => {
            setRecordings((prev) => {
                const { eventLength, index, instrumentName, newStartTime } =
                    params;
                const updatedRecordings = { ...prev };
                const instrumentRecordings = updatedRecordings[instrumentName];
                const startRounded = parseFloat(newStartTime.toFixed(2));
                const newEndRounded = parseFloat(
                    (startRounded + eventLength).toFixed(2)
                );

                if (instrumentRecordings) {
                    const targetIndex = instrumentRecordings.findIndex(
                        (item) => item.id === index
                    );

                    if (targetIndex !== -1) {
                        instrumentRecordings[targetIndex] = {
                            ...instrumentRecordings[targetIndex],
                            endTime: newEndRounded,
                            startTime: startRounded,
                        };
                    }
                }

                return updatedRecordings;
            });
        },
        [setRecordings]
    );

    const deleteEventInstance = useCallback(
        (id) => {
            setRecordings((prev) => {
                const updatedRecordings = Object.keys(prev).reduce(
                    (acc, instrumentName) => {
                        const filteredRecordings = prev[instrumentName].filter(
                            (item) => item.id !== id
                        );

                        if (filteredRecordings.length > 0) {
                            acc[instrumentName] = filteredRecordings;
                        }

                        return acc;
                    },
                    {}
                );

                return updatedRecordings;
            });
        },
        [setRecordings]
    );

    const deleteAllRecordingsForInstrument = useCallback(
        (instrumentName) => {
            setRecordings((prev) => {
                const updatedRecordings = { ...prev };
                delete updatedRecordings[instrumentName];
                return updatedRecordings;
            });
        },
        [setRecordings]
    );

    const duplicateEventInstance = useCallback(
        (oldSound) => {
            const eventPath = getEventPath(oldSound.eventInstance);
            const eventInstance = createEventInstance(eventPath);

            const { instrumentName, startTime: oldStartTime } = oldSound;

            const newSound = createSound({
                eventInstance,
                eventPath,
                instrumentName,
                startTime: oldStartTime + 0.2,
            });

            setRecordings((prev) => ({
                ...prev,
                [instrumentName]: [...(prev[instrumentName] || []), newSound],
            }));
        },
        [setRecordings]
    );

    const recordSoundEvent = useCallback(
        (eventInstance, instrumentName, startTime) => {
            const elapsedTime = getElapsedTime(startTime);
            const eventPath = getEventPath(eventInstance);

            const sound = createSound({
                eventInstance,
                eventPath,
                instrumentName,
                startTime: elapsedTime,
            });

            setRecordings((prev) => ({
                ...prev,
                [instrumentName]: [...(prev[instrumentName] || []), sound],
            }));
        },
        [setRecordings]
    );

    const addRecording = useCallback(
        (eventInstance, instrumentName, startTime) => {
            recordSoundEvent(eventInstance, instrumentName, startTime);
        },
        [recordSoundEvent]
    );

    const deleteRecording = useCallback(
        (id) => {
            deleteEventInstance(id);
        },
        [deleteEventInstance]
    );

    const deleteOverlappingGroupById = (groupId) => {
        Object.keys(overlapGroups).forEach((instrument) => {
            overlapGroups[instrument] = overlapGroups[instrument].filter(
                (group) => {
                    if (group.id === groupId) {
                        group.events.forEach((event) =>
                            deleteRecording(event.id)
                        );

                        return true;
                    }
                    return false;
                }
            );
        });
    };

    const updateRecording = useCallback(
        (params) => {
            updateRecordingStartTime(params);
        },
        [updateRecordingStartTime]
    );

    const resetRecordings = useCallback(
        (instrumentName) => {
            if (instrumentName) {
                resetRecordingsForInstrument(instrumentName);
            } else {
                setRecordings({});
            }
        },
        [resetRecordingsForInstrument, setRecordings]
    );

    return {
        addRecording,
        deleteAllRecordingsForInstrument,
        deleteOverlappingGroupById,
        deleteRecording,
        duplicateEventInstance,
        resetRecordings,
        updateRecording,
    };
};

export default useInstrumentRecordingsOperations;
