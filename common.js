document.querySelectorAll('.copy-code').forEach(button => {
  button.setAttribute('aria-live', 'polite');
  button.addEventListener('click', async () => {
    const code = button.closest('.notes-code').querySelector('code');
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(code.textContent);
      else {
        const field = document.createElement('textarea');
        field.value = code.textContent; field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.appendChild(field); field.select();
        const ok = document.execCommand('copy'); field.remove(); button.focus();
        if (!ok) throw new Error('Copy unavailable');
      }
      button.textContent = 'Copied!';
    } catch (_) {
      button.textContent = 'Select to copy';
      const range = document.createRange(); range.selectNodeContents(code);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    }
    setTimeout(() => { button.textContent = 'Copy'; }, 2000);
  });
});

const quiz = document.getElementById('knowledge-check');
if (quiz) {
  const questions = [...quiz.querySelectorAll('.quiz-question')];
  const responses = new Map();
  function updateScore() {
    const score = [...responses.values()].filter(Boolean).length;
    document.getElementById('quiz-progress').textContent = `${responses.size} of ${questions.length} answered · Score: ${score} / ${questions.length}`;
    document.getElementById('quiz-meter').value = responses.size;
    document.getElementById('quiz-summary').textContent = responses.size === questions.length
      ? (score === questions.length ? '🎉 All correct! You’ve understood the key ideas.' : `You scored ${score} / ${questions.length}. Review the explanations, then reset to try again.`)
      : '';
  }
  questions.forEach((question, index) => {
    const options = [...question.querySelectorAll('.quiz-option')];
    options.forEach(button => button.addEventListener('click', () => {
      if (responses.has(index)) return;
      const answer = Number(question.dataset.answer);
      const choice = Number(button.dataset.choice);
      const correct = answer === choice;
      responses.set(index, correct);
      options.forEach((option, i) => {
        option.disabled = true;
        if (i === answer) {
          option.classList.add('correct');
          option.querySelector('.option-result').textContent = '✓ Correct answer';
        } else if (i === choice) {
          option.classList.add('incorrect');
          option.querySelector('.option-result').textContent = '✕ Your answer';
        }
      });
      const feedback = question.querySelector('.quiz-feedback');
      feedback.classList.add(correct ? 'good' : 'bad');
      feedback.textContent = (correct ? '✓ Correct. ' : '✕ Incorrect. The correct answer is highlighted above. ') + feedback.dataset.explanation;
      updateScore();
    }));
  });
  document.getElementById('reset-quiz').addEventListener('click', () => {
    responses.clear();
    questions.forEach(question => {
      question.querySelectorAll('.quiz-option').forEach(option => {
        option.disabled = false; option.classList.remove('correct', 'incorrect');
        option.querySelector('.option-result').textContent = '';
      });
      const feedback = question.querySelector('.quiz-feedback');
      feedback.textContent = ''; feedback.classList.remove('good', 'bad');
    });
    updateScore();
  });
}


/* Shared search, section navigation, and reading progress for topic pages. */
(() => {
  const body = document.body;
  const main = document.querySelector('#main-content');
  if (!body || !main || body.classList.contains('study-hub') || window.location.pathname.endsWith('/index.html') || window.location.pathname === '/') return;

  body.classList.add('study-page');
  let panel = document.querySelector('.da-learning-bar');
  if (panel) {
    panel.classList.add('study-panel');
    
  } else {
    panel = document.createElement('section');
    panel.className = 'study-panel';
    panel.setAttribute('aria-label', 'Notes study controls');
    panel.innerHTML = `
      <div class="study-top">
        <div><div class="study-kicker">NOTES · STUDY MODE</div><div class="study-title">Navigate the course notes</div></div>
        <div class="study-controls">
          <input class="study-search" type="search" placeholder="Search notes…" aria-label="Search note content">
          <select class="study-jump" aria-label="Jump to a section"><option value="">Jump to a module…</option></select>
        </div>
      </div>
      <div class="study-progress"><span class="study-progress-label">Reading progress · 0%</span><div class="study-progress-track" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="study-progress-fill"></div></div></div>
      <div class="study-status" aria-live="polite">Search highlights matching sections. Clear the search to return to the full page.</div>`;
    const header = document.querySelector('.site-header');
    if (header) header.insertAdjacentElement('afterend', panel);
    else main.insertAdjacentElement('beforebegin', panel);
  }

  const search = panel.querySelector('.study-search, #da-search');
  const jump = panel.querySelector('.study-jump, #da-jump');
  const status = panel.querySelector('.study-status, #da-search-status');
  const progressLabel = panel.querySelector('.study-progress-label, #da-progress-label');
  const progressFill = panel.querySelector('.study-progress-fill, #da-progress-fill');
  const progressTrack = panel.querySelector('.study-progress-track, .da-progress-track');
  if (!search || !jump || !progressLabel || !progressFill || !progressTrack) return;

  const headings = [...main.querySelectorAll('h3')].filter(h => h.textContent.trim() && !h.closest('.quiz'));
  jump.innerHTML = '<option value="">Jump to a module…</option>';
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = 'study-section-' + (index + 1);
    const option = document.createElement('option');
    option.value = heading.id;
    option.textContent = heading.textContent.replace(/¶/g, '').trim();
    jump.appendChild(option);
  });
  jump.addEventListener('change', () => {
    const target = document.getElementById(jump.value);
    if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
  });

  const contentBlocks = [...main.querySelectorAll('.jp-Cell, main > section')];
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    let matches = 0;
    contentBlocks.forEach(block => {
      block.classList.remove('study-search-hit', 'study-search-muted', 'da-search-hit', 'da-search-muted');
      if (!query) return;
      const hit = block.textContent.toLocaleLowerCase().includes(query);
      block.classList.add(hit ? 'study-search-hit' : 'study-search-muted');
      if (hit) matches++;
    });
    if (status) status.textContent = query ? (matches ? matches + ' matching section(s) highlighted. Use the selector to jump.' : 'No matching content found. Try another term.') : 'Search highlights matching sections. Clear the search to return to the full page.';
  });

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? Math.min(100, Math.max(0, Math.round(window.scrollY / max * 100))) : 100;
    progressFill.style.width = percent + '%';
    progressLabel.textContent = 'Reading progress · ' + percent + '%';
    progressTrack.setAttribute('aria-valuenow', String(percent));
  };
  window.addEventListener('scroll', updateProgress, {passive: true});
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
