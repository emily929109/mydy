flatpickr("#myDate");
flatpickr("#date");
// ----------------input-placeholder 開始---------------------
const inputsPlaceholder = document.querySelectorAll(".input-placeholder"); //input

inputsPlaceholder.forEach((input) => {
  handleInputPlaceholder(input);
});

function handleInputPlaceholder(input) {
  const updateState = () => {
    const isFocused = document.activeElement === input;
    const isEmpty = input.value.trim() === "" || input.value === "\u00A0"; // &nbsp;

    if (isFocused && isEmpty) {
      input.setAttribute("placeholder", input.dataset.placeholder);
    } else {
      input.setAttribute("placeholder", "");
    }
  };

  input.addEventListener("focus", updateState);
  input.addEventListener("blur", updateState);
}

// ----------------input-placeholder 結束---------------------
// ----------------檢查input狀態 控制label 開始---------------------
const inputs = document.querySelectorAll(".input-underlined input");

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      input.classList.add("filled");
    } else {
      input.classList.remove("filled");
    }
  });
});
// ----------------檢查input狀態 控制label 結束---------------------
