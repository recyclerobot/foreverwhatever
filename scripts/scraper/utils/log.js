const util = require("util");

function log(obj) {
  console.log(util.inspect(obj, false, null, true));
}

module.exports = {
  log: log
};
