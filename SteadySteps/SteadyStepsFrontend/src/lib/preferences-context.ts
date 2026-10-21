import { createContext, useContext } from "react";

/**
 * Display preferences. These are presentation-only — they change how the
 * dashboards read, never what's stored on the server — so they live in
 * localStorage rather than behind an API call.
 */
export type Preferences = {
    /** How many days the Insights page looks back over. */
    insightWindow: 28 | 90 | 365;
    /** First column of the consistency grid and first bar of the weekday chart. */
    weekStartsOn: "sunday" | "monday";
    /** Pre-filled into the "Logged value" box when logging a habit. */
    defaultLogStatus: string;
    /** Show each log's note in the Today table underneath its value. */
    showNotesInTable: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
    insightWindow: 90,
    weekStartsOn: "monday",
    defaultLogStatus: "",
    showNotesInTable: false,
};

export const PREFERENCES_STORAGE_KEY = "steadysteps.preferences";

export type PreferencesContextValue = {
    preferences: Preferences;
    setPreferences: (next: Partial<Preferences>) => void;
    resetPreferences: () => void;
};

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (!context) throw new Error("usePreferences must be used inside a PreferencesProvider");
    return context;
}
