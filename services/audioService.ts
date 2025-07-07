

const sounds: { [key: string]: HTMLAudioElement } = {};
let backgroundMusic: HTMLAudioElement | null = null;
let bossMusic: HTMLAudioElement | null = null;
let isMuted = false;

const createAudio = (src: string, loop = false, volume = 1.0) => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    return audio;
};

sounds['attack'] = createAudio('https://cdn.pixabay.com/audio/2025/05/28/audio_0b22c2052a.mp3', false, 0.7);
sounds['pickup'] = createAudio('https://cdn.pixabay.com/audio/2022/03/15/audio_7af0cefcfe.mp3', false, 0.8);
sounds['damage'] = createAudio('https://cdn.pixabay.com/audio/2022/03/10/audio_5ec86ec3e7.mp3', false, 0.7);
sounds['stairs'] = createAudio('https://cdn.pixabay.com/audio/2025/06/02/audio_ac4c6f88fe.mp3', false, 0.8);
sounds['gameOver'] = createAudio('https://cdn.pixabay.com/audio/2022/03/10/audio_890251fc8d.mp3', false, 0.9);
sounds['levelUp'] = createAudio('https://cdn.pixabay.com/audio/2025/05/30/audio_90e9bff410.mp3', false, 0.9);
sounds['upgrade'] = createAudio('https://cdn.pixabay.com/audio/2022/10/21/audio_a849cc1412.mp3', false, 0.8);
sounds['fireball'] = createAudio('https://cdn.pixabay.com/audio/2022/03/15/audio_784d72b423.mp3', false, 0.7);


// Normal dungeon music
backgroundMusic = createAudio('https://cdn.pixabay.com/audio/2025/06/09/audio_2d8de8e2ad.mp3', true, 0.4);
// Epic boss music
bossMusic = createAudio('https://cdn.pixabay.com/audio/2022/03/14/audio_c67d746e5d.mp3', true, 0.5);


export const audioService = {
  toggleMute: () => {
    isMuted = !isMuted;
    if (isMuted) {
      audioService.stopMusic();
    }
    return isMuted;
  },
  play: (soundName: keyof typeof sounds) => {
    if (isMuted) return;
    const sound = sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.error(`Error playing sound (${soundName}):`, e));
    }
  },
  playMusic: () => {
    if (isMuted) return;
    if (bossMusic) bossMusic.pause();
    if (backgroundMusic && backgroundMusic.paused) {
      backgroundMusic.play().catch(e => console.error("Error playing music:", e));
    }
  },
  playBossMusic: () => {
    if (isMuted) return;
    if (backgroundMusic) backgroundMusic.pause();
    if (bossMusic && bossMusic.paused) {
      bossMusic.play().catch(e => console.error("Error playing boss music:", e));
    }
  },
  stopMusic: () => {
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
    if (bossMusic) {
        bossMusic.pause();
        bossMusic.currentTime = 0;
    }
  },
};