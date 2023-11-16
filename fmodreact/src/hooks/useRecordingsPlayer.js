import { get } from 'lodash';
import { useCallback, useContext, useEffect, useState } from 'react';
import { playEventInstance } from '../fmodLogic/eventInstanceHelpers';
import InstrumentsNames from '../globalConstants/instrumentNames';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import usePlayback from './usePlayback';
import useStageWidthHook from './useStageWidth';

const useRecordingsPlayer = (instrumentName) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackerPosition, setTrackerPosition] = useState(0);
    const { recordings } = useContext(InstrumentRecordingsContext);
    const { furthestEndTime } = useStageWidthHook({ recordings });

    const { clearAllTimeouts, setNewTimeout } = usePlayback({
        playbackStatus: isPlaying,
        trackerPosition,
    });

    const togglePlayback = useCallback(() => {
        setIsPlaying((prevIsPlaying) => !prevIsPlaying);
        if (isPlaying) {
            clearAllTimeouts();
        }
    }, [isPlaying, clearAllTimeouts]);

    const stopPlayback = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const replayEvents = useCallback(
        (instrument = instrumentName) => {
            const instrumentRecordings = get(recordings, instrument, []);
            let lastEndTime = 0;

            instrumentRecordings.forEach(({ eventInstance, startTime }) => {
                if (startTime > trackerPosition / pixelToSecondRatio) {
                    setNewTimeout(
                        () => playEventInstance(eventInstance),
                        startTime - trackerPosition / pixelToSecondRatio
                    );
                }

                lastEndTime = Math.max(lastEndTime, startTime);
            });

            return lastEndTime;
        },
        [instrumentName, recordings, trackerPosition, setNewTimeout]
    );

    const replayAllRecordedSounds = useCallback(() => {
        togglePlayback();

        if (!isPlaying) {
            const instrumentsWithRecordings = Object.values(
                InstrumentsNames
            ).filter((name) => get(recordings, name));

            instrumentsWithRecordings.forEach(replayEvents);
        }
    }, [isPlaying, togglePlayback, recordings, replayEvents]);

    useEffect(() => {
        if (isPlaying) {
            const timeoutId = setTimeout(
                togglePlayback,
                furthestEndTime * 1000
            );

            return () => clearTimeout(timeoutId);
        }
    }, [furthestEndTime, isPlaying, togglePlayback]);

    return {
        isPlaying,
        playRecordedSounds: togglePlayback,
        replayAllRecordedSounds,
        setTrackerPosition,
        stopPlayback,
        trackerPosition,
    };
};

export default useRecordingsPlayer;
