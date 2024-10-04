/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import assign from 'lodash/assign';
import castArray from 'lodash/castArray';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import round from 'lodash/round';
import set from 'lodash/set';
import unset from 'lodash/unset';
import { useCallback, useContext } from 'react';
import { getEventPath } from '../fmodLogic/eventInstanceHelpers';
import { createSound } from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { recreateEvents } from './useOverlapCalculator/GroupUtility';

export const useInstrumentRecordingsOperations = () => {
    const { getSoundEventById, setOverlapGroups } = useContext(CollisionsContext);

    const updateGroups = (setOverlapGroups, updateCallback) => {
        setOverlapGroups((prevGroups) => {
            const updatedGroups = cloneDeep(prevGroups);
            updateCallback(updatedGroups);

            return updatedGroups;
        });
    };

    const getEventById = useCallback(
        (id) => {
            const element = getSoundEventById(id);
            return element?.recording;
        },
        [getSoundEventById]
    );

    const resetRecordingsForInstrument = useCallback(
        (instrumentName) => {
            updateGroups(setOverlapGroups, (updatedGroups) => {
                updatedGroups[instrumentName] = {};
            });
        },
        [setOverlapGroups]
    );

    const updateRecordingParams = useCallback(
        ({ event, updatedParam }) => {
            const { id: eventId, instrumentName, parentId } = event;

            updateGroups(setOverlapGroups, (updatedGroups) => {
                const updateParamsInEvent = (event) => {
                    if (event.id === eventId) {
                        return {
                            ...event,
                            params: event.params.map((param) =>
                                param.name === updatedParam.name ? updatedParam : param
                            )
                        };
                    }
                    if (event.events) {
                        event.events = Object.entries(event.events).reduce(
                            (acc, [key, nestedEvent]) => ({
                                ...acc,
                                [key]: updateParamsInEvent(nestedEvent)
                            }),
                            {}
                        );
                    }
                    return event;
                };

                const instrumentRecordings = updatedGroups[instrumentName];
                if (parentId) {
                    instrumentRecordings[parentId].events[eventId] = updateParamsInEvent(event);
                } else {
                    instrumentRecordings[eventId] = updateParamsInEvent(event);
                }
            });
        },
        [setOverlapGroups]
    );

    const processNewGroup = useCallback(({ locked = true, overlapGroup, startTimeOffset = 0 }) => {
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
    }, []);

    const duplicateMultipleOverlapGroups = useCallback(
        (groups) => {
            if (!groups || groups.length === 0) {
                return;
            }

            updateGroups(setOverlapGroups, (updatedGroups) => {
                groups.forEach((group) => {
                    const newGroup = processNewGroup({ ...group, locked: true });

                    if (!updatedGroups[newGroup.instrumentName]) {
                        updatedGroups[newGroup.instrumentName] = {};
                    }

                    updatedGroups[newGroup.instrumentName][newGroup.id] = newGroup;
                });
            });
        },
        [setOverlapGroups, processNewGroup]
    );

    const duplicateOverlapGroup = useCallback(
        (group) => {
            const newGroup = processNewGroup(group);

            updateGroups(setOverlapGroups, (updatedGroups) => {
                updatedGroups[newGroup.instrumentName][newGroup.id] = newGroup;
            });
        },
        [setOverlapGroups, processNewGroup]
    );

    const updateRecordingStartTime = useCallback(
        (data, newInstrumentName) => {
            updateGroups(setOverlapGroups, (updatedGroups) => {
                const updateStartTime = ({ newStartTime, recording }) => {
                    const { eventLength, id: recordingId, instrumentName: oldInstrumentName, parentId } = recording;

                    const targetInstrumentName = newInstrumentName || oldInstrumentName;
                    const roundedStartTime = round(newStartTime, 2);

                    // Skip updating if startTime and instrumentName have not changed
                    if (recording.startTime === roundedStartTime && oldInstrumentName === targetInstrumentName) {
                        return;
                    }

                    if (newInstrumentName && oldInstrumentName !== newInstrumentName) {
                        unset(updatedGroups, [oldInstrumentName, recordingId]);
                    }

                    if (parentId) {
                        const oldParent = get(updatedGroups, [oldInstrumentName, parentId]);
                        if (oldParent && oldParent.events) {
                            unset(oldParent.events, recordingId);
                        }
                    }

                    // Update recording properties
                    assign(recording, {
                        endTime: round(roundedStartTime + eventLength, 2),
                        instrumentName: targetInstrumentName,
                        startTime: roundedStartTime
                    });

                    // Ensure the target instrument exists
                    if (!updatedGroups[targetInstrumentName]) {
                        updatedGroups[targetInstrumentName] = {};
                    }

                    // Add or move the recording to the appropriate location in updatedGroups
                    if (!parentId) {
                        // Recording has no parent, add to the root of the target instrument
                        updatedGroups[targetInstrumentName][recordingId] = recording;
                        set(updatedGroups, [targetInstrumentName, recordingId], recording);
                    } else {
                        // Recording has a parent, attempt to add it under the parent in the target instrument
                        const parent = get(updatedGroups, [targetInstrumentName, parentId]);

                        if (parent) {
                            set(parent, ['events', recordingId], recording);
                        }
                    }

                    console.log(updatedGroups);
                };

                // Iterate over each recording in the data array (handles both single and multiple records)
                forEach(castArray(data), updateStartTime);
            });
        },
        [setOverlapGroups]
    );

    const lockOverlapGroup = useCallback(
        ({ group }) => {
            if (!group || !group.id || !group.instrumentName) {
                alert('GROUP OR GROUP DETAILS NOT PROVIDED');
                return;
            }

            updateGroups(setOverlapGroups, (updatedGroups) => {
                const { id: groupId, instrumentName } = group;
                const instrumentGroups = updatedGroups[instrumentName];

                if (instrumentGroups && instrumentGroups[groupId]) {
                    instrumentGroups[groupId].locked = !instrumentGroups[groupId].locked;
                }
            });
        },
        [setOverlapGroups]
    );

    const updateOverlapGroupTimes = useCallback(
        ({ groupId, newStartTime }) => {
            updateGroups(setOverlapGroups, (updatedGroups) => {
                Object.keys(updatedGroups).forEach((instrument) => {
                    const groups = updatedGroups[instrument];
                    if (groups[groupId]) {
                        const group = groups[groupId];
                        const timeShift = newStartTime - group.startTime;

                        groups[groupId] = {
                            ...group,
                            endTime: parseFloat((group.endTime + timeShift).toFixed(2)),
                            startTime: parseFloat(newStartTime.toFixed(2))
                        };

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

            updateGroups(setOverlapGroups, (updatedGroups) => {
                Object.values(updatedGroups).forEach((instrumentData) => {
                    if (instrumentData[groupId]) {
                        delete instrumentData[groupId];
                    }
                });
            });
        },
        [setOverlapGroups]
    );

    const deleteAllRecordingsForInstrument = useCallback(
        (instrumentName) => {
            updateGroups(setOverlapGroups, (updatedGroups) => {
                delete updatedGroups[instrumentName];
            });
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
                startTime: startOffset || startOffset === 0 ? elapsedTime : startTime
            });

            const newGroup = {
                ...event,
                events: { [event.id]: { ...event, parentId: event.id } },
                locked: false
            };

            updateGroups(setOverlapGroups, (updatedGroups) => {
                if (!updatedGroups[instrumentName]) {
                    updatedGroups[instrumentName] = {};
                }
                updatedGroups[instrumentName][event.id] = newGroup;
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

            updateGroups(setOverlapGroups, (updatedGroups) => {
                const originalGroups = updatedGroups[instrumentName];
                if (!originalGroups) {
                    alert('Original instrument data not found. Cannot duplicate.');
                    return;
                }

                while (Object.prototype.hasOwnProperty.call(updatedGroups, newInstrumentName)) {
                    number += 1;
                    newInstrumentName = `${baseName} ${number}`;
                }

                const duplicatedGroups = Object.values(originalGroups).reduce((newGroups, group) => {
                    const recreatedGroup = recreateEvents({
                        existingInstrumentName: newInstrumentName,
                        groupsToRecreate: [group]
                    })[0];

                    newGroups[recreatedGroup.id] = {
                        ...recreatedGroup,
                        id: recreatedGroup.id,
                        instrumentName: newInstrumentName
                    };

                    return newGroups;
                }, {});

                updatedGroups[newInstrumentName] = duplicatedGroups;
            });

            return newInstrumentName;
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

            updateGroups(setOverlapGroups, (updatedGroups) => {
                while (Object.prototype.hasOwnProperty.call(updatedGroups, newInstrumentName)) {
                    number += 1;
                    newInstrumentName = `${baseName} ${number}`;
                }

                updatedGroups[newInstrumentName] = {};
            });

            return newInstrumentName;
        },
        [setOverlapGroups]
    );

    return {
        addRecording: recordSoundEvent,
        deleteAllRecordingsForInstrument,
        deleteOverlapGroup,
        duplicateInstrument,
        duplicateMultipleOverlapGroups,
        duplicateOverlapGroup,
        getEventById,
        insertNewInstrument,
        lockOverlapGroup,
        resetRecordings,
        updateOverlapGroupTimes,
        updateRecording: updateRecordingStartTime,
        updateRecordingParams
    };
};

export default useInstrumentRecordingsOperations;
