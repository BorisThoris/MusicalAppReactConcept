import { useCallback } from 'react';

export const useCustomDrag = ({ timelineY }) => {
    const dragBoundFunc = useCallback(
        (pos) => ({
            x: pos.x - 60 > 0 ? pos.x : 60,
            y: timelineY
        }),
        [timelineY]
    );

    const handleDragStart = useCallback((el) => el.target.moveToTop(), []);

    return { dragBoundFunc, handleDragStart };
};

export default useCustomDrag;
