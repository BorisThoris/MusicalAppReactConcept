import React, { useContext } from 'react';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';

export const PlaybackControls = () => {
    const { playbackStatus, replayAllRecordedSounds } = useContext(RecordingsPlayerContext);

    return <button onClick={replayAllRecordedSounds}>{playbackStatus.isPlaying ? 'Pause' : 'Start'}</button>;
};

export default PlaybackControls;
