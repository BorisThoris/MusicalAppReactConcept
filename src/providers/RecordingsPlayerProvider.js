import React, { useCallback, useContext, useMemo, useState } from 'react';

export const RecordingsPlayerContext = React.createContext(null);

export const useRecordingPlayerContext = () => useContext(RecordingsPlayerContext);

export const RecordingsPlayerProvider = ({ children }) => {
    const [playbackStatus, setPlaybackStatus] = useState({
        currentInstrument: null,
        isPlaying: false
    });
    const [trackerPosition, setTrackerPosition] = useState(-0.1);
    const [mutedInstruments, setMutedInstruments] = useState([]);

    const toggleMute = useCallback((instrumentName) => {
        setMutedInstruments((prevMutedInstruments) =>
            prevMutedInstruments.includes(instrumentName)
                ? prevMutedInstruments.filter((instr) => instr !== instrumentName)
                : [...prevMutedInstruments, instrumentName]
        );
    }, []);

    const changePlaybackStatus = useCallback(
        (isPlaying, currentInstrument = playbackStatus.currentInstrument) => {
            setPlaybackStatus({ currentInstrument, isPlaying });
        },
        [playbackStatus.currentInstrument]
    );

    const togglePlayback = useCallback(() => {
        changePlaybackStatus(!playbackStatus.isPlaying);
    }, [playbackStatus.isPlaying, changePlaybackStatus]);

    const playAllOrSpecificInstrumentRecordings = useCallback(
        (instrumentName = null) => {
            // If it's already playing, stop the playback
            if (playbackStatus.isPlaying && playbackStatus.currentInstrument === instrumentName) {
                setPlaybackStatus({
                    currentInstrument: null,
                    isPlaying: false
                });

                return;
            }

            // Otherwise, start playback
            const shouldPlay =
                !playbackStatus.isPlaying && (!instrumentName || !mutedInstruments.includes(instrumentName));

            if (shouldPlay) {
                setPlaybackStatus({
                    currentInstrument: instrumentName,
                    isPlaying: true
                });
            }
        },
        [playbackStatus.isPlaying, playbackStatus.currentInstrument, mutedInstruments]
    );

    const value = useMemo(() => {
        return {
            changePlaybackStatus,
            mutedInstruments,
            playbackStatus,
            playRecordedSounds: togglePlayback,
            replayAllRecordedSounds: playAllOrSpecificInstrumentRecordings,
            replayInstrumentRecordings: playAllOrSpecificInstrumentRecordings,
            setTrackerPosition,
            toggleMute,
            trackerPosition
        };
    }, [
        mutedInstruments,
        playAllOrSpecificInstrumentRecordings,
        playbackStatus,
        toggleMute,
        togglePlayback,
        trackerPosition,
        changePlaybackStatus
    ]);

    return <RecordingsPlayerContext.Provider value={value}>{children}</RecordingsPlayerContext.Provider>;
};
