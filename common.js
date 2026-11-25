/* Shared site behavior for Medly's AI Notes. */
(() => {
  'use strict';

  const TOPICS = [
    { file: 'index.html', label: 'All notes' },
    { file: 'langgraph.html', label: 'LangGraph', icon: '🔗', meta: 'WORKFLOW & ORCHESTRATION', description: 'Nodes, state, branching, memory, retries, and recovery. Understand how to coordinate an AI workflow.', detail: '26 sections' },
    { file: 'deepagents.html', label: 'Deep Agents', icon: '🧠', meta: 'AGENT HARNESS & LONG-HORIZON WORK', description: 'Planning, execution environments, context management, delegation, and managed agents. Learn how to build agents for complex multi-step tasks.', detail: '6 modules · Course notes' },
    { file: 'responses-api.html', label: 'Responses API', icon: '🔄', meta: 'MODEL INTERACTIONS & TOOLS', description: 'Model calls, tool execution, structured outputs, conversation continuity, and production trade-offs.', detail: '12 sections · Interactive quiz' },
    { file: 'harness.html', label: 'Harness', icon: '⚙️', meta: 'EXECUTION & RELIABILITY', description: 'Context, tools, state, validation, recovery, and controls. Follow a complete email extraction example from input to saved result.', detail: '16 sections · Python example · Quiz' }
  ];

  const fileFromPath = () => {
    const last = window.location.pathname.split('/').filter(Boolean).pop() || '';
    return last.endsWith('.html') ? last : 'index.html';
  };
  const currentFile = fileFromPath();

  function buildTopicLink(topic) {
    const link = document.createElement('a');
    link.href = topic.file;
    link.textContent = topic.label;
    if (topic.file === currentFile) link.setAttribute('aria-current', 'page');
    return link;
  }

  function normalizeHeader() {
    let header = document.querySelector('.site-header');
    if (!header) {
      header = document.createElement('header');
      header.className = 'site-header';
      document.body.insertBefore(header, document.body.firstChild);
    }

    let brand = header.querySelector('.site-brand');
    if (!brand) {
      brand = document.createElement('a');
      brand.className = 'site-brand';
      header.appendChild(brand);
    }
    brand.href = 'index.html';
    brand.innerHTML = 'Medly’s AI Notes <span>Learning, one concept at a time.</span>';

    let nav = header.querySelector('nav');
    if (!nav) {
      nav = document.createElement('nav');
      header.appendChild(nav);
    }
    nav.setAttribute('aria-label', 'Notes navigation');
    nav.replaceChildren(...TOPICS.map(buildTopicLink));
  }

  function normalizeFooter(main) {
    let footer = document.querySelector('.site-footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.className = 'site-footer';
      if (main) main.insertAdjacentElement('afterend', footer);
      else document.body.appendChild(footer);
    }
    footer.replaceChildren();
    const allNotes = document.createElement('a');
    allNotes.href = 'index.html';
    allNotes.textContent = '← All notes';
    const top = document.createElement('a');
    top.href = '#top';
    top.textContent = 'Back to top ↑';
    footer.append(allNotes, top);
  }

  function normalizeTopicCards() {
    const grid = document.querySelector('.topic-grid');
    if (!grid) return;
    const cards = TOPICS.filter(topic => topic.file !== 'index.html').map(topic => {
      const card = document.createElement('a');
      card.className = 'topic-card';
      card.href = topic.file;

      const icon = document.createElement('span');
      icon.className = 'topic-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = topic.icon;
      const meta = document.createElement('span');
      meta.className = 'topic-meta';
      meta.textContent = topic.meta;
      const title = document.createElement('h2');
      title.textContent = topic.label === 'Harness' ? 'AI Harnesses' : topic.label;
      const description = document.createElement('p');
      description.textContent = topic.description;
      const footer = document.createElement('span');
      footer.className = 'topic-footer';
      const detail = document.createElement('span');
      detail.textContent = topic.detail;
      const action = document.createElement('span');
      action.textContent = 'Read the notes →';
      footer.append(detail, action);
      card.append(icon, meta, title, description, footer);
      return card;
    });
    grid.replaceChildren(...cards);
  }

  function createStudyPanel(header, main) {
    if (currentFile === 'index.html') return null;

    // Remove the old Deep Agents-only panel. Every topic page now uses one shared panel.
    document.querySelectorAll('.da-learning-bar, .study-panel').forEach(panel => panel.remove());

    const panel = document.createElement('section');
    panel.className = 'study-panel';
    panel.setAttribute('aria-label', 'Notes study controls');
    panel.innerHTML = `
      <div class="study-top">
        <div class="study-heading">
          <div class="study-kicker">NOTES · STUDY MODE</div>
          <div class="study-title">Navigate the course notes</div>
        </div>
        <div class="study-controls">
          <input class="study-search" type="search" placeholder="Search notes…" aria-label="Search note content">
          <select class="study-jump" aria-label="Jump to a section">
            <option value="">Jump to a section…</option>
          </select>
        </div>
      </div>
      <div class="study-progress">
        <span class="study-progress-label">Reading progress · 0%</span>
        <div class="study-progress-track" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="study-progress-fill"></div>
        </div>
      </div>
      <div class="study-status" aria-live="polite">Search highlights matching sections. Clear the search to return to the full page.</div>`;
    if (header) header.insertAdjacentElement('afterend', panel);
    else if (main) main.insertAdjacentElement('beforebegin', panel);
    return panel;
  }

  function initializeStudyPanel(panel, main) {
    if (!panel || !main) return;
    const search = panel.querySelector('.study-search');
    const jump = panel.querySelector('.study-jump');
    const status = panel.querySelector('.study-status');
    const progressLabel = panel.querySelector('.study-progress-label');
    const progressFill = panel.querySelector('.study-progress-fill');
    const progressTrack = panel.querySelector('.study-progress-track');
    if (!search || !jump || !progressLabel || !progressFill || !progressTrack) return;

    const headings = [...main.querySelectorAll('h3')]
      .filter(heading => !heading.closest('.quiz, #knowledge-check'))
      .filter(heading => heading.textContent.replace(/¶/g, '').trim());
    jump.replaceChildren(new Option('Jump to a section…', ''));
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = 'study-section-' + (index + 1);
      const option = new Option(heading.textContent.replace(/¶/g, '').trim(), heading.id);
      jump.add(option);
    });
    jump.addEventListener('change', () => {
      const target = jump.value ? document.getElementById(jump.value) : null;
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const blocks = [...main.querySelectorAll('.jp-Cell')];
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase();
      let matches = 0;
      blocks.forEach(block => {
        block.classList.remove('study-search-hit', 'study-search-muted');
        if (!query) return;
        const hit = block.textContent.toLocaleLowerCase().includes(query);
        block.classList.add(hit ? 'study-search-hit' : 'study-search-muted');
        if (hit) matches++;
      });
      if (status) {
        status.textContent = query
          ? (matches ? matches + ' matching section(s) highlighted. Use the selector to jump.' : 'No matching content found. Try another term.')
          : 'Search highlights matching sections. Clear the search to return to the full page.';
      }
    });

    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const percent = maxScroll ? Math.min(100, Math.max(0, Math.round(window.scrollY / maxScroll * 100))) : 100;
        progressFill.style.width = percent + '%';
        progressLabel.textContent = 'Reading progress · ' + percent + '%';
        progressTrack.setAttribute('aria-valuenow', String(percent));
      });
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(updateProgress);
      observer.observe(main);
    }
    window.addEventListener('load', updateProgress, { once: true });
    updateProgress();
  }

  function initializeCopyButtons() {
    document.addEventListener('click', async event => {
      const button = event.target.closest('.copy-code');
      if (!button) return;
      const code = button.closest('.notes-code')?.querySelector('code');
      if (!code) return;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(code.textContent);
        } else {
          const field = document.createElement('textarea');
          field.value = code.textContent;
          field.style.position = 'fixed';
          field.style.opacity = '0';
          document.body.appendChild(field);
          field.select();
          const copied = document.execCommand('copy');
          field.remove();
          if (!copied) throw new Error('Copy unavailable');
        }
        button.textContent = 'Copied!';
      } catch (_) {
        button.textContent = 'Select to copy';
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      window.setTimeout(() => { button.textContent = 'Copy'; }, 2000);
    });
  }

  function initializeQuiz() {
    const quiz = document.getElementById('knowledge-check');
    if (!quiz || quiz.dataset.initialized === 'true') return;
    quiz.dataset.initialized = 'true';

    const questions = [...quiz.querySelectorAll('.quiz-question')];
    const reset = quiz.querySelector('#reset-quiz');
    const progress = quiz.querySelector('#quiz-progress');
    const meter = quiz.querySelector('#quiz-meter');
    const summary = quiz.querySelector('#quiz-summary');
    const responses = new Map();

    function updateScore() {
      const score = [...responses.values()].filter(Boolean).length;
      if (progress) progress.textContent = `${responses.size} of ${questions.length} answered · Score: ${score} / ${questions.length}`;
      if (meter) { meter.max = questions.length; meter.value = responses.size; }
      if (summary) {
        summary.textContent = responses.size === questions.length
          ? (score === questions.length ? '🎉 All correct! You’ve understood the key ideas.' : `You scored ${score} / ${questions.length}. Review the explanations, then reset to try again.`)
          : '';
      }
    }

    questions.forEach((question, index) => {
      const options = [...question.querySelectorAll('.quiz-option')];
      options.forEach(button => button.addEventListener('click', () => {
        if (responses.has(index)) return;
        const answer = Number(question.dataset.answer);
        const choice = Number(button.dataset.choice);
        if (!Number.isFinite(answer) || !Number.isFinite(choice)) return;
        const correct = answer === choice;
        responses.set(index, correct);
        options.forEach((option, optionIndex) => {
          option.disabled = true;
          const result = option.querySelector('.option-result');
          if (optionIndex === answer) {
            option.classList.add('correct');
            if (result) result.textContent = '✓ Correct answer';
          } else if (optionIndex === choice) {
            option.classList.add('incorrect');
            if (result) result.textContent = '✕ Your answer';
          }
        });
        const feedback = question.querySelector('.quiz-feedback');
        if (feedback) {
          feedback.classList.add(correct ? 'good' : 'bad');
          feedback.textContent = (correct ? '✓ Correct. ' : '✕ Incorrect. The correct answer is highlighted above. ') + (feedback.dataset.explanation || '');
        }
        updateScore();
      }));
    });

    if (reset) reset.addEventListener('click', () => {
      responses.clear();
      questions.forEach(question => {
        question.querySelectorAll('.quiz-option').forEach(option => {
          option.disabled = false;
          option.classList.remove('correct', 'incorrect');
          const result = option.querySelector('.option-result');
          if (result) result.textContent = '';
        });
        const feedback = question.querySelector('.quiz-feedback');
        if (feedback) { feedback.textContent = ''; feedback.classList.remove('good', 'bad'); }
      });
      updateScore();
    });
    updateScore();
  }

  const main = document.querySelector('#main-content');
  normalizeHeader();
  normalizeTopicCards();
  normalizeFooter(main);
  const header = document.querySelector('.site-header');
  const panel = createStudyPanel(header, main);
  initializeStudyPanel(panel, main);
  initializeCopyButtons();
  initializeQuiz();
})();
