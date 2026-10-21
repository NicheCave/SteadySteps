import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { apiHooks } from "@/client-hooks";
import { api } from "@/client";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-errors";
import { BroadsheetNav } from "@/components/dashboard/BroadsheetNav";
import { SettingsSection, SettingsFact } from "@/components/dashboard/SettingsSection";
import { DEFAULT_PREFERENCES, usePreferences } from "@/lib/preferences-context";
import { currentStreak, dateKey } from "@/lib/dashboard-metrics";

export const Route = createFileRoute("/settings")({
    component: SettingsPage,
});

const INSIGHT_WINDOWS = [28, 90, 365] as const;

function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function SettingsPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { preferences, setPreferences, resetPreferences } = usePreferences();

    const selfQuery = apiHooks.useGetApiAuthSelf(undefined, { retry: false });
    const habitsQuery = apiHooks.useGetApiHabit();
    const goalsQuery = apiHooks.useGetApiGoal();
    const logsQuery = apiHooks.useGetApiHabitLog();

    const user = selfQuery.data;
    const habits = habitsQuery.data ?? [];
    const goals = goalsQuery.data ?? [];
    const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

    const streak = useMemo(() => currentStreak(logs), [logs]);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const [exporting, setExporting] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Seed the profile form once the account loads, and re-seed after a save so the
    // fields always show what the server actually holds.
    useEffect(() => {
        setUsername(user?.username ?? "");
        setEmail(user?.email ?? "");
    }, [user?.username, user?.email]);

    const profileDirty =
        user != null && (username !== (user.username ?? "") || email !== (user.email ?? ""));

    const handleProfileSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSavingProfile(true);
        try {
            await api.put("/api/User/Profile", { username, email });
            await queryClient.invalidateQueries();
            toast({ title: "Profile saved", description: "Your account details have been updated." });
        } catch (error) {
            // The server applies the name and the address in turn, so a rejected
            // change can leave one of the two already saved — refetch so the form
            // shows what actually stuck.
            await queryClient.invalidateQueries();
            toast({
                title: "Couldn't save your profile",
                description: apiErrorMessage(error, "Something went wrong updating your details."),
                variant: "destructive",
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "The new password and its confirmation are different.",
                variant: "destructive",
            });
            return;
        }

        setSavingPassword(true);
        try {
            await api.put("/api/User/Password", { currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast({ title: "Password changed", description: "Use your new password next time you sign in." });
        } catch (error) {
            toast({
                title: "Couldn't change your password",
                description: apiErrorMessage(error, "Something went wrong changing your password."),
                variant: "destructive",
            });
        } finally {
            setSavingPassword(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const data = await api.get("/api/User/Export");
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `steadysteps-${user?.username ?? "export"}-${dateKey(new Date())}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            toast({ title: "Export ready", description: "Your data has been downloaded as JSON." });
        } catch (error) {
            toast({
                title: "Couldn't export your data",
                description: apiErrorMessage(error, "Something went wrong preparing the download."),
                variant: "destructive",
            });
        } finally {
            setExporting(false);
        }
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await api.post("/api/Auth/Logout", undefined);
            await queryClient.invalidateQueries();
            await navigate({ to: "/login" });
        } catch (error) {
            toast({
                title: "Couldn't sign out",
                description: apiErrorMessage(error, "Something went wrong signing you out."),
                variant: "destructive",
            });
        } finally {
            setSigningOut(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete("/api/User/Account", undefined);
            await queryClient.invalidateQueries();
            setDeleteOpen(false);
            await navigate({ to: "/login" });
        } catch (error) {
            toast({
                title: "Couldn't delete your account",
                description: apiErrorMessage(error, "Something went wrong closing your account."),
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
        }
    };

    const isLoading = selfQuery.isLoading || habitsQuery.isLoading || goalsQuery.isLoading || logsQuery.isLoading;

    if (isLoading) {
        return (
            <div style={{ width: "100%", minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                <BroadsheetNav username={user?.username} streakDays={0} />
                <div style={{ padding: 44 }}>Loading your settings…</div>
            </div>
        );
    }

    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
            }}
        >
            <BroadsheetNav username={user?.username} streakDays={streak} />

            <div style={{ maxWidth: 1600, margin: "0 auto", padding: "40px 44px 50px", boxSizing: "border-box" }}>
                <div style={{ font: "600 32px/1 'Source Serif 4',serif" }}>Settings</div>
                <div style={{ font: "italic 400 18px/1.5 'Source Serif 4',serif", color: "var(--color-neutral-700)", marginTop: 10 }}>
                    Your account, how the dashboards read, and what happens to your data.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 32 }}>
                    <SettingsSection
                        title="Account"
                        blurb="A summary of what SteadySteps holds for you."
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 28 }}>
                            <SettingsFact label="Signed in as" value={user?.username ?? "—"} />
                            <SettingsFact label="Member since" value={formatDate(user?.registerDate)} />
                            <SettingsFact label="Last sign-in" value={formatDate(user?.lastLogin)} />
                            <SettingsFact label="Habits" value={habits.length} />
                            <SettingsFact label="Goals" value={goals.length} />
                            <SettingsFact label="Logged entries" value={logs.length} />
                        </div>
                    </SettingsSection>

                    <SettingsSection
                        title="Profile"
                        blurb="The name shown across the masthead, and the address you sign in with."
                    >
                        <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: 15, maxWidth: 460 }}>
                            <div className="field">
                                <label htmlFor="settings-username">Display name</label>
                                <input
                                    id="settings-username"
                                    className="input"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    minLength={2}
                                    maxLength={64}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="settings-email">Email address</label>
                                <input
                                    id="settings-email"
                                    className="input"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <button type="submit" className="btn btn-primary" disabled={savingProfile || !profileDirty}>
                                    {savingProfile ? "Saving…" : "Save profile"}
                                </button>
                                {profileDirty && !savingProfile && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setUsername(user?.username ?? "");
                                            setEmail(user?.email ?? "");
                                        }}
                                    >
                                        Discard
                                    </button>
                                )}
                            </div>
                        </form>
                    </SettingsSection>

                    <SettingsSection
                        title="Password"
                        blurb="At least eight characters. You'll stay signed in on this device."
                    >
                        <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 15, maxWidth: 460 }}>
                            <div className="field">
                                <label htmlFor="settings-current-password">Current password</label>
                                <input
                                    id="settings-current-password"
                                    className="input"
                                    type="password"
                                    autoComplete="current-password"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                    minLength={8}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="settings-new-password">New password</label>
                                <input
                                    id="settings-new-password"
                                    className="input"
                                    type="password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    minLength={8}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="settings-confirm-password">Confirm new password</label>
                                <input
                                    id="settings-confirm-password"
                                    className="input"
                                    type="password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    minLength={8}
                                    required
                                />
                                {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                                    <div style={{ fontSize: 13, color: "var(--color-accent-2-700)", marginTop: 6 }}>
                                        These two don't match yet.
                                    </div>
                                )}
                            </div>
                            <div>
                                <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                                    {savingPassword ? "Changing…" : "Change password"}
                                </button>
                            </div>
                        </form>
                    </SettingsSection>

                    <SettingsSection
                        title="Display"
                        blurb="How the dashboards are drawn. Kept on this device, never on the server."
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
                            <div className="field">
                                <label htmlFor="settings-window">Insights look back over</label>
                                <div className="seg" id="settings-window">
                                    {INSIGHT_WINDOWS.map((days) => (
                                        <label key={days} className="seg-opt">
                                            <input
                                                type="radio"
                                                name="insight-window"
                                                checked={preferences.insightWindow === days}
                                                onChange={() => setPreferences({ insightWindow: days })}
                                            />
                                            {days} days
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="field">
                                <label htmlFor="settings-week-start">Week starts on</label>
                                <div className="seg" id="settings-week-start">
                                    {(["monday", "sunday"] as const).map((day) => (
                                        <label key={day} className="seg-opt">
                                            <input
                                                type="radio"
                                                name="week-start"
                                                checked={preferences.weekStartsOn === day}
                                                onChange={() => setPreferences({ weekStartsOn: day })}
                                            />
                                            {day === "monday" ? "Monday" : "Sunday"}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="field">
                                <label htmlFor="settings-default-status">Default logged value</label>
                                <input
                                    id="settings-default-status"
                                    className="input"
                                    value={preferences.defaultLogStatus}
                                    onChange={(event) => setPreferences({ defaultLogStatus: event.target.value })}
                                    placeholder="e.g. Done"
                                    maxLength={50}
                                    style={{ maxWidth: 320 }}
                                />
                                <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 6 }}>
                                    Pre-filled into the “Log a habit” box so a quick tick takes one keystroke.
                                </div>
                            </div>

                            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 15 }}>
                                <input
                                    type="checkbox"
                                    checked={preferences.showNotesInTable}
                                    onChange={(event) => setPreferences({ showNotesInTable: event.target.checked })}
                                    style={{ accentColor: "var(--color-accent)", marginTop: 3 }}
                                />
                                <span>
                                    Show notes in today&apos;s log
                                    <span style={{ display: "block", fontSize: 13, color: "var(--color-neutral-700)", marginTop: 3 }}>
                                        Prints the note underneath each logged value on the Today page.
                                    </span>
                                </span>
                            </label>

                            <div>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        resetPreferences();
                                        toast({ title: "Display reset", description: "Back to the defaults." });
                                    }}
                                    disabled={
                                        preferences.insightWindow === DEFAULT_PREFERENCES.insightWindow &&
                                        preferences.weekStartsOn === DEFAULT_PREFERENCES.weekStartsOn &&
                                        preferences.defaultLogStatus === DEFAULT_PREFERENCES.defaultLogStatus &&
                                        preferences.showNotesInTable === DEFAULT_PREFERENCES.showNotesInTable
                                    }
                                >
                                    Reset to defaults
                                </button>
                            </div>
                        </div>
                    </SettingsSection>

                    <SettingsSection
                        title="Your data"
                        blurb="Everything SteadySteps stores about you, in one file."
                    >
                        <p style={{ fontSize: 15, color: "var(--color-neutral-700)", maxWidth: "40em" }}>
                            The export is a single JSON document holding your account details,{" "}
                            {habits.length} {habits.length === 1 ? "habit" : "habits"}, {goals.length}{" "}
                            {goals.length === 1 ? "goal" : "goals"} and {logs.length}{" "}
                            {logs.length === 1 ? "logged entry" : "logged entries"}.
                        </p>
                        <button type="button" className="btn btn-primary" onClick={handleExport} disabled={exporting}>
                            {exporting ? "Preparing…" : "Export my data"}
                        </button>
                    </SettingsSection>

                    <SettingsSection
                        title="Session"
                        blurb="Sign out of SteadySteps on this device."
                    >
                        <button type="button" className="btn btn-secondary" onClick={handleSignOut} disabled={signingOut}>
                            {signingOut ? "Signing out…" : "Sign out"}
                        </button>
                    </SettingsSection>

                    <section
                        style={{
                            background: "var(--color-surface)",
                            borderRadius: "var(--radius-lg)",
                            boxShadow: "var(--shadow-sm)",
                            padding: "28px 32px",
                            boxSizing: "border-box",
                            borderLeft: "3px solid var(--color-accent-2)",
                            display: "grid",
                            gridTemplateColumns: "minmax(220px, 1fr) 2fr",
                            gap: 40,
                            alignItems: "start",
                        }}
                    >
                        <div>
                            <h2 style={{ font: "600 22px/1.2 'Source Serif 4',serif", margin: 0, color: "var(--color-accent-2-700)" }}>
                                Close account
                            </h2>
                            <p style={{ font: "italic 400 16px/1.5 'Source Serif 4',serif", color: "var(--color-neutral-700)", margin: "10px 0 0" }}>
                                Your habits, goals and history stop being visible anywhere in the app.
                            </p>
                        </div>
                        <div>
                            <p style={{ fontSize: 15, color: "var(--color-neutral-700)", maxWidth: "40em" }}>
                                Export your data first if you want to keep it — you won&apos;t be able to sign in
                                afterwards.
                            </p>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2-700)" }}
                                onClick={() => {
                                    setDeleteConfirmation("");
                                    setDeleteOpen(true);
                                }}
                            >
                                Close my account
                            </button>
                        </div>
                    </section>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 36, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
                    <span>SteadySteps</span>
                    <span>Settings</span>
                </div>
            </div>

            {deleteOpen && (
                <div className="dialog-backdrop" onClick={() => !deleting && setDeleteOpen(false)}>
                    <div className="dialog" onClick={(event) => event.stopPropagation()}>
                        <div className="dialog-title">Close your account?</div>
                        <div className="dialog-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                            <p style={{ margin: 0 }}>
                                This signs you out and hides every habit, goal and log on the account. Type{" "}
                                <strong>{user?.username}</strong> below to confirm.
                            </p>
                            <div className="field">
                                <label htmlFor="delete-confirmation">Username</label>
                                <input
                                    id="delete-confirmation"
                                    className="input"
                                    value={deleteConfirmation}
                                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="dialog-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ background: "var(--color-accent-2)" }}
                                    disabled={deleting || deleteConfirmation !== user?.username}
                                    onClick={handleDelete}
                                >
                                    {deleting ? "Closing…" : "Close account"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
