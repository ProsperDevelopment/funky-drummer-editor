<script lang="ts">
  import type { DrumPattern } from '$lib/types';

  let { pattern, onupdate }: { pattern: DrumPattern; onupdate: (p: DrumPattern) => void } = $props();

  function updateField(field: keyof DrumPattern, value: string | number) {
    onupdate({ ...pattern, [field]: value });
  }
</script>

<div class="pattern-controls">
  <div class="field">
    <label for="name">Name</label>
    <input
      id="name"
      type="text"
      value={pattern.name}
      oninput={(e) => updateField('name', e.currentTarget.value)}
    />
  </div>

  <div class="field">
    <label for="style">Style</label>
    <input
      id="style"
      type="text"
      value={pattern.style}
      oninput={(e) => updateField('style', e.currentTarget.value)}
    />
  </div>

  <div class="field">
    <label for="bpm">BPM</label>
    <input
      id="bpm"
      type="number"
      min="30"
      max="300"
      value={pattern.bpm}
      oninput={(e) => updateField('bpm', parseInt(e.currentTarget.value) || 120)}
    />
  </div>

  <div class="field">
    <label for="measures">Measures</label>
    <input
      id="measures"
      type="number"
      min="1"
      max="8"
      value={pattern.measures}
      oninput={(e) => {
        const newMeasures = parseInt(e.currentTarget.value) || 2;
        if (newMeasures !== pattern.measures) {
          const newGrid: Record<string, number[]> = {};
          for (const [drumId, row] of Object.entries(pattern.grid)) {
            const newRow = new Array(newMeasures * 16).fill(0);
            for (let i = 0; i < Math.min(row.length, newRow.length); i++) {
              newRow[i] = row[i];
            }
            newGrid[drumId] = newRow;
          }
          onupdate({ ...pattern, measures: newMeasures, grid: newGrid });
        }
      }}
    />
  </div>

  <div class="field">
    <label for="desc">Description</label>
    <input
      id="desc"
      type="text"
      value={pattern.desc}
      oninput={(e) => updateField('desc', e.currentTarget.value)}
    />
  </div>

  <div class="field">
    <label for="id">ID</label>
    <input
      id="id"
      type="text"
      value={pattern.id}
      oninput={(e) => updateField('id', e.currentTarget.value)}
    />
  </div>
</div>

<style>
  .pattern-controls {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  label {
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
    font-family: var(--font-retro);
  }

  input {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 0.5rem 0.625rem;
    font-size: 0.8125rem;
    border-radius: 4px;
    transition: border-color 0.15s, background-color 0.15s;
  }

  input:hover {
    border-color: var(--accent-purple);
  }

  input:focus {
    outline: none;
    border-color: var(--accent-pink);
    background: var(--bg-elevated);
    box-shadow: 0 0 0 1px var(--accent-pink-glow);
  }

  input[type='number'] {
    width: 80px;
    appearance: textfield;
    -moz-appearance: textfield;
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
