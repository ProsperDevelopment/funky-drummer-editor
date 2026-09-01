<script lang="ts">
  import type { DrumPattern } from '$lib/types';
  import { createEmptyPattern, validatePattern } from '$lib/types';
  import { samplePatterns } from '$lib/samplePatterns';
  import PatternGrid from '$lib/components/PatternGrid.svelte';
  import PatternControls from '$lib/components/PatternControls.svelte';
  import ImportExport from '$lib/components/ImportExport.svelte';
  import PatternList from '$lib/components/PatternList.svelte';
  import GrooveEditor from '$lib/components/GrooveEditor.svelte';
  import PlaybackControls from '$lib/components/PlaybackControls.svelte';

  let patterns = $state<DrumPattern[]>([...samplePatterns]);
  let selectedId = $state<string>(samplePatterns[0].id);
  let showGroove = $state(false);
  let currentStep = $state(-1);

  let selectedPattern = $derived(patterns.find((p) => p.id === selectedId) ?? patterns[0]);

  function updatePattern(updated: DrumPattern) {
    patterns = patterns.map((p) => (p.id === updated.id ? updated : p));
  }

  function selectPattern(id: string) {
    selectedId = id;
  }

  function newPattern() {
    const p = createEmptyPattern();
    patterns = [...patterns, p];
    selectedId = p.id;
  }

  function duplicatePattern(id: string) {
    const original = patterns.find((p) => p.id === id);
    if (!original) return;
    const copy: DrumPattern = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (copy)`,
      grid: Object.fromEntries(Object.entries(original.grid).map(([k, v]) => [k, [...v]])),
      groove: [...original.groove],
    };
    patterns = [...patterns, copy];
    selectedId = copy.id;
  }

  function deletePattern(id: string) {
    if (patterns.length <= 1) return;
    patterns = patterns.filter((p) => p.id !== id);
    if (selectedId === id) {
      selectedId = patterns[0].id;
    }
  }

  function deleteSelectedPattern() {
    if (patterns.length <= 1) return;
    if (confirm(`Delete pattern "${selectedPattern.name}"?`)) {
      deletePattern(selectedId);
    }
  }

  function exportCurrentPattern() {
    if (!selectedPattern) return;
    const json = JSON.stringify(selectedPattern, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPattern.id || 'pattern'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile() {
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
              const validated = validatePattern(item);
              patterns = [...patterns, validated];
            }
          } else {
            const validated = validatePattern(data);
            patterns = [...patterns, validated];
            selectedId = validated.id;
          }
        } catch {
          alert('Failed to parse JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const tag = target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key === 'n') {
      e.preventDefault();
      newPattern();
    } else if (mod && e.key === 'd') {
      e.preventDefault();
      duplicatePattern(selectedId);
    } else if (mod && e.key === 's') {
      e.preventDefault();
      exportCurrentPattern();
    } else if (mod && e.key === 'o') {
      e.preventDefault();
      handleImportFile();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSelectedPattern();
    } else if (e.key === 'Escape') {
      showGroove = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  <title>Funky Drummer Pattern Editor</title>
</svelte:head>

<div class="app">
  <header class="app-header">
    <h1 class="app-title">Funky Drummer Pattern Editor</h1>
    <span class="app-subtitle">Create and edit drum patterns</span>
  </header>

  <div class="app-layout">
    <aside class="app-sidebar">
      <PatternList
        {patterns}
        {selectedId}
        onselect={selectPattern}
        ondelete={deletePattern}
        onnew={newPattern}
        onduplicate={duplicatePattern}
      />
    </aside>

    <main class="app-main">
      {#if selectedPattern}
        <section class="section">
          <h2>Pattern Settings</h2>
          <PatternControls pattern={selectedPattern} onupdate={updatePattern} />
        </section>

        <section class="section">
          <h2>Playback</h2>
          <PlaybackControls
            pattern={selectedPattern}
            onstep={(step) => (currentStep = step)}
          />
        </section>

        <section class="section">
          <h2>Grid Editor</h2>
          <PatternGrid pattern={selectedPattern} onupdate={updatePattern} {currentStep} />
        </section>

        <section class="section">
          <div class="groove-header">
            <button class="toggle-btn" onclick={() => (showGroove = !showGroove)}>
              {showGroove ? 'Hide' : 'Show'} Groove Editor
            </button>
          </div>
          {#if showGroove}
            <GrooveEditor pattern={selectedPattern} onupdate={updatePattern} />
          {/if}
        </section>

        <section class="section">
          <h2>Import / Export</h2>
          <ImportExport
            pattern={selectedPattern}
            {patterns}
            onload={(p) => {
              patterns = [...patterns, p];
              selectedId = p.id;
            }}
            onappend={(p) => {
              patterns = [...patterns, p];
            }}
          />
        </section>
      {/if}
    </main>
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--background);
  }

  .app-header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 12px 16px;
    background: var(--card);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .app-title {
    margin: 0;
    font-size: clamp(0.55rem, 1.4vw, 0.85rem);
    font-weight: 700;
    font-family: var(--font-retro);
    color: var(--accent-pink);
    letter-spacing: -0.5px;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .app-subtitle {
    font-size: clamp(0.65rem, 1.2vw, 0.85rem);
    color: var(--text-muted);
    white-space: nowrap;
  }

  .app-layout {
    display: flex;
    flex: 1;
    gap: 16px;
    padding: 16px;
    overflow: hidden;
    min-height: 0;
  }

  .app-sidebar {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    min-height: 0;
    position: relative;
    overflow-y: auto;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .groove-header {
    display: flex;
  }

  @media (max-width: 768px) {
    .app-header {
      padding: 10px 12px;
      gap: 8px;
    }

    .app-subtitle {
      display: none;
    }

    .app-layout {
      flex-direction: column;
      padding: 12px;
      gap: 12px;
    }

    .app-sidebar {
      width: 100%;
      max-height: 200px;
      overflow-y: auto;
      flex-shrink: 1;
    }
  }
</style>
