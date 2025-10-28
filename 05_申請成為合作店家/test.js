const validator = require("taiwan-id-validator");

const input = "A123456789";

if (validator.isIdCardNumber(input)) {
  console.log(input + " is a valid Taiwan ID Card Number.");
} else {
  console.log(input + " is not a valid Taiwan ID Card Number.");
}
