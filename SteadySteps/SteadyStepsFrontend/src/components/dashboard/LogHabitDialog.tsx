import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiHooks } from "@/client-hooks";
import { useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/lib/preferences-context";
import type { Habit } from "@/lib/dashboard-metrics";
import { dateKey } from "@/lib/dashboard-metrics";

export function LogHabitDialog({
    open,
    onClose,
    habits,
}: {
    open: boolean;
    onClose: () => void;
    habits: Habit[];
}) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { preferences } = usePreferences();
    const createHabit = apiHooks.usePostApiHabit();
    const createLog = apiHooks.usePostApiHabitLog();

    const [mode, setMode] = useState<"existing" | "new">(habits.length > 0 ? "existing" : "new");
    const [habitId, setHabitId] = useState(habits[0]?.habitId ?? "");
    const [newHabitName, setNewHabitName] = useState("");
    const [status, setStatus] = useState(preferences.defaultLogStatus);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    if (!open) return null;

    const reset = () => {
        setMode(habits.length > 0 ? "existing" : "new");
        setHabitId(habits[0]?.habitId ?? "");
        setNewHabitName("");
        setStatus(preferences.defaultLogStatus);
        setNotes("");
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let targetHabitId = habitId;
            if (mode === "new") {
                const habit = await createHabit.mutateAsync({ name: newHabitName });
                targetHabitId = habit.habitId;
            }

            await createLog.mutateAsync({
                habitId: targetHabitId,
                logDate: dateKey(new Date()),
                status: status || undefined,
                notes: notes || undefined,
            });

            await queryClient.invalidateQueries();
            toast({ title: "Habit logged", description: "Today's log has been updated." });
            handleClose();
        } catch {
            toast({
                title: "Couldn't log habit",
                description: "Something went wrong saving that entry.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dialog-backdrop" onClick={handleClose}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-title">Log a habit</div>
                <form onSubmit={handleSubmit} className="dialog-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {habits.length > 0 && (
                        <div style={{ display: "flex", gap: "var(--space-3)", fontSize: 13 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                                <input type="radio" checked={mode === "existing"} onChange={() => setMode("existing")} />
                                Existing habit
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                                <input type="radio" checked={mode === "new"} onChange={() => setMode("new")} />
                                New habit
                            </label>
                        </div>
                    )}

                    {mode === "existing" ? (
                        <div className="field">
                            <label htmlFor="log-habit">Habit</label>
                            <select
                                id="log-habit"
                                className="input"
                                value={habitId}
                                onChange={(e) => setHabitId(e.target.value)}
                                required
                            >
                                {habits.map((h) => (
                                    <option key={h.habitId} value={h.habitId}>
                                        {h.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="field">
                            <label htmlFor="new-habit-name">New habit name</label>
                            <input
                                id="new-habit-name"
                                className="input"
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                                placeholder="e.g. Movement"
                                required
                            />
                        </div>
                    )}

                    <div className="field">
                        <label htmlFor="log-status">Logged value</label>
                        <input
                            id="log-status"
                            className="input"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            placeholder="e.g. 8,240 steps"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="log-notes">Notes</label>
                        <textarea
                            id="log-notes"
                            className="input"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="dialog-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
