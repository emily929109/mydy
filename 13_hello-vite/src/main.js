import "./style.css";
import "flowbite";

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
      //   console.log(filteredData);

      // 把資料渲染在ul中
      $.each(filteredData, function (key, value) {
        $("#dropdown ul").append(
          '<li class="dropdown-item" data-value="' +
            key +
            '">' +
            filteredData[key].CityName +
            "</li>"
        );
      });

      //將選取值顯示在按鈕上
      $("#dropdown").on("click", ".dropdown-item", function () {
        let cityvalue = $(this).text(); //縣市
        let $parent = $(this).closest(".select");
        let $btn = $parent.find("button");
        let $btnTxt = $btn.find("span");

        $btnTxt.text(cityvalue);
        $btn.click();
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
