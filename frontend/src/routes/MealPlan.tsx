import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type { Folder, MealPlanEntry, Recipe } from "@/types";
import MealPlannerGrid from "@/components/MealPlannerGrid";
import { MOCK_MEAL_PLAN } from "@/mockData";

interface MealPlanProps {
  recipes: Recipe[];
  folders: Folder[];
  entries: MealPlanEntry[];
  onEntriesChange: (updated: MealPlanEntry[]) => void;
}

/**
 * Weekly Meal Plan page.
 *
 * Shows the MealPlannerGrid for the current week.
 * Week navigation arrows change the displayed week.
 *
 * TODO: On week change, fetch GET /api/meal-plans?week=YYYY-MM-DD
 *       and update entries state.
 */
export default function MealPlan({ recipes, folders, entries, onEntriesChange }: MealPlanProps) {
  const [weekOffset, setWeekOffset] = useState(0); // offset from base week in weeks

  // Compute the displayed week start date (Monday)
  const baseDate = new Date(MOCK_MEAL_PLAN.weekStartDate + "T00:00:00");
  const weekStart = new Date(baseDate);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const dateLabel = `${weekStart.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  })} – ${weekEnd.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  function prevWeek() {
    setWeekOffset((v) => v - 1);
    // TODO: fetch entries for new week from API
    console.log("[TODO] Fetch meal plan for previous week");
  }

  function nextWeek() {
    setWeekOffset((v) => v + 1);
    // TODO: fetch entries for new week from API
    console.log("[TODO] Fetch meal plan for next week");
  }

  // Format the ISO date string for the current week start
  const isoWeekStart = weekStart.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
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
          <span className="text-sm font-medium text-[var(--text-primary)] min-w-[200px] text-center">{dateLabel}</span>
          <button
            onClick={nextWeek}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Planner grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <MealPlannerGrid
          recipes={recipes}
          folders={folders}
          entries={weekOffset === 0 ? entries : []}
          mealPlanId={MOCK_MEAL_PLAN.id}
          weekStartDate={isoWeekStart}
          onEntriesChange={onEntriesChange}
        />
      </div>
    </div>
  );
}
