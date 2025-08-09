import React from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import { useRecordingPlayerContext } from '../../providers/RecordingsPlayerProvider';
import PianoKey from './PianoKey';

const PianoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[8]};
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    gap: ${({ theme }) => theme.spacing[4]};
`;

const ControlButton = styled.button`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.primary};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.base};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: background-color ${({ theme }) => theme.transitions.duration.fast}
        ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background-color: ${({ theme }) => theme.colors.primary[600]};
    }
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
    'pianoB'
];

const Piano = () => {
    const instrumentName = Instruments.Piano;
    const { playRecordedSounds } = useRecordingPlayerContext();
    const { recordEvent, toggleRecording } = useRecorder({ instrumentName });

    const playEvent = (musicalEvent) => {
        const eventInstance = createAndPlayEventIntance(musicalEvent);

        recordEvent(eventInstance, instrumentName);
    };

    return (
        <PianoContainer>
            <ControlButton onClick={toggleRecording}>Toggle Recording</ControlButton>
            <ControlButton onClick={playRecordedSounds}>Replay Events</ControlButton>
            {pianoKeys.map((key, index) => (
                <PianoKey key={index} keyName={key} instrumentName={Instruments.Piano} playEvent={playEvent} />
            ))}
        </PianoContainer>
    );
};

export default Piano;
