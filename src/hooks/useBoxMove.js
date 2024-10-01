import React, { useCallback, useContext, useRef } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';

export const useBoxMove = ({ selectedItems }) => {
    const { stageRef } = useContext(CollisionsContext);
    const previousXRef = useRef(null);

    const handleSelectionBoxMove = useCallback(
        (e) => {
            const stage = stageRef.current;
            const currentX = e.target.x();
            const deltaX = previousXRef.current !== null ? currentX - previousXRef.current : 0;
            previousXRef.current = currentX;

            Object.entries(selectedItems).forEach(([arrId, { id }]) => {
                const targetElement = stage.findOne(`#element-${id}`);

                if (targetElement) {
                    const absPos = targetElement.getAbsolutePosition();

                    absPos.x += deltaX;
                    targetElement.setAbsolutePosition(absPos);
                    targetElement.getLayer().batchDraw();
                }
            });
        },
        [selectedItems, stageRef]
    );

    return {
        handleSelectionBoxMove
    };
};
