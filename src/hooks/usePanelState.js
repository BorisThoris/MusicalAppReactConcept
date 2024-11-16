// @ts-nocheck
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
        case 'SHOW_RIGHT_CLICK_MENU':
            return {
                ...state,
                actionsMenuState: { rightClickMenuVisible: true, ...action.payload }
            };
        case 'HIDE_RIGHT_CLICK_MENU': {
            const { actionsMenuState, ...newState } = state;
            return newState;
        }
        default:
            return state;
    }
};

export const PanelProvider = ({ children }) => {
    const [focusedEvent, setFocusedEvent] = useState(-1);
    const [panels, dispatch] = useReducer(panelReducer, initialState);

    const openPanel = useCallback((payload) => {
        dispatch({ payload, type: 'OPEN_PANEL' });
    }, []);

    const closePanel = useCallback((id) => {
        dispatch({ payload: { id }, type: 'CLOSE_PANEL' });
    }, []);

    const showActionsMenu = useCallback((payload) => {
        dispatch({ payload, type: 'SHOW_RIGHT_CLICK_MENU' });
    }, []);

    const hideActionsMenu = useCallback(() => {
        dispatch({ type: 'HIDE_RIGHT_CLICK_MENU' });
    }, []);

    const openInstrumentsPanel = useCallback(
        (payload) => {
            openPanel({ id: INSTRUMENTS_PANEL_ID, ...payload });
        },
        [openPanel]
    );

    const closeInstrumentLayerPanel = useCallback(() => {
        closePanel(INSTRUMENT_LAYER_PANEL_ID);
    }, [closePanel]);

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

    const closeSelectionsPanel = useCallback(() => {
        closePanel(SELECTIONS_PANEL_ID);
    }, [closePanel]);

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
            actionsMenuState: panels.actionsMenuState,
            closeInstrumentLayerPanel,
            closeLoadPanel,
            closePanel,
            closeSavePanel,
            closeSelectionsPanel,
            focusedEvent,
            hideActionsMenu,
            openInstrumentLayerPanel,
            openInstrumentsPanel,
            openLoadPanel,
            openPanel,
            openSavePanel,
            openSelectionsPanel,
            panels,
            panelsArr: Object.values(panels),
            panelsObj: panels,

            setFocusedEvent,
            showActionsMenu
        }),
        [
            closeInstrumentLayerPanel,
            closePanel,
            openLoadPanel,
            closeLoadPanel,
            closeSavePanel,
            focusedEvent,
            closeSelectionsPanel,
            openInstrumentLayerPanel,
            openInstrumentsPanel,
            openPanel,
            openSelectionsPanel,
            openSavePanel,
            panels,
            showActionsMenu,
            hideActionsMenu
        ]
    );

    return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
};
