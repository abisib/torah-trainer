# Yemenite Taj & Torah Trainer (MVP)

## Objective
Build a responsive web application (React + Vite) that allows users to practice reading the Torah according to the Yemenite tradition.

## Views
1.  **"Torah Mode" (Tikun):** Hebrew text without vowels (Nikud) or cantillation (Teamim).
2.  **"Taj Mode" (Study):** Full text with vowels, cantillation, and Aramaic translation (Targum Onkelos) verse by verse.

## Tech Stack
*   **Frontend:** React (Vite), TypeScript
*   **Styling:** Tailwind CSS
*   **Fonts:** Google Fonts ('Frank Ruhl Libre' or 'Noto Serif Hebrew')
*   **Data:** Sefaria API (Exodus 15)

## Roles & Tasks

### 1. Data Engineer Agent 🐍
*   File: `fetch_data.py`
*   Source: Sefaria API (Exodus 15 - Shirat HaYam).
*   Process:
    *   Fetch Hebrew (with vowels).
    *   Fetch Targum Onkelos (Aramaic).
    *   Regex Clean: Strip `\u0591-\u05C7` for the "Clean" version.
    *   Merge into JSON.
*   Output: `src/data/shirat_hayam.json`.

### 2. Frontend Architect Agent 🏗️
*   Setup: `npm create vite@latest . -- --template react-ts` inside `workspace/torah_trainer`.
*   Config: Tailwind CSS, `dir="rtl"` in `index.html`.
*   Layout: Centered global container, responsive.

### 3. UI Component Agent 🎨
*   `TorahView.tsx`: Clean text, large serif font, wrapping.
*   `TajView.tsx`: Full text (Bold) + Targum (Gray/Smaller) per verse.

### 4. Logic & Integration Agent 🧠
*   `App.tsx`:
    *   Load JSON.
    *   **Mobile (<768px):** Tab toggle [Torah | Taj].
    *   **Desktop (>=768px):** Split screen (Right: Taj, Left: Torah).
*   **Hint Mode:** Hover/Click on clean word in TorahView shows tooltip with Nikud.

## Deployment
*   Target: Vercel.
