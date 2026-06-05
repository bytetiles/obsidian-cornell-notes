# Release How-To

Releasing creates a tagged GitHub Release with the three required plugin assets
(`main.js`, `manifest.json`, `styles.css`) automatically via GitHub Actions.
No manual uploads needed after the first setup.

---

## One-time setup (do this before the first release)

1. Push the repository to GitHub
2. Confirm GitHub Actions are enabled:
   **Repository → Settings → Actions → General → Allow all actions**
3. No secrets to configure — the workflow uses the built-in `GITHUB_TOKEN`

---

## Regular release process

### 1. Finish and test your changes

Build locally and verify the plugin works in Obsidian before tagging:

```powershell
npm run build
# Copy main.js + styles.css to your test vault and reload Obsidian
```

Manual checklist:
- [ ] Cornell block renders correctly in Reading view
- [ ] Settings page opens: **Settings → Community plugins → Cornell Notes**
- [ ] Header toggle, label inputs, border controls, column width slider all work
- [ ] Per-block directives (`::noheader`, `::header`, `::borders`, `::columns`) override vault defaults
- [ ] Settings persist after reloading Obsidian

### 2. Bump the version

Edit **both** files — they must stay in sync:

| File            | Field       |
|-----------------|-------------|
| `manifest.json` | `"version"` |
| `package.json`  | `"version"` |

Version format: `MAJOR.MINOR.PATCH` (semantic versioning)

| Change type | Example          | When to use                                                                       |
|-------------|------------------|-----------------------------------------------------------------------------------|
| Patch       | `1.0.0 -> 1.0.1` | Bug fixes, no new features                                                        |
| Minor       | `1.0.1 -> 1.1.0` | New features, backwards-compatible; new settings fields with defaults             |
| Major       | `1.1.0 -> 2.0.0` | Breaking changes; renaming/removing settings fields (breaks existing `data.json`) |

> **Settings file:** Obsidian stores plugin settings in `.obsidian/plugins/cornell-notes/data.json`.
> This file is user-specific — never commit or distribute it.
> Adding new fields with defaults is safe (Minor). Renaming or removing fields breaks
> existing user settings and requires a Major bump.

### 3. Commit the version bump

```powershell
git add manifest.json package.json
git commit -m "Release 1.1.0"
```

### 4. Tag and push

The tag **must exactly match** the version in `manifest.json`.
The workflow rejects mismatches before creating the release.

```powershell
git tag 1.1.0
git push
git push --tags
```

### 5. Watch the build

**Repository -> Actions** — a `Release` workflow run appears within seconds.

It will:
- Install dependencies (`npm ci`)
- Build the plugin (`npm run build`)
- Verify `main.js`, `manifest.json`, `styles.css` exist
- Confirm the tag matches the manifest version
- Create a published GitHub Release with those three files attached
  and auto-generated release notes from commit messages

Typical duration: **~60 seconds**.

### 6. Verify the release

**Repository → Releases → latest release**

Confirm the three asset files are attached:
- `main.js`
- `manifest.json`
- `styles.css`

Obsidian will serve these to users on their next plugin update check.

---

## If something goes wrong

**Workflow failed before creating the release** — fix the issue, then:

```powershell
# Delete the local and remote tag, re-tag after fixing
git tag -d 1.1.0
git push origin :refs/tags/1.1.0

# Fix the issue, commit, re-tag
git tag 1.1.0
git push --tags
```

**Release was created, but assets are wrong** — delete the release on GitHub
(Releases → Edit → Delete), delete the tag as above, then re-tag.

**Code didn't pass automatic community review**

> A tag named **1.0.3** was created locally and pushed to the remote Git repository. I now need to remove this tag from both the local and remote repositories, submit additional changes to the `main` branch through a pull request, and then recreate and push the **1.0.3** tag after those changes have been merged.

Remove a tag → push a fix → recreate the tag.

```bash
# Sync repo
git checkout main
git fetch origin --prune --tags
git pull origin main

# Delete tag locally and remotely
git tag -d 1.0.3
git push origin --delete 1.0.3

# Create branch and push changes
git checkout -b fix-or-update-for-1.0.3
git add .
git commit -m "Apply changes for version 1.0.3"
git push origin fix-or-update-for-1.0.3

# Open PR, merge into main, then update local main
git checkout main
git pull origin main

# Re-create and push tag
git tag -a 1.0.3 -m "Release 1.0.3"
git push origin 1.0.3
```

Important note: reusing the same tag name can be risky because other developers, CI systems, package registries, or deployment tools may have already cached the old `1.0.3` tag. If this tag was already used for a public release, creating `1.0.4` is usually safer than moving/recreating `1.0.3`.
