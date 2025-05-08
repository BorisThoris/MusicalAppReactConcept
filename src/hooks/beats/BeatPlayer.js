import React, { useCallback } from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';
import Instruments from '../../globalConstants/instrumentNames';
import { useInstrumentRecordingsOperations } from '../useInstrumentRecordingsOperations';

const ButtonContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
`;

/**
 * Generic scheduler for any instrument pattern, with grouping into logical layers.
 * @param category - top‐level instrument category (e.g. Instruments.Drum)
 * @param layerName - logical layer key for recordings (e.g. "Drums.SmokeBeat")
 * @param pattern - array of { name: string; time: number }
 * @param ops - recording operations { addRecording, resetRecordings }
 */
const schedulePattern = (category, layerName, pattern, { addRecording, resetRecordings }) => {
    const timeouts = [];

    resetRecordings(layerName);
    const startTime = Date.now();

    pattern.forEach(({ name, time }) => {
        const id = setTimeout(() => {
            const eventInstance = createAndPlayEventIntance(`${category}/${name}`);
            const elapsed = Date.now() - startTime;
            addRecording(eventInstance, layerName, startTime, elapsed);
        }, time);
        timeouts.push(id);
    });

    const lastTime = Math.max(...pattern.map((p) => p.time));
    const cleanupId = setTimeout(() => timeouts.forEach(clearTimeout), lastTime + 50);
    timeouts.push(cleanupId);
};

export const BeatPlayer = () => {
    const { addRecording, resetRecordings } = useInstrumentRecordingsOperations();

    // "Smoke on the Water" Drum Beat split into separate instrument layers
    const playSmokeOnTheWater = useCallback(() => {
        const bpm = 110;
        const quarterMs = (60 / bpm) * 1000;
        const eighthMs = quarterMs / 2;

        // Floor Tom layer
        const floorTomPattern = [
            { name: 'FloorTom', time: 0 },
            { name: 'FloorTom', time: quarterMs * 2 }
        ];
        schedulePattern(Instruments.Drum, 'Drums.SmokeOnTheWater.FloorTom', floorTomPattern, {
            addRecording,
            resetRecordings
        });

        // Ride Cymbal layer
        const ridePattern = [
            { name: 'RideCymbal', time: 0 },
            { name: 'RideCymbal', time: eighthMs },
            { name: 'RideCymbal', time: quarterMs },
            { name: 'RideCymbal', time: quarterMs + eighthMs },
            { name: 'RideCymbal', time: quarterMs * 2 },
            { name: 'RideCymbal', time: quarterMs * 2 + eighthMs },
            { name: 'RideCymbal', time: quarterMs * 3 },
            { name: 'RideCymbal', time: quarterMs * 3 + eighthMs }
        ];
        schedulePattern(Instruments.Drum, 'Drums.SmokeOnTheWater.RideCymbal', ridePattern, {
            addRecording,
            resetRecordings
        });

        // Snare Drum layer
        const snarePattern = [
            { name: 'SnareDrum', time: quarterMs },
            { name: 'SnareDrum', time: quarterMs * 3 }
        ];
        schedulePattern(Instruments.Drum, 'Drums.SmokeOnTheWater.SnareDrum', snarePattern, {
            addRecording,
            resetRecordings
        });
    }, [addRecording, resetRecordings]);

    // 4-Bar Rock Drum Beat split into separate instrument layers
    const playNiceBeat = useCallback(() => {
        const bpm = 120;
        const quarterMs = 60000 / bpm;
        const eighthMs = quarterMs / 2;

        const floorTomPattern = [];
        const snareDrumPattern = [];
        const snarePattern = [];
        const ridePattern = [];

        for (let bar = 0; bar < 4; bar += 1) {
            const start = bar * 4 * quarterMs;

            // Floor Tom hits
            floorTomPattern.push({ name: 'FloorTom', time: start });
            floorTomPattern.push({ name: 'FloorTom', time: start + quarterMs + eighthMs });

            // Snare Drum backbeats
            snareDrumPattern.push({ name: 'SnareDrum', time: start + quarterMs });
            snareDrumPattern.push({ name: 'SnareDrum', time: start + 3 * quarterMs });

            // Ghost note
            snarePattern.push({ name: 'Snare', time: start + 2 * quarterMs + eighthMs });

            // Ride Cymbal eight-notes
            for (let i = 0; i < 8; i += 1) {
                ridePattern.push({ name: 'RideCymbal', time: start + i * eighthMs });
            }
        }

        schedulePattern(Instruments.Drum, 'Drums.FourBarRock.FloorTom', floorTomPattern, {
            addRecording,
            resetRecordings
        });
        schedulePattern(Instruments.Drum, 'Drums.FourBarRock.SnareDrum', snareDrumPattern, {
            addRecording,
            resetRecordings
        });
        schedulePattern(Instruments.Drum, 'Drums.FourBarRock.Snare', snarePattern, { addRecording, resetRecordings });
        schedulePattern(Instruments.Drum, 'Drums.FourBarRock.RideCymbal', ridePattern, {
            addRecording,
            resetRecordings
        });
    }, [addRecording, resetRecordings]);

    // Guitar riff remains its own layer
    const playSmokeRiff = useCallback(() => {
        const bpm = 110;
        const quarterMs = (60 / bpm) * 1000;
        const eighthMs = quarterMs / 2;
        const pattern = [
            { name: 'E', time: 0 },
            { name: 'G', time: 1 * eighthMs },
            { name: 'A', time: 2 * eighthMs },
            { name: 'B', time: 4 * eighthMs },
            { name: 'A', time: 6 * eighthMs },
            { name: 'G', time: 7 * eighthMs },
            { name: 'E', time: 8 * eighthMs }
        ];
        schedulePattern(Instruments.Guitar, 'Guitar.SmokeRiff', pattern, { addRecording, resetRecordings });
    }, [addRecording, resetRecordings]);

    return (
        <ButtonContainer>
            <button onClick={playSmokeOnTheWater}>Play “Smoke on the Water” Drum Beat</button>
            <button onClick={playNiceBeat}>Play 4-Bar Rock Drum Beat</button>
            <button onClick={playSmokeRiff}>Play “Smoke” Guitar Riff</button>
        </ButtonContainer>
    );
};
