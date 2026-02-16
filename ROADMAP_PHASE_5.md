# Torah Trainer Phase 5: The "Perfect Column" Fix

## Objective
Fix the "glued words" issue and perfect the visual "Stam" (Torah Scroll) look.

## Tasks

### 1. The Archivist (Data Fix) 🛠️
*   **Problem:** Words are glued together (e.g., `בראשיתברא`).
*   **Fix:**
    *   Update `etl_pipeline.py`.
    *   Ensure spaces are preserved during cleaning.
    *   Replace `|` with ` ` (space) instead of removing it.
    *   Replace non-breaking spaces (`\xa0`) with standard spaces.
*   **Action:** Regenerate all 54 JSON files.

### 2. The Designer (The "Stam" Look) 🎨
*   **Typography:** Confirm "Frank Ruhl Libre" (Weight 700/900).
*   **Layout:** Strict Justification.
    *   `text-align: justify;`
    *   `text-align-last: justify;` (or `right` if `justify` looks bad on short lines).
    *   `direction: rtl;`
*   **Cleanup:** Filter out `()` `[]` `{}` visually in React if they persist in data (though Archivist should handle most).

## Execution Order
1.  **Archivist:** Regenerate data.
2.  **Designer:** Verify/Tweak CSS.
3.  **Deploy.**
