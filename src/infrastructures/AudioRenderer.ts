class Timer {
  private timeoutId?: number;

  constructor(interval: number, callback: () => void) {
    const tick = () => {
      callback();
      this.timeoutId = window.setTimeout(tick, interval);
    };
    tick();
  }

  dispose() {
    if (this.timeoutId !== undefined) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}

type SchedulableEvent = {
  readonly time: number;
  readonly schedule: (contextTime: number) => void;
};

export interface SoundSequence {
  generateEvents(startTime: number): SchedulableEvent[];
  scheduleStop(contextTime: number): void;
}

class SoundScheduler {
  readonly sequence: SoundSequence;
  private readonly startContextTime;
  private readonly startTime;
  private readonly events: SchedulableEvent[];

  private index = 0;

  constructor(
    sequence: SoundSequence,
    startContextTime: number,
    startTime: number
  ) {
    this.sequence = sequence;
    this.startContextTime = startContextTime;
    this.startTime = startTime;
    this.events = this.sequence.generateEvents(startTime);
  }

  private calculateContextTime(time: number) {
    return this.startContextTime + (time - this.startTime);
  }

  scheduleEvents(time: number, period: number) {
    if (time < this.startTime) {
      throw new Error("The specified time is invalid.");
    }

    while (this.index < this.events.length) {
      const event = this.events[this.index];
      const eventContextTime = this.calculateContextTime(event.time);

      if (event.time < time + period) {
        event.schedule(eventContextTime);
        this.index++;
      } else break;
    }
  }

  stopScheduling(contextTime: number) {
    this.sequence.scheduleStop(contextTime);
  }
}

export class Transport {
  private readonly audioContext: AudioContext;
  private readonly timer: Timer;
  private readonly lookAhead: number;

  private _state: "started" | "stopped" = "stopped";
  private _time = 0;
  private sequences: SoundSequence[] = [];

  private startContextTime = 0;
  private startTime = 0;
  private schedulers: SoundScheduler[] = [];
  private schedulersToBeStopped: SoundScheduler[] = [];

  get state() {
    return this._state;
  }

  get time() {
    if (this._state === "started") {
      const contextTime = this.audioContext.currentTime;
      this._time = this.calculateTime(contextTime);
    }
    return this._time;
  }

  set time(value: number) {
    if (this._state === "started") {
      this.stop();
      this._time = value;
      this.start();
    } else {
      this._time = value;
    }
  }

  constructor(audioContext: AudioContext, interval: number, lookAhead: number) {
    if (lookAhead <= interval) {
      throw new Error("Look-ahead time must be longer than the interval.");
    }

    this.audioContext = audioContext;
    this.lookAhead = lookAhead;
    this.timer = new Timer(interval * 1000, () => {
      if (this._state === "started") {
        const contextTime = this.audioContext.currentTime;
        this.scheduleEvents(contextTime);
      }
    });
  }

  private calculateTime(contextTime: number) {
    const elapsedTime = contextTime - this.startContextTime;
    return this.startTime + elapsedTime;
  }

  private getScheduler(sequence: SoundSequence) {
    return this.schedulers.find((value) => {
      return value.sequence === sequence;
    });
  }

  private scheduleEvents(contextTime: number) {
    const time = this.calculateTime(contextTime);

    this.schedulersToBeStopped.forEach((value) => {
      value.stopScheduling(contextTime);
    });
    this.schedulersToBeStopped = [];

    this.sequences.forEach((value) => {
      let scheduler = this.getScheduler(value);
      if (scheduler === undefined) {
        scheduler = new SoundScheduler(value, contextTime, time);
        this.schedulers.push(scheduler);
      }
      scheduler.scheduleEvents(time, this.lookAhead);
    });
  }

  addSequence(sequence: SoundSequence) {
    const exists = this.sequences.some((value) => {
      return value === sequence;
    });
    if (exists) {
      throw new Error("The specified sequence has already been added.");
    }
    this.sequences.push(sequence);
  }

  removeSequence(sequence: SoundSequence) {
    const index = this.sequences.findIndex((value) => {
      return value === sequence;
    });
    if (index === -1) {
      throw new Error("The specified sequence does not exist.");
    }
    this.sequences.splice(index, 1);

    if (this.state === "started") {
      const index = this.schedulers.findIndex((value) => {
        return value.sequence === sequence;
      });
      if (index === -1) return;

      const removedScheduler = this.schedulers.splice(index, 1)[0];
      this.schedulersToBeStopped.push(removedScheduler);
    }
  }

  start() {
    if (this._state === "started") return;
    const contextTime = this.audioContext.currentTime;

    this._state = "started";

    this.startContextTime = contextTime;
    this.startTime = this._time;
    this.schedulers = [];
    this.schedulersToBeStopped = [];

    this.scheduleEvents(contextTime);
  }

  stop() {
    if (this._state === "stopped") return;
    const contextTime = this.audioContext.currentTime;
    this._time = this.calculateTime(contextTime);

    this._state = "stopped";

    this.schedulers.forEach((value) => {
      value.stopScheduling(contextTime);
    });
    this.schedulersToBeStopped.forEach((value) => {
      value.stopScheduling(contextTime);
    });
  }

  dispose() {
    if (this.state === "started") {
      this.stop();
    }
    this.timer.dispose();
  }
}

export interface Instrument {
  noteOn(contextTime: number, midi: number): void;
  noteOff(contextTime: number, midi: number): void;
  allStop(contextTime?: number): void;
}

export type NoteEvent = {
  readonly noteOnTime: number;
  readonly noteOffTime: number;
  readonly midi: number;
};

export class NoteSequence implements SoundSequence {
  private readonly instrument: Instrument;
  private readonly noteEvents: NoteEvent[];

  constructor(instrument: Instrument, noteEvents: NoteEvent[]) {
    this.instrument = instrument;
    this.noteEvents = noteEvents;
  }

  generateEvents(startTime: number): SchedulableEvent[] {
    return this.noteEvents
      .sort((a, b) => a.noteOnTime - b.noteOnTime)
      .filter((value) => value.noteOffTime > startTime)
      .map((value) => [
        {
          time: Math.max(value.noteOnTime, startTime),
          schedule: (contextTime: number) => {
            this.instrument.noteOn(contextTime, value.midi);
          },
        },
        {
          time: value.noteOffTime,
          schedule: (contextTime: number) => {
            this.instrument.noteOff(contextTime, value.midi);
          },
        },
      ])
      .flat()
      .sort((a, b) => a.time - b.time);
  }

  scheduleStop(contextTime: number) {
    this.instrument.allStop(contextTime);
  }
}

export type Envelope = {
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
};

type SynthVoiceOptions = {
  readonly midi: number;
  readonly oscillatorType: OscillatorType;
  readonly envelope: Envelope;
};

class SynthVoice {
  readonly midi: number;
  private readonly oscillatorNode: OscillatorNode;
  private readonly gainNode: GainNode;
  private readonly envelope: Envelope;

  private _isActive = false;
  private _isStopped = false;
  private stopContextTime?: number;

  get isActive() {
    return this._isActive;
  }

  get isStopped() {
    return this._isStopped;
  }

  constructor(audioContext: BaseAudioContext, options: SynthVoiceOptions) {
    this.midi = options.midi;
    this.envelope = options.envelope;

    this.oscillatorNode = audioContext.createOscillator();
    this.oscillatorNode.onended = () => {
      this._isStopped = true;
    };
    this.gainNode = audioContext.createGain();
    this.oscillatorNode.type = options.oscillatorType;
    this.oscillatorNode.connect(this.gainNode);
  }

  private midiToFrequency(midi: number) {
    return 440 * 2 ** ((midi - 69) / 12);
  }

  connect(inputNode: AudioNode) {
    this.gainNode.connect(inputNode);
  }

  noteOn(contextTime: number) {
    const t0 = contextTime;
    const atk = this.envelope.attack;
    const dcy = this.envelope.decay;
    const sus = this.envelope.sustain;

    this.gainNode.gain.value = 0;
    this.gainNode.gain.setValueAtTime(0, t0);
    this.gainNode.gain.linearRampToValueAtTime(1, t0 + atk);
    this.gainNode.gain.setTargetAtTime(sus, t0 + atk, dcy);

    const freq = this.midiToFrequency(this.midi);
    this.oscillatorNode.frequency.value = freq;

    this.oscillatorNode.start(contextTime);
    this._isActive = true;
  }

  noteOff(contextTime: number) {
    if (
      this.stopContextTime === undefined ||
      contextTime < this.stopContextTime
    ) {
      const t0 = contextTime;
      const rel = this.envelope.release;

      this.gainNode.gain.cancelAndHoldAtTime(t0);
      this.gainNode.gain.setTargetAtTime(0, t0, rel);

      this.oscillatorNode.stop(t0 + rel * 4);
      this._isActive = false;

      this.stopContextTime = contextTime;
    }
  }

  dispose() {
    this.stopContextTime = 0;
    this.oscillatorNode.stop();
    this._isActive = false;
  }
}

export type SynthOptions = {
  readonly volume: number;
  readonly oscillatorType: OscillatorType;
  readonly envelope: Envelope;
};

export class Synth implements Instrument {
  private readonly audioContext: BaseAudioContext;
  private readonly gainNode: GainNode;
  private readonly oscillatorType: OscillatorType;
  private readonly envelope: Envelope;

  private voices: SynthVoice[] = [];

  constructor(
    context: Context,
    options: SynthOptions = {
      volume: 0.1,
      oscillatorType: "square",
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.7,
        release: 0.02,
      },
    }
  ) {
    this.audioContext = context.audioContext;

    this.oscillatorType = options.oscillatorType;
    this.envelope = options.envelope;
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = options.volume;
  }

  connect(destination: AudioNode) {
    this.gainNode.connect(destination);
  }

  disconnect() {
    this.gainNode.disconnect();
  }

  noteOn(contextTime: number, midi: number) {
    const exists = this.voices.some((value) => {
      return value.isActive && value.midi === midi;
    });
    if (exists) return;

    const voice = new SynthVoice(this.audioContext, {
      midi,
      oscillatorType: this.oscillatorType,
      envelope: this.envelope,
    });
    this.voices = this.voices.filter((value) => {
      return !value.isStopped;
    });
    this.voices.push(voice);
    voice.connect(this.gainNode);
    voice.noteOn(contextTime);
  }

  noteOff(contextTime: number, midi: number) {
    const voice = this.voices.find((value) => {
      return value.isActive && value.midi === midi;
    });
    if (voice === undefined) return;

    voice.noteOff(contextTime);
  }

  allStop(contextTime?: number) {
    if (contextTime === undefined) {
      this.voices.forEach((value) => {
        value.dispose();
      });
      this.voices = [];
    } else {
      this.voices.forEach((value) => {
        value.noteOff(contextTime);
      });
    }
  }

  dispose() {
    this.allStop();
  }
}

export type Context = {
  readonly audioContext: BaseAudioContext;
  readonly transport: Transport;
};

export class AudioRenderer {
  private readonly onlineContext: {
    readonly audioContext: AudioContext;
    readonly transport: Transport;
  };

  get context(): Context {
    return {
      audioContext: this.onlineContext.audioContext,
      transport: this.onlineContext.transport,
    };
  }

  get transport() {
    return this.onlineContext.transport;
  }

  constructor() {
    const audioContext = new AudioContext();
    const transport = new Transport(audioContext, 0.2, 0.6);
    this.onlineContext = { audioContext, transport };
  }

  dispose() {
    this.onlineContext.transport.dispose();
    this.onlineContext.audioContext.close();
  }
}
