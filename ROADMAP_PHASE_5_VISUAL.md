# Torah Trainer Phase 5: The "Sefer Torah" Visual Transformation

## Objective
Transform the Tikun (Clean Text) view into an authentic "Torah Scroll Column" simulation.

## Tasks

### 1. The Designer (CSS Overhaul) 🎨
*   **Target:** `TorahView.tsx`
*   **Font:** 'Frank Ruhl Libre' (700 Bold).
*   **Layout Rules:**
    *   `text-align: justify` (Force strict alignment).
    *   `text-align-last: justify` (Stretch the last line to the edge).
    *   `line-height: 1.4` (Tighter density).
    *   `max-width: 450px` (Simulate column width).
    *   `margin: 0 auto` (Center the column).
    *   `direction: rtl`.

## Execution Order
1.  **Designer:** Apply the CSS rules to `TorahView.tsx`.
2.  **Deploy:** Push to Vercel.
