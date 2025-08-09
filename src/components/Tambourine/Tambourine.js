import React, { useCallback } from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import { useRecordingPlayerContext } from '../../providers/RecordingsPlayerProvider';
import useTambourine from './useTambourine';

const TambourineContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
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
        border-color: ${({ theme }) => theme.colors.accent[400]};
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
        border-color: ${({ theme }) => theme.colors.accent[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const TambourineIcon = styled.div`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(
        135deg,
        ${({ theme }) => theme.colors.accent[400]},
        ${({ theme }) => theme.colors.accent[600]}
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    margin-bottom: ${({ theme }) => theme.spacing[6]};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
    border: 2px solid ${({ theme }) => theme.colors.glass.border};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        transform: scale(1.1) rotate(5deg);
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        border-color: ${({ theme }) => theme.colors.accent[400]};
    }

    &:active {
        transform: scale(0.95) rotate(-2deg);
    }
`;

const Tambourine = () => {
    const instrumentName = Instruments.Tambourine;
    const { playRecordedSounds } = useRecordingPlayerContext();
    const { recordEvent, toggleRecording } = useRecorder({ instrumentName });

    const playEvent = useCallback(() => {
        const tambourineEvent = `${instrumentName}/Parameter test`;

        const eventInstance = createAndPlayEventIntance(tambourineEvent);
        recordEvent(eventInstance, instrumentName);
    }, [instrumentName, recordEvent]);

    const handleToggleRecording = useCallback(() => {
        toggleRecording();
    }, [toggleRecording]);

    const handlePlayRecordedSounds = useCallback(() => {
        playRecordedSounds();
    }, [playRecordedSounds]);

    useTambourine({ playEvent });

    return (
        <TambourineContainer>
            <TambourineIcon onClick={playEvent}>🪘</TambourineIcon>
            <ControlButton onClick={handleToggleRecording}>Toggle Recording</ControlButton>
            <ControlButton onClick={handlePlayRecordedSounds}>Replay Events</ControlButton>
        </TambourineContainer>
    );
};

export default Tambourine;
