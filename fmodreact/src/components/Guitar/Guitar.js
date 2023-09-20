import React from 'react'
import { playEventInstance } from '../../fmodLogic'

export const Guitar = () => {
  return (
    <div>
      <button
        onClick={() => {
          playEventInstance('Guitar/E')
        }}
      >
        Play Guitar Sound
      </button>
    </div>
  )
}
