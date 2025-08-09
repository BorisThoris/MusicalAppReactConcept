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
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    box-shadow: ${({ theme }) => theme.shadows.lg};
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
