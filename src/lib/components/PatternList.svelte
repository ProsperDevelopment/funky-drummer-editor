<script lang="ts">
  import type { DrumPattern } from '$lib/types';

  let {
    patterns,
    selectedId,
    onselect,
    ondelete,
    onnew,
    onduplicate,
  }: {
    patterns: DrumPattern[];
    selectedId: string;
    onselect: (id: string) => void;
    ondelete: (id: string) => void;
    onnew: () => void;
    onduplicate: (id: string) => void;
  } = $props();

  let searchQuery = $state('');

  const styleColorMap: Record<string, string> = {
    'Funk': '#e84a70',
    'Rock': '#50c8e0',
    'Hip Hop': '#f0c040',
    'Electronic': '#9060e0',
    'Jazz': '#60d088',
    'Custom': '#a08898',
  };

  let filteredPatterns = $derived(
    patterns.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.style.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  let groupedPatterns = $derived(
    filteredPatterns.reduce(
      (acc, p) => {
        const style = p.style || 'Other';
        if (!acc[style]) acc[style] = [];
        acc[style].push(p);
        return acc;
      },
      {} as Record<string, DrumPattern[]>
    )
  );
</script>

<div class="pattern-list">
  <div class="list-header">
    <input
      type="text"
      placeholder="Search patterns..."
      bind:value={searchQuery}
      class="search-input"
    />
    <button class="new-btn" onclick={onnew}>+ New</button>
  </div>

  <div class="list-body">
    {#each Object.entries(groupedPatterns) as [style, stylePatterns]}
      <div class="style-group">
        <div class="style-header">{style}</div>
        {#each stylePatterns as p (p.id)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="pattern-item"
            class:selected={p.id === selectedId}
            role="button"
            tabindex="0"
            onclick={() => onselect(p.id)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onselect(p.id);
              }
            }}
          >
            <span class="style-dot" style="background-color: {styleColorMap[p.style] || 'var(--text-muted)'}"></span>
            <span class="pattern-name">{p.name}</span>
            <span class="pattern-bpm">{p.bpm}</span>
            <div class="pattern-actions">
              <button
                class="action-btn"
                onclick={(e) => {
                  e.stopPropagation();
                  onduplicate(p.id);
                }}
                title="Duplicate"
              >⧉</button>
              <button
                class="action-btn delete"
                onclick={(e) => {
                  e.stopPropagation();
                  ondelete(p.id);
                }}
                title="Delete"
              >×</button>
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .pattern-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .list-header {
    display: flex;
    gap: 0.5rem;
    padding: 0.625rem 0.625rem;
    border-bottom: 1px solid var(--border);
  }

  .search-input {
    flex: 1;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 0.4375rem 0.625rem;
    font-size: 0.8125rem;
    border-radius: 4px;
    transition: border-color 0.15s;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent-pink);
    box-shadow: 0 0 0 1px var(--accent-pink-glow);
  }

  .new-btn {
    background: var(--bg-elevated);
    border: 3px solid var(--accent-purple);
    color: var(--accent-purple-light);
    padding: 0.4375rem 0.75rem;
    font-size: 0.8125rem;
    border-radius: 2px;
    cursor: pointer;
    white-space: nowrap;
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.25),
      inset 2px 2px 0 rgba(255, 255, 255, 0.08),
      3px 3px 0 var(--accent-purple);
  }

  .new-btn:hover {
    background: var(--bg-hover);
    border-color: var(--accent-pink);
    color: var(--accent-pink-light);
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.25),
      inset 2px 2px 0 rgba(255, 255, 255, 0.08),
      3px 3px 0 var(--accent-pink),
      0 0 8px var(--accent-pink-glow);
  }

  .new-btn:active {
    box-shadow:
      inset 2px 2px 0 rgba(0, 0, 0, 0.3),
      inset -2px -2px 0 rgba(255, 255, 255, 0.05);
    transform: translate(2px, 2px);
  }

  .list-body {
    flex: 1;
    overflow-y: auto;
    padding: 0.375rem;
  }

  .style-group {
    margin-bottom: 0.625rem;
  }

  .style-header {
    font-size: 0.625rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.375rem 0.5rem 0.25rem;
    font-weight: 600;
    font-family: var(--font-retro);
  }

  .pattern-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 0.4375rem 0.5rem;
    font-size: 0.8125rem;
    cursor: pointer;
    border-radius: 4px;
    text-align: left;
    transition: background-color 0.12s;
  }

  .pattern-item:hover {
    background: var(--bg-hover);
  }

  .pattern-item.selected {
    background: var(--secondary);
    color: var(--text-primary);
    border-left: 3px solid var(--accent-pink);
    padding-left: calc(0.5rem - 3px);
  }

  .style-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .pattern-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pattern-bpm {
    font-size: 0.6875rem;
    color: var(--text-muted);
    margin-right: 0.25rem;
    font-variant-numeric: tabular-nums;
  }

  .pattern-actions {
    display: flex;
    gap: 0.125rem;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .pattern-item:hover .pattern-actions {
    opacity: 1;
  }

  .action-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.1875rem 0.3125rem;
    font-size: 0.8125rem;
    border-radius: 3px;
    transition: background-color 0.12s, color 0.12s;
    box-shadow: none;
  }

  .action-btn:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
    box-shadow: none;
    transform: none;
    border-color: transparent;
  }

  .action-btn.delete:hover {
    background: rgba(232, 80, 80, 0.2);
    color: var(--danger);
    box-shadow: none;
    transform: none;
    border-color: transparent;
  }
</style>
