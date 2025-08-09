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
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    gap: ${({ theme }) => theme.spacing[4]};
    margin: ${({ theme }) => theme.spacing[4]};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        border-color: ${({ theme }) => theme.colors.primary[400]};
    }
`;

const ControlButton = styled.button`
    background: ${({ theme }) => theme.colors.glass.elevated};
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    box-shadow: ${({ theme }) => theme.shadows.glass};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.primary};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
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
