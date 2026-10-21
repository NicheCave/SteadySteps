import { useMemo, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { apiHooks } from "@/client-hooks";
import { BroadsheetNav } from "@/components/dashboard/BroadsheetNav";
import { LogHabitDialog } from "@/components/dashboard/LogHabitDialog";
import { AdjustGoalDialog } from "@/components/dashboard/AdjustGoalDialog";
import { usePreferences } from "@/lib/preferences-context";
import {
    currentStreak,
    longestStreak,
    habitsLoggedByDay,
    habitsLoggedToday,
    todaysLogForHabit,
    leadingBlanks,
    weekdayOrder,
    WEEKDAY_LABELS,
    type Habit,
} from "@/lib/dashboard-metrics";

export const Route = createFileRoute("/")({
    component: TodayDashboard,
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

function heatColor(fraction: number) {
    if (fraction <= 0) return "var(--color-neutral-200)";
    if (fraction < 0.25) return "var(--color-accent-200)";
    if (fraction < 0.5) return "var(--color-accent-400)";
    if (fraction < 0.75) return "var(--color-accent-600)";
    return "var(--color-accent-800)";
}

function TodayDashboard() {
    const { preferences } = usePreferences();
    const selfQuery = apiHooks.useGetApiAuthSelf(undefined, { retry: false });
    const habitsQuery = apiHooks.useGetApiHabit();
    const goalsQuery = apiHooks.useGetApiGoal();
    const logsQuery = apiHooks.useGetApiHabitLog();

    const [logOpen, setLogOpen] = useState(false);
    const [goalOpen, setGoalOpen] = useState(false);

    // Memoised so the "no data yet" fallback is a stable reference and the
    // metrics below don't recompute on every render.
    const habits = useMemo(() => habitsQuery.data ?? [], [habitsQuery.data]);
    const goals = useMemo(() => goalsQuery.data ?? [], [goalsQuery.data]);
    const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

    const loggedToday = useMemo(() => habitsLoggedToday(logs), [logs]);
    const dayCompletePct = habits.length > 0 ? Math.round((loggedToday / habits.length) * 100) : 0;
    const streak = useMemo(() => currentStreak(logs), [logs]);
    const longest28 = useMemo(() => longestStreak(logs, 28), [logs]);
    const last7 = useMemo(() => habitsLoggedByDay(logs, 7), [logs]);
    const last28 = useMemo(() => habitsLoggedByDay(logs, 28), [logs]);
    const statGoals = goals.slice(0, 4);

    const isLoading = habitsQuery.isLoading || goalsQuery.isLoading || logsQuery.isLoading;

    if (isLoading) {
        return (
            <div style={{ width: "100%", minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                <BroadsheetNav username={selfQuery.data?.username} streakDays={0} />
                <div style={{ padding: 44 }}>Loading your dashboard…</div>
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

                {/* Hero + day complete */}
                <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 60, alignItems: "start" }}>
                    <div>
                        <div style={{ font: "600 44px/1.1 'Source Serif 4',serif", letterSpacing: "-.02em", maxWidth: "14em" }}>
                            {habits.length === 0
                                ? "Log your first habit to get started."
                                : `${loggedToday} of ${habits.length} habits logged today.`}
                        </div>
                        <div style={{ font: "italic 400 19px/1.5 'Source Serif 4',serif", color: "var(--color-neutral-700)", marginTop: 12, maxWidth: "34em" }}>
                            {habits.length - loggedToday > 0
                                ? `${habits.length - loggedToday} habit${habits.length - loggedToday === 1 ? "" : "s"} still open today.`
                                : habits.length > 0
                                    ? "Everything's logged for today."
                                    : "Use “Log a habit” below to add one."}
                        </div>
                    </div>
                    <div style={{ paddingTop: 6 }}>
                        <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>
                            Day complete
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 5 }}>
                            <div style={{ font: "600 68px/1 'Source Serif 4',serif", letterSpacing: "-.03em" }}>{dayCompletePct}</div>
                            <div style={{ fontSize: 24, color: "var(--color-neutral-700)" }}>%</div>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "var(--color-neutral-300)", marginTop: 15, overflow: "hidden" }}>
                            <div style={{ width: `${dayCompletePct}%`, height: 6, background: "var(--color-accent)" }} />
                        </div>
                        <div style={{ fontSize: 15, color: "var(--color-neutral-700)", marginTop: 10 }}>
                            {loggedToday} of {habits.length} habits met
                        </div>
                    </div>
                </div>

                {/* Stat band */}
                <div style={{ ...panelStyle, marginTop: 40, display: "grid", gridTemplateColumns: `repeat(${Math.max(statGoals.length, 1)}, 1fr)`, gap: 32 }}>
                    {statGoals.length === 0 ? (
                        <div style={{ color: "var(--color-neutral-700)" }}>
                            No goals yet — use "Adjust goals" below to set one.
                        </div>
                    ) : (
                        statGoals.map((goal) => {
                            const target = goal.target ?? 0;
                            const progress = goal.currentProgress ?? 0;
                            const diff = progress - target;
                            return (
                                <div key={goal.goalId}>
                                    <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>
                                        {habitName(habits, goal.habitId)}
                                    </div>
                                    <div style={{ font: "600 48px/1 'Source Serif 4',serif", letterSpacing: "-.02em", marginTop: 8 }}>
                                        {progress}
                                    </div>
                                    <div style={{ fontSize: 15, color: "var(--color-neutral-700)", marginTop: 6 }}>
                                        goal {target} · {diff >= 0 ? `+${diff} over` : `${Math.abs(diff)} short`}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Chart + weekly goals */}
                <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 24, marginTop: 24, alignItems: "start" }}>
                    <div style={panelStyle}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                            <div style={{ font: "600 22px/1 'Source Serif 4',serif" }}>Habits logged, last seven days</div>
                            <div style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-neutral-700)" }}>
                                goal {habits.length} per day
                            </div>
                        </div>
                        <div style={{ position: "relative", height: 210, marginTop: 26 }}>
                            <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, display: "flex", alignItems: "flex-end", gap: 20, height: 186 }}>
                                {last7.map((day) => {
                                    const pct = habits.length > 0 ? day.count / habits.length : 0;
                                    return (
                                        <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                            <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{day.count}</div>
                                            <div
                                                style={{
                                                    width: "100%",
                                                    borderRadius: "3px 3px 0 0",
                                                    height: Math.max(pct * 150, day.count > 0 ? 6 : 0),
                                                    background: pct >= 1 ? "var(--color-accent)" : "var(--color-accent-300)",
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, height: 1, background: "var(--color-neutral-300)" }} />
                            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", gap: 20, fontSize: 13, color: "var(--color-neutral-700)" }}>
                                {last7.map((day) => (
                                    <span key={day.date} style={{ flex: 1, textAlign: "center" }}>
                                        {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={panelStyle}>
                        <div style={{ font: "600 22px/1 'Source Serif 4',serif" }}>This week&apos;s goals</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 22 }}>
                            {goals.length === 0 ? (
                                <div style={{ color: "var(--color-neutral-700)", fontSize: 15 }}>No goals set yet.</div>
                            ) : (
                                goals.map((goal) => {
                                    const target = goal.target ?? 0;
                                    const progress = goal.currentProgress ?? 0;
                                    const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
                                    return (
                                        <div key={goal.goalId}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 16 }}>
                                                <span>{habitName(habits, goal.habitId)}</span>
                                                <span style={{ color: "var(--color-neutral-700)" }}>{progress} / {target}</span>
                                            </div>
                                            <div style={{ height: 4, borderRadius: 2, background: "var(--color-neutral-300)", marginTop: 8, overflow: "hidden" }}>
                                                <div style={{ width: `${pct}%`, height: 4, background: "var(--color-accent)" }} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Today's log + consistency */}
                <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 24, marginTop: 24, alignItems: "start" }}>
                    <div style={panelStyle}>
                        <div style={{ font: "600 22px/1 'Source Serif 4',serif" }}>Today&apos;s log</div>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18, fontSize: 15 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 10px" }}>Habit</th>
                                    <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 10px" }}>Logged</th>
                                    <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 10px" }}>Goal</th>
                                    <th style={{ textAlign: "right", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 10px" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {habits.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ color: "var(--color-neutral-700)", padding: "10px 0" }}>
                                            No habits yet.
                                        </td>
                                    </tr>
                                ) : (
                                    habits.map((habit, i) => {
                                        const log = todaysLogForHabit(logs, habit.habitId);
                                        const goal = goals.find((g) => g.habitId === habit.habitId);
                                        const rowBg = i % 2 === 1 ? "var(--color-bg)" : "transparent";
                                        return (
                                            <tr key={habit.habitId} style={{ background: rowBg }}>
                                                <td style={{ font: "400 18px/1 'Source Serif 4',serif", padding: "12px 8px 12px 0" }}>{habit.name}</td>
                                                <td style={{ padding: "12px 8px", color: log ? "var(--color-text)" : "var(--color-neutral-700)" }}>
                                                    {log ? log.status || log.notes || "Logged" : "—"}
                                                    {preferences.showNotesInTable && log?.notes && log.status && (
                                                        <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 3, maxWidth: "30em" }}>
                                                            {log.notes}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: "12px 8px", color: "var(--color-neutral-700)" }}>{goal?.target ?? "—"}</td>
                                                <td style={{ padding: "12px 0 12px 8px", textAlign: "right" }}>
                                                    <span className={log ? "tag tag-accent" : "tag tag-outline"}>
                                                        {log ? "Logged" : "Open"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                        <div style={{ display: "flex", gap: 15, marginTop: 22 }}>
                            <button type="button" className="btn btn-primary" onClick={() => setLogOpen(true)}>
                                Log a habit
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setGoalOpen(true)}>
                                Adjust goals
                            </button>
                        </div>
                    </div>

                    <div style={panelStyle}>
                        <div style={{ font: "600 22px/1 'Source Serif 4',serif" }}>Consistency, 28 days</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 22, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--color-neutral-700)" }}>
                            {weekdayOrder(preferences.weekStartsOn).map((index) => (
                                <span key={index} style={{ textAlign: "center" }}>{WEEKDAY_LABELS[index][0]}</span>
                            ))}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 8 }}>
                            {Array.from({ length: leadingBlanks(last28[0].date, preferences.weekStartsOn) }, (_, i) => (
                                <div key={`blank-${i}`} aria-hidden />
                            ))}
                            {last28.map((day) => {
                                const fraction = habits.length > 0 ? day.count / habits.length : 0;
                                const isToday = day.date === last28[last28.length - 1].date;
                                return (
                                    <div
                                        key={day.date}
                                        title={`${day.date}: ${day.count}/${habits.length}`}
                                        style={{
                                            aspectRatio: "1",
                                            borderRadius: 3,
                                            background: heatColor(fraction),
                                            outline: isToday ? "1px solid var(--color-text)" : "none",
                                            outlineOffset: -1,
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <div style={{ fontSize: 14, color: "var(--color-neutral-700)", marginTop: 14 }}>
                            Longest run in the last 28 days: {longest28} {longest28 === 1 ? "day" : "days"}.
                        </div>
                        <div style={{ font: "italic 400 20px/1.45 'Source Serif 4',serif", marginTop: 28, paddingLeft: 16, borderLeft: "2px solid var(--color-accent-2)" }}>
                            {streak > 0
                                ? `You're on a ${streak}-day streak — keep it going.`
                                : "Log a habit today to start a new streak."}
                        </div>
                        <div style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginTop: 10, paddingLeft: 16 }}>
                            Current streak
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 36, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
                    <span>SteadySteps</span>
                    <span>Updated {new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
            </div>

            <LogHabitDialog open={logOpen} onClose={() => setLogOpen(false)} habits={habits} />
            <AdjustGoalDialog open={goalOpen} onClose={() => setGoalOpen(false)} habits={habits} goals={goals} />
        </div>
    );
}
