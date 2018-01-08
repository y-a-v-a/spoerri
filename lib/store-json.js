const fs = require('fs');
const crypto = require('crypto');
const sCacheDir = './cache';

function store(sContext, sIdentifier, sSource) {
  const sSantizedIdentifier = fnSanitizeIdentifier(sIdentifier);
  const oHash = crypto.createHash('md5');
  oHash.update(sSource);
  const sResultHash = oHash.digest('hex');

  const sNewFilePath = `${sCacheDir}/${sContext}-${sSantizedIdentifier}-${Date.now()}-${sResultHash}.json`;

  fs.writeFile(sNewFilePath, sSource, (error) => {
    if (error) {
      throw error;
    }
  });
}

function fnSanitizeIdentifier(sSource) {
  return sSource.replace(/ /g, '-');
}

module.exports = {
  store
};
