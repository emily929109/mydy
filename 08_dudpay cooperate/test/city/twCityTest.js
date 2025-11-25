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

      // 把資料渲染在ul中
      $.each(filteredData, function (key, value) {
        $("#city-select").append(
          '<li class="dropdown-item" data-value="' +
            key +
            '">' +
            filteredData[key].CityName +
            "</li>"
        );
      });

      //將選取值顯示在按鈕上
      $("#city-select").on("click", ".dropdown-item", function () {
        let cityvalue = $(this).text(); //縣市
        let $parent = $(this).closest(".select");
        let $btn = $parent.find(".form-select");

        $btn.text(cityvalue);
        $btn.addClass("filled");
      });
    },
    error: function (data) {
      alert("fail");
    },
  });

  // 第二層選單
  // 綁在父層 #city-select 上，針對未來加入的 .dropdown-item
  $("#city-select").on("click", ".dropdown-item", function () {
    const cityvalue = $(this).data("value");
    $("#area-select").empty(); //清空上次的值
    $.ajax({
      url: "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json",
      type: "get",
      dataType: "json",
      success: function (data) {
        const filteredData = data.filter(function (item) {
          return item.CityName !== "釣魚臺" && item.CityName !== "南海島";
        });

        const filteredArea = filteredData[cityvalue].AreaList; //鄉鎮

        // 把資料渲染在ul中
        $.each(filteredArea, function (key, value) {
          $("#area-select").append(
            '<li class="dropdown-item" data-value="' +
              key +
              '">' +
              filteredArea[key].AreaName +
              "</li>"
          );
        });

        //將選取值顯示在按鈕上
        $("#area-select").on("click", ".dropdown-item", function () {
          let areavalue = $(this).text();
          let $parent = $(this).closest(".select");
          let $btn = $parent.find(".form-select");

          $btn.text(areavalue);
          $btn.addClass("filled");
        });
      },
      error: function () {
        alert("fail");
      },
    });
  });
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
    btn.classList.add("filled");
    // parent.classList.add("filled");

    //click後依然沒選
    if (btn.innerText.trim() == "") {
      btn.classList.remove("filled");
    }
  });
}

function handleFocusClass(select) {
  const wrapper = select.closest(".select");
  const btn = wrapper.querySelector("button");

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
