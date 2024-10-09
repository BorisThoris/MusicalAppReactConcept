import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect } from 'react';
import { Group, Rect } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { useCustomCursorContext } from '../../../../providers/CursorProvider';
import { usePaintings } from '../../../../providers/PaintingProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { markersAndTrackerOffset, TimelineContext, TimelineHeight } from '../../../../providers/TimelineProvider';
import { Ripples } from '../Ripples/Ripples';
import InstrumentTimelinePanelComponent from './InstrumentTimelinePanel';
import { TimelineEvents } from './TimelineEvents';
import { useTimelinePointerEffects } from './useTimelinePointerEffects';

const InstrumentTimeline = React.memo(({ events, index, instrumentName, markersHeight }) => {
    const { isLocked, mutedInstruments, replayInstrumentRecordings, toggleMute } = useContext(RecordingsPlayerContext);
    const { calculatedStageWidth, timelineState, toggleLock, updateTimelineState } = useContext(TimelineContext);

    const { playbackStatus: currentPlayingInstrument } = useContext(RecordingsPlayerContext);

    const { paintEvent, paintingTarget } = usePaintings();

    const isInstrumentSelected = paintingTarget?.instrument ? instrumentName.includes(paintingTarget.instrument) : true;

    const timelineY = TimelineHeight * index + markersAndTrackerOffset;
    const isMuted = mutedInstruments.includes(instrumentName);
    const timelineWidth = threeMinuteMs / pixelToSecondRatio;
    const fillColor = currentPlayingInstrument === instrumentName ? 'green' : 'transparent';

    const { handleMouseEnter, handleMouseLeave } = useCustomCursorContext();

    const { onMouseMove, onPointerUp, removeRipple, ripples } = useTimelinePointerEffects({
        index,
        instrumentName
    });

    const timelineRef = React.useRef();

    useEffect(() => {
        if (timelineRef.current) {
            const canvasOffsetY = timelineRef.current.parent?.attrs?.container?.getBoundingClientRect()?.y || 0;

            if (timelineState.canvasOffsetY !== canvasOffsetY) {
                updateTimelineState({ canvasOffsetY, timelineY });
            }
        }
    }, [index, markersHeight, timelineState.canvasOffsetY, timelineY, updateTimelineState]);

    const onTimelinePointerDown = useCallback((e) => {}, []);

    return (
        <Group
            y={timelineY}
            onMouseLeave={handleMouseLeave}
            onMouseMove={onMouseMove}
            onMouseEnter={handleMouseEnter}
            draggable={false}
            ref={timelineRef}
            id={`timeline-${instrumentName}`}
        >
            <InstrumentTimelinePanelComponent
                timelineHeight={TimelineHeight}
                parentGroupName={instrumentName}
                replayInstrumentRecordings={replayInstrumentRecordings}
                toggleMute={toggleMute}
                toggleLocked={toggleLock}
                isLocked={isLocked}
            />

            <Rect
                offset={timelineState.panelCompensationOffset}
                height={TimelineHeight}
                width={calculatedStageWidth}
                // eslint-disable-next-line no-nested-ternary
                fill={isInstrumentSelected ? (isMuted ? 'darkred' : 'lightgray') : isMuted ? 'red' : fillColor}
                onPointerUp={onPointerUp}
                id={`Timeline-${timelineY}`}
                onMouseMove={onMouseMove}
                onPointerDown={onTimelinePointerDown}
                stroke="black" // Border color
                strokeWidth={2} // Border thickness
            />

            <TimelineEvents
                eventGroups={events}
                timelineHeight={TimelineHeight}
                timelineY={timelineY}
                instrumentName={instrumentName}
            />

            {isLocked && (
                <Rect offset={timelineState.panelCompensationOffset} height={TimelineHeight} width={timelineWidth} />
            )}

            <Ripples ripples={ripples} removeRipple={removeRipple} />
        </Group>
    );
}, isEqual);

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
    instrumentName: PropTypes.string.isRequired,
    markersHeight: PropTypes.number.isRequired
};

export default InstrumentTimeline;
