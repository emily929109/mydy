/**
 * ========================================
 * 題目 1: 反轉字串 2611023
 * ========================================
 * 需求: "hello" => "olleh"
 *
 * 【初始版本】
 * 問題: 轉換步驟冗長
 */
function solution(str) {
  const arr = Array.from(str);
  return arr.reverse().join("");
}

/**
 * 【優化版本】✨
 * 改善: 使用 split() 直接將字串轉成陣列，簡潔
 */
function solution(str) {
  return str.split("").reverse().join("");
}

/**
 * ========================================
 * 題目 2: 成績評級系統
 * ========================================
 * 需求: 計算三個分數的平均值，返回對應等級
 * 評級標準: A(90+) B(80+) C(70+) D(60+) F(<60)
 *
 * 【初始版本】
 * 問題: 條件判斷冗餘，上界判斷不必要
 */
function getGrade(s1, s2, s3) {
  const average = (s1 + s2 + s3) / 3;

  if (average >= 90 && average <= 100) return "A";
  if (average >= 80 && average < 90) return "B";
  if (average >= 70 && average < 80) return "C";
  if (average >= 60 && average < 70) return "D";
  if (average >= 0 && average < 60) return "F";
}

/**
 * 【優化版本】✨
 * 改善:
 *   1. 移除冗餘的上界判斷 (&&條件)
 *   2. 利用 if/else 的順序性，只需要檢查下界
 *   3. 最後直接 return "F" 作為默認值
 */
function getGrade(s1, s2, s3) {
  const average = (s1 + s2 + s3) / 3;

  if (average >= 90) return "A";
  if (average >= 80) return "B";
  if (average >= 70) return "C";
  if (average >= 60) return "D";
  return "F";
}

/**
 * ========================================
 * 題目 3: 陣列求和（去除最大值和最小值）
 * ========================================
 * 需求: 計算數組中除最大值和最小值外所有元素的總和
 *
 * 【初始版本】
 * 問題: 直譯式思考
 */
function sumArray(array) {
  // return 0
  if (!Array.isArray(array) || array.length <= 1) return 0;

  // 過濾掉第一個最大值
  const maxVal = Math.max(...array);
  const maxValIndex = array.indexOf(maxVal);
  const result1 = [
    ...array.slice(0, maxValIndex),
    ...array.slice(maxValIndex + 1),
  ];

  // 過濾掉第一個最小值
  const minVal = Math.min(...result1);
  const minValIndex = result1.indexOf(minVal);
  const result2 = [
    ...result1.slice(0, minValIndex),
    ...result1.slice(minValIndex + 1),
  ];

  return (sum = result2.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0));
}

/**
 * 【優化版本】✨
 * 改善:先改變資料形狀
 */
function sumArray(array) {
  if (array == null) {
    return 0;
  } else if (array.length < 2) {
    return 0;
  } else {
    array = array.sort(function (a, b) {
      return a - b;
    });
    var total = 0;
    for (var i = 1; i < array.length - 1; i++) {
      total += array[i];
    }
    return total;
  }
}

/**
 * 【優化版本】✨
 * 改善:最後只要總和而已，省去排序
 */
function sumArray(array) {
  if (!Array.isArray(array) || array.length < 2) return 0;

  const total = array.reduce((sum, n) => sum + n, 0);
  return total - Math.max(...array) - Math.min(...array);
}
