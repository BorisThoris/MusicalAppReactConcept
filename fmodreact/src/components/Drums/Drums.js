import React from 'react';
import styled from 'styled-components';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import useRecordingsPlayer from '../../hooks/useRecordingsPlayer';
import Drum from './Drum';

const DrumSetContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

const drums = ['CrashCymbal', 'FloorTom', 'RideCymbal', 'Snare', 'SnareDrum', 'Tom1'];

const Drums = () => {
  const instrumentName = Instruments.Drum;
  const { playRecordedSounds } = useRecordingsPlayer(instrumentName);
  const { recordEvent, toggleRecording } = useRecorder({ instrumentName });

  return (
      <DrumSetContainer>
          <button onClick={toggleRecording}>Toggle Recording</button>
          <button onClick={playRecordedSounds}>Replay Events</button>
          {drums.map((key, index) => (
              <Drum key={index} name={key} instrumentName={instrumentName} recordEvent={recordEvent} />
          ))}
      </DrumSetContainer>
  );
};

export default Drums;
