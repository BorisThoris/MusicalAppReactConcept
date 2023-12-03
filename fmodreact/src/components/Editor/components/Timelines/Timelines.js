import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
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

const Timelines = ({
    closePanel,
    duration,
    furthestEndTime,
    isPlaying,
    openPanel,
    panelFor,
    recordings,
    setTrackerPosition,
    stopPlayback,
    trackerPosition,
    updateStartTime,
}) => {
    const widthBasedOnLastSound = furthestEndTime * pixelToSecondRatio;

    const recordingsArr = Object.entries(recordings);
    const EditorHeight = recordingsArr.length * 200 + markersHeight || 500;

    const calculatedStageWidth =
        window.innerWidth > widthBasedOnLastSound
            ? window.innerWidth
            : widthBasedOnLastSound;

    const closePanelOnTimelinePress = useCallback(
        (event) => {
            if (event.target.className !== 'Rect') {
                closePanel();
            }
        },
        [closePanel]
    );

    return (
        <>
            <Stage
                width={calculatedStageWidth}
                height={EditorHeight}
                onClick={closePanelOnTimelinePress}
            >
                <TimelineTracker
                    furthestEndTime={furthestEndTime}
                    shouldTrack={isPlaying}
                    trackerPosition={trackerPosition}
                    setTrackerPosition={setTrackerPosition}
                />

                {recordingsArr.map(([groupKey, instrumentGroup], index) => (
                    <InstrumentTimeline
                        panelFor={panelFor}
                        key={groupKey}
                        instrumentGroup={instrumentGroup}
                        furthestEndTime={furthestEndTime}
                        index={index}
                        markersHeight={markersHeight}
                        openPanel={openPanel}
                        updateStartTime={updateStartTime}
                        stopPlayback={stopPlayback}
                    />
                ))}

                <TimelineMarker
                    duration={duration}
                    height={markersHeight}
                    pixelToSecond={105}
                    furthestEndTime={furthestEndTime}
                />
            </Stage>
        </>
    );
};

Timelines.propTypes = {
    closePanel: PropTypes.func.isRequired,
    duration: PropTypes.number.isRequired,
    furthestEndTime: PropTypes.number.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    openPanel: PropTypes.func.isRequired,
    panelFor: PropTypes.number,
    recordings: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                eventInstance: PropTypes.object,
                instrumentName: PropTypes.string,
                startTime: PropTypes.number,
            })
        )
    ).isRequired,
    setTrackerPosition: PropTypes.func.isRequired,
    stopPlayback: PropTypes.func.isRequired,
    trackerPosition: PropTypes.number,
    updateStartTime: PropTypes.func.isRequired,
};

Timelines.defaultProps = {
    duration: 0,
    furthestEndTime: 0,
    isPlaying: false,
    recordings: {},
};

export default Timelines;
