import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
// Importing FMOD logic helpers
import {
    getEventInstanceParamaters,
    playEventInstance,
} from '../../../../fmodLogic/eventInstanceHelpers';
// Importing components
import ParameterControlComponent from '../ParameterControl/ParameterControl';
// Importing styled components
import {
    CloseIcon,
    Header,
    PlayIcon,
    Timeline,
    TimelineContainer,
    TimeMarker,
    TrashIcon,
} from './Panel.styles';

const Panel = ({ onDelete, onPressX, panelState }) => {
    const { endTime, eventInstance, startTime } = panelState.recording;

    const handleClose = useCallback(() => onPressX(false), [onPressX]);

    const onPressPlay = useCallback(
        () => playEventInstance(eventInstance),
        [eventInstance]
    );

    const params = getEventInstanceParamaters(eventInstance);

    return (
        <TimelineContainer>
            <Header>
                <PlayIcon onClick={onPressPlay}>▶</PlayIcon>
                <TrashIcon onClick={onDelete}>🗑️</TrashIcon>
                <CloseIcon onClick={handleClose}>X</CloseIcon>
            </Header>

            <Timeline>
                <TimeMarker>
                    <span>START</span>
                    <span>{startTime}</span>X<span>{endTime}</span>
                </TimeMarker>

                {params.map((param) => (
                    <ParameterControlComponent
                        key={param.name}
                        param={param}
                        eventInstance={eventInstance}
                    />
                ))}
            </Timeline>
        </TimelineContainer>
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
