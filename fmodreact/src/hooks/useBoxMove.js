import React, { useCallback, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';

export const useBoxMove = ({ selectedItems }) => {
    const { updateRecording } = useInstrumentRecordingsOperations();

    const [startElementRefPos, setStartElementRefPos] = useState(null);
    const [selectedElementsCords, setSelectedElementsCords] = useState({});

    const handleSelectionBoxClick = useCallback((e) => {
        setStartElementRefPos(e.target.x());
    }, []);

    const handleSelectionBoxMove = useCallback(
        (e) => {
            const deltaX = startElementRefPos ? e.target.x() - startElementRefPos : 0;

            Object.entries(selectedElementsCords).forEach(([id, { elementXPosition, setElementXPosition }]) => {
                if (elementXPosition) {
                    const updatedXPosition = elementXPosition + deltaX;
                    setElementXPosition(updatedXPosition);
                }
            });

            setStartElementRefPos(e.target.x());
        },
        [selectedElementsCords, startElementRefPos]
    );

    const handleSelectionBoxDragEnd = useCallback(
        (e) => {
            const deltaX = startElementRefPos ? e.target.x() - startElementRefPos : 0;

            const updates = Object.entries(selectedElementsCords)
                .map(([id, { elementXPosition, recording, setElementXPosition }]) => {
                    const updatedXPosition = elementXPosition + deltaX;
                    const newStartTime = updatedXPosition / pixelToSecondRatio;

                    setElementXPosition(updatedXPosition);

                    const selectedItem = selectedItems[recording.id];

                    if (selectedItem?.instrumentName) {
                        return {
                            newStartTime,
                            recording
                        };
                    }

                    return null;
                })
                .filter((update) => update !== null);

            if (updates.length > 0) {
                updateRecording(updates);
            }

            setStartElementRefPos(null);
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
