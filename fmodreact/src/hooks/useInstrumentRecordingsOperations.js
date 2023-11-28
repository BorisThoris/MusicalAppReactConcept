import { useCallback, useContext } from 'react';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';

const useInstrumentRecordingsOperations = () => {
    const { setRecordings } = useContext(InstrumentRecordingsContext);

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
                const updatedRecordings = { ...prev };

                Object.keys(updatedRecordings).forEach((instrumentName) => {
                    const instrumentRecordings =
                        updatedRecordings[instrumentName];
                    const targetIndex = instrumentRecordings.findIndex(
                        (item) => item.id === id
                    );

                    if (targetIndex !== -1) {
                        instrumentRecordings.splice(targetIndex, 1);
                        return updatedRecordings;
                    }
                });

                return updatedRecordings;
            });
        },
        [setRecordings]
    );

    const recordSoundEvent = useCallback(
        (eventInstance, instrumentName, startTime) => {
            const elapsedTime = getElapsedTime(startTime);
            const sound = createSound({
                eventInstance,
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
        deleteRecording,
        resetRecordings,
        updateRecording,
    };
};

export default useInstrumentRecordingsOperations;
