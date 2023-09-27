import { playEventInstance } from '../../fmodLogic';
import { GUITAR_CONFIG } from './useGuitarDrawing';

export const createSvgElement = (elementName) =>
  document.createElementNS('http://www.w3.org/2000/svg', elementName);

export const calculateGuitarDimensions = ({ svgElement }) => {
  const { NECK_OFFSET, STRING_WIDTH_PERCENT, STRINGS, STRING_START_X_OFFSET, STRING_END_Y_OFFSET } =
    GUITAR_CONFIG;

  const { width: svgWidth, height: svgHeight } = svgElement.getBoundingClientRect();

  const neckWidth = svgWidth - NECK_OFFSET;
  const stringWidth = neckWidth * STRING_WIDTH_PERCENT;
  const totalSpaceWidth = neckWidth - STRINGS.length * stringWidth;
  const spaceWidth = totalSpaceWidth / (STRINGS.length - 1);
  const startX = STRING_START_X_OFFSET;
  const endY = svgHeight - STRING_END_Y_OFFSET;

  return {
    neckWidth,
    stringWidth,
    totalSpaceWidth,
    spaceWidth,
    startX,
    endY,
  };
};

const calculateWaveOffset = (i) => {
  const { WAVE_HEIGHT } = GUITAR_CONFIG;
  return i % 2 === 0 ? WAVE_HEIGHT : -WAVE_HEIGHT;
};

export const drawWavePath = ({ startX, startY, endX, endY }) => {
  const { TOTAL_WAVES } = GUITAR_CONFIG;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  let pathData = `M${startX},${startY} `;

  for (let i = 0; i <= TOTAL_WAVES; i++) {
    const currentX = startX + (deltaX / TOTAL_WAVES) * i;
    const currentY = startY + (deltaY / TOTAL_WAVES) * i;
    const waveOffset = calculateWaveOffset(i);
    pathData += `Q${currentX + waveOffset},${currentY + waveOffset} ${currentX},${currentY} `;
  }

  return pathData;
};

export const createString = (svgElement, { startX, startY, endX, endY, waveHeight, note }) => {
  const pathElement = createSvgElement('path');
  const pathData = drawWavePath({
    startX,
    startY,
    endX,
    endY,
    waveHeight,
  });

  pathElement.setAttribute('d', pathData);
  pathElement.setAttribute('fill', 'none');
  pathElement.setAttribute('stroke', 'gray');
  pathElement.setAttribute('stroke-width', '2%');

  pathElement.addEventListener('click', (e) => {
    console.log(e);
    playEventInstance(`Guitar/${note}`);
  });
  pathElement.addEventListener('touchstart', () => {
    playEventInstance(`Guitar/${note}`);
  });

  svgElement.appendChild(pathElement);
};
