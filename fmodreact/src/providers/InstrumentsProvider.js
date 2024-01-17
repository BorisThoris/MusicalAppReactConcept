import { cloneDeep, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createEventInstance } from '../fmodLogic/eventInstanceHelpers';
import createSound from '../globalHelpers/createSound';
import useOverlapCalculator from '../hooks/useOverlapCalculator/useOverlapCalculator';

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () =>
    useContext(InstrumentRecordingsContext);

export const InstrumentRecordingsProvider = React.memo(({ children }) => {
    const [recordings, setRecordings] = useState({});
    const [overlapGroups, setOverlapGroups] = useState({});
    const prevOverlapGroupsRef = useRef({});

    const [localLoaded, setLocalLoaded] = useState(false);

    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(
        recordings,
        overlapGroups
    );

    useEffect(() => {
        prevOverlapGroupsRef.current = overlapGroups;
    }, [overlapGroups]);

    useEffect(() => {
        const newOverlapGroups = calculateOverlapsForAllInstruments();
        const isOverlapGroupsChanged = !isEqual(
            newOverlapGroups,
            prevOverlapGroupsRef.current
        );

        if (isOverlapGroupsChanged) {
            setOverlapGroups(newOverlapGroups);
            prevOverlapGroupsRef.current = newOverlapGroups;
        }
    }, [recordings, calculateOverlapsForAllInstruments]);

    const recreateEvents = useCallback(() => {
        const savedRecordings = localStorage.getItem('recordings');
        if (savedRecordings) {
            const parsedRecordings = JSON.parse(savedRecordings);
            const newRecordings = {};
            Object.keys(parsedRecordings).forEach((instrumentName) => {
                newRecordings[instrumentName] = parsedRecordings[
                    instrumentName
                ].map((recording) => {
                    const eventInstance = createEventInstance(
                        recording.eventPath || 'Drum/Snare'
                    );
                    return createSound({
                        eventInstance,
                        eventPath: recording.eventPath || 'Drum/Snare',
                        instrumentName,
                        passedParams: recording.params,
                        startTime: recording.startTime,
                    });
                });
            });
            setRecordings(newRecordings);
        }
    }, []);

    useEffect(() => {
        if (!localLoaded && Object.keys(recordings).length === 0) {
            recreateEvents();
            setLocalLoaded(true);
        }
    }, [localLoaded, recordings, recreateEvents]);

    useEffect(() => {
        localStorage.setItem('recordings', JSON.stringify(recordings));
        localStorage.setItem('overlapGroups', JSON.stringify(overlapGroups));
    }, [recordings, overlapGroups]);

    const contextValue = useMemo(
        () => ({
            overlapGroups,
            recordings,
            setOverlapGroups,
            setRecordings,
        }),
        [overlapGroups, recordings]
    );

    return (
        <InstrumentRecordingsContext.Provider value={contextValue}>
            {children}
        </InstrumentRecordingsContext.Provider>
    );
});

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default InstrumentRecordingsProvider;
