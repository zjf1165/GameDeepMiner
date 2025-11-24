
class AudioService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  public enable() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = true;
  }

  // Ensure context is running before playing (critical for click handlers like Shop)
  private ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("Audio resume failed", e));
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1, startTime: number = 0) {
    if (!this.ctx || !this.enabled) return;
    this.ensureContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    
    // ADSR Envelope
    const now = this.ctx.currentTime + startTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  private playNoise(duration: number, vol: number = 0.1, filterFreq: number = 1000, filterType: BiquadFilterType = 'lowpass') {
    if (!this.ctx || !this.enabled) return;
    this.ensureContext();

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    
    // Filter for tone control
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  public playMove() {
    // Soft gravel step
    this.playNoise(0.08, 0.1, 300, 'lowpass');
  }

  public playMiningHit() {
    if (!this.ctx || !this.enabled) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // 1. Thud (Low frequency impact) - The rock resistance
    this.playNoise(0.05, 0.4, 600, 'lowpass');

    // 2. Clink (High frequency metal) - The pickaxe tip
    // Using two sine waves to create a non-perfect "metal" ring
    const playMetal = (freq: number, vol: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12); // Short ringing

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    };

    playMetal(2500, 0.15);
    playMetal(4200, 0.05);
  }

  public playMiningBreak() {
    if (!this.ctx || !this.enabled) return;
    this.ensureContext();
    // Crumble sound - INCREASED VOLUME significantly so it's audible
    // Heavier low-pass filter for "rubble" sound
    // Previous volume 0.8 was okay, but maybe filter was too aggressive.
    this.playNoise(0.4, 1.0, 800, 'lowpass');
  }

  public playCollect() {
    if (!this.ctx || !this.enabled) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // "Pop" / Bubble sound - Classic inventory pickup
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1); // Fast upward sweep

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playSell() {
    if (!this.ctx || !this.enabled) return;
    this.ensureContext(); // Crucial: Resume context if this was triggered by a UI click
    
    const now = this.ctx.currentTime;
    // "Ka-Ching" / Cash Register
    // Two distinct high-pitched tones, slightly louder
    
    // Tone 1
    this.playTone(1200, 'sine', 0.15, 0.4, 0); 
    // Tone 2 (Higher, slightly delayed)
    this.playTone(2000, 'sine', 0.25, 0.6, 0.08);
  }

  public playError() {
    // Low Buzz
    this.playTone(150, 'sawtooth', 0.2, 0.1);
  }

  public playLowOxygen() {
    // Alarm beep
    this.playTone(880, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(700, 'sine', 0.1, 0.1), 150);
  }

  public playSuccess() {
    // Major Fanfare
    if (!this.ctx || !this.enabled) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    
    const playNote = (f: number, t: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    };

    playNote(523.25, now);       // C
    playNote(659.25, now + 0.1); // E
    playNote(783.99, now + 0.2); // G
    playNote(1046.50, now + 0.4); // C (High)
  }
}

export const audioService = new AudioService();
