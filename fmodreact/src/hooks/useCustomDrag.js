import { useCallback, useContext } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { SelectionContext } from '../providers/SelectionsProvider';

export const useCustomDrag = ({ isSelected, parent, recording, timelineY, updateStartTime }) => {
    const { clearSelection } = useContext(SelectionContext);

    const dragBoundFunc = useCallback(
        (pos) => ({
            x: pos.x - 60 > 0 ? pos.x : 60,
            y: timelineY
        }),
        [timelineY]
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

    const handleDragEnd = useCallback(
        (e) => {
            const newStartTime = e.target.x() / pixelToSecondRatio;

            updateStartTime({
                newStartTime,
                recording
            });
        },
        [updateStartTime, recording]
    );

    return { dragBoundFunc, handleDragEnd, handleDragStart };
};

export default useCustomDrag;
