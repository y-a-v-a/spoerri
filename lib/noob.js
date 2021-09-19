const gd = require('node-gd');
const debug = require('debug')('spoerri:noob');

/**
 * Return fallback image
 * @returns {gd.Image} Image of 1 x 1 pixel
 */
function getNoob() {
  debug('Noob image requested');
  const noob = gd.createTrueColorSync(1, 1);
  const color = gd.trueColor(255, 255, 255);
  noob.rectangle(0, 0, 1, 1, color);
  return noob;
}

let fallback;

async function getFallback() {
  debug('Fallback image requested');
  if (fallback) {
    return fallback;
  }
  fallback = await gd.openJpeg('../public/fallback.jpg');
  return fallback;
}

module.exports = {
  getNoob,
  getFallback,
};
