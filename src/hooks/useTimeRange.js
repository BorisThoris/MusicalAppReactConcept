import { useCallback, useEffect, useState } from 'react';

export const useTimeRange = (selectedItems) => {
    const [groupStartTime, setGroupStartTime] = useState(null);
    const [groupEndTime, setGroupEndTime] = useState(null);

    const updateGroupTimeRange = useCallback(() => {
        const itemTimes = Object.values(selectedItems).map((item) => ({
            endTime: item.endTime,
            startTime: item.startTime
        }));

        const earliestStartTime = Math.min(...itemTimes.map((item) => item.startTime));
        const latestEndTime = Math.max(...itemTimes.map((item) => item.endTime));

        setGroupStartTime(earliestStartTime === Infinity ? null : earliestStartTime);
        setGroupEndTime(latestEndTime === -Infinity ? null : latestEndTime);
    }, [selectedItems]);

    useEffect(() => {
        if (Object.keys(selectedItems).length > 0) {
            updateGroupTimeRange();
        } else {
            setGroupStartTime(null);
            setGroupEndTime(null);
        }
    }, [selectedItems, updateGroupTimeRange]);

    return { groupEndTime, groupStartTime, updateGroupTimeRange };
};
