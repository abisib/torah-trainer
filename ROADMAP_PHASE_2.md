# Project Phase 2: Alpha Release - "Full Torah Architecture"

## Master Objective
Scale the MVP into a fully functional application capable of navigating and rendering the entire Torah (5 Books, 54 Parashot).

## Architecture & Constraints
*   **Routing:** `react-router-dom` (/, /book/:bookId, /read/:parashaId).
*   **State:** Global store (Context/Zustand) for navigation state.
*   **Performance:** Lazy loading. **DO NOT** bundle full text. Fetch JSONs on demand.

## Agent Task Assignments

### 1. The "Archivist" Agent (Data Engineering) 📚
*   **Goal:** Build ETL pipeline to generate the static API.
*   **Outputs:**
    *   `public/data/manifest.json`: Tree structure (Books -> Parashot -> Meta).
    *   `public/data/parashot/*.json`: Individual JSON files for each Parasha (54 files).
*   **Process:**
    *   Iterate all 54 Parashot via Sefaria API.
    *   Fetch Hebrew (Voweled), Clean (Stripped), Targum Onkelos.
    *   *Bonus:* Group by Aliyah if data available.

### 2. The "Architect" Agent (Core System) 🏗️
*   **Goal:** Routing & Data Layer.
*   **Tasks:**
    *   Install `react-router-dom`.
    *   **Routes:**
        *   `/` (Home): Book Selector.
        *   `/book/:bookId`: Parasha Selector.
        *   `/read/:parashaId`: The Trainer View.
    *   **Hook:** `useTorahData(parashaId)` -> fetches `/data/parashot/{id}.json`.

### 3. The "Designer" Agent (UI/UX) 🎨
*   **Goal:** Visuals & Navigation.
*   **Tasks:**
    *   **Home:** 5 Cards for Books (Bereshit, Shemot, etc.).
    *   **List:** Clean Parasha list.
    *   **Torah CSS:** Implement `text-align: justify;` to mimic scroll columns.
    *   **Nav:** Next/Prev Parasha buttons.

## Execution Strategy
1.  **Archivist:** Generate the data files first.
2.  **Architect:** Build the routing skeleton.
3.  **Designer:** Polish the UI and connect the views.
