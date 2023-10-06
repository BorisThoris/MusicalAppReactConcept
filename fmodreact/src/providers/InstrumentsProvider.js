import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

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
        {
            eventName: 'Guitar/B',
            instrumentName: 'Guitar',
            startTime: 1.227,
        },
        {
            eventName: 'Guitar/D',
            instrumentName: 'Guitar',
            startTime: 1.836,
        },
        {
            eventName: 'Guitar/E',
            instrumentName: 'Guitar',
            startTime: 2.356,
        },
        {
            eventName: 'Guitar/G',
            instrumentName: 'Guitar',
            startTime: 2.911,
        },
        {
            eventName: 'Guitar/A',
            instrumentName: 'Guitar',
            startTime: 0.549,
        },
        {
            eventName: 'Guitar/B',
            instrumentName: 'Guitar',
            startTime: 1.374,
        },
        {
            eventName: 'Guitar/D',
            instrumentName: 'Guitar',
            startTime: 2.267,
        },
    ],
    Piano: [
        {
            eventName: 'Piano/pianoC',
            instrumentName: 'Piano',
            startTime: 0.706,
        },
        {
            eventName: 'Piano/pianoD',
            instrumentName: 'Piano',
            startTime: 1.279,
        },
        {
            eventName: 'Piano/pianoE',
            instrumentName: 'Piano',
            startTime: 1.638,
        },
        {
            eventName: 'Piano/pianoF#',
            instrumentName: 'Piano',
            startTime: 2.996,
        },
        {
            eventName: 'Piano/pianoG',
            instrumentName: 'Piano',
            startTime: 3.461,
        },
        {
            eventName: 'Piano/pianoA',
            instrumentName: 'Piano',
            startTime: 3.819,
        },
        {
            eventName: 'Piano/pianoA#',
            instrumentName: 'Piano',
            startTime: 4.265,
        },
        {
            eventName: 'Piano/pianoB',
            instrumentName: 'Piano',
            startTime: 4.795,
        },
        {
            eventName: 'Piano/pianoC',
            instrumentName: 'Piano',
            startTime: 6.42,
        },
    ],
};

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () =>
    useContext(InstrumentRecordingsContext);

export const InstrumentRecordingsProvider = ({ children }) => {
    const [recordings, setRecordings] = useState(initialRecordings);

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
