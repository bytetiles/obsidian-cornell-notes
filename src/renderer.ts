import { App, Component, MarkdownRenderer } from 'obsidian';
import type { CornellRow } from './parser';

export async function renderCornell(
  rows: CornellRow[],
  container: HTMLElement,
  app: App,
  sourcePath: string,
  component: Component,
): Promise<void> {
  const block = container.createDiv({ cls: 'cornell-block' });

  // Column header row
  const header = block.createDiv({ cls: 'cornell-header' });
  header.createSpan({ text: 'Cues / Questions' });
  header.createSpan({ text: 'Notes' });

  // Data rows
  for (const row of rows) {
    const rowEl = block.createDiv({ cls: 'cornell-row' });

    const cueEl = rowEl.createDiv({ cls: 'cornell-cue' });
    const noteEl = rowEl.createDiv({ cls: 'cornell-note' });

    if (row.cue) {
      await MarkdownRenderer.render(app, row.cue, cueEl, sourcePath, component);
    }
    if (row.note) {
      await MarkdownRenderer.render(app, row.note, noteEl, sourcePath, component);
    }
  }
}
