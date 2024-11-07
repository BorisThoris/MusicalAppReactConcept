import { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import { PanelContext } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';

export const useClickHandlers = ({ handleClickOverlapGroup, parent, recording }) => {
    const { eventInstance } = recording;
    const { openSelectionsPanel } = useContext(PanelContext);

    const { toggleItem: selectElement } = useContext(SelectionContext);

    const openSelectionPanel = useCallback(() => {
        selectElement(recording);
        openSelectionsPanel();
    }, [selectElement, openSelectionsPanel, recording]);

    const handleClick = useCallback(
        (evt) => {
            evt.evt.preventDefault();
            const isParentPresent = !!parent;

            openSelectionPanel();

            if (isParentPresent && handleClickOverlapGroup && parent.locked) {
                handleClickOverlapGroup();
            }
        },
        [parent, handleClickOverlapGroup, openSelectionPanel]
    );

    const handleDoubleClick = useCallback(() => playEventInstance(eventInstance), [eventInstance]);

    return { handleClick, handleDoubleClick };
};
