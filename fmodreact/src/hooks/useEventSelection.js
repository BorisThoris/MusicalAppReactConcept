import { useCallback, useContext } from 'react';
import { SelectionContext } from '../providers/SelectionsProvider';
import { PanelContext } from './usePanelState';

function useEventSelection(recordingId) {
    const { isItemSelected, toggleItem: selectElement } = useContext(SelectionContext);
    const { focusedEvent, setFocusedEvent } = useContext(PanelContext);

    const isSelected = isItemSelected(recordingId);
    const isFocused = focusedEvent === recordingId;

    const handleSelect = useCallback(
        (evt) => {
            if (evt.ctrlKey) {
                selectElement(recordingId);
            }
        },
        [recordingId, selectElement]
    );

    const handleFocus = useCallback(() => {
        setFocusedEvent(isFocused ? null : recordingId);
    }, [isFocused, recordingId, setFocusedEvent]);

    return { handleFocus, handleSelect, isFocused, isSelected };
}
