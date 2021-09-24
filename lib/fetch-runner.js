/**
 * The runner function kicks off a setInterval. It will grab a random
 * search keyword from a given set and dispatch it to the CSE module.
 * When JSON is returned, it will dispatch a store task.
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */
const cse = require('./cse');
const storeJson = require('./store-json');
const debug = require('debug')('spoerri:fetch-runner');

/**
 * request JSON from Google Custom Search Engine and pass it to store-json
 * @param {string} sKeyword Keyword to search for
 */
async function fetch(sKeyword) {
  const nStartIndex = Math.round(Math.random() * 10) + 1;

  try {
    const sSearchResult = await cse.queryCustomSearchEngine(
      sKeyword,
      nStartIndex
    );

    debug('About to store Google Custom Search results');
    await storeJson.store(sSearchResult);
  } catch (error) {
    debug('Goolge Custom Search store failure: %s', error.message);
  }
}

/**
 * Kick off a fetch every 24h
 * This runner is only responsible for the setInterval.
 * @param {objec} oKeywords Object containing n sets of lists of keywords
 */
function run(oKeywords) {
  const nIntervalSec = 24 * 60 * 60 * 1000;
  debug('Kick off runner');

  setInterval(async () => {
    const sRandomKey = getRandomObjectKey(oKeywords);
    const aKeywords = oKeywords[sRandomKey];
    const sKeyword = getRandomKeyword(aKeywords);

    debug(`Initiate CSE fetch for keyword: ${sKeyword}`);
    await fetch(sKeyword);
  }, nIntervalSec);
}

/**
 * Get random key from object. This is to randomly choose between
 * querying for a "plat" or "cloth" image @see keywords.json
 * @param {object} oSource
 * @returns {string} Random keyword from object
 */
function getRandomObjectKey(oSource) {
  const aObjectKeys = Object.keys(oSource);
  const nKey = getRandomIntWithin(aObjectKeys.length);
  const sKey = aObjectKeys[nKey];
  return sKey;
}

/**
 * Get random number between 0 and given nMax
 * @param {number} nMax Max number
 * @returns {number}
 */
function getRandomIntWithin(nMax) {
  const nKey = Math.round(Math.random() * (nMax - 1));
  return nKey;
}

/**
 * Get a random entry from a list
 * @param {string[]} aKeywords Array of potential search keywords
 * @returns {string} The randomly chosen keyword
 */
function getRandomKeyword(aKeywords) {
  const nIndex = getRandomIntWithin(aKeywords.length);
  return aKeywords[nIndex];
}

module.exports = {
  run,
};
