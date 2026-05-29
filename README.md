# Cornell Notes for Obsidian

Renders `cornell` fenced code blocks as a two-column
[Cornell Notes](https://en.wikipedia.org/wiki/Cornell_Notes) layout in Reading view.

![Desktop Note Example](.media/desktop-note-example.webp)

---

## Features

- Two-column layout: **Cues / Questions** (28%) left, **Notes** (72%) right
- Supports any Markdown in both columns: paragraphs, lists, tables,
  code blocks, callouts, math, mermaid diagrams, images, wikilinks
- Mobile-responsive: columns stack vertically on narrow screens
- Plain-text storage — readable and editable without the plugin

---

## Installation

### Community plugins (once approved)

Settings > Community plugins > Browse > search **Cornell Notes** > Install > Enable

### Manual install

1. Download `main.js`, `manifest.json`, `styles.css` from the
   [latest release](https://github.com/bytetiles/obsidian-cornell-notes/releases/latest)
2. Copy all three files into `<your-vault>/.obsidian/plugins/cornell-notes/`
3. Settings > Community plugins > enable **Cornell Notes**

### Via BRAT (beta)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. BRAT > Add Beta Plugin > `https://github.com/bytetiles/obsidian-cornell-notes`

---

## Usage

Wrap your Cornell Notes rows in a 4-backtick `cornell` fence.
Use `::cue` to start a row and `::note` to start the note for that row.

````cornell
::cue
What is a window function?
::note
A calculation across related rows **without collapsing** them.

Unlike GROUP BY, all original rows stay visible.

::cue
What does PARTITION BY do?
::note
Splits rows into logical groups inside the window.

| PARTITION BY | GROUP BY       |
|--------------|----------------|
| keeps rows   | collapses rows |
````

### Syntax rules

| Element           | Syntax                                                   |
|-------------------|----------------------------------------------------------|
| Start a new row   | `::cue` on its own line                                  |
| Switch to note    | `::note` on its own line                                 |
| Cue-only row      | `::cue` with no following `::note`                       |
| Code block inside | use ` ```lang ``` ` (safe inside 4-backtick outer fence) |

> **Always use 4 backticks** for the outer fence (` ````cornell `).
> This lets you freely use triple-backtick code blocks inside.

### Rich content examples

**Code block in notes:**


````cornell
::cue
Java import syntax
::note
```java
import org.example.project.Course.*;
```
````

**Callouts, math, diagrams:**

````cornell
::cue
> [!tip] Tip in cue
::note
> [!warning] Warning callout

Inline math: $E = mc^{2}$

$$\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}$$

::cue
Mermaid in note
::note
```mermaid
graph LR
  A --> B --> C
```
````
![rich-content-example.webp](.media/rich-content-example.webp)

### Mobile view

On screens narrower than 700 px the columns stack vertically
(notes first, then cues below).

![mobile-note-example.webp](.media/mobile-note-example.webp)

## Known limitations

| Feature                           | Status                                                            |
|-----------------------------------|-------------------------------------------------------------------|
| `~sub~` / `^sup^` Obsidian syntax | ✗ Not rendered — use `<sub>` / `<sup>` HTML or Unicode (`₂`, `²`) |
| Live Preview two-column layout    | ✗ Reading view only — edit mode shows plain text                  |
