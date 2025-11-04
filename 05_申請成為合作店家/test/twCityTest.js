$(document).ready(function () {
  //第一層選單
  $.ajax({
    url: "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json",
    type: "get",
    dataType: "json",
    success: function (data) {
      console.log(data);
      const filteredData = data.filter(
        (item) => item.CityName !== "釣魚臺" && item.CityEngName !== "Diaoyutai"
      );
      filteredData.forEach(data, function (key, value) {
        console.log(key, value);

        // $("#city").append(
        //   '<option value="' + key + '">' + data[key].CityName + "</option>"
        // );
        $("#city-select").append(
          '<li class="dropdown-item" data-value="' +
            key +
            '">' +
            data[key].CityName +
            "</li>"
        );
      });
    },
    error: function (data) {
      alert("fail");
    },
  });

  //第二層選單
  // 注意：綁在父層 #city-select 上，針對未來加入的 .dropdown-item
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

  // ✅ 可以做額外處理，例如顯示選取結果
  // $("#selected-city").text(cityName);
});

//   $("#city").change(function () {
//     cityvalue = $("#city").val(); //取值
//     $("#area").empty(); //清空上次的值
//     $("#area").css("display", "inline"); //顯現
//     $.ajax({
//       url: "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json",
//       type: "get",
//       dataType: "json",
//       success: function (data) {
//         eachval = data[cityvalue].AreaList; //鄉鎮

//         $.each(eachval, function (key, value) {
//           $("#area").append(
//             '<option value="' + key + '">' + eachval[key].AreaName + "</option>"
//           );
//         });
//       },
//       error: function () {
//         alert("fail");
//       },
//     });
//   });
// });
//選完後跳出選擇值
// $("#area").change(function () {
//   console.log("hi");
//   cityvalue = $("#city").val(); //縣市
//   areavalue = $("#area").val(); //鄉鎮
//   $.ajax({
//     url: "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json",
//     type: "get",
//     dataType: "json",
//     success: function (data) {
//       alert(
//         data[cityvalue].CityName +
//           "-" +
//           data[cityvalue].AreaList[areavalue].AreaName
//       );
//     },
//     error: function () {
//       alert("fail");
//     },
//   });
// });
// });

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
