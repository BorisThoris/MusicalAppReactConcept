import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () =>
    useContext(InstrumentRecordingsContext);

export const InstrumentRecordingsProvider = ({ children }) => {
    const [recordings, setRecordings] = useState({});

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
        recordings,
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
