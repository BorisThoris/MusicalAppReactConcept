/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import first from 'lodash/first';
import last from 'lodash/last';
import { useCallback, useContext } from 'react';
import { createEventInstance, getEventPath } from '../fmodLogic/eventInstanceHelpers';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import { recreateEvents } from './useOverlapCalculator/GroupUtility';

export const useInstrumentRecordingsOperations = () => {
    const { flatOverlapGroups, setOverlapGroups } = useContext(InstrumentRecordingsContext);

    const getEventById = useCallback(
        (id) => {
            return flatOverlapGroups[id];
        },
        [flatOverlapGroups]
    );

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
        ({ eventId, updatedParam }) => {
            setOverlapGroups((prevRecordings) => {
                // eslint-disable-next-line no-shadow
                const updateParamsInRecording = (recordings, eventId, updatedParam) => {
                    return recordings.map((recording) => {
                        if (recording.id === eventId) {
                            // Found the recording, now update the params
                            const updatedRecording = {
                                ...recording,
                                params: recording.params.map((param) =>
                                    param.name === updatedParam.name ? updatedParam : param
                                )
                            };
                            return updatedRecording;
                        }
                        if (recording.events && recording.events.length > 0) {
                            // If the recording has nested events, search recursively
                            const updatedEvents = updateParamsInRecording(recording.events, eventId, updatedParam);
                            return { ...recording, events: updatedEvents };
                        }
                        // Return unmodified recording if no updates are necessary
                        return recording;
                    });
                };

                // Update recordings for each instrument by traversing their structure
                const updatedRecordings = Object.keys(prevRecordings).reduce((acc, instrumentName) => {
                    const recordings = prevRecordings[instrumentName];
                    acc[instrumentName] = updateParamsInRecording(recordings, eventId, updatedParam);
                    return acc;
                }, {});

                return updatedRecordings;
            });
        },
        [setOverlapGroups]
    );
    // Include getEvent in the dependency array if it's defined outside

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
        ({ eventLength, index, instrumentName, newStartTime }) => {
            setOverlapGroups((prevRecordings) => {
                const recordingsCopy = { ...prevRecordings };

                const instrumentRecordings = recordingsCopy[instrumentName];

                console.log(instrumentName);

                console.log(instrumentRecordings);

                // Update nested event times maintaining their relative offsets
                const updateNestedEvents = (event, offset) => {
                    event.startTime += offset;
                    event.endTime = event.startTime + eventLength;

                    if (event.events && event.events.length > 0) {
                        event.events.forEach((childEvent) => {
                            const childOffset = childEvent.startTime - event.startTime;
                            updateNestedEvents(childEvent, childOffset);
                        });
                    }
                };

                // Recursive function to search and update the targeted recording and its nested events
                // eslint-disable-next-line no-shadow
                const searchAndUpdateRecording = (recordings, index, newStart) => {
                    for (let i = 0; i < recordings.length; i += 1) {
                        if (`${recordings[i].id}` === `${index}`) {
                            // Calculate new start and end times
                            const offset = newStart - recordings[i].startTime;
                            recordings[i].startTime = newStart;
                            recordings[i].endTime = recordings[i].startTime + eventLength;

                            // Update nested events, if any
                            if (recordings[i].events) {
                                recordings[i].events.forEach((childEvent) => {
                                    updateNestedEvents(childEvent, offset);
                                });
                            }
                            return true;
                        }
                        if (recordings[i].events) {
                            // Continue searching within nested events
                            if (searchAndUpdateRecording(recordings[i].events, index, newStart)) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                console.log(instrumentRecordings);
                // Start the recursive search and update process
                searchAndUpdateRecording(instrumentRecordings, index, newStartTime);

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
                                ...group
                                // endTime: parseFloat((group.endTime + timeShift).toFixed(2)),
                                // startTime: parseFloat((group.startTime + timeShift).toFixed(2))
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
        (event) => {
            const eventId = event?.id;

            const deleteEventFromGroup = (group) => {
                // Directly remove the event if it matches the ID at the current level.
                if (group.id === eventId) {
                    return null;
                }

                // If the group contains nested events, filter and recursively process them.
                if (group.events) {
                    const updatedEvents = group.events
                        .map(deleteEventFromGroup) // Recursively attempt to delete nested events
                        .filter(Boolean); // Remove any null values resulting from deletions

                    return { ...group, events: updatedEvents };
                }

                return group; // Return the group unmodified if no deletions occurred
            };

            setOverlapGroups((prevOverlapGroups) => {
                const updatedOverlapGroups = Object.entries(prevOverlapGroups).reduce(
                    (acc, [instrumentName, groups]) => {
                        // Apply deleteEventFromGroup to each group, filtering out any that are null after deletion
                        const updatedGroups = groups.map(deleteEventFromGroup).filter(Boolean);

                        acc[instrumentName] = updatedGroups;
                        return acc;
                    },
                    {}
                );

                return updatedOverlapGroups;
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
        (event) => {
            deleteEventInstance(event);
        },
        [deleteEventInstance]
    );

    const lockOverlapGroupById = useCallback(
        ({ groupId }) => {
            if (!groupId) {
                alert('GROUP ID NOT PROVIDED');
                return; // Early return to avoid further execution if groupId is not provided
            }

            const toggleLockOnEvents = (events) => {
                // Assuming each event can have its own nested events
                return events.map((event) => {
                    const updatedEvent = { ...event, locked: !event.locked };
                    if (updatedEvent.events && updatedEvent.events.length > 0) {
                        updatedEvent.events = toggleLockOnEvents(updatedEvent.events); // Recursively toggle lock for nested events
                    }
                    return updatedEvent;
                });
            };

            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };
                Object.keys(updatedGroups).forEach((instrument) => {
                    updatedGroups[instrument] = updatedGroups[instrument].map((group) => {
                        if (group.id === groupId) {
                            const updatedGroup = { ...group, locked: !group.locked };
                            if (updatedGroup.events && updatedGroup.events.length > 0) {
                                updatedGroup.events = toggleLockOnEvents(updatedGroup.events); // Toggle lock for any nested events
                            }
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
        getEventById,
        lockOverlapGroupById,
        resetRecordings,
        updateOverlapGroupTimes,
        updateRecording: updateRecordingStartTime,
        updateRecordingParams
    };
};

export default useInstrumentRecordingsOperations;
