import { useMemo, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { apiHooks } from "@/client-hooks";
import { BroadsheetNav } from "@/components/dashboard/BroadsheetNav";
import { AdjustGoalDialog } from "@/components/dashboard/AdjustGoalDialog";
import {
    currentStreak,
    habitsLoggedByDay,
    logsForHabit,
    type Habit,
} from "@/lib/dashboard-metrics";

export const Route = createFileRoute("/progress")({
    component: ProgressDashboard,
});

const panelStyle: CSSProperties = {
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    padding: "28px 32px",
    boxSizing: "border-box",
};

function habitName(habits: Habit[], habitId: string | null) {
    return habits.find((h) => h.habitId === habitId)?.name ?? "—";
}

function daysUntil(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
    const target = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function ProgressDashboard() {
    const selfQuery = apiHooks.useGetApiAuthSelf(undefined, { retry: false });
    const habitsQuery = apiHooks.useGetApiHabit();
    const goalsQuery = apiHooks.useGetApiGoal();
    const logsQuery = apiHooks.useGetApiHabitLog();

    const [goalOpen, setGoalOpen] = useState(false);

    const habits = useMemo(() => habitsQuery.data ?? [], [habitsQuery.data]);
    const goals = useMemo(() => goalsQuery.data ?? [], [goalsQuery.data]);
    const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

    const streak = useMemo(() => currentStreak(logs), [logs]);
    const isLoading = habitsQuery.isLoading || goalsQuery.isLoading || logsQuery.isLoading;

    if (isLoading) {
        return (
            <div style={{ width: "100%", minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                <BroadsheetNav username={selfQuery.data?.username} streakDays={0} />
                <div style={{ padding: 44 }}>Loading your progress…</div>
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
                        <div style={{ font: "600 32px/1 'Source Serif 4',serif" }}>Progress</div>
                        <div style={{ font: "italic 400 18px/1.5 'Source Serif 4',serif", color: "var(--color-neutral-700)", marginTop: 10 }}>
                            {goals.length === 0
                                ? "No goals set yet — add one to start tracking progress."
                                : `${goals.length} goal${goals.length === 1 ? "" : "s"} in progress.`}
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => setGoalOpen(true)}>
                        Adjust goals
                    </button>
                </div>

                {goals.length === 0 ? (
                    <div style={{ ...panelStyle, marginTop: 32, color: "var(--color-neutral-700)" }}>
                        Once you set a goal for a habit, its progress toward the target will show up here.
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 24, marginTop: 32 }}>
                        {goals.map((goal) => {
                            const target = goal.target ?? 0;
                            const progress = goal.currentProgress ?? 0;
                            const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
                            const remaining = daysUntil(goal.endDate);
                            const habitLogs = goal.habitId ? logsForHabit(logs, goal.habitId) : [];
                            const trend = habitsLoggedByDay(habitLogs, 28);
                            const maxCount = Math.max(1, ...trend.map((d) => d.count));

                            return (
                                <div key={goal.goalId} style={panelStyle}>
                                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                                        <div style={{ font: "600 22px/1 'Source Serif 4',serif" }}>{habitName(habits, goal.habitId)}</div>
                                        <span className={pct >= 100 ? "tag tag-accent" : "tag tag-outline"}>{pct}%</span>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 18 }}>
                                        <div style={{ font: "600 40px/1 'Source Serif 4',serif", letterSpacing: "-.02em" }}>{progress}</div>
                                        <div style={{ fontSize: 16, color: "var(--color-neutral-700)" }}>of {target} target</div>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 3, background: "var(--color-neutral-300)", marginTop: 12, overflow: "hidden" }}>
                                        <div style={{ width: `${pct}%`, height: 6, background: "var(--color-accent)" }} />
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 8 }}>
                                        {remaining === null
                                            ? "No end date set"
                                            : remaining >= 0
                                                ? `${remaining} day${remaining === 1 ? "" : "s"} remaining`
                                                : `Ended ${Math.abs(remaining)} day${Math.abs(remaining) === 1 ? "" : "s"} ago`}
                                    </div>

                                    <div style={{ marginTop: 22 }}>
                                        <div style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 10 }}>
                                            Logged, last 28 days
                                        </div>
                                        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
                                            {trend.map((day) => (
                                                <div
                                                    key={day.date}
                                                    title={`${day.date}: ${day.count}`}
                                                    style={{
                                                        flex: 1,
                                                        borderRadius: "2px 2px 0 0",
                                                        height: Math.max((day.count / maxCount) * 48, day.count > 0 ? 4 : 0),
                                                        background: day.count > 0 ? "var(--color-accent-400)" : "var(--color-neutral-300)",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AdjustGoalDialog open={goalOpen} onClose={() => setGoalOpen(false)} habits={habits} goals={goals} />
        </div>
    );
}
