Refactored the Torah Trainer UI to support Split-Screen (Side-by-Side) viewing.

Accomplished:
1.  Created `src/components/TorahView.tsx`:
    - Renders unvowelized text as a continuous block.
    - Mimics a scroll with justified text and large serif font.
    - Integrates `HintTooltip` for word-by-word hover hints.
    - Handles `{פ}` and `{ס}` markers visually.

2.  Created `src/components/TajView.tsx`:
    - Renders the full text (bold) and Targum (gray) in a list format.
    - Includes verse numbers for easy reference.

3.  Refactored `src/App.tsx`:
    - Implemented a responsive layout.
    - **Desktop (>=768px):** Split-screen with independent scrolling for Torah (Target) and Taj (Source).
    - **Mobile (<768px):** Tabbed interface with a switcher in the header.
    - Moved data loading logic to `App.tsx`.

The UI now supports effective study with side-by-side comparison on desktop and focused single-view on mobile.