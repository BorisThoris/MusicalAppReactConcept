/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
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
                [instrumentName]: {} // Changed from [] to {}
            }));
        },
        [setOverlapGroups]
    );

    const updateRecordingParams = useCallback(
        ({ event, updatedParam }) => {
            const { id: eventId, instrumentName, parentId } = event;

            setOverlapGroups((prevRecordings) => {
                const updateParamsInEvent = (event, updatedParam) => {
                    if (event.id === eventId) {
                        console.log(event.params);

                        return {
                            ...event,
                            params: event.params.map((param) =>
                                param.name === updatedParam.name ? updatedParam : param
                            )
                        };
                    }

                    if (event.events && Object.keys(event.events).length > 0) {
                        const updatedNestedEvents = Object.entries(event.events).reduce((acc, [key, nestedEvent]) => {
                            acc[key] = updateParamsInEvent(nestedEvent, updatedParam);
                            return acc;
                        }, {});

                        return { ...event, events: updatedNestedEvents };
                    }

                    return event;
                };

                const updatedEvent = updateParamsInEvent(event, updatedParam);
                const instrumentRecordings = prevRecordings[instrumentName];

                if (parentId) {
                    instrumentRecordings[parentId].events[eventId] = updatedEvent;
                } else {
                    instrumentRecordings[eventId] = updatedEvent;
                    instrumentRecordings[eventId].events = {
                        [eventId]: { ...updatedEvent, events: null }
                    };
                }

                return {
                    ...prevRecordings
                };
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

                // Check if newInstrumentName already exists and increment number if it does
                while (Object.prototype.hasOwnProperty.call(prevGroups, newInstrumentName)) {
                    number += 1;
                    newInstrumentName = `${baseName} ${number}`;
                }

                // Duplicate each group in the original groups and recreate events
                const duplicatedGroups = Object.entries(originalGroups).reduce((newGroups, [groupId, group]) => {
                    const recreatedGroup = recreateEvents({
                        existingInstrumentName: newInstrumentName,
                        groupsToRecreate: [group]
                    })[0]; // Recreate events for the group

                    const newGroupId = `${recreatedGroup.id}-${number}`; // Generate a new ID for the group

                    newGroups[newGroupId] = {
                        ...recreatedGroup,
                        id: newGroupId,
                        instrumentName: newInstrumentName
                    };
                    return newGroups;
                }, {});

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
        ({ newStartTime, recording }) => {
            const index = recording.id;
            const instrumentName = recording.instrumentName;
            const eventLength = recording.eventLength;

            setOverlapGroups((prevRecordings) => {
                const recordingsCopy = { ...prevRecordings };

                const instrumentRecordings = recordingsCopy[instrumentName];

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

                const searchAndUpdateRecording = (recordings, id, newStart) => {
                    // Convert the recordings object into an array for finding a specific recording

                    const recordingKey = Object.keys(recordings).find((key) => `${recordings[key].id}` === `${id}`);
                    const recording = recordings[recordingKey];

                    if (recording) {
                        const offset = newStart - recording.startTime;
                        recording.startTime = newStart;
                        recording.endTime = recording.startTime + eventLength; // Ensure `eventLength` is defined in the scope

                        // Update nested events, if any and applicable
                        if (recording.events) {
                            Object.values(recording.events).forEach((event) => {
                                if (!recording.locked && event.id === index) {
                                    // Ensure `index` is defined in the scope
                                    updateNestedEvents(event, offset); // Ensure this function is defined in the scope
                                }
                            });
                        }

                        return true;
                    }

                    // Continue searching within nested events
                    return Object.values(recordings).some(
                        (rec) => rec.events && searchAndUpdateRecording(rec.events, id, newStart)
                    );
                };

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

                // Iterate over each instrument's group of events
                Object.keys(updatedGroups).forEach((instrument) => {
                    const groups = updatedGroups[instrument];

                    // Check if the specific group is present in the current instrument's groups
                    if (groups[groupId]) {
                        const group = groups[groupId];
                        const timeShift = newStartTime - group.startTime;

                        // Update the main group's start and end times
                        groups[groupId] = {
                            ...group,
                            endTime: parseFloat((group.endTime + timeShift).toFixed(2)),
                            startTime: parseFloat(newStartTime.toFixed(2))
                        };

                        // If there are nested events, update their times as well
                        if (group.events) {
                            Object.keys(group.events).forEach((eventId) => {
                                const event = group.events[eventId];
                                group.events[eventId] = {
                                    ...event,
                                    endTime: parseFloat((event.endTime + timeShift).toFixed(2)),
                                    startTime: parseFloat((event.startTime + timeShift).toFixed(2))
                                };
                            });
                        }
                    }
                });

                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const deleteOverlapGroup = useCallback(
        (group) => {
            const groupId = group.id;
            console.log(groupId);

            if (!groupId) {
                console.warn('No group ID provided for deletion');
                return;
            }

            setOverlapGroups((prevOverlapGroups) => {
                const updatedOverlapGroups = { ...prevOverlapGroups };

                Object.entries(updatedOverlapGroups).forEach(([instrumentName, instrumentData]) => {
                    if (instrumentData[groupId]) {
                        // Delete the entire group
                        delete instrumentData[groupId];
                    }
                });

                return updatedOverlapGroups;
            });
        },
        [setOverlapGroups]
    );

    const deleteEventInstance = useCallback(
        (event) => {
            const { id: eventId, parentId } = event;

            if (!eventId) {
                console.warn('No event ID provided for deletion');
                return;
            }

            setOverlapGroups((prevOverlapGroups) => {
                const updatedOverlapGroups = { ...prevOverlapGroups };

                Object.entries(updatedOverlapGroups).forEach(([instrumentName, instrumentData]) => {
                    const instrumentRecordings = instrumentData;

                    if (parentId) {
                        const parentGroup = instrumentRecordings[parentId];
                        if (parentGroup && parentGroup.events) {
                            const updatedEvents = { ...parentGroup.events };
                            delete updatedEvents[eventId];
                            parentGroup.events = updatedEvents;

                            // Check if the parent should be deleted
                            if (parentId === eventId && Object.keys(updatedEvents).length === 0) {
                                delete instrumentRecordings[parentId];
                            }
                        }
                    } else {
                        const eventGroup = instrumentRecordings[eventId];
                        if (eventGroup) {
                            const remainingEvents = { ...eventGroup.events };
                            delete remainingEvents[eventId];

                            if (Object.keys(remainingEvents).length === 0) {
                                // Delete the entire parent as there are no other events
                                delete instrumentRecordings[eventId];
                            } else {
                                // Update the ID of the main group/parent to the ID of the event with the lowest start time
                                const sortedEvents = Object.values(remainingEvents).sort(
                                    (a, b) => a.startTime - b.startTime
                                );
                                const newParentId = sortedEvents[0].id;

                                instrumentRecordings[newParentId] = {
                                    ...eventGroup,
                                    events: remainingEvents,
                                    id: newParentId
                                };
                                delete instrumentRecordings[eventId];

                                // Update the parent IDs of all events to the new ID
                                sortedEvents.forEach((ev) => {
                                    ev.parentId = newParentId;
                                });
                            }
                        } else if (instrumentRecordings.events && instrumentRecordings.events[eventId]) {
                            const updatedEvents = { ...instrumentRecordings.events };
                            delete updatedEvents[eventId];
                            instrumentRecordings.events = updatedEvents;
                        }
                    }
                });

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

            const { instrumentName, params, startTime: oldStartTime } = oldSound;

            const event = createSound({
                eventInstance,
                eventPath,
                instrumentName,
                passedParams: params,
                startTime: oldStartTime + 0.2
            });

            // DIRTY GROUP FIX
            const newGroup = {
                ...event,
                events: { [event.id]: { ...event, parentId: event.id } },
                locked: true
            };

            setOverlapGroups((prev) => {
                const prevInstrumentGroups = prev[instrumentName] || {};
                return {
                    ...prev,
                    [instrumentName]: {
                        ...prevInstrumentGroups,
                        [event.id]: newGroup
                    }
                };
            });
        },
        [setOverlapGroups]
    );

    const recordSoundEvent = useCallback(
        (eventInstance, instrumentName, startTime, startOffset) => {
            const elapsedTime = getElapsedTime(startTime, startOffset);
            const eventPath = getEventPath(eventInstance);

            const event = createSound({
                // Ensure the new event has a unique ID
                eventInstance,
                eventPath,
                instrumentName,
                startTime: elapsedTime
            });

            // DIRTY GROUP FIX
            const newGroup = {
                ...event,
                events: { event }, // Use an empty object for nested events
                locked: false
            };

            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };

                if (updatedGroups[instrumentName]) {
                    // Add the new event to the existing dictionary of events under this instrument
                    updatedGroups[instrumentName][event.id] = newGroup;
                } else {
                    // Initialize this instrument's events dictionary if it doesn't exist
                    updatedGroups[instrumentName] = { [event.id]: newGroup };
                }

                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const lockOverlapGroupById = useCallback(
        ({ groupId }) => {
            if (!groupId) {
                alert('GROUP ID NOT PROVIDED');
                return; // Early return to avoid further execution if groupId is not provided
            }

            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };

                // Iterate over each instrument's group of events
                Object.keys(updatedGroups).forEach((instrumentName) => {
                    const groups = updatedGroups[instrumentName];
                    if (groups[groupId]) {
                        // If the group with the specified ID exists under this instrument, toggle its lock
                        groups[groupId] = {
                            ...groups[groupId],
                            locked: !groups[groupId].locked
                        };
                    }
                });

                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const duplicateOverlapGroup = useCallback(
        ({ locked = true, overlapGroup, startTimeOffset = 0 }) => {
            const newGroup = recreateEvents({
                groupsToRecreate: [overlapGroup]
            })[0]; // Assuming recreateEvents handles deep cloning and returns an array of groups

            // Generate a unique ID for the new group to avoid conflicts

            newGroup.locked = locked;

            const timeOffset = 2 + startTimeOffset;
            newGroup.startTime = overlapGroup.startTime + timeOffset;
            newGroup.endTime = overlapGroup.endTime + timeOffset;

            // Update start and end times based on the events within the new group
            if (Object.values(newGroup.events).length >= 1) {
                // Assuming newGroup.events is an object, we convert it to array for manipulation
                const eventsArray = Object.values(newGroup.events);
                newGroup.endTime = eventsArray[eventsArray.length - 1]?.endTime; // last event's end time
                newGroup.startTime = eventsArray[0]?.startTime; // first event's start time

                newGroup.parentId = null; // Clearing parentId as it is a top-level group now
            }

            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };

                // Add the new group to the instrument's dictionary of groups
                if (updatedGroups[newGroup.instrumentName]) {
                    updatedGroups[newGroup.instrumentName][newGroup.id] = newGroup;
                } else {
                    // If there is no such instrument, initialize it with the new group
                    updatedGroups[newGroup.instrumentName] = { [newGroup.id]: newGroup };
                }

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
        addRecording: recordSoundEvent,

        deleteAllRecordingsForInstrument,
        deleteOverlapGroup,
        deleteRecording: deleteEventInstance,
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
