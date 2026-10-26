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

/**
 * ========================================
 * 題目 4: 陣列求平均
 * ========================================
 *
 * 【初始版本】
 * 問題:
 * 1. 判斷哪些邊界在這個情境下真的會發生 題目有說一定是傳入陣列
 * 2. 自己發明了isNumber 但不一定是對的 例如直接throw new TypeError、字串轉數字、filter掉非數字、或是直接回傳NaN
 */
function findAverage(array) {
  if (!Array.isArray(array)) return;
  // 確保array傳進來的都是數字 不是其他型別
  if (!array.every(isNumber)) return;
  if (array.length === 0) return 0;

  const average = array.reduce((sum, n) => sum + n, 0) / array.length;
  return average;
}

const isNumber = (no) => typeof no === "number";

/**
 * 【優化版本】✨
 */
const findAverage = (array) =>
  array.length === 0 ? 0 : array.reduce((sum, n) => sum + n, 0) / array.length;

/**
 * ========================================
 * 題目 5: 陣列元素乘以2
 * ========================================
 *
 * 【初始版本】
 * 問題: 可讀性差
 */

const maps = (array) => array.map((arr) => arr * 2);
function maps(x) {
  return x.map((n) => n * 2);
}

/**
 * 【優化版本】✨函式名用動詞描述它做什麼，參數名描述它是什麼
 */
const doubleAll = (numbers) => numbers.map((n) => n * 2);

/**
 * ========================================
 * 題目 6: 計算BMI
 * ========================================
 * 優點: 可讀性佳 每個 if 直接 return、最後兜底 early return（提早回傳）
 */
function bmi(weight, height) {
  const bmi = weight / height ** 2;
  if (bmi > 30) return "Obese";
  if (bmi > 25.0) return "Overweight";
  if (bmi > 18.5) return "Normal";
  return "Underweight";
}

/**
 * ========================================
 * 題目 7: 檢查元素是否存在
 * ========================================
 */
function check(array, value) {
  return array.includes(value);
}

const check = (a, x) => a.includes(x);

/**
 * ========================================
 * 題目 8: 計算陣列所有元素的乘積
 * ========================================
 */
function grow(array) {
  let result = 1;

  array.forEach((number) => {
    result = result * number;
  });
  return result;
}

const grow = (x) => x.reduce((a, b) => a * b);

/**
 * ========================================
 * 題目 9: 簡單的乘法
 * ========================================
 */
function simpleMultiplication(number) {
  if (number % 2 === 0) return number * 9;
  return number * 8;
}

function simpleMultiplication(n) {
  return n * (n % 2 ? 9 : 8);
}

/**
 * ========================================
 * 題目 10: 基本運算
 * ========================================
 * 缺點：直接用return退出函式即可 不需要存變數
 */
function basicOp(operation, value1, value2) {
  let result;
  switch (operation) {
    case "+":
      result = value1 + value2;
      break;
    case "-":
      result = value1 - value2;
      break;
    case "*":
      result = value1 * value2;
      break;
    case "/":
      result = value1 / value2;
      break;
    default:
      return 0;
  }
  return result;
}

function basicOp(operation, value1, value2) {
  switch (operation) {
    case "+":
      return value1 + value2;
    case "-":
      return value1 - value2;
    case "*":
      return value1 * value2;
    case "/":
      return value1 / value2;
    default:
      return 0;
  }
}

/**
 * ========================================
 * 題目 11: 數羊
 * ========================================
 * 缺點：可讀性差，沒有使用模板字串
 */
var countSheep = function (num) {
  let result = ""; // 空字串

  for (i = 1; i <= num; i++) {
    result += i + " sheep...";
  }
  return result;
};

var countSheep = function (num) {
  let str = "";
  for (let i = 1; i <= num; i++) {
    str += `${i} sheep...`;
  }
  return str;
};

/**
 * ========================================
 * 題目 12: 計算季度
 * ========================================
 */
const quarterOf = (month) => {
  if (month < 1 || month > 12) return;

  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
};

const quarterOf = (m) => Math.ceil(m / 3);

/**
 * ========================================
 * 題目 13: 降冪排列
 * ========================================
 * 缺點：數字轉字串→字串陣列→數字陣列(map)→排序(sort)→字串陣列→數字(Number)
 * sort不需要寫callback 也不需要轉數字陣列
 */
