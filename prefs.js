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
            title: _('Hide Delay'),
            description: _('How long after an event ends before it disappears. 0 = immediately.'),
        });

        const calendarRow = new Adw.SpinRow({
            title: _('Panel calendar'),
            subtitle: _('Minutes after an event ends before it is removed from the clock popup.'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 120,
                step_increment: 5,
                page_increment: 15,
            }),
        });

        const dismissRow = new Adw.SpinRow({
            title: _('Alarm notifications'),
            subtitle: _('Minutes after an event ends before its alarm popup is dismissed.'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 120,
                step_increment: 5,
                page_increment: 15,
            }),
        });

        settings.bind('calendar-hide-delay-minutes', calendarRow, 'value',
            Gio.SettingsBindFlags.DEFAULT);
        settings.bind('dismiss-delay-minutes', dismissRow, 'value',
            Gio.SettingsBindFlags.DEFAULT);

        group.add(calendarRow);
        group.add(dismissRow);
        page.add(group);
        window.add(page);
    }
}
