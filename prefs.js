import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class HidePastCalendarEventsPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'preferences-system-time-symbolic',
        });

        const group = new Adw.PreferencesGroup({
            title: _('Alarm Notifications'),
            description: _('Controls when stale alarm popups are automatically dismissed.'),
        });

        const row = new Adw.SpinRow({
            title: _('Dismiss delay'),
            subtitle: _('Minutes after an event ends before its alarm notification disappears. 0 = dismiss immediately.'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 60,
                step_increment: 1,
                page_increment: 5,
            }),
        });

        settings.bind(
            'dismiss-delay-minutes',
            row,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );

        group.add(row);
        page.add(group);
        window.add(page);
    }
}
