import React, { useCallback, useContext } from 'react';
import { stopAllPlayback } from '../../../../fmodLogic/eventInstanceHelpers';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';

export const PlaybackControls = () => {
    const { playbackStatus, replayAllRecordedSounds } = useContext(RecordingsPlayerContext);

    const handlePlay = useCallback(() => {
        stopAllPlayback();
        replayAllRecordedSounds();
    }, [replayAllRecordedSounds]);

    return <button onClick={handlePlay}>{playbackStatus.isPlaying ? 'Pause' : 'Start'}</button>;
};
