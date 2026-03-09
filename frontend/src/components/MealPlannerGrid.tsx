import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Clock, Users, X, Sparkles, Loader2, Search, GripVertical, Folder } from "lucide-react";
import type { DayOfWeek, Folder as FolderType, MealPlanEntry, MealType, Recipe, WeeklyDietSuggestion } from "@/types";
import {
  apiCreateMealPlanEntry,
  apiDeleteMealPlanEntry,
  apiGetMealPlanDietSuggestions,
  apiUpdateMealPlanEntry,
} from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const MEALS: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

// ─── Helper types ─────────────────────────────────────────────────────────────

function slotKey(day: DayOfWeek, meal: MealType) {
  return `${day}-${meal}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A draggable recipe mini-card inside a planner cell */
function DraggableRecipeMini({
  entry,
  onRemove,
}: {
  entry: MealPlanEntry;
  onRemove: () => void;
}) {
  const id = entry.id;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-[var(--bg-elevated)] border border-[var(--border-mid)] group",
        isDragging && "opacity-30"
      )}
    >
      {entry.recipe.imageUrl && (
        <img
          src={entry.recipe.imageUrl}
          alt={entry.recipe.title}
          className="w-full h-14 object-cover"
        />
      )}
      <div className="px-2.5 py-2">
        <p className="text-[var(--text-primary)] font-semibold leading-tight line-clamp-1 text-xs">
          {entry.recipe.title}
        </p>
        <div className="flex gap-2.5 text-[var(--text-secondary)] mt-1 text-[10px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {entry.recipe.cookTime + entry.recipe.prepTime}m
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {entry.recipe.servings}
          </span>
        </div>
      </div>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="absolute top-1 right-1 p-0.5 rounded bg-black/50 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/** A droppable planner cell for one (day, meal) slot */
function PlannerCell({
  day,
  meal,
  entries,
  onRemove,
}: {
  day: DayOfWeek;
  meal: MealType;
  entries: MealPlanEntry[];
  onRemove: (entryId: string) => void;
}) {
  const id = slotKey(day, meal);
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[100px] rounded-xl border transition-colors p-2 flex flex-col gap-2",
        isOver
          ? "border-blue-500/60 bg-blue-500/10"
          : "border-[var(--border)] bg-[var(--bg-app)]"
      )}
    >
      {entries.map((entry) => (
        <DraggableRecipeMini
          key={entry.id}
          entry={entry}
          onRemove={() => onRemove(entry.id)}
        />
      ))}
      {entries.length === 0 && (
        <p className="text-[var(--text-muted)] text-xs text-center m-auto select-none">drop here</p>
      )}
    </div>
  );
}

/** Floating drag overlay card (for entries already on the grid) */
function DragOverlayCard({ entry }: { entry: MealPlanEntry }) {
  return (
    <div className="rounded-xl overflow-hidden bg-[var(--bg-elevated)] border border-blue-500/60 shadow-2xl opacity-90 w-36">
      {entry.recipe.imageUrl && (
        <img src={entry.recipe.imageUrl} alt={entry.recipe.title} className="w-full h-12 object-cover" />
      )}
      <div className="px-2.5 py-2">
        <p className="text-[var(--text-primary)] font-semibold line-clamp-1 text-xs">{entry.recipe.title}</p>
      </div>
    </div>
  );
}

/** Floating drag overlay for a recipe dragged from the picker panel */
function DragOverlayRecipe({ recipe }: { recipe: Recipe }) {
  return (
    <div className="rounded-xl overflow-hidden bg-[var(--bg-elevated)] border border-blue-500/60 shadow-2xl opacity-90 w-36">
      {recipe.imageUrl ? (
        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-12 object-cover" />
      ) : (
        <div className="w-full h-12 bg-[var(--bg-hover)] flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
      )}
      <div className="px-2.5 py-2">
        <p className="text-[var(--text-primary)] font-semibold line-clamp-1 text-xs">{recipe.title}</p>
      </div>
    </div>
  );
}

// ─── Recipe Picker Panel ──────────────────────────────────────────────────────

/** A single draggable recipe card inside the picker panel */
function DraggableRecipeSource({ recipe }: { recipe: Recipe }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `src:${recipe.id}`,
    data: { recipe },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      title={recipe.title}
      className={cn(
        "flex-shrink-0 w-28 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-[var(--bg-elevated)] border border-[var(--border-mid)] hover:border-blue-500/50 transition-colors group",
        isDragging && "opacity-30"
      )}
    >
      {recipe.imageUrl ? (
        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-16 object-cover" />
      ) : (
        <div className="w-full h-16 bg-[var(--bg-hover)] flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
      )}
      <div className="px-2 py-1.5">
        <p className="text-[var(--text-primary)] text-[11px] font-medium line-clamp-2 leading-tight">{recipe.title}</p>
        <div className="flex items-center gap-1 mt-1 text-[var(--text-muted)] text-[10px]">
          <Clock className="w-2.5 h-2.5" />
          {recipe.prepTime + recipe.cookTime}m
        </div>
      </div>
    </div>
  );
}

/** Horizontal scrollable recipe picker shown above the planner grid */
function RecipePickerPanel({
  recipes,
  folders,
  collapsed,
  onToggle,
}: {
  recipes: Recipe[];
  folders: FolderType[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const filtered = recipes.filter((r) => {
    const matchesFolder =
      activeFolderId === null ||
      (activeFolderId === "__none__" ? r.folderId === null : r.folderId === activeFolderId);
    const matchesQuery = !query.trim() || r.title.toLowerCase().includes(query.toLowerCase());
    return matchesFolder && matchesQuery;
  });

  return (
    <div className="mb-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      {/* Panel header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-[#606060]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Recipe Library</span>
          <span className="text-xs text-[var(--text-muted)]">— drag onto a cell to add</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{collapsed ? "▼ Show" : "▲ Hide"}</span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4">
          {/* Folder filter chips */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFolderId(null)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                activeFolderId === null
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                  : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-mid)]"
              )}
            >
              All Recipes
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFolderId(f.id === activeFolderId ? null : f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  activeFolderId === f.id
                    ? "border-current"
                    : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-mid)]"
                )}
                style={
                  activeFolderId === f.id
                    ? { backgroundColor: `${f.color}22`, borderColor: `${f.color}88`, color: f.color }
                    : undefined
                }
              >
                <Folder className="w-3 h-3" />
                {f.name}
              </button>
            ))}
            {/* Unfoldered */}
            <button
              type="button"
              onClick={() => setActiveFolderId(activeFolderId === "__none__" ? null : "__none__")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                activeFolderId === "__none__"
                  ? "bg-[var(--bg-active)] border-[var(--border-mid)] text-[var(--text-primary)]"
                  : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-mid)]"
              )}
            >
              <Folder className="w-3 h-3" />
              Unfiled
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#606060]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes…"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg pl-7 pr-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--text-dim)]"
            />
          </div>

          {/* Scrollable recipe strip */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {filtered.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-2">No recipes match.</p>
            ) : (
              filtered.map((r) => <DraggableRecipeSource key={r.id} recipe={r} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Diet Suggestions Panel ────────────────────────────────────────────────

function DietSuggestionsPanel({ mealPlanId }: { mealPlanId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeeklyDietSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetMealPlanDietSuggestions(mealPlanId);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="mt-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Weekly Diet Suggestions</h3>
      </div>
      <div className="p-4">
        {!result && !loading && (
          <div className="text-center py-2">
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Get AI recommendations to improve the nutritional balance of your whole week.
            </p>
            <button
              onClick={handleFetch}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Get Diet Suggestions
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            <p className="text-sm text-[var(--text-secondary)]">Analysing your weekly plan…</p>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg p-3">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{result.overallAssessment}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {result.nutritionHighlights.strength.map((s, i) => (
                    <li key={i} className="flex gap-1.5 text-sm text-[var(--text-primary)]">
                      <span className="text-green-400">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">
                  Areas to Improve
                </h4>
                <ul className="space-y-1">
                  {result.nutritionHighlights.improvement.map((s, i) => (
                    <li key={i} className="flex gap-1.5 text-sm text-[var(--text-primary)]">
                      <span className="text-orange-400">!</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2">
                Recommendations
              </h4>
              <ul className="space-y-1.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[var(--text-primary)]">
                    <span className="text-purple-400 mt-0.5">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleFetch}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] underline transition-colors"
            >
              Re-analyse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main MealPlannerGrid ─────────────────────────────────────────────────────

interface MealPlannerGridProps {
  recipes: Recipe[];
  folders: FolderType[];
  entries: MealPlanEntry[];
  mealPlanId: string;
  weekStartDate: string; // e.g. "2026-03-02"
  onEntriesChange: (updated: MealPlanEntry[]) => void;
}

/**
 * Weekly meal planner grid.
 *
 * Displays a 7-column (days) × 3-row (meals) grid.
 * Supports drag-and-drop to create and move entries between slots.
 */
export default function MealPlannerGrid({
  recipes,
  folders,
  entries,
  mealPlanId,
  weekStartDate,
  onEntriesChange,
}: MealPlannerGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pickerCollapsed, setPickerCollapsed] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Build a lookup: slotKey → entries[]
  const slotMap = new Map<string, MealPlanEntry[]>();
  for (const entry of entries) {
    const key = slotKey(entry.dayOfWeek, entry.mealType);
    if (!slotMap.has(key)) slotMap.set(key, []);
    slotMap.get(key)!.push(entry);
  }

  // Determine what is being dragged
  const isNewRecipeDrag = activeId?.startsWith("src:") ?? false;
  const activeEntry = !isNewRecipeDrag && activeId
    ? entries.find((e) => e.id === activeId) ?? null
    : null;
  const activeRecipe = isNewRecipeDrag && activeId
    ? recipes.find((r) => `src:${r.id}` === activeId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    // over.id must be a valid slot key like "MONDAY-BREAKFAST"
    const parts = String(over.id).split("-");
    const day = parts[0] as DayOfWeek;
    const meal = parts[1] as MealType;
    if (!DAYS.includes(day) || !MEALS.includes(meal)) return;

    const activeStr = String(active.id);

    if (activeStr.startsWith("src:")) {
      const recipeId = activeStr.slice(4);
      setMutationError(null);
      void (async () => {
        try {
          const createdEntry = await apiCreateMealPlanEntry(mealPlanId, {
            recipeId,
            dayOfWeek: day,
            mealType: meal,
          });
          onEntriesChange([...entries, createdEntry]);
        } catch (err) {
          setMutationError(
            err instanceof Error ? err.message : "Failed to add meal plan entry."
          );
        }
      })();
    } else {
      const activeEntry = entries.find((entry) => entry.id === activeStr);
      if (!activeEntry) return;
      if (activeEntry.dayOfWeek === day && activeEntry.mealType === meal) return;

      setMutationError(null);
      void (async () => {
        try {
          const updatedEntry = await apiUpdateMealPlanEntry(mealPlanId, activeStr, {
            dayOfWeek: day,
            mealType: meal,
          });
          onEntriesChange(
            entries.map((entry) =>
              entry.id === updatedEntry.id ? updatedEntry : entry
            )
          );
        } catch (err) {
          setMutationError(
            err instanceof Error ? err.message : "Failed to move meal plan entry."
          );
        }
      })();
    }
  }

  function handleRemoveEntry(entryId: string) {
    setMutationError(null);
    void (async () => {
      try {
        await apiDeleteMealPlanEntry(mealPlanId, entryId);
        onEntriesChange(entries.filter((entry) => entry.id !== entryId));
      } catch (err) {
        setMutationError(
          err instanceof Error ? err.message : "Failed to remove meal plan entry."
        );
      }
    })();
  }

  // Compute display dates for column headers
  const weekStart = new Date(weekStartDate + "T00:00:00");
  const dayDates = DAYS.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.getDate();
  });

  return (
    <div>
      {mutationError && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg p-3">
          {mutationError}
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Recipe picker panel */}
        <RecipePickerPanel
          recipes={recipes}
          folders={folders}
          collapsed={pickerCollapsed}
          onToggle={() => setPickerCollapsed((v) => !v)}
        />

        {/* Column headers */}
        <div className="grid grid-cols-[100px_repeat(7,_1fr)] gap-3 mb-3">
          <div />
          {DAYS.map((day, i) => (
            <div key={day} className="text-center py-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{DAY_LABELS[day]}</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{dayDates[i]}</p>
            </div>
          ))}
        </div>

        {/* Row for each meal type */}
        {MEALS.map((meal) => (
          <div key={meal} className="grid grid-cols-[100px_repeat(7,_1fr)] gap-3 mb-3">
            {/* Row label */}
            <div className="flex items-center justify-end pr-3">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {MEAL_LABELS[meal]}
              </span>
            </div>
            {DAYS.map((day) => (
              <PlannerCell
                key={slotKey(day, meal)}
                day={day}
                meal={meal}
                entries={slotMap.get(slotKey(day, meal)) ?? []}
                onRemove={handleRemoveEntry}
              />
            ))}
          </div>
        ))}

        <DragOverlay>
          {activeEntry ? <DragOverlayCard entry={activeEntry} /> : null}
          {activeRecipe ? <DragOverlayRecipe recipe={activeRecipe} /> : null}
        </DragOverlay>
      </DndContext>

      {/* AI Diet Suggestions */}
      <DietSuggestionsPanel mealPlanId={mealPlanId} />
    </div>
  );
}
