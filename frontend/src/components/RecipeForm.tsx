import { useState, useRef } from "react";
import { PlusCircle, Trash2, Upload, X } from "lucide-react";
import type { Folder, Ingredient, RecipeFormValues } from "@/types";
import { cn } from "@/lib/utils";

interface RecipeFormProps {
  initialValues?: Partial<RecipeFormValues>;
  folders: Folder[];
  onSubmit: (values: RecipeFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const emptyIngredient = (): Omit<Ingredient, "id"> => ({
  name: "",
  quantity: "",
  unit: "",
});

function Field({ label, error, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

/**
 * Reusable form for creating and editing recipes.
 *
 * Photo uploads are stored to cloud storage by the backend.
 */
export default function RecipeForm({
  initialValues,
  folders,
  onSubmit,
  onCancel,
  submitLabel = "Save Recipe",
}: RecipeFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [instructions, setInstructions] = useState(initialValues?.instructions ?? "");
  const [prepTime, setPrepTime] = useState(initialValues?.prepTime ?? 0);
  const [cookTime, setCookTime] = useState(initialValues?.cookTime ?? 0);
  const [servings, setServings] = useState(initialValues?.servings ?? 2);
  const [folderId, setFolderId] = useState<string | null>(initialValues?.folderId ?? null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [ingredients, setIngredients] = useState<Omit<Ingredient, "id">[]>(
    initialValues?.ingredients ?? [emptyIngredient()]
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (servings < 1) newErrors.servings = "Servings must be at least 1";
    if (ingredients.some((i) => !i.name.trim())) {
      newErrors.ingredients = "All ingredient names are required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ─── Ingredient helpers ──────────────────────────────────────────────────────

  function updateIngredient(index: number, field: keyof Omit<Ingredient, "id">, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, emptyIngredient()]);
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  // ─── Tag helpers ─────────────────────────────────────────────────────────────

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  // ─── Photo helpers ────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        instructions,
        prepTime,
        cookTime,
        servings,
        folderId,
        ingredients,
        tags,
        imageFile,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--text-dim)] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <Field label="Title *" error={errors.title}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Spaghetti Carbonara"
          className={cn(inputCls, errors.title && "border-red-500")}
        />
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short description of the recipe…"
          rows={3}
          className={cn(inputCls, "resize-none")}
        />
      </Field>

      {/* Times + Servings */}
      <div className="grid grid-cols-3 gap-4">
        <Field label="Prep Time (min)">
          <input
            type="number"
            min={0}
            value={prepTime}
            onChange={(e) => setPrepTime(Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Cook Time (min)">
          <input
            type="number"
            min={0}
            value={cookTime}
            onChange={(e) => setCookTime(Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Servings *" error={errors.servings}>
          <input
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className={cn(inputCls, errors.servings && "border-red-500")}
          />
        </Field>
      </div>

      {/* Folder */}
      <Field label="Folder">
        <select
          value={folderId ?? ""}
          onChange={(e) => setFolderId(e.target.value || null)}
          className={cn(inputCls, "cursor-pointer")}
        >
          <option value="">— No folder —</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </Field>

      {/* Cover photo */}
      <Field label="Cover Photo">
        <div
          className="relative border-2 border-dashed border-[var(--border-strong)] rounded-lg overflow-hidden cursor-pointer hover:border-[var(--text-dim)] transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 gap-2.5">
              <Upload className="w-6 h-6 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">Click to upload a photo</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Photo is stored in cloud storage and linked to the recipe record.
        </p>
      </Field>

      {/* Ingredients */}
      <Field label="Ingredients *" error={errors.ingredients}>
        <div className="space-y-3">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Name"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                className={cn(inputCls, "flex-1")}
              />
              <input
                type="text"
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) => updateIngredient(idx, "quantity", e.target.value)}
                className={cn(inputCls, "w-20")}
              />
              <input
                type="text"
                placeholder="Unit"
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                className={cn(inputCls, "w-24")}
              />
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                disabled={ingredients.length === 1}
                className="text-[var(--text-muted)] hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add ingredient
          </button>
        </div>
      </Field>

      {/* Tags */}
      <Field label="Tags">
        <div className="flex flex-wrap gap-2 mb-2.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-full text-sm text-[var(--text-primary)]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="e.g. Vegetarian"
            className={cn(inputCls, "flex-1")}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-xl text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Add
          </button>
        </div>
      </Field>

      {/* Instructions */}
      <Field label="Instructions">
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Step-by-step instructions…"
          rows={6}
          className={cn(inputCls, "resize-none")}
        />
      </Field>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-strong)] rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
