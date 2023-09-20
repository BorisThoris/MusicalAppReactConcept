import React from 'react'
import { playEventInstance } from '../../fmodLogic'

export const Drums = () => {
  return (
    <div>
      <button
        onClick={() => {
          playEventInstance('Guitar/E')
        }}
      >
        Play Drums Sound
      </button>
    </div>
  )
}
