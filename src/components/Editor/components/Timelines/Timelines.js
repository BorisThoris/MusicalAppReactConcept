/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { memo, useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { Layer, Stage, useStrictMode } from 'react-konva';
import threeMinuteMs from '../../../../globalConstants/songLimit';
import { PanelContext } from '../../../../hooks/usePanelState';
import { useTimeline } from '../../../../hooks/useTimeline';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { DragSelection } from '../DragSelection';
import InstrumentTimeline from '../InstrumentTimeline/InstrumentTimeline';
import PaintingTopBar from '../PaintingTopBar/PaintingTopBar';
import { TimelineControls } from '../TimelineControls';
import { TimelineDemo } from '../TimelineDemo';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineTracker from '../TimelineTracker/TimelineTracker';

const Timelines = memo(() => {
    const pixelToSecondRatio = usePixelRatio();
    const stageRef = useRef(null);
    const topLayerRef = useRef(null);

    const { addStageRef, overlapGroups, removeStageRef, updateBeatRef } = useContext(CollisionsContext);
    const { playbackStatus } = useContext(RecordingsPlayerContext);
    const { hideActionsMenu } = useContext(PanelContext);

    // Use the enhanced timeline functionality
    const { calculatedStageWidth, effectiveStageWidth, markersHeight, scrollPosition, TimelineHeight, zoomLevel } =
        useTimeline();

    // Dynamically set Konva canvas pixel ratio to 1 after mount
    useLayoutEffect(() => {
        const stage = stageRef.current;
        if (stage) {
            stage.bufferCanvas.setPixelRatio(1);
            stage.batchDraw();
        }
    }, []);

    const recordingsArr = useMemo(() => Object.entries(overlapGroups), [overlapGroups]);
    const EditorHeight = useMemo(
        () => (recordingsArr.length ? recordingsArr.length * TimelineHeight + markersHeight : 500),
        [recordingsArr, TimelineHeight, markersHeight]
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

    // Memoize the button style to avoid creating new objects on every render
    const buttonStyle = useMemo(() => ({ all: 'unset', display: 'block', width: '100%' }), []);

    return (
        <button onClick={handleClick} style={buttonStyle}>
            <PaintingTopBar />

            <TimelineControls />
            <TimelineDemo />

            <Stage width={effectiveStageWidth} height={EditorHeight} ref={stageRef} pixelRatio={1} x={-scrollPosition}>
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

                <DragSelection stageRef={stageRef} width={effectiveStageWidth} height={EditorHeight} />

                <TimelineMarker duration={threeMinuteMs} height={markersHeight} pixelToSecond={pixelToSecondRatio} />
            </Stage>
        </button>
    );
});

export default Timelines;
