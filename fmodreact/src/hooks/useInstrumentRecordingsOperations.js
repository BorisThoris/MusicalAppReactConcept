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

                if (
                    instrumentRecordings &&
                    index >= 0 &&
                    index < instrumentRecordings.length
                ) {
                    instrumentRecordings[index] = {
                        ...instrumentRecordings[index],
                        endTime: newEndRounded,
                        startTime: startRounded,
                    };
                }

                return updatedRecordings;
            });
        },
        [setRecordings]
    );

    const deleteEventInstance = useCallback(
        (instrumentName, index) => {
            setRecordings((prev) => {
                const updatedRecordings = { ...prev };

                if (
                    updatedRecordings[instrumentName] &&
                    index >= 0 &&
                    index < updatedRecordings[instrumentName].length
                ) {
                    updatedRecordings[instrumentName].splice(index, 1);
                }
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
        (instrumentName, index) => {
            deleteEventInstance(instrumentName, index);
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
