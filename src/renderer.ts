import { App, Component, MarkdownRenderer } from 'obsidian';
import type { CornellBlock } from './parser';
import type { CornellSettings } from './settings';

export async function renderCornell(
  block: CornellBlock,
  container: HTMLElement,
  app: App,
  sourcePath: string,
  component: Component,
  settings: CornellSettings,
): Promise<void> {
  const effective = { ...settings, ...block.overrides };

  const blockEl = container.createDiv({ cls: 'cornell-block' });

  if (effective.borderStyle === 'off') {
    blockEl.classList.add('cornell-no-borders');
  } else {
    blockEl.style.setProperty('--cornell-border-style', effective.borderStyle);
    if (effective.borderColor) {
      blockEl.style.setProperty('--cornell-border-color', effective.borderColor);
    }
    blockEl.style.setProperty(
      '--cornell-accent-border-thickness',
      effective.accentBorderThickness,
    );
    blockEl.style.setProperty(
      '--cornell-row-border-thickness',
      effective.rowBorderThickness,
    );
  }

  if (effective.showHeader) {
    const header = blockEl.createDiv({ cls: 'cornell-header' });
    header.createSpan({ text: effective.cueLabel });
    header.createSpan({ text: effective.noteLabel });
  }

  for (const row of block.rows) {
    const rowEl = blockEl.createDiv({ cls: 'cornell-row' });
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
