const spoerri = require('./spoerri');

function run() {
  setInterval(spoerri.createTableImage, 20 * 1000);
}

module.exports = {
  run
};
