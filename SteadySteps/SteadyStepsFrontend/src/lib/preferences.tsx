import { useCallback, useEffect, useMemo, useState } from "react";
import {
    DEFAULT_PREFERENCES,
    PREFERENCES_STORAGE_KEY,
    PreferencesContext,
    type Preferences,
} from "@/lib/preferences-context";

function readStored(): Preferences {
    try {
        const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (!raw) return DEFAULT_PREFERENCES;
        // Merge over the defaults so a preference added in a later release
        // doesn't come back undefined for someone with an older stored blob.
        return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    const [preferences, setStored] = useState<Preferences>(readStored);

    useEffect(() => {
        try {
            window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
        } catch {
            // A full or blocked storage quota shouldn't take the page down —
            // the preferences simply won't survive a reload.
        }
    }, [preferences]);

    const setPreferences = useCallback((next: Partial<Preferences>) => {
        setStored((current) => ({ ...current, ...next }));
    }, []);

    const resetPreferences = useCallback(() => setStored(DEFAULT_PREFERENCES), []);

    const value = useMemo(
        () => ({ preferences, setPreferences, resetPreferences }),
        [preferences, setPreferences, resetPreferences],
    );

    return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
