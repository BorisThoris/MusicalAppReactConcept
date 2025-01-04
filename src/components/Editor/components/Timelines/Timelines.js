/* eslint-disable jsx-a11y/click-events-have-key-events */
import isEqual from 'lodash/isEqual';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { markersHeight, TimelineHeight } from '../../../../providers/TimelineProvider';
import { DragSelection } from '../DragSelection';
import InstrumentTimeline from '../InstrumentTimeline/InstrumentTimeline';
import PaintingTopBar from '../PaintingTopBar/PaintingTopBar';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineTracker from '../TimelineTracker/TimelineTracker';

const Timelines = React.memo(() => {
    const stageRef = useRef(null);
    const topLayerRef = useRef(null);

    const { addStageRef, overlapGroups, removeStageRef, updateBeatRef } = useContext(CollisionsContext);
    const { playbackStatus } = useContext(RecordingsPlayerContext);
    const { hideActionsMenu } = useContext(PanelContext);

    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    const calculatedStageWidth = window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

    const recordingsArr = useMemo(() => Object.entries(overlapGroups), [overlapGroups]);
    const EditorHeight = useMemo(() => recordingsArr.length * TimelineHeight + markersHeight || 500, [recordingsArr]);

    useEffect(() => {
        addStageRef(stageRef);

        // Attach event listener to the top layer
        const topLayer = topLayerRef.current;
        if (topLayer) {
            topLayer.on('draw', updateBeatRef);
        }

        // Cleanup event listener
        return () => {
            if (topLayer) {
                topLayer.off('draw', updateBeatRef);
            }
            removeStageRef();
        };
    }, [addStageRef, removeStageRef, updateBeatRef]);

    return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div onClick={hideActionsMenu}>
            <PaintingTopBar />

            <Stage width={calculatedStageWidth} height={EditorHeight} ref={stageRef}>
                <Layer ref={topLayerRef} name="top-layer">
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
                    <TimelineTracker furthestEndTime={playbackStatus.currentInstrument || 0} />
                </Layer>

                <DragSelection stageRef={stageRef} width={calculatedStageWidth} height={EditorHeight} />

                <TimelineMarker duration={threeMinuteMs} height={markersHeight} pixelToSecond={pixelToSecondRatio} />
            </Stage>
        </div>
    );
});

export default Timelines;
