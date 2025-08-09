import React, { useRef } from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import { useRecordingPlayerContext } from '../../providers/RecordingsPlayerProvider';
import { useGuitarDrawing } from './useGuitarDrawing';

const StyledGuitarSvg = styled.svg`
    flex: 1;
    background: ${({ theme }) => theme.colors.accent[100]};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const StyledGuitarNeck = styled.rect`
    x: 130;
    y: 50;
    width: 100%;
    height: 100%;
    fill: ${({ theme }) => theme.colors.success[500]};
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    height: 100%;
    padding: ${({ theme }) => theme.spacing[4]};
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
    margin-bottom: ${({ theme }) => theme.spacing[2]};

    &:hover {
        background-color: ${({ theme }) => theme.colors.primary[600]};
    }
`;

const Guitar = () => {
    const instrumentName = Instruments.Guitar;
    const { playRecordedSounds } = useRecordingPlayerContext();
    const { recordEvent, toggleRecording } = useRecorder({ instrumentName });

    const playEvent = (musicalEvent) => {
        const eventInstance = createAndPlayEventIntance(musicalEvent);
        recordEvent(eventInstance, instrumentName);
    };

    const handlePlayEvent = (musicalEvent) => {
        playEvent(musicalEvent);
    };

    const guitarSvgRef = useRef(null);

    useGuitarDrawing(guitarSvgRef, handlePlayEvent);

    return (
        <Wrapper>
            <ControlButton onClick={toggleRecording}>Toggle Recording</ControlButton>
            <ControlButton onClick={playRecordedSounds}>Replay Events</ControlButton>

            <StyledGuitarSvg ref={guitarSvgRef} xmlns="http://www.w3.org/2000/svg">
                <StyledGuitarNeck />
            </StyledGuitarSvg>
        </Wrapper>
    );
};

export default Guitar;
