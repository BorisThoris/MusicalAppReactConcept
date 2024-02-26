import GUITAR_CONFIG from '../guitarConfig'

const calculateGuitarDimensions = ({ svgElement }) => {
  // eslint-disable-next-line max-len
  const {
    NECK_OFFSET,
    STRING_END_Y_OFFSET,
    STRING_START_X_OFFSET,
    STRING_WIDTH_PERCENT,
    STRINGS,
  } = GUITAR_CONFIG

  const { height: svgHeight, width: svgWidth } =
    svgElement.getBoundingClientRect()

  const neckWidth = svgWidth - NECK_OFFSET
  const stringWidth = neckWidth * STRING_WIDTH_PERCENT
  const totalSpaceWidth = neckWidth - STRINGS.length * stringWidth
  const spaceWidth = totalSpaceWidth / (STRINGS.length - 1)
  const startX = STRING_START_X_OFFSET
  const endY = svgHeight - STRING_END_Y_OFFSET

  return {
    endY,
    neckWidth,
    spaceWidth,
    startX,
    stringWidth,
    totalSpaceWidth,
  }
}

export default calculateGuitarDimensions
