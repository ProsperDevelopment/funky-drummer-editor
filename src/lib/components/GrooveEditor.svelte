<script lang="ts">
  import type { DrumPattern } from '$lib/types';

  let { pattern, onupdate }: { pattern: DrumPattern; onupdate: (p: DrumPattern) => void } = $props();

  function updateGroove(index: number, value: number) {
    const newGroove = [...pattern.groove];
    newGroove[index] = value;
    onupdate({ ...pattern, groove: newGroove });
  }

  function resetGroove() {
    onupdate({ ...pattern, groove: new Array(16).fill(0) });
  }
</script>

<div class="groove-editor">
  <div class="header">
    <h3>Groove (ms deviation)</h3>
    <button onclick={resetGroove}>Reset</button>
  </div>
  <div class="grid">
    {#each pattern.groove as value, i}
      <div class="cell">
        <div class="bar-container">
          <div
            class="bar"
            class:positive={value > 0}
            class:negative={value < 0}
            style="height: {Math.abs(value) * 10}%"
          ></div>
          <div class="center-line"></div>
        </div>
        <input
          type="range"
          min="-5"
          max="5"
          step="0.5"
          value={value}
          oninput={(e) => updateGroove(i, parseFloat(e.currentTarget.value))}
          class="slider"
        />
        <span class="value">{value > 0 ? '+' : ''}{value}</span>
        <span class="step">{i + 1}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .groove-editor {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0;
  }

  .grid {
    display: flex;
    gap: 0.375rem;
  }

  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .bar-container {
    width: 28px;
    height: 44px;
    position: relative;
    background: var(--bg-deep);
    border: 1px solid var(--border);
    border-radius: 3px;
  }

  .bar {
    position: absolute;
    bottom: 50%;
    width: 100%;
    background: var(--cyan);
    border-radius: 2px 2px 0 0;
    transition: height 0.1s ease-out;
  }

  .bar.positive {
    bottom: 50%;
    background: var(--cyan);
  }

  .bar.negative {
    top: 50%;
    background: var(--danger);
    border-radius: 0 0 2px 2px;
  }

  .center-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border);
  }

  .slider {
    width: 28px;
    height: 60px;
    writing-mode: vertical-lr;
    direction: rtl;
    appearance: slider-vertical;
    accent-color: var(--accent-purple);
  }

  .value {
    font-size: 0.625rem;
    color: var(--text-muted);
    width: 32px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .step {
    font-size: 0.5625rem;
    color: var(--text-muted);
  }
</style>
