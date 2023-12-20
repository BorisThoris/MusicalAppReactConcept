import React, { useEffect, useState } from 'react';

const useStageWidth = ({ recordings }) => {
    const [furthestEndTime, setFurthestEndTime] = useState(0);
    const [furthestEndTimes, setFurthestEndTimes] = useState({});

    useEffect(() => {
        let overallMaxEndTime = 0;
        const endTimesObject = Object.entries(recordings).reduce(
            (acc, [instrumentName, recordingArray]) => {
                const maxEndTime = recordingArray.reduce(
                    (max, recording) => Math.max(max, recording.endTime),
                    0
                );
                overallMaxEndTime = Math.max(overallMaxEndTime, maxEndTime);
                acc[instrumentName] = maxEndTime;
                return acc;
            },
            {}
        );

        setFurthestEndTime(overallMaxEndTime);
        setFurthestEndTimes(endTimesObject);
    }, [recordings]);

    return { furthestEndTime, furthestEndTimes };
};

export default useStageWidth;
