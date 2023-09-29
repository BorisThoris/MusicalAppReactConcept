import { useCallback, useEffect, useState } from 'react';
import { playEventInstance } from '../fmodLogic';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
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

  const replayEvents = () => {
    playRecordedSounds(playedSounds);
  };

  const playEvent = (musicalEvent) => {
    if (shouldRecord) {
      const sound = createSound(musicalEvent, instrumentName, getElapsedTime(startTime));

      setPlayedSounds([...playedSounds, sound]);
      setPlayedSounds([...playedSounds, sound]);
    }

    playEventInstance(musicalEvent);
  };

  useEffect(() => {
    const checkRecordingTimeout = () => {
      if (shouldRecord && !isRecordingTimeout) {
        const elapsedTime = getElapsedTime(startTime);

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
    replayEvents,
    shouldRecord,
    toggleRecording,
  };
};

export default useMusicalInstrument;
