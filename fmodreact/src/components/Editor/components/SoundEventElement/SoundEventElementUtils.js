// SoundEventElementUtils.js
export const getDynamicStroke = (isTargeted, isFocused) => {
    if (isTargeted) return 'blue';
    if (isFocused) return 'green';
    return 'red';
};

export const getDynamicShadowBlur = (isFocused) => (isFocused ? 10 : 0);

export const getDynamicColorStops = (isOverlapping) => (isOverlapping ? [0, 'red', 1, 'yellow'] : [1, 'red']);

export const CONSTANTS = {
    CORNER_RADIUS: 5,
    GRADIENT_END: { x: 100, y: 0 },
    GRADIENT_START: { x: 0, y: 0 },
    LOCK_OFFSET_Y: -10,
    lockIconProps: (locked) => ({
        fill: 'white',
        fontSize: CONSTANTS.TEXT_FONT_SIZE,
        text: locked ? '🔒' : '✔️',
        x: -10,
        y: CONSTANTS.LOCK_OFFSET_Y
    }),
    rectProps: (isOverlapping, isTargeted, isFocused) => ({
        cornerRadius: CONSTANTS.CORNER_RADIUS,
        fillLinearGradientColorStops: getDynamicColorStops(isOverlapping),
        fillLinearGradientEndPoint: CONSTANTS.GRADIENT_END,
        fillLinearGradientStartPoint: CONSTANTS.GRADIENT_START,
        opacity: CONSTANTS.TRANSPARENCY_VALUE,
        shadowBlur: getDynamicShadowBlur(isFocused),
        shadowOffset: CONSTANTS.SHADOW.OFFSET,
        shadowOpacity: CONSTANTS.SHADOW.OPACITY,
        stroke: getDynamicStroke(isTargeted, isFocused),
        strokeWidth: CONSTANTS.STROKE_WIDTH
    }),
    SHADOW: { BLUR: 5, OFFSET: { x: 8, y: 5 }, OPACITY: 0.5 },
    STROKE_WIDTH: 2,
    TEXT_FONT_SIZE: 18,
    TEXT_STYLE: {
        fill: 'black',
        fontSize: 15,
        x: 5,
        y: 15
    },
    TRANSPARENCY_VALUE: 0.8
};
