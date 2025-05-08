/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { Layer, Stage, useStrictMode } from 'react-konva';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { markersHeight, TimelineHeight } from '../../../../providers/TimelineProvider';
import { DragSelection } from '../DragSelection';
import InstrumentTimeline from '../InstrumentTimeline/InstrumentTimeline';
import PaintingTopBar from '../PaintingTopBar/PaintingTopBar';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineTracker from '../TimelineTracker/TimelineTracker';

const Timelines = React.memo(() => {
    const pixelToSecondRatio = usePixelRatio();
    const stageRef = useRef(null);
    const topLayerRef = useRef(null);

    const { addStageRef, overlapGroups, removeStageRef, updateBeatRef } = useContext(CollisionsContext);
    const { playbackStatus } = useContext(RecordingsPlayerContext);
    const { hideActionsMenu } = useContext(PanelContext);

    // Calculate stage width using the current window width.
    // Note: This value won't update on window resize unless you trigger a re-render.
    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    const calculatedStageWidth = window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

    const recordingsArr = useMemo(() => Object.entries(overlapGroups), [overlapGroups]);
    const EditorHeight = useMemo(
        () => (recordingsArr.length ? recordingsArr.length * TimelineHeight + markersHeight : 500),
        [recordingsArr]
    );

    useLayoutEffect(() => {
        addStageRef(stageRef);

        const topLayer = topLayerRef.current;
        if (topLayer) {
            topLayer.on('draw', updateBeatRef);
        }
        return () => {
            if (topLayer) {
                topLayer.off('draw', updateBeatRef);
            }
            removeStageRef();
        };
    }, [addStageRef, removeStageRef, updateBeatRef]);

    useStrictMode(true);

    // Memoize the click handler to avoid re-creating it on each render.
    const handleClick = useCallback(() => {
        hideActionsMenu();
    }, [hideActionsMenu]);

    return (
        <button onClick={handleClick}>
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
        </button>
    );
});

export default Timelines;
