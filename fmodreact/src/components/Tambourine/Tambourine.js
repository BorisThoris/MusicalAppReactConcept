import React from 'react'
import { playEventInstance } from '../../fmodLogic'

export const Tambourine = () => {
  return (
    <div>
      <button
        onClick={() => {
          playEventInstance('Guitar/E')
        }}
      >
        Play Tambourine Sound
      </button>
    </div>
  )
}
