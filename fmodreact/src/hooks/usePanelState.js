import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';

const initialState = {
    index: null,
    instrumentName: '',
    isOpen: false,
    overlapGroup: null
};

const panelReducer = (state, action) => {
    switch (action.type) {
        case 'OPEN_PANEL':
            return { ...state, ...action.payload, isOpen: true };
        case 'CLOSE_PANEL':
            return initialState;
        default:
            return state;
    }
};

const usePanelState = ({ overlapGroups }) => {
    const [focusedEvent, setFocusedEvent] = useState(-1);
    const [state, dispatch] = useReducer(panelReducer, initialState);
    const { index, instrumentName, isOpen, overlapGroup } = state;

    const openPanelAction = (newIndex, newInstrumentName, newOverlapGroup) => {
        dispatch({
            payload: {
                index: newIndex,
                instrumentName: newInstrumentName,
                overlapGroup: newOverlapGroup
            },
            type: 'OPEN_PANEL'
        });
    };

    const openPanel = useCallback(
        ({ index: newIndex, instrumentName: newInstrumentName }) => {
            const newOverlapGroup = overlapGroups[newInstrumentName]?.[newIndex];
            const isPanelStateUnchanged =
                isOpen &&
                index === newIndex &&
                instrumentName === newInstrumentName &&
                overlapGroup === newOverlapGroup;

            if (isPanelStateUnchanged) {
                return;
            }

            openPanelAction(newIndex, newInstrumentName, newOverlapGroup);
        },
        [overlapGroups, index, instrumentName, isOpen, overlapGroup]
    );

    const closePanel = useCallback(() => {
        dispatch({ type: 'CLOSE_PANEL' });
    }, []);

    useEffect(() => {
        const isPanelOpenAndGroupDefined = isOpen && overlapGroup;
        const currentOverlapGroup = overlapGroups[instrumentName]?.[index];
        const hasOverlapGroupChanged = currentOverlapGroup && currentOverlapGroup !== overlapGroup;

        if (isPanelOpenAndGroupDefined && hasOverlapGroupChanged) {
            openPanelAction(index, instrumentName, currentOverlapGroup);
        } else if (!currentOverlapGroup) {
            closePanel();
        }
    }, [closePanel, index, instrumentName, isOpen, overlapGroup, overlapGroups]);

    return {
        closePanel,
        focusedEvent,
        openPanel,
        panelState: state,
        setFocusedEvent
    };
};

export default usePanelState;
