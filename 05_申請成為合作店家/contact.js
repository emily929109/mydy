const inputs = document.querySelectorAll(".input-underlined input");
const selects = document.querySelectorAll(".form-select"); //btn
const inputsRequired = document.querySelectorAll(
  ".input-underlined.required input"
);
const inputID = document.querySelector(
  ".input-underlined.required:nth-of-type(2) input"
);
const inputmail = document.querySelector(
  ".input-underlined.required:nth-of-type(5) input"
);

// add filled class to all inputs
inputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      input.classList.add("filled");
    } else {
      input.classList.remove("filled");
    }
  });
});

// add filled class to all selects
selects.forEach((select) => {
  select.addEventListener("change", () => {
    if (select.value.trim() !== "") {
      select.classList.add("filled");
    } else {
      select.classList.remove("filled");
    }
  });
});

// select focus且值為空時出現"請選擇"
selects.forEach((select) => {
  const wrapper = select.closest(".select");

  const updateState = () => {
    const isEmpty = select.innerHTML.trim() === "&nbsp;";
    wrapper.classList.toggle("empty", isEmpty);
  };

  select.addEventListener("focus", () => {
    wrapper.classList.add("focus");
    updateState();
  });

  select.addEventListener("blur", () => {
    wrapper.classList.remove("focus");
  });

  select.addEventListener("change", updateState);

  // 初始化時也檢查一次
  updateState();
});

// select後btn加入選擇文字
document.querySelectorAll(".dropdown-item").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault(); // 避免跳轉頁面

    const selectedText = this.textContent; // 取得被點擊的文字
    const parent = this.closest(".select"); // 找到對應的 select 包裝器
    const button = parent.querySelector("button"); // 找到按鈕
    button.classList.add("filled");
    parent.classList.remove("empty");

    button.textContent = selectedText; // 替換原本的 "請選擇"
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
