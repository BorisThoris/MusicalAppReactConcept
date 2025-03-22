import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect } from 'react';
import { Group, Rect } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import useContextMenu from '../../../../hooks/useContextMenu';
import { useCustomCursorContext } from '../../../../providers/CursorProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { markersAndTrackerOffset, TimelineContext, TimelineHeight } from '../../../../providers/TimelineProvider';
import InstrumentTimelinePanelComponent from './InstrumentTimelinePanel';
import { TimelineEvents } from './TimelineEvents';

const InstrumentTimeline = React.memo(({ events, index, instrumentName, markersHeight }) => {
    const { isLocked, mutedInstruments, replayInstrumentRecordings, toggleMute } = useContext(RecordingsPlayerContext);
    const { calculatedStageWidth, timelineState, updateTimelineState } = useContext(TimelineContext);
    const { handleCloseSelectionsPanel } = useContext(SelectionContext);
    const { handleContextMenu } = useContextMenu();
    const { playbackStatus: currentPlayingInstrument } = useContext(RecordingsPlayerContext);

    const timelineY = TimelineHeight * index + markersAndTrackerOffset;
    const isMuted = mutedInstruments.includes(instrumentName);
    const timelineWidth = threeMinuteMs / pixelToSecondRatio;
    const fillColor = currentPlayingInstrument === instrumentName ? 'green' : 'transparent';

    const { handleMouseEnter, handleMouseLeave } = useCustomCursorContext();

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
            onMouseEnter={handleMouseEnter}
            draggable={false}
            ref={timelineRef}
            id={`timeline-${instrumentName}`}
            data-instrument-name={instrumentName}
        >
            <InstrumentTimelinePanelComponent
                parentGroupName={instrumentName}
                replayInstrumentRecordings={replayInstrumentRecordings}
                toggleMute={toggleMute}
                instrumentName={instrumentName}
            />

            <Rect
                offset={timelineState.panelCompensationOffset}
                height={TimelineHeight}
                width={calculatedStageWidth}
                fill={isMuted ? 'red' : fillColor}
                id={`timelineRect-${timelineY}`}
                onPointerDown={onTimelinePointerDown}
                stroke="black"
                strokeWidth={2}
                onClick={handleCloseSelectionsPanel}
                onContextMenu={handleContextMenu}
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
