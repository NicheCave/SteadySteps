import { useMemo, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { apiHooks } from "@/client-hooks";
import { BroadsheetNav } from "@/components/dashboard/BroadsheetNav";
import { usePreferences } from "@/lib/preferences-context";
import {
    currentStreak,
    longestStreak,
    habitsLoggedByDay,
    consistencyPct,
    logsByWeekday,
    logsForHabit,
    weekdayOrder,
    leadingBlanks,
    WEEKDAY_LABELS,
    type Habit,
    type HabitLog,
} from "@/lib/dashboard-metrics";

export const Route = createFileRoute("/insights")({
    component: InsightsDashboard,
});

const panelStyle: CSSProperties = {
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    padding: "28px 32px",
    boxSizing: "border-box",
};

function heatColor(fraction: number) {
    if (fraction <= 0) return "var(--color-neutral-200)";
    if (fraction < 0.25) return "var(--color-accent-200)";
    if (fraction < 0.5) return "var(--color-accent-400)";
    if (fraction < 0.75) return "var(--color-accent-600)";
    return "var(--color-accent-800)";
}

function perHabitStats(habits: Habit[], logs: HabitLog[], window: number) {
    return habits
        .map((habit) => {
            const habitLogs = logsForHabit(logs, habit.habitId);
            return {
                habit,
                streak: currentStreak(habitLogs),
                longest: longestStreak(habitLogs, window),
                consistency: consistencyPct(habitLogs, 28),
            };
        })
        .sort((a, b) => b.consistency - a.consistency);
}

function InsightsDashboard() {
    const { preferences } = usePreferences();
    const insightWindow = preferences.insightWindow;
    const weekStartsOn = preferences.weekStartsOn;

    const selfQuery = apiHooks.useGetApiAuthSelf(undefined, { retry: false });
    const habitsQuery = apiHooks.useGetApiHabit();
    const logsQuery = apiHooks.useGetApiHabitLog();

    const habits = useMemo(() => habitsQuery.data ?? [], [habitsQuery.data]);
    const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

    const streak = useMemo(() => currentStreak(logs), [logs]);
    const longestInWindow = useMemo(() => longestStreak(logs, insightWindow), [logs, insightWindow]);
    const consistency28 = useMemo(() => consistencyPct(logs, 28), [logs]);
    const heatmap = useMemo(() => habitsLoggedByDay(logs, insightWindow), [logs, insightWindow]);
    const weekday = useMemo(() => logsByWeekday(logs, insightWindow), [logs, insightWindow]);
    const habitStats = useMemo(
        () => perHabitStats(habits, logs, insightWindow),
        [habits, logs, insightWindow],
    );

    const isLoading = habitsQuery.isLoading || logsQuery.isLoading;
    const maxWeekday = Math.max(1, ...weekday);
    const bestDayIndex = weekday.indexOf(Math.max(...weekday));
    const topHabit = habitStats[0];

    // The heatmap runs one column per calendar week, so the first day needs
    // padding cells above it to land on its own weekday row.
    const heatmapOffset = heatmap.length > 0 ? leadingBlanks(heatmap[0].date, weekStartsOn) : 0;
    const heatmapWeeks = Math.ceil((heatmapOffset + heatmap.length) / 7);

    if (isLoading) {
        return (
            <div style={{ width: "100%", minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                <BroadsheetNav username={selfQuery.data?.username} streakDays={0} />
                <div style={{ padding: 44 }}>Loading your insights…</div>
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
                <div style={{ font: "600 32px/1 'Source Serif 4',serif" }}>Insights</div>
                <div style={{ font: "italic 400 18px/1.5 'Source Serif 4',serif", color: "var(--color-neutral-700)", marginTop: 10 }}>
                    {logs.length === 0
                        ? "Log a few habits and your patterns will show up here."
                        : `Patterns over the last ${insightWindow} days.`}
                </div>

                {/* Stat band */}
                <div style={{ ...panelStyle, marginTop: 32, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
                    <div>
                        <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>Current streak</div>
                        <div style={{ font: "600 48px/1 'Source Serif 4',serif", letterSpacing: "-.02em", marginTop: 8 }}>{streak}</div>
                        <div style={{ fontSize: 14, color: "var(--color-neutral-700)", marginTop: 6 }}>{streak === 1 ? "day" : "days"} running</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>Longest streak</div>
                        <div style={{ font: "600 48px/1 'Source Serif 4',serif", letterSpacing: "-.02em", marginTop: 8 }}>{longestInWindow}</div>
                        <div style={{ fontSize: 14, color: "var(--color-neutral-700)", marginTop: 6 }}>in the last {insightWindow} days</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>Consistency</div>
                        <div style={{ font: "600 48px/1 'Source Serif 4',serif", letterSpacing: "-.02em", marginTop: 8 }}>{consistency28}%</div>
                        <div style={{ fontSize: 14, color: "var(--color-neutral-700)", marginTop: 6 }}>of the last 28 days</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>Best day</div>
                        <div style={{ font: "600 48px/1 'Source Serif 4',serif", letterSpacing: "-.02em", marginTop: 8 }}>
                            {weekday.some((c) => c > 0) ? WEEKDAY_LABELS[bestDayIndex] : "—"}
                        </div>
                        <div style={{ fontSize: 14, color: "var(--color-neutral-700)", marginTop: 6 }}>most logged weekday</div>
                    </div>
                </div>

                {/* Heatmap + weekday chart */}
                <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 24, marginTop: 24, alignItems: "start" }}>
                    <div style={panelStyle}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20 }}>
                            <div style={{ font: "600 22px/1 'Source Serif 4',serif" }}>Consistency, {insightWindow} days</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-neutral-700)" }}>
                                <span>Fewer</span>
                                {[0, 0.2, 0.45, 0.7, 1].map((fraction) => (
                                    <span
                                        key={fraction}
                                        style={{ width: 11, height: 11, borderRadius: 2, background: heatColor(fraction) }}
                                    />
                                ))}
                                <span>More</span>
                            </div>
                        </div>

                        {/* One column per week, filled top to bottom — the week-start
                            preference decides which weekday sits in the top row. */}
                        <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateRows: "repeat(7, auto)",
                                    gap: 4,
                                    fontSize: 10,
                                    letterSpacing: ".06em",
                                    textTransform: "uppercase",
                                    color: "var(--color-neutral-700)",
                                }}
                            >
                                {weekdayOrder(weekStartsOn).map((index) => (
                                    <span key={index} style={{ display: "flex", alignItems: "center" }}>
                                        {WEEKDAY_LABELS[index]}
                                    </span>
                                ))}
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${heatmapWeeks}, 1fr)`,
                                    gridTemplateRows: "repeat(7, auto)",
                                    gridAutoFlow: "column",
                                    gap: 4,
                                }}
                            >
                                {Array.from({ length: heatmapOffset }, (_, i) => (
                                    <div key={`blank-${i}`} aria-hidden style={{ aspectRatio: "1" }} />
                                ))}
                                {heatmap.map((day) => {
                                    const fraction = habits.length > 0 ? day.count / habits.length : 0;
                                    const isToday = day.date === heatmap[heatmap.length - 1].date;
                                    return (
                                        <div
                                            key={day.date}
                                            title={`${day.date}: ${day.count}/${habits.length}`}
                                            style={{
                                                aspectRatio: "1",
                                                borderRadius: 2,
                                                background: heatColor(fraction),
                                                outline: isToday ? "1px solid var(--color-text)" : "none",
                                                outlineOffset: -1,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div style={panelStyle}>
                        <div style={{ font: "600 22px/1 'Source Serif 4',serif" }}>By weekday</div>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, marginTop: 26 }}>
                            {weekdayOrder(weekStartsOn).map((index) => {
                                const count = weekday[index];
                                return (
                                    <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                        <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{count}</div>
                                        <div
                                            style={{
                                                width: "100%",
                                                borderRadius: "3px 3px 0 0",
                                                height: Math.max((count / maxWeekday) * 100, count > 0 ? 6 : 0),
                                                background: index === bestDayIndex && count > 0 ? "var(--color-accent)" : "var(--color-accent-300)",
                                            }}
                                        />
                                        <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{WEEKDAY_LABELS[index]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Per-habit breakdown */}
                <div style={{ ...panelStyle, marginTop: 24 }}>
                    <div style={{ font: "600 22px/1 'Source Serif 4',serif" }}>Habit breakdown</div>
                    {habitStats.length === 0 ? (
                        <div style={{ color: "var(--color-neutral-700)", marginTop: 16 }}>No habits yet.</div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18, fontSize: 15 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 10px" }}>Habit</th>
                                    <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 10px" }}>Current streak</th>
                                    <th style={{ textAlign: "left", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 10px" }}>Longest streak</th>
                                    <th style={{ textAlign: "right", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, color: "var(--color-neutral-700)", padding: "0 0 10px" }}>Consistency (28d)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {habitStats.map((row, i) => (
                                    <tr key={row.habit.habitId} style={{ background: i % 2 === 1 ? "var(--color-bg)" : "transparent" }}>
                                        <td style={{ font: "400 18px/1 'Source Serif 4',serif", padding: "12px 8px 12px 0" }}>{row.habit.name}</td>
                                        <td style={{ padding: "12px 8px", color: "var(--color-neutral-700)" }}>{row.streak} {row.streak === 1 ? "day" : "days"}</td>
                                        <td style={{ padding: "12px 8px", color: "var(--color-neutral-700)" }}>{row.longest} {row.longest === 1 ? "day" : "days"}</td>
                                        <td style={{ padding: "12px 0 12px 8px", textAlign: "right" }}>
                                            <span className={row.consistency >= 70 ? "tag tag-accent" : "tag tag-outline"}>{row.consistency}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {topHabit && (
                        <div style={{ font: "italic 400 18px/1.5 'Source Serif 4',serif", marginTop: 22, paddingLeft: 16, borderLeft: "2px solid var(--color-accent-2)" }}>
                            {topHabit.habit.name} is your most consistent habit at {topHabit.consistency}% over the last 28 days.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
