import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const initialRecordings = {
    Drum: [
        {
            eventName: 'Drum/CrashCymbal',
            instrumentName: 'Drum',
            time: 0.582,
        },
        {
            eventName: 'Drum/FloorTom',
            instrumentName: 'Drum',
            time: 2.396,
        },
        {
            eventName: 'Drum/RideCymbal',
            instrumentName: 'Drum',
            time: 4.195,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 11.791,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            time: 12.6,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            time: 13.463,
        },
        {
            eventName: 'Drum/RideCymbal',
            instrumentName: 'Drum',
            time: 14.309,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            time: 15.431,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 16.161,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            time: 16.413,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            time: 16.987,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 17.666,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            time: 17.952,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 18.468,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 19.003,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            time: 19.551,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            time: 20.377,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 20.707,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            time: 21.381,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 22.326,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            time: 22.643,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            time: 23.516,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 23.895,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            time: 24.313,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 24.792,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            time: 25.067,
        },
        {
            eventName: 'Drum/Tom1',
            instrumentName: 'Drum',
            time: 25.483,
        },
        {
            eventName: 'Drum/SnareDrum',
            instrumentName: 'Drum',
            time: 25.83,
        },
        {
            eventName: 'Drum/Snare',
            instrumentName: 'Drum',
            time: 26.244,
        },
    ],
    Guitar: [
        {
            eventName: 'Guitar/A',
            instrumentName: 'Guitar',
            time: 0.575,
        },
        {
            eventName: 'Guitar/B',
            instrumentName: 'Guitar',
            time: 1.227,
        },
        {
            eventName: 'Guitar/D',
            instrumentName: 'Guitar',
            time: 1.836,
        },
        {
            eventName: 'Guitar/E',
            instrumentName: 'Guitar',
            time: 2.356,
        },
        {
            eventName: 'Guitar/G',
            instrumentName: 'Guitar',
            time: 2.911,
        },
        {
            eventName: 'Guitar/A',
            instrumentName: 'Guitar',
            time: 0.549,
        },
        {
            eventName: 'Guitar/B',
            instrumentName: 'Guitar',
            time: 1.374,
        },
        {
            eventName: 'Guitar/D',
            instrumentName: 'Guitar',
            time: 2.267,
        },
    ],
    Piano: [
        {
            eventName: 'Piano/pianoC',
            instrumentName: 'Piano',
            time: 0.706,
        },
        {
            eventName: 'Piano/pianoD',
            instrumentName: 'Piano',
            time: 1.279,
        },
        {
            eventName: 'Piano/pianoE',
            instrumentName: 'Piano',
            time: 1.638,
        },
        {
            eventName: 'Piano/pianoF#',
            instrumentName: 'Piano',
            time: 2.996,
        },
        {
            eventName: 'Piano/pianoG',
            instrumentName: 'Piano',
            time: 3.461,
        },
        {
            eventName: 'Piano/pianoA',
            instrumentName: 'Piano',
            time: 3.819,
        },
        {
            eventName: 'Piano/pianoA#',
            instrumentName: 'Piano',
            time: 4.265,
        },
        {
            eventName: 'Piano/pianoB',
            instrumentName: 'Piano',
            time: 4.795,
        },
        {
            eventName: 'Piano/pianoC',
            instrumentName: 'Piano',
            time: 6.42,
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

    const contextValue = {
        recordings,
        resetAllRecordings,
        resetInstrumentRecordings,
        setRecordings,
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
