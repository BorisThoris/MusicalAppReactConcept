import { useEffect } from 'react'

const useFMOD = () => {
  useEffect(() => {
    // Access FMOD object from the global window object
    const FMOD = window.FMODModule

    console.log(window.FMOD)

    if (FMOD) {
      FMOD()
        .then((FMOD) => {
          // Now FMOD should contain the methods and properties
          // provided by the FMOD library
          console.log(FMOD)

          // You can call methods and use properties like this:
          // FMOD.someMethod();
          // const result = FMOD.someProperty;
        })
        .catch((error) => {
          // Handle any errors that occur during initialization
          console.error('FMOD initialization failed:', error)
        })
    }

    return () => {
      // Clean up FMOD resources if FMOD is available
      if (FMOD) {
        // FMOD.close()
      }
    }
  }, [window.FMOD])

  // FMOD-related functions can be defined here

  return {
    // Export FMOD-related functions here
  }
}

export default useFMOD
