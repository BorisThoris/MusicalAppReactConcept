/* eslint-disable max-len */
import { find, findIndex, indexOf } from 'lodash';
import { useCallback, useContext } from 'react';
import {
    createEventInstance,
    getEventPath,
} from '../fmodLogic/eventInstanceHelpers';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';

export const useInstrumentRecordingsOperations = () => {
    const { overlapGroups, setOverlapGroups } = useContext(
        InstrumentRecordingsContext
    );

    const resetRecordingsForInstrument = useCallback(
        (instrumentName) => {
            setOverlapGroups((prev) => ({
                ...prev,
                [instrumentName]: [],
            }));
        },
        [setOverlapGroups]
    );

    const updateRecordingParams = useCallback(
        (id, updatedParam) => {
            setOverlapGroups((prevRecordings) => {
                const updatedRecordings = { ...prevRecordings };
                Object.keys(updatedRecordings).forEach((instrumentName) => {
                    const recordings = updatedRecordings[instrumentName];
                    const recordingIndex = recordings.findIndex(
                        (recording) => recording.id === id
                    );

                    if (recordingIndex !== -1) {
                        // Find the parameter to update within the recording
                        const paramIndex = recordings[
                            recordingIndex
                        ].params.findIndex(
                            (param) => param.name === updatedParam.name
                        );
                        if (paramIndex !== -1) {
                            // Update only the targeted parameter
                            recordings[recordingIndex].params[paramIndex] =
                                updatedParam;
                        }
                    }
                });
                return updatedRecordings;
            });
        },
        [setOverlapGroups]
    );

    const updateRecordingStartTime = useCallback(
        ({ eventLength, index, instrumentName, newStartTime, parent }) => {
            setOverlapGroups((prevRecordings) => {
                const recordingsCopy = { ...prevRecordings };
                const instrumentRecordings = recordingsCopy[instrumentName];

                const targetList = parent
                    ? parent.events
                    : instrumentRecordings;

                const roundedStartTime = Math.max(
                    0,
                    parseFloat(newStartTime.toFixed(2))
                );
                const roundedEndTime = parseFloat(
                    (roundedStartTime + eventLength).toFixed(2)
                );

                const recordingToUpdate = targetList.find(
                    (recording) => recording.id === index
                );

                if (!recordingToUpdate) {
                    alert('Recording not found.');
                    return prevRecordings;
                }

                if (parent?.id === index) {
                    // eslint-disable-next-line no-param-reassign
                    parent.startTime = roundedStartTime;
                    // eslint-disable-next-line no-param-reassign
                    parent.endTime = roundedEndTime;
                }

                recordingToUpdate.startTime = roundedStartTime;
                recordingToUpdate.endTime = roundedEndTime;

                const test = indexOf(targetList, recordingToUpdate);

                targetList[test] = recordingToUpdate;

                if (parent) {
                    const parentIndex =
                        recordingsCopy[instrumentName].indexOf(parent);

                    if (parentIndex !== -1) {
                        recordingsCopy[instrumentName][parentIndex].events =
                            targetList;
                    } else {
                        alert('NO FOUND');
                    }
                } else {
                    recordingsCopy[instrumentName] = targetList;
                }

                return recordingsCopy;
            });
        },
        [setOverlapGroups]
    );

    // const updateAllRecordingStartTimes = useCallback(
    //     ({ instrumentName, newStartTime, timeIncrement }) => {
    //         setOverlapGroups((prevRecordings) => {
    //             const recordingsCopy = { ...prevRecordings };
    //             const instrumentRecordings = recordingsCopy[instrumentName];

    //             if (
    //                 !instrumentRecordings ||
    //                 instrumentRecordings.length === 0
    //             ) {
    //                 alert('No recordings found for the specified instrument.');
    //                 return prevRecordings;
    //             }

    //             let currentTime = newStartTime;

    //             instrumentRecordings.forEach((recording, index) => {
    //                 const roundedStartTime = Math.max(
    //                     0,
    //                     parseFloat(currentTime.toFixed(2))
    //                 );
    //                 const roundedEndTime = parseFloat(
    //                     (roundedStartTime + recording.eventLength).toFixed(2)
    //                 );

    //                 recording.startTime = roundedStartTime;
    //                 recording.endTime = roundedEndTime;

    //                 currentTime += timeIncrement;

    //                 // Update nested events if present
    //                 if (recording.events && recording.events.length > 0) {
    //                     recording.events.forEach((nestedEvent) => {
    //                         const nestedRoundedStartTime = Math.max(
    //                             0,
    //                             parseFloat(currentTime.toFixed(2))
    //                         );
    //                         const nestedRoundedEndTime = parseFloat(
    //                             (
    //                                 nestedRoundedStartTime +
    //                                 nestedEvent.eventLength
    //                             ).toFixed(2)
    //                         );

    //                         nestedEvent.startTime = nestedRoundedStartTime;
    //                         nestedEvent.endTime = nestedRoundedEndTime;

    //                         currentTime += timeIncrement;
    //                     });
    //                 }
    //             });

    //             recordingsCopy[instrumentName] = instrumentRecordings;

    //             return recordingsCopy;
    //         });
    //     },
    //     [setOverlapGroups]
    // );

    const updateOverlapGroupTimes = useCallback(
        ({ groupId, newEndTime, newStartTime }) => {
            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };
                Object.keys(updatedGroups).forEach((instrument) => {
                    updatedGroups[instrument] = updatedGroups[instrument].map(
                        (group) => {
                            if (group.id === groupId) {
                                const timeShift =
                                    newStartTime - group.startTime;

                                const updatedGroup = {
                                    ...group,
                                    endTime: newEndTime,
                                    startTime: newStartTime,
                                };

                                updatedGroup.events = updatedGroup.events.map(
                                    (event) => ({
                                        ...event,
                                        endTime: event.endTime + timeShift,
                                        startTime: event.startTime + timeShift,
                                    })
                                );

                                return updatedGroup;
                            }
                            return group;
                        }
                    );
                });
                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const createOverlapGroup = useCallback(
        ({ event, events }) => {
            // Create a new group object
            // DIRTY GROUP FIX
            const newGroup = {
                ...event,
                endTime: event.endTime,
                events,
                id: `${event.id}`,
                instrumentName: event.instrumentName,
                length: event.eventLength,
                locked: event.locked,
                startTime: event.startTime,
            };

            // Update the overlapGroups state to include the new group
            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };

                // If the instrument already has groups, add to them, otherwise create a new array
                if (updatedGroups[event.instrumentName]) {
                    updatedGroups[event.instrumentName].push(newGroup);
                } else {
                    updatedGroups[event.instrumentName] = [newGroup];
                }

                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const deleteEventInstance = useCallback(
        (id) => {
            setOverlapGroups((prev) => {
                const updatedRecordings = Object.keys(prev).reduce(
                    (acc, instrumentName) => {
                        const filteredRecordings = prev[instrumentName].filter(
                            (item) => item.id !== id
                        );

                        if (filteredRecordings.length > 0) {
                            acc[instrumentName] = filteredRecordings;
                        }

                        return acc;
                    },
                    {}
                );

                return updatedRecordings;
            });
        },
        [setOverlapGroups]
    );

    const deleteAllRecordingsForInstrument = useCallback(
        (instrumentName) => {
            setOverlapGroups((prev) => {
                const updatedRecordings = { ...prev };
                delete updatedRecordings[instrumentName];
                return updatedRecordings;
            });
        },
        [setOverlapGroups]
    );

    const duplicateEventInstance = useCallback(
        (oldSound) => {
            const eventPath = getEventPath(oldSound.eventInstance);
            const eventInstance = createEventInstance(eventPath);

            const { instrumentName, startTime: oldStartTime } = oldSound;

            const newSound = createSound({
                eventInstance,
                eventPath,
                instrumentName,
                startTime: oldStartTime + 0.2,
            });

            setOverlapGroups((prev) => ({
                ...prev,
                [instrumentName]: [...(prev[instrumentName] || []), newSound],
            }));
        },
        [setOverlapGroups]
    );

    const recordSoundEvent = useCallback(
        (eventInstance, instrumentName, startTime) => {
            const elapsedTime = getElapsedTime(startTime);
            const eventPath = getEventPath(eventInstance);

            const event = createSound({
                eventInstance,
                eventPath,
                instrumentName,
                startTime: elapsedTime,
            });

            // DIRTY GROUP FIX
            const newGroup = {
                ...event,
                events: [],
                locked: false,
            };

            console.log('NEW GROUP');
            console.log(newGroup);

            // Update the overlapGroups state to include the new group
            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };

                // If the instrument already has groups, add to them, otherwise create a new array
                if (updatedGroups[event.instrumentName]) {
                    updatedGroups[event.instrumentName].push(newGroup);
                } else {
                    updatedGroups[event.instrumentName] = [newGroup];
                }

                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const addRecording = useCallback(
        (eventInstance, instrumentName, startTime) => {
            recordSoundEvent(eventInstance, instrumentName, startTime);
        },
        [recordSoundEvent]
    );

    const deleteRecording = useCallback(
        (id) => {
            deleteEventInstance(id);
        },
        [deleteEventInstance]
    );

    const deleteOverlappingGroupById = (groupId) => {
        Object.keys(overlapGroups).forEach((instrument) => {
            overlapGroups[instrument] = overlapGroups[instrument].filter(
                (group) => {
                    if (group.id === groupId) {
                        group.events.forEach((event) =>
                            deleteRecording(event.id)
                        );

                        return true;
                    }
                    return false;
                }
            );
        });
    };

    const lockOverlapGroupById = useCallback(
        ({ groupId }) => {
            if (!groupId) {
                alert('GROUP ID NOT PROVIDED');
            }

            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };
                Object.keys(updatedGroups).forEach((instrument) => {
                    updatedGroups[instrument] = updatedGroups[instrument].map(
                        (group) => {
                            if (group.id === groupId) {
                                return { ...group, locked: !group.locked };
                            }
                            return group;
                        }
                    );
                });
                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const duplicateEventInstances = useCallback(
        ({ events, parentGroup }) => {
            if (!parentGroup.locked) {
                lockOverlapGroupById({ groupId: parentGroup.id });
            }

            events.forEach((event) => {
                duplicateEventInstance(event);
            });
        },
        [duplicateEventInstance, lockOverlapGroupById]
    );

    const updateRecording = useCallback(
        (params) => {
            updateRecordingStartTime(params);
        },
        [updateRecordingStartTime]
    );

    const resetRecordings = useCallback(
        (instrumentName) => {
            if (instrumentName) {
                resetRecordingsForInstrument(instrumentName);
            } else {
                setOverlapGroups({});
            }
        },
        [resetRecordingsForInstrument, setOverlapGroups]
    );

    return {
        addRecording,
        createOverlapGroup,
        deleteAllRecordingsForInstrument,
        deleteOverlappingGroupById,
        deleteRecording,
        duplicateEventInstance,
        duplicateEventInstances,
        lockOverlapGroupById,
        resetRecordings,
        updateOverlapGroupTimes,
        updateRecording,
        updateRecordingParams,
    };
};

export default useInstrumentRecordingsOperations;
