/* eslint-disable max-len */
import { indexOf } from 'lodash';
import { useCallback, useContext } from 'react';
import { createEventInstance, getEventPath } from '../fmodLogic/eventInstanceHelpers';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import { recreateEvents } from './useOverlapCalculator/GroupUtility';

export const useInstrumentRecordingsOperations = () => {
    const { overlapGroups, setOverlapGroups } = useContext(InstrumentRecordingsContext);

    const resetRecordingsForInstrument = useCallback(
        (instrumentName) => {
            setOverlapGroups((prev) => ({
                ...prev,
                [instrumentName]: []
            }));
        },
        [setOverlapGroups]
    );

    const updateRecordingParams = useCallback(
        ({ eventId, parent, updatedParam }) => {
            setOverlapGroups((prevRecordings) => {
                const updatedRecordings = { ...prevRecordings };

                Object.keys(updatedRecordings).forEach((instrumentName) => {
                    const recordings = updatedRecordings[instrumentName];
                    const isGroup = parent.events.length > 1;
                    const targetList = isGroup ? parent.events : recordings;

                    const recordingIndex = targetList.findIndex((recording) => recording.id === eventId);

                    if (recordingIndex !== -1) {
                        const updatedRecording = {
                            ...targetList[recordingIndex],
                            params: targetList[recordingIndex].params.map((param) =>
                                param.name === updatedParam.name ? updatedParam : param
                            )
                        };

                        targetList[recordingIndex] = updatedRecording;
                    } else {
                        alert('Recording not found.');
                    }
                });

                return { ...updatedRecordings };
            });
        },
        [setOverlapGroups]
    );

    const updateRecordingStartTime = useCallback(
        ({ eventLength, index, instrumentName, newStartTime, parent }) => {
            setOverlapGroups((prevRecordings) => {
                const recordingsCopy = { ...prevRecordings };
                const instrumentRecordings = recordingsCopy[instrumentName];

                const targetList = parent ? parent.events : instrumentRecordings;

                const roundedStartTime = Math.max(0, parseFloat(newStartTime.toFixed(2)));
                const roundedEndTime = parseFloat((roundedStartTime + eventLength).toFixed(2));

                const recordingToUpdate = targetList.find((recording) => recording.id === index);

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
                    const parentIndex = recordingsCopy[instrumentName].indexOf(parent);

                    if (parentIndex !== -1) {
                        recordingsCopy[instrumentName][parentIndex].events = targetList;
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

    const updateOverlapGroupTimes = useCallback(
        ({ groupId, newStartTime }) => {
            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };
                Object.keys(updatedGroups).forEach((instrument) => {
                    updatedGroups[instrument] = updatedGroups[instrument].map((group) => {
                        if (group.id === groupId) {
                            const timeShift = newStartTime - group.startTime;

                            const updatedGroup = {
                                ...group,
                                endTime: group.endTime + timeShift,
                                startTime: group.startTime + timeShift
                            };

                            updatedGroup.events = updatedGroup.events.map((event) => ({
                                ...event,
                                endTime: event.endTime + timeShift,
                                startTime: event.startTime + timeShift
                            }));

                            return updatedGroup;
                        }
                        return group;
                    });
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
                startTime: event.startTime
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
        (event, parent) => {
            setOverlapGroups((prevRecordings) => {
                const updatedRecordings = { ...prevRecordings };
                const eventId = event.id;

                Object.keys(updatedRecordings).forEach((instrumentName) => {
                    const recordings = updatedRecordings[instrumentName];

                    // If the event is part of a group, update the group events
                    if (parent && parent.events && parent.events.length > 1) {
                        const updatedEvents = parent.events.filter((recording) => recording.id !== eventId);

                        if (updatedEvents.length !== parent.events.length) {
                            // Find the parent group in the recordings and update it
                            updatedRecordings[instrumentName] = recordings.map((group) =>
                                group === parent ? { ...group, events: updatedEvents } : group
                            );
                        }
                    } else {
                        // If the event is not part of a group, filter it out from the recordings
                        updatedRecordings[instrumentName] = recordings.filter((recording) => recording.id !== eventId);
                    }
                });

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
                startTime: oldStartTime + 0.2
            });

            setOverlapGroups((prev) => ({
                ...prev,
                [instrumentName]: [...(prev[instrumentName] || []), newSound]
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
                startTime: elapsedTime
            });

            // DIRTY GROUP FIX
            const newGroup = {
                ...event,
                events: [],
                locked: false
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

    const addRecording = useCallback(
        (eventInstance, instrumentName, startTime) => {
            recordSoundEvent(eventInstance, instrumentName, startTime);
        },
        [recordSoundEvent]
    );

    const deleteRecording = useCallback(
        (event, parent) => {
            deleteEventInstance(event, parent);
        },
        [deleteEventInstance]
    );

    const lockOverlapGroupById = useCallback(
        ({ groupId }) => {
            if (!groupId) {
                alert('GROUP ID NOT PROVIDED');
            }

            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };
                Object.keys(updatedGroups).forEach((instrument) => {
                    updatedGroups[instrument] = updatedGroups[instrument].map((group) => {
                        if (group.id === groupId) {
                            return { ...group, locked: !group.locked };
                        }
                        return group;
                    });
                });
                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const duplicateOverlapGroup = useCallback(
        ({ overlapGroup }) => {
            const newGroup = recreateEvents({
                groupsToRecreate: [overlapGroup]
            })[0];

            newGroup.id += newGroup.id;
            newGroup.locked = true;
            newGroup.id = `${newGroup.id}`;

            // Update the overlapGroups state to include the new group
            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };

                updatedGroups[newGroup.instrumentName].push(newGroup);

                return updatedGroups;
            });
        },
        [setOverlapGroups]
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
        deleteRecording,
        duplicateEventInstance,
        duplicateOverlapGroup,
        lockOverlapGroupById,
        resetRecordings,
        updateOverlapGroupTimes,
        updateRecording,
        updateRecordingParams
    };
};

export default useInstrumentRecordingsOperations;
