import { useContext, useEffect, useState } from 'react';
import { playEventInstance } from '../fmodLogic';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import usePlayback from './usePlayback';

const useRecordingsPlayer = (instrumentName) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const { clearAllTimeouts, scheduleSoundPlayback } = usePlayback();
    const { recordings } = useContext(InstrumentRecordingsContext);

    const replayEvents = () => {
        let previousNoteStart = 0;
        let biggestEndTime = 0;

        recordings[instrumentName].forEach(({ eventInstance, startTime }) => {
            const delay = startTime - previousNoteStart;
            previousNoteStart = startTime;

            const soundEndTime = scheduleSoundPlayback({
                delay,
                playbackCallback: () => playEventInstance(eventInstance),
            });

            biggestEndTime = Math.max(biggestEndTime, soundEndTime);
        });
    };

    const handlePlaybackToggle = (startTrackerUpdates) => {
        setIsPlaying((prevIsPlaying) => !prevIsPlaying);
        if (!isPlaying) {
            startTrackerUpdates?.();
        } else {
            clearAllTimeouts();
            startTrackerUpdates?.();
        }
    };

    const replayAllRecordedSounds = (startTrackerUpdates) => {
        handlePlaybackToggle(startTrackerUpdates);

        if (!isPlaying) {
            const allSounds = recordings.getAllRecordedSounds();
            replayEvents();
        }
    };

    const playRecordedSounds = () => {
        handlePlaybackToggle();

        if (!isPlaying) {
            replayEvents();
        }
    };

    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, [clearAllTimeouts]);

    return {
        isPlaying,
        playRecordedSounds,
        replayAllRecordedSounds,
    };
};

export default useRecordingsPlayer;
