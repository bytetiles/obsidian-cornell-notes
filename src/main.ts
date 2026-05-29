import { Plugin } from 'obsidian';
import { parseCornell } from './parser';
import { renderCornell } from './renderer';

export default class CornellNotesPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor(
      'cornell',
      async (source, el, ctx) => {
        const rows = parseCornell(source);
        await renderCornell(rows, el, this.app, ctx.sourcePath, this);
      },
    );
  }
}
