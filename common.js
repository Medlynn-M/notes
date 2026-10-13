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
