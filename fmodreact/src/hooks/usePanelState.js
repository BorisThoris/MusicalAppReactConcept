// @ts-nocheck
import React, { useCallback, useReducer, useState } from 'react';

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

export const usePanelState = ({ overlapGroups }) => {
    const [focusedEvent, setFocusedEvent] = useState(-1);
    const [state, dispatch] = useReducer(panelReducer, initialState);

    const openPanel = useCallback(
        ({ index, instrumentName, x, y }) => {
            const overlapGroup = overlapGroups[instrumentName]?.[index];
            dispatch({
                payload: { index, instrumentName, isOpen: true, overlapGroup, x, y },
                type: 'OPEN_PANEL'
            });
        },
        [overlapGroups]
    );

    const closePanel = useCallback(() => {
        dispatch({ type: 'CLOSE_PANEL' });
    }, []);

    return {
        closePanel,
        focusedEvent,
        openPanel,
        panelState: state,
        setFocusedEvent
    };
};

export default usePanelState;
