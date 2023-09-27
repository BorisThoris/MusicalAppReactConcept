import React, { useRef } from 'react';
import styled from 'styled-components';
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

const Guitar = () => {
  const guitarSvgRef = useRef(null);

  useGuitarDrawing(guitarSvgRef);

  return (
    <StyledGuitarSvg ref={guitarSvgRef} xmlns="http://www.w3.org/2000/svg">
      <StyledGuitarNeck />
    </StyledGuitarSvg>
  );
};

export default Guitar;
