import React, { createContext, useContext } from 'react';
import { useCustomCursor } from '../hooks/useCustomCursor';

const CustomCursorContext = createContext();

export const CustomCursorProvider = ({ children, initialVisibility = false }) => {
    const cursor = useCustomCursor({ initialVisibility });

    return <CustomCursorContext.Provider value={cursor}>{children}</CustomCursorContext.Provider>;
};

export const useCustomCursorContext = () => {
    const context = useContext(CustomCursorContext);
    if (context === undefined) {
        throw new Error('useCustomCursorContext must be used within a CustomCursorProvider');
    }
    return context;
};
