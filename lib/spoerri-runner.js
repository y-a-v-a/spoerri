const spoerri = require('./spoerri');
const debug = require('debug')('spoerri:runner');

/**
 * Spoerri running initiates the creation of a new Spoerri inspired
 * table image with empty plates
 */
function run() {
  const nIntervalSec = 24 * 60 * 60 * 1000;
  debug('Setting up at interval %d', nIntervalSec);

  setInterval(async () => {
    try {
      await spoerri.createTableImage();
    } catch (e) {
      debug(`Unable to create table image: ${e.message}`);
    }
  }, nIntervalSec);
}

module.exports = {
  run,
};
