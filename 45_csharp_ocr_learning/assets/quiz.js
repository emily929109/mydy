document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.quiz').forEach((quiz) => {
    const checkBtn = quiz.querySelector('.quiz-check');
    const feedback = quiz.querySelector('.quiz-feedback');
    const correct = quiz.dataset.correct;
    if (!checkBtn || !feedback || !correct) return;

    checkBtn.addEventListener('click', () => {
      quiz.querySelectorAll('.quiz-option').forEach((opt) => {
        opt.classList.remove('correct', 'incorrect');
      });

      const selected = quiz.querySelector('input[type="radio"]:checked');
      if (!selected) {
        feedback.textContent = '先選一個答案再檢查。';
        feedback.className = 'quiz-feedback bad';
        return;
      }

      const selectedLabel = selected.closest('.quiz-option');
      if (selected.value === correct) {
        selectedLabel.classList.add('correct');
        feedback.textContent = '對了。';
        feedback.className = 'quiz-feedback ok';
      } else {
        selectedLabel.classList.add('incorrect');
        const correctInput = quiz.querySelector(`input[value="${correct}"]`);
        correctInput?.closest('.quiz-option')?.classList.add('correct');
        feedback.textContent = '不是這個，正確答案已標成綠色，回頭看一次上面的說明。';
        feedback.className = 'quiz-feedback bad';
      }
    });
  });
});
