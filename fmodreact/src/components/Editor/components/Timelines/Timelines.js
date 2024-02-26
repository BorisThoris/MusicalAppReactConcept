/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { Stage } from 'react-konva';
import styled from 'styled-components';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import InstrumentTimeline, { TimelineHeight } from '../InstrumentTimeline/InstrumentTimeline';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineTracker from '../TimelineTracker/TimelineTracker';

export const StyledEditorWrapper = styled.div`
    background-color: white;
    opacity: 0.7;
`;

export const StyledTimeline = styled.div`
    flex-direction: column;
    overflow-y: scroll;
`;

const markersHeight = 50;
const panelCompensationOffset = { x: -60 };

const Timelines = React.memo(
    ({
        closePanel,
        deleteAllRecordingsForInstrument,
        duration,
        focusedEvent,
        furthestEndTime,
        furthestEndTimes,
        openPanel,
        panelFor,
        recordings,
        setFocusedEvent,
        updateStartTime
    }) => {
        const { playbackStatus, replayAllRecordedSounds } = useContext(RecordingsPlayerContext);
        const { timelineState, updateTimelineState } = useContext(TimelineContext);

        useEffect(() => {
            if (timelineState.panelCompensationOffset?.x !== panelCompensationOffset?.x)
                updateTimelineState({ panelCompensationOffset });
        }, [timelineState.panelCompensationOffset?.x, updateTimelineState]);

        const { currentInstrument, isPlaying } = playbackStatus;

        const closePanelOnTimelinePress = useCallback(
            (event) => {
                if (event.target.className !== 'Rect') {
                    closePanel();
                }
            },
            [closePanel]
        );

        const widthBasedOnLastSound = furthestEndTime * pixelToSecondRatio;
        const calculatedStageWidth =
            window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

        const recordingsArr = Object.entries(recordings);
        const EditorHeight = recordingsArr.length * TimelineHeight + markersHeight || 500;

        return (
            <>
                <button onClick={replayAllRecordedSounds}>{isPlaying ? 'Pause' : 'Start'}</button>
                <div style={{ display: 'flex' }}>
                    <Stage width={calculatedStageWidth} height={EditorHeight} onClick={closePanelOnTimelinePress}>
                        {recordingsArr &&
                            recordingsArr.map(([groupName, instrumentGroup], index) => (
                                <InstrumentTimeline
                                    panelFor={panelFor}
                                    key={groupName}
                                    groupName={groupName}
                                    instrumentGroup={instrumentGroup}
                                    furthestEndTime={furthestEndTimes[groupName]}
                                    index={index}
                                    markersHeight={markersHeight}
                                    openPanel={openPanel}
                                    updateStartTime={updateStartTime}
                                    focusedEvent={focusedEvent}
                                    deleteAllRecordingsForInstrument={deleteAllRecordingsForInstrument}
                                    currentPlayingInstrument={currentInstrument}
                                    setFocusedEvent={setFocusedEvent}
                                />
                            ))}

                        <TimelineTracker
                            furthestEndTime={furthestEndTimes[currentInstrument] || furthestEndTime}
                            shouldTrack={isPlaying}
                        />

                        <TimelineMarker
                            duration={duration}
                            height={markersHeight}
                            pixelToSecond={105}
                            furthestEndTime={furthestEndTime}
                        />
                    </Stage>
                </div>
            </>
        );
    }
);

Timelines.propTypes = {
    closePanel: PropTypes.func.isRequired,
    deleteAllRecordingsForInstrument: PropTypes.func.isRequired,
    duration: PropTypes.number.isRequired,
    focusedEvent: PropTypes.number,
    furthestEndTime: PropTypes.number.isRequired,
    furthestEndTimes: PropTypes.object.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    openPanel: PropTypes.func.isRequired,
    panelFor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    recordings: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                eventInstance: PropTypes.object,
                instrumentName: PropTypes.string,
                startTime: PropTypes.number
            })
        )
    ).isRequired,
    setTrackerPosition: PropTypes.func.isRequired,
    trackerPosition: PropTypes.number,
    updateStartTime: PropTypes.func.isRequired
};

Timelines.defaultProps = {
    focusedEvent: null,
    panelFor: null,
    trackerPosition: 0
};

export default Timelines;
