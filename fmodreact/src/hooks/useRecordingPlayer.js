import { useContext, useEffect, useRef, useState } from 'react';
import { playEventInstance } from '../fmodLogic';
import { RecordedInstrumentsContext } from '../providers/InstrumentsProvider';

const useRecordingPlayer = (instrumentName) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const instruments = useContext(RecordedInstrumentsContext);
  const timeoutIds = useRef([]);

  const clearAllTimeouts = () => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  };

  const scheduleSoundPlayback = (sound, delay) => {
    console.log(delay);

    const timeoutId = setTimeout(() => {
      console.log(sound);
      playEventInstance(sound.musicalEvent);
    }, delay);

    timeoutIds.current.push(timeoutId);
    return sound.time + sound.length;
  };

  const replayEvents = (playedSounds, startTrackerUpdates = null) => {
    let previousNoteStart = 0;
    let biggestEndTime = 0;

    playedSounds.forEach((sound) => {
      if (sound.instrumentName === instrumentName) {
        const delay = sound.time - previousNoteStart;
        previousNoteStart = sound.time;

        const soundEndTime = scheduleSoundPlayback(sound, delay);
        biggestEndTime = Math.max(biggestEndTime, soundEndTime);
      }
    });

    const finalTimeoutId = setTimeout(() => {
      setIsPlaying(false);
      startTrackerUpdates?.();
      clearAllTimeouts();
    }, biggestEndTime * 1000);

    timeoutIds.current.push(finalTimeoutId);
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

  const playRecordedSounds = (playedSounds) => {
    handlePlaybackToggle();
    if (!isPlaying) {
      replayEvents(playedSounds);
    }
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  return {
    isPlaying,
    playRecordedSounds,
    replayAllRecordedSounds,
  };
};

export default useRecordingPlayer;
