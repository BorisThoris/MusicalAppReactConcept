import PropTypes from 'prop-types';
import React, { createContext, useContext, useMemo, useState } from 'react';

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () =>
    useContext(InstrumentRecordingsContext);

export const InstrumentRecordingsProvider = ({ children }) => {
    const [recordings, setRecordings] = useState({});

    const contextValue = useMemo(
        () => ({
            recordings,
            setRecordings,
        }),
        [recordings, setRecordings]
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
