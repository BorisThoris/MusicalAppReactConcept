// helpers/getPixelToSecondRatio.js
/**
 * Returns pixels-per-second based on total duration.
 * @param {number} durationInSeconds
 * @returns {number}
 */
export function getPixelToSecondRatio(durationInSeconds) {
    return window.innerWidth / durationInSeconds;
}

const pixelToSecondRatio = 105;

export default pixelToSecondRatio;
