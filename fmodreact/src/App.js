import { CHECK_RESULT, gSystem } from '.'
import './App.css'

function App() {
  const onButtonPress = () => {
    var eventDescription = {}

    console.log('Lol?')

    CHECK_RESULT(gSystem.getEvent('event:/Guitar/E', eventDescription))

    var eventInstance = {}
    CHECK_RESULT(eventDescription.val.createInstance(eventInstance))
    console.log(eventInstance)
    CHECK_RESULT(eventInstance.val.start())
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={onButtonPress}>Play Sound</button>
      </header>
    </div>
  )
}
export default App
