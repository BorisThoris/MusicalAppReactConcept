import PropTypes from "prop-types";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Group, Layer, Rect, Text } from "react-konva";
import pixelToSecondRatio from "../../../../globalConstants/pixelToSeconds";
import { RecordingsPlayerContext } from "../../../../providers/RecordingsPlayerProvider";
import { TimelineContext } from "../../../../providers/TimelineProvider";
import OverlapGroupElement from "../OverlapGroupElement/OverlapGroupElement";
import SoundEventElement from "../SoundEventElement/SoundEventElement";
import InstrumentTimelinePanelComponent from "./InstrumentTimelinePanel";

export const TimelineHeight = 200;
const Y_OFFSET = 20;

const InstrumentTimeline = React.memo(
  ({
    currentPlayingInstrument,
    deleteAllRecordingsForInstrument,
    focusedEvent,
    furthestEndTime,
    groupName,
    index,
    instrumentGroup,
    markersHeight,
    openPanel,

    panelFor,
    setFocusedEvent,
    updateStartTime,
  }) => {
    const { mutedInstruments, replayInstrumentRecordings, toggleMute } =
      useContext(RecordingsPlayerContext);
    const { timelineState, updateTimelineState } = useContext(TimelineContext);

    const timelineRef = useRef();

    // State for panel expansion
    const [isLocked, setisLocked] = useState(false);

    // Function to toggle expansion
    const toggleLocked = useCallback(() => {
      setisLocked(!isLocked);
    }, [isLocked]);

    const isMuted = mutedInstruments.includes(groupName);

    const timelineY = TimelineHeight * index + markersHeight + Y_OFFSET;
    const timelineWidth = furthestEndTime * pixelToSecondRatio;
    const fillColor =
      currentPlayingInstrument === groupName ? "green" : "transparent";

    useEffect(() => {
      if (timelineRef.current) {
        const canvasOffsetY =
          timelineRef.current.parent?.attrs?.container?.getBoundingClientRect()
            ?.y || 0;

        if (timelineState.canvasOffsetY !== canvasOffsetY) {
          updateTimelineState({
            canvasOffsetY,
            timelineY,
          });
        }
      }
    }, [
      furthestEndTime,
      index,
      markersHeight,
      timelineState.canvasOffsetY,
      timelineY,
      updateTimelineState,
    ]);

    const renderGroupElement = useCallback(
      (groupData, groupIndex) => {
        const elementIsSelected = panelFor === groupData.id;
        return groupData.events.length === 1 ? (
          <SoundEventElement
            updateStartTime={updateStartTime}
            key={groupData.events[0].id}
            timelineHeight={TimelineHeight}
            recording={groupData.events[0]}
            index={groupIndex}
            openPanel={openPanel}
            timelineY={timelineY}
            isTargeted={elementIsSelected}
            isFocused={groupData.events[0].id === focusedEvent}
            setFocusedEvent={setFocusedEvent}
            canvasOffsetY={timelineState.canvasOffsetY || undefined}
          />
        ) : (
          <OverlapGroupElement
            key={`group-${groupIndex}`}
            groupData={groupData}
            index={groupIndex}
            openPanel={openPanel}
            timelineHeight={TimelineHeight}
            timelineY={timelineY}
            updateStartTime={updateStartTime}
            isTargeted={elementIsSelected}
            focusedEvent={focusedEvent}
            setFocusedEvent={setFocusedEvent}
            canvasOffsetY={timelineState.canvasOffsetY || undefined}
          />
        );
      },
      [
        focusedEvent,
        openPanel,
        panelFor,
        setFocusedEvent,
        timelineState.canvasOffsetY,
        timelineY,
        updateStartTime,
      ],
    );

    return (
      <Layer y={timelineY} ref={timelineRef}>
        <Rect
          offset={timelineState.panelCompensationOffset}
          height={TimelineHeight}
          width={timelineWidth}
          fill={isMuted ? "red" : fillColor}
        />

        {groupName && <Text text={groupName} y={0} />}

        <InstrumentTimelinePanelComponent
          timelineHeight={TimelineHeight}
          groupName={groupName}
          replayInstrumentRecordings={replayInstrumentRecordings}
          deleteAllRecordingsForInstrument={deleteAllRecordingsForInstrument}
          toggleMute={toggleMute}
          toggleLocked={toggleLocked}
          isLocked={isLocked}
        />

        <Group
          opacity={isLocked ? 0.5 : 1}
          offset={timelineState.panelCompensationOffset}
        >
          {instrumentGroup.map(renderGroupElement)}
        </Group>

        {isLocked && (
          <Rect
            offset={timelineState.panelCompensationOffset}
            height={TimelineHeight}
            width={timelineWidth}
          />
        )}
      </Layer>
    );
  },
);

InstrumentTimeline.propTypes = {
  currentPlayingInstrument: PropTypes.string,
  deleteAllRecordingsForInstrument: PropTypes.func.isRequired,
  focusedEvent: PropTypes.number,
  furthestEndTime: PropTypes.number.isRequired,
  groupName: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  instrumentGroup: PropTypes.arrayOf(
    PropTypes.shape({
      events: PropTypes.arrayOf(
        PropTypes.shape({
          endTime: PropTypes.number.isRequired,
          eventInstance: PropTypes.object,
          id: PropTypes.number.isRequired,
          instrumentName: PropTypes.string.isRequired,
          startTime: PropTypes.number.isRequired,
        }),
      ).isRequired,
      id: PropTypes.number.isRequired,
    }),
  ).isRequired,
  markersHeight: PropTypes.number.isRequired,
  openPanel: PropTypes.func.isRequired,
  panelCompensationOffset: PropTypes.object.isRequired,
  panelFor: PropTypes.number,
  replayInstrumentRecordings: PropTypes.func.isRequired,
  updateStartTime: PropTypes.func.isRequired,
};

export default InstrumentTimeline;
