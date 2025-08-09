import React, { createContext, useContext, useMemo } from 'react';
import { useTimelineRefs } from './CollisionsProvider/hooks/useTimelineRefs';

export const TimelineRefsContext = createContext();

export const useTimelineRefsContext = () => {
    const context = useContext(TimelineRefsContext);
    if (!context) {
        throw new Error('useTimelineRefsContext must be used within a TimelineRefsProvider');
    }
    return context;
};

export const TimelineRefsProvider = ({ children }) => {
    const {
        addStageRef,
        addTimelineRef,
        deleteAllTimelines,
        findAllSoundEventElements,
        getGroupById,
        getProcessedElements,
        getProcessedGroups,
        getProcessedItems,
        getSoundEventById,
        removeStageRef,
        removeTimelineRef,
        stageRef,
        timelineRefs
    } = useTimelineRefs({ setHasChanged: () => {} }); // This will be provided by parent

    const contextValue = useMemo(
        () => ({
            addStageRef,
            addTimelineRef,
            deleteAllTimelines,
            findAllSoundEventElements,
            getGroupById,
            getProcessedElements,
            getProcessedGroups,
            getProcessedItems,
            getSoundEventById,
            removeStageRef,
            removeTimelineRef,
            stageRef,
            timelineRefs
        }),
        [
            addStageRef,
            addTimelineRef,
            deleteAllTimelines,
            findAllSoundEventElements,
            getGroupById,
            getProcessedElements,
            getProcessedGroups,
            getProcessedItems,
            getSoundEventById,
            removeStageRef,
            removeTimelineRef,
            stageRef,
            timelineRefs
        ]
    );

    return <TimelineRefsContext.Provider value={contextValue}>{children}</TimelineRefsContext.Provider>;
};
