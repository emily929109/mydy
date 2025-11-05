$(document).ready(function () {
  // 第一層選單
  $.ajax({
    url: "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json",
    type: "get",
    dataType: "json",
    success: function (data) {
      const filteredData = data.filter(function (item) {
        return item.CityName !== "釣魚臺" && item.CityName !== "南海島";
      });
      $.each(filteredData, function (key, value) {
        $("#city-select").append(
          '<li class="dropdown-item" data-value="' +
            key +
            '">' +
            filteredData[key].CityName +
            "</li>"
        );
      });
    },
    error: function (data) {
      alert("fail");
    },
  });

  // 第二層選單
  // 綁在父層 #city-select 上，針對未來加入的 .dropdown-item
  $("#city-select").on("click", ".dropdown-item", function () {
    const cityvalue = $(this).data("value"); // 取得 data-value
    // const cityvalue = $(this).text(); // 縣市
    // console.log(cityvalue);
    $("#area-select").empty(); //清空上次的值
    $.ajax({
      url: "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json",
      type: "get",
      dataType: "json",
      success: function (data) {
        eachval = data[cityvalue].AreaList; //鄉鎮

        $.each(eachval, function (key, value) {
          $("#area-select").append(
            '<li class="dropdown-item" data-value="' +
              key +
              '">' +
              eachval[key].AreaName +
              "</li>"
          );
        });
      },
      error: function () {
        alert("fail");
      },
    });
  });
});

//選完後跳出選擇值(市)
$("#city-select").click(function () {
  if (event.target.nodeName == "LI") {
    let cityvalue = $(event.target).text(); //縣市
    let $parent = $(event.target).closest(".select");
    let $btn = $parent.find(".form-select");

    $("#form-select-city").text(cityvalue);
    $btn.addClass("filled");
  }
});

$("#area-select").click(function () {
  if (event.target.nodeName == "LI") {
    let areavalue = $(event.target).text();
    let $parent = $(event.target).closest(".select");
    let $btn = $parent.find(".form-select");

    $("#form-select-area").text(areavalue);
    $btn.addClass("filled");
  }
});

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
  const parent = select.closest(".select");
  const btn = parent.querySelector("button");

  if (btn.innerText.trim() == "") {
    select.classList.remove("filled");
  }

  parent.addEventListener("click", () => {
    console.log("click");
    // console.log(btn);
    btn.classList.add("filled");
    parent.classList.add("filled");

    //click後依然沒選
    if (btn.innerText.trim() == "") {
      btn.classList.remove("filled");
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
