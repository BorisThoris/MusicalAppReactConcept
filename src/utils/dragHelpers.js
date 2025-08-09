/**
 * Utility functions for drag and drop functionality
 * Extracted from SoundEventDragProvider to improve code organization
 */

/**
 * Extracts element IDs from a group element
 * @param {Object} groupElm - The group element
 * @param {string} targetId - The target ID to filter by
 * @returns {Array} Array of child IDs
 */
export const extractElementIdsFromGroup = (groupElm, targetId) => {
    return Object.values(groupElm.elements)
        .filter((child) => targetId === child.id)
        .map((child) => child.id);
};

/**
 * Applies highlight styling to a timeline
 * @param {Object} timeline - The timeline element to highlight
 */
export const applyHighlightToTimeline = (timeline) => {
    if (timeline) {
        timeline.fill('yellow');
        timeline.getLayer().draw();
    }
};

/**
 * Removes highlight styling from a timeline
 * @param {Object} timeline - The timeline element to unhighlight
 */
export const removeHighlightFromTimeline = (timeline) => {
    if (timeline) {
        timeline.fill('white');
        timeline.getLayer().draw();
    }
};

/**
 * Finds the closest timeline events to an element
 * @param {Object} element - The element to find closest timeline for
 * @param {Object} stageRef - Reference to the stage
 * @returns {Object|null} The closest timeline element or null
 */
export const findClosestTimelineEvents = (element, stageRef) => {
    const pos = element.getAbsolutePosition();
    let closest = null;
    let minDist = Infinity;

    const all = stageRef.find((n) => n.attrs?.id?.includes('-events'));
    all.forEach((el) => {
        const box = el.parent.getAbsolutePosition();
        const d = Math.abs(pos.y - box.y);
        if (d < minDist) {
            minDist = d;
            closest = el;
        }
    });

    return closest;
};

/**
 * Finds the closest timeline rectangle to an element
 * @param {Object} element - The element to find closest timeline rect for
 * @param {Object} stageRef - Reference to the stage
 * @returns {Object|null} The closest timeline rect or null
 */
export const findClosestTimelineRect = (element, stageRef) => {
    const boxEl = element.getClientRect();
    let closest = null;
    let minDist = Infinity;

    const all = stageRef.find((n) => n.attrs?.id?.includes('timelineRect'));
    all.forEach((el) => {
        const box = el.getClientRect();
        const d = Math.abs(boxEl.y - box.y);
        if (d < minDist) {
            minDist = d;
            closest = el;
        }
    });

    return closest;
};
