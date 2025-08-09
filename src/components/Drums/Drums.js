import React from 'react';
import styled from 'styled-components';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import { useRecordingPlayerContext } from '../../providers/RecordingsPlayerProvider';
import Drum from './Drum';

const DrumSetContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing[2]};
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[8]};
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    margin: ${({ theme }) => theme.spacing[4]};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        border-color: ${({ theme }) => theme.colors.warning[400]};
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
        border-color: ${({ theme }) => theme.colors.warning[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const drums = ['CrashCymbal', 'FloorTom', 'RideCymbal', 'Snare', 'SnareDrum', 'Tom1'];

const Drums = () => {
    const instrumentName = Instruments.Drum;
    const { playRecordedSounds } = useRecordingPlayerContext();
    const { recordEvent, toggleRecording } = useRecorder({ instrumentName });

    return (
        <DrumSetContainer>
            <ControlButton onClick={toggleRecording}>Toggle Recording</ControlButton>
            <ControlButton onClick={playRecordedSounds}>Replay Events</ControlButton>
            {drums.map((key, index) => (
                <Drum key={index} name={key} instrumentName={instrumentName} recordEvent={recordEvent} />
            ))}
        </DrumSetContainer>
    );
};

export default Drums;
