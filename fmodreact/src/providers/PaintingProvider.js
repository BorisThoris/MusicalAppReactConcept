import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createAndPlayEventIntance } from '../fmodLogic/eventInstanceHelpers';
import useRecorder from '../hooks/useRecorder';

// Create the Context
const PaintingContext = createContext({
    paintEvent: ({ target, x }) => {},
    paintingTarget: '',
    selectedEvent: null
});

// Create the Provider component
const PaintingProviderComponent = ({ children }) => {
    const [paintingTarget, setPaintingTarget] = useState(null);
    const { recordEventNoVerify } = useRecorder();

    const paintEvent = useCallback(
        ({ target, x }) => {
            const eventInstance = createAndPlayEventIntance(`${paintingTarget.instrument}/${paintingTarget.event}`);

            recordEventNoVerify({ event: eventInstance, instrumentName: target, x });
        },
        [paintingTarget, recordEventNoVerify]
    );

    const value = useMemo(() => {
        return { paintEvent, paintingTarget, setPaintingTarget };
    }, [paintEvent, paintingTarget]);

    return <PaintingContext.Provider value={value}>{children}</PaintingContext.Provider>;
};

// Wrap the component with React.memo
export const PaintingProvider = React.memo(PaintingProviderComponent);

// Custom hook to use the PaintingContext
export const usePaintings = () => {
    const context = useContext(PaintingContext);
    if (!context) {
        throw new Error('usePaintings must be used within a PaintingProvider');
    }
    return context;
};
