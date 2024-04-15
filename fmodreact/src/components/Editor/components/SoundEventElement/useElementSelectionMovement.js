import { useContext, useEffect } from 'react';
import { SelectionContext } from '../../../../providers/SelectionsProvider';

function useElementSelectionMovement({ elementXPosition, isSelected, recording, setElementXPosition }) {
    const { setSelectedElementsCords } = useContext(SelectionContext);

    useEffect(() => {
        setSelectedElementsCords((prevCords) => {
            if (isSelected) {
                if (prevCords[recording.id]?.elementXPosition !== elementXPosition) {
                    return {
                        ...prevCords,
                        [recording.id]: { elementXPosition, recording, setElementXPosition }
                    };
                }
            } else {
                const { [recording.id]: omitted, ...rest } = prevCords;
                return rest;
            }
            return prevCords;
        });
    }, [elementXPosition, isSelected, setSelectedElementsCords, setElementXPosition, recording]);
}

export default useElementSelectionMovement;
