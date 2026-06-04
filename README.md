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
Stale alarm popups (notifications for events whose end time has passed) are dismissed automatically. A background sweep runs every 60 seconds.

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

## How it works

**Panel calendar:** monkey-patches `_eventsItem._reloadEvents` in GNOME Shell's date menu — the same hook used by [Dim Completed Calendar Events](https://github.com/marcinjahn/gnome-dim-completed-calendar-events-extension). Restores the original on `disable()`.

**Alarm auto-dismiss:** connects to `Main.messageTray`'s `source-added` signal to intercept incoming alarm notifications. Also runs a 60-second sweep for notifications that arrived before the extension loaded. Parses the end time from the notification body and dismisses it if the event has already passed.

No settings, no dependencies, ~80 lines of code.

## After a GNOME Shell update

If the extension stops working after a GNOME update, add the new shell version to `shell-version` in `metadata.json` and reload the shell.

## License

MIT
