import React, { useRef } from 'react';
import styled from 'styled-components';
import { playEventInstance } from '../../fmodLogic';
import Instruments from '../../globalConstants/instrumentNames';
import useRecorder from '../../hooks/useRecorder';
import useRecordingsPlayer from '../../hooks/useRecordingsPlayer';
import { useGuitarDrawing } from './useGuitarDrawing';

const StyledGuitarSvg = styled.svg`
  width: 90vw;
  height: 90vh;
  background: yellow;
`;

const StyledGuitarNeck = styled.rect`
  x: 130;
  y: 50;
  width: 100%;
  height: 100%;
  fill: green;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: collumn;
`;

const Guitar = () => {
  const instrumentName = Instruments.Guitar;
  const { playRecordedSounds } = useRecordingsPlayer(instrumentName);
  const { recordEvent, toggleRecording } = useRecorder(instrumentName);

  const playEvent = (musicalEvent) => {
    recordEvent(musicalEvent, instrumentName);
    playEventInstance(musicalEvent);
  };

  const handlePlayEvent = (musicalEvent) => {
    playEvent(musicalEvent);
  };

  const guitarSvgRef = useRef(null);

  useGuitarDrawing(guitarSvgRef, handlePlayEvent);

  return (
      <Wrapper>
          <button onClick={toggleRecording}>Toggle Recording</button>
          <button onClick={playRecordedSounds}>Replay Events</button>

          <StyledGuitarSvg ref={guitarSvgRef} xmlns="http://www.w3.org/2000/svg">
              <StyledGuitarNeck />
          </StyledGuitarSvg>
      </Wrapper>
  );
};

export default Guitar;
