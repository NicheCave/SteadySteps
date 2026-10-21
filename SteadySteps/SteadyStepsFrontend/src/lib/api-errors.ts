/**
 * Pulls the human-readable message out of an API failure. The backend answers
 * validation failures with a ProblemDetails body whose `detail` carries the
 * Identity error text; anything else falls back to the caller's wording.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
    const data = (error as { response?: { data?: unknown } })?.response?.data;

    if (typeof data === "string" && data.trim()) return data.trim();

    if (data && typeof data === "object") {
        const problem = data as { detail?: unknown; title?: unknown; errors?: unknown };

        if (typeof problem.detail === "string" && problem.detail.trim()) {
            return problem.detail.trim();
        }

        // ModelState failures arrive as { errors: { Field: ["message", ...] } }.
        if (problem.errors && typeof problem.errors === "object") {
            const first = Object.values(problem.errors as Record<string, unknown>)
                .flatMap((value) => (Array.isArray(value) ? value : [value]))
                .find((value): value is string => typeof value === "string" && value.trim().length > 0);
            if (first) return first;
        }

        if (typeof problem.title === "string" && problem.title.trim()) {
            return problem.title.trim();
        }
    }

    return fallback;
}
