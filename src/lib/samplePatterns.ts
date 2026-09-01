import type { DrumPattern } from './types';

const allDrumIds = ['kick', 'snare', 'hihat', 'hihatOpen', 'hihatEdge', 'hihatMute', 'crash', 'ride', 'tomHi', 'tomMid', 'tomLo'];

function makeGrid(measures: number, ...rows: [string, number[]][]): Record<string, number[]> {
  const totalSteps = measures * 16;
  const grid: Record<string, number[]> = {};
  for (const id of allDrumIds) {
    grid[id] = new Array(totalSteps).fill(0);
  }
  for (const [drumId, hits] of rows) {
    grid[drumId] = [...hits];
  }
  return grid;
}

export const samplePatterns: DrumPattern[] = [
  {
    id: 'funk',
    name: 'Funk',
    style: 'Funk',
    desc: 'Syncopated kick pattern with snare backbeats and open hi-hat on the & of 4',
    groove: [0, 3, 1, 4, 0, 3, 1, 4, 0, 3, 1, 4, 0, 3, 1, 4],
    bpm: 100,
    measures: 2,
    grid: (() => {
      const m = 2;
      const steps = m * 16;
      const grid: Record<string, number[]> = {};
      for (const id of allDrumIds) grid[id] = new Array(steps).fill(0);
      for (let i = 0; i < m; i++) {
        const o = i * 16;
        grid.kick[o + 0] = 1;
        grid.kick[o + 6] = 1;
        grid.kick[o + 10] = 1;
        grid.snare[o + 4] = 1;
        grid.snare[o + 12] = 1;
        for (let j = 0; j < 16; j += 2) {
          grid.hihat[o + j] = 1;
        }
      }
      return grid;
    })(),
  },
  {
    id: 'basic-rock',
    name: 'Basic Rock',
    style: 'Rock',
    desc: 'Straight-ahead rock pattern with kick on 1 & 3, snare backbeat on 2 & 4, and steady hi-hat 8ths',
    groove: [0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 3],
    bpm: 120,
    measures: 2,
    grid: (() => {
      const m = 2;
      const steps = m * 16;
      const grid: Record<string, number[]> = {};
      for (const id of allDrumIds) grid[id] = new Array(steps).fill(0);
      for (let i = 0; i < m; i++) {
        const o = i * 16;
        grid.kick[o + 0] = 1;
        grid.kick[o + 8] = 1;
        grid.snare[o + 4] = 1;
        grid.snare[o + 12] = 1;
        for (let j = 0; j < 16; j += 2) {
          grid.hihat[o + j] = 1;
        }
      }
      return grid;
    })(),
  },
  {
    id: 'hiphop',
    name: 'Hip Hop',
    style: 'Hip Hop',
    desc: 'Laid-back hip hop with kick on 1, 3, & 4, snare on 2 & 4, and swung hi-hat 8ths',
    groove: [0, 3, 0, 4, 0, 3, 0, 4, 0, 3, 0, 4, 0, 3, 0, 4],
    bpm: 95,
    measures: 2,
    grid: (() => {
      const m = 2;
      const steps = m * 16;
      const grid: Record<string, number[]> = {};
      for (const id of allDrumIds) grid[id] = new Array(steps).fill(0);
      for (let i = 0; i < m; i++) {
        const o = i * 16;
        grid.kick[o + 0] = 1;
        grid.kick[o + 8] = 1;
        grid.kick[o + 12] = 1;
        grid.snare[o + 4] = 1;
        grid.snare[o + 12] = 1;
        for (let j = 0; j < 16; j += 2) {
          grid.hihat[o + j] = 1;
        }
        grid.hihat[o + 14] = 0;
      }
      return grid;
    })(),
  },
  {
    id: 'drum-bass',
    name: 'Drum & Bass',
    style: 'Electronic',
    desc: 'High-energy drum & bass with syncopated kicks, snare on 2 & 4, and fast hi-hat rolls',
    groove: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3],
    bpm: 160,
    measures: 2,
    grid: (() => {
      const m = 2;
      const steps = m * 16;
      const grid: Record<string, number[]> = {};
      for (const id of allDrumIds) grid[id] = new Array(steps).fill(0);
      for (let i = 0; i < m; i++) {
        const o = i * 16;
        grid.kick[o + 0] = 1;
        grid.kick[o + 6] = 1;
        grid.kick[o + 10] = 1;
        grid.kick[o + 13] = 1;
        grid.snare[o + 4] = 1;
        grid.snare[o + 12] = 1;
        for (let j = 0; j < 16; j += 2) {
          grid.hihat[o + j] = 1;
        }
        grid.hihat[o + 5] = 0.5;
        grid.hihat[o + 7] = 0.5;
        grid.hihat[o + 9] = 0.5;
        grid.hihat[o + 15] = 0.5;
      }
      return grid;
    })(),
  },
  {
    id: 'jazz',
    name: 'Jazz',
    style: 'Jazz',
    desc: 'Ride cymbal-driven jazz with syncopated kick and snare comping',
    groove: [0, 3, 0, 4, 0, 3, 0, 4, 0, 3, 0, 4, 0, 3, 0, 4],
    bpm: 120,
    measures: 2,
    grid: (() => {
      const m = 2;
      const steps = m * 16;
      const grid: Record<string, number[]> = {};
      for (const id of allDrumIds) grid[id] = new Array(steps).fill(0);
      for (let i = 0; i < m; i++) {
        const o = i * 16;
        grid.kick[o + 0] = 1;
        grid.kick[o + 6] = 1;
        grid.snare[o + 4] = 0.8;
        grid.snare[o + 14] = 0.6;
        for (let j = 0; j < 16; j += 2) {
          grid.ride[o + j] = 1;
        }
        for (let j = 0; j < 16; j += 2) {
          grid.hihat[o + j] = 0.3;
        }
        grid.hihat[o + 10] = 1;
      }
      return grid;
    })(),
  },
];
