import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiHooks } from "@/client-hooks";
import { useToast } from "@/hooks/use-toast";
import type { Habit, Goal } from "@/lib/dashboard-metrics";

const NO_GOAL_PLACEHOLDER_ID = "00000000-0000-0000-0000-000000000000";

export function AdjustGoalDialog({
    open,
    onClose,
    habits,
    goals,
}: {
    open: boolean;
    onClose: () => void;
    habits: Habit[];
    goals: Goal[];
}) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [habitId, setHabitId] = useState(habits[0]?.habitId ?? "");
    const [target, setTarget] = useState("");
    const [currentProgress, setCurrentProgress] = useState("");
    const [saving, setSaving] = useState(false);

    const existingGoal = useMemo(
        () => goals.find((g) => g.habitId === habitId),
        [goals, habitId],
    );

    const createGoal = apiHooks.usePostApiGoal();
    const updateGoal = apiHooks.usePutApiGoalId({
        params: { id: existingGoal?.goalId ?? NO_GOAL_PLACEHOLDER_ID },
    });

    useEffect(() => {
        if (!open) return;
        setHabitId(habits[0]?.habitId ?? "");
    }, [open, habits]);

    useEffect(() => {
        setTarget(existingGoal?.target != null ? String(existingGoal.target) : "");
        setCurrentProgress(existingGoal?.currentProgress != null ? String(existingGoal.currentProgress) : "");
    }, [existingGoal]);

    if (!open) return null;

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!habitId) return;
        setSaving(true);
        try {
            const body = {
                habitId,
                target: Number(target),
                currentProgress: currentProgress ? Number(currentProgress) : undefined,
            };

            if (existingGoal) {
                await updateGoal.mutateAsync(body);
            } else {
                await createGoal.mutateAsync(body);
            }

            await queryClient.invalidateQueries();
            toast({ title: "Goal saved", description: "This week's goals have been updated." });
            handleClose();
        } catch {
            toast({
                title: "Couldn't save goal",
                description: "Something went wrong saving that goal.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dialog-backdrop" onClick={handleClose}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-title">Adjust goals</div>
                <form onSubmit={handleSubmit} className="dialog-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {habits.length === 0 ? (
                        <p>You need a habit before you can set a goal for it.</p>
                    ) : (
                        <>
                            <div className="field">
                                <label htmlFor="goal-habit">Habit</label>
                                <select
                                    id="goal-habit"
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
                            <div className="field">
                                <label htmlFor="goal-target">Target</label>
                                <input
                                    id="goal-target"
                                    className="input"
                                    type="number"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="goal-progress">Current progress</label>
                                <input
                                    id="goal-progress"
                                    className="input"
                                    type="number"
                                    value={currentProgress}
                                    onChange={(e) => setCurrentProgress(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="dialog-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        {habits.length > 0 && (
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : existingGoal ? "Update goal" : "Create goal"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
