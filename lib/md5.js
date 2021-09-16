const crypto = require('crypto');

/**
 * Create md5 hash of given input
 * @param {string} data String to get md5 hash of
 * @returns {string}
 */
module.exports.md5 = function md5(data) {
  return crypto.createHash('md5').update(data).digest('hex');
};
