import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef } from 'react';
import { Layer, Rect } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useCustomCursor } from '../../../../hooks/useCustomCursor';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import InstrumentTimelinePanelComponent from './InstrumentTimelinePanel';
import { TimelineEvents } from './TimelineEvents';

export const TimelineHeight = 200;
const Y_OFFSET = 20;

const InstrumentTimeline = React.memo(({ groupName, index, instrumentGroup, markersHeight }) => {
    const { isLocked, mutedInstruments, replayInstrumentRecordings, toggleMute } = useContext(RecordingsPlayerContext);
    const { timelineState, toggleLock, updateTimelineState } = useContext(TimelineContext);
    const { furthestEndTimes } = timelineState;

    const { playbackStatus: currentPlayingInstrument } = useContext(RecordingsPlayerContext);

    const timelineRef = useRef();
    const isMuted = mutedInstruments.includes(groupName);
    const timelineY = TimelineHeight * index + markersHeight + Y_OFFSET;
    const furthestGroupEndTime = furthestEndTimes[groupName];
    const timelineWidth = furthestGroupEndTime * pixelToSecondRatio;
    const fillColor = currentPlayingInstrument === groupName ? 'green' : 'transparent';

    useEffect(() => {
        if (timelineRef.current) {
            const canvasOffsetY = timelineRef.current.parent?.attrs?.container?.getBoundingClientRect()?.y || 0;

            if (timelineState.canvasOffsetY !== canvasOffsetY) {
                updateTimelineState({ canvasOffsetY, timelineY });
            }
        }
    }, [furthestGroupEndTime, index, markersHeight, timelineState.canvasOffsetY, timelineY, updateTimelineState]);

    const { Cursor, handleMouseEnter, handleMouseLeave, handleMouseMove } = useCustomCursor({ parentY: timelineY });

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
            />

            <InstrumentTimelinePanelComponent
                timelineHeight={TimelineHeight}
                groupName={groupName}
                replayInstrumentRecordings={replayInstrumentRecordings}
                toggleMute={toggleMute}
                toggleLocked={toggleLock}
                isLocked={isLocked}
            />

            <TimelineEvents eventGroups={instrumentGroup} timelineHeight={TimelineHeight} timelineY={timelineY} />

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
    focusedEvent: PropTypes.number,
    furthestGroupEndTime: PropTypes.number.isRequired,
    groupName: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    instrumentGroup: PropTypes.arrayOf(
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
    markersHeight: PropTypes.number.isRequired,
    openPanel: PropTypes.func.isRequired,
    panelCompensationOffset: PropTypes.object.isRequired,
    panelFor: PropTypes.number,
    replayInstrumentRecordings: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired
};

export default InstrumentTimeline;
