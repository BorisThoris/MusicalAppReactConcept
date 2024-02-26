import { useCallback, useContext, useEffect, useState } from "react";
import { playEventInstance } from "../fmodLogic/eventInstanceHelpers";
import pixelToSecondRatio from "../globalConstants/pixelToSeconds";
import { InstrumentRecordingsContext } from "../providers/InstrumentsProvider";
import usePlayback from "./usePlayback";

const useRecordingsPlayer = ({ furthestEndTime, furthestEndTimes }) => {
  const [playbackStatus, setPlaybackStatus] = useState({
    currentInstrument: null,
    isPlaying: false,
  });
  const [trackerPosition, setTrackerPosition] = useState(-0.1);
  const [mutedInstruments, setMutedInstruments] = useState([]);
  const { overlapGroups } = useContext(InstrumentRecordingsContext);
  const { clearAllTimeouts, setNewTimeout } = usePlayback({
    playbackStatus: playbackStatus.isPlaying,
  });

  const toggleMute = useCallback((instrumentName) => {
    setMutedInstruments((prevMutedInstruments) =>
      prevMutedInstruments.includes(instrumentName)
        ? prevMutedInstruments.filter((instr) => instr !== instrumentName)
        : [...prevMutedInstruments, instrumentName],
    );
  }, []);

  const changePlaybackStatus = useCallback(
    (isPlaying, currentInstrument = playbackStatus.currentInstrument) => {
      setPlaybackStatus({ currentInstrument, isPlaying });
      if (!isPlaying) clearAllTimeouts();
    },
    [clearAllTimeouts, playbackStatus.currentInstrument],
  );

  const togglePlayback = useCallback(() => {
    changePlaybackStatus(!playbackStatus.isPlaying);
  }, [playbackStatus.isPlaying, changePlaybackStatus]);

  const stopPlayback = useCallback(() => {
    changePlaybackStatus(false, null);
  }, [changePlaybackStatus]);

  const flattenRecordings = useCallback((recordings) => {
    return recordings
      .reduce((acc, recording) => {
        acc.push(recording);
        if (recording.events && recording.events.length) {
          acc.push(...flattenRecordings(recording.events));
        }
        return acc;
      }, [])
      .filter((rec) => !rec.events);
  }, []);

  const playInstrumentRecording = useCallback(
    (instrument) => {
      const instrumentRecordings = flattenRecordings(
        overlapGroups[instrument] || [],
      );
      instrumentRecordings.forEach(({ eventInstance, startTime }) => {
        if (startTime > trackerPosition / pixelToSecondRatio) {
          setNewTimeout(
            () => playEventInstance(eventInstance),
            startTime - trackerPosition / pixelToSecondRatio,
          );
        }
      });
    },
    [overlapGroups, trackerPosition, setNewTimeout, flattenRecordings],
  );

  const playAllOrSpecificInstrumentRecordings = useCallback(
    (instrumentName = null) => {
      togglePlayback();

      const shouldPlay =
        !playbackStatus.isPlaying &&
        (!instrumentName || !mutedInstruments.includes(instrumentName));

      if (shouldPlay) {
        setPlaybackStatus({
          currentInstrument: instrumentName,
          isPlaying: true,
        });

        const groupsToPlay = instrumentName
          ? [instrumentName]
          : Object.keys(overlapGroups).filter(
              (grpName) => !mutedInstruments.includes(grpName),
            );

        groupsToPlay.forEach(playInstrumentRecording);
      }
    },
    [
      togglePlayback,
      playbackStatus.isPlaying,
      mutedInstruments,
      overlapGroups,
      playInstrumentRecording,
    ],
  );

  useEffect(() => {
    if (playbackStatus.isPlaying) {
      const currentInstrumentEndTime =
        furthestEndTimes[playbackStatus.currentInstrument] || furthestEndTime;
      const timeoutAmount =
        currentInstrumentEndTime * 1000 -
        (trackerPosition / pixelToSecondRatio) * 1000;
      const timeoutId = setTimeout(
        () => changePlaybackStatus(false),
        timeoutAmount,
      );
      return () => clearTimeout(timeoutId);
    }
  }, [
    furthestEndTime,
    furthestEndTimes,
    playbackStatus,
    trackerPosition,
    changePlaybackStatus,
  ]);

  return {
    mutedInstruments,
    playbackStatus,
    playRecordedSounds: togglePlayback,
    replayAllRecordedSounds: () => playAllOrSpecificInstrumentRecordings(),
    replayInstrumentRecordings: playAllOrSpecificInstrumentRecordings,
    setTrackerPosition,
    stopPlayback,
    toggleMute,
    trackerPosition,
  };
};

export default useRecordingsPlayer;
