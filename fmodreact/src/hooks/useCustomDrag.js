import { useCallback, useContext } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { SelectionContext } from '../providers/SelectionsProvider';

export const useCustomDrag = ({ groupRef, isSelected, recording, timelineY, updateStartTime }) => {
    const { clearSelection } = useContext(SelectionContext);
    const { timelineRefs } = useContext(CollisionsContext);

    const dragBoundFunc = useCallback(
        (pos) => ({
            x: pos.x - 60 > 0 ? pos.x : 60,
            y: pos.y
        }),
        []
    );

    const handleDragStart = useCallback(
        (el) => {
            el.target.moveToTop();
            if (!isSelected) {
                clearSelection();
            }
        },
        [clearSelection, isSelected]
    );

    const handleDragMoveWithCollision = useCallback(
        (e) => {
            const groupNode = groupRef.current;
            if (!groupNode) {
                console.error('Group node ref is not available.');
                return null;
            }

            const targetRect = groupNode.getClientRect();
            let nearestTimeline = null;
            let minYDistance = Infinity;

            timelineRefs.forEach(({ instrumentName, ref }) => {
                if (!ref) {
                    console.warn(`Ref for instrument ${instrumentName} is not set.`);
                    return;
                }

                const timelineRect = ref.getClientRect();
                const adjustedTimelineY = timelineRect.y;
                const yDistance = Math.abs(targetRect.y - timelineY - adjustedTimelineY);

                if (yDistance < minYDistance) {
                    minYDistance = yDistance;
                    nearestTimeline = instrumentName;
                }
            });

            if (nearestTimeline) {
                return nearestTimeline;
            }

            return null;
        },
        [groupRef, timelineRefs, timelineY]
    );

    const handleDragEnd = useCallback(
        (e) => {
            const newStartTime = e.target.x() / pixelToSecondRatio;
            const closestTimeline = handleDragMoveWithCollision(e);

            updateStartTime(
                {
                    newStartTime,
                    recording
                },
                closestTimeline
            );

            e.target.y(0);
        },
        [handleDragMoveWithCollision, updateStartTime, recording]
    );

    return { dragBoundFunc, handleDragEnd, handleDragStart };
};

export default useCustomDrag;
