import GUITAR_CONFIG from "../guitarConfig";

const createSvgElement = (elementName) =>
  document.createElementNS("http://www.w3.org/2000/svg", elementName);

const calculateWaveOffset = (i) => {
  const { WAVE_HEIGHT } = GUITAR_CONFIG;
  return i % 2 === 0 ? WAVE_HEIGHT : -WAVE_HEIGHT;
};

const drawWavePath = ({ endX, endY, startX, startY }) => {
  const { TOTAL_WAVES } = GUITAR_CONFIG;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  let pathData = `M${startX},${startY} `;

  for (let i = 0; i <= TOTAL_WAVES; i += 1) {
    const currentX = startX + (deltaX / TOTAL_WAVES) * i;
    const currentY = startY + (deltaY / TOTAL_WAVES) * i;
    const waveOffset = calculateWaveOffset(i);
    pathData += `Q${currentX + waveOffset},${
      currentY + waveOffset
    } ${currentX},${currentY} `;
  }

  return pathData;
};

const createString = (
  svgElement,
  { endX, endY, handlePlayEvent, note, startX, startY, waveHeight },
) => {
  const pathElement = createSvgElement("path");
  const pathData = drawWavePath({
    endX,
    endY,
    startX,
    startY,
    waveHeight,
  });

  pathElement.setAttribute("d", pathData);
  pathElement.setAttribute("fill", "none");
  pathElement.setAttribute("stroke", "gray");
  pathElement.setAttribute("stroke-width", "2%");

  pathElement.addEventListener("click", () => {
    handlePlayEvent(`Guitar/${note}`);
  });

  pathElement.addEventListener("touchstart", () => {
    handlePlayEvent(`Guitar/${note}`);
  });

  svgElement.appendChild(pathElement);
};

export default createString;
