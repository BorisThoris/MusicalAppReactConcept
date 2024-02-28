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
                        pixelToSecond={pixelToSecondRatio}
                        furthestEndTime={furthestEndTime}
                    />
                </Stage>
            </>
        );
    }
);

export default Timelines;
