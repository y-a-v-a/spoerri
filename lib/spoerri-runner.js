const spoerri = require('./spoerri');
const debug = require('debug')('spoerri-runner');

function run() {
  const nIntervalSec = 60 * 60 * 1000;
  debug('Setting up at interval %d', nIntervalSec);

  setInterval(spoerri.createTableImage, nIntervalSec);
}

module.exports = {
  run
};
