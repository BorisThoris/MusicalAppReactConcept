import { get } from 'lodash';
import { useCallback, useContext, useEffect, useState } from 'react';
import { playEventInstance } from '../fmodLogic/eventInstanceHelpers';
import InstrumentsNames from '../globalConstants/instrumentNames';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import usePlayback from './usePlayback';
import useStageWidthHook from './useStageWidth';

const useRecordingsPlayer = (instrumentName) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const playback = usePlayback();
    const { recordings } = useContext(InstrumentRecordingsContext);
    const { furthestEndTime } = useStageWidthHook({ recordings });

    const togglePlayback = useCallback(() => {
        setIsPlaying((prevIsPlaying) => {
            if (prevIsPlaying) {
                playback.clearAllTimeouts();
            }
            return !prevIsPlaying;
        });
    }, [playback]);

    const replayEvents = (instrument = instrumentName) => {
        const instrumentRecordings = get(recordings, instrument, []);
        let lastNoteStart = 0;
        let lastEndTime = 0;

        const lengthOfRecordings = instrumentRecordings.length - 1;
        if (lengthOfRecordings) {
            instrumentRecordings.forEach(
                ({ eventInstance, startTime }, index) => {
                    const delay = startTime;
                    lastNoteStart = delay;

                    const soundEndTime = playback.scheduleSoundPlayback({
                        delay,
                        playbackCallback: () => {
                            playEventInstance(eventInstance);
                        },
                    });

                    lastEndTime = Math.max(lastEndTime, soundEndTime);
                }
            );
        }

        return lastEndTime;
    };

    const replayAllEvents = () => {
        Object.values(InstrumentsNames).forEach((name) => {
            if (get(recordings, name)) {
                replayEvents(name);
            }
        });
    };

    const replayAllRecordedSounds = () => {
        togglePlayback();

        if (!isPlaying) {
            replayAllEvents();
        }
    };

    const playRecordedSounds = () => {
        togglePlayback();

        if (!isPlaying) {
            replayEvents();
        }
    };

    useEffect(() => {
        return playback.clearAllTimeouts;
    }, [playback]);

    useEffect(() => {
        let timeoutId;

        if (isPlaying) {
            timeoutId = setTimeout(() => {
                togglePlayback();
            }, furthestEndTime * 1000);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [furthestEndTime, isPlaying, togglePlayback]);

    return {
        isPlaying,
        playRecordedSounds,
        replayAllRecordedSounds,
    };
};

export default useRecordingsPlayer;
