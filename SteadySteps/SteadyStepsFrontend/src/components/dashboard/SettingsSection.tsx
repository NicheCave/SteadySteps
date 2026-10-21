import type { CSSProperties, ReactNode } from "react";

const panelStyle: CSSProperties = {
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    padding: "28px 32px",
    boxSizing: "border-box",
};

/**
 * One titled block of the Settings page. Title and blurb sit in a left column so
 * the forms line up down the page the way a broadsheet's columns would.
 */
export function SettingsSection({
    title,
    blurb,
    children,
    id,
}: {
    title: string;
    blurb: string;
    children: ReactNode;
    id?: string;
}) {
    return (
        <section
            id={id}
            style={{ ...panelStyle, display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 2fr", gap: 40, alignItems: "start" }}
        >
            <div>
                <h2 style={{ font: "600 22px/1.2 'Source Serif 4',serif", margin: 0 }}>{title}</h2>
                <p style={{ font: "italic 400 16px/1.5 'Source Serif 4',serif", color: "var(--color-neutral-700)", margin: "10px 0 0" }}>
                    {blurb}
                </p>
            </div>
            <div>{children}</div>
        </section>
    );
}

/** A label/value pair for the read-only account summary. */
export function SettingsFact({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div>
            <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>
                {label}
            </div>
            <div style={{ font: "400 19px/1.3 'Source Serif 4',serif", marginTop: 6 }}>{value}</div>
        </div>
    );
}
