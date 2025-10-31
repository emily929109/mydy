const inputs = document.querySelectorAll(".input-underlined input");
const selects = document.querySelectorAll(".form-select"); //btn
const inputsRequired = document.querySelectorAll(".required input");
const inputID = document.querySelector(
  ".input-underlined.required:nth-of-type(2) input"
);
const inputmail = document.querySelector(
  ".input-underlined.required:nth-of-type(3) input"
);
const progressBar = document.querySelector(".progress-bar");

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
    ".input-underlined.required:nth-of-type(3) .error-message.mail"
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

// ----------------select 開始---------------------
document.addEventListener("DOMContentLoaded", initSelect);

// 初始化
function initSelect() {
  const selects = document.querySelectorAll(".form-select"); //btn

  selects.forEach((select) => {
    handleFilledClass(select);
    handleFocusClass(select);
    handlePlaceholderVisibility(select);
  });

  handleDropdownItemClick();
}

function handleFilledClass(select) {
  select.addEventListener("focus", () => {
    if (select.value.trim() !== "") {
      select.classList.add("filled");
    }
  });
}

function handleFocusClass(select) {
  const wrapper = select.closest(".select");

  wrapper.addEventListener("focusin", () => {
    wrapper.classList.add("focus");
  });

  wrapper.addEventListener("focusout", () => {
    wrapper.classList.remove("focus");
  });
}

function handlePlaceholderVisibility(select) {
  const wrapper = select.closest(".select");
  const selectPlaceholder = wrapper.querySelector(".dropdown-placeholder");

  const updateState = () => {
    const isFocused = document.activeElement === select;
    const isEmpty =
      select.textContent.trim() === "" || select.textContent === "\u00A0"; // &nbsp;

    if (isFocused && isEmpty) {
      selectPlaceholder.style.opacity = "1";
    } else {
      selectPlaceholder.style.opacity = "0";
    }
  };

  select.addEventListener("focus", updateState);
  select.addEventListener("blur", updateState);
}

function handleDropdownItemClick() {
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault(); // 避免跳轉

      const selectedText = this.textContent;
      const parent = this.closest(".select");
      const button = parent.querySelector("button");

      button.textContent = selectedText;
      button.classList.add("filled");
    });
  });
}

// ----------------select結束---------------------

// ----------------radio切換 開始---------------------
function handleRadioTab() {
  const radioBtns = document.querySelectorAll("input[type='radio']");
  const tabPanes = document.querySelectorAll(".tab-pane");

  radioBtns.forEach((radio) => {
    radio.addEventListener("change", () => {
      const selectedId = radio.id;

      tabPanes.forEach((pane) => {
        if (pane.id === selectedId) {
          pane.classList.add("active");
          requestAnimationFrame(() => {
            pane.classList.add("show");
          });
        } else {
          pane.classList.remove("active");
          requestAnimationFrame(() => {
            pane.classList.remove("show");
          });
        }
      });
    });
  });
}

// 初始只綁一次事件
// document.querySelectorAll("input[type='radio']").forEach((radio) => {
//   radio.addEventListener("change", handleRadioTab);
// });

handleRadioTab();
// ----------------radio切換 結束---------------------
