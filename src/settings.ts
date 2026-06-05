import { App, ColorComponent, PluginSettingTab, Setting, SliderComponent } from 'obsidian';
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
  cueWidth: number;
}

export const DEFAULT_SETTINGS: CornellSettings = {
  showHeader: true,
  cueLabel: 'Cues / Questions',
  noteLabel: 'Notes',
  borderStyle: 'solid',
  borderColor: '',
  accentBorderThickness: '2pt',
  rowBorderThickness: '1pt',
  cueWidth: 28,
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

    // ── Layout section ──────────────────────────────────────────────────────
    new Setting(containerEl).setName('Layout').setHeading();

    let cueWidthSliderComp!: SliderComponent;
    let cueWidthInputEl!: HTMLInputElement;
    let widthSetting!: Setting;

    const updateWidth = async (value: number) => {
      const clamped = Math.max(10, Math.min(90, value));
      this.plugin.settings.cueWidth = clamped;
      await this.plugin.saveSettings();
      cueWidthSliderComp.setValue(clamped);
      cueWidthInputEl.value = String(clamped);
      widthSetting.setDesc(`Cue ${clamped}% · Notes ${100 - clamped}%`);
    };

    widthSetting = new Setting(containerEl)
      .setName('Cue column width')
      .setDesc(
        `Cue ${this.plugin.settings.cueWidth}% · Notes ${100 - this.plugin.settings.cueWidth}%`,
      )
      .addSlider(slider => {
        cueWidthSliderComp = slider;
        slider
          .setLimits(10, 90, 1)
          .setValue(this.plugin.settings.cueWidth)
          .onChange(async value => {
            await updateWidth(value);
          });
      })
      .addText(text => {
        cueWidthInputEl = text.inputEl;
        text
          .setValue(String(this.plugin.settings.cueWidth))
          .setPlaceholder('28');
        text.inputEl.setCssStyles({ width: '5rem' });
        cueWidthInputEl.addEventListener('change', () => {
          const raw = cueWidthInputEl.value.replace('%', '').trim();
          const parsed = parseFloat(raw);
          if (isNaN(parsed)) {
            cueWidthInputEl.value = String(this.plugin.settings.cueWidth);
            return;
          }
          void updateWidth(parsed);
        });
        cueWidthInputEl.addEventListener('blur', () => {
          cueWidthInputEl.value = String(this.plugin.settings.cueWidth);
        });
      });

    // ── Header section ──────────────────────────────────────────────────────
    new Setting(containerEl).setName('Header').setHeading();

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
    new Setting(containerEl).setName('Borders').setHeading();

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
