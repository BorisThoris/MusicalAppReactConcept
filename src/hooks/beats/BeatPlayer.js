// src/components/BeatPlayer.jsx

import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';
import Instruments from '../../globalConstants/instrumentNames';
import { usePixelRatio } from '../../providers/PixelRatioProvider/PixelRatioProvider';
import { useInstrumentRecordingsOperations } from '../useInstrumentRecordingsOperations';

const ButtonContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing[2]};
    justify-content: center;
    margin: ${({ theme }) => theme.spacing[5]} 0;
    padding: ${({ theme }) => theme.spacing[4]};
    background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    box-shadow: ${({ theme }) => theme.shadows.sm};
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

const schedulePattern = (category, layerName, pattern, { addRecording, devicePxPerSec, resetRecordings }) => {
    const timeouts = [];
    resetRecordings(layerName);

    pattern.forEach(({ name, time }) => {
        const id = setTimeout(() => {
            const eventInstance = createAndPlayEventIntance(`${category}/${name}`);
            // use the hard-coded time directly
            const pxOffset = time / 1000;
            addRecording(eventInstance, layerName, pxOffset);
        }, time);
        timeouts.push(id);
    });

    const lastTime = Math.max(...pattern.map((p) => p.time));
    const cleanupId = setTimeout(() => timeouts.forEach(clearTimeout), lastTime + 50);
    timeouts.push(cleanupId);
};

