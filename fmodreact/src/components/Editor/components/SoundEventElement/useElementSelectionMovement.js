import { useCallback, useContext, useEffect } from 'react';
import { SelectionContext } from '../../../../providers/SelectionsProvider';

const useElementSelectionMovement = ({ elementXPosition, isSelected, recording, setElementXPosition }) => {
    const { setSelectedElementsCords } = useContext(SelectionContext);
    const targetId = recording.id + recording.length;

    const updateCords = useCallback(() => {
        setSelectedElementsCords((prevCords) => {
            if (isSelected) {
                if (prevCords[targetId]?.elementXPosition !== elementXPosition) {
                    return {
                        ...prevCords,
                        [targetId]: { elementXPosition, recording, setElementXPosition }
                    };
                }
            } else {
                const { [targetId]: omitted, ...rest } = prevCords;
                return rest;
            }
            return prevCords;
        });
    }, [elementXPosition, isSelected, recording, setElementXPosition, setSelectedElementsCords, targetId]);

    useEffect(() => {
        updateCords();

        return () => {
            setSelectedElementsCords((prevCords) => {
                const { [targetId]: omitted, ...rest } = prevCords;

                return rest;
            });
        };
    }, [elementXPosition, isSelected, setSelectedElementsCords, setElementXPosition, recording, updateCords, targetId]);
};

export default useElementSelectionMovement;
