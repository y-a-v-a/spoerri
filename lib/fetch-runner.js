const cse = require('./cse');
const storeJson = require('./store-json');
const debug = require('debug')('spoerri:fetch-runner');

/**
 * request JSON from Google Custom Search Engine and pass it to store-json
 */
async function fetch(sRandomKey, sKeyword) {
  const nStartIndex = Math.round(Math.random() * 10) + 1;
  const sSearchResult = await cse.getSearchResults(sKeyword, nStartIndex);

  try {
    debug('About to store Google Custom Search results');
    await storeJson.store(sSearchResult);
  } catch (e) {
    debug('Goolge Custom Search store failure: %s', e.message);
  }
}

// Kick off a fetcher every ...
function run(oKeywords) {
  const nIntervalSec = 24 * 60 * 60 * 1000;
  debug('Kick off runner');

  (async () => {
    // setInterval(async () => {
    const sRandomKey = getRandomObjectKey(oKeywords);
    const aKeywords = oKeywords[sRandomKey];
    const sKeyword = getRandomKeyword(aKeywords);

    debug(`Initiate CSE fetch for keyword: ${sKeyword}`);
    await fetch(sRandomKey, sKeyword);
  })();
  // }, nIntervalSec);
}

function getRandomObjectKey(oSource) {
  const aObjectKeys = Object.keys(oSource);
  const nKey = getRandomArrayIndex(aObjectKeys);
  const sKey = aObjectKeys[nKey];
  return sKey;
}

function getRandomArrayIndex(aSource) {
  const nKey = Math.round(Math.random() * (aSource.length - 1));
  return nKey;
}

function getRandomKeyword(aKeywords) {
  const nIndex = getRandomArrayIndex(aKeywords);
  return aKeywords[nIndex];
}

module.exports = {
  run,
};
