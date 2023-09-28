import React, { useCallback, useEffect, useState } from 'react';
import { playEventInstance } from '../../fmodLogic';

const Tambourine = () => {
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [wasPositive, setWasPositive] = useState(false);

  const handleMotion = useCallback(
    (event) => {
      const xAccel = event.rotationRate.beta * 10;
      if (soundPlayed) {
        if (xAccel < -3 && wasPositive) {
          setSoundPlayed(false);
        }
        if (xAccel > 3 && !wasPositive) {
          setSoundPlayed(false);
        }
      } else if (xAccel > 15 && !soundPlayed) {
        playEventInstance('Guitar/E'); // Assuming this is the tambourine sound.
        setSoundPlayed(true);
        setWasPositive(true);
      }
    },
    [soundPlayed, wasPositive],
  );

  useEffect(() => {
    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion, soundPlayed, wasPositive]);

  return (
      <div>
          <button
              onClick={() => {
                playEventInstance('Guitar/E'); // Assuming this is the tambourine sound.
              }}
          >
              Play Tambourine Sound
          </button>
      </div>
  );
};

export default Tambourine;
