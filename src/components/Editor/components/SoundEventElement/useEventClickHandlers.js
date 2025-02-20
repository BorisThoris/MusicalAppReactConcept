import { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import { PanelContext } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';

export const useClickHandlers = ({ parent, recording }) => {
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

            const overlapGroup = parent?.attrs?.['data-overlap-group'];
            const locked = overlapGroup?.locked ?? false;

            openSelectionPanel();

            if (isParentPresent && locked) {
                console.log('lol, parent');
            }
        },
        [parent, openSelectionPanel]
    );

    const handleDoubleClick = useCallback(() => playEventInstance(eventInstance), [eventInstance]);

    return { handleClick, handleDoubleClick };
};
