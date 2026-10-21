import { z } from "zod";
import { schemas } from "@/client";

export type Habit = z.infer<typeof schemas.HabitVM>;
export type Goal = z.infer<typeof schemas.GoalVM>;
export type HabitLog = z.infer<typeof schemas.HabitLogVM>;

// Parses a "YYYY-MM-DD" DateOnly string as a local calendar date (never UTC),
// so day-bucketing doesn't shift across timezone offsets.
function parseDateOnly(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function isoWeek(date: Date): number {
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayNumber = (target.getDay() + 6) % 7; // Monday = 0
    target.setDate(target.getDate() - dayNumber + 3); // nearest Thursday
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const firstDayNumber = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstDayNumber + 3);
    return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000));
}

/** Distinct habits logged per day, for the last `days` days ending today (oldest first). */
export function habitsLoggedByDay(
    logs: HabitLog[],
    days: number,
    today: Date = new Date(),
): { date: string; count: number }[] {
    const byDay = new Map<string, Set<string>>();
    for (const log of logs) {
        const key = dateKey(parseDateOnly(log.logDate));
        if (!byDay.has(key)) byDay.set(key, new Set());
        byDay.get(key)!.add(log.habitId);
    }

    const result: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const day = addDays(today, -i);
        const key = dateKey(day);
        result.push({ date: key, count: byDay.get(key)?.size ?? 0 });
    }
    return result;
}

/** Consecutive days ending today (or yesterday, if today has no logs yet) with at least one habit logged. */
export function currentStreak(logs: HabitLog[], today: Date = new Date()): number {
    const loggedDays = new Set(logs.map((log) => dateKey(parseDateOnly(log.logDate))));

    let cursor = today;
    if (!loggedDays.has(dateKey(cursor))) {
        cursor = addDays(cursor, -1);
    }

    let streak = 0;
    while (loggedDays.has(dateKey(cursor))) {
        streak++;
        cursor = addDays(cursor, -1);
    }
    return streak;
}

/** Longest run of consecutive logged days within the last `days` days ending today. */
export function longestStreak(logs: HabitLog[], days: number, today: Date = new Date()): number {
    const loggedDays = new Set(logs.map((log) => dateKey(parseDateOnly(log.logDate))));

    let longest = 0;
    let running = 0;
    for (let i = days - 1; i >= 0; i--) {
        const key = dateKey(addDays(today, -i));
        if (loggedDays.has(key)) {
            running++;
            longest = Math.max(longest, running);
        } else {
            running = 0;
        }
    }
    return longest;
}

/** Count of distinct habits with a log dated `today`. */
export function habitsLoggedToday(logs: HabitLog[], today: Date = new Date()): number {
    const key = dateKey(today);
    const logged = new Set(
        logs.filter((log) => dateKey(parseDateOnly(log.logDate)) === key).map((log) => log.habitId),
    );
    return logged.size;
}

export function todaysLogForHabit(
    logs: HabitLog[],
    habitId: string,
    today: Date = new Date(),
): HabitLog | undefined {
    const key = dateKey(today);
    return logs
        .filter((log) => log.habitId === habitId && dateKey(parseDateOnly(log.logDate)) === key)
        .sort((a, b) => (a.logId < b.logId ? 1 : -1))[0];
}

export function logsForHabit(logs: HabitLog[], habitId: string): HabitLog[] {
    return logs.filter((log) => log.habitId === habitId);
}

/** Distinct days within the last `days` days (ending today) that have at least one log. */
export function daysLoggedCount(logs: HabitLog[], days: number, today: Date = new Date()): number {
    return habitsLoggedByDay(logs, days, today).filter((day) => day.count > 0).length;
}

/** Percentage of the last `days` days (ending today) with at least one log, 0-100. */
export function consistencyPct(logs: HabitLog[], days: number, today: Date = new Date()): number {
    if (days <= 0) return 0;
    return Math.round((daysLoggedCount(logs, days, today) / days) * 100);
}

/** Total log entries bucketed by weekday (0 = Sunday .. 6 = Saturday) within the last `days` days. */
export function logsByWeekday(logs: HabitLog[], days: number, today: Date = new Date()): number[] {
    const cutoff = addDays(today, -(days - 1));
    const cutoffKey = dateKey(cutoff);
    const todayKey = dateKey(today);
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const log of logs) {
        const date = parseDateOnly(log.logDate);
        const key = dateKey(date);
        if (key < cutoffKey || key > todayKey) continue;
        counts[date.getDay()]++;
    }
    return counts;
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type WeekStart = "sunday" | "monday";

/**
 * The order to walk a weekday-bucketed array (index 0 = Sunday) so it reads
 * left-to-right under the given week start.
 */
export function weekdayOrder(weekStartsOn: WeekStart): number[] {
    return weekStartsOn === "monday" ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];
}

/** Column index (0-6) a date occupies in a calendar grid with the given week start. */
export function weekdayColumn(date: Date, weekStartsOn: WeekStart): number {
    const day = date.getDay();
    return weekStartsOn === "monday" ? (day + 6) % 7 : day;
}

/**
 * Blank cells to place before the first day of a calendar grid so every date
 * lands under its own weekday heading.
 */
export function leadingBlanks(firstDate: string, weekStartsOn: WeekStart): number {
    return weekdayColumn(parseDateOnly(firstDate), weekStartsOn);
}
