# Torah Trainer Phase 4: Visual Transformation (Scroll Simulation)

## Objective
Transform the "Tikun" (Torah) view from a text block into a realistic **Torah Scroll simulation**.

## Requirements
*   **Typography:** Use a STAM-like font (heavy serif).
*   **Cleanliness:** Remove verse separators (`|`).
*   **Layout:** Strict Justification (Left & Right alignment).
*   **Pagination:** Split continuous text into "Columns" (Pages) instead of vertical scroll.
*   **Navigation:** Arrow keys + UI buttons to flip columns.

## Agent Tasks

### 1. The Designer (Typography & Cleanup) 🎨
*   **File:** `src/components/TorahView.tsx`
*   **Font:** Enforce `'Frank Ruhl Libre', serif` with `font-weight: 700` (or similar STAM look).
*   **Size:** Increase to `26px` (or scaled rem).
*   **Data Prep:** Implement a filter to strip `|` characters from the displayed text.

### 2. The Architect (Column Layout Engine) 🏗️
*   **Goal:** Columnar Pagination.
*   **Algorithm:**
    *   Calculate "Words per Column" (approx 350-400 words) or strict line count if possible.
    *   Split the current Aliyah's text into `chunks[]`.
    *   State: `currentColumnIndex`.
*   **CSS:**
    *   `text-align: justify;`
    *   `text-align-last: justify;` (Force full width even on last line, or handle gracefully).
    *   Fixed `height` and `width` container to mimic parchment column.

### 3. The Integrator (UX & Wiring) 🧠
*   **Task:** Controls.
*   **UI:** Add `< Prev` and `Next >` buttons overlaying or flanking the text column.
*   **Keyboard:** Bind `ArrowLeft` / `ArrowRight` to pagination.
*   **Mobile:** Ensure swipe or simple tap navigation works.

## Execution Order
1.  **Designer** updates CSS and cleaning logic.
2.  **Architect** implements the chunking/pagination logic in `TorahView`.
3.  **Integrator** adds the controls.
4.  **Deploy**.
