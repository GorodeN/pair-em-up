import Notifications from './notifications.js';

class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.audioContext = null;
    this.notifications = new Notifications();
    this.isUnlocked = false;
    this.init();
  }

  init() {
    this.audioContext = null;
  }

  ensureAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      } catch (error) {
        this.notifications.show(
          `Web Audio API is not supported in this browser`,
          'warning'
        );
        this.enabled = false;
        return false;
      }
    }
    return true;
  }

  async generateSound(frequency, duration, type = 'sine', volume = 0.1) {
    if (!this.enabled || !this.isUnlocked) return;

    if (!this.ensureAudioContext()) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      this.notifications.show(`Error generating sound: ${error}`, 'warning');
    }
  }

  playSelect() {
    this.generateSound(800, 0.1, 'sine', 0.1);
  }

  playDeselect() {
    this.generateSound(600, 0.1, 'sine', 0.1);
  }

  playValidPair() {
    this.generateSound(1200, 0.3, 'sine', 0.15);
    setTimeout(() => {
      this.generateSound(1000, 0.2, 'sine', 0.1);
    }, 100);
  }

  playInvalidPair() {
    this.generateSound(150, 0.2, 'sawtooth', 0.1);
  }

  playAssistUse() {
    this.generateSound(1000, 0.2, 'square', 0.1);
  }

  playWin() {
    this.generateSound(523.25, 0.2, 'sine', 0.15);
    setTimeout(() => {
      this.generateSound(659.25, 0.2, 'sine', 0.15);
    }, 100);
    setTimeout(() => {
      this.generateSound(783.99, 0.3, 'sine', 0.15);
    }, 200);
  }

  playLose() {
    this.generateSound(200, 0.8, 'sawtooth', 0.1);
    setTimeout(() => {
      this.generateSound(150, 0.6, 'sawtooth', 0.1);
    }, 400);
  }

  playGameStart() {
    this.generateSound(1000, 0.1, 'sine', 0.1);
    setTimeout(() => {
      this.generateSound(1200, 0.1, 'sine', 0.1);
    }, 100);
    setTimeout(() => {
      this.generateSound(1400, 0.2, 'sine', 0.1);
    }, 200);
  }

  playButtonClick() {
    this.generateSound(600, 0.1, 'sine', 0.1);
  }

  setEnabled(enabled) {
    this.enabled = enabled;

    if (
      enabled &&
      this.audioContext &&
      this.audioContext.state === 'suspended'
    ) {
      this.audioContext.resume().catch((error) => {
        this.notifications.show(
          `Failed to resume audio context: ${error}`,
          'warning'
        );
      });
      this.audioContext.resume();
    }
  }

  async unlock() {
    if (!this.enabled || this.isUnlocked) return;

    if (!this.ensureAudioContext()) return;

    try {
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      source.start(0);
      source.stop(this.audioContext.currentTime + 0.001);

      this.isUnlocked = true;
    } catch (error) {
      this.notifications.show(
        `Failed to unlock audio context: ${error}`,
        'warning'
      );
    }
  }
}

export default SoundManager;
