import React, { useCallback, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';

export const useBoxMove = ({ selectedItems }) => {
    const { updateRecording: updateStartTime } = useInstrumentRecordingsOperations();

    const [startElementRefPos, setStartElementRefPos] = useState(null);
    const [selectedElementsCords, setSelectedElementsCords] = useState({});

    const handleSelectionBoxClick = useCallback((e) => {
        setStartElementRefPos(e.target.x());
    }, []);

    console.log(selectedItems);
    const handleSelectionBoxMove = useCallback(
        (e) => {
            const deltaX = e.target.x() - startElementRefPos;

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

            Object.entries(selectedElementsCords).forEach(([id, { elementXPosition, setElementXPosition }]) => {
                const updatedXPosition = elementXPosition + deltaX;
                const newStartTime = updatedXPosition / pixelToSecondRatio;

                setElementXPosition(updatedXPosition);

                console.log('id');
                console.log(id);
                console.log(selectedItems);
                console.log(selectedItems[`${id}`]);

                if (selectedItems[id]?.instrumentName)
                    updateStartTime({
                        eventLength: selectedItems[id]?.eventLength,
                        index: id,
                        instrumentName: selectedItems[id]?.instrumentName,
                        newStartTime
                    });
            });

            setStartElementRefPos(e.target.x());
        },
        [selectedElementsCords, startElementRefPos, selectedItems, updateStartTime]
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
