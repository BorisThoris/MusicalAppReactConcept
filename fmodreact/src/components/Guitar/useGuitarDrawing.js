import { useCallback, useEffect } from 'react'
import useWindowDimensions from '../../hooks/useWindowDimensions'
import GUITAR_CONFIG from './guitarConfig'
import calculateGuitarDimensions from './helpers/calculateGuitarDimensions'
import createString from './helpers/createString'

const cleanUpSvg = guitarSvgRef => {
  const { children } = guitarSvgRef.current
  while (children.length > 5) {
    guitarSvgRef.current.removeChild(children[1])
  }
}

// eslint-disable-next-line import/prefer-default-export
export const useGuitarDrawing = (guitarSvgRef, handlePlayEvent) => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions()

  const renderGuitar = useCallback(() => {
    const svgElement = guitarSvgRef.current
    const dimensions = calculateGuitarDimensions({ svgElement })

    const stringIndices = Object.keys(GUITAR_CONFIG.STRINGS)

    stringIndices.forEach(stringIndex => {
      const stringOffset = dimensions.stringWidth + dimensions.spaceWidth
      const startY = screenHeight * 0.01
      const endY = screenHeight * 0.9
      const startX = dimensions.startX + Number(stringIndex) * stringOffset
      const endX = startX

      const strokeWidth = `${screenWidth * 0.002}%`

      cleanUpSvg(guitarSvgRef)

      createString(svgElement, {
        endX,
        endY,
        handlePlayEvent,
        note: GUITAR_CONFIG.STRINGS[stringIndex],
        startX,
        startY,
        strokeWidth,
      })
    })
  }, [guitarSvgRef, handlePlayEvent, screenHeight, screenWidth])

  useEffect(() => {
    renderGuitar()
  }, [renderGuitar])
}
