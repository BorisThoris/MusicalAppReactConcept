import React, { useCallback, useContext, useEffect } from 'react';
import { Layer, Stage } from 'react-konva';
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
    const { history, recordings, redo, redoHistory, undo } = useContext(InstrumentRecordingsContext);
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

    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    const calculatedStageWidth = window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

    const recordingsArr = Object.entries(recordings);
    const EditorHeight = recordingsArr.length * TimelineHeight + markersHeight || 500;

    return (
        <>
            <button onClick={replayAllRecordedSounds}>{playbackStatus.isPlaying ? 'Pause' : 'Start'}</button>
            {history.length > 0 && <button onClick={undo}>Undo</button>}
            {redoHistory.length > 0 && <button onClick={redo}>Redo</button>}

            <Stage width={calculatedStageWidth} height={EditorHeight} onClick={closePanelOnTimelinePress}>
                <Layer>
                    <TimelineTracker
                        furthestEndTime={furthestEndTimes[playbackStatus.currentInstrument] || furthestEndTime}
                        shouldTrack={playbackStatus.isPlaying}
                    />
                </Layer>

                {recordingsArr.map(([parentGroupName, events], index) => (
                    <InstrumentTimeline
                        key={parentGroupName}
                        parentGroupName={parentGroupName}
                        events={events}
                        index={index}
                        markersHeight={markersHeight}
                    />
                ))}

                <TimelineMarker duration={threeMinuteMs} height={markersHeight} pixelToSecond={pixelToSecondRatio} />
            </Stage>
        </>
    );
});

export default Timelines;
