const cse = require('./cse');
const storeJson = require('./store-json');
const debug = require('debug')('fetch-runner');

// request JSON from Google Custom Search Engine and pass it to store-json
function fetch(sRandomKey, sKeyword) {
  const nStartIndex = Math.round(Math.random() * 10) + 1;
  const pCseResult = cse.getSearchResults(sKeyword, nStartIndex)

  pCseResult.then((sSearchResult) => {
    storeJson.store(sRandomKey, sKeyword, sSearchResult);
  })
  .catch((error) => {
    debug('Store request failure: %s', error);
  });
}

// Kick off a fetcher every 20s
function run(oKeywords) {
  const nIntervalSec = 20 * 1000;
  debug('Kick off runner');

  setInterval(() => {
    const sRandomKey = getRandomObjectKey(oKeywords);
    const aKeywords = oKeywords[sRandomKey];
    const sKeyword = getRandomKeyword(aKeywords);

    fetch(sRandomKey, sKeyword);
  }, nIntervalSec);
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
  run
};
