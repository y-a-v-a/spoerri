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
    const nRandomIndex = Math.round(Math.random() * (aItems.length - 1));
    let sUrl = fnSanitizeUrl(aItems[nRandomIndex].link);

    resolve(sUrl);
  }).catch((error) => {
    console.log(error)
  });
}

function fnGetSearchResult(sType, resolve, reject) {
  fs.readdir(sCacheDir, (error, aFiles) => {
    if (error) {
      reject(error);
    }

    const nRandomIndex = Math.round(Math.random() * (aFiles.length - 1));
    const sFileName = fnGetTypeMatchingFile(sType, aFiles)

    fs.readFile(`${sCacheDir}/${sFileName}`, (error, sData) => {
      if (error) {
        reject(error);
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

  do {
    let nRandomIndex = Math.round(Math.random() * (aFiles.length - 1));
    sFileName = aFiles[nRandomIndex];
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
