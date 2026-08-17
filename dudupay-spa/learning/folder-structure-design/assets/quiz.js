// 共用測驗元件。用法：
// <div class="quiz-question" data-question-id="q1">
//   <p class="quiz-prompt">...</p>
//   <div class="quiz-options">
//     <label><input type="radio" name="q1" value="a"> 選項文字</label>
//     <label data-correct="true" data-explain="說明文字"><input type="radio" name="q1" value="b"> 選項文字</label>
//   </div>
//   <button class="quiz-check" type="button">檢查答案</button>
//   <p class="quiz-feedback empty" hidden></p>
// </div>
(function () {
  function checkQuestion(question) {
    const feedback = question.querySelector(".quiz-feedback");
    const checked = question.querySelector("input[type=radio]:checked");
    feedback.hidden = false;
    feedback.classList.remove("correct", "incorrect", "empty");

    if (!checked) {
      feedback.textContent = "先選一個答案再檢查。";
      feedback.classList.add("empty");
      return;
    }

    const label = checked.closest("label");
    const isCorrect = label.dataset.correct === "true";

    if (isCorrect) {
      feedback.textContent = "✓ 對了。" + (label.dataset.explain || "");
      feedback.classList.add("correct");
    } else {
      const correctLabel = question.querySelector('label[data-correct="true"]');
      const hint = correctLabel ? correctLabel.dataset.explain || "" : "";
      feedback.textContent = "✗ 再想想。" + hint;
      feedback.classList.add("incorrect");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quiz-question").forEach(function (question) {
      const button = question.querySelector(".quiz-check");
      if (button) {
        button.addEventListener("click", function () {
          checkQuestion(question);
        });
      }
    });
  });
})();
