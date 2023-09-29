import { useEffect, useRef } from 'react';
import { playEventInstance } from '../fmodLogic';
import scheduleSoundPlayback from '../globalHelpers/scheduleSoundPlayback';

const usePlayback = () => {
  const timeoutIds = useRef([]);

  const clearAllTimeouts = () => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  return {
    clearAllTimeouts,
    scheduleSoundPlayback: (sound, delay) => scheduleSoundPlayback(sound, delay, playEventInstance),
  };
};

export default usePlayback;
