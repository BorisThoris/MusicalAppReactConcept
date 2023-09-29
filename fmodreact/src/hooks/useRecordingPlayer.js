import {
  useContext, useEffect, useState,
} from 'react';
import { RecordedInstrumentsContext } from '../providers/InstrumentsProvider';
import usePlayback from './usePlayback';

const useRecordingPlayer = (instrumentName) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { clearAllTimeouts, scheduleSoundPlayback } = usePlayback();
  const { instruments } = useContext(RecordedInstrumentsContext);

  const replayEvents = () => {
    let previousNoteStart = 0;
    let biggestEndTime = 0;

    Object.keys(instruments).forEach((instrument) => {
      const arrayOfSounds = instruments[instrument];

      arrayOfSounds.forEach((sound) => {
        const delay = sound.time - previousNoteStart;
        previousNoteStart = sound.time;

        const soundEndTime = scheduleSoundPlayback(sound, delay);
        biggestEndTime = Math.max(biggestEndTime, soundEndTime);
      });
    });

    // const finalTimeoutId = setTimeout(() => {
    //   setIsPlaying(false);
    //   startTrackerUpdates?.();
    //   clearAllTimeouts();
    // }, biggestEndTime * 1000);

    // timeoutIds.current.push(finalTimeoutId);
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
      const allSounds = instruments.getAllRecordedSounds();
      replayEvents(allSounds, null);
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

export default useRecordingPlayer;
