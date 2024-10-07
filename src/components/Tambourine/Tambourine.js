import React from 'react';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import { useRecordingPlayerContext } from '../../providers/RecordingsPlayerProvider';
import useTambourine from './useTambourine';

const Tambourine = () => {
    const instrumentName = Instruments.Tambourine;
    const { playRecordedSounds } = useRecordingPlayerContext();
    const { recordEvent, toggleRecording } = useRecorder({ instrumentName });

    const playEvent = () => {
        const tambourineEvent = `${instrumentName}/Parameter test`;

        const eventInstance = createAndPlayEventIntance(tambourineEvent);
        recordEvent(eventInstance, instrumentName);
    };

    useTambourine({ playEvent });

    return (
        <div>
            <button onClick={toggleRecording}>Toggle Recording</button>
            <button onClick={playRecordedSounds}>Replay Events</button>
        </div>
    );
};

export default Tambourine;
