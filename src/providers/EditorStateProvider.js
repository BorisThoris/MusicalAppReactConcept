import React, { createContext, useContext, useMemo } from 'react';
import { CollisionsProvider } from './CollisionsProvider/CollisionsProvider';
import { PaintingProvider } from './PaintingProvider';
import { SelectionProvider } from './SelectionsProvider';
import { SoundEventDragProvider } from './SoundEventDragProvider';

const EditorStateContext = createContext(null);

export const useEditorState = () => {
    const context = useContext(EditorStateContext);
    if (!context) {
        throw new Error('useEditorState must be used within an EditorStateProvider');
    }
    return context;
};

/**
 * Combined provider that manages all editor-related state.
 * This reduces the number of separate context providers and improves performance
 * by grouping related functionality together.
 */
export const EditorStateProvider = ({ children }) => {
    const value = useMemo(() => ({}), []);

    return (
        <EditorStateContext.Provider value={value}>
            <CollisionsProvider>
                <PaintingProvider>
                    <SelectionProvider>
                        <SoundEventDragProvider>{children}</SoundEventDragProvider>
                    </SelectionProvider>
                </PaintingProvider>
            </CollisionsProvider>
        </EditorStateContext.Provider>
    );
};
