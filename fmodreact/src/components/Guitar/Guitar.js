import React, { useRef } from 'react';
import styled from 'styled-components';
import useMusicalInstrument from '../../hooks/useMusicalInstrument';
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
  const { playEvent, recordEvent, replayEvents, toggleRecording } = useMusicalInstrument('Guitar');

  const guitarSvgRef = useRef(null);

  const handlePlayEvent = (musicalEvent) => {
    recordEvent(musicalEvent);
    playEvent(musicalEvent);
  };

  useGuitarDrawing(guitarSvgRef, handlePlayEvent);

  return (
      <Wrapper>
          <button onClick={toggleRecording}>Toggle Recording</button>
          <button onClick={replayEvents}>Replay Events</button>

          <StyledGuitarSvg ref={guitarSvgRef} xmlns="http://www.w3.org/2000/svg">
              <StyledGuitarNeck />
          </StyledGuitarSvg>
      </Wrapper>
  );
};

export default Guitar;
