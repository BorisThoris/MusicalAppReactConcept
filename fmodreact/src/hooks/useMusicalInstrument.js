import { useCallback, useEffect, useState } from 'react';
import { playEventInstance } from '../fmodLogic';
import useRecordingPlayer from './useRecordingPlayer';

const RECORDING_TIME_LIMIT_SECONDS = 120.0;

const useMusicalInstrument = (instrumentName) => {
  const [playedSounds, setPlayedSounds] = useState([]);
  const [isRecordingTimeout, setIsRecordingTimeout] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [shouldRecord, setShouldRecord] = useState(false);

  const { playRecordedSounds } = useRecordingPlayer(instrumentName);

  const toggleRecording = useCallback(() => {
    setShouldRecord(!shouldRecord);

    if (!shouldRecord) {
      setStartTime(Date.now());
      setPlayedSounds([]);
    }
  }, [shouldRecord]);

  const deleteSound = (sound) => {
    setPlayedSounds(playedSounds.filter((playedSound) => playedSound !== sound));
  };

  const recordEvent = (musicalEvent) => {
    if (shouldRecord) {
      const sound = {
        eventName: musicalEvent,
        instrumentName,
        time: (Date.now() - startTime) / 1000,
      };
      setPlayedSounds([...playedSounds, sound]);
    }
  };

  const replayEvents = () => {
    playRecordedSounds(playedSounds);
  };

  const playEvent = (musicalEvent) => {
    playEventInstance(musicalEvent);
  };

  useEffect(() => {
    const checkRecordingTimeout = () => {
      if (shouldRecord && !isRecordingTimeout) {
        const elapsedTime = (Date.now() - startTime) / 1000;
        if (elapsedTime >= RECORDING_TIME_LIMIT_SECONDS) {
          toggleRecording();
          setIsRecordingTimeout(true);
        }
      }
    };

    const intervalId = setInterval(checkRecordingTimeout, 1000);

    return () => clearInterval(intervalId);
  }, [shouldRecord, isRecordingTimeout, startTime, toggleRecording]);

  return {
    deleteSound,
    instrumentName,
    playedSounds,
    playEvent,
    recordEvent,
    replayEvents,
    shouldRecord,
    toggleRecording,
  };
};

export default useMusicalInstrument;
