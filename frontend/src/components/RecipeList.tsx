import type { Recipe } from "@/types";
import RecipeCard from "./RecipeCard";

interface RecipeListProps {
  recipes: Recipe[];
  onDelete: (id: string) => void;
}

/**
 * Responsive recipe card grid.
 * Renders a RecipeCard for each recipe, or an empty-state message when the
 * list is empty.
 */
export default function RecipeList({ recipes, onDelete }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#a0a0a0]">
        <span className="text-5xl mb-4">🍳</span>
        <p className="text-lg font-medium">No recipes found</p>
        <p className="text-sm mt-1">Add a new recipe to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onDelete={onDelete} />
      ))}
    </div>
  );
}
