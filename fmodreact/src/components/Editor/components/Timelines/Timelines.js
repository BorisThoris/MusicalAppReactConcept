import React, { useCallback, useContext, useEffect } from 'react';
import { Stage } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { PanelContext } from '../../../../hooks/usePanelState';
import { InstrumentRecordingsContext } from '../../../../providers/InstrumentsProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import InstrumentTimeline, { TimelineHeight } from '../InstrumentTimeline/InstrumentTimeline';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineTracker from '../TimelineTracker/TimelineTracker';

const markersHeight = 50;
const panelCompensationOffset = { x: -60 };

const Timelines = React.memo(() => {
    const { closePanel } = useContext(PanelContext);
    const { recordings } = useContext(InstrumentRecordingsContext);
    const { playbackStatus, replayAllRecordedSounds } = useContext(RecordingsPlayerContext);
    const { timelineState, updateTimelineState } = useContext(TimelineContext);
    const { furthestEndTime, furthestEndTimes } = timelineState;

    useEffect(() => {
        if (timelineState.panelCompensationOffset?.x !== panelCompensationOffset.x) {
            updateTimelineState({ panelCompensationOffset });
        }
    }, [timelineState.panelCompensationOffset?.x, updateTimelineState]);

    const closePanelOnTimelinePress = useCallback(
        (event) => {
            if (event.target.className !== 'Rect') {
                closePanel();
            }
        },
        [closePanel]
    );

    const widthBasedOnLastSound = timelineState.stageWidth;
    const calculatedStageWidth = window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

    const recordingsArr = Object.entries(recordings);
    const EditorHeight = recordingsArr.length * TimelineHeight + markersHeight || 500;

    return (
        <>
            <button onClick={replayAllRecordedSounds}>{playbackStatus.isPlaying ? 'Pause' : 'Start'}</button>

            <Stage width={calculatedStageWidth} height={EditorHeight} onClick={closePanelOnTimelinePress}>
                {recordingsArr.map(([groupName, instrumentGroup], index) => (
                    <InstrumentTimeline
                        key={groupName}
                        groupName={groupName}
                        instrumentGroup={instrumentGroup}
                        index={index}
                        markersHeight={markersHeight}
                    />
                ))}

                <TimelineTracker
                    furthestEndTime={furthestEndTimes[playbackStatus.currentInstrument] || furthestEndTime}
                    shouldTrack={playbackStatus.isPlaying}
                />

                <TimelineMarker duration={threeMinuteMs} height={markersHeight} pixelToSecond={pixelToSecondRatio} />
            </Stage>
        </>
    );
});

export default Timelines;
