$(document).ready(function () {
  $.ajax({
    url: "https://raw.githubusercontent.com/wsmwason/taiwan-bank-code/refs/heads/master/data/taiwanBankCodeATM.json",
    type: "get",
    dataType: "json",
    success: function (data) {
      //   console.log(data);
      $.each(data, function (key, value) {
        // console.log(value.code, value.name);
        $("#bank-select").append(
          '<li class="dropdown-item" tabindex="0" data-value="' +
            key +
            '">' +
            value.code +
            " " +
            value.name +
            "</li>"
        );
      });
    },
    error: function (data) {
      alert("fail");
    },
  });
});

//選完後跳出選擇值
$("#bank-select").click(function () {
  if (event.target.nodeName == "LI") {
    let bankvalue = $(event.target).text();
    let $parent = $(event.target).closest(".select");
    let $btn = $parent.find(".form-select");

    $("#form-select-bank").text(bankvalue);
    $btn.addClass("filled");
  }
});

// ----------------select 開始---------------------
document.addEventListener("DOMContentLoaded", initSelect);

// 初始化
function initSelect() {
  const selects = document.querySelectorAll(".form-select"); //btn

  selects.forEach((select) => {
    setTimeout(() => handleFilledClass(select), 1000);
    handleFocusClass(select);
    handlePlaceholderVisibility(select);
  });

  handleDropdownItemClick();
}

function handleFilledClass(select) {
  const parent = select.closest(".select");
  const li = parent.querySelectorAll("li");

  li.forEach((li) => {
    li.addEventListener("focusin", () => {
      parent.classList.add("filled");
    });
    li.addEventListener("focusout", () => {
      if (select.innerText.trim() == "") {
        separentlect.classList.remove("filled");
      }
    });
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
