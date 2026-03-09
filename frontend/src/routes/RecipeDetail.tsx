import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Pencil, Tag } from "lucide-react";
import type { Folder, Recipe } from "@/types";
import NutritionPanel from "@/components/NutritionPanel";

interface RecipeDetailProps {
  recipes: Recipe[];
  folders: Folder[];
}

/**
 * Recipe detail page.
 *
 * Displays all recipe information: cover photo, metadata, ingredients,
 * instructions, tags, and the AI nutrition analysis panel.
 */
export default function RecipeDetail({ recipes, folders }: RecipeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const recipe: Recipe | undefined = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-secondary)]">
        <span className="text-5xl">🔍</span>
        <p className="text-lg">Recipe not found</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm text-blue-400 hover:underline"
        >
          Back to library
        </button>
      </div>
    );
  }

  const folder = folders.find((f) => f.id === recipe.folderId);
  const totalTime = recipe.prepTime + recipe.cookTime;
  const timeLabel =
    totalTime >= 60
      ? `${Math.floor(totalTime / 60)}h ${totalTime % 60 > 0 ? `${totalTime % 60}m` : ""}`
      : `${totalTime} min`;

  const steps = recipe.instructions
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Back button */}
      <div className="px-4 sm:px-6 pt-6 pb-3 shrink-0">
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer select-none caret-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to library
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 px-4 sm:px-8 pb-10">
        {/* Left column: image + ingredients + instructions */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Cover photo */}
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full max-h-80 object-cover rounded-2xl shadow-lg"
            />
          ) : (
            <div className="w-full h-56 flex items-center justify-center rounded-2xl bg-[var(--bg-elevated)] text-6xl">
              🍽️
            </div>
          )}

          {/* Title + actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] leading-tight">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-[var(--text-secondary)] mt-2 text-base leading-relaxed">{recipe.description}</p>
              )}
            </div>
            <button
              onClick={() => navigate(`/recipe/${recipe.id}/edit`)}
              className="shrink-0 flex items-center gap-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] text-sm px-4 py-2 rounded-xl transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-3">
            {folder && (
              <span
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm text-[#d0d0d0]"
                style={{ borderColor: folder.color + "80", backgroundColor: folder.color + "15" }}
              >
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </span>
            )}
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-mid)] text-sm text-[var(--text-primary)]">
              <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
              {timeLabel}
            </span>
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-mid)] text-sm text-[var(--text-primary)]">
              <Users className="w-4 h-4 text-[var(--text-secondary)]" />
              {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
            </span>
            {recipe.prepTime > 0 && (
              <span className="px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-mid)] text-sm text-[var(--text-secondary)]">
                Prep: {recipe.prepTime} min
              </span>
            )}
            {recipe.cookTime > 0 && (
              <span className="px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-mid)] text-sm text-[var(--text-secondary)]">
                Cook: {recipe.cookTime} min
              </span>
            )}
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-mid)] rounded-full text-sm text-[var(--text-secondary)]"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Ingredients</h2>
            <ul className="space-y-0">
              {recipe.ingredients.map((ing) => (
                <li
                  key={ing.id}
                  className="flex items-center gap-4 py-3 border-b border-[var(--border)] last:border-0"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                  <span className="flex-1 text-[var(--text-primary)]">{ing.name}</span>
                  <span className="text-[var(--text-secondary)] text-sm">
                    {ing.quantity} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          {steps.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Instructions</h2>
              <ol className="space-y-5">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-[var(--text-primary)] leading-relaxed pt-0.5">{step.replace(/^\d+\.\s*/, "")}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right column: AI nutrition panel — sticky on desktop */}
        <div className="w-full lg:w-88 lg:shrink-0">
          <div className="sticky top-4">
            <NutritionPanel recipeId={recipe.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