function descendingOrder(number) {
  // 數字轉字串陣列 再轉數字陣列
  let arr = String(number).split("").map(Number);

  return Number(arr.sort((a, b) => b - a).join(""));
}

// 數字轉字串→字串陣列→排序(sort)→反轉→字串→數字
// sort不需要傳callback 直接依照字串的Unicode碼排序即可
// 字串轉數字可以用parseInt()或Number()
function descendingOrder(n) {
  return parseInt(String(n).split("").sort().reverse().join(""));
}

/**
 * ========================================
 * 題目 14: 姓名縮寫
 * ========================================
 * 缺點：不用正規表達式，直接用空白分割字串即可
 */
function abbrevName(name) {
  let array = name.split(/\s+/); // 以空白分割字串 ["Emily", "Lin"]
  const result = array[0][0] + "." + array[1][0];
  return result.toUpperCase();
}

function abbrevName(name) {
  let nameArray = name.split(" ");
  return (nameArray[0][0] + "." + nameArray[1][0]).toUpperCase();
}

/**
 * ========================================
 * 題目 15: 反轉字串中的每個單字
 * ========================================
 * 缺點：
 */
function reverseWords(str) {
  let strArray = str.split(" "); // ["double","spaces"]
  let result = [];

  // 因arr.reverse()是反轉整個字串 現在要反轉每個單字 並保留空白
  for (i = 0; i < strArray.length; i++) {
    result.push(strArray[i].split("").reverse().join(""));
  }
  return result.join(" ");
}

function reverseWords(str) {
  return str
    .split(" ") // ["hello", "world"]
    .map((word) => word.split("").reverse().join("")) // 新陣列 ["olleh", "dlrow"]
    .join(" ");
}

/**
 * ========================================
 * 題目 16: 移除字串母音
 * ========================================
 * 缺點：可以把單詞拆成字母、把參數一率轉成小寫
 */
function disemvowel(str) {
  let vowel = ["a", "e", "i", "o", "u"];

  // input  ["this","is","an","apple"]
  // output ["ths","s","n","pple"]
  const resultNewArray = str.split(" ").map((word) => {
    // 保留「不存在於vowel陣列中」的元素
    return word
      .split("") // ["t","h","i","s"]
      .filter(
        (letter) =>
          !vowel.includes(letter) &&
          !vowel.map((letter) => letter.toUpperCase()).includes(letter),
      ) // ["t","h","s"]
      .join(""); // ["ths"]
  });

  return resultNewArray.join(" ");
}

const vowels = "aeiou";

function disemvowel(str) {
  return str
    .split("") // ["t","h","i","s"," ","i","s"," ","a","n"," ","a","p","p","l","e"]
    .filter((letter) => !vowels.includes(letter.toLowerCase()))
    .join("");
}

// 正規表達式
function disemvowel(str) {
  return str.replace(/[aeiou]/gi, "");
}

/**
 * ========================================
 * 題目 17: 解構方程式 + array.map
 * ========================================
 * 缺點：閱讀性差
 */
function openOrSenior(data) {
  // 大陣列化成小陣列
  return data.map((pairs) => {
    if (pairs[0] >= 55 && pairs[1] > 7) return "Senior";
    return "Open";
  });
}

// 解構賦值，閱讀性優
function openOrSenior(data) {
  return data.map(([age, handicap]) =>
    age > 54 && handicap > 7 ? "Senior" : "Open",
  );
}

/**
 * ========================================
 * 題目 18: 解構方程式 + array.map
 * ========================================
 */
function highAndLow(numbers) {
  // 字串陣列轉數字陣列
  const numberArray = numbers
    .split(" ") // ["1","2","3"]
    .map((str) => parseInt(str)); // [1,2,3]

  // 取最大值 最小值
  return `${Math.max(...numberArray)} ${Math.min(...numberArray)}`;
}

// Math.max可接受字串陣列，會自動轉成數字
// 直接修改原參數
function highAndLow(numbers) {
  numbers = numbers.split(" ");
  return `${Math.max(...numbers)} ${Math.min(...numbers)}`;
}
