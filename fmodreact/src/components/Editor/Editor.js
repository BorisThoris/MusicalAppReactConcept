import React, { useContext } from 'react'
import threeMinuteMs from '../../globalConstants/songLimit'
import { useInstrumentRecordingsOperations } from '../../hooks/useInstrumentRecordingsOperations'
import { usePanelState } from '../../hooks/usePanelState'
import useStageWidth from '../../hooks/useStageWidth'
import { InstrumentRecordingsContext } from '../../providers/InstrumentsProvider'
import Header from './components/Header/Header'
import { Panel } from './components/Panel/Panel'
import Timelines, {
  StyledEditorWrapper,
  StyledTimeline,
} from './components/Timelines/Timelines'

const Editor = () => {
  const { deleteAllRecordingsForInstrument, updateRecording } =
    useInstrumentRecordingsOperations()
  const { overlapGroups, recordings } = useContext(InstrumentRecordingsContext)
  const { closePanel, focusedEvent, openPanel, panelState, setFocusedEvent } =
    usePanelState({ overlapGroups })
  const { furthestEndTime, furthestEndTimes } = useStageWidth({ recordings })

  return (
    <StyledEditorWrapper>
      <Header />
      <StyledTimeline>
        <Timelines
          recordings={overlapGroups}
          furthestEndTime={furthestEndTime}
          duration={threeMinuteMs}
          openPanel={openPanel}
          closePanel={closePanel}
          updateStartTime={updateRecording}
          panelFor={panelState?.overlapGroup?.id}
          focusedEvent={focusedEvent}
          setFocusedEvent={setFocusedEvent}
          deleteAllRecordingsForInstrument={deleteAllRecordingsForInstrument}
          furthestEndTimes={furthestEndTimes}
        />
        {panelState.isOpen && (
          <Panel
            recordings={overlapGroups}
            onPressX={closePanel}
            updateStartTime={updateRecording}
            panelState={panelState}
            setFocusedEvent={setFocusedEvent}
            focusedEvent={focusedEvent}
            x={panelState.x}
            y={panelState.y}
          />
        )}
      </StyledTimeline>
    </StyledEditorWrapper>
  )
}

export default Editor
