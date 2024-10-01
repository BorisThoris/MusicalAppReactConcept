import React from 'react';
import useRecordingsPlayer from '../hooks/useRecordingsPlayer';

export const RecordingsPlayerContext = React.createContext(null);

export const RecordingsPlayerProvider = ({ children }) => {
    const recordingsPlayer = useRecordingsPlayer();

    return <RecordingsPlayerContext.Provider value={recordingsPlayer}>{children}</RecordingsPlayerContext.Provider>;
};
