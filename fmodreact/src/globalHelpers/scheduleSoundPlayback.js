const scheduleSoundPlayback = (sound, delay, playEventFunc) => {
  const timeoutId = setTimeout(
    () => {
      playEventFunc(sound.eventName);
    },
    // Transforming seconds to ms
    delay * 1000,
  );
  return timeoutId;
};

export default scheduleSoundPlayback;
