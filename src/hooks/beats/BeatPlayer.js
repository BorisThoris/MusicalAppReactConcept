// src/components/BeatPlayer.js
import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';
import Instruments from '../../globalConstants/instrumentNames';

const ButtonContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
`;

export const BeatPlayer = () => {
    const timeouts = useRef([]);

    const clearAll = () => {
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
    };

    // ─── DRUMS ─────────────────────────────────────────────────────────────────
    const playSmokeOnTheWater = useCallback(() => {
        clearAll();
        const bpm = 110;
        const quarterMs = (60 / bpm) * 1000;
        const eighthMs = quarterMs / 2;

        const pattern = [
            { name: 'FloorTom', time: 0 },
            { name: 'RideCymbal', time: 0 },
            { name: 'RideCymbal', time: eighthMs },
            { name: 'SnareDrum', time: quarterMs },
            { name: 'RideCymbal', time: quarterMs },
            { name: 'RideCymbal', time: quarterMs + eighthMs },
            { name: 'FloorTom', time: quarterMs * 2 },
            { name: 'RideCymbal', time: quarterMs * 2 },
            { name: 'RideCymbal', time: quarterMs * 2 + eighthMs },
            { name: 'SnareDrum', time: quarterMs * 3 },
            { name: 'RideCymbal', time: quarterMs * 3 },
            { name: 'RideCymbal', time: quarterMs * 3 + eighthMs }
        ];

        pattern.forEach(({ name, time }) => {
            const id = setTimeout(() => {
                createAndPlayEventIntance(`${Instruments.Drum}/${name}`);
            }, time);
            timeouts.current.push(id);
        });
    }, []);

    const playNiceBeat = useCallback(() => {
        clearAll();
        const bpm = 120;
        const quarterMs = 60000 / bpm;
        const eighthMs = quarterMs / 2;
        const pattern = [];

        for (let bar = 0; bar < 4; bar += 1) {
            const start = bar * 4 * quarterMs;
            // Kick on 1 & “&” of 2
            pattern.push({ name: 'FloorTom', time: start + 0 });
            pattern.push({ name: 'FloorTom', time: start + quarterMs + eighthMs });
            // Snare on 2 & 4
            pattern.push({ name: 'SnareDrum', time: start + quarterMs });
            pattern.push({ name: 'SnareDrum', time: start + 3 * quarterMs });
            // Ghost-snare on “&” of 3
            pattern.push({ name: 'Snare', time: start + 2 * quarterMs + eighthMs });
            // Ride on every 8th
            for (let i = 0; i < 8; i += 1) {
                pattern.push({ name: 'RideCymbal', time: start + i * eighthMs });
            }
        }

        pattern.forEach(({ name, time }) => {
            const id = setTimeout(() => {
                createAndPlayEventIntance(`${Instruments.Drum}/${name}`);
            }, time);
            timeouts.current.push(id);
        });
    }, []);

    // ─── GUITAR ────────────────────────────────────────────────────────────────
    const playSmokeRiff = useCallback(() => {
        clearAll();
        const bpm = 110;
        const quarterMs = (60 / bpm) * 1000;
        const eighthMs = quarterMs / 2;

        // Very rough nod to the Smoke riff
        const pattern = [
            { name: 'E', time: 0 * eighthMs },
            { name: 'G', time: 1 * eighthMs },
            { name: 'A', time: 2 * eighthMs },
            { name: 'B', time: 4 * eighthMs },
            { name: 'A', time: 6 * eighthMs },
            { name: 'G', time: 7 * eighthMs },
            { name: 'E', time: 8 * eighthMs }
        ];

        pattern.forEach(({ name, time }) => {
            const id = setTimeout(() => {
                createAndPlayEventIntance(`${Instruments.Guitar}/${name}`);
            }, time);
            timeouts.current.push(id);
        });
    }, []);

    // ─── PIANO ─────────────────────────────────────────────────────────────────
    const playFurElise = useCallback(() => {
        clearAll();
        const bpm = 120;
        const quarterMs = 60000 / bpm;
        const eighthMs = quarterMs / 2;

        // The famous opening: E-D#-E-D#-E-B-D-C-A
        const pattern = [
            { name: 'pianoE', time: 0 * eighthMs },
            { name: 'pianoD#', time: 1 * eighthMs },
            { name: 'pianoE', time: 2 * eighthMs },
            { name: 'pianoD#', time: 3 * eighthMs },
            { name: 'pianoE', time: 4 * eighthMs },
            { name: 'pianoB', time: 6 * eighthMs },
            { name: 'pianoD', time: 8 * eighthMs },
            { name: 'pianoC', time: 10 * eighthMs },
            { name: 'pianoA', time: 12 * eighthMs }
        ];

        pattern.forEach(({ name, time }) => {
            const id = setTimeout(() => {
                createAndPlayEventIntance(`${Instruments.Piano}/${name}`);
            }, time);
            timeouts.current.push(id);
        });
    }, []);

    // cleanup on unmount
    useEffect(() => clearAll, []);

    return (
        <ButtonContainer>
            {/* Drums */}
            <button onClick={playSmokeOnTheWater}>Play “Smoke on the Water” Drum Beat</button>
            <button onClick={playNiceBeat}>Play 4-Bar Rock Drum Beat</button>

            {/* Guitar */}
            <button onClick={playSmokeRiff}>Play “Smoke” Guitar Riff</button>

            {/* Piano */}
            <button onClick={playFurElise}>Play Für Elise Opening</button>
        </ButtonContainer>
    );
};