export const BeatPlayer = () => {
    const { addRecording, resetRecordings } = useInstrumentRecordingsOperations();
    const devicePxPerSec = usePixelRatio();
    const scheduledTimeouts = useRef(new Set());

    const wrappedSchedule = useCallback(
        (cat, layer, pat) => {
            // clear any lingering timers
            scheduledTimeouts.current.forEach(clearTimeout);
            scheduledTimeouts.current.clear();

            schedulePattern(cat, layer, pat, { addRecording, devicePxPerSec, resetRecordings });
        },
        [addRecording, devicePxPerSec, resetRecordings]
    );

    // Test Fire (explicit 0,1,2,3s)
    const handleTestFire = useCallback(() => {
        [0, 1000, 2000, 3000].forEach((delay) => {
            const id = setTimeout(() => {
                const evt = createAndPlayEventIntance('Drum/FloorTom');
            }, delay);
            scheduledTimeouts.current.add(id);
        });
    }, []);

    const playSmokeOnTheWater = useCallback(() => {
        // all startTimes in ms, pre-computed for 110 BPM
        const floorTomPattern = [
            { name: 'FloorTom', time: 0 },
            { name: 'FloorTom', time: 1091 }
        ];

        const ridePattern = [
            { name: 'RideCymbal', time: 0 },
            { name: 'RideCymbal', time: 273 },
            { name: 'RideCymbal', time: 545 },
            { name: 'RideCymbal', time: 818 },
            { name: 'RideCymbal', time: 1091 },
            { name: 'RideCymbal', time: 1364 },
            { name: 'RideCymbal', time: 1636 },
            { name: 'RideCymbal', time: 1909 }
        ];

        const snareDrumPattern = [
            { name: 'SnareDrum', time: 545 },
            { name: 'SnareDrum', time: 1636 }
        ];

        wrappedSchedule(Instruments.Drum, 'Drums.SmokeOnTheWater.FloorTom', floorTomPattern);
        wrappedSchedule(Instruments.Drum, 'Drums.SmokeOnTheWater.RideCymbal', ridePattern);
        wrappedSchedule(Instruments.Drum, 'Drums.SmokeOnTheWater.SnareDrum', snareDrumPattern);
    }, [wrappedSchedule]);

    const playNiceBeat = useCallback(() => {
        // fully hard-coded 4-bar rock @120 BPM
        const floorTomPattern = [
            { name: 'FloorTom', time: 0 },
            { name: 'FloorTom', time: 750 },
            { name: 'FloorTom', time: 2000 },
            { name: 'FloorTom', time: 2750 },
            { name: 'FloorTom', time: 4000 },
            { name: 'FloorTom', time: 4750 },
            { name: 'FloorTom', time: 6000 },
            { name: 'FloorTom', time: 6750 }
        ];

        const snareDrumPattern = [
            { name: 'SnareDrum', time: 500 },
            { name: 'SnareDrum', time: 1500 },
            { name: 'SnareDrum', time: 2500 },
            { name: 'SnareDrum', time: 3500 },
            { name: 'SnareDrum', time: 4500 },
            { name: 'SnareDrum', time: 5500 },
            { name: 'SnareDrum', time: 6500 },
            { name: 'SnareDrum', time: 7500 }
        ];

        const snarePattern = [
            { name: 'Snare', time: 1250 },
            { name: 'Snare', time: 3250 },
            { name: 'Snare', time: 5250 },
            { name: 'Snare', time: 7250 }
        ];

        const ridePattern = [
            { name: 'RideCymbal', time: 0 },
            { name: 'RideCymbal', time: 250 },
            { name: 'RideCymbal', time: 500 },
            { name: 'RideCymbal', time: 750 },
            { name: 'RideCymbal', time: 1000 },
            { name: 'RideCymbal', time: 1250 },
            { name: 'RideCymbal', time: 1500 },
            { name: 'RideCymbal', time: 1750 },
            { name: 'RideCymbal', time: 2000 },
            { name: 'RideCymbal', time: 2250 },
            { name: 'RideCymbal', time: 2500 },
            { name: 'RideCymbal', time: 2750 },
            { name: 'RideCymbal', time: 3000 },
            { name: 'RideCymbal', time: 3250 },
            { name: 'RideCymbal', time: 3500 },
            { name: 'RideCymbal', time: 3750 },
            { name: 'RideCymbal', time: 4000 },
            { name: 'RideCymbal', time: 4250 },
            { name: 'RideCymbal', time: 4500 },
            { name: 'RideCymbal', time: 4750 },
            { name: 'RideCymbal', time: 5000 },
            { name: 'RideCymbal', time: 5250 },
            { name: 'RideCymbal', time: 5500 },
            { name: 'RideCymbal', time: 5750 },
            { name: 'RideCymbal', time: 6000 },
            { name: 'RideCymbal', time: 6250 },
            { name: 'RideCymbal', time: 6500 },
            { name: 'RideCymbal', time: 6750 },
            { name: 'RideCymbal', time: 7000 },
            { name: 'RideCymbal', time: 7250 },
            { name: 'RideCymbal', time: 7500 },
            { name: 'RideCymbal', time: 7750 }
        ];

        wrappedSchedule(Instruments.Drum, 'Drums.FourBarRock.FloorTom', floorTomPattern);
        wrappedSchedule(Instruments.Drum, 'Drums.FourBarRock.SnareDrum', snareDrumPattern);
        wrappedSchedule(Instruments.Drum, 'Drums.FourBarRock.Snare', snarePattern);
        wrappedSchedule(Instruments.Drum, 'Drums.FourBarRock.RideCymbal', ridePattern);
    }, [wrappedSchedule]);

    const playSmokeRiff = useCallback(() => {
        // hard-coded riff times at ~110 BPM divisions
        const riffPattern = [
            { name: 'E', time: 0 },
            { name: 'G', time: 273 },
            { name: 'A', time: 545 },
            { name: 'B', time: 1091 },
            { name: 'A', time: 1636 },
            { name: 'G', time: 1909 },
            { name: 'E', time: 2182 }
        ];

        wrappedSchedule(Instruments.Guitar, 'Guitar.SmokeRiff', riffPattern);
    }, [wrappedSchedule]);

    useEffect(() => {
        const ref = scheduledTimeouts.current;
        return () => {
            ref.forEach(clearTimeout);
            ref.clear();
        };
    }, []);

    return (
        <ButtonContainer>
            <ControlButton onClick={handleTestFire}>Test Fire (0, 1, 2, 3s)</ControlButton>
            <ControlButton onClick={playSmokeOnTheWater}>Play “Smoke on the Water” Drum Beat</ControlButton>
            <ControlButton onClick={playNiceBeat}>Play 4-Bar Rock Drum Beat</ControlButton>
            <ControlButton onClick={playSmokeRiff}>Play “Smoke” Guitar Riff</ControlButton>
        </ButtonContainer>
    );
};
