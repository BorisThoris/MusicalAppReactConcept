import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Layer, Rect } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { useCustomCursor } from '../../../../hooks/useCustomCursor';
import { INSTRUMENTS_PANEL_ID, PanelContext, PARAMS_PANEL_ID } from '../../../../hooks/usePanelState';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import InstrumentTimelinePanelComponent from './InstrumentTimelinePanel';
import { TimelineEvents } from './TimelineEvents';

export const TimelineHeight = 200;
const Y_OFFSET = 20;

const InstrumentTimeline = React.memo(({ events, index, markersHeight, parentGroupName }) => {
    const { closePanel, closeParamsPanel, openPanel, panels } = useContext(PanelContext);
    const { isLocked, mutedInstruments, replayInstrumentRecordings, toggleMute } = useContext(RecordingsPlayerContext);
    const { timelineState, toggleLock, updateTimelineState } = useContext(TimelineContext);
    const { furthestEndTimes } = timelineState;

    const { playbackStatus: currentPlayingInstrument } = useContext(RecordingsPlayerContext);

    const timelineRef = useRef();
    const isMuted = mutedInstruments.includes(parentGroupName);
    const timelineY = TimelineHeight * index + markersHeight + Y_OFFSET;
    const furthestGroupEndTime = furthestEndTimes[parentGroupName];
    const timelineWidth = threeMinuteMs / pixelToSecondRatio;
    const fillColor = currentPlayingInstrument === parentGroupName ? 'green' : 'transparent';

    useEffect(() => {
        if (timelineRef.current) {
            const canvasOffsetY = timelineRef.current.parent?.attrs?.container?.getBoundingClientRect()?.y || 0;

            if (timelineState.canvasOffsetY !== canvasOffsetY) {
                updateTimelineState({ canvasOffsetY, timelineY });
            }
        }
    }, [furthestGroupEndTime, index, markersHeight, timelineState.canvasOffsetY, timelineY, updateTimelineState]);

    const { Cursor, cursorPos, handleMouseEnter, handleMouseLeave, handleMouseMove } = useCustomCursor({
        parentY: timelineY
    });

    const openInstrumentPanel = useCallback(() => {
        if (panels[PARAMS_PANEL_ID]) closeParamsPanel();
        else if (panels[INSTRUMENTS_PANEL_ID]) closePanel(INSTRUMENTS_PANEL_ID);
        else {
            openPanel({
                id: INSTRUMENTS_PANEL_ID,
                targetGroup: parentGroupName,
                x: cursorPos.screenX,
                y: timelineY + timelineState.canvasOffsetY + TimelineHeight
            });
        }
    }, [
        closeParamsPanel,
        panels,
        closePanel,
        openPanel,
        parentGroupName,
        cursorPos.screenX,
        timelineY,
        timelineState.canvasOffsetY
    ]);

    return (
        <Layer y={timelineY} ref={timelineRef}>
            <Rect
                offset={timelineState.panelCompensationOffset}
                height={TimelineHeight}
                width={timelineWidth}
                fill={isMuted ? 'red' : fillColor}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={openInstrumentPanel}
            />

            <InstrumentTimelinePanelComponent
                timelineHeight={TimelineHeight}
                parentGroupName={parentGroupName}
                replayInstrumentRecordings={replayInstrumentRecordings}
                toggleMute={toggleMute}
                toggleLocked={toggleLock}
                isLocked={isLocked}
            />

            <TimelineEvents eventGroups={events} timelineHeight={TimelineHeight} timelineY={timelineY} />

            {isLocked && (
                <Rect offset={timelineState.panelCompensationOffset} height={TimelineHeight} width={timelineWidth} />
            )}

            {Cursor}
        </Layer>
    );
});

InstrumentTimeline.propTypes = {
    currentPlayingInstrument: PropTypes.string,
    deleteAllRecordingsForInstrument: PropTypes.func.isRequired,
    events: PropTypes.arrayOf(
        PropTypes.shape({
            events: PropTypes.arrayOf(
                PropTypes.shape({
                    endTime: PropTypes.number.isRequired,
                    eventInstance: PropTypes.object,
                    id: PropTypes.number.isRequired,
                    instrumentName: PropTypes.string.isRequired,
                    startTime: PropTypes.number.isRequired
                })
            ).isRequired,
            id: PropTypes.number.isRequired
        })
    ).isRequired,
    focusedEvent: PropTypes.number,
    furthestGroupEndTime: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    markersHeight: PropTypes.number.isRequired,
    openParamsPanel: PropTypes.func.isRequired,
    panelCompensationOffset: PropTypes.object.isRequired,
    panelFor: PropTypes.number,
    parentGroupName: PropTypes.string.isRequired,
    replayInstrumentRecordings: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired
};

export default InstrumentTimeline;
