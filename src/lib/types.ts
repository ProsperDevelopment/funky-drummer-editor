export interface DrumDef {
  id: string;
  name: string;
  midiNote: number;
  key: string;
  color: string;
}

export type DrumGrid = Record<string, number[]>;

export interface DrumPattern {
  id: string;
  name: string;
  style: string;
  desc: string;
  groove: number[];
  bpm: number;
  measures: number;
  grid: DrumGrid;
}

export const drumConfig: DrumDef[] = [
  { id: 'kick', name: 'Kick', midiNote: 36, key: 'a', color: '#e74c3c' },
  { id: 'snare', name: 'Snare', midiNote: 38, key: 's', color: '#3498db' },
  { id: 'hihat', name: 'Hi-Hat', midiNote: 42, key: 'd', color: '#f1c40f' },
  { id: 'hihatOpen', name: 'Hi-Hat Open', midiNote: 46, key: 'f', color: '#f39c12' },
  { id: 'hihatEdge', name: 'Hi-Hat Edge', midiNote: 22, key: 'x', color: '#e8c87a' },
  { id: 'hihatMute', name: 'Hi-Hat Mute', midiNote: 44, key: 'z', color: '#c8a84a' },
  { id: 'crash', name: 'Crash', midiNote: 49, key: 'g', color: '#9b59b6' },
  { id: 'ride', name: 'Ride', midiNote: 51, key: 'h', color: '#1abc9c' },
  { id: 'tomHi', name: 'Hi Tom', midiNote: 48, key: 'j', color: '#2ecc71' },
  { id: 'tomMid', name: 'Mid Tom', midiNote: 45, key: 'k', color: '#27ae60' },
  { id: 'tomLo', name: 'Floor Tom', midiNote: 43, key: 'l', color: '#e67e22' },
];

export function validatePattern(data: unknown): DrumPattern {
  const d = data as Record<string, unknown>;
  const measures = (d.measures as number) || 2;
  const totalSteps = measures * 16;
  const grid: DrumGrid = {};

  for (const drum of drumConfig) {
    const row = (d.grid as Record<string, number[]>)?.[drum.id];
    if (Array.isArray(row)) {
      grid[drum.id] = row.slice(0, totalSteps);
      while (grid[drum.id].length < totalSteps) grid[drum.id].push(0);
    } else {
      grid[drum.id] = new Array(totalSteps).fill(0);
    }
  }

  return {
    id: (d.id as string) || crypto.randomUUID(),
    name: (d.name as string) || 'Imported Pattern',
    style: (d.style as string) || 'Custom',
    desc: (d.desc as string) || '',
    groove: Array.isArray(d.groove) ? d.groove : new Array(16).fill(0),
    bpm: (d.bpm as number) || 120,
    measures,
    grid,
  };
}

export function createEmptyPattern(): DrumPattern {
  const measures = 2;
  const totalSteps = measures * 16;
  const grid: DrumGrid = {};
  for (const drum of drumConfig) {
    grid[drum.id] = new Array(totalSteps).fill(0);
  }
  return {
    id: crypto.randomUUID(),
    name: 'New Pattern',
    style: 'Custom',
    desc: '',
    groove: new Array(16).fill(0),
    bpm: 120,
    measures,
    grid,
  };
}

export function createDefaultPattern(): DrumPattern {
  const measures = 2;
  const totalSteps = measures * 16;
  const grid: DrumGrid = {};
  for (const drum of drumConfig) {
    grid[drum.id] = new Array(totalSteps).fill(0);
  }
  for (let i = 0; i < measures; i++) {
    const o = i * 16;
    grid.kick[o + 0] = 1;
    grid.kick[o + 8] = 1;
    grid.snare[o + 4] = 1;
    grid.snare[o + 12] = 1;
    for (let j = 0; j < 16; j += 2) {
      grid.hihat[o + j] = 1;
    }
  }
  return {
    id: 'basic-rock',
    name: 'Basic Rock',
    style: 'Rock',
    desc: 'Straight-ahead rock pattern',
    groove: [0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 3],
    bpm: 120,
    measures,
    grid,
  };
}
