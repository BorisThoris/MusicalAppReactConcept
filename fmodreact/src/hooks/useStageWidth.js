import React, { useEffect, useState } from 'react';

const useStageWidth = ({ recordings }) => {
    const [furthestEndTime, setFurthestEndTime] = useState(0);
    const [furthestEndTimes, setFurthestEndTimes] = useState({});

    useEffect(() => {
        let overallMaxEndTime = 0;
        const endTimesObject = Object.entries(recordings).reduce((acc, [instrumentName, recordingsObj]) => {
            // Convert the recordings object into an array of end times and then find the maximum
            const maxEndTime = Math.max(...Object.values(recordingsObj).map((recording) => recording.endTime));
            // Update the overall maximum end time encountered so far
            overallMaxEndTime = Math.max(overallMaxEndTime, maxEndTime);
            // Store the maximum end time for each instrument in the accumulator object
            acc[instrumentName] = maxEndTime;
            return acc;
        }, {});

        // Set the state for the overall furthest end time across all instruments
        setFurthestEndTime(overallMaxEndTime);
        // Set the state for the furthest end time per instrument
        setFurthestEndTimes(endTimesObject);
    }, [recordings]); // Effect depends on the recordings object

    // Return both the overall maximum and per-instrument maximum end times
    return { furthestEndTime, furthestEndTimes };
};

export default useStageWidth;
