import React, { useContext, useEffect, useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { markersHeight, TimelineContext, TimelineHeight } from '../../../../providers/TimelineProvider';
import { Cursor } from '../Cursor/Cursor';
import { DragSelection } from '../DragSelection';
import InstrumentTimeline from '../InstrumentTimeline/InstrumentTimeline';
import PaintingTopBar from '../PaintingTopBar/PaintingTopBar';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineTracker from '../TimelineTracker/TimelineTracker';

const Timelines = React.memo(() => {
    const stageRef = useRef(null);

    const { addStageRef, overlapGroups } = useContext(CollisionsContext);
    const { playbackStatus } = useContext(RecordingsPlayerContext);
    const { timelineState } = useContext(TimelineContext);

    const { furthestEndTime, furthestEndTimes } = timelineState;

    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    const calculatedStageWidth = window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

    const recordingsArr = Object.entries(overlapGroups);

    const EditorHeight = recordingsArr.length * TimelineHeight + markersHeight || 500;

    useEffect(() => {
        addStageRef(stageRef);
    }, [addStageRef, stageRef]);

    return (
        <>
            <PaintingTopBar />

            <Stage width={calculatedStageWidth} height={EditorHeight} ref={stageRef}>
                <Layer name="top-layer">
                    {recordingsArr.map(([parentGroupName, events], index) => (
                        <InstrumentTimeline
                            key={parentGroupName}
                            instrumentName={parentGroupName}
                            events={events}
                            index={index}
                            markersHeight={markersHeight}
                        />
                    ))}
                </Layer>

                <Layer>
                    <TimelineTracker
                        furthestEndTime={furthestEndTimes[playbackStatus.currentInstrument] || furthestEndTime}
                        shouldTrack={playbackStatus.isPlaying}
                    />
                </Layer>

                <DragSelection stageRef={stageRef} width={calculatedStageWidth} height={EditorHeight} />

                <TimelineMarker duration={threeMinuteMs} height={markersHeight} pixelToSecond={pixelToSecondRatio} />
            </Stage>
        </>
    );
});

export default Timelines;
