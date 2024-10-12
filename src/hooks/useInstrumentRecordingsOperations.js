/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useContext } from 'react';
import { getEventPath } from '../fmodLogic/eventInstanceHelpers';
import { createSound } from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';

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
            const { id: eventId, instrumentName } = event;

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

                    return event;
                };

                const instrumentRecordings = updatedGroups[instrumentName];

                instrumentRecordings[eventId] = updateParamsInEvent(event);
            });
        },
        [setOverlapGroups]
    );

    const duplicateMultipleOverlapGroups = useCallback(() => {}, []);

    const duplicateOverlapGroup = useCallback(() => {}, []);

    const lockOverlapGroup = useCallback(() => {}, []);

    const updateOverlapGroupTimes = useCallback(() => {}, [], []);

    const deleteOverlapGroup = useCallback(() => {}, []);

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

    const duplicateInstrument = useCallback(() => {}, []);

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

        updateRecordingParams
    };
};

export default useInstrumentRecordingsOperations;
