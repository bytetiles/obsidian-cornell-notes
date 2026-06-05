export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'off';

export interface CornellRow {
  cue: string;
  note: string;
}

export interface BlockOverrides {
  showHeader?: boolean;
  cueLabel?: string;
  noteLabel?: string;
  borderStyle?: BorderStyle;
  borderColor?: string;
  accentBorderThickness?: string;
  rowBorderThickness?: string;
}

export interface CornellBlock {
  rows: CornellRow[];
  overrides: BlockOverrides;
}

const BORDER_STYLES = new Set<string>(['solid', 'dashed', 'dotted', 'off']);
const THICKNESS_RE = /^\d+(\.\d+)?(pt|px|em|rem)$/;
const THICKNESS_PAIR_RE = /^(\d+(?:\.\d+)?(?:pt|px|em|rem))\/(\d+(?:\.\d+)?(?:pt|px|em|rem))$/;
const COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;

function parseDirectives(lines: string[]): BlockOverrides {
  const overrides: BlockOverrides = {};

  for (const line of lines) {
    const t = line.trim();

    if (t === '::noheader') {
      overrides.showHeader = false;
      continue;
    }

    if (t.startsWith('::header')) {
      overrides.showHeader = true;
      const rest = t.slice('::header'.length).trim();
      if (rest) {
        const pipeIdx = rest.indexOf('|');
        if (pipeIdx === -1) {
          overrides.cueLabel = rest;
        } else {
          const left = rest.slice(0, pipeIdx).trim();
          const right = rest.slice(pipeIdx + 1).trim();
          if (left) overrides.cueLabel = left;
          if (right) overrides.noteLabel = right;
        }
      }
      continue;
    }

    if (t.startsWith('::borders')) {
      const rest = t.slice('::borders'.length).trim();
      for (const token of rest.split(/\s+/)) {
        if (!token) continue;
        if (BORDER_STYLES.has(token)) {
          overrides.borderStyle = token as BorderStyle;
          if (token === 'off') {
            delete overrides.borderColor;
            delete overrides.accentBorderThickness;
            delete overrides.rowBorderThickness;
          }
        } else if (COLOR_RE.test(token)) {
          overrides.borderColor = token;
        } else {
          const pairMatch = THICKNESS_PAIR_RE.exec(token);
          if (pairMatch) {
            overrides.accentBorderThickness = pairMatch[1];
            overrides.rowBorderThickness = pairMatch[2];
          } else if (THICKNESS_RE.test(token)) {
            overrides.accentBorderThickness = token;
            overrides.rowBorderThickness = token;
          } else {
            console.warn(`[Cornell Notes] Unrecognized ::borders token: "${token}"`);
          }
        }
      }
      continue;
    }
  }

  return overrides;
}

export function parseCornell(source: string): CornellBlock {
  const rows: CornellRow[] = [];
  let cueLines: string[] = [];
  let noteLines: string[] = [];
  let inCue = false;
  let inNote = false;
  const directiveLines: string[] = [];
  let firstCueSeen = false;

  const flush = () => {
    const cue = cueLines.join('\n').trim();
    const note = noteLines.join('\n').trim();
    if (cue || note) rows.push({ cue, note });
    cueLines = [];
    noteLines = [];
  };

  for (const line of source.split('\n')) {
    const t = line.trim();
    if (t === '::cue') {
      if (!firstCueSeen) firstCueSeen = true;
      if (inCue || inNote) flush();
      inCue = true;
      inNote = false;
    } else if (t === '::note' && firstCueSeen) {
      inCue = false;
      inNote = true;
    } else if (inCue) {
      cueLines.push(line);
    } else if (inNote) {
      noteLines.push(line);
    } else if (!firstCueSeen) {
      directiveLines.push(line);
    }
  }
  flush();

  return { rows, overrides: parseDirectives(directiveLines) };
}
