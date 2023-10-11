import React from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import useRecordingsPlayer from '../../hooks/useRecordingsPlayer';

const DrumSetContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
`;

const DrumButton = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: 2px solid #000;
    border-radius: 8px;
    background-color: #fff;
    transition: background-color 0.3s;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const drums = [
    'CrashCymbal',
    'FloorTom',
    'RideCymbal',
    'Snare',
    'SnareDrum',
    'Tom1',
];

const Drums = () => {
    const instrumentName = Instruments.Drum;
    const { playRecordedSounds } = useRecordingsPlayer(instrumentName);
    const { recordEvent, toggleRecording } = useRecorder({ instrumentName });

    const playEvent = (musicalEvent) => {
        const eventInstance = createAndPlayEventIntance(musicalEvent);
        recordEvent(eventInstance, instrumentName);
    };

    const renderDrum = (key, index) => (
        <DrumButton
            key={index}
            onClick={() => playEvent(`${instrumentName}/${key}`)}
        >
            {key}
        </DrumButton>
    );

    return (
        <DrumSetContainer>
            <button onClick={toggleRecording}>Toggle Recording</button>
            <button onClick={playRecordedSounds}>Replay Events</button>
            {drums.map((key, index) => renderDrum(key, index))}
        </DrumSetContainer>
    );
};

export default Drums;
