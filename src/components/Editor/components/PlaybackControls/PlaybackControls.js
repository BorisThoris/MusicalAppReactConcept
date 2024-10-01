import React, { useCallback, useContext } from 'react';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';

export const PlaybackControls = () => {
    const { playbackStatus, replayAllRecordedSounds } = useContext(RecordingsPlayerContext);

    const handlePlay = useCallback(() => {
        replayAllRecordedSounds();
    }, [replayAllRecordedSounds]);

    return <button onClick={handlePlay}>{playbackStatus.isPlaying ? 'Pause' : 'Start'}</button>;
};
