// providers/PixelRatioProvider.tsx
import React, { createContext, useContext } from 'react';
import { usePixelToSecondRatio } from './usePixelToSecondRatio';

const PixelRatioContext = createContext(1);

export function PixelRatioProvider({ children, durationSec }) {
    const ratio = usePixelToSecondRatio(durationSec);

    return <PixelRatioContext.Provider value={ratio}>{children}</PixelRatioContext.Provider>;
}

export function usePixelRatio() {
    return useContext(PixelRatioContext);
}
