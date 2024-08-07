import React, { createContext, useCallback, useMemo, useReducer, useState } from 'react';

// @ts-ignore
export const PanelContext = createContext();

const initialState = {};

export const INSTRUMENTS_PANEL_ID = 'INSTRUMENTS_PANEL';
export const SELECTIONS_PANEL_ID = 'SELECTIONS_PANEL';
export const INSTRUMENT_LAYER_PANEL_ID = 'INSTRUMENT_LAYER_PANEL';
export const LOAD_PANEL_ID = 'LOAD_PANEL';
export const SAVE_PANEL_ID = 'SAVE_PANEL';

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

    const openInstrumentsPanel = useCallback(
        (payload) => {
            openPanel({ id: INSTRUMENTS_PANEL_ID, ...payload });
        },
        [openPanel]
    );

    const closeInstrumentLayerPanel = useCallback(
        (payload) => {
            closePanel(INSTRUMENT_LAYER_PANEL_ID);
        },
        [closePanel]
    );

    const openInstrumentLayerPanel = useCallback(
        (payload) => {
            openPanel({ id: INSTRUMENT_LAYER_PANEL_ID, ...payload });
        },
        [openPanel]
    );

    const openSelectionsPanel = useCallback(
        (payload) => {
            openPanel({ id: SELECTIONS_PANEL_ID, ...payload });
        },
        [openPanel]
    );

    const openLoadPanel = useCallback(
        (payload) => {
            openPanel({ id: LOAD_PANEL_ID, ...payload });
        },
        [openPanel]
    );

    const closeLoadPanel = useCallback(() => {
        closePanel(LOAD_PANEL_ID);
    }, [closePanel]);

    const openSavePanel = useCallback(
        (payload) => {
            openPanel({ id: SAVE_PANEL_ID, ...payload });
        },
        [openPanel]
    );

    const closeSavePanel = useCallback(() => {
        closePanel(SAVE_PANEL_ID);
    }, [closePanel]);

    const value = useMemo(
        () => ({
            closeInstrumentLayerPanel,
            closeLoadPanel,
            closePanel,
            closeSavePanel,
            focusedEvent,
            openInstrumentLayerPanel,
            openInstrumentsPanel,
            openLoadPanel,
            openPanel,
            openSavePanel,
            openSelectionsPanel,
            panels,
            panelsArr: Object.values(panels),
            panelsObj: panels,
            setFocusedEvent
        }),
        [
            closeInstrumentLayerPanel,
            closePanel,
            openLoadPanel,
            closeLoadPanel,
            closeSavePanel,
            focusedEvent,
            openInstrumentLayerPanel,
            openInstrumentsPanel,
            openPanel,
            openSelectionsPanel,
            openSavePanel,
            panels
        ]
    );

    return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
};

export default PanelProvider;
