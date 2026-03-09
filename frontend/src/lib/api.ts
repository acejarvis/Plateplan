import type {
  DayOfWeek,
  Folder,
  MealPlanEntry,
  MealType,
  NutritionAnalysis,
  Recipe,
  User,
  WeeklyDietSuggestion,
} from "@/types";

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

function resolveUrl(path: string): string {
  if (!configuredBaseUrl) return path;

  if (configuredBaseUrl.endsWith("/api") && path.startsWith("/api")) {
    return `${configuredBaseUrl}${path.slice(4)}`;
  }

  return `${configuredBaseUrl}${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;

  if (isRecord(payload)) {
    const error = payload.error;
    if (typeof error === "string" && error.trim()) return error;

    const message = payload.message;
    if (typeof message === "string" && message.trim()) return message;

    const details = payload.details;
    if (Array.isArray(details) && details.length > 0) {
      const first = details[0];
      if (isRecord(first) && typeof first.message === "string") {
        return first.message;
      }
    }
  }

  return fallback;
}

async function parsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers ?? undefined);
  const isFormData = init.body instanceof FormData;

  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(resolveUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload, `Request failed (${response.status})`)
    );
  }

  return payload as T;
}

function normalizeUser(rawUser: unknown): User | null {
  if (!isRecord(rawUser)) return null;

  const { id, email, name, createdAt } = rawUser;
  if (typeof id !== "string" || typeof email !== "string") return null;

  return {
    id,
    email,
    name: typeof name === "string" ? name : "",
    createdAt:
      typeof createdAt === "string"
        ? createdAt
        : new Date().toISOString(),
  };
}

function extractSessionUser(payload: unknown): User | null {
  if (!isRecord(payload)) return null;

  const directUser = normalizeUser(payload.user);
  if (directUser) return directUser;

  if (isRecord(payload.data)) {
    const fromData = normalizeUser(payload.data.user);
    if (fromData) return fromData;
  }

  if (isRecord(payload.session)) {
    const fromSession = normalizeUser(payload.session.user);
    if (fromSession) return fromSession;
  }

  return null;
}

export async function apiGetSession(): Promise<User | null> {
  const response = await fetch(resolveUrl("/api/auth/get-session"), {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const payload = await parsePayload(response);
  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload, `Session check failed (${response.status})`)
    );
  }

  return extractSessionUser(payload);
}

export async function apiSignIn(credentials: {
  email: string;
  password: string;
}): Promise<void> {
  await apiRequest<unknown>("/api/auth/sign-in/email", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function apiSignUp(credentials: {
  email: string;
  name: string;
  password: string;
}): Promise<void> {
  await apiRequest<unknown>("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function apiSignOut(): Promise<void> {
  const response = await fetch(resolveUrl("/api/auth/sign-out"), {
    method: "POST",
    credentials: "include",
  });

  if (response.ok || response.status === 401) {
    return;
  }

  const payload = await parsePayload(response);
  throw new Error(
    extractErrorMessage(payload, `Sign out failed (${response.status})`)
  );
}

export interface RecipeUpsertInput {
  title: string;
  description: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  folderId: string | null;
  imageUrl: string | null;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  tags: string[];
}

export async function apiListRecipes(params?: {
  folderId?: string | null;
  search?: string;
}): Promise<Recipe[]> {
  const query = new URLSearchParams();

  if (params?.folderId) query.set("folderId", params.folderId);
  if (params?.search?.trim()) query.set("search", params.search.trim());

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<Recipe[]>(`/api/recipes${suffix}`);
}

export async function apiGetRecipe(recipeId: string): Promise<Recipe> {
  return apiRequest<Recipe>(`/api/recipes/${recipeId}`);
}

export async function apiCreateRecipe(payload: RecipeUpsertInput): Promise<Recipe> {
  return apiRequest<Recipe>("/api/recipes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateRecipe(
  recipeId: string,
  payload: RecipeUpsertInput
): Promise<Recipe> {
  return apiRequest<Recipe>(`/api/recipes/${recipeId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteRecipe(recipeId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/recipes/${recipeId}`, {
    method: "DELETE",
  });
}

export async function apiListFolders(): Promise<Folder[]> {
  return apiRequest<Folder[]>("/api/folders");
}

export async function apiCreateFolder(payload: {
  name: string;
  color: string;
}): Promise<Folder> {
  return apiRequest<Folder>("/api/folders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUploadRecipeImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiRequest<{ url: string }>("/api/upload/recipe-image", {
    method: "POST",
    body: formData,
  });

  return response.url;
}

export interface MealPlanResponse {
  id: string;
  userId: string;
  weekStartDate: string;
  entries: MealPlanEntry[];
}

export async function apiGetMealPlan(weekStartDate: string): Promise<MealPlanResponse> {
  const query = new URLSearchParams({ week: weekStartDate });
  return apiRequest<MealPlanResponse>(`/api/meal-plans?${query.toString()}`);
}

export async function apiCreateMealPlanEntry(
  mealPlanId: string,
  payload: {
    recipeId: string;
    dayOfWeek: DayOfWeek;
    mealType: MealType;
  }
): Promise<MealPlanEntry> {
  return apiRequest<MealPlanEntry>(`/api/meal-plans/${mealPlanId}/entries`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateMealPlanEntry(
  mealPlanId: string,
  entryId: string,
  payload: {
    dayOfWeek?: DayOfWeek;
    mealType?: MealType;
  }
): Promise<MealPlanEntry> {
  return apiRequest<MealPlanEntry>(
    `/api/meal-plans/${mealPlanId}/entries/${entryId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function apiDeleteMealPlanEntry(
  mealPlanId: string,
  entryId: string
): Promise<void> {
  await apiRequest<{ success: boolean }>(
    `/api/meal-plans/${mealPlanId}/entries/${entryId}`,
    {
      method: "DELETE",
    }
  );
}

export async function apiGetNutritionAnalysis(
  recipeId: string
): Promise<NutritionAnalysis> {
  return apiRequest<NutritionAnalysis>(
    `/api/recipes/${recipeId}/nutrition-analysis`,
    {
      method: "POST",
    }
  );
}

export async function apiGetMealPlanDietSuggestions(
  mealPlanId: string
): Promise<WeeklyDietSuggestion> {
  return apiRequest<WeeklyDietSuggestion>(
    `/api/meal-plans/${mealPlanId}/diet-suggestions`,
    {
      method: "POST",
    }
  );
}
