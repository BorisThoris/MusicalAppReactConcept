/* eslint-disable react-perf/jsx-no-new-function-as-prop */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Group, Layer, Rect, Stage, Text } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { useCustomCursorContext } from '../../../../providers/CursorProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { markersHeight, TimelineHeight } from '../../../../providers/TimelineProvider';
import { DragSelection } from '../DragSelection';
import InstrumentTimeline from '../InstrumentTimeline/InstrumentTimeline';
import { useOverlaps } from '../InstrumentTimeline/useOverlaps';
import PaintingTopBar from '../PaintingTopBar/PaintingTopBar';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineTracker from '../TimelineTracker/TimelineTracker';

const Timelines = React.memo(() => {
    const stageRef = useRef(null);
    const { addStageRef, overlapGroups } = useContext(CollisionsContext);
    const { playbackStatus } = useContext(RecordingsPlayerContext);
    const { hideRightClickMenu } = useContext(PanelContext);

    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    const calculatedStageWidth = window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

    const recordingsArr = Object.entries(overlapGroups);
    const EditorHeight = recordingsArr.length * TimelineHeight + markersHeight || 500;

    useEffect(() => {
        addStageRef(stageRef);
    }, [addStageRef]);

    const { overlappingIds, resetOverlaps } = useOverlaps({ eventGroups: recordingsArr });

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div onClick={hideRightClickMenu}>
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
                            overlappingIds={overlappingIds}
                            resetOverlaps={resetOverlaps}
                        />
                    ))}
                </Layer>

                <Layer>
                    <TimelineTracker
                        furthestEndTime={playbackStatus.currentInstrument || 0}
                        shouldTrack={playbackStatus.isPlaying}
                    />
                </Layer>

                <DragSelection stageRef={stageRef} width={calculatedStageWidth} height={EditorHeight} />

                <TimelineMarker duration={threeMinuteMs} height={markersHeight} pixelToSecond={pixelToSecondRatio} />
            </Stage>
        </div>
    );
});

export default Timelines;
