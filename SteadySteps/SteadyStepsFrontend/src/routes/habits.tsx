import { useMemo, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { apiHooks } from "@/client-hooks";
import { api } from "@/client";
import { useToast } from "@/hooks/use-toast";
import { BroadsheetNav } from "@/components/dashboard/BroadsheetNav";
import { HabitFormDialog } from "@/components/dashboard/HabitFormDialog";
import {
    currentStreak,
    logsForHabit,
    type Habit,
} from "@/lib/dashboard-metrics";

export const Route = createFileRoute("/habits")({
    component: HabitsDashboard,
});

const panelStyle: CSSProperties = {
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    padding: "28px 32px",
    boxSizing: "border-box",
};

function HabitsDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const selfQuery = apiHooks.useGetApiAuthSelf(undefined, { retry: false });
    const habitsQuery = apiHooks.useGetApiHabit();
    const goalsQuery = apiHooks.useGetApiGoal();
    const logsQuery = apiHooks.useGetApiHabitLog();

    const [formOpen, setFormOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const habits = useMemo(() => habitsQuery.data ?? [], [habitsQuery.data]);
    const goals = useMemo(() => goalsQuery.data ?? [], [goalsQuery.data]);
    const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

    const streak = useMemo(() => currentStreak(logs), [logs]);

    const isLoading = habitsQuery.isLoading || goalsQuery.isLoading || logsQuery.isLoading;

    const openCreate = () => {
        setEditingHabit(null);
        setFormOpen(true);
    };

    const openEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setFormOpen(true);
    };

    const handleDelete = async (habit: Habit) => {
        if (!window.confirm(`Delete "${habit.name}"? This can't be undone.`)) return;
        setDeletingId(habit.habitId);
        try {
            await api.delete("/api/Habit/:id", undefined, { params: { id: habit.habitId } });
            await queryClient.invalidateQueries();
            toast({ title: "Habit deleted", description: `"${habit.name}" has been removed.` });
        } catch {
            toast({
                title: "Couldn't delete habit",
                description: "Something went wrong removing that habit.",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div style={{ width: "100%", minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                <BroadsheetNav username={selfQuery.data?.username} streakDays={0} />
                <div style={{ padding: 44 }}>Loading your habits…</div>
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
            <BroadsheetNav username={selfQuery.data?.username} streakDays={streak} />

            <div style={{ maxWidth: 1600, margin: "0 auto", padding: "40px 44px 50px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ font: "600 32px/1 'Source Serif 4',serif" }}>Habits</div>
                        <div style={{ font: "italic 400 18px/1.5 'Source Serif 4',serif", color: "var(--color-neutral-700)", marginTop: 10 }}>
                            {habits.length === 0
                                ? "Nothing here yet — add your first habit."
                                : `${habits.length} habit${habits.length === 1 ? "" : "s"} tracked.`}
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={openCreate}>
                        New habit
                    </button>
                </div>

                <div style={{ ...panelStyle, marginTop: 32 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 12px" }}>Habit</th>
                                <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 12px" }}>Frequency</th>
                                <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 12px" }}>Goal</th>
                                <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 12px" }}>Streak</th>
                                <th style={{ textAlign: "right", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 12px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {habits.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ color: "var(--color-neutral-700)", padding: "10px 0" }}>
                                        No habits yet.
                                    </td>
                                </tr>
                            ) : (
                                habits.map((habit, i) => {
                                    const goal = goals.find((g) => g.habitId === habit.habitId);
                                    const habitStreak = currentStreak(logsForHabit(logs, habit.habitId));
                                    const rowBg = i % 2 === 1 ? "var(--color-bg)" : "transparent";
                                    return (
                                        <tr key={habit.habitId} style={{ background: rowBg }}>
                                            <td style={{ padding: "14px 8px 14px 0" }}>
                                                <div style={{ font: "400 18px/1 'Source Serif 4',serif" }}>{habit.name}</div>
                                                {habit.description && (
                                                    <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 4, maxWidth: "32em" }}>
                                                        {habit.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: "14px 8px", color: "var(--color-neutral-700)" }}>{habit.frequency ?? "—"}</td>
                                            <td style={{ padding: "14px 8px", color: "var(--color-neutral-700)" }}>
                                                {goal ? `${goal.currentProgress ?? 0} / ${goal.target ?? 0}` : "—"}
                                            </td>
                                            <td style={{ padding: "14px 8px" }}>
                                                <span className={habitStreak > 0 ? "tag tag-accent" : "tag tag-neutral"}>
                                                    {habitStreak} {habitStreak === 1 ? "day" : "days"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "14px 0 14px 8px", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                    <button type="button" className="btn btn-secondary btn-icon" style={{ width: "auto", padding: "6px 14px" }} onClick={() => openEdit(habit)}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-icon"
                                                        style={{ width: "auto", padding: "6px 14px" }}
                                                        disabled={deletingId === habit.habitId}
                                                        onClick={() => handleDelete(habit)}
                                                    >
                                                        {deletingId === habit.habitId ? "Deleting…" : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <HabitFormDialog open={formOpen} onClose={() => setFormOpen(false)} habit={editingHabit} />
        </div>
    );
}
