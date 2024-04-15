import React, { useContext, useRef } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { InstrumentRecordingsContext } from '../../../../providers/InstrumentsProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { markersHeight, TimelineContext, TimelineHeight } from '../../../../providers/TimelineProvider';
import { DragSelection } from '../DragSelection';
import InstrumentTimeline from '../InstrumentTimeline/InstrumentTimeline';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineTracker from '../TimelineTracker/TimelineTracker';

const Timelines = React.memo(() => {
    const stageRef = useRef(null);
    const { history, recordings, redo, redoHistory, undo } = useContext(InstrumentRecordingsContext);
    const { playbackStatus, replayAllRecordedSounds } = useContext(RecordingsPlayerContext);
    const { endTime: selectionEndTime, highestYLevel, startTime: selectionStartTime } = useContext(SelectionContext);
    const { timelineState } = useContext(TimelineContext);
    const { furthestEndTime, furthestEndTimes, panelCompensationOffset } = timelineState;

    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    const calculatedStageWidth = window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

    const recordingsArr = Object.entries(recordings);
    const EditorHeight = recordingsArr.length * TimelineHeight + markersHeight || 500;

    return (
        <>
            <button onClick={replayAllRecordedSounds}>{playbackStatus.isPlaying ? 'Pause' : 'Start'}</button>
            {history.length > 0 && <button onClick={undo}>Undo</button>}
            {redoHistory.length > 0 && <button onClick={redo}>Redo</button>}

            <Stage width={calculatedStageWidth} height={EditorHeight} ref={stageRef}>
                <Layer>
                    <TimelineTracker
                        furthestEndTime={furthestEndTimes[playbackStatus.currentInstrument] || furthestEndTime}
                        shouldTrack={playbackStatus.isPlaying}
                    />
                </Layer>

                {selectionEndTime && selectionStartTime && (
                    <Layer>
                        <Rect
                            // For Debugging Purposes uncomment
                            fill={'transparent'}
                            opacity={0.3}
                            width={(selectionEndTime - selectionStartTime) * pixelToSecondRatio}
                            height={highestYLevel}
                            x={selectionStartTime * pixelToSecondRatio - panelCompensationOffset.x}
                            draggable
                        />
                    </Layer>
                )}

                {recordingsArr.map(([parentGroupName, events], index) => (
                    <InstrumentTimeline
                        key={parentGroupName}
                        parentGroupName={parentGroupName}
                        events={events}
                        index={index}
                        markersHeight={markersHeight}
                    />
                ))}

                <DragSelection stageRef={stageRef} width={calculatedStageWidth} height={EditorHeight} />

                <TimelineMarker duration={threeMinuteMs} height={markersHeight} pixelToSecond={pixelToSecondRatio} />
            </Stage>
        </>
    );
});

export default Timelines;
