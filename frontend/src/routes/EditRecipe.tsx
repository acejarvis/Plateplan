import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { Folder, Recipe, RecipeFormValues } from "@/types";
import RecipeForm from "@/components/RecipeForm";

interface EditRecipeProps {
  recipes: Recipe[];
  folders: Folder[];
  onSave: (id: string | null, values: RecipeFormValues) => Promise<void>;
}

/**
 * Create / Edit recipe route.
 *
 * When `id` param is "new", the form is in create mode.
 * Otherwise it pre-fills with the existing recipe's values.
 *
 * TODO: On submit:
 *   - Create: POST /api/recipes   (body: RecipeFormValues minus imageFile,
 *                                   plus imageUrl returned from upload endpoint)
 *   - Update: PUT  /api/recipes/:id
 *
 * TODO: Photo upload:
 *   POST /api/upload/recipe-image  (multipart/form-data, field "image")
 *   Returns { url: string }
 *   Store the URL and include it in the recipe save request.
 */
export default function EditRecipe({ recipes, folders, onSave }: EditRecipeProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isNew = !id || id === "new";
  const recipe: Recipe | undefined = isNew
    ? undefined
    : recipes.find((r) => r.id === id);

  if (!isNew && !recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#a0a0a0]">
        <span className="text-5xl">🔍</span>
        <p className="text-lg">Recipe not found</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-blue-400 hover:underline"
        >
          Back to library
        </button>
      </div>
    );
  }

  const initialValues: Partial<RecipeFormValues> | undefined = recipe
    ? {
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        folderId: recipe.folderId,
        ingredients: recipe.ingredients.map(({ id: _id, ...rest }) => rest),
        tags: recipe.tags.map((t) => t.name),
        imageFile: null,
      }
    : undefined;

  async function handleSubmit(values: RecipeFormValues) {
    await onSave(isNew ? null : (id ?? null), values);
    navigate(isNew ? "/" : `/recipe/${id}`);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-5 border-b border-[var(--border)] shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          {isNew ? "New Recipe" : `Edit — ${recipe?.title}`}
        </h1>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-2xl">
        <RecipeForm
          initialValues={initialValues}
          folders={folders}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel={isNew ? "Create Recipe" : "Save Changes"}
        />
      </div>
    </div>
  );
}
