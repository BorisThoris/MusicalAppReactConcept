import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createAndPlayEventIntance, getEventPath } from '../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { createSound } from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import useRecorder from '../hooks/useRecorder';

// Create the Context
const PaintingContext = createContext({
    paintEvent: ({ renderEvent, target, x }) => {},
    paintingTarget: '',
    selectedEvent: null
});

// Create the Provider component
const PaintingProviderComponent = ({ children }) => {
    const [paintingTarget, setPaintingTarget] = useState(null);

    const paintEvent = useCallback(
        ({ renderEvent, target, x }) => {
            const eventInstance = createAndPlayEventIntance(`${paintingTarget.instrument}/${paintingTarget.event}`);

            const startTime = x / pixelToSecondRatio;
            const startOffset = null;

            const elapsedTime = getElapsedTime(startTime, null);
            const eventPath = getEventPath(eventInstance);

            const event = createSound({
                eventInstance,
                eventPath,
                instrumentName: target,
                startTime: startOffset || startOffset === 0 ? elapsedTime : startTime
            });

            renderEvent(event);
        },
        [paintingTarget]
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
