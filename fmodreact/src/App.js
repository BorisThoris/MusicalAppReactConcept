import './App.css'
import useFMOD from './useFmod'

function App() {
  const fmod = useFMOD()

  return (
    <div className="App">
      <header className="App-header">
        <button
          onClick={() => {
            // Use FMOD-related functions from the hook
            alert('sadec')
          }}
        >
          Play Sound
        </button>
      </header>
    </div>
  )
}
export default App
