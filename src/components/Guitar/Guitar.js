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
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    height: 100%;
    padding: ${({ theme }) => theme.spacing[4]};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    margin: ${({ theme }) => theme.spacing[4]};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        border-color: ${({ theme }) => theme.colors.success[400]};
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
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    box-shadow: ${({ theme }) => theme.shadows.glass};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.primary};
        border-color: ${({ theme }) => theme.colors.success[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
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
