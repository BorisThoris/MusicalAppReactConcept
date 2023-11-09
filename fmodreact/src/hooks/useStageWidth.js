import React, { useEffect, useState } from 'react';

const useStageWidth = ({ recordings }) => {
    const [furthestEndTime, setFurthestEndTime] = useState(1);

    useEffect(() => {
        const maxEndTime = Object.values(recordings)
            .flat()
            .reduce((max, recording) => {
                return Math.max(max, recording.endTime);
            }, 0);

        setFurthestEndTime(maxEndTime);
    }, [recordings]);

    return { furthestEndTime };
};

export default useStageWidth;
