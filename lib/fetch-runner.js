const cse = require('./cse');
const storeJson = require('./store-json');

function fetch(sRandomKey, sKeyword) {
  const nStartIndex = Math.round(Math.random() * 10) + 1;
  const pCseResult = cse.getSearchResults(sKeyword, nStartIndex)

  pCseResult.then((sSearchResult) => {
    storeJson.store(sRandomKey, sKeyword, sSearchResult);
  })
  .catch((error) => {
    console.log(error);
  });
}

function run(oKeywords) {
  setInterval(() => {
    const sRandomKey = getRandomObjectKey(oKeywords);
    const aKeywords = oKeywords[sRandomKey];
    const sKeyword = getRandomKeyword(aKeywords);

    fetch(sRandomKey, sKeyword);
  }, 20 * 1000);
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
