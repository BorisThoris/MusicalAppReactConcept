import React from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import useRecordingsPlayer from '../../hooks/useRecordingsPlayer';
import PianoKey from './PianoKey';

const PianoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const pianoKeys = [
  'pianoC',
  'pianoC#',
  'pianoD',
  'pianoD#',
  'pianoE',
  'pianoF',
  'pianoF#',
  'pianoG',
  'pianoG#',
  'pianoA',
  'pianoA#',
  'pianoB',
];

const Piano = () => {
  const instrumentName = Instruments.Piano;
  const { playRecordedSounds } = useRecordingsPlayer(instrumentName);
  const { recordEvent, toggleRecording } = useRecorder({ instrumentName });

  const playEvent = (musicalEvent) => {
    const eventInstance = createAndPlayEventIntance(musicalEvent);

    recordEvent(eventInstance, instrumentName);
  };

  return (
      <PianoContainer>
          <button onClick={toggleRecording}>Toggle Recording</button>
          <button onClick={playRecordedSounds}>Replay Events</button>
          {pianoKeys.map((key, index) => (
              <PianoKey key={index} keyName={key} instrumentName={Instruments.Piano} playEvent={playEvent} />
          ))}
      </PianoContainer>
  );
};

export default Piano;
