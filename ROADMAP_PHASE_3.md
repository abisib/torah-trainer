# Torah Trainer Phase 3: Multi-Nusach Support

## Objective
Add support for multiple textual traditions:
1.  **Standard (Leningrad Codex):** Existing data.
2.  **Yemenite/Rambam (Aleppo Codex/Mamre):** New data source.

## Architecture Update
*   **Data:** JSON schema upgrade to support `versions: { standard: {...}, yemenite: {...} }`.
*   **State:** Global `currentNusach` state with `localStorage` persistence.
*   **UI:** Nusach Switcher in Header.

## Agent Tasks

### 1. The Archivist (Data Engineer) 📚
*   **Goal:** Upgrade ETL to fetch "Mechon Mamre" or "Aleppo Codex" text.
*   **Source:** Sefaria API (version specific) or Mamre resources.
    *   *Search Strategy:* Query Sefaria for versions like "Tanach with Nikkud, Mechon Mamre" or "Keter Aram Tzova".
*   **Schema Update:**
    ```json
    {
      "aliyot": [
        {
          "num": 1,
          "verses": [
            {
              "verse_num": 1,
              "targum": "...",
              "versions": {
                "standard": { "text_full": "...", "text_clean": "..." },
                "yemenite": { "text_full": "...", "text_clean": "..." }
              }
            }
          ]
        }
      ]
    }
    ```
*   **Action:** Modify `etl_pipeline.py` and regenerate all 54 files.

### 2. The Architect (State Management) 🧠
*   **Goal:** Global Nusach State.
*   **Action:**
    *   Create `src/context/SettingsContext.tsx`.
    *   State: `nusach: 'standard' | 'yemenite'`.
    *   Persistence: Save to `localStorage`.
    *   Wrap `App` with `SettingsProvider`.

### 3. The Designer (UI) 🎨
*   **Goal:** Nusach Switcher & Component Wiring.
*   **Action:**
    *   **Switcher:** Add Dropdown/Toggle in `App.tsx` Header.
    *   **Wiring:** Update `TorahView` and `TajView` to read from `verse.versions[nusach]`.
    *   **Validation:** Verify hot-swapping works.

## Execution Order
1.  **Archivist** (Python) -> Regenerate Data.
2.  **Architect** (React) -> Add State.
3.  **Designer** (React) -> Update UI components.
4.  **Deploy** to Vercel.
