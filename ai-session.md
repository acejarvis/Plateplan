## Session 1: Auth Session Flow

### Problem We Wanted to Solve
Users could log in, but after refresh the app sometimes lost auth state.

### How AI Helped
AI helped us narrow the issue to session rehydration and cookie request settings. The useful part was not "new auth logic", but getting the existing cookie flow connected correctly across frontend and backend.

Key ideas we took:

- run a session check when the app starts,
- include credentials in frontend API calls,
- make sure backend CORS allows credentialed requests from the frontend origin.

### What We Actually Applied
- Added session check during app bootstrap.
- Kept cookie-based auth and did not use localStorage tokens.
- Updated API calls to always send credentials.
- Aligned backend CORS and trusted origin settings with frontend URL.
- Verified with manual flow:
	- login -> refresh stays logged in,
	- direct navigation to protected routes works only with valid session,
	- logout -> refresh redirects to login.

---

## Session 2: Meal Planner Data Model

### Problem We Wanted to Solve
We needed a clean way to store drag-and-drop weekly meal plans without messy frontend-only state.

### How AI Helped
AI suggested splitting the model into a weekly plan header plus entry rows. This was useful because it matches how the UI works:

- `meal_plan` stores one record per user per week (`userId + weekStartDate`).
- `meal_plan_entry` stores each actual slot assignment (`dayOfWeek`, `mealType`, `recipeId`).

So instead of saving temporary drag state, we only save final slot results.

### What We Actually Applied
- Implemented `meal_plan` + `meal_plan_entry` schema design.
- Added endpoints for get/upsert week, create entry, move entry, and delete entry.
- Used week upsert so the frontend can always request a week and get a valid plan object (whether it existed before or not).
- Connected drag-and-drop events directly to API calls:
	- drop from recipe list -> create entry
	- move existing card -> patch entry (day/meal)
	- remove card -> delete entry
- Verified by testing add/move/delete behavior across multiple weeks and refreshing the page to confirm persistence.

---

## Session 3: OpenAI Output Format for UI

### Problem We Wanted to Solve
AI nutrition results were difficult to render reliably when output format varied.

### How AI Helped
AI suggested forcing a strict JSON shape with explicit fields and parsing responses server-side before returning to the frontend. This was helpful because the frontend panels depend on stable keys and value types.

Key ideas we kept:

- request JSON-only output,
- define exact required fields in prompts,
- parse and validate response shape on backend before sending it to UI.

### What We Actually Applied
- Defined fixed JSON fields for recipe analysis and weekly suggestions.
- Rejected markdown-style output to avoid parsing issues.
- Added backend handling for missing/empty AI response content.
- Verified with repeated calls on different recipes and weekly plans.
- Confirmed frontend panels render consistently without schema mismatch errors.
