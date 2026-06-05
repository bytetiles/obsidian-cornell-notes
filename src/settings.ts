import { App, ColorComponent, PluginSettingTab, Setting } from 'obsidian';
import type CornellNotesPlugin from './main';
import type { BorderStyle } from './parser';

export interface CornellSettings {
  showHeader: boolean;
  cueLabel: string;
  noteLabel: string;
  borderStyle: BorderStyle;
  borderColor: string;
  accentBorderThickness: string;
  rowBorderThickness: string;
}

export const DEFAULT_SETTINGS: CornellSettings = {
  showHeader: true,
  cueLabel: 'Cues / Questions',
  noteLabel: 'Notes',
  borderStyle: 'solid',
  borderColor: '',
  accentBorderThickness: '2pt',
  rowBorderThickness: '1pt',
};

const THICKNESS_RE = /^\d+(\.\d+)?(pt|px|em|rem)$/;

function normalizeThickness(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) return trimmed + 'pt';
  if (THICKNESS_RE.test(trimmed)) return trimmed;
  return null;
}

export class CornellSettingTab extends PluginSettingTab {
  plugin: CornellNotesPlugin;

  constructor(app: App, plugin: CornellNotesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // ── Header section ──────────────────────────────────────────────────────
    containerEl.createEl('h3', { text: 'Header' });

    let cueInputEl!: HTMLInputElement;
    let noteInputEl!: HTMLInputElement;
    let cueSetting!: Setting;
    let noteSetting!: Setting;

    const setHeaderInputsDisabled = (disabled: boolean) => {
      cueInputEl.disabled = disabled;
      noteInputEl.disabled = disabled;
      cueSetting.settingEl.toggleClass('cornell-setting-disabled', disabled);
      noteSetting.settingEl.toggleClass('cornell-setting-disabled', disabled);
    };

    new Setting(containerEl)
      .setName('Show header')
      .setDesc('Display the column label row above the notes.')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.showHeader)
          .onChange(async value => {
            this.plugin.settings.showHeader = value;
            await this.plugin.saveSettings();
            setHeaderInputsDisabled(!value);
          }),
      );

    cueSetting = new Setting(containerEl)
      .setName('Cue column label')
      .addText(text => {
        cueInputEl = text.inputEl;
        text
          .setPlaceholder('Cues / Questions')
          .setValue(this.plugin.settings.cueLabel)
          .onChange(async value => {
            this.plugin.settings.cueLabel = value;
            await this.plugin.saveSettings();
          });
      });

    noteSetting = new Setting(containerEl)
      .setName('Note column label')
      .addText(text => {
        noteInputEl = text.inputEl;
        text
          .setPlaceholder('Notes')
          .setValue(this.plugin.settings.noteLabel)
          .onChange(async value => {
            this.plugin.settings.noteLabel = value;
            await this.plugin.saveSettings();
          });
      });

    setHeaderInputsDisabled(!this.plugin.settings.showHeader);

    // ── Borders section ──────────────────────────────────────────────────────
    containerEl.createEl('h3', { text: 'Borders' });

    let colorPickerComp!: ColorComponent;
    let colorResetBtnEl!: HTMLButtonElement;
    let accentInputEl!: HTMLInputElement;
    let rowInputEl!: HTMLInputElement;
    const borderDepSettings: Setting[] = [];

    const refreshColorPicker = () => {
      const borderOff = this.plugin.settings.borderStyle === 'off';
      const hasCustomColor = !!this.plugin.settings.borderColor;
      colorPickerComp.setDisabled(borderOff || !hasCustomColor);
      colorResetBtnEl.disabled = borderOff;
      colorResetBtnEl.textContent = hasCustomColor ? 'Reset to theme' : 'Use custom color';
    };

    const setBorderControlsDisabled = (disabled: boolean) => {
      accentInputEl.disabled = disabled;
      rowInputEl.disabled = disabled;
      borderDepSettings.forEach(s =>
        s.settingEl.toggleClass('cornell-setting-disabled', disabled),
      );
      refreshColorPicker();
    };

    new Setting(containerEl)
      .setName('Border style')
      .addDropdown(drop =>
        drop
          .addOption('solid', 'Solid')
          .addOption('dashed', 'Dashed')
          .addOption('dotted', 'Dotted')
          .addOption('off', 'Off')
          .setValue(this.plugin.settings.borderStyle)
          .onChange(async (value: string) => {
            this.plugin.settings.borderStyle = value as BorderStyle;
            await this.plugin.saveSettings();
            setBorderControlsDisabled(value === 'off');
          }),
      );

    const colorSetting = new Setting(containerEl)
      .setName('Border color')
      .setDesc('Leave unset to follow the current theme color.')
      .addColorPicker(picker => {
        colorPickerComp = picker;
        picker
          .setValue(this.plugin.settings.borderColor || '#888888')
          .onChange(async value => {
            this.plugin.settings.borderColor = value;
            await this.plugin.saveSettings();
          });
      })
      .addButton(btn => {
        colorResetBtnEl = btn.buttonEl;
        btn.onClick(async () => {
          if (this.plugin.settings.borderColor) {
            this.plugin.settings.borderColor = '';
            await this.plugin.saveSettings();
            refreshColorPicker();
          } else {
            this.plugin.settings.borderColor = colorPickerComp.getValue() || '#888888';
            await this.plugin.saveSettings();
            refreshColorPicker();
          }
        });
      });
    borderDepSettings.push(colorSetting);

    const accentSetting = new Setting(containerEl)
      .setName('Accent border thickness')
      .setDesc('Header bottom border and vertical divider (e.g. 2pt, 1.5px, 0.1em).')
      .addText(text => {
        accentInputEl = text.inputEl;
        text
          .setValue(this.plugin.settings.accentBorderThickness)
          .onChange(async value => {
            const normalized = normalizeThickness(value);
            if (normalized) {
              this.plugin.settings.accentBorderThickness = normalized;
              await this.plugin.saveSettings();
            }
          });
        text.inputEl.addEventListener('blur', () => {
          text.inputEl.value = this.plugin.settings.accentBorderThickness;
        });
      });
    borderDepSettings.push(accentSetting);

    const rowThickSetting = new Setting(containerEl)
      .setName('Row border thickness')
      .setDesc('Row separator borders (e.g. 1pt, 0.75px, 0.05em).')
      .addText(text => {
        rowInputEl = text.inputEl;
        text
          .setValue(this.plugin.settings.rowBorderThickness)
          .onChange(async value => {
            const normalized = normalizeThickness(value);
            if (normalized) {
              this.plugin.settings.rowBorderThickness = normalized;
              await this.plugin.saveSettings();
            }
          });
        text.inputEl.addEventListener('blur', () => {
          text.inputEl.value = this.plugin.settings.rowBorderThickness;
        });
      });
    borderDepSettings.push(rowThickSetting);

    setBorderControlsDisabled(this.plugin.settings.borderStyle === 'off');
  }
}
