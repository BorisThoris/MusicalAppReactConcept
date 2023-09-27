import { useEffect } from 'react';
import { FMOD } from '.';

const useFMOD = () => {
  useEffect(() => {
    // const initializeFMOD = async () => {
    //   console.log(FMOD)
    //   if (FMOD) {
    //     const FMODInstance = FMOD
    //     console.log(FMODInstance)
    //     var outval = {}
    //     var system
    //     console.log('Creating FMOD System object\n')
    //     // Create the system and check the result
    //     system = FMOD.Studio_System_Create(outval)
    //     console.log('system')
    //     console.log(system)
    //     console.log(outval)
    //   }
    // }
    // initializeFMOD()
  }, []); // No dependencies, this should run once when the component mounts

  return {
    // Export FMOD-related functions here
  };
};

export default useFMOD;
