import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

export const FMOD = {} // FMOD global object which must be declared to enable 'main' and 'preRun' and then call the constructor function.
FMOD['preRun'] = prerun // Will be called before FMOD runs, but after the Emscripten runtime has initialized
FMOD['onRuntimeInitialized'] = main // Called when the Emscripten runtime has initialized
FMOD['INITIAL_MEMORY'] = 80 * 1024 * 1024 // This demo loads some large banks, so it needs more memory than the default (16 MB)
window.FMODModule(FMOD) // Calling the constructor function with our object

//==============================================================================
// Example code
//==============================================================================

export var gSystem // Global 'System' object which has the Studio API functions.
export var gSystemCore // Global 'SystemCore' object which has the Core API functions.
var gAudioResumed = false

// Simple error checking function for all FMOD return values.
export function CHECK_RESULT(result) {
  if (result != FMOD.OK) {
    var msg = "Error!!! '" + FMOD.ErrorString(result) + "'"

    alert(msg)

    throw msg
  }
}

// Will be called before FMOD runs, but after the Emscripten runtime has initialized
// Call FMOD file preloading functions here to mount local files.  Otherwise load custom data from memory or use own file system.
function prerun() {
  var fileUrl = '/'
  var fileName
  var folderName = '/'
  var canRead = true
  var canWrite = false

  fileName = ['Master.bank', 'Master.strings.bank']

  for (var count = 0; count < fileName.length; count++) {
    FMOD.FS_createPreloadedFile(
      folderName,
      fileName[count],
      fileUrl + fileName[count],
      canRead,
      canWrite,
    )
  }
}

// Helper function to load a bank by name.
function loadBank(name) {
  var bankhandle = {}
  CHECK_RESULT(
    gSystem.loadBankFile('/' + name, FMOD.STUDIO_LOAD_BANK_NORMAL, bankhandle),
  )
}

function main() {
  // A temporary empty object to hold our system
  var outval = {}
  var result

  // Set up iOS/Chrome workaround.  Webaudio is not allowed to start unless screen is touched or button is clicked.
  function resumeAudio() {
    if (!gAudioResumed) {
      console.log('Resetting audio driver based on user input.')

      result = gSystemCore.mixerSuspend()
      CHECK_RESULT(result)
      result = gSystemCore.mixerResume()
      CHECK_RESULT(result)

      gAudioResumed = true
    }
  }

  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  if (iOS) {
    window.addEventListener('touchend', resumeAudio, false)
  } else {
    document.addEventListener('click', resumeAudio)
  }

  console.log('Creating FMOD System object\n')

  // Create the system and check the result
  result = FMOD.Studio_System_Create(outval)
  CHECK_RESULT(result)

  console.log('grabbing system object from temporary and storing it\n')

  // Take out our System object
  gSystem = outval.val

  result = gSystem.getCoreSystem(outval)
  CHECK_RESULT(result)

  gSystemCore = outval.val

  console.log('set DSP Buffer size.\n')
  result = gSystemCore.setDSPBufferSize(2048, 2)
  CHECK_RESULT(result)

  console.log('initialize FMOD\n')

  // 1024 virtual channels
  result = gSystem.initialize(
    1024,
    FMOD.STUDIO_INIT_NORMAL,
    FMOD.INIT_NORMAL,
    null,
  )
  CHECK_RESULT(result)

  loadBank('Master.bank')
  loadBank('Master.strings.bank')

  var eventDescription = {}
  CHECK_RESULT(gSystem.getEvent('event:/Guitar/E', eventDescription))

  var eventInstance = {}
  CHECK_RESULT(eventDescription.val.createInstance(eventInstance))
  CHECK_RESULT(eventInstance.val.start())

  window.setInterval(updateApplication, 20)

  return FMOD.OK
}

// Called from main, on an interval that updates at a regular rate (like in a game loop).
// Prints out information, about the system, and importantly calles System::udpate().
function updateApplication() {
  var result
  var cpu = {}

  result = gSystemCore.getCPUUsage(cpu)
  CHECK_RESULT(result)

  var channelsplaying = {}
  result = gSystemCore.getChannelsPlaying(channelsplaying, null)
  CHECK_RESULT(result)

  var numbuffers = {}
  var buffersize = {}
  result = gSystemCore.getDSPBufferSize(buffersize, numbuffers)
  CHECK_RESULT(result)

  var rate = {}
  result = gSystemCore.getSoftwareFormat(rate, null, null)
  CHECK_RESULT(result)

  var sysrate = {}
  result = gSystemCore.getDriverInfo(0, null, null, sysrate, null, null)
  CHECK_RESULT(result)

  var ms = (numbuffers.val * buffersize.val * 1000) / rate.val

  // Update FMOD
  result = gSystem.update()
  CHECK_RESULT(result)
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
