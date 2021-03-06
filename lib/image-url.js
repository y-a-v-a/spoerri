const fs = require('fs');
const sCacheDir = './cache';

function retrieve(sType) {
  return new Promise(fnGetRandomUrl.bind(null, sType));
}

function fnGetRandomUrl(sType, resolve, reject) {
  new Promise(fnGetSearchResult.bind(null, sType))
  .then((oSearchResult) => {
    const aItems = oSearchResult.items;
    if (!aItems.length) {
      reject(new Error('Empty results'));
    }

    const rMime = /\.(jpg|png|gif|bmp)$/;
    let sUrl = '';
    do {
      const nRandomIndex = Math.round(Math.random() * (aItems.length - 1));
      sUrl = fnSanitizeUrl(aItems[nRandomIndex].link);
    } while (!rMime.test(sUrl));

    resolve(sUrl);
  }).catch((error) => {
    throw error;
  });
}

function fnGetSearchResult(sType, resolve, reject) {
  fs.readdir(sCacheDir, (error, aFiles) => {
    if (error) {
      reject(error);
    }

    const nRandomIndex = Math.round(Math.random() * (aFiles.length - 1));
    const sFileName = fnGetTypeMatchingFile(sType, aFiles);

    if (!sFileName) {
      return reject(new Error(`Could not retrieve JSON file for ${sType}`));
    }

    fs.readFile(`${sCacheDir}/${sFileName}`, (error, sData) => {
      if (error) {
        return reject(error);
      }

      const oResult = JSON.parse(sData);
      resolve(oResult);
    });
  });
}

function fnGetTypeMatchingFile(sType, aFiles) {
  const rType = new RegExp(`^${sType}`);
  let nRandomIndex = 0;
  let sFileName = '';
  const nLimit = 10;
  let nControl = 0;

  do {
    if (nControl >= nLimit) {
      return undefined;
    }
    let nRandomIndex = Math.round(Math.random() * (aFiles.length - 1));
    sFileName = aFiles[nRandomIndex];
    nControl++;
  } while(!rType.test(sFileName));

  return sFileName;
}

function fnSanitizeUrl(sUrl) {
  let sReturnUrl = sUrl;
  const rSanitizer = /(\.)(jpg|png|bmp|gif|jpeg)(.+)/;

  if (rSanitizer.test(sUrl)) {
    sReturnUrl = sUrl.replace(rSanitizer, function(match, p1, p2, p3) {
      return p1 + p2;
    });
  }
  return sReturnUrl;
}

module.exports = {
  retrieve
};
