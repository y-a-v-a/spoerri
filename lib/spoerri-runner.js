const spoerri = require('./spoerri');

function run() {
  setInterval(spoerri.createTable, 20 * 1000);
}

module.exports = {
  run
};
