/**
 * Timeline-related constants
 * Extracted from TimelineProvider to improve code organization
 */

export const TIMELINE_CONSTANTS = {
    HEIGHT: 200,
    MARKERS_HEIGHT: 50,
    PANEL_COMPENSATION_OFFSET: { x: -60 },
    Y_OFFSET: 20
};

export const MARKERS_AND_TRACKER_OFFSET = TIMELINE_CONSTANTS.MARKERS_HEIGHT + TIMELINE_CONSTANTS.Y_OFFSET;

export const DEFAULT_TIMELINE_STATE = {
    furthestEndTimes: 0,
    markersAndTrackerOffset: MARKERS_AND_TRACKER_OFFSET,
    markersHeight: TIMELINE_CONSTANTS.MARKERS_HEIGHT,
    panelCompensationOffset: TIMELINE_CONSTANTS.PANEL_COMPENSATION_OFFSET,
    stageWidth: 0,
    TimelineHeight: TIMELINE_CONSTANTS.HEIGHT
};
