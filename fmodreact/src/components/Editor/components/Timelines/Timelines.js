import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { Stage } from 'react-konva';
import styled from 'styled-components';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import InstrumentTimeline from '../InstrumentTimeline/InstrumentTimeline';
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

const Timelines = React.memo(
    ({
        closePanel,
        currentPlayingInstrument,
        deleteAllRecordingsForInstrument,
        duration,
        focusedEvent,
        furthestEndTime,
        furthestEndTimes,
        isPlaying,
        openPanel,
        panelFor,
        recordings,
        replayInstrumentRecordings,
        setTrackerPosition,
        trackerPosition,
        updateStartTime,
    }) => {
        const panelCompensationOffset = useMemo(() => {
            return { x: -60 };
        }, []);

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
            window.innerWidth > widthBasedOnLastSound
                ? window.innerWidth
                : widthBasedOnLastSound;

        const recordingsArr = Object.entries(recordings);
        const EditorHeight = recordingsArr.length * 200 + markersHeight || 500;

        return (
            <div style={{ display: 'flex' }}>
                <Stage
                    width={calculatedStageWidth}
                    height={EditorHeight}
                    onClick={closePanelOnTimelinePress}
                >
                    {recordingsArr &&
                        recordingsArr.map(
                            ([groupName, instrumentGroup], index) => (
                                <InstrumentTimeline
                                    panelFor={panelFor}
                                    key={groupName}
                                    groupName={groupName}
                                    instrumentGroup={instrumentGroup}
                                    furthestEndTime={
                                        furthestEndTimes[groupName]
                                    }
                                    index={index}
                                    markersHeight={markersHeight}
                                    openPanel={openPanel}
                                    updateStartTime={updateStartTime}
                                    panelCompensationOffset={
                                        panelCompensationOffset
                                    }
                                    replayInstrumentRecordings={
                                        replayInstrumentRecordings
                                    }
                                    focusedEvent={focusedEvent}
                                    deleteAllRecordingsForInstrument={
                                        deleteAllRecordingsForInstrument
                                    }
                                    currentPlayingInstrument={
                                        currentPlayingInstrument
                                    }
                                />
                            )
                        )}

                    <TimelineTracker
                        furthestEndTime={
                            furthestEndTimes[currentPlayingInstrument] ||
                            furthestEndTime
                        }
                        shouldTrack={isPlaying}
                        trackerPosition={trackerPosition}
                        setTrackerPosition={setTrackerPosition}
                        panelCompensationOffset={panelCompensationOffset}
                    />

                    <TimelineMarker
                        duration={duration}
                        height={markersHeight}
                        pixelToSecond={105}
                        furthestEndTime={furthestEndTime}
                        panelCompensationOffset={panelCompensationOffset}
                    />
                </Stage>
            </div>
        );
    }
);

Timelines.propTypes = {
    closePanel: PropTypes.func.isRequired,
    currentPlayingInstrument: PropTypes.string,
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
                startTime: PropTypes.number,
            })
        )
    ).isRequired,
    replayInstrumentRecordings: PropTypes.func.isRequired,
    setTrackerPosition: PropTypes.func.isRequired,
    trackerPosition: PropTypes.number,
    updateStartTime: PropTypes.func.isRequired,
};

Timelines.defaultProps = {
    currentPlayingInstrument: '',
    focusedEvent: null,
    panelFor: null,
    trackerPosition: 0,
};

export default Timelines;
