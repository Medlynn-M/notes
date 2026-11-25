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

    header.id = 'top';
    header.classList.add('site-header-sticky');

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
    let progress = header.querySelector('.site-reading-progress');
    if (currentFile !== 'index.html') {
      if (!progress) {
        progress = document.createElement('div');
        progress.className = 'site-reading-progress';
        progress.setAttribute('role', 'progressbar');
        progress.setAttribute('aria-label', 'Reading progress');
        progress.setAttribute('aria-valuemin', '0');
        progress.setAttribute('aria-valuemax', '100');
        progress.setAttribute('aria-valuenow', '0');
        progress.innerHTML = '<span></span>';
        header.appendChild(progress);
      }
    } else if (progress) {
      progress.remove();
    }
  }

  function setupFixedHeader(header) {
    if (!header) return;
    let spacer = header.nextElementSibling;
    if (!spacer || !spacer.classList.contains('site-header-spacer')) {
      spacer = document.createElement('div');
      spacer.className = 'site-header-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      header.insertAdjacentElement('afterend', spacer);
    }

    const syncSpacer = () => {
      const styles = window.getComputedStyle(header);
      const gap = parseFloat(styles.getPropertyValue('--site-header-flow-gap')) || 0;
      const height = header.getBoundingClientRect().height + gap;
      spacer.style.height = height + 'px';
      document.documentElement.style.setProperty('--site-header-offset', height + 'px');
    };
    syncSpacer();
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(syncSpacer);
      observer.observe(header);
      header.siteHeaderResizeObserver = observer;
    }
    window.addEventListener('resize', syncSpacer, { passive: true });
  }

  function normalizeFooter(main) {
    if (currentFile === 'index.html') {
      document.querySelectorAll('.site-footer').forEach(footer => footer.remove());
      return;
    }
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
    document.querySelectorAll('.da-learning-bar, .study-panel').forEach(panel => panel.remove());
    if (currentFile === 'index.html') return null;
    const panel = document.createElement('section');
    panel.className = 'study-panel';
    panel.setAttribute('aria-label', 'Search and section navigation');
    panel.innerHTML =
      '<div class="study-controls">' +
        '<input class="study-search" type="search" placeholder="Search all notes…" aria-label="Search all note content" autocomplete="off">' +
        '<select class="study-jump" aria-label="Jump to a section">' +
          '<option value="">Jump to a section…</option>' +
        '</select>' +
      '</div>' +
      '<div class="study-status" aria-live="polite" hidden></div>' +
      '<div class="study-results" aria-label="Search results" hidden></div>';
    if (header) {
      const spacer = header.nextElementSibling;
      if (spacer && spacer.classList.contains('site-header-spacer')) spacer.insertAdjacentElement('afterend', panel);
      else header.insertAdjacentElement('afterend', panel);
    } else if (main) main.insertAdjacentElement('beforebegin', panel);
    return panel;
  }

  function slugify(text) {
    return text.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'section';
  }

  function prepareNavigationIds(main) {
    if (!main) return [];
    const headings = [...main.querySelectorAll('h2,h3,h4')]
      .filter(heading => !heading.closest('.quiz, #knowledge-check'))
      .filter(heading => heading.textContent.replace(/¶/g, '').trim());
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = 'notes-' + slugify(heading.textContent.replace(/¶/g, '').trim()) + '-' + (index + 1);
    });
    [...main.querySelectorAll('.jp-Cell')].forEach((cell, index) => {
      if (!cell.id) cell.id = 'note-cell-' + (index + 1);
    });
    return headings;
  }

  let searchDocumentsPromise = null;

  async function loadSearchDocuments() {
    if (searchDocumentsPromise) return searchDocumentsPromise;
    searchDocumentsPromise = Promise.all(TOPICS.filter(topic => topic.file !== 'index.html').map(async topic => {
      const response = await fetch(topic.file, { cache: 'force-cache' });
      if (!response.ok) throw new Error('Unable to load ' + topic.label);
      const html = await response.text();
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const pageMain = parsed.querySelector('#main-content') || parsed.body;
      const headings = prepareNavigationIds(pageMain);
      const cells = [...pageMain.querySelectorAll('.jp-Cell')];
      const searchable = cells.length ? cells : [...pageMain.children];
      const records = searchable.map((cell, index) => {
        const text = (cell.innerText || cell.textContent || '').replace(/\s+/g, ' ').trim();
        if (!cell.id) cell.id = 'note-cell-' + (index + 1);
        let heading = cell.querySelector('h2,h3,h4');
        if (!heading) {
          heading = headings.filter(item => item.compareDocumentPosition(cell) & Node.DOCUMENT_POSITION_FOLLOWING).pop() || null;
        }
        return {
          topic: topic,
          text: text,
          href: topic.file + '#' + (heading ? heading.id : cell.id),
          heading: heading ? heading.textContent.replace(/¶/g, '').trim() : topic.label
        };
      }).filter(record => record.text.length > 0);
      return { topic: topic, records: records };
    }));
    return searchDocumentsPromise;
  }

  function renderSearchResults(container, matches, query) {
    container.replaceChildren();
    container.hidden = !query;
    if (!query) return;
    const shown = matches.slice(0, 30);
    if (!shown.length) {
      const empty = document.createElement('p');
      empty.className = 'study-result-empty';
      empty.textContent = 'No matching notes found. Try a broader keyword.';
      container.appendChild(empty);
      return;
    }
    shown.forEach(match => {
      const link = document.createElement('a');
      link.className = 'study-result';
      link.href = match.href;
      const title = document.createElement('strong');
      title.textContent = match.topic.label + ' · ' + match.heading;
      const snippet = document.createElement('span');
      const position = match.text.toLocaleLowerCase().indexOf(query);
      const start = Math.max(0, position - 65);
      snippet.textContent = (start ? '…' : '') + match.text.slice(start, Math.min(match.text.length, position + query.length + 110)) + (position + query.length + 110 < match.text.length ? '…' : '');
      link.append(title, snippet);
      container.appendChild(link);
    });
    if (matches.length > shown.length) {
      const more = document.createElement('p');
      more.className = 'study-result-count';
      more.textContent = 'Showing ' + shown.length + ' of ' + matches.length + ' matches.';
      container.appendChild(more);
    }
  }

  function initializeStudyPanel(panel, main) {
    if (!panel || !main) return;
    const search = panel.querySelector('.study-search');
    const jump = panel.querySelector('.study-jump');
    const status = panel.querySelector('.study-status');
    const results = panel.querySelector('.study-results');
    const isHub = currentFile === 'index.html';
    if (!panel) return;
    if (!search || !jump || !status || !results) return;

    if (isHub) {
      TOPICS.filter(topic => topic.file !== 'index.html').forEach(topic => {
        jump.add(new Option(topic.label, topic.file));
      });
      jump.addEventListener('change', () => {
        if (jump.value) window.location.href = jump.value;
      });
    } else {
      const headings = prepareNavigationIds(main);
      jump.replaceChildren(new Option('Jump to a section…', ''));
      headings.forEach(heading => {
        const depth = Math.max(0, Number(heading.tagName.slice(1)) - 2);
        const label = (depth ? '　'.repeat(depth) + '↳ ' : '') + heading.textContent.replace(/¶/g, '').trim();
        jump.add(new Option(label, heading.id));
      });
      jump.addEventListener('change', () => {
        const target = jump.value ? document.getElementById(jump.value) : null;
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const localCells = [...main.querySelectorAll('.jp-Cell')];
    let searchTimer = 0;
    search.addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(async () => {
        const query = search.value.trim().toLocaleLowerCase();
        localCells.forEach(cell => {
          cell.classList.remove('study-search-hit', 'study-search-muted');
          if (!query) return;
          const hit = (cell.innerText || cell.textContent || '').toLocaleLowerCase().includes(query);
          cell.classList.add(hit ? 'study-search-hit' : 'study-search-muted');
        });
        if (!query) {
          results.replaceChildren();
          results.hidden = true;
          status.textContent = '';
          status.hidden = true;
          return;
        }
        status.hidden = false;
        status.textContent = 'Searching all notes…';
        try {
          const documents = await loadSearchDocuments();
          const matches = [];
          documents.forEach(document => document.records.forEach(record => {
            if (record.text.toLocaleLowerCase().includes(query)) {
              matches.push({
                topic: document.topic,
                heading: record.heading,
                href: record.href,
                text: record.text
              });
            }
          }));
          renderSearchResults(results, matches, query);
          status.hidden = false;
          status.textContent = matches.length
            ? matches.length + ' matching note block(s) across ' + documents.length + ' modules. Select a result to open it.'
            : 'No matching notes found. Try a broader keyword.';
        } catch (error) {
          results.replaceChildren();
          results.hidden = true;
          status.hidden = false;
          status.textContent = 'Search could not load every notes page. Check your connection and try again.';
        }
      }, 160);
    });

    if (!isHub) {
      const progressTrack = document.querySelector('.site-reading-progress');
      const progressFill = progressTrack && progressTrack.querySelector('span');
      if (progressTrack && progressFill) {
        let frame = 0;
        const updateProgress = () => {
          if (frame) return;
          frame = window.requestAnimationFrame(() => {
            frame = 0;
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const percent = maxScroll
              ? Math.min(100, Math.max(0, Math.round(window.scrollY / maxScroll * 100)))
              : 100;
            progressFill.style.width = percent + '%';
            progressTrack.setAttribute('aria-valuenow', String(percent));
          });
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        if ('ResizeObserver' in window) {
          const observer = new ResizeObserver(updateProgress);
          observer.observe(main);
          observer.observe(document.querySelector('.site-header'));
          main.studyProgressObserver = observer;
        }
        window.addEventListener('load', updateProgress, { once: true });
        updateProgress();
      }
    }
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
  setupFixedHeader(header);
  const panel = createStudyPanel(header, main);
  initializeStudyPanel(panel, main);
  initializeCopyButtons();
  initializeQuiz();
})();
