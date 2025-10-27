const inputRequired = document.querySelector(
  ".input-underlined.required input"
);
const errorMsg = document.querySelector(".error-message");
console.log(inputRequired);
inputRequired.addEventListener("blur", () => {
  if (!inputRequired.value.trim()) {
    errorMsg.style.display = "block";
  } else {
    errorMsg.style.display = "none";
  }
});
