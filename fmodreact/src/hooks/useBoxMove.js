import React, { useCallback, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';

export const useBoxMove = ({ selectedItems }) => {
    const { updateRecording } = useInstrumentRecordingsOperations();

    const [startElementRefPos, setStartElementRefPos] = useState({ x: null, y: null });
    const [selectedElementsCords, setSelectedElementsCords] = useState({});

    const handleSelectionBoxClick = useCallback((e) => {
        setStartElementRefPos({ x: e.target.x(), y: e.target.y() });
    }, []);

    const handleSelectionBoxMove = useCallback(
        (e) => {
            const deltaX = startElementRefPos.x !== null ? e.target.x() - startElementRefPos.x : 0;
            const deltaY = startElementRefPos.y !== null ? e.target.y() - startElementRefPos.y : 0;

            Object.entries(selectedElementsCords).forEach(
                ([id, { elementXPosition, elementYPosition, setElementXPosition, setElementYPosition }]) => {
                    if (elementXPosition !== undefined && elementYPosition !== undefined) {
                        const updatedXPosition = elementXPosition + deltaX;
                        const updatedYPosition = elementYPosition + deltaY;

                        setElementXPosition(updatedXPosition);
                        setElementYPosition(updatedYPosition);
                    }
                }
            );

            setStartElementRefPos({ x: e.target.x(), y: e.target.y() });
        },
        [selectedElementsCords, startElementRefPos]
    );

    const handleSelectionBoxDragEnd = useCallback(
        (e) => {
            const deltaX = startElementRefPos.x !== null ? e.target.x() - startElementRefPos.x : 0;
            const deltaY = startElementRefPos.y !== null ? e.target.y() - startElementRefPos.y : 0;

            const updates = Object.entries(selectedElementsCords)
                .map(
                    ([
                        id,
                        { elementXPosition, elementYPosition, recording, setElementXPosition, setElementYPosition }
                    ]) => {
                        const updatedXPosition = elementXPosition + deltaX;
                        const updatedYPosition = elementYPosition + deltaY;
                        const newStartTime = updatedXPosition / pixelToSecondRatio;

                        setElementXPosition(updatedXPosition);
                        setElementYPosition(updatedYPosition);

                        const selectedItem = selectedItems[recording.id];

                        if (selectedItem?.instrumentName) {
                            return {
                                newStartTime,
                                recording,
                                updatedYPosition // include Y position if needed for updates
                            };
                        }

                        return null;
                    }
                )
                .filter((update) => update !== null);

            if (updates.length > 0) {
                updateRecording(updates);
            }

            setStartElementRefPos({ x: null, y: null });
        },
        [startElementRefPos, selectedElementsCords, selectedItems, updateRecording]
    );

    return {
        handleSelectionBoxClick,
        handleSelectionBoxDragEnd,
        handleSelectionBoxMove,
        selectedElementsCords,
        setSelectedElementsCords
    };
};

export default useBoxMove;
