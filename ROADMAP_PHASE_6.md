# Torah Trainer Phase 6: Authenticity Polish

## Objective
Remove "digital artifacts" (punctuation, markers) to create a kosher Sefer Torah simulation.

## Tasks

### 1. The Archivist (Data Purification) 🧹
*   **File:** `etl_pipeline.py`
*   **Update `clean_text` logic:**
    1.  **Strip Punctuation:** Remove `:`, `-`, `.`, and `׃` (Sof Pasuq).
    2.  **Structural Markers:**
        *   Replace `{פ}` / `(פ)` with `\n` (Newline - Petuhah).
        *   Replace `{ס}` / `(ס)` with `         ` (9 spaces - Setumah/Gap).
    3.  **Strict Filter:** Ensure no stray letters like `פ` or `ס` remain.

### 2. The Designer (Visual Feel) 🎨
*   **File:** `TorahView.tsx`
*   **Density:** Reduce `line-height` to `1.3`.
*   **Atmosphere:** Background color `#fcf5e5` (Darker Parchment).
*   **Styling:**
    *   Ensure `white-space: pre-wrap` allows the gaps/newlines from data to render correctly.
    *   (Optional) First word logic? (Might be complex with current chunking, skip for now).

### 3. Execution
1.  **Archivist:** Regenerate Data.
2.  **Designer:** Update CSS.
3.  **Deploy.**
