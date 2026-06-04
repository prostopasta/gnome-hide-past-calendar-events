import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class HidePastCalendarEventsExtension extends Extension {
    _originalReloadEvents = null;
    _sourceAddedId = null;
    _sweepTimerId = null;
    _settings = null;

    // ── Panel calendar: hide ended events ────────────────────────────────────

    enable() {
        this._settings = this.getSettings();

        const eventsItem = Main.panel.statusArea.dateMenu?._eventsItem;
        if (!eventsItem?._reloadEvents) {
            console.warn(`[${this.uuid}] _eventsItem._reloadEvents not found — panel calendar patch skipped`);
            return;
        }
        this._originalReloadEvents = eventsItem._reloadEvents;

        eventsItem._reloadEvents = function () {
            if (this._eventSource.isLoading || this._reloading) return;
            this._reloading = true;

            [...this._eventsList].forEach(c => c.destroy());

            const now = new Date();
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);

            const events = this._eventSource.getEvents(this._startDate, this._endDate);

            for (const event of events) {
                // Hide events that started today and have already ended
                const startedToday = event.date >= todayStart;
                if (startedToday && event.end < now) continue;

                const box = new St.BoxLayout({ style_class: 'event-box', vertical: true });
                box.add_child(new St.Label({
                    text: event.summary,
                    style_class: 'event-summary',
                }));
                box.add_child(new St.Label({
                    text: this._formatEventTime(event),
                    style_class: 'event-time',
                }));
                this._eventsList.add_child(box);
            }

            if (this._eventsList.get_n_children() === 0) {
                this._eventsList.add_child(new St.Label({
                    text: _('No Events'),
                    style_class: 'event-placeholder',
                }));
            }

            this._reloading = false;
            this._sync();
        };

        eventsItem._reloadEvents();

        // ── Notification tray: auto-dismiss stale alarm popups ────────────────

        this._sweepStaleAlarms();

        this._sourceAddedId = Main.messageTray.connect('source-added', (_tray, source) => {
            source.connect('notification-added', (_src, notification) => {
                this._maybeDismiss(notification);
            });
        });

        this._sweepTimerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
            this._sweepStaleAlarms();
            return GLib.SOURCE_CONTINUE;
        });
    }

    disable() {
        if (this._sweepTimerId) {
            GLib.source_remove(this._sweepTimerId);
            this._sweepTimerId = null;
        }
        if (this._sourceAddedId) {
            Main.messageTray.disconnect(this._sourceAddedId);
            this._sourceAddedId = null;
        }
        if (this._originalReloadEvents) {
            const eventsItem = Main.panel.statusArea.dateMenu._eventsItem;
            eventsItem._reloadEvents = this._originalReloadEvents;
            this._originalReloadEvents = null;
            eventsItem._reloadEvents();
        }
        this._settings = null;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    _isAlarmSource(source) {
        const id = (source.app?.id ?? source.sourceId ?? '').toLowerCase();
        const title = (source.title ?? '').toLowerCase();
        return id.includes('alarm') || id.includes('evolution') ||
               title.includes('alarm') || title.includes('reminder');
    }

    _sweepStaleAlarms() {
        for (const source of Main.messageTray.getSources()) {
            if (!this._isAlarmSource(source)) continue;
            // Snapshot — destroy() mutates source.notifications in place
            for (const notification of [...source.notifications]) {
                this._maybeDismiss(notification);
            }
        }
    }

    // Dismiss a notification if its event end time + configured delay has passed.
    // Parses time from the notification body (e.g. "09:00 – 10:00") — last HH:MM = end time.
    _maybeDismiss(notification) {
        if (!this._isAlarmSource(notification.source)) return;

        const body = notification.body ?? '';
        const now = new Date();

        // Match "HH:MM" patterns — pick the last one (end time)
        const times = [...body.matchAll(/\b(\d{1,2}):(\d{2})\b/g)];
        if (times.length === 0) return;

        const last = times[times.length - 1];
        const dismissAt = new Date(now);
        dismissAt.setHours(parseInt(last[1]), parseInt(last[2]), 0, 0);

        // Add the configured grace period
        const delayMs = (this._settings?.get_int('dismiss-delay-minutes') ?? 0) * 60_000;
        dismissAt.setTime(dismissAt.getTime() + delayMs);

        if (dismissAt < now) {
            notification.destroy();
        }
    }
}
