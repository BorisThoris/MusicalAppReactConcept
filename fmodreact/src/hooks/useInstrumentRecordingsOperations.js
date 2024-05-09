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
                // Recursive function to update event parameters
                // eslint-disable-next-line no-shadow
                const updateParamsInEvent = (event, updatedParam) => {
                    // Directly update the parameters if the current event matches the eventId
                    if (event.id === eventId) {
                        console.log('yeeey');

                        return {
                            ...event,
                            params: event.params.map((param) =>
                                param.name === updatedParam.name ? updatedParam : param
                            )
                        };
                    }

                    // If the event has nested events (array), recurse into them
                    if (event.events && Array.isArray(event.events)) {
                        const updatedNestedEvents = event.events.map((nestedEvent) =>
                            updateParamsInEvent(nestedEvent, updatedParam)
                        );
                        return { ...event, events: updatedNestedEvents };
                    }

                    // Return the event unchanged if it's not the one being updated
                    return event;
                };

                // Traverse all instruments and update the specific event by eventId
                const updatedRecordings = Object.keys(prevRecordings).reduce((acc, instrumentName) => {
                    const events = prevRecordings[instrumentName];
                    const updatedEvents = {};

                    // Update each event in the instrument
                    Object.entries(events).forEach(([key, event]) => {
                        updatedEvents[key] = updateParamsInEvent(event, updatedParam);
                    });

                    acc[instrumentName] = updatedEvents;
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
        ({ eventLength, index, instrumentName, newStartTime }) => {
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

    const createOverlapGroup = useCallback(
        ({ event, events }) => {
            // Create a new group object
            // DIRTY GROUP FIX
            const newGroup = {
                ...event,
                endTime: event.endTime,
                events,
                id: event.id,
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
            const parentId = event?.parentId;
            if (!eventId) {
                console.warn('No event ID provided for deletion');
                return;
            }

            setOverlapGroups((prevOverlapGroups) => {
                const updatedOverlapGroups = { ...prevOverlapGroups };

                Object.keys(updatedOverlapGroups).forEach((instrumentName) => {
                    const events = updatedOverlapGroups[instrumentName];

                    if (parentId) {
                        // If there is a parentId, delete the event from the parent's 'events'
                        if (events[parentId] && events[parentId].events) {
                            const filteredEvents = events[parentId].events.filter((e) => e.id !== eventId);
                            events[parentId] = {
                                ...events[parentId],
                                events: filteredEvents
                            };
                        }
                    } else {
                        // If there is no parentId, delete the event directly from the instrument's events
                        // eslint-disable-next-line no-lonely-if
                        if (events[eventId]) {
                            const { [eventId]: deletedEvent, ...remainingEvents } = events;
                            updatedOverlapGroups[instrumentName] = remainingEvents;
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
                events: [event],
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
                events: [event], // Use an empty object for nested events
                locked: false
            };

            console.log(newGroup);

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
        createOverlapGroup,
        deleteAllRecordingsForInstrument,
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
