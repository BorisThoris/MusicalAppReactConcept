import { useCallback, useContext, useEffect } from 'react';
import { SelectionContext } from '../../../../providers/SelectionsProvider';

const useElementSelectionMovement = ({
    elementXPosition,
    elementYPosition,
    isSelected,
    recording,
    setElementXPosition,
    setElementYPosition
}) => {
    const { setSelectedElementsCords } = useContext(SelectionContext);

    const targetId = recording.id + recording.endTime;

    const updateCords = useCallback(() => {
        setSelectedElementsCords((prevCords) => {
            if (isSelected) {
                if (
                    prevCords[targetId]?.elementXPosition !== elementXPosition ||
                    prevCords[targetId]?.elementYPosition !== elementYPosition
                ) {
                    return {
                        ...prevCords,
                        [targetId]: {
                            elementXPosition,
                            elementYPosition,
                            recording,
                            setElementXPosition,
                            setElementYPosition
                        }
                    };
                }
            } else {
                const { [targetId]: omitted, ...rest } = prevCords;
                return rest;
            }
            return prevCords;
        });
    }, [
        elementXPosition,
        elementYPosition,
        isSelected,
        recording,
        setElementXPosition,
        setElementYPosition,
        setSelectedElementsCords,
        targetId
    ]);

    useEffect(() => {
        updateCords();

        return () => {
            setSelectedElementsCords((prevCords) => {
                const { [targetId]: omitted, ...rest } = prevCords;
                return rest;
            });
        };
    }, [
        elementXPosition,
        elementYPosition,
        isSelected,
        setSelectedElementsCords,
        setElementXPosition,
        setElementYPosition,
        recording,
        updateCords,
        targetId
    ]);
};

export default useElementSelectionMovement;
