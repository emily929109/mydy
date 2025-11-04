const exampleModal = document.querySelector("#exampleModal.modal .modal-body");
const toAgree = document.querySelector(".form-check-input#defaultcheckbox1");
const pdfBtn = document.querySelector(".PDF");
const inputRead = document.querySelector("#read");
const icon = document.querySelector(".far.fa-check-circle");

// 滑到底才可打勾
exampleModal.addEventListener("scroll", () => {
  checkScrollToBottom(exampleModal);
});

// checkbox 被點選時，也檢查是否 modal 已滑到底
inputRead.addEventListener("change", () => {
  checkScrollToBottom(exampleModal);
});

function isRead(element) {
  return (
    Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) <=
    1
  );
}

function checkScrollToBottom(element) {
  console.log(inputRead.checked);
  if (isRead(element) && inputRead.checked) {
    console.log(inputRead.checked);
    toAgree.disabled = false;
  }
}

// function checkScrollToBottom(element) {
//   if (isRead(element) && inputRead.checked) {
//     toAgree.disabled = false;
//   }
// }

// 裡面打勾後外面顯示icon

inputRead.addEventListener("change", () => {
  if (inputRead.checked) {
    icon.style.display = "block";
  } else {
    icon.style.display = "none";
  }
});
