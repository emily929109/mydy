// input變數
const inputs = document.querySelectorAll(".input-underlined input");
const inputsRequired = document.querySelectorAll(
  ".input-underlined.required input"
);
const inputID = document.querySelector(
  ".input-underlined.required:nth-of-type(2) input"
);
const inputmail = document.querySelector(
  ".input-underlined.required:nth-of-type(5) input"
);

// 訊息變數

// add filled class
inputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      input.classList.add("filled");
    } else {
      input.classList.remove("filled");
    }
  });
});

// 必填判斷
inputsRequired.forEach((input) => {
  const errorMsg = input.parentElement.querySelector(".error-message");

  input.addEventListener("blur", () => {
    if (!input.value.trim()) {
      errorMsg.style.display = "grid";
    } else {
      errorMsg.style.display = "none";
      console.log("hi");
    }
  });
});

// 身分證格式判斷
inputID.addEventListener("change", (e) => {
  const errorMsgID = document.querySelector(
    ".input-underlined.required:nth-of-type(2) .error-message.id"
  );
  const value = inputID.value.toUpperCase();

  if (
    taiwanIdValidator.isNationalIdentificationNumberValid(value) ||
    !value.trim()
  ) {
    errorMsgID.style.display = "none";
  } else {
    errorMsgID.style.display = "grid";
  }
});

// mail格式判斷
inputmail.addEventListener("change", (e) => {
  const errorMsgID = document.querySelector(
    ".input-underlined.required:nth-of-type(5) .error-message.mail"
  );

  if (isValidEmail(inputmail.value) || !inputmail.value.trim()) {
    errorMsgID.style.display = "none";
  } else {
    errorMsgID.style.display = "grid";
  }
});

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
