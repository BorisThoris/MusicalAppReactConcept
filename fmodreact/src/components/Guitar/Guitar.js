import React, { useRef } from 'react';
import styled from 'styled-components';
import { playEventInstance } from '../../fmodLogic';
import useRecorder from '../../hooks/useRecorder';
import useRecordingPlayer from '../../hooks/useRecordingPlayer';
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

const instrumentName = 'Guitar';
const Guitar = () => {
  const { playRecordedSounds } = useRecordingPlayer(instrumentName);
  const { recordEvent, toggleRecording } = useRecorder();

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
