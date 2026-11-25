# Medly’s AI Notes

A small, responsive learning site for AI engineering notes.

**Live site:** https://medlynn-m.github.io/notes/

## Pages

- [All notes](index.html) — topic hub
- [LangGraph](langgraph.html) — workflow orchestration and state
- [Deep Agents](deepagents.html) — long-horizon agent design
- [Responses API](responses-api.html) — model interactions and tools
- [AI Harnesses](harness.html) — execution, validation, and reliability

## Shared site UI

All pages use the same site shell and shared behavior:

- Fixed responsive header with a complete topic navigation list and active-page indicator, generated from the canonical topic registry
- Reading-progress indicator anchored to the viewport below the header on topic pages
- Consistent footer with All notes and Back to top
- On topic pages: sticky study panel with search, section jump, and reading progress
- Search indexes every topic page and returns cross-module results; the section selector is populated from all page headings
- Shared copy-code and quiz behavior
- Shared responsive layout, table/code overflow handling, and reduced-motion support

The shared implementation lives in **styles.css** and **common.js**. Topic pages load versioned URLs for these assets so browser caches pick up site-wide changes.

## Repository structure

- `index.html` — topic hub
- `langgraph.html`, `deepagents.html`, `responses-api.html`, `harness.html` — topic notes
- `styles.css` — site-wide layout, navigation, study panel, quizzes, diagrams, and responsive styling
- `common.js` — canonical topic registry, shared header/footer, study controls, copy buttons, and quiz interactions
- `notebooks/` — source notebooks for the corresponding notes

## Adding a topic

To keep the site uniform when adding another note:

1. Add its HTML page and source notebook under `notebooks/`.
2. Add one entry for it to the `TOPICS` array near the top of `common.js` (file name, label, icon, card meta, description, and detail).
3. Add the page to the static navigation in each HTML page’s header and to the topic hub if you want no-JavaScript fallback. The shared script also builds the navigation and topic cards from `TOPICS`.
4. Link `styles.css` and `common.js` using the current cache-busting version query.
5. Keep the page structure as `header.site-header`, `main#main-content`, and `footer.site-footer`. Use `h3` for section headings so the section selector can discover them.
6. Check the page at laptop and phone widths, including long tables, code blocks, and quiz answer text.

The topic list in `common.js` is the canonical registry. GitHub Pages is static, so new files are not automatically discovered from the repository directory. Add each new topic there once; shared navigation, hub cards, module selection, and cross-topic search then use that registry automatically.
