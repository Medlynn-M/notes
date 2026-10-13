# AI engineering notes

Upload all five website files to the root of your existing Medlynn-M/notes repository, replacing the old index.html:

- index.html: topic selector
- langgraph.html: existing LangGraph notes and UI
- responses-api.html: matching Responses API notes and four-question quiz
- styles.css: shared navigation, diagrams, quiz, and responsive styling
- common.js: Copy buttons and quiz behavior

Keep any existing notebooks and other repository files. No build step is needed.

The GitHub repository URL displays the repository. The public notes page is https://medlynn-m.github.io/notes/ and opens the topic selector after these files are committed and GitHub Pages deploys.

The pages are static exports. Later notebook edits require updating the corresponding HTML page.

The LangGraph content preserves the saved index.html. The Responses API content uses the supplied notebook, with diagrams and presentation based on the chat screenshots.

The quiz locks each answer after the first selection, shows the right answer, provides an explanation, and tracks the first-attempt score. Reset clears all four answers.
