import { useCallback, useEffect } from 'react';

import useWindowDimensions from '../../hooks/useWindowDimensions';
import { calculateGuitarDimensions, createString } from './guitarHelpers';

export const GUITAR_CONFIG = {
  STRINGS: ['A', 'B', 'D', 'E', 'G'],
  STRING_WIDTH_PERCENT: 0.2,
  NECK_OFFSET: 260,
  STRING_START_X_OFFSET: 135,
  STRING_START_Y: 50,
  STRING_END_Y_OFFSET: 50,
  TOTAL_WAVES: 20,
  WAVE_HEIGHT: 2,
};

const cleanUpSvg = (guitarSvgRef) => {
  const children = guitarSvgRef.current.children;
  while (children.length > 5) {
    guitarSvgRef.current.removeChild(children[1]);
  }
};

export const useGuitarDrawing = (guitarSvgRef) => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const renderGuitar = useCallback(() => {
    const svgElement = guitarSvgRef.current;
    const dimensions = calculateGuitarDimensions({
      svgElement,
    });

    for (let stringIndex in GUITAR_CONFIG.STRINGS) {
      const stringOffset = dimensions.stringWidth + dimensions.spaceWidth;
      const startY = screenHeight * 0.01;
      const endY = screenHeight * 0.9;
      const startX = dimensions.startX + stringIndex * stringOffset;
      const endX = startX;

      const strokeWidth = `${screenWidth * 0.002}%`;

      cleanUpSvg(guitarSvgRef);

      createString(svgElement, {
        startX,
        startY,
        endX,
        endY,
        strokeWidth,
        note: GUITAR_CONFIG.STRINGS[stringIndex],
      });
    }
  }, [guitarSvgRef, screenHeight, screenWidth]);

  useEffect(() => {
    renderGuitar();
  }, [renderGuitar]);
};
