import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiHooks } from "@/client-hooks";
import { useToast } from "@/hooks/use-toast";
import type { Habit } from "@/lib/dashboard-metrics";

export function HabitFormDialog({
    open,
    onClose,
    habit,
}: {
    open: boolean;
    onClose: () => void;
    habit?: Habit | null;
}) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const createHabit = apiHooks.usePostApiHabit();
    const updateHabit = apiHooks.usePutApiHabitId({ params: { id: habit?.habitId ?? "" } });

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [frequency, setFrequency] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setName(habit?.name ?? "");
        setDescription(habit?.description ?? "");
        setFrequency(habit?.frequency ?? "");
    }, [open, habit]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const body = {
                name,
                description: description || undefined,
                frequency: frequency || undefined,
            };

            if (habit) {
                await updateHabit.mutateAsync(body);
            } else {
                await createHabit.mutateAsync(body);
            }

            await queryClient.invalidateQueries();
            toast({ title: habit ? "Habit updated" : "Habit created", description: `"${name}" has been saved.` });
            onClose();
        } catch {
            toast({
                title: "Couldn't save habit",
                description: "Something went wrong saving that habit.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dialog-backdrop" onClick={onClose}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-title">{habit ? "Edit habit" : "New habit"}</div>
                <form onSubmit={handleSubmit} className="dialog-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <div className="field">
                        <label htmlFor="habit-name">Name</label>
                        <input
                            id="habit-name"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Movement"
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="habit-frequency">Frequency</label>
                        <input
                            id="habit-frequency"
                            className="input"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            placeholder="e.g. Daily"
                            maxLength={50}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="habit-description">Description</label>
                        <textarea
                            id="habit-description"
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={1500}
                        />
                    </div>

                    <div className="dialog-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? "Saving…" : habit ? "Save changes" : "Create habit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
