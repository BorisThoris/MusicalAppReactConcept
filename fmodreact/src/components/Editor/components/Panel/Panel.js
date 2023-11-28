import PropTypes from 'prop-types';
import React, { Fragment, useCallback } from 'react';
import {
    getEventInstanceParamaters,
    playEventInstance,
} from '../../../../fmodLogic/eventInstanceHelpers';
import ParameterControlComponent from '../ParameterControl/ParameterControl';
import {
    CloseIcon,
    Header,
    PlayIcon,
    TimeMarker,
    TrashIcon,
} from './Panel.styles';

const Panel = ({ onDelete, onPressX, panelState }) => {
    const handleClose = useCallback(() => onPressX(false), [onPressX]);

    const renderEvent = useCallback(
        (passedEvent) => {
            const currentEventInstance = passedEvent.eventInstance;

            const params = getEventInstanceParamaters(
                passedEvent.eventInstance
            );

            function handlePlay() {
                playEventInstance(currentEventInstance);
            }

            function handleDelete() {
                onDelete(passedEvent.id);
            }

            return (
                <div style={{ backgroundColor: 'red', width: 200 }}>
                    <Header>
                        <PlayIcon onClick={handlePlay}>▶</PlayIcon>
                        <TrashIcon onClick={handleDelete}>🗑️</TrashIcon>
                        <CloseIcon onClick={handleClose}>X</CloseIcon>
                    </Header>

                    <TimeMarker>
                        <span>START</span>
                        <div>
                            <div>Start: {passedEvent.startTime}</div>
                            <div>End:{passedEvent.endTime}</div>
                        </div>
                    </TimeMarker>

                    {params.map((param) => (
                        <ParameterControlComponent
                            key={param.name}
                            param={param}
                            eventInstance={currentEventInstance}
                        />
                    ))}
                </div>
            );
        },
        [handleClose, onDelete]
    );

    if (panelState.recording) {
        return renderEvent(panelState.recording);
    }

    return (
        <div>
            Group:
            <div style={{ display: 'flex' }}>
                {panelState.overlapGroup.events.map((event) =>
                    renderEvent(event)
                )}
            </div>
        </div>
    );
};

Panel.propTypes = {
    onDelete: PropTypes.func.isRequired, // Added validation for onDelete prop
    onPressX: PropTypes.func.isRequired,
    panelState: PropTypes.shape({
        recording: PropTypes.shape({
            endTime: PropTypes.number.isRequired,
            eventInstance: PropTypes.object.isRequired,
            startTime: PropTypes.number.isRequired,
        }).isRequired,
    }).isRequired,
};

export default Panel;
