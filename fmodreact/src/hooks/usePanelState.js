import React, { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';

export const PanelContext = createContext();

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

export const PanelProvider = ({ children }) => {
    const [focusedEvent, setFocusedEvent] = useState(-1);
    const { overlapGroups } = useContext(InstrumentRecordingsContext);
    const [state, dispatch] = useReducer(panelReducer, initialState);

    const openPanel = useCallback(
        ({ index, instrumentName, x, y }) => {
            const overlapGroup = overlapGroups[instrumentName]?.[index];
            // @ts-ignore
            dispatch({
                payload: { index, instrumentName, isOpen: true, overlapGroup, x, y },
                type: 'OPEN_PANEL'
            });
        },
        [overlapGroups]
    );

    const closePanel = useCallback(() => {
        // @ts-ignore
        dispatch({ type: 'CLOSE_PANEL' });
    }, []);

    const value = useMemo(() => {
        return { closePanel, focusedEvent, openPanel, panelState: state, setFocusedEvent };
    }, [closePanel, focusedEvent, openPanel, state]);

    // @ts-ignore
    return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
};

export default PanelProvider;
