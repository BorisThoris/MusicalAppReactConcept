/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import { useCallback, useContext } from 'react';
import { getEventPath } from '../fmodLogic/eventInstanceHelpers';
import { createSound } from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import { recreateEvents } from './useOverlapCalculator/GroupUtility';

export const useInstrumentRecordingsOperations = () => {
    const { calculateOverlapsForAllInstruments, flatOverlapGroups, overlapGroups, setOverlapGroups } =
        useContext(InstrumentRecordingsContext);

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
                [instrumentName]: {}
            }));
        },
        [setOverlapGroups]
    );

    const updateRecordingParams = useCallback(
        ({ event, updatedParam }) => {
            const { id: eventId, instrumentName, parentId } = event;

            setOverlapGroups((prevRecordings) => {
                const updateParamsInEvent = (event, updatedParam) => {
                    console.log('change for event');
                    console.log(event);

                    if (event.id === eventId) {
                        return {
                            ...event,
                            params: event.params.map((param) =>
                                param.name === updatedParam.name ? updatedParam : param
                            )
                        };
                    }

                    if (event.events) {
                        const updatedNestedEvents = Object.entries(event.events).reduce(
                            (acc, [key, nestedEvent]) => ({
                                ...acc,
                                [key]: updateParamsInEvent(nestedEvent, updatedParam)
                            }),
                            {}
                        );

                        return { ...event, events: updatedNestedEvents };
                    }

                    return event;
                };

                const instrumentRecordings = prevRecordings[instrumentName];
                const updatedEvent = updateParamsInEvent(event, updatedParam);
                const { name: paramName } = updatedParam.param;

                event.eventInstance.setParameterByName(paramName, updatedParam.value, false);

                if (parentId) {
                    const parentEvent = instrumentRecordings[parentId];
                    parentEvent.events[eventId] = updatedEvent;
                    instrumentRecordings[parentId] = updateParamsInEvent(parentEvent, updatedParam);
                } else {
                    instrumentRecordings[eventId] = updatedEvent;
                    const childEvent = instrumentRecordings[eventId].events[eventId];
                    const updatedChildEvent = updateParamsInEvent(childEvent, updatedParam);

                    instrumentRecordings[eventId].events[eventId] = updatedChildEvent;
                    updatedChildEvent.eventInstance.setParameterByName(paramName, updatedParam.value, false);
                }

                return { ...prevRecordings };
            });
        },
        [setOverlapGroups]
    );

    const processNewGroup = ({ locked = true, overlapGroup, startTimeOffset = 0 }) => {
        const timeOffset = 2 + startTimeOffset;

        const newGroup = recreateEvents({
            groupsToRecreate: [overlapGroup],
            timeOffset
        })[0];

        const eventsArray = Object.values(newGroup.events);

        if (eventsArray.length > 1) {
            newGroup.parentId = null;
        }

        newGroup.locked = locked;

        return newGroup;
    };

    const duplicateMultipleOverlapGroups = useCallback(
        (groups) => {
            const duplicatedGroups = {};

            groups.forEach((group) => {
                const newGroup = processNewGroup({ ...group, locked: true });

                if (!duplicatedGroups[newGroup.instrumentName]) {
                    duplicatedGroups[newGroup.instrumentName] = {};
                }
                duplicatedGroups[newGroup.instrumentName][newGroup.id] = newGroup;
            });

            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };

                Object.keys(duplicatedGroups).forEach((instrumentName) => {
                    if (!updatedGroups[instrumentName]) {
                        updatedGroups[instrumentName] = {};
                    }

                    Object.assign(updatedGroups[instrumentName], duplicatedGroups[instrumentName]);
                });

                return updatedGroups;
            });
        },
        [setOverlapGroups]
    );

    const duplicateOverlapGroup = useCallback(
        (group) => {
            const newGroup = processNewGroup(group);

            setOverlapGroups((prevGroups) => {
                const updatedGroups = { ...prevGroups };
                updatedGroups[newGroup.instrumentName][newGroup.id] = newGroup;

                return updatedGroups;
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

                // Check if newInstrumentName already exists and increment number if it does
                while (Object.prototype.hasOwnProperty.call(prevGroups, newInstrumentName)) {
                    number += 1;
                    newInstrumentName = `${baseName} ${number}`;
                }

                // Duplicate each group in the original groups and recreate events
                const duplicatedGroups = Object.values(originalGroups).reduce((newGroups, group) => {
                    const recreatedGroup = recreateEvents({
                        existingInstrumentName: newInstrumentName,
                        groupsToRecreate: [group]
                    })[0]; // Recreate events for the group

                    newGroups[recreatedGroup.id] = {
                        ...recreatedGroup,
                        id: recreatedGroup.id,
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
        (data, newInstrumentName) => {
            const updateStartTime = ({ newStartTime, recording }, recordingsCopy) => {
                const { eventLength, id: index, instrumentName } = recording;
                const instrumentRecordings = recordingsCopy[instrumentName];

                const searchAndUpdateRecording = (recordings, id, newStart) => {
                    const recordingKey = Object.keys(recordings).find((key) => `${recordings[key].id}` === `${id}`);
                    const recording = recordings[recordingKey];

                    if (recording) {
                        const roundedStartTime = parseFloat(newStart.toFixed(2));
                        const roundedEndTime = parseFloat((roundedStartTime + eventLength).toFixed(2));
                        recording.startTime = roundedStartTime;
                        recording.endTime = roundedEndTime;
                    }

                    return Object.values(recordings).some(
                        (rec) => rec.events && searchAndUpdateRecording(rec.events, id, newStart)
                    );
                };

                // Start the recursive search and update process
                searchAndUpdateRecording(instrumentRecordings, index, newStartTime);
            };

            const recordingsCopy = { ...overlapGroups };

            if (Array.isArray(data)) {
                data.forEach((item) => updateStartTime(item, recordingsCopy));
            } else {
                updateStartTime(data, recordingsCopy);
            }

            const testSad = calculateOverlapsForAllInstruments(recordingsCopy);

            // prevOverlapGroupsRef.current = testSad;
            setOverlapGroups(testSad);
        },
        [calculateOverlapsForAllInstruments, overlapGroups, setOverlapGroups]
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

            if (!groupId) {
                console.warn('No group ID provided for deletion');
                return;
            }

            setOverlapGroups((prevOverlapGroups) => {
                const updatedOverlapGroups = { ...prevOverlapGroups };

                Object.values(updatedOverlapGroups).forEach((instrumentData) => {
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

    const deleteEventInstances = useCallback(
        (events) => {
            const eventArray = Array.isArray(events) ? events : [events];

            setOverlapGroups((prevOverlapGroups) => {
                const updatedOverlapGroups = { ...prevOverlapGroups };

                eventArray.forEach((event) => {
                    const { id: eventId, parentId } = event;

                    if (!eventId) {
                        console.warn('No event ID provided for deletion');
                        return;
                    }

                    Object.values(updatedOverlapGroups).forEach((instrumentData) => {
                        const instrumentRecordings = instrumentData;

                        if (parentId) {
                            const parentGroup = instrumentRecordings[parentId];
                            if (parentGroup && parentGroup.events) {
                                const updatedEvents = { ...parentGroup.events };
                                delete updatedEvents[eventId];
                                parentGroup.events = updatedEvents;
                            }
                        } else if (instrumentRecordings[eventId] && instrumentRecordings[eventId].events) {
                            delete instrumentRecordings[eventId].events[eventId];
                        }
                    });
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

    const recordSoundEvent = useCallback(
        (eventInstance, instrumentName, startTime, startOffset) => {
            const elapsedTime = getElapsedTime(startTime, startOffset);
            const eventPath = getEventPath(eventInstance);

            const event = createSound({
                // Ensure the new event has a unique ID
                eventInstance,
                eventPath,
                instrumentName,
                startTime: startOffset || startOffset === 0 ? elapsedTime : startTime
            });

            // DIRTY GROUP FIX
            const newGroup = {
                ...event,
                events: { [event.id]: { ...event, parentId: event.id } },
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

    const insertNewInstrument = useCallback(
        (instrumentName) => {
            const nameRegex = /^(.*?)(?:\s+(\d+))?$/;
            const match = instrumentName.match(nameRegex);

            const baseName = match ? match[1] : instrumentName;
            let number = match && match[2] ? parseInt(match[2], 10) : 1;
            let newInstrumentName = `${baseName} ${number}`;

            setOverlapGroups((prevGroups) => {
                // Check if the new instrument name already exists and increment the number if it does
                while (Object.prototype.hasOwnProperty.call(prevGroups, newInstrumentName)) {
                    number += 1;
                    newInstrumentName = `${baseName} ${number}`;
                }

                // Insert the new instrument layer as an empty object
                return {
                    ...prevGroups,
                    [newInstrumentName]: {}
                };
            });

            return newInstrumentName;
        },
        [setOverlapGroups]
    );

    return {
        addRecording: recordSoundEvent,
        deleteAllRecordingsForInstrument,
        deleteOverlapGroup,
        deleteRecording: deleteEventInstances,
        duplicateInstrument,
        duplicateMultipleOverlapGroups,
        duplicateOverlapGroup,
        getEventById,
        insertNewInstrument,
        lockOverlapGroupById,
        resetRecordings,
        updateOverlapGroupTimes,
        updateRecording: updateRecordingStartTime,
        updateRecordingParams
    };
};

export default useInstrumentRecordingsOperations;
