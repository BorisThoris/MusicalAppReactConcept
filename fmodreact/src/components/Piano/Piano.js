import React from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import useRecordingsPlayer from '../../hooks/useRecordingsPlayer';

const PianoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const NormalKey = styled.button`
    width: 40px;
    height: 200px;
    background-color: white;
    border: 1px solid #000;
    border-right: none;
`;

const SharpKey = styled.button`
    width: 30px;
    height: 130px;
    background-color: black;
    position: relative;
    margin: 0 -5px;
    z-index: 1;
`;

const pianoKeys = [
    'pianoC',
    'pianoC#',
    'pianoD',
    'pianoD#',
    'pianoE',
    'pianoF',
    'pianoF#',
    'pianoG',
    'pianoG#',
    'pianoA',
    'pianoA#',
    'pianoB',
];

const Piano = () => {
    const instrumentName = Instruments.Piano;
    const { playRecordedSounds } = useRecordingsPlayer(instrumentName);
    const { recordEvent, toggleRecording } = useRecorder({ instrumentName });

    const playEvent = (musicalEvent) => {
        const eventInstance = createAndPlayEventIntance(musicalEvent);

        console.log(eventInstance);

        recordEvent(eventInstance, instrumentName);
    };

    const renderKey = (key, index) => {
        const isSharp = key.includes('#');
        const KeyComponent = isSharp ? SharpKey : NormalKey;

        return (
            <KeyComponent
                key={index}
                onClick={() => playEvent(`${instrumentName}/${key}`)}
            />
        );
    };

    return (
        <PianoContainer>
            <button onClick={toggleRecording}>Toggle Recording</button>
            <button onClick={playRecordedSounds}>Replay Events</button>
            {pianoKeys.map((key, index) => renderKey(key, index))}
        </PianoContainer>
    );
};

export default Piano;
