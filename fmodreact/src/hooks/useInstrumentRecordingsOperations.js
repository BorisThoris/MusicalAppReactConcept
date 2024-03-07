/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import first from 'lodash/first';
import indexOf from 'lodash/indexOf';
import last from 'lodash/last';
import { useCallback, useContext } from 'react';
import { createEventInstance, getEventPath } from '../fmodLogic/eventInstanceHelpers';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import { recreateEvents } from './useOverlapCalculator/GroupUtility';

export const useInstrumentRecordingsOperations = () => {
    const { setOverlapGroups } = useContext(InstrumentRecordingsContext);

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

    const duplicateInstrument = useCallback(
        ({ instrumentName }) => {
            const nameRegex = /^(.*?)(?:\s+(\d+))?$/;
            const match = instrumentName.match(nameRegex);

            const baseName = match ? match[1] : instrumentName;
            let number = match && match[2] ? parseInt(match[2], 10) : 1;
            let newInstrumentName = `${baseName} ${number}`;

            setOverlapGroups((prevGroups) => {
                const originalGroups = prevGroups[instrumentName];

                if (!originalGroups) {
                    alert('Original instrument data not found. Cannot duplicate.');
                    return prevGroups;
                }

                while (Object.prototype.hasOwnProperty.call(prevGroups, newInstrumentName)) {
                    number += 1;
                    newInstrumentName = `${baseName} ${number}`;
                }

                const duplicatedGroups = originalGroups.map((group) => {
                    const recreatedGroup = recreateEvents({
                        groupsToRecreate: [group]
                    })[0];

                    const newGroupId = `${recreatedGroup.id}_dup`;

                    return {
                        ...recreatedGroup,
                        id: newGroupId,
                        instrumentName: newInstrumentName
                    };
                });

                return {
                    ...prevGroups,
                    [newInstrumentName]: duplicatedGroups
                };
            });

            return newInstrumentName;
        },
        [setOverlapGroups]
    );

    const updateRecordingStartTime = useCallback(
        ({ eventLength, index, instrumentName, newStartTime, parent = undefined }) => {
            setOverlapGroups((prevRecordings) => {
                const recordingsCopy = { ...prevRecordings };
                const instrumentRecordings = recordingsCopy[instrumentName];

                const targetList = parent ? parent.events : instrumentRecordings;

                const roundedStartTime = Math.max(0, parseFloat(newStartTime.toFixed(2)));
                const roundedEndTime = parseFloat((roundedStartTime + eventLength).toFixed(2));

                const recordingToUpdate = targetList.find((recording) => `${recording.id}` === `${index}`);

                if (!recordingToUpdate) {
                    return prevRecordings;
                }

                if (parent?.id === index) {
                    parent.startTime = roundedStartTime;
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
                                endTime: parseFloat((group.endTime + timeShift).toFixed(2)),
                                startTime: parseFloat((group.startTime + timeShift).toFixed(2))
                            };

                            updatedGroup.events = updatedGroup.events.map((event) => ({
                                ...event,
                                endTime: parseFloat((event.endTime + timeShift).toFixed(2)),
                                startTime: parseFloat((event.startTime + timeShift).toFixed(2))
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
                const eventId = event?.id;

                Object.keys(updatedRecordings).forEach((instrumentName) => {
                    const recordings = updatedRecordings[instrumentName];

                    if (parent && parent.events && parent.events.length > 1) {
                        const updatedEvents = parent.events.filter((recording) => recording.id !== eventId);

                        if (updatedEvents.length !== parent.events.length) {
                            updatedRecordings[instrumentName] = recordings.map((group) =>
                                group === parent ? { ...group, events: updatedEvents } : group
                            );
                        }
                    } else {
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

            const event = createSound({
                eventInstance,
                eventPath,
                instrumentName,
                startTime: oldStartTime + 0.2
            });

            // DIRTY GROUP FIX
            const newGroup = {
                ...event,
                events: [],
                locked: true
            };

            setOverlapGroups((prev) => ({
                ...prev,
                [instrumentName]: [...(prev[instrumentName] || []), newGroup]
            }));
        },
        [setOverlapGroups]
    );

    const recordSoundEvent = useCallback(
        (eventInstance, instrumentName, startTime, startOffset) => {
            const elapsedTime = getElapsedTime(startTime, startOffset);
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

            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };

                if (updatedGroups[instrumentName]) {
                    updatedGroups[instrumentName].push(newGroup);
                } else {
                    updatedGroups[instrumentName] = [newGroup];
                }

                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const addRecording = useCallback(
        (eventInstance, instrumentName, startTime, startOffset) => {
            recordSoundEvent(eventInstance, instrumentName, startTime, startOffset);
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

            newGroup.endTime = last(newGroup.events).endTime;
            newGroup.startTime = first(newGroup.events).startTime;

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
        duplicateInstrument,
        duplicateOverlapGroup,
        lockOverlapGroupById,
        resetRecordings,
        updateOverlapGroupTimes,
        updateRecording,
        updateRecordingParams
    };
};

export default useInstrumentRecordingsOperations;
