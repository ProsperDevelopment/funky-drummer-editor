<script lang="ts">
  import type { DrumPattern } from '$lib/types';
  import { validatePattern } from '$lib/types';
  import { exportMidi } from '$lib/midiExport';

  let {
    pattern,
    patterns,
    onload,
    onappend,
  }: {
    pattern: DrumPattern;
    patterns: DrumPattern[];
    onload: (p: DrumPattern) => void;
    onappend: (p: DrumPattern) => void;
  } = $props();

  let fileInput: HTMLInputElement;
  let exportFormat = $state<'full' | 'grid-only'>('full');
  let copySuccess = $state(false);

  function exportPattern() {
    let data: unknown;
    if (exportFormat === 'grid-only') {
      data = {
        id: pattern.id,
        name: pattern.name,
        style: pattern.style,
        desc: pattern.desc,
        groove: pattern.groove,
        bpm: pattern.bpm,
        measures: pattern.measures,
        grid: pattern.grid,
      };
    } else {
      data = pattern;
    }
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pattern.id || 'pattern'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportAllPatterns() {
    const json = JSON.stringify(patterns, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drum-patterns.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) {
            for (const item of data) {
              onappend(validatePattern(item));
            }
          } else {
            onload(validatePattern(data));
          }
        } catch {
          alert('Failed to parse JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  async function copyToClipboard() {
    const json = JSON.stringify(pattern, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      copySuccess = true;
      setTimeout(() => (copySuccess = false), 1500);
    } catch {
      fallbackCopy(json);
    }
  }

  function fallbackCopy(text: string) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    copySuccess = true;
    setTimeout(() => (copySuccess = false), 1500);
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      handlePasteText(text);
    } catch {
      fallbackPaste();
    }
  }

  function fallbackPaste() {
    const ta = document.createElement('textarea');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    document.execCommand('paste');
    const text = ta.value;
    document.body.removeChild(ta);
    if (text) {
      handlePasteText(text);
    } else {
      alert('Paste not supported in this browser. Use Ctrl+V instead.');
    }
  }

  function handlePasteText(text: string) {
    try {
      const data = JSON.parse(text);
      onload(validatePattern(data));
    } catch {
      alert('Clipboard does not contain valid JSON');
    }
  }
</script>

<div class="import-export">
  <div class="section">
    <h3>Import</h3>
    <button class="btn" onclick={handleFileImport}>Import JSON File</button>
    <button onclick={pasteFromClipboard}>Paste from Clipboard</button>
  </div>

  <div class="section">
    <h3>Export</h3>
    <div class="export-options">
      <label>
        <input type="radio" bind:group={exportFormat} value="full" />
        Full Pattern
      </label>
      <label>
        <input type="radio" bind:group={exportFormat} value="grid-only" />
        Grid Only
      </label>
    </div>
    <button onclick={exportPattern}>Export Current</button>
    <button onclick={exportAllPatterns}>Export All ({patterns.length})</button>
    <button onclick={copyToClipboard}>{copySuccess ? 'Copied!' : 'Copy to Clipboard'}</button>
    <button onclick={() => exportMidi(pattern)}>Export MIDI</button>
  </div>
</div>

<style>
  .import-export {
    display: flex;
    gap: 2.5rem;
    flex-wrap: wrap;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .export-options {
    display: flex;
    gap: 1rem;
    font-size: 0.8125rem;
  }

  .export-options label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    cursor: pointer;
    color: var(--text-secondary);
    transition: color 0.12s;
  }

  .export-options label:hover {
    color: var(--text-primary);
  }

  .export-options input[type='radio'] {
    accent-color: var(--accent-pink);
  }

  .btn {
    display: inline-block;
    background: var(--bg-elevated);
    border: 3px solid var(--border);
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    border-radius: 2px;
    cursor: pointer;
    text-align: center;
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.25),
      inset 2px 2px 0 rgba(255, 255, 255, 0.08),
      3px 3px 0 var(--border);
  }

  .btn:hover {
    background: var(--bg-hover);
    border-color: var(--accent-purple);
    color: var(--text-primary);
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.25),
      inset 2px 2px 0 rgba(255, 255, 255, 0.08),
      3px 3px 0 var(--accent-purple),
      0 0 8px var(--accent-purple-glow);
  }

  .btn:active {
    box-shadow:
      inset 2px 2px 0 rgba(0, 0, 0, 0.3),
      inset -2px -2px 0 rgba(255, 255, 255, 0.05);
    transform: translate(2px, 2px);
  }
</style>
