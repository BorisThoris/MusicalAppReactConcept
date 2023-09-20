import React from 'react'
import { playEventInstance } from '../../fmodLogic'

export const Piano = () => {
  return (
    <div>
      <button
        onClick={() => {
          playEventInstance('Guitar/E')
        }}
      >
        Play Piano Sound
      </button>
    </div>
  )
}
