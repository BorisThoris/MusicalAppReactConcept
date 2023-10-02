import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { RecordedInstrumentsContext } from '../providers/InstrumentsProvider';

const RECORDING_TIME_LIMIT_SECONDS = 120.0;

const useRecorder = ({ instrumentName }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const {
    instruments, resetInstrumentStorageState, setInstruments,
  } = useContext(RecordedInstrumentsContext);

  const toggleRecording = useCallback(() => {
    setIsRecording((prevIsRecording) => !prevIsRecording);

    if (!isRecording) {
      setStartTime(Date.now());
      resetInstrumentStorageState(instrumentName); // Reset the instruments state
    }
  }, [instrumentName, isRecording, resetInstrumentStorageState]);

  const recordEvent = (event, currentInstrumentName) => {
    if (isRecording) {
      const elapsedTime = getElapsedTime(startTime);
      const sound = createSound(event, currentInstrumentName, elapsedTime);

      setInstruments((prevInstruments) => {
        const existingSounds = prevInstruments[currentInstrumentName] || [];
        const updatedSounds = [...existingSounds, sound];
        return { ...prevInstruments, [currentInstrumentName]: updatedSounds };
      });
    }
  };

  //   const deleteRecordedSoundInstance = (sound) => {
  //     addInstrument((prevInstruments) => {
  //       const updatedInstruments = { ...prevInstruments };
  //       updatedInstruments[sound.instrument].sounds = updatedInstruments[sound.instrument].sounds.filter(
  //         (playedSound) => playedSound !== sound,
  //       );
  //       return updatedInstruments;
  //     });
  //   };

  useEffect(() => {
    const checkRecordingTimeout = () => {
      if (isRecording) {
        const elapsedTime = getElapsedTime(startTime);

        if (elapsedTime >= RECORDING_TIME_LIMIT_SECONDS) {
          toggleRecording();
        }
      }
    };

    const intervalId = setInterval(checkRecordingTimeout, 1000);
    return () => clearInterval(intervalId);
  }, [isRecording, startTime, toggleRecording]);

  return {
    instruments,
    isRecording,
    recordEvent, // Return instruments instead of recordings
    toggleRecording,
  };
};

export default useRecorder;
