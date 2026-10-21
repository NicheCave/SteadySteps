import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useTheme } from "@/components/theme-context";
import { isoWeek } from "@/lib/dashboard-metrics";

const NAV_LINKS = [
    { to: "/", label: "Today" },
    { to: "/progress", label: "Progress" },
    { to: "/habits", label: "Habits" },
    { to: "/insights", label: "Insights" },
    { to: "/settings", label: "Settings" },
] as const;

export function BroadsheetLogo({ size = 34 }: { size?: number }) {
    const bars = [0.38, 0.68, 1];
    const gap = 3;
    const barWidth = (size - gap * (bars.length - 1)) / bars.length;
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap, height: size }}>
            {bars.map((h, i) => (
                <div
                    key={i}
                    style={{
                        width: barWidth,
                        height: size * h,
                        background: "var(--color-accent)",
                    }}
                />
            ))}
        </div>
    );
}

export function BroadsheetNav({ username, streakDays }: { username?: string | null; streakDays: number }) {
    const { setTheme } = useTheme();

    // Broadsheet has no dark variant ("this system shows no dark surfaces") —
    // force light while any dashboard route is mounted.
    useEffect(() => {
        setTheme("light");
    }, [setTheme]);

    const today = new Date();
    const dateLabel = today.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div
            style={{
                width: "100%",
                background: "var(--color-surface)",
                borderBottom: "1px solid var(--color-divider)",
                padding: "20px 44px 16px",
                boxSizing: "border-box",
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 30, maxWidth: 1600, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <BroadsheetLogo />
                    <div style={{ font: "600 32px/1 'Source Serif 4',serif", letterSpacing: "-.015em" }}>
                        SteadySteps
                    </div>
                </div>
                <nav style={{ display: "flex", alignItems: "baseline", gap: 30, fontSize: 16, paddingBottom: 2 }}>
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            style={{ color: "var(--color-neutral-700)" }}
                            activeOptions={{ exact: link.to === "/" }}
                            activeProps={{
                                style: {
                                    color: "var(--color-accent-700)",
                                    fontWeight: 600,
                                },
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginTop: 14,
                    fontSize: 12,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--color-neutral-700)",
                    maxWidth: 1600,
                    marginLeft: "auto",
                    marginRight: "auto",
                }}
            >
                <span>{dateLabel}</span>
                <span>Week {isoWeek(today)}</span>
                <span>Streak — {streakDays} {streakDays === 1 ? "day" : "days"}</span>
                <span>{username ?? ""}</span>
            </div>
        </div>
    );
}
