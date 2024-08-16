import { useCallback, useContext } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { SelectionContext } from '../providers/SelectionsProvider';

export const useCustomDrag = ({ groupRef, isSelected, recording, updateStartTime }) => {
    const { clearSelection } = useContext(SelectionContext);

    const dragBoundFunc = useCallback(
        (pos) => ({
            x: pos.x - 60 > 0 ? pos.x : 60,
            y: pos.y // Allow free movement along the y-axis during dragging
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

    function haveIntersection(r1, r2) {
        return !(
            r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y
        );
    }

    const handleDragMoveWithCollision = useCallback(
        (e) => {
            const groupNode = groupRef.current;
            const targetRect = groupNode.getClientRect();

            // Get the layer containing this group
            const layer = groupNode.getLayer();

            let nearestCollision = null;
            let minDistance = Infinity;

            layer.parent.children.forEach((group) => {
                if (group === groupNode) {
                    return; // skip self
                }
                const groupRect = group.getClientRect();

                if (haveIntersection(groupRect, targetRect)) {
                    // Calculate the distance between the centers of the two rectangles
                    const distance = Math.sqrt(
                        (targetRect.x + targetRect.width / 2 - (groupRect.x + groupRect.width / 2)) ** 2 +
                            (targetRect.y + targetRect.height / 2 - (groupRect.y + groupRect.height / 2)) ** 2
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestCollision = group;
                    }
                }
            });

            if (nearestCollision) {
                const rectsWithTimelineId = nearestCollision.children.find(
                    (node) => node.className === 'Rect' && node.attrs.id && node.attrs.id.includes('Timeline')
                );

                if (rectsWithTimelineId) {
                    console.log(`Nearest collision with: ${rectsWithTimelineId.attrs.id}`);

                    return rectsWithTimelineId.attrs.id;
                    // Additional handling logic for the nearest collision can be added here
                }
            }
        },
        [groupRef]
    );

    const handleDragEnd = useCallback(
        (e) => {
            const newStartTime = e.target.x() / pixelToSecondRatio;

            // Snap back to the original timelineY after drag ends
            // const currentTimeline = handleDragMoveWithCollision(e);
            updateStartTime({
                newStartTime,
                recording
            });

            e.target.y(0);
        },
        [updateStartTime, recording]
    );

    return { dragBoundFunc, handleDragEnd, handleDragStart };
};

export default useCustomDrag;
