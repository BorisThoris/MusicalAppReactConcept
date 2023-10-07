import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useState } from 'react';

// let clone = Object.assign(Object.create(Object.getPrototypeOf(orig)), orig)
const initialRecordings = {
    Drum: [
        {
            eventName: 'Drum/CrashCymbal',
            instrumentName: 'Drum',
            startTime: 0.582,
        },
        {
            eventName: 'Drum/FloorTom',
            instrumentName: 'Drum',
            startTime: 2.396,
        },
        {
            eventName: 'Drum/RideCymbal',
            instrumentName: 'Drum',
            startTime: 4.195,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 11.791,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            startTime: 12.6,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            startTime: 13.463,
        },
        {
            eventName: 'Drum/RideCymbal',
            instrumentName: 'Drum',
            startTime: 14.309,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            startTime: 15.431,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 16.161,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            startTime: 16.413,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            startTime: 16.987,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 17.666,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            startTime: 17.952,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 18.468,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 19.003,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            startTime: 19.551,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            startTime: 20.377,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 20.707,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            startTime: 21.381,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 22.326,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            startTime: 22.643,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            startTime: 23.516,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 23.895,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            startTime: 24.313,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 24.792,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            startTime: 25.067,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            startTime: 25.483,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            startTime: 25.83,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            startTime: 26.244,
        },
    ],
    Guitar: [
        {
            eventName: 'Guitar/A',
            instrumentName: 'Guitar',
            startTime: 0.575,
        },
    ],
    Piano: [
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 0.74,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 1.363,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 2.016,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 2.662,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 3.295,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 3.789,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 4.266,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 4.546,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 4.782,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 5.058,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 5.329,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 5.587,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 5.762,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 6.068,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 6.347,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 6.466,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 6.611,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 6.871,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 7.002,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 7.141,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 8.803,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 10.227,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 11.809,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 13.408,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 14.965,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 16.723,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 17.565,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 19.348,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 20.133,
        },
        {
            eventInstance: {},
            instrumentName: 'Piano',
            startTime: 20.63,
        },
    ],
};

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () =>
    useContext(InstrumentRecordingsContext);

export const InstrumentRecordingsProvider = ({ children }) => {
    const [recordings, setRecordings] = useState({});

    useEffect(() => {
        console.log(recordings);
    }, [recordings]);

    const resetInstrumentRecordings = (instrumentName) => {
        const updatedRecordings = {
            ...recordings,
            [instrumentName]: [],
        };
        setRecordings(updatedRecordings);
    };

    const resetAllRecordings = () => setRecordings({});

    const updateStartTime = ({ index, instrumentName, newStartTime }) => {
        setRecordings((prevRecordings) => {
            const updatedRecordings = { ...prevRecordings };
            const instrumentRecordings = updatedRecordings[instrumentName];

            if (
                instrumentRecordings &&
                index >= 0 &&
                index < instrumentRecordings.length
            ) {
                instrumentRecordings[index] = {
                    ...instrumentRecordings[index],
                    startTime: newStartTime,
                };
            }

            return updatedRecordings;
        });
    };

    const contextValue = {
        recordings: Object.entries(recordings),
        resetAllRecordings,
        resetInstrumentRecordings,
        setRecordings,
        updateStartTime,
    };

    return (
        <InstrumentRecordingsContext.Provider value={contextValue}>
            {children}
        </InstrumentRecordingsContext.Provider>
    );
};

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
