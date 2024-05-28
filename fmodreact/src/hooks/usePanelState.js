import React, { createContext, useCallback, useMemo, useReducer, useState } from 'react';

// @ts-ignore
export const PanelContext = createContext();

const initialState = {};

export const PARAMS_PANEL_ID = 'PARAMS_PANEL';
export const INSTRUMENTS_PANEL_ID = 'INSTRUMENTS_PANEL';
export const SELECTIONS_PANEL_ID = 'SELECTIONS_PANEL';

const panelReducer = (state, action) => {
    switch (action.type) {
        case 'OPEN_PANEL':
            return {
                ...state,
                [action.payload.id]: {
                    ...state[action.payload.id],
                    ...action.payload,
                    isOpen: true
                }
            };
        case 'CLOSE_PANEL':
            // eslint-disable-next-line no-case-declarations
            const { [action.payload.id]: omitted, ...remainingPanels } = state;
            return remainingPanels;
        default:
            return state;
    }
};

export const PanelProvider = ({ children }) => {
    const [focusedEvent, setFocusedEvent] = useState(-1);
    const [panels, dispatch] = useReducer(panelReducer, initialState);

    const openPanel = useCallback((payload) => {
        // @ts-ignore
        dispatch({ payload, type: 'OPEN_PANEL' });
    }, []);

    const closePanel = useCallback((id) => {
        // @ts-ignore
        dispatch({ payload: { id }, type: 'CLOSE_PANEL' });
    }, []);

    const closeParamsPanel = useCallback(() => {
        closePanel(PARAMS_PANEL_ID);
    }, [closePanel]);

    // Specific function to open ParamsPanel
    const openParamsPanel = useCallback(
        (payload) => {
            closePanel(INSTRUMENTS_PANEL_ID);
            closePanel(SELECTIONS_PANEL_ID); // Close SelectionsPanel if open
            openPanel({ id: PARAMS_PANEL_ID, ...payload });
        },
        [closePanel, openPanel]
    );

    const openInstrumentsPanel = useCallback(
        (payload) => {
            closeParamsPanel(); // Close ParamsPanel if open
            openPanel({ id: INSTRUMENTS_PANEL_ID, ...payload });
        },
        [closeParamsPanel, openPanel]
    );

    const openSelectionsPanel = useCallback(
        (payload) => {
            closeParamsPanel(); // Close ParamsPanel if open
            openPanel({ id: SELECTIONS_PANEL_ID, ...payload });
        },
        [closeParamsPanel, openPanel]
    );

    const value = useMemo(
        () => ({
            closePanel,
            closeParamsPanel,
            focusedEvent,
            openInstrumentsPanel,
            openPanel,
            openParamsPanel,
            openSelectionsPanel,
            panels,
            panelsArr: Object.values(panels),
            panelsObj: panels,
            setFocusedEvent
        }),
        [
            panels,
            focusedEvent,
            openPanel,
            closePanel,
            openParamsPanel,
            closeParamsPanel,
            openInstrumentsPanel,
            openSelectionsPanel
        ]
    );

    return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
};

export default PanelProvider;
