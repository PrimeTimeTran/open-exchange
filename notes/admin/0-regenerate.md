Ah, this is a _very_ real dev pain 😄
You’ve basically got a **generated directory** that you periodically nuke + regenerate, but you still want to **keep your hand-written tweaks** without babysitting them every time.

There are a few solid patterns for this, from “quick & dirty” to “clean and future-proof”. I’ll start with the ones that usually click fastest.

---

## 1. Let git remember your changes (the underrated answer)

If this directory is already committed, git already knows **exactly** what you changed.

### Workflow

1. You generate the directory → commit it
2. You edit / add files inside it
3. Before regenerating:

   ```bash
   git status
   git diff
   ```

4. Regenerate (overwrite the folder)
5. Restore _only_ your custom changes:

   ```bash
   git checkout -- .
   ```

   or more selectively:

   ```bash
   git checkout -- path/to/file
   ```

This works best when:

- You’re modifying existing files
- You’re okay re-applying diffs

⚠️ Downsides:

- New files you added will be deleted unless tracked
- If the generator changes structure heavily, conflicts happen

---

## 2. Keep custom stuff in a separate directory (best long-term)

This is the **clean architecture answer**.

### Example

```
generated/
  api/
  models/
custom/
  hooks.ts
  overrides/
    api.ts
```

Then:

- Generator only owns `generated/`
- Your code _imports_ or _overrides_ from `custom/`

This lets you:

- Delete & regenerate safely
- Avoid git gymnastics
- Make intent crystal clear

If you control the generator config at all, this is gold.

---

## 3. Use git stash _surgically_

If you’re frequently regenerating and want a one-liner:

```bash
git stash push -u -m "my local tweaks"
# regenerate directory
git stash pop
```

Key detail: `-u` includes **untracked files** (new ones you added).

This is probably the **fastest mental model**:

> “Save my work → regenerate → restore my work”

⚠️ Downsides:

- Stash conflicts can be annoying
- Easy to forget what’s in the stash pile

---

## 4. Patch files (surprisingly powerful)

This is great if regeneration is deterministic.

### Before regenerating:

```bash
git diff > my_changes.patch
```

### After regenerating:

```bash
git apply my_changes.patch
```

This is:

- Explicit
- Scriptable
- CI-friendly

You can even automate this:

```bash
./generate.sh
git apply patches/custom.patch
```

---

## 5. rsync backup/restore (non-git, brute force)

If you want **pure filesystem control**:

```bash
rsync -av \
  --include='custom/***' \
  --exclude='*' \
  generated/ backup/
```

Then after regenerating:

```bash
rsync -av backup/ generated/
```

This is useful when:

- You don’t trust the generator
- You want zero git involvement

---

## 6. The “don’t fight the generator” rule of thumb

If you’re doing this a lot, it usually means:

> The generated directory should be treated as **read-only**

The moment you’re repeatedly “saving” changes inside it, you’re paying interest on tech debt.

**Best pattern** in practice:

- Generated code → committed, replaced freely
- Custom code → separate dir or clearly named files
- Overrides via composition, not edits
