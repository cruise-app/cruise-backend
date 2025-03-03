const randomString = require("randomstring");
function generateOTP() {
  return randomString.generate({
    length: 4,
    charset: "numeric",
  });
}

module.exports = generateOTP;
