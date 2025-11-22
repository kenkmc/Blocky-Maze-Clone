export class SoundManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      // Defer creation until interaction to handle autoplay policies
      window.addEventListener('click', () => this.init(), { once: true });
      window.addEventListener('keydown', () => this.init(), { once: true });
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private init() {
    if (this.context) return;
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playMove() {
    if (!this.enabled || !this.context) return;
    this.playTone(300, 'sine', 0.1);
  }

  public playTurn() {
    if (!this.enabled || !this.context) return;
    this.playTone(200, 'triangle', 0.1);
  }

  public playWallHit() {
    if (!this.enabled || !this.context) return;
    this.playTone(100, 'sawtooth', 0.3);
  }

  public playWin() {
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime;
    this.playTone(440, 'sine', 0.1, now);
    this.playTone(554, 'sine', 0.1, now + 0.1);
    this.playTone(659, 'sine', 0.2, now + 0.2);
  }

  public playFail() {
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime;
    this.playTone(300, 'sawtooth', 0.2, now);
    this.playTone(200, 'sawtooth', 0.4, now + 0.2);
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime?: number) {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(this.context.destination);

    const start = startTime || this.context.currentTime;
    osc.start(start);
    
    gain.gain.setValueAtTime(0.1, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.stop(start + duration);
  }
}
