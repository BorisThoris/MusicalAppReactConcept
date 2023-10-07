/* eslint-disable prefer-const */
// fmodLogic.js

export const FMODConfig = { INITIAL_MEMORY: 80 * 1024 * 1024 };

export const FMOD = {};
// eslint-disable-next-line import/no-mutable-exports, no-var
export var gSystem;

// Create an initialization function
export function initializeApp() {
    // eslint-disable-next-line no-use-before-define
    FMOD.preRun = prerun;
    // eslint-disable-next-line no-use-before-define
    FMOD.onRuntimeInitialized = initializeFMOD;
    FMOD.INITIAL_MEMORY = FMODConfig.INITIAL_MEMORY;
    window.FMODModule(FMOD);
}

let gSystemCore = null;
let gAudioResumed = false;

export function CHECK_RESULT(result) {
    if (result !== FMOD.OK) {
        const msg = `Error!!! '${FMOD.ErrorString(result)}'`;
        alert(msg);
        throw msg;
    }
}

export function prerun() {
    const fileUrl = '/';
    const folderName = '/';
    const canRead = true;
    const canWrite = false;
    const fileNames = ['Master.bank', 'Master.strings.bank'];

    fileNames.forEach((fileName) => {
        FMOD.FS_createPreloadedFile(
            folderName,
            fileName,
            `${fileUrl}${fileName}`,
            canRead,
            canWrite
        );
    });
}

function loadBank(name) {
    const bankhandle = {};
    CHECK_RESULT(
        gSystem.loadBankFile(
            `/${name}`,
            FMOD.STUDIO_LOAD_BANK_NORMAL,
            bankhandle
        )
    );
}

function resumeAudio() {
    if (!gAudioResumed) {
        console.log('Resetting audio driver based on user input.');

        const result1 = gSystemCore.mixerSuspend();
        CHECK_RESULT(result1);

        const result2 = gSystemCore.mixerResume();
        CHECK_RESULT(result2);

        gAudioResumed = true;
    }
}

function setupAudioWorkaround() {
    const iOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const callback = resumeAudio;

    if (iOS) {
        window.addEventListener('touchend', callback, false);
    } else {
        document.addEventListener('click', callback);
    }
}

function updateApplication() {
    const cpu = {};
    const result1 = gSystemCore.getCPUUsage(cpu);
    CHECK_RESULT(result1);

    const channelsplaying = {};
    const result2 = gSystemCore.getChannelsPlaying(channelsplaying, null);
    CHECK_RESULT(result2);

    const numbuffers = {};
    const buffersize = {};
    const result3 = gSystemCore.getDSPBufferSize(buffersize, numbuffers);
    CHECK_RESULT(result3);

    const rate = {};
    const result4 = gSystemCore.getSoftwareFormat(rate, null, null);
    CHECK_RESULT(result4);

    const sysrate = {};
    const result5 = gSystemCore.getDriverInfo(
        0,
        null,
        null,
        sysrate,
        null,
        null
    );
    CHECK_RESULT(result5);

    const result6 = gSystem.update();
    CHECK_RESULT(result6);
}

export function initializeFMOD() {
    const outval = {};
    let result;

    setupAudioWorkaround();

    console.log('Creating FMOD System object\n');

    result = FMOD.Studio_System_Create(outval);
    CHECK_RESULT(result);

    console.log('Grabbing system object from temporary and storing it\n');

    gSystem = outval.val;

    const result2 = gSystem.getCoreSystem(outval);
    CHECK_RESULT(result2);

    gSystemCore = outval.val;

    console.log('Set DSP Buffer size.\n');
    const result3 = gSystemCore.setDSPBufferSize(2048, 2);
    CHECK_RESULT(result3);

    console.log('Initialize FMOD\n');

    const result4 = gSystem.initialize(
        1024,
        FMOD.STUDIO_INIT_NORMAL,
        FMOD.INIT_NORMAL,
        null
    );
    CHECK_RESULT(result4);

    loadBank('Master.bank');
    loadBank('Master.strings.bank');

    window.setInterval(updateApplication, 20);

    return FMOD.OK;
}

export function createEventInstance(eventPath) {
    if (!gSystem) {
        window.alert("FMOD system hasn't been initialized yet.");
        return null;
    }

    // Get the event description
    const eventDescription = {};
    const result1 = gSystem.getEvent(`event:/${eventPath}`, eventDescription);
    CHECK_RESULT(result1);

    // Create an instance of the event
    const eventInstance = {};
    const result2 = eventDescription.val.createInstance(eventInstance);
    CHECK_RESULT(result2);

    return eventInstance.val;
}

export function getEventInstanceLength(eventInstance) {
    if (!eventInstance) {
        window.alert('Event instance is not valid.');
        return null;
    }

    const eventInstanceDescription = {};
    const result1 = eventInstance.getDescription(eventInstanceDescription);
    CHECK_RESULT(result1);

    let eventLength = {};
    const result2 = eventInstanceDescription.val.getLength(eventLength);
    CHECK_RESULT(result2);

    // Transformed from MS to seconds
    return eventLength.val / 1000;
}

/**
 * Creates and plays an FMOD event instance.
 * @param {string} eventPath - The path to the event in FMOD.
 * @returns {Object|null} - Returns the event instance if successful,
 * or null if failed.
 */
export function createAndPlayEventIntance(eventPath) {
    if (!gSystem) {
        window.alert("FMOD system hasn't been initialized yet.");
        return null;
    }

    // Create an instance of the event
    const eventInstance = createEventInstance(eventPath);
    if (!eventInstance) {
        return null;
    }

    // Get the length of the event instance
    const eventLength = getEventInstanceLength(eventInstance);
    if (!eventLength) {
        return null;
    }

    // Start the event instance
    const result = eventInstance.start();
    CHECK_RESULT(result);

    return eventInstance;
}
