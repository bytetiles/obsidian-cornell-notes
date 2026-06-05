import { Plugin } from 'obsidian';
import { parseCornell } from './parser';
import { renderCornell } from './renderer';
import { CornellSettings, CornellSettingTab, DEFAULT_SETTINGS } from './settings';

export default class CornellNotesPlugin extends Plugin {
  settings!: CornellSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new CornellSettingTab(this.app, this));

    this.registerMarkdownCodeBlockProcessor(
      'cornell',
      async (source, el, ctx) => {
        const block = parseCornell(source);
        await renderCornell(block, el, this.app, ctx.sourcePath, this, this.settings);
      },
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as CornellSettings;
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
