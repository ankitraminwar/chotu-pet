/** All available sound file names — used by sound profiles */
export const SOUND_FILES = {
  babyChickChirp: "baby-chick-chirp.mp3",
  kittenMeowShort: "kitten-meow-short.mp3",
  kittenMeowHungry: "kitten-meow-hungry.mp3",
  babyLaughShort: "baby-laugh-short.mp3",
  dogBarkShort: "dog-bark-short.mp3",
  wowCartoon: "wow-cartoon.mp3",
  wowFemale: "wow-female.mp3",
  wowSurprisedMale: "wow-surprised-male.mp3",
  babyBabbleShort: "baby-babble-short.mp3",
} as const;

export type SoundFileName = (typeof SOUND_FILES)[keyof typeof SOUND_FILES];

/** All sound file names as an array for preloading */
export const ALL_SOUND_FILES: SoundFileName[] = Object.values(SOUND_FILES);
