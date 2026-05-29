export interface CornellRow {
  cue: string;
  note: string;
}

export function parseCornell(source: string): CornellRow[] {
  const rows: CornellRow[] = [];
  let cueLines: string[] = [];
  let noteLines: string[] = [];
  let inCue = false;
  let inNote = false;

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
      if (inCue || inNote) flush();
      inCue = true;
      inNote = false;
    } else if (t === '::note') {
      inCue = false;
      inNote = true;
    } else if (inCue) {
      cueLines.push(line);
    } else if (inNote) {
      noteLines.push(line);
    }
  }
  flush();
  return rows;
}
