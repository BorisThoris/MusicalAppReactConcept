import React, { createContext, useContext } from 'react';
import { useTimelineRefs } from './CollisionsProvider/hooks/useTimelineRefs';

const TimelineRefsContext = createContext();

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

    const value = {
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
    };

    return <TimelineRefsContext.Provider value={value}>{children}</TimelineRefsContext.Provider>;
};
