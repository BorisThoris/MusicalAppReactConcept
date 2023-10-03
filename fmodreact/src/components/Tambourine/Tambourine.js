import React, { useCallback, useEffect, useState } from 'react';
import { playEventInstance } from '../../fmodLogic';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import useRecordingsPlayer from '../../hooks/useRecordingsPlayer';
import useTambourine from './useTambourine';

const Tambourine = () => {
    const instrumentName = Instruments.Tambourine;
    const { playRecordedSounds } = useRecordingsPlayer(instrumentName);
    const { recordEvent, toggleRecording } = useRecorder(instrumentName);

    const playEvent = () => {
        const tambourineEvent = `${instrumentName}/Parameter test`;

        recordEvent(tambourineEvent);
        playEventInstance(tambourineEvent);
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
