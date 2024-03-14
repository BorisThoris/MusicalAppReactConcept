import { useCallback } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';

export const useCustomDrag = ({ parent, recording, timelineY, updateStartTime }) => {
    const handleDragEnd = useCallback(
        (e) => {
            const newStartTime = e.target.x() / pixelToSecondRatio;
            updateStartTime({
                eventLength: recording.eventLength,
                index: recording.id,
                instrumentName: recording.instrumentName,
                newStartTime,
                parent
            });
        },
        [updateStartTime, recording.eventLength, recording.id, recording.instrumentName, parent]
    );

    const dragBoundFunc = useCallback(
        (pos) => ({
            x: pos.x - 60 > 0 ? pos.x : 60,
            y: timelineY
        }),
        [timelineY]
    );

    const handleDragStart = useCallback((el) => el.target.moveToTop(), []);

    return { dragBoundFunc, handleDragEnd, handleDragStart };
};

export default useCustomDrag;
