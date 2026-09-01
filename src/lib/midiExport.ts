import type { DrumPattern, DrumGrid } from './types';
import { drumConfig } from './types';

const TICKS_PER_QUARTER = 480;
const TICKS_PER_16TH = TICKS_PER_QUARTER / 4; // 120
const DRUM_CHANNEL = 9; // 0-indexed GM percussion channel

// ── Variable-Length Quantity Encoder ──────────────────────────────────────────

function encodeVLQ(value: number): number[] {
  if (value < 0) throw new Error('VLQ value must be non-negative');

  const bytes: number[] = [];
  bytes.push(value & 0x7f);
  value >>>= 7;

  while (value > 0) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }

  return bytes.reverse();
}

// ── 16-bit and 32-bit big-endian writers ─────────────────────────────────────

function writeUint16(value: number): number[] {
  return [(value >>> 8) & 0xff, value & 0xff];
}

function writeUint32(value: number): number[] {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

// ── MIDI event helpers ───────────────────────────────────────────────────────

function noteOn(tick: number, note: number, velocity: number): number[] {
  return [
    ...encodeVLQ(tick),
    0x90 | DRUM_CHANNEL,
    note,
    velocity,
  ];
}

function noteOff(tick: number, note: number): number[] {
  return [
    ...encodeVLQ(tick),
    0x80 | DRUM_CHANNEL,
    note,
    0,
  ];
}

function metaEvent(tick: number, type: number, data: number[]): number[] {
  return [
    ...encodeVLQ(tick),
    0xff,
    type,
    ...encodeVLQ(data.length),
    ...data,
  ];
}

function endOfTrack(tick: number): number[] {
  return metaEvent(tick, 0x2f, [0x00]);
}

// ── Build the tempo track (Track 0) ─────────────────────────────────────────

function buildTempoTrack(bpm: number): number[] {
  const microsecondsPerQuarter = Math.round(60_000_000 / bpm);
  const tempoBytes = [
    (microsecondsPerQuarter >>> 16) & 0xff,
    (microsecondsPerQuarter >>> 8) & 0xff,
    microsecondsPerQuarter & 0xff,
  ];

  const trackData: number[] = [
    ...metaEvent(0, 0x51, tempoBytes),
    ...endOfTrack(0),
  ];

  return [
    0x4d, 0x54, 0x72, 0x6b, // "MTrk"
    ...writeUint32(trackData.length),
    ...trackData,
  ];
}

// ── Build the drum track (Track 1) ──────────────────────────────────────────

interface MidiEvent {
  tick: number;
  bytes: number[];
}

function buildDrumTrack(grid: DrumGrid, totalSteps: number): number[] {
  const events: MidiEvent[] = [];

  for (const drum of drumConfig) {
    const row = grid[drum.id];
    if (!row) continue;

    for (let step = 0; step < totalSteps; step++) {
      const velocity = row[step];
      if (velocity <= 0) continue;

      const tick = step * TICKS_PER_16TH;
      const note = drum.midiNote;
      const vel = Math.round(velocity * 127);

      events.push({ tick, bytes: noteOn(0, note, vel) });
      // Note-off one tick later (short percussive hit)
      events.push({ tick: tick + 1, bytes: noteOff(0, note) });
    }
  }

  // Sort by tick, then note-on before note-off at same tick
  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    // Note-on (0x90) before note-off (0x80)
    return (a.bytes[1] & 0xf0) === 0x90 ? -1 : 1;
  });

  // Encode with delta times
  const trackData: number[] = [];
  let lastTick = 0;

  for (const event of events) {
    const delta = event.tick - lastTick;
    trackData.push(...encodeVLQ(delta), ...event.bytes.slice(1)); // skip the tick encoded in event.bytes[0]
    lastTick = event.tick;
  }

  // End-of-track: delta from last event
  trackData.push(...endOfTrack(events.length > 0 ? 1 : 0));

  return [
    0x4d, 0x54, 0x72, 0x6b, // "MTrk"
    ...writeUint32(trackData.length),
    ...trackData,
  ];
}

// ── Assemble the full SMF Type 1 file ───────────────────────────────────────

function buildMidiFile(pattern: DrumPattern): ArrayBuffer {
  const totalSteps = pattern.measures * 16;

  const header = [
    0x4d, 0x54, 0x68, 0x64, // "MThd"
    ...writeUint32(6), // header chunk length
    ...writeUint16(1), // format type 1
    ...writeUint16(2), // two tracks
    ...writeUint16(TICKS_PER_QUARTER),
  ];

  const track0 = buildTempoTrack(pattern.bpm);
  const track1 = buildDrumTrack(pattern.grid, totalSteps);

  const bytes = new Uint8Array(header.length + track0.length + track1.length);
  bytes.set(header, 0);
  bytes.set(track0, header.length);
  bytes.set(track1, header.length + track0.length);

  return bytes.buffer;
}

// ── Public API ───────────────────────────────────────────────────────────────

export function exportMidi(pattern: DrumPattern): void {
  const buffer = buildMidiFile(pattern);
  const blob = new Blob([buffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${pattern.id || 'pattern'}.mid`;
  a.click();

  URL.revokeObjectURL(url);
}
