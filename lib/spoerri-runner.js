const spoerri = require('./spoerri');
const debug = require('debug')('spoerri-runner');

function run() {
  const nIntervalSec = 20 * 1000;
  debug('Setting up at interval %d', nIntervalSec);

  setInterval(spoerri.createTableImage, 20 * 1000);
}

module.exports = {
  run
};
