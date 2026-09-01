<script lang="ts">
  import type { DrumPattern, DrumDef } from '$lib/types';
  import { drumConfig } from '$lib/types';

  let { pattern, onupdate, currentStep = -1 }: { pattern: DrumPattern; onupdate: (p: DrumPattern) => void; currentStep?: number } = $props();

  let selectedDrum = $state<string>('kick');
  let velocity = $state<number>(1);

  /** Tracks which cell is focused for keyboard navigation. Null means no cell is focused. */
  let focusedCell = $state<{ row: number; step: number } | null>(null);

  function totalSteps(): number {
    return pattern.measures * 16;
  }

  function toggleCell(drumId: string, step: number) {
    const row = pattern.grid[drumId];
    row[step] = row[step] > 0 ? 0 : velocity;
    onupdate(pattern);
  }

  function clearDrum(drumId: string) {
    pattern.grid[drumId].fill(0);
    onupdate(pattern);
  }

  function clearAll() {
    for (const drum of drumConfig) {
      pattern.grid[drum.id].fill(0);
    }
    onupdate(pattern);
  }

  function getStepColor(drumId: string, step: number): string {
    const drum = drumConfig.find((d) => d.id === drumId);
    const value = pattern.grid[drumId]?.[step] ?? 0;
    if (value === 0) return 'transparent';
    const alpha = 0.3 + value * 0.7;
    return drum?.color ? `${drum.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : 'var(--text-primary)';
  }

  function getBeatClass(step: number): string {
    if (step % 16 === 0) return 'beat-start';
    if (step % 4 === 0) return 'beat';
    return '';
  }

  function handleGridKeydown(e: KeyboardEvent, row: number, step: number) {
    const maxRow = drumConfig.length - 1;
    const maxStep = totalSteps() - 1;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        focusedCell = { row: Math.max(0, row - 1), step };
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusedCell = { row: Math.min(maxRow, row + 1), step };
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusedCell = { row, step: Math.max(0, step - 1) };
        break;
      case 'ArrowRight':
        e.preventDefault();
        focusedCell = { row, step: Math.min(maxStep, step + 1) };
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        toggleCell(drumConfig[row].id, step);
        break;
      case 'Escape':
        e.preventDefault();
        focusedCell = null;
        (e.target as HTMLElement).blur();
        break;
    }
  }

  function handleGridKeydownBubbling(e: KeyboardEvent) {
    // Handle arrow keys from the grid container when no cell is focused
    if (focusedCell !== null) return;

    if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      focusedCell = { row: 0, step: 0 };
    }
  }

  function focusCell(row: number, step: number) {
    focusedCell = { row, step };
    // Find and focus the actual DOM element
    requestAnimationFrame(() => {
      const cell = document.querySelector(`[data-row="${row}"][data-step="${step}"]`) as HTMLElement;
      cell?.focus();
    });
  }
</script>

<div class="pattern-grid">
  <div class="controls">
    <label>
      Velocity:
      <input type="range" min="0" max="1" step="0.1" bind:value={velocity} />
      <span>{velocity.toFixed(1)}</span>
    </label>
    <button onclick={clearAll}>Clear All</button>
    {#if focusedCell}
      <span class="focus-hint">
        Focused: {drumConfig[focusedCell.row].name} step {focusedCell.step + 1} — Space/Enter to toggle, arrows to move, Esc to deselect
      </span>
    {/if}
  </div>

  <div class="grid-scroll">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div class="grid-container" role="grid" tabindex="-1" onkeydown={handleGridKeydownBubbling}>
      <div class="drum-labels">
        <div class="drum-label-spacer"></div>
        {#each drumConfig as drum, row}
          <div
            class="drum-label"
            class:focused-row={focusedCell?.row === row}
            style="color: {drum.color}"
          >
            <span class="drum-name">{drum.name}</span>
            <button class="clear-btn" onclick={() => clearDrum(drum.id)} title="Clear {drum.name}">×</button>
          </div>
        {/each}
        <div class="drum-label-spacer bottom"></div>
      </div>

      <div class="grid-column">
        <div class="beat-numbers-row">
          {#each Array(pattern.measures) as _, measure}
            <div class="measure-group">
              {#each Array(4) as _, beat}
                {@const beatStep = measure * 16 + beat * 4}
                <span class="beat-num" class:beat-current={currentStep >= beatStep && currentStep < beatStep + 4}>{beat + 1}</span>
              {/each}
            </div>
          {/each}
        </div>

        {#each drumConfig as drum, row}
          <div class="row">
            {#each Array(pattern.measures) as _, measure}
              <div class="measure" class:measure-alt={measure % 2 === 1}>
                {#each Array(16) as _, step}
                  {@const absStep = measure * 16 + step}
                  <button
                    class="cell {getBeatClass(absStep)}"
                    class:active={pattern.grid[drum.id]?.[absStep] > 0}
                    class:focused={focusedCell?.row === row && focusedCell?.step === absStep}
                    class:current-step={currentStep === absStep}
                    style="background-color: {getStepColor(drum.id, absStep)}"
                    onclick={() => toggleCell(drum.id, absStep)}
                    onfocus={() => (focusedCell = { row, step: absStep })}
                    onkeydown={(e) => handleGridKeydown(e, row, absStep)}
                    data-row={row}
                    data-step={absStep}
                    tabindex={focusedCell?.row === row && focusedCell?.step === absStep ? 0 : -1}
                    title="{drum.name} step {absStep + 1}"
                  ></button>
                {/each}
              </div>
            {/each}
          </div>
        {/each}

        <div class="step-numbers-row">
          {#each Array(pattern.measures) as _, measure}
            <div class="measure-group">
              {#each Array(16) as _, step}
                {@const absStep = measure * 16 + step}
                <span class="step-num {getBeatClass(absStep)}" class:step-current={currentStep === absStep}>{step + 1}</span>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .pattern-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .controls {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .controls input[type='range'] {
    width: 100px;
    accent-color: var(--accent-pink);
  }

  .grid-scroll {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .grid-container {
    display: flex;
    gap: 0.75rem;
  }

  .drum-labels {
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: sticky;
    left: 0;
    z-index: 2;
    background: var(--background);
    padding-right: 0.25rem;
  }

  .drum-label-spacer {
    height: 22px;
  }

  .drum-label-spacer.bottom {
    height: 18px;
  }

  .drum-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    min-width: 100px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .drum-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .clear-btn {
    opacity: 0;
    transition: opacity 0.15s;
    padding: 0 4px;
    font-size: 0.75rem;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    box-shadow: none;
  }

  .clear-btn:hover {
    opacity: 1;
    box-shadow: none;
    transform: none;
    border-color: transparent;
  }

  .drum-label:hover .clear-btn {
    opacity: 1;
  }

  .grid-column {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .beat-numbers-row {
    display: flex;
    gap: 2px;
    height: 22px;
    padding-left: 1px;
  }

  .measure-group {
    display: flex;
    gap: 2px;
  }

  .beat-num {
    width: 126px;
    text-align: center;
    font-size: 0.65rem;
    color: var(--text-muted);
    font-weight: 600;
    line-height: 22px;
    letter-spacing: 0.5px;
    user-select: none;
  }

  .row {
    display: flex;
    gap: 2px;
  }

  .measure {
    display: flex;
    gap: 2px;
    border-radius: 3px;
  }

  .measure-alt {
    background: rgba(255, 255, 255, 0.025);
  }

  .cell {
    width: 30px;
    height: 30px;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    cursor: pointer;
    padding: 0;
    border-radius: 2px;
    transition: background-color 0.1s, box-shadow 0.12s ease-out;
    box-shadow: none;
  }

  .cell:hover {
    border-color: var(--accent-purple);
    background: var(--bg-elevated);
    box-shadow: none;
  }

  .cell:active {
    transform: none;
    box-shadow: 0 0 6px 1px var(--accent-pink-glow);
  }

  .cell.active {
    border-color: var(--accent-pink);
  }

  .cell.active:hover {
    border-color: var(--accent-pink-light);
  }

  .cell.beat-start {
    border-left: 2px solid var(--accent-purple);
  }

  .cell.beat {
    border-left: 1px solid var(--border);
  }

  .step-numbers-row {
    display: flex;
    gap: 2px;
    margin-top: 2px;
    padding-left: 1px;
  }

  .step-num {
    width: 30px;
    text-align: center;
    font-size: 0.6rem;
    color: var(--text-muted);
    user-select: none;
  }

  .step-num.beat-start {
    color: var(--accent-purple-light);
    font-weight: 600;
  }

  .step-num.beat {
    color: var(--text-secondary);
  }

  .drum-label.focused-row .drum-name {
    text-decoration: underline;
  }

  .cell.focused {
    outline: 2px solid var(--cyan);
    outline-offset: -1px;
    z-index: 1;
  }

  .cell.current-step {
    box-shadow: 0 0 8px 2px var(--accent-purple-glow);
    border-color: var(--accent-purple);
  }

  .cell.current-step.active {
    box-shadow: 0 0 10px 3px var(--accent-pink-glow);
  }

  .beat-current {
    color: var(--accent-pink) !important;
    font-weight: 700;
  }

  .step-current {
    color: var(--accent-pink) !important;
    font-weight: 700;
  }

  .focus-hint {
    font-size: 0.75rem;
    color: var(--cyan);
    margin-left: auto;
  }
</style>
