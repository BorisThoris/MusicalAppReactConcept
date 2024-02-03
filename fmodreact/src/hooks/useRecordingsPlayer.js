import { useCallback, useContext, useEffect, useState } from 'react';
import { playEventInstance } from '../fmodLogic/eventInstanceHelpers';
import InstrumentsNames from '../globalConstants/instrumentNames';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import usePlayback from './usePlayback';

const useRecordingsPlayer = ({ furthestEndTime, furthestEndTimes }) => {
    const [playbackStatus, setPlaybackStatus] = useState({
        currentInstrument: false,
        isPlaying: false
    });

    const [trackerPosition, setTrackerPosition] = useState(-0.1);
    const [mutedInstruments, setMutedInstruments] = useState([]);
    const { recordings } = useContext(InstrumentRecordingsContext);

    const { clearAllTimeouts, setNewTimeout } = usePlayback({
        playbackStatus: playbackStatus.isPlaying
    });

    const toggleMute = useCallback((instrumentName) => {
        setMutedInstruments((currentMutedInstruments) => {
            if (currentMutedInstruments.includes(instrumentName)) {
                return currentMutedInstruments.filter((instr) => instr !== instrumentName);
            }
            return [...currentMutedInstruments, instrumentName];
        });
    }, []);

    const togglePlayback = useCallback(() => {
        setPlaybackStatus((prevStatus) => ({
            ...prevStatus,
            currentInstrument: prevStatus.isPlaying ? false : prevStatus.currentInstrument,
            isPlaying: !prevStatus.isPlaying
        }));

        if (playbackStatus.isPlaying) {
            clearAllTimeouts();
        }
    }, [playbackStatus.isPlaying, clearAllTimeouts]);

    const stopPlayback = useCallback(() => {
        setPlaybackStatus({ currentInstrument: false, isPlaying: false });
        clearAllTimeouts();
    }, [clearAllTimeouts]);

    const playInstrumentRecording = useCallback(
        (instrument) => {
            if (mutedInstruments.includes(instrument)) {
                return;
            }

            setPlaybackStatus({
                currentInstrument: instrument,
                isPlaying: true
            });

            const flattenRecordings = (passedRec) => {
                return passedRec
                    .reduce((acc, recording) => {
                        acc.push(recording);
                        if (recording.events && recording.events.length) {
                            acc.push(...flattenRecordings(recording.events));
                        }
                        return acc;
                    }, [])
                    .filter((rec) => !rec.events);
            };

            const instrumentRecordings = flattenRecordings(recordings[instrument] || []);

            console.log(instrumentRecordings);

            instrumentRecordings.forEach(({ eventInstance, startTime }) => {
                if (startTime > trackerPosition / pixelToSecondRatio) {
                    setNewTimeout(
                        () => playEventInstance(eventInstance),
                        startTime - trackerPosition / pixelToSecondRatio
                    );
                }
            });
        },
        [mutedInstruments, recordings, trackerPosition, setNewTimeout]
    );

    const replayAllRecordedSounds = useCallback(() => {
        togglePlayback();

        if (!playbackStatus.isPlaying) {
            Object.values(InstrumentsNames).forEach(playInstrumentRecording);
        }
    }, [playbackStatus.isPlaying, togglePlayback, playInstrumentRecording]);

    const replayInstrumentRecordings = useCallback(
        (instrumentName) => {
            togglePlayback();

            if (!playbackStatus.isPlaying) {
                playInstrumentRecording(instrumentName);
            }
        },
        [playbackStatus.isPlaying, togglePlayback, playInstrumentRecording]
    );

    useEffect(() => {
        if (playbackStatus.isPlaying) {
            const instrumentEndTime = furthestEndTimes[playbackStatus.currentInstrument];

            const currentInstrumentEndTime = instrumentEndTime || furthestEndTime;

            const timeoutAmount = currentInstrumentEndTime * 1000 - (trackerPosition / pixelToSecondRatio) * 1000;

            const timeoutId = setTimeout(togglePlayback, timeoutAmount);

            return () => clearTimeout(timeoutId);
        }
    }, [
        furthestEndTime,
        furthestEndTimes,
        playbackStatus.currentInstrument,
        playbackStatus.isPlaying,
        togglePlayback,
        trackerPosition
    ]);

    return {
        mutedInstruments,
        playbackStatus,
        playRecordedSounds: togglePlayback,
        replayAllRecordedSounds,
        replayInstrumentRecordings,
        setTrackerPosition,
        stopPlayback,
        toggleMute,
        trackerPosition
    };
};

export default useRecordingsPlayer;
