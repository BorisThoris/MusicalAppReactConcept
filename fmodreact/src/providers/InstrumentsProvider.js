import PropTypes from 'prop-types';
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () =>
    useContext(InstrumentRecordingsContext);

const resetRecordingsForInstrument = (recordings, instrumentName) => ({
    ...recordings,
    [instrumentName]: [],
});

const updateRecordingStartTime = (
    recordings,
    { eventLength, index, instrumentName, newStartTime }
) => {
    const updatedRecordings = { ...recordings };
    const instrumentRecordings = updatedRecordings[instrumentName];
    const startRounded = parseFloat(newStartTime.toFixed(2));
    const newEndRounded = parseFloat((startRounded + eventLength).toFixed(2));

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
};

const deleteEventInstance = (recordings, { index, instrumentName }) => {
    const updatedRecordings = { ...recordings };

    if (
        updatedRecordings[instrumentName] &&
        index >= 0 &&
        index < updatedRecordings[instrumentName].length
    ) {
        updatedRecordings[instrumentName].splice(index, 1);
    }
    return updatedRecordings;
};

export const InstrumentRecordingsProvider = ({ children }) => {
    const [recordings, setRecordings] = useState({});

    const resetInstrumentRecordings = useCallback(
        (instrumentName) =>
            setRecordings((prev) =>
                resetRecordingsForInstrument(prev, instrumentName)
            ),
        []
    );

    const removeEventInstance = useCallback((instrumentName, index) => {
        setRecordings((prev) =>
            deleteEventInstance(prev, { index, instrumentName })
        );
    }, []);

    const resetAllRecordings = useCallback(() => setRecordings({}), []);

    const updateStartTime = useCallback(
        (params) =>
            setRecordings((prev) => updateRecordingStartTime(prev, params)),
        []
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
        []
    );

    const contextValue = useMemo(
        () => ({
            recordings,
            recordSoundEvent,
            removeEventInstance,
            resetAllRecordings,
            resetInstrumentRecordings,
            setRecordings,
            updateStartTime,
        }),
        [
            recordings,
            resetAllRecordings,
            resetInstrumentRecordings,
            setRecordings,
            updateStartTime,
            removeEventInstance,
            recordSoundEvent,
        ]
    );

    return (
        <InstrumentRecordingsContext.Provider value={contextValue}>
            {children}
        </InstrumentRecordingsContext.Provider>
    );
};

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
