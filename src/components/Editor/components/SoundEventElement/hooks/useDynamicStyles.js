// hooks/useUnifiedDynamicStyles.js
import { useMemo } from 'react';

const CONSTANTS = {
    CORNER_RADIUS: 5,
    GRADIENT_END: { x: 100, y: 0 },
    GRADIENT_START: { x: 0, y: 0 },
    LOCK_OFFSET_Y: -10,
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

// Helper to decide fill color based on focus and selection.
function getDynamicFill({ isFocused, isSelected }) {
    if (isFocused) {
        return 'green';
    }
    if (isSelected) {
        return 'blue';
    }
    return 'red';
}

/**
 * Hook that unifies all dynamic style properties.
 *
 * @param {Object} params - The parameters object.
 * @param {boolean} params.isFocused - Whether the element is focused.
 * @param {boolean} params.isSelected - Whether the element is selected.
 * @param {boolean} params.groupRef - Indicates if the element is part of a group.
 * @param {number} params.childScale - Scaling factor for elements in a group.
 * @param {number} params.timelineHeight - Base timeline height.
 *
 * @returns {Object} A style object with unified dynamic properties.
 */
export const useUnifiedDynamicStyles = ({ childScale, groupRef, isFocused, isSelected, timelineHeight }) => {
    // These values come from focus/selection and are analogous to your previous dynamic values.
    const dynamicFill = getDynamicFill({ isFocused, isSelected });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const dynamicColorStops = [0, 'red', 1, 'yellow']; // You can enhance this logic if necessary.
    const dynamicShadowBlur = 5;

    return useMemo(() => {
        // Determine height based on whether the element is part of a group.
        const height = groupRef ? timelineHeight * childScale : timelineHeight;
        // Define border styling differently depending on group context.
        const stroke = groupRef ? 'blue' : 'black';
        const strokeWidth = groupRef ? 4 : 2;

        return {
            // Dynamic styling from focus/selection.
            fill: dynamicFill,
            fillLinearGradientColorStops: dynamicColorStops,
            fillLinearGradientEndPoint: CONSTANTS.GRADIENT_END,
            fillLinearGradientStartPoint: CONSTANTS.GRADIENT_START,
            // Layout based on group membership.
            height,
            shadowBlur: dynamicShadowBlur,
            stroke,
            strokeWidth
        };
    }, [groupRef, childScale, timelineHeight, dynamicFill, dynamicColorStops, dynamicShadowBlur]);
};
