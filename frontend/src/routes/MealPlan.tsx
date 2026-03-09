import { useMemo, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { apiGetMealPlan } from "@/lib/api";
import type { Folder, MealPlanEntry, Recipe } from "@/types";
import MealPlannerGrid from "@/components/MealPlannerGrid";

interface MealPlanProps {
  recipes: Recipe[];
  folders: Folder[];
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function MealPlan({ recipes, folders }: MealPlanProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [entries, setEntries] = useState<MealPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseMonday = useMemo(() => getMonday(new Date()), []);

  const weekStart = useMemo(() => {
    const next = new Date(baseMonday);
    next.setDate(next.getDate() + weekOffset * 7);
    return next;
  }, [baseMonday, weekOffset]);

  const weekEnd = useMemo(() => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 6);
    return next;
  }, [weekStart]);

  const isoWeekStart = useMemo(() => formatDateKey(weekStart), [weekStart]);

  const dateLabel = `${weekStart.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  })} – ${weekEnd.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const loadWeekPlan = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const plan = await apiGetMealPlan(isoWeekStart);
      setMealPlanId(plan.id);
      setEntries(plan.entries);
    } catch (err) {
      setMealPlanId(null);
      setEntries([]);
      setError(toErrorMessage(err, "Failed to load this week's meal plan."));
    } finally {
      setLoading(false);
    }
  }, [isoWeekStart]);

  useEffect(() => {
    void loadWeekPlan();
  }, [loadWeekPlan]);

  function prevWeek() {
    setWeekOffset((value) => value - 1);
  }

  function nextWeek() {
    setWeekOffset((value) => value + 1);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-8 py-5 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Weekly Meal Plan</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevWeek}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--text-primary)] min-w-[200px] text-center">
            {dateLabel}
          </span>
          <button
            onClick={nextWeek}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {loading && (
          <div className="h-full min-h-[240px] flex items-center justify-center">
            <span className="text-sm text-[var(--text-secondary)] animate-pulse">
              Loading meal plan…
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="max-w-xl mx-auto bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => {
                void loadWeekPlan();
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && mealPlanId && (
          <MealPlannerGrid
            recipes={recipes}
            folders={folders}
            entries={entries}
            mealPlanId={mealPlanId}
            weekStartDate={isoWeekStart}
            onEntriesChange={setEntries}
          />
        )}
      </div>
    </div>
  );
}
