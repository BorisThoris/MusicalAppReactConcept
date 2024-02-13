// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

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

    // Additional logic to calculate panelOverlapGroup and panelRecordings
    const { panelOverlapGroup, panelRecordings } = useMemo(() => {
        const { id: groupId, instrumentName } = state.overlapGroup || {};
        const groupFromEvents = overlapGroups[instrumentName]?.find((group) => group.id === groupId);

        return {
            panelOverlapGroup: groupFromEvents,
            panelRecordings: groupFromEvents?.events
        };
    }, [state.overlapGroup, overlapGroups]);

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

    useEffect(() => {
        if (state.isOpen && state.overlapGroup) {
            const currentOverlapGroup = overlapGroups[state.instrumentName]?.[state.index];
            if (currentOverlapGroup && currentOverlapGroup.id !== state.overlapGroup.id) {
                dispatch({
                    payload: { ...state, overlapGroup: currentOverlapGroup },
                    type: 'OPEN_PANEL'
                });
            }
        }
    }, [overlapGroups, state]);

    return {
        closePanel,
        focusedEvent,
        openPanel,
        panelOverlapGroup,
        // Now accessible to components using this hook
        panelRecordings,
        panelState: state,
        setFocusedEvent
    };
};

export default usePanelState;
