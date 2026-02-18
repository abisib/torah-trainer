# Torah Trainer (מאמן קריאה בתורה)

A specialized web application for studying Torah reading (Kriat HaTorah), designed to simulate the authentic experience of reading from a scroll while providing advanced study tools for both **Ashkenazi** and **Yemenite** traditions.

**Live Demo:** [torahtrainer.vercel.app](https://torahtrainer-fd4vjryse-itamars-projects-37cdb905.vercel.app/)

## 🚀 Key Features

### 1. Dual-Nusach Support
*   **Standard (General/Ashkenaz):** Uses the Leningrad Codex text with standard cantillation.
*   **Yemenite (Teiman):** Uses the *Miqra according to the Masorah* (Aleppo Codex tradition) with distinct Yemenite cantillation and pronunciation rules.
*   **Dynamic Toggling:** Instantly switch between traditions to compare texts.

### 2. Specialized Viewing Modes
*   **Tikun (Practice Mode):** Simulates a real Torah scroll. Unvoweled, unpunctuated text displayed in authentic "Stam" font columns.
*   **Taj (Source Mode):** The full text with Vowels (Nikkud) and Cantillation (Te'amim) for study. Includes **Targum Onkelos** (or Targum Jonathan for Haftarah).
*   **Combined (Interlinear):** A study-focused view stacking three layers per verse:
    1.  **Taj:** Source text (Frank Ruhl Libre font).
    2.  **Tikun:** Practice text (Stam font).
    3.  **Targum:** Aramaic translation.

### 3. Authentic Typography
*   **Custom Fonts:** Implements specialized WOFF fonts (`StamAshkenazCLM` and `StamSefaradCLM`) to render correct Tagim (crowns) on letters according to halachic scribal traditions.
*   **Font Switching:** Users can manually toggle the display font for the Tikun view.

### 4. Smart Navigation
*   **Parasha Index:** Grid-based home screen for selecting any of the 54 Parashot.
*   **Aliyah Jump:** Dropdown menu to jump instantly to any Aliyah (Rishon, Sheni... Maftir, Haftarah).
*   **Haftarah System:** Automatically fetches the correct Haftarah for the selected Parasha and Nusach (handling Yemenite override traditions).

### 5. Mobile-First & PWA
*   **Responsive:** optimized for mobile screens with a sticky glassmorphism header and side-drawer settings.
*   **Progressive Web App:** Installable as a standalone app on iOS/Android (manifest.webmanifest configured).
*   **Touch Friendly:** Haptic feedback simulation (ready for native wrapper).

## 🏗 Architecture

### Tech Stack
*   **Framework:** React 18 + Vite + TypeScript.
*   **Styling:** Tailwind CSS (v4).
*   **Routing:** React Router v6.
*   **State:** React Context API (`SettingsContext`) for global preferences (Nusach, Font).
*   **Deployment:** Vercel (CI/CD).

### Data Pipeline (`etl_pipeline.py`)
The application does **not** rely on live API calls to Sefaria for performance and reliability reasons. Instead, a custom Python ETL (Extract, Transform, Load) pipeline pre-generates static JSON files for every Parasha.

1.  **Extraction:** Fetches raw text (Standard, Yemenite, Targum) from the [Sefaria API](https://www.sefaria.org).
2.  **Transformation:**
    *   **Cleaning:** Generates the "Tikun" text by stripping vowels, tropes, and punctuation while preserving Maqqefs (hyphens) for correct word spacing.
    *   **Structure:** Parses Sefaria's deep nesting to flatten verses and assign accurate Chapter/Verse numbers.
    *   **Overrides:** Applies manual structural overrides for Yemenite traditions (e.g., different Aliyah breaks in Parashat Korach).
    *   **Haftarah:** Fetches the specific Haftarah range (mapped via `data/haftara_map.json`) and appends it as the 8th/9th reading section.
3.  **Loading:** Saves optimized JSON files to `public/data/parashot/`. The app loads these instantly on demand.

### Project Structure
```
workspace/torah_trainer/
├── etl_pipeline.py          # The Data Generator (Python)
├── public/
│   ├── data/
│   │   ├── manifest.json    # List of all Books/Parashot
│   │   └── parashot/        # Static JSONs (e.g. bereshis.json)
│   └── icons/               # PWA Icons
├── src/
│   ├── components/          # React Components (Trainer, Views, etc.)
│   ├── contexts/            # Global State (SettingsContext)
│   ├── hooks/               # Data fetching hooks
│   ├── utils/               # Helpers (Hebrew Numerals, etc.)
│   ├── App.tsx              # Main Entry
│   └── index.css            # Global Styles & Fonts
└── capacitor.config.ts      # Native Mobile Config
```

## 🛠 Setup & Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

3.  **Regenerate Data (Optional):**
    If you modify the pipeline logic:
    ```bash
    # Requires Python 3
    source venv/bin/activate
    python3 etl_pipeline.py
    ```

4.  **Build for Production:**
    ```bash
    npm run build
    ```

## 📜 License
Private Project. Data sourced from Sefaria (CC-BY-SA). Fonts (Stam CLM) used under Open Font License.
