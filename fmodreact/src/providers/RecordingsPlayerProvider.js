import React, { useContext } from 'react';
import useRecordingsPlayer from '../hooks/useRecordingsPlayer';
import useStageWidthHook from '../hooks/useStageWidth';
import { InstrumentRecordingsContext } from './InstrumentsProvider';

export const RecordingsPlayerContext = React.createContext(null);

export const RecordingsPlayerProvider = ({ children }) => {
    const { recordings } = useContext(InstrumentRecordingsContext);

    const { furthestEndTime, furthestEndTimes } = useStageWidthHook({
        recordings,
    });

    const recordingsPlayer = useRecordingsPlayer({
        furthestEndTime,
        furthestEndTimes,
    });

    return (
        <RecordingsPlayerContext.Provider value={recordingsPlayer}>
            {children}
        </RecordingsPlayerContext.Provider>
    );
};

export default RecordingsPlayerProvider;
