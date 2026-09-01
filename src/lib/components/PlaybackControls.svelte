<script lang="ts">
  import type { DrumPattern } from '$lib/types';

  let { pattern, onstep }: { pattern: DrumPattern; onstep: (step: number) => void } = $props();

  let isPlaying = $state(false);
  let currentStep = $state(-1);
  let audioCtx = $state<AudioContext | null>(null);
  let sequencer = $state<ReturnType<typeof import('$lib/audio').createSequencer> | null>(null);

  let bpm = $state(120);

  // Sync BPM from pattern when it changes (e.g. pattern switch)
  $effect(() => {
    bpm = pattern.bpm;
  });

  const totalSteps = $derived(pattern.measures * 16);
  const currentBeat = $derived(Math.floor((currentStep % 16) / 4) + 1);
  const currentSubBeat = $derived((currentStep % 4) + 1);

  $effect(() => {
    if (sequencer) {
      sequencer.updatePattern(pattern);
    }
  });

  $effect(() => {
    if (sequencer) {
      sequencer.updateBpm(bpm);
    }
  });

  async function ensureAudioContext(): Promise<AudioContext> {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    return audioCtx;
  }

  async function togglePlay() {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }

  async function play() {
    const ctx = await ensureAudioContext();
    const { createSequencer } = await import('$lib/audio');

    if (!sequencer) {
      sequencer = createSequencer(pattern, ctx);
    }

    sequencer.start(bpm, (step: number) => {
      currentStep = step;
      onstep(step);
    });
    isPlaying = true;
  }

  function pause() {
    if (sequencer) {
      sequencer.stop();
    }
    isPlaying = false;
  }

  function stop() {
    if (sequencer) {
      sequencer.stop();
    }
    isPlaying = false;
    currentStep = -1;
    onstep(-1);
  }

  function incrementBpm() {
    bpm = Math.min(300, bpm + 1);
  }

  function decrementBpm() {
    bpm = Math.max(30, bpm - 1);
  }

  function handleBpmInput(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      bpm = Math.max(30, Math.min(300, val));
    }
  }
</script>

<div class="playback-controls">
  <div class="transport-buttons">
    <button
      class="play-btn"
      class:active={isPlaying}
      onclick={togglePlay}
      title={isPlaying ? 'Pause' : 'Play'}
    >
      {#if isPlaying}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <polygon points="3,1 14,8 3,15" />
        </svg>
      {/if}
    </button>
    <button class="stop-btn" onclick={stop} title="Stop" disabled={!isPlaying && currentStep === -1}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="3" y="3" width="10" height="10" rx="1" />
      </svg>
    </button>
  </div>

  <div class="bpm-control">
    <button class="bpm-btn" onclick={decrementBpm} title="Decrease BPM">−</button>
    <input
      type="number"
      class="bpm-input"
      value={bpm}
      min="30"
      max="300"
      oninput={handleBpmInput}
      title="BPM"
    />
    <button class="bpm-btn" onclick={incrementBpm} title="Increase BPM">+</button>
    <span class="bpm-label">BPM</span>
  </div>

  {#if currentStep >= 0}
    <div class="step-indicator">
      <span class="beat-display">Beat {currentBeat}</span>
      <span class="sub-display">•{currentSubBeat}</span>
    </div>
  {:else}
    <div class="step-indicator dimmed">
      <span class="beat-display">—</span>
      <span class="sub-display">—</span>
    </div>
  {/if}

  {#if currentStep >= 0}
    <div class="progress-bar">
      <div class="progress-fill" style="width: {((currentStep + 1) / totalSteps) * 100}%"></div>
    </div>
  {:else}
    <div class="progress-bar">
      <div class="progress-fill" style="width: 0%"></div>
    </div>
  {/if}
</div>

<style>
  .playback-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    flex-wrap: wrap;
  }

  .transport-buttons {
    display: flex;
    gap: 0.375rem;
  }

  .play-btn,
  .stop-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    border: 3px solid var(--border);
    color: var(--text-secondary);
    border-radius: 2px;
    cursor: pointer;
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.25),
      inset 2px 2px 0 rgba(255, 255, 255, 0.08),
      3px 3px 0 var(--border);
  }

  .play-btn:hover,
  .stop-btn:hover {
    background: var(--bg-hover);
    border-color: var(--accent-purple);
    color: var(--text-primary);
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.25),
      inset 2px 2px 0 rgba(255, 255, 255, 0.08),
      3px 3px 0 var(--accent-purple),
      0 0 8px var(--accent-purple-glow);
  }

  .play-btn:active,
  .stop-btn:active {
    box-shadow:
      inset 2px 2px 0 rgba(0, 0, 0, 0.3),
      inset -2px -2px 0 rgba(255, 255, 255, 0.05);
    transform: translate(2px, 2px);
  }

  .play-btn.active {
    background: var(--accent-pink);
    border-color: var(--accent-pink);
    color: var(--primary-foreground);
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.2),
      inset 2px 2px 0 rgba(255, 255, 255, 0.15),
      3px 3px 0 var(--accent-pink),
      0 0 12px var(--accent-pink-glow);
  }

  .play-btn.active:hover {
    background: var(--accent-pink-light);
    border-color: var(--accent-pink-light);
  }

  .stop-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .bpm-control {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .bpm-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    border: 3px solid var(--border);
    color: var(--text-secondary);
    border-radius: 2px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.25),
      inset 2px 2px 0 rgba(255, 255, 255, 0.08),
      3px 3px 0 var(--border);
  }

  .bpm-btn:hover {
    background: var(--bg-hover);
    border-color: var(--accent-purple);
    color: var(--text-primary);
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.25),
      inset 2px 2px 0 rgba(255, 255, 255, 0.08),
      3px 3px 0 var(--accent-purple),
      0 0 8px var(--accent-purple-glow);
  }

  .bpm-btn:active {
    box-shadow:
      inset 2px 2px 0 rgba(0, 0, 0, 0.3),
      inset -2px -2px 0 rgba(255, 255, 255, 0.05);
    transform: translate(2px, 2px);
  }

  .bpm-input {
    width: 56px;
    text-align: center;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 0.375rem 0.25rem;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    border-radius: 4px;
    appearance: textfield;
    -moz-appearance: textfield;
  }

  .bpm-input::-webkit-outer-spin-button,
  .bpm-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .bpm-input:focus {
    outline: none;
    border-color: var(--accent-pink);
    box-shadow: 0 0 0 1px var(--accent-pink-glow);
  }

  .bpm-label {
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-left: 0.25rem;
    font-family: var(--font-retro);
  }

  .step-indicator {
    display: flex;
    align-items: baseline;
    gap: 0.375rem;
    font-variant-numeric: tabular-nums;
    min-width: 90px;
  }

  .step-indicator.dimmed {
    opacity: 0.4;
  }

  .beat-display {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .sub-display {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .progress-bar {
    flex: 1;
    min-width: 80px;
    height: 4px;
    background: var(--muted);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-pink), var(--accent-pink-light));
    border-radius: 2px;
    transition: width 0.05s linear;
  }
</style>
