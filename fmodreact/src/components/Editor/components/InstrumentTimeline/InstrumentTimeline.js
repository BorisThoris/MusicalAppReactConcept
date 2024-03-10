import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Layer, Rect } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { useCustomCursor } from '../../../../hooks/useCustomCursor';
import { useInstrumentPanel } from '../../../../hooks/useInstrumentPanel';
import { useRipples } from '../../../../hooks/useRipples';
// Adjust the path as necessary
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { Ripples } from '../Ripples/Ripples';
import InstrumentTimelinePanelComponent from './InstrumentTimelinePanel';
import { TimelineEvents } from './TimelineEvents';

export const TimelineHeight = 200;
const Y_OFFSET = 20;

const InstrumentTimeline = React.memo(({ events, index, markersHeight, parentGroupName }) => {
    // Contexts
    const { isLocked, mutedInstruments, replayInstrumentRecordings, setTrackerPosition, toggleMute } =
        useContext(RecordingsPlayerContext);
    const { timelineState, toggleLock, updateTimelineState } = useContext(TimelineContext);
    const { addRipple, clearRipples, removeRipple, ripples } = useRipples();

    // Refs
    const timelineRef = useRef();
    const { playbackStatus: currentPlayingInstrument } = useContext(RecordingsPlayerContext);

    // Derived state
    const timelineY = TimelineHeight * index + markersHeight + Y_OFFSET;
    const isMuted = mutedInstruments.includes(parentGroupName);
    const timelineWidth = threeMinuteMs / pixelToSecondRatio;
    const fillColor = currentPlayingInstrument === parentGroupName ? 'green' : 'transparent';

    // Custom hooks
    const { Cursor, cursorPos, handleMouseEnter, handleMouseLeave, handleMouseMove } = useCustomCursor({
        parentY: timelineY
    });

    const { cancelDelayedOpen, closeInstrumentPanel, setupDelayedOpen } = useInstrumentPanel(
        parentGroupName,
        timelineY,
        cursorPos,
        timelineState
    );

    useEffect(() => {
        if (timelineRef.current) {
            const canvasOffsetY = timelineRef.current.parent?.attrs?.container?.getBoundingClientRect()?.y || 0;

            if (timelineState.canvasOffsetY !== canvasOffsetY) {
                updateTimelineState({ canvasOffsetY, timelineY });
            }
        }
    }, [index, markersHeight, timelineState.canvasOffsetY, timelineY, updateTimelineState]);

    const onPointerDown = useCallback(() => {
        closeInstrumentPanel();
        setTrackerPosition(cursorPos.screenX);
        addRipple(cursorPos.x, cursorPos.y);

        setupDelayedOpen(() => addRipple(cursorPos.x, cursorPos.y, 'red'), 500);
    }, [addRipple, closeInstrumentPanel, cursorPos, setTrackerPosition, setupDelayedOpen]);

    const onPointerUp = useCallback(() => {
        cancelDelayedOpen();
    }, [cancelDelayedOpen]);

    useEffect(() => {
        return () => {
            clearTimeout(openInstrumentPanelTimeoutRef.current);
        };
    }, []);

    return (
        <Layer
            y={timelineY}
            ref={timelineRef}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
        >
            <Rect
                offset={timelineState.panelCompensationOffset}
                height={TimelineHeight}
                width={timelineWidth}
                fill={isMuted ? 'red' : fillColor}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
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

            <Ripples ripples={ripples} removeRipple={removeRipple} />

            {Cursor}
        </Layer>
    );
});

InstrumentTimeline.propTypes = {
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
    index: PropTypes.number.isRequired,
    markersHeight: PropTypes.number.isRequired,
    parentGroupName: PropTypes.string.isRequired
};

export default InstrumentTimeline;
