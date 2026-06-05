# Hide Past Calendar Events

A minimal GNOME Shell extension that keeps your panel calendar clean:

1. **Hides ended events** from the panel clock popup — only upcoming and ongoing events are shown.
2. **Auto-dismisses stale alarm popups** — alarm notifications for events that have already ended are closed automatically.

## The problem

By default GNOME Shell shows **all** of today's events in the panel calendar, including ones that ended hours ago. On a busy day this becomes noise that buries upcoming events. Missed alarm popups pile up too.

## What this does

**Panel calendar popup:**
```
Before                          After
──────────────────              ──────────────────
✓ 09:00 Daily standup           16:30 Team sync
✓ 11:00 Design review           18:00 1:1 with manager
✓ 14:00 Sprint planning         No Events (if it's after 18:00)
  16:30 Team sync
  18:00 1:1 with manager
```

Events that **started today and have already ended** are hidden. Everything else — upcoming, ongoing, multi-day events, and events from other days you navigate to — shows normally.

**Alarm notifications:**
Stale alarm popups (notifications for events whose end time has passed) are dismissed automatically. A background sweep runs every 60 seconds. A configurable grace period lets you keep the notification visible for a few extra minutes after the event ends.

## Requirements

- GNOME Shell 45 or 46

## Installation

```bash
git clone https://github.com/prostopasta/gnome-hide-past-calendar-events
cd gnome-hide-past-calendar-events
bash install.sh
```

Then reload GNOME Shell:
- **X11**: `Alt+F2` → type `r` → `Enter`
- **Wayland**: log out and back in

## Manual installation

Copy `extension.js` and `metadata.json` to:
```
~/.local/share/gnome-shell/extensions/hide-past-calendar-events@prostopasta.github.com/
```

Enable:
```bash
gnome-extensions enable hide-past-calendar-events@prostopasta.github.com
```

## Configuration

Open **GNOME Extensions** app → find "Hide Past Calendar Events" → click **⚙**, or run:

```bash
gnome-extensions prefs hide-past-calendar-events@prostopasta.github.com
```

| Setting | Default | Description |
|---|---|---|
| **Panel calendar** | 15 min | Minutes after an event ends before it is removed from the clock popup. |
| **Alarm notifications** | 0 min | Minutes after an event ends before its alarm popup is dismissed. |

Both values accept 0–120 minutes. Set to `0` to hide/dismiss immediately.

## How it works

**Panel calendar:** monkey-patches `_eventsItem._reloadEvents` in GNOME Shell's date menu — the same hook used by [Dim Completed Calendar Events](https://github.com/marcinjahn/gnome-dim-completed-calendar-events-extension). Restores the original on `disable()`.

**Alarm auto-dismiss:** connects to `Main.messageTray`'s `source-added` signal to intercept incoming alarm notifications. Also runs a 60-second sweep for notifications that arrived before the extension loaded. Parses the end time from the notification body, adds the configured delay, and dismisses the notification once that threshold has passed.

No external dependencies, ~90 lines of code.

## After a GNOME Shell update

If the extension stops working after a GNOME update, add the new shell version to `shell-version` in `metadata.json` and reload the shell.

## License

MIT
