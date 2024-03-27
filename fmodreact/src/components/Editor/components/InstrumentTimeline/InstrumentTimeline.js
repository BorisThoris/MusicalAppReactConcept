import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Layer, Rect } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { useCustomCursor } from '../../../../hooks/useCustomCursor';
import { useInstrumentPanel } from '../../../../hooks/useInstrumentPanel';
import { PanelContext } from '../../../../hooks/usePanelState';
import { useRipples } from '../../../../hooks/useRipples';
// Adjust the path as necessary
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { markersAndTrackerOffset, TimelineContext, TimelineHeight } from '../../../../providers/TimelineProvider';
import { Ripples } from '../Ripples/Ripples';
import InstrumentTimelinePanelComponent from './InstrumentTimelinePanel';
import { TimelineEvents } from './TimelineEvents';

const InstrumentTimeline = React.memo(({ events, index, markersHeight, parentGroupName }) => {
    const { isLocked, mutedInstruments, replayInstrumentRecordings, setTrackerPosition, toggleMute } =
        useContext(RecordingsPlayerContext);
    const { timelineState, toggleLock, updateTimelineState } = useContext(TimelineContext);
    const { closeParamsPanel } = useContext(PanelContext);
    const { addRipple, removeRipple, ripples } = useRipples();

    const timelineRef = useRef();
    const { playbackStatus: currentPlayingInstrument } = useContext(RecordingsPlayerContext);

    const timelineY = TimelineHeight * index + markersAndTrackerOffset;
    const isMuted = mutedInstruments.includes(parentGroupName);
    const timelineWidth = threeMinuteMs / pixelToSecondRatio;
    const fillColor = currentPlayingInstrument === parentGroupName ? 'green' : 'transparent';

    const { Cursor, cursorPos, handleClick, handleMouseEnter, handleMouseLeave, handleMouseMove } = useCustomCursor({
        parentY: timelineY
    });

    const { clearSelection } = useContext(SelectionContext);

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

    const onPointerDown = useCallback(
        (evt) => {
            handleClick();
            closeInstrumentPanel();
            setTrackerPosition(cursorPos.screenX);
            addRipple(cursorPos.x, cursorPos.y);

            if (evt.evt.button === 0 && !evt.evt.ctrlKey) {
                clearSelection();
            }

            closeParamsPanel();

            setupDelayedOpen(() => {
                addRipple(cursorPos.x, cursorPos.y, 'red');
            }, 500);
        },
        [
            handleClick,
            closeInstrumentPanel,
            setTrackerPosition,
            cursorPos.screenX,
            cursorPos.x,
            cursorPos.y,
            addRipple,
            closeParamsPanel,
            setupDelayedOpen,
            clearSelection
        ]
    );

    const onPointerUp = useCallback(() => {
        handleClick();
        cancelDelayedOpen();
    }, [cancelDelayedOpen, handleClick]);

    const onMouseMove = useCallback(
        (evt) => {
            cancelDelayedOpen();
            handleMouseMove(evt);
        },
        [cancelDelayedOpen, handleMouseMove]
    );

    return (
        <Layer
            y={timelineY}
            ref={timelineRef}
            onMouseLeave={handleMouseLeave}
            onMouseMove={onMouseMove}
            onMouseEnter={handleMouseEnter}
        >
            <InstrumentTimelinePanelComponent
                timelineHeight={TimelineHeight}
                parentGroupName={parentGroupName}
                replayInstrumentRecordings={replayInstrumentRecordings}
                toggleMute={toggleMute}
                toggleLocked={toggleLock}
                isLocked={isLocked}
            />

            <Rect
                offset={timelineState.panelCompensationOffset}
                height={TimelineHeight}
                width={timelineWidth}
                fill={isMuted ? 'red' : fillColor}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                id={`Timeline-${timelineY}`}
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
